import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status
from formseva_app.models.schemas import SubmissionResponse, SubmissionStatusUpdate
from formseva_app.core.supabase_client import get_supabase_admin_client
from formseva_app.core.security import require_role, check_submission_access
from formseva_app.core.state_machine import validate_status_transition
from formseva_app.api.submissions import _format_submission_response

router = APIRouter(prefix="/operator", tags=["Operator Workbench"])

def get_db():
    client = get_supabase_admin_client()
    if not client:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return client

@router.get("/my-forms", dependencies=[Depends(require_role(["operator", "admin"]))])
def get_operator_assigned_forms(current_user: dict = Depends(require_role(["operator", "admin"]))):
    supabase = get_db()
    if current_user.get("role") == "admin":
        res = supabase.table("forms").select("*").execute()
        return res.data
    
    operator_id = current_user["id"]
    res_assign = supabase.table("operator_form_assignments").select("form_id").eq("operator_id", operator_id).eq("is_active", True).execute()
    assigned_form_ids = [a["form_id"] for a in res_assign.data]
    
    if not assigned_form_ids:
        return []
        
    res_forms = supabase.table("forms").select("*").in_("id", assigned_form_ids).execute()
    return res_forms.data

@router.get("/queue", response_model=List[SubmissionResponse], dependencies=[Depends(require_role(["operator", "admin"]))])
def get_operator_queue(current_user: dict = Depends(require_role(["operator", "admin"]))):
    supabase = get_db()
    operator_id = current_user["id"]
    is_admin = current_user.get("role") == "admin"
    
    if is_admin:
        res = supabase.table("form_submissions").select("*").order("submitted_at", desc=True).execute()
        subs = res.data
    else:
        # Get operator's assigned forms
        res_assign = supabase.table("operator_form_assignments").select("form_id").eq("operator_id", operator_id).eq("is_active", True).execute()
        assigned_form_ids = [a["form_id"] for a in res_assign.data]
        
        # Submissions assigned to this operator
        res_assigned = supabase.table("form_submissions").select("*").eq("assigned_operator_id", operator_id).execute()
        
        # Unassigned submissions for assigned forms
        res_unassigned = []
        if assigned_form_ids:
            res_unassigned_req = supabase.table("form_submissions").select("*").is_("assigned_operator_id", "null").in_("form_id", assigned_form_ids).execute()
            res_unassigned = res_unassigned_req.data
            
        subs = res_assigned.data + res_unassigned
        subs.sort(key=lambda s: s.get("submitted_at", ""), reverse=True)
        
    return [_format_submission_response(s, requester=current_user) for s in subs]

