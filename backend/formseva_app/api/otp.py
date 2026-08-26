import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
import hashlib
from fastapi import APIRouter, HTTPException, Depends, status
from formseva_app.models.schemas import OtpTriggerRequest, OtpSubmitRequest
from formseva_app.core.database import db
from formseva_app.core.security import get_current_user, require_role, check_submission_access

router = APIRouter(prefix="/otp", tags=["In-App Assisted OTP Relay"])

@router.post("/trigger", dependencies=[Depends(require_role(["operator", "admin"]))])
def trigger_otp_request(payload: OtpTriggerRequest, current_user: dict = Depends(require_role(["operator", "admin"]))):
    """
    Operator triggers an in-app OTP prompt to the citizen (FS-H3).
    Enforces assigned operator authorization.
    Complies with Google Play & India DPDP Act 2023:
    - Never scrapes user SMS or phone logs
    - Citizen receives govt SMS on their phone and manually types it in-app
    - Only stores timestamp and status
    """
    sub = check_submission_access(payload.submission_id, current_user, require_write=True, require_assigned_operator=True)
    
    # Calculate sequence number
    existing_requests = [r for r in db.otp_requests.values() if r["submission_id"] == payload.submission_id]
    seq = len(existing_requests) + 1
    
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
        "requested_at": datetime.now(timezone.utc),
        "submitted_at": None,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    
    db.otp_requests[otp_id] = otp_req
    sub["status"] = "awaiting_otp"
    sub["updated_at"] = datetime.now(timezone.utc)
    
    # Notification to citizen
    notif_id = str(uuid.uuid4())
    db.notifications[notif_id] = {
        "id": notif_id,
        "user_id": sub["user_id"],
        "submission_id": sub["id"],
        "title_gu": f"તાકીદ: OTP દાખલ કરો (સ્ટેપ {seq})",
        "title_hi": f"आवश्यक: OTP दर्ज करें (चरण {seq})",
        "title_en": f"Action Needed: Enter OTP (Step {seq})",
        "message_gu": f"તમારા મોબાઈલ પર ગુજરાત સરકાર તરફથી આવેલ OTP તાત્કાલિક એપ્લિકેશનમાં દાખલ કરો. (હેતુ: {otp_req['otp_purpose_gu']})",
        "message_hi": f"आपके मोबाइल पर आया OTP ऐप में दर्ज करें। (उद्देश्य: {otp_req['otp_purpose_hi']})",
        "message_en": f"Please enter the OTP received from the government portal into Form_Seva. (Purpose: {otp_req['otp_purpose_en']})",
        "notification_type": "otp_needed",
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Audit log
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "operator"),
        "action": f"TRIGGER_OTP_STEP_{seq}",
        "entity_type": "otp_requests",
        "entity_id": otp_id,
        "new_state": {"sequence": seq, "submission_id": payload.submission_id},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "OTP prompt sent to citizen", "otp_request": otp_req}

@router.post("/submit")
def submit_otp_by_citizen(payload: OtpSubmitRequest, current_user: dict = Depends(get_current_user)):
    """
    Citizen submits the OTP in the app (FS-H3).
    Strictly verifies citizen ownership of the application.
    The OTP code is hashed before storage — we NEVER store the raw OTP text.
    """
    otp_req = None
    if payload.otp_request_id and payload.otp_request_id in db.otp_requests:
        otp_req = db.otp_requests[payload.otp_request_id]
    elif payload.submission_id:
        otp_req = next((
            r for r in db.otp_requests.values() 
            if r["submission_id"] == payload.submission_id and r["status"] == "requested"
        ), None)
        
    if not otp_req:
        raise HTTPException(status_code=404, detail="Active OTP request not found")
    
    if otp_req["status"] != "requested":
        raise HTTPException(status_code=400, detail=f"OTP request is already in '{otp_req['status']}' state")
    
    # Enforce Citizen Resource Ownership (FS-H3)
    sub = check_submission_access(otp_req["submission_id"], current_user, require_write=True)
    if current_user.get("role") != "admin" and sub["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied: Only the applicant citizen may submit the OTP.")
    
    # Update OTP status & submission status
    otp_req["status"] = "submitted_by_citizen"
    otp_req["submitted_at"] = datetime.now(timezone.utc)
    
    # Store only the hashed OTP code — never the raw value
    raw_code = payload.otp_code.strip()
    otp_req["otp_code_hash"] = hashlib.sha256(raw_code.encode()).hexdigest()
    # Masked display for operator confirmation (e.g., "****56")
    otp_req["entered_code_display"] = f"****{raw_code[-2:]}" if len(raw_code) >= 2 else "****"
    
    sub["status"] = "otp_received"
    sub["updated_at"] = datetime.now(timezone.utc)
    
    # Audit log: Record only metadata, not the secret
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "citizen"),
        "action": "SUBMIT_IN_APP_OTP",
        "entity_type": "otp_requests",
        "entity_id": otp_req["id"],
        "new_state": {"status": "submitted_by_citizen", "submitted_at": str(otp_req["submitted_at"])},
        "created_at": datetime.now(timezone.utc)
    })
    
    # Return sanitized response — strip the hash, only return status metadata
    safe_response = {k: v for k, v in otp_req.items() if k != "otp_code_hash"}
    return {"message": "OTP submitted successfully to operator", "otp_request": safe_response}

@router.get("/active/{submission_id}")
def get_active_otp_prompt(submission_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get active OTP prompt for a submission if any (FS-H3).
    Enforces authorization check before revealing OTP requests.
    """
    check_submission_access(submission_id, current_user, require_write=False)
    
    active_otp = next((
        otp for otp in db.otp_requests.values() 
        if otp["submission_id"] == submission_id and otp["status"] in ("requested", "submitted_by_citizen")
    ), None)
    
    if active_otp and "otp_code_hash" in active_otp:
        active_otp = {k: v for k, v in active_otp.items() if k != "otp_code_hash"}
    return {"active_otp": active_otp}

