import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from formseva_app.models.schemas import OtpTriggerRequest, OtpSubmitRequest
from formseva_app.core.supabase_client import get_supabase_admin_client
from formseva_app.core.crypto import get_master_key, generate_dek, encrypt_dek, decrypt_dek, encrypt_data, decrypt_data
from formseva_app.core.security import get_current_user, require_role, check_submission_access
from formseva_app.core.state_machine import validate_status_transition
import secrets

router = APIRouter(prefix="/otp", tags=["In-App Assisted OTP Relay"])

def get_db():
    client = get_supabase_admin_client()
    if not client:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return client

@router.post("/trigger", dependencies=[Depends(require_role(["operator", "admin"]))])
def trigger_otp_request(payload: OtpTriggerRequest, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Operator triggers an in-app OTP prompt to the citizen (FS-H3, FS-H2).
    """
    # check_submission_access now needs to read from Supabase internally (assuming it's migrated)
    sub = check_submission_access(payload.submission_id, current_user, require_write=True, require_assigned_operator=True)
    validate_status_transition(sub.get("status", "operator_filling"), "awaiting_otp")
    
    supabase = get_db()
    
    # Calculate sequence number
    res = supabase.table("otp_requests").select("id").eq("submission_id", payload.submission_id).execute()
    seq = len(res.data) + 1 if res.data else 1
    
    otp_id = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    otp_req = {
        "id": otp_id,
        "submission_id": payload.submission_id,
        "operator_id": current_user["id"],
        "otp_sequence_number": seq,
        "otp_purpose_gu": payload.otp_purpose_gu or "ડિજિટલ ગુજરાત પોર્ટલ લોગિન / e-KYC માટે",
        "otp_purpose_hi": payload.otp_purpose_hi or "डिजिटल गुजरात पोर्टल लॉगिन / ई-केवाईसी हेतु",
        "otp_purpose_en": payload.otp_purpose_en or "For Digital Gujarat Portal Login / e-KYC",
        "status": "requested",
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at.isoformat()
    }
    
    supabase.table("otp_requests").insert(otp_req).execute()
    supabase.table("form_submissions").update({"status": "awaiting_otp", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", payload.submission_id).execute()
    
    return {"message": "OTP prompt sent to citizen", "otp_request": otp_req}

@router.post("/submit")
def submit_otp_by_citizen(payload: OtpSubmitRequest, current_user: dict = Depends(get_current_user)):
    """
    Citizen submits the OTP in the app.
    OTP is ENCRYPTED before storage.
    """
    supabase = get_db()
    
    if payload.otp_request_id:
        res = supabase.table("otp_requests").select("*").eq("id", payload.otp_request_id).execute()
    elif payload.submission_id:
        res = supabase.table("otp_requests").select("*").eq("submission_id", payload.submission_id).eq("status", "requested").execute()
    else:
        raise HTTPException(status_code=400, detail="Must provide otp_request_id or submission_id")
        
    otp_req = res.data[0] if res.data else None
    
    if not otp_req:
        raise HTTPException(status_code=404, detail="Active OTP request not found")
    if otp_req["status"] != "requested":
        raise HTTPException(status_code=400, detail=f"OTP request is already in '{otp_req['status']}' state")
    
    sub = check_submission_access(otp_req["submission_id"], current_user, require_write=True)
    if current_user.get("role") != "admin" and sub["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied: Only the applicant citizen may submit the OTP.")
    
    validate_status_transition(sub.get("status", "awaiting_otp"), "otp_received")
    
    raw_code = payload.otp_code.strip()
    
    # Encrypt the OTP
    master_key = get_master_key()
    dek = generate_dek()
    wrapped_dek = encrypt_dek(dek, master_key)
    otp_ciphertext = encrypt_data(raw_code, dek)
    entered_code_display = f"****{raw_code[-2:]}" if len(raw_code) >= 2 else "****"
    
    update_data = {
        "status": "submitted_by_citizen",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "otp_ciphertext": otp_ciphertext,
        "wrapped_dek": wrapped_dek,
        "entered_code_display": entered_code_display
    }
    
    supabase.table("otp_requests").update(update_data).eq("id", otp_req["id"]).execute()
    supabase.table("form_submissions").update({"status": "otp_received", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", sub["id"]).execute()
    
    # Audit log (Assuming audit_log table in DB)
    audit_entry = {
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "citizen"),
        "action": "SUBMIT_IN_APP_OTP_ENCRYPTED",
        "entity_type": "otp_requests",
        "entity_id": otp_req["id"],
        "new_state": {"status": "submitted_by_citizen"}
    }
    supabase.table("audit_log").insert(audit_entry).execute()
    
    return {"message": "OTP submitted successfully", "otp_request_id": otp_req["id"]}

@router.get("/active/{submission_id}")
def get_active_otp_prompt(submission_id: str, current_user: dict = Depends(get_current_user)):
    check_submission_access(submission_id, current_user, require_write=False)
    supabase = get_db()
    res = supabase.table("otp_requests").select("*").eq("submission_id", submission_id).in_("status", ["requested", "submitted_by_citizen"]).execute()
    
    active_otp = res.data[0] if res.data else None
    if active_otp:
        # Strip ciphertexts from response
        active_otp.pop("otp_ciphertext", None)
        active_otp.pop("wrapped_dek", None)
        
    return {"active_otp": active_otp}

@router.get("/{otp_id}/view")
def view_otp(otp_id: str, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Strictly guarded endpoint for viewing decrypted OTP.
    Only the assigned operator or an admin can access.
    """
    supabase = get_db()
    res = supabase.table("otp_requests").select("*").eq("id", otp_id).execute()
    otp_req = res.data[0] if res.data else None
    
    if not otp_req:
        raise HTTPException(status_code=404, detail="OTP request not found")
        
    sub = check_submission_access(otp_req["submission_id"], current_user, require_write=False, require_assigned_operator=True)
    
    if not otp_req.get("otp_ciphertext") or not otp_req.get("wrapped_dek"):
        raise HTTPException(status_code=400, detail="OTP value was not captured, has been purged, or is malformed.")
        
    master_key = get_master_key()
    try:
        dek = decrypt_dek(otp_req["wrapped_dek"], master_key)
        plaintext_otp = decrypt_data(otp_req["otp_ciphertext"], dek)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to decrypt OTP")
        
    # Audit logging the view action
    audit_entry = {
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role"),
        "action": "VIEW_DECRYPTED_OTP",
        "entity_type": "otp_requests",
        "entity_id": otp_id,
        "new_state": {"viewed": True}
    }
    supabase.table("audit_log").insert(audit_entry).execute()
    
    return {"otp_value": plaintext_otp}
