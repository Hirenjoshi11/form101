import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import SubmissionResponse, SubmissionStatusUpdate
from formseva_app.core.database import db
from formseva_app.core.security import require_role
from formseva_app.api.submissions import _format_submission_response

router = APIRouter(prefix="/operator", tags=["Operator Workbench"])

@router.get("/queue", response_model=List[SubmissionResponse], dependencies=[Depends(require_role(["operator", "admin"]))])
def get_operator_queue(current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Returns submissions in the operator queue:
    If operator, returns their assigned submissions and unassigned ones.
    If admin, returns all submissions.
    """
    operator_id = current_user["id"]
    is_admin = current_user.get("role") == "admin"
    
    subs = list(db.submissions.values())
    if not is_admin:
        subs = [s for s in subs if s.get("assigned_operator_id") == operator_id or s.get("assigned_operator_id") is None]
    
    subs.sort(key=lambda s: s["submitted_at"], reverse=True)
    return [_format_submission_response(s) for s in subs]

@router.post("/submissions/{submission_id}/start", dependencies=[Depends(require_role(["operator", "admin"]))])
def start_filing_submission(submission_id: str, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Operator begins filing on the Gujarat government portal.
    Triggers the required in-app notification to the citizen naming the operator.
    """
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    operator = db.operators.get(current_user["id"])
    operator_name = operator.get("full_name", current_user.get("full_name", "ઓપરેટર"))
    
    # Update status
    sub["assigned_operator_id"] = current_user["id"]
    sub["status"] = "operator_filling"
    sub["operator_started_at"] = datetime.now(timezone.utc)
    sub["updated_at"] = datetime.now(timezone.utc)
    
    # Trigger in-app notification to citizen
    notif_id = str(uuid.uuid4())
    db.notifications[notif_id] = {
        "id": notif_id,
        "user_id": sub["user_id"],
        "submission_id": sub["id"],
        "title_gu": f"ઓપરેટર {operator_name} કામગીરી કરી રહ્યા છે",
        "title_hi": f"ऑपरेटर {operator_name} आपका फॉर्म भर रहे हैं",
        "title_en": f"Operator {operator_name} is processing your application",
        "message_gu": f"ઓપરેટર {operator_name} દ્વારા પોર્ટલ પર તમારું ફોર્મ ભરવાનું શરૂ થયું છે. સરકારી પોર્ટલ તરફથી SMS દ્વારા OTP આવે ત્યારે એપ્લિકેશનમાં દાખલ કરવા તૈયાર રહેશો.",
        "message_hi": f"ऑपरेटर {operator_name} द्वारा पोर्टल पर आपका फॉर्म भरना शुरू हुआ है। OTP आने पर ऐप में दर्ज करें।",
        "message_en": f"Operator {operator_name} has started filing your application on the government portal. Please be ready with the OTP sent to your phone.",
        "notification_type": "status_change",
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Audit log
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "operator"),
        "action": "START_FILING",
        "entity_type": "form_submissions",
        "entity_id": sub["id"],
        "new_state": {"status": "operator_filling", "operator_id": current_user["id"]},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Started filing successfully", "submission": _format_submission_response(sub)}

@router.post("/submissions/{submission_id}/update-status", dependencies=[Depends(require_role(["operator", "admin"]))])
def update_submission_status(submission_id: str, payload: SubmissionStatusUpdate, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """Update application filing status (e.g. submitted_to_govt_portal, approved, rejected)."""
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    old_status = sub["status"]
    sub["status"] = payload.status
    if payload.operator_notes:
        sub["operator_notes"] = payload.operator_notes
    if payload.govt_portal_application_id:
        sub["govt_portal_application_id"] = payload.govt_portal_application_id
    if payload.rejection_reason:
        sub["rejection_reason"] = payload.rejection_reason
    if payload.certificate_url:
        sub["certificate_url"] = payload.certificate_url
    if payload.certificate_file_name:
        sub["certificate_file_name"] = payload.certificate_file_name
        
    if payload.status == "submitted_to_govt_portal":
        sub["govt_submitted_at"] = datetime.now(timezone.utc)
    elif payload.status in ("approved", "rejected"):
        sub["completed_at"] = datetime.now(timezone.utc)
        # Update operator completed count
        op = db.operators.get(sub.get("assigned_operator_id"))
        if op:
            op["completed_count"] = op.get("completed_count", 0) + 1
            
    sub["updated_at"] = datetime.now(timezone.utc)
    
    # Notification for citizen
    status_messages = {
        "submitted_to_govt_portal": {
            "title_gu": "સરકારી પોર્ટલ પર અરજી જમા થઈ ગઈ",
            "title_hi": "सरकारी पोर्टल पर आवेदन जमा हो गया",
            "title_en": "Application Submitted to Government Portal",
            "msg_gu": f"તમારી અરજી સરકારી પોર્ટલ પર જમા થઈ છે. એપ્લિકેશન આઈડી: {payload.govt_portal_application_id or 'જારી થયેલ છે'}",
            "msg_hi": f"आपका आवेदन पोर्टल पर जमा हो चुका है। संदर्भ सं: {payload.govt_portal_application_id or 'प्रदत्त'}",
            "msg_en": f"Your application has been filed on the official portal. Govt Ref ID: {payload.govt_portal_application_id or 'Issued'}"
        },
        "approved": {
            "title_gu": "અભિનંદન! પ્રમાણપત્ર મંજૂર થયેલ છે",
            "title_hi": "बधाई! प्रमाण पत्र स्वीकृत हुआ",
            "title_en": "Congratulations! Certificate Issued",
            "msg_gu": "તમારું પ્રમાણપત્ર મંજૂર થઈ ગયું છે. તમે તેને હવે 'My Filled Forms' માંથી ડાઉનલોડ કરી શકો છો.",
            "msg_hi": "आपका प्रमाण पत्र स्वीकृत हो चुका है। आप इसे डाउनलोड कर सकते हैं।",
            "msg_en": "Your certificate has been issued. You can now download the certificate from My Filled Forms."
        },
        "rejected": {
            "title_gu": "અરજીમાં ક્ષતિ / અસ્વીકાર",
            "title_hi": "आवेदन अस्वीकृत / त्रुटि",
            "title_en": "Application Query / Rejected",
            "msg_gu": f"અરજીમાં નીચે મુજબની ક્ષતિ જણાયેલ છે: {payload.rejection_reason or 'દસ્તાવેજ અપૂર્ણ'}",
            "msg_hi": f"आवेदन में त्रुटि: {payload.rejection_reason or 'दस्तावेज अपूर्ण'}",
            "msg_en": f"Application query: {payload.rejection_reason or 'Incomplete document'}"
        }
    }
    
    notif_info = status_messages.get(payload.status)
    if notif_info:
        notif_id = str(uuid.uuid4())
        db.notifications[notif_id] = {
            "id": notif_id,
            "user_id": sub["user_id"],
            "submission_id": sub["id"],
            "title_gu": notif_info["title_gu"],
            "title_hi": notif_info["title_hi"],
            "title_en": notif_info["title_en"],
            "message_gu": notif_info["msg_gu"],
            "message_hi": notif_info["msg_hi"],
            "message_en": notif_info["msg_en"],
            "notification_type": "status_change",
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        }
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "operator"),
        "action": f"STATUS_CHANGE_{payload.status.upper()}",
        "entity_type": "form_submissions",
        "entity_id": sub["id"],
        "old_state": {"status": old_status},
        "new_state": {"status": payload.status, "operator_notes": payload.operator_notes},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Status updated successfully", "submission": _format_submission_response(sub)}