@router.post("/submissions/{submission_id}/start", dependencies=[Depends(require_role(["operator", "admin"]))])
def start_filing_submission(submission_id: str, current_user: dict = Depends(require_role(["operator", "admin"]))):
    supabase = get_db()
    res = supabase.table("form_submissions").select("*").eq("id", submission_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub = res.data[0]
    
    validate_status_transition(sub.get("status", "submitted"), "operator_filling")
    
    is_admin = current_user.get("role") == "admin"
    operator_id = current_user["id"]
    
    if not is_admin:
        res_eligibility = supabase.table("operator_form_assignments").select("*").eq("operator_id", operator_id).eq("form_id", sub["form_id"]).eq("is_active", True).execute()
        if not res_eligibility.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You are not certified/eligible to process this form category."
            )
            
        if sub.get("assigned_operator_id") and sub["assigned_operator_id"] != operator_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: This application is assigned to another operator."
            )
            
    operator_name = current_user.get("full_name", "ઓપરેટર")
    if not is_admin:
        res_op = supabase.table("operators").select("full_name").eq("id", current_user["id"]).execute()
        if res_op.data:
            operator_name = res_op.data[0].get("full_name", operator_name)
            
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Update submission
    update_data = {
        "assigned_operator_id": current_user["id"],
        "status": "operator_filling",
        "operator_started_at": now_iso,
        "updated_at": now_iso
    }
    res_upd = supabase.table("form_submissions").update(update_data).eq("id", submission_id).execute()
    sub.update(update_data)
    
    # Notification
    notif = {
        "id": str(uuid.uuid4()),
        "user_id": sub["user_id"],
        "submission_id": sub["id"],
        "title_gu": f"ઓપરેટર {operator_name} કામગીરી કરી રહ્યા છે",
        "title_hi": f"ऑपरेटर {operator_name} आपका फॉर्म भर रहे हैं",
        "title_en": f"Operator {operator_name} is processing your application",
        "message_gu": f"ઓપરેટર {operator_name} દ્વારા પોર્ટલ પર તમારું ફોર્મ ભરવાનું શરૂ થયું છે. સરકારી પોર્ટલ તરફથી SMS દ્વારા OTP આવે ત્યારે એપ્લિકેશનમાં દાખલ કરવા તૈયાર રહેશો.",
        "message_hi": f"ऑपरेटर {operator_name} द्वारा पोर्टल पर आपका फॉर्म भरना शुरू कर दिया गया है। सरकारी पोर्टल से SMS द्वारा OTP आने पर एप्लीकेशन में दर्ज करने के लिए तैयार रहें।",
        "message_en": f"Operator {operator_name} has started filing your application on the government portal. Please be ready with the OTP sent to your phone.",
        "notification_type": "status_change",
        "is_read": False,
        "created_at": now_iso
    }
    supabase.table("notifications").insert(notif).execute()
    
    # Audit log
    audit = {
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "operator"),
        "action": "START_FILING",
        "entity_type": "form_submissions",
        "entity_id": sub["id"],
        "new_state": {"status": "operator_filling", "operator_id": current_user["id"]},
        "created_at": now_iso
    }
    supabase.table("audit_log").insert(audit).execute()
    
    return {"message": "Started filing successfully", "submission": _format_submission_response(sub, requester=current_user)}

@router.post("/submissions/{submission_id}/update-status", dependencies=[Depends(require_role(["operator", "admin"]))])
def update_submission_status(submission_id: str, payload: SubmissionStatusUpdate, current_user: dict = Depends(require_role(["operator", "admin"]))):
    supabase = get_db()
    sub = check_submission_access(submission_id, current_user, require_write=True, require_assigned_operator=True)
    
    validate_status_transition(sub["status"], payload.status)
    old_status = sub["status"]
    now_iso = datetime.now(timezone.utc).isoformat()
    
    update_data = {
        "status": payload.status,
        "updated_at": now_iso
    }
    
    if payload.operator_notes: update_data["operator_notes"] = payload.operator_notes
    if payload.govt_portal_application_id: update_data["govt_portal_application_id"] = payload.govt_portal_application_id
    if payload.rejection_reason: update_data["rejection_reason"] = payload.rejection_reason
    if payload.certificate_url: update_data["certificate_url"] = payload.certificate_url
    if payload.certificate_file_name: update_data["certificate_file_name"] = payload.certificate_file_name
    
    if payload.status == "submitted_to_govt_portal":
        update_data["govt_submitted_at"] = now_iso
    elif payload.status in ("approved", "rejected", "correction_required"):
        update_data["completed_at"] = now_iso
        if payload.status == "approved" and sub.get("assigned_operator_id"):
            # Update operator completed count
            op_res = supabase.table("operators").select("completed_count").eq("id", sub["assigned_operator_id"]).execute()
            if op_res.data:
                cc = op_res.data[0].get("completed_count", 0) + 1
                supabase.table("operators").update({"completed_count": cc}).eq("id", sub["assigned_operator_id"]).execute()
                
    supabase.table("form_submissions").update(update_data).eq("id", submission_id).execute()
    sub.update(update_data)
    
    # Notification
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
        notif = {
            "id": str(uuid.uuid4()),
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
            "created_at": now_iso
        }
        supabase.table("notifications").insert(notif).execute()
        
    audit = {
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "operator"),
        "action": f"STATUS_CHANGE_{payload.status.upper()}",
        "entity_type": "form_submissions",
        "entity_id": sub["id"],
        "old_state": {"status": old_status},
        "new_state": {"status": payload.status, "rejection_reason": payload.rejection_reason, "operator_notes": payload.operator_notes},
        "created_at": now_iso
    }
    supabase.table("audit_log").insert(audit).execute()
    
    return {"message": "Status updated successfully", "submission": _format_submission_response(sub)}
