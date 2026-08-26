import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from formseva_app.models.schemas import SubmissionResponse, SubmissionStatusUpdate
from formseva_app.core.database import db
from formseva_app.core.security import require_role, check_submission_access
from formseva_app.api.submissions import _format_submission_response

router = APIRouter(prefix="/operator", tags=["Operator Workbench"])

@router.get("/my-forms", dependencies=[Depends(require_role(["operator", "admin"]))])
def get_operator_assigned_forms(current_user: dict = Depends(require_role(["operator", "admin"]))):
    """Returns the forms that the current operator is authorized/assigned to process."""
    if current_user.get("role") == "admin":
        return list(db.forms.values())
    
    operator_id = current_user["id"]
    assigned_form_ids = {
        a["form_id"] for a in db.operator_form_assignments.values()
        if a["operator_id"] == operator_id and a.get("is_active", True)
    }
    return [f for f in db.forms.values() if f["id"] in assigned_form_ids]

@router.get("/queue", response_model=List[SubmissionResponse], dependencies=[Depends(require_role(["operator", "admin"]))])
def get_operator_queue(current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Returns submissions in the operator queue (FS-H6).
    Applies PII masking for unassigned submissions.
    """
    operator_id = current_user["id"]
    is_admin = current_user.get("role") == "admin"
    
    subs = list(db.submissions.values())
    if not is_admin:
        assigned_form_ids = {
            a["form_id"] for a in db.operator_form_assignments.values()
            if a["operator_id"] == operator_id and a.get("is_active", True)
        }
        subs = [
            s for s in subs 
            if (s.get("assigned_operator_id") == operator_id) or 
               (s.get("assigned_operator_id") is None and s.get("form_id") in assigned_form_ids)
        ]
    
    subs.sort(key=lambda s: s["submitted_at"], reverse=True)
    return [_format_submission_response(s, requester=current_user) for s in subs]

@router.post("/submissions/{submission_id}/start", dependencies=[Depends(require_role(["operator", "admin"]))])
def start_filing_submission(submission_id: str, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Operator begins filing on the Gujarat government portal (FS-H1).
    Enforces form-eligibility and single-operator assignment lock.
    """
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    is_admin = current_user.get("role") == "admin"
    operator_id = current_user["id"]
    
    if not is_admin:
        # Check operator eligibility for this form category
        is_form_eligible = any(
            a["operator_id"] == operator_id and a["form_id"] == sub["form_id"] and a.get("is_active", True)
            for a in db.operator_form_assignments.values()
        )
        if not is_form_eligible:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You are not certified/eligible to process this form category."
            )
        
        # Check if already actively in progress with a different operator
        if sub.get("status") == "operator_filling" and sub.get("assigned_operator_id") and sub["assigned_operator_id"] != operator_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: This application is already actively being processed by another operator."
            )
    
    operator = db.operators.get(current_user["id"])
    operator_name = operator.get("full_name", current_user.get("full_name", "ઓપરેટર"))
    
    # Update status and assign to current operator
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
        "message_hi": f"ऑपरेटर {operator_name} દ્વારા પોર્ટલ પર તમારું ફોર્મ ભરવાનું શરૂ થયું છે. OTP આવે ત્યારે એપ્લિકેશનમાં દાખલ કરવા તૈયાર રહેશો.",
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
    
    return {"message": "Started filing successfully", "submission": _format_submission_response(sub, requester=current_user)}

@router.post("/submissions/{submission_id}/update-status", dependencies=[Depends(require_role(["operator", "admin"]))])
def update_submission_status(submission_id: str, payload: SubmissionStatusUpdate, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Update application filing status (FS-H1).
    Enforces assigned operator authorization.
    """
    sub = check_submission_access(submission_id, current_user, require_write=True, require_assigned_operator=True)
    
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
    elif payload.status in ("approved", "rejected", "correction_required"):
        sub["completed_at"] = datetime.now(timezone.utc)
        # Update operator completed count if approved
        if payload.status == "approved":
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
            "title_gu": "અરજીમાં સુધારો જરૂરી છે (Correction Required)",
            "title_hi": "आवेदन में संशोधन आवश्यक है",
            "title_en": "Application Needs Correction",
            "msg_gu": f"ઓપરેટર દ્વારા અરજીમાં સુધારો માંગવામાં આવ્યો છે: {payload.rejection_reason or 'વિગત/દસ્તાવેજ ચકાસો'}",
            "msg_hi": f"आवेदन में सुधार आवश्यक: {payload.rejection_reason or 'दस्तावेज त्रुटि'}",
            "msg_en": f"Correction requested by operator: {payload.rejection_reason or 'Please review information and documents.'}"
        },
        "correction_required": {
            "title_gu": "અરજીમાં સુધારો જરૂરી છે",
            "title_hi": "आवेदन में सुधार आवश्यक",
            "title_en": "Application Needs Correction",
            "msg_gu": f"ક્ષતિ: {payload.rejection_reason or 'અધૂરી માહિતી'}",
            "msg_hi": f"त्रुटि: {payload.rejection_reason or 'अधूरी जानकारी'}",
            "msg_en": f"Correction required: {payload.rejection_reason or 'Incomplete information'}"
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
        "new_state": {"status": payload.status, "rejection_reason": payload.rejection_reason, "operator_notes": payload.operator_notes},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Status updated successfully", "submission": _format_submission_response(sub)}
