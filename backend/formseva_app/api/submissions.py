import uuid
import random
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from formseva_app.models.schemas import SubmissionCreate, SubmissionResponse, SubmissionStatusUpdate, SubmissionResubmitRequest
from formseva_app.core.supabase_client import get_supabase_admin_client
from formseva_app.core.crypto import get_master_key, generate_dek, encrypt_dek, decrypt_dek, encrypt_data, decrypt_data
from formseva_app.core.security import (
    get_current_user,
    require_role,
    check_submission_access,
    mask_phone,
    mask_aadhaar,
    mask_pan,
)
from formseva_app.core.state_machine import validate_status_transition
from formseva_app.core.validation import validate_form_fields, ValidationError

router = APIRouter(prefix="/submissions", tags=["Citizen Submissions"])

def get_db():
    client = get_supabase_admin_client()
    if not client:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return client

def _format_submission_response(sub: dict, requester: Optional[dict] = None) -> SubmissionResponse:
    supabase = get_db()
    
    res_form = supabase.table("forms").select("*").eq("id", sub["form_id"]).execute()
    form = res_form.data[0] if res_form.data else {}
    
    res_user = supabase.table("users").select("*").eq("id", sub["user_id"]).execute()
    user = res_user.data[0] if res_user.data else {}
    
    operator = {}
    if sub.get("assigned_operator_id"):
        res_op = supabase.table("operators").select("*").eq("id", sub["assigned_operator_id"]).execute()
        if res_op.data:
            operator = res_op.data[0]
            
    res_docs = supabase.table("submission_documents").select("*").eq("submission_id", sub["id"]).execute()
    docs = res_docs.data if res_docs.data else []
    
    res_otp = supabase.table("otp_requests").select("*").eq("submission_id", sub["id"]).eq("status", "requested").execute()
    active_otp = res_otp.data[0] if res_otp.data else None
    
    # Decrypt User data
    master_key = get_master_key()
    user_phone = ""
    if user.get("wrapped_dek"):
        try:
            dek_user = decrypt_dek(user["wrapped_dek"], master_key)
            user_phone = decrypt_data(user.get("phone", ""), dek_user) if user.get("phone") else ""
        except Exception:
            pass
            
    # Decrypt Submission Data
    raw_field_values = {}
    res_fields = supabase.table("submission_field_values").select("*").eq("submission_id", sub["id"]).execute()
    
    sub_phone = ""
    rejection_reason = ""
    operator_notes = ""
    
    if sub.get("wrapped_dek"):
        try:
            dek_sub = decrypt_dek(sub["wrapped_dek"], master_key)
            sub_phone = decrypt_data(sub.get("user_phone", ""), dek_sub) if sub.get("user_phone") else ""
            rejection_reason = decrypt_data(sub.get("rejection_reason", ""), dek_sub) if sub.get("rejection_reason") else ""
            operator_notes = decrypt_data(sub.get("operator_notes", ""), dek_sub) if sub.get("operator_notes") else ""
            
            for fv in (res_fields.data or []):
                raw_field_values[fv["field_key"]] = decrypt_data(fv.get("field_value", ""), dek_sub)
        except Exception:
            pass
            
    final_phone = sub_phone or user_phone
    
    is_unassigned_operator = (
        requester is not None and 
        requester.get("role") == "operator" and 
        sub.get("assigned_operator_id") != requester.get("id")
    )
    
    if is_unassigned_operator:
        final_phone = mask_phone(final_phone)
        for key in list(raw_field_values.keys()):
            val = str(raw_field_values[key])
            if "aadhaar" in key.lower():
                raw_field_values[key] = mask_aadhaar(val)
            elif "pan" in key.lower():
                raw_field_values[key] = mask_pan(val)
            elif "mobile" in key.lower() or "phone" in key.lower():
                raw_field_values[key] = mask_phone(val)
                
    return SubmissionResponse(
        id=sub["id"],
        application_number=sub["application_number"],
        user_id=sub["user_id"],
        user_name=user.get("full_name", "Citizen"),
        user_phone=final_phone,
        form_id=sub["form_id"],
        form_slug=form.get("slug", "unknown"),
        form_title_gu=form.get("title_gu", ""),
        form_title_hi=form.get("title_hi", ""),
        form_title_en=form.get("title_en", ""),
        assigned_operator_id=sub.get("assigned_operator_id"),
        assigned_operator_name=operator.get("full_name"),
        status=sub["status"],
        govt_portal_application_id=sub.get("govt_portal_application_id"),
        rejection_reason=rejection_reason,
        operator_notes=operator_notes,
        official_fee=float(sub.get("official_fee") or form.get("official_fee", 0.0)),
        service_fee=float(sub.get("service_fee") or form.get("service_fee", 99.0)),
        total_fee=float(sub["total_fee"]),
        payment_status=sub.get("payment_status", "pending"),
        submitted_at=sub["submitted_at"],
        resubmitted_at=sub.get("resubmitted_at"),
        operator_started_at=sub.get("operator_started_at"),
        completed_at=sub.get("completed_at"),
        field_values=raw_field_values,
        documents=docs,
        active_otp_request=active_otp
    )

@router.post("", response_model=SubmissionResponse)
def create_submission(payload: SubmissionCreate, current_user: dict = Depends(get_current_user)):
    supabase = get_db()
    res_form = supabase.table("forms").select("*").eq("slug", payload.form_slug).execute()
    form = res_form.data[0] if res_form.data else None
    if not form:
        raise HTTPException(status_code=404, detail=f"Form '{payload.form_slug}' not found")
        
    res_fields = supabase.table("form_fields").select("*").eq("form_id", form["id"]).execute()
    form_fields = res_fields.data or []
    
    try:
        cleaned_fields = validate_form_fields(payload.field_values, form, form_fields)
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "message": e.message_en,
                "errors": {
                    e.field_key: {
                        "en": e.message_en,
                        "gu": e.message_gu,
                        "hi": e.message_hi
                    }
                }
            }
        )
        
    submission_id = str(uuid.uuid4())
    random_code = random.randint(1000, 9999)
    app_number = f"FS-2026-GJ-{random_code}"
    
    # Determine fees
    official_fee = float(form.get("official_fee", 0.0))
    service_fee = float(form.get("service_fee", 99.0))
    
    # Custom fee logic for NEET UG
    if payload.form_slug == "neet_ug_registration":
        cat = str(payload.field_values.get("category", "")).lower()
        gender = str(payload.field_values.get("gender", "")).lower()
        is_pwbd = str(payload.field_values.get("is_pwbd", "no")).lower() == "yes"
        
        official_fee = 1700.0
        if is_pwbd or cat in ["sc", "st"]:
            official_fee = 1000.0
        elif cat in ["obc-ncl", "general-ews"]:
            official_fee = 1600.0
            
        service_fee = 200.0
        
    total_fee = official_fee + service_fee
    
    # Generate DEK for this submission
    master_key = get_master_key()
    dek = generate_dek()
    wrapped_dek = encrypt_dek(dek, master_key)
    
    # Encrypt PII
    enc_user_phone = encrypt_data(payload.user_phone, dek) if getattr(payload, "user_phone", None) else None
    
    new_sub = {
        "id": submission_id,
        "application_number": app_number,
        "user_id": current_user["id"],
        "form_id": form["id"],
        "status": "submitted",
        "official_fee": official_fee,
        "service_fee": service_fee,
        "total_fee": total_fee,
        "payment_status": "pending",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "wrapped_dek": wrapped_dek,
        "user_phone": enc_user_phone
    }
    
    supabase.table("form_submissions").insert(new_sub).execute()
    
    field_key_to_id = {f["field_key"]: f["id"] for f in form_fields}
    for k, v in cleaned_fields.items():
        enc_v = encrypt_data(str(v), dek)
        fv = {
            "submission_id": submission_id,
            "form_field_id": field_key_to_id.get(k, "f0000000-0000-0000-0000-000000000000"),
            "field_key": k,
            "field_value": enc_v
        }
        supabase.table("submission_field_values").insert(fv).execute()
        
    return _format_submission_response(new_sub, current_user)

@router.get("", response_model=List[SubmissionResponse])
def get_submissions(current_user: dict = Depends(get_current_user)):
    supabase = get_db()
    role = current_user.get("role")
    
    if role == "citizen":
        res = supabase.table("form_submissions").select("*").eq("user_id", current_user["id"]).execute()
    elif role == "operator":
        res = supabase.table("form_submissions").select("*").in_("assigned_operator_id", [current_user["id"], None]).execute()
    elif role == "super_admin" or role == "admin":
        res = supabase.table("form_submissions").select("*").execute()
    else:
        res = type('obj', (object,), {'data': []})
        
    subs = res.data or []
    # Note: O(N) queries for format in this simplified version. For prod, we'd use joined queries.
    return [_format_submission_response(s, current_user) for s in subs]

@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission(submission_id: str, current_user: dict = Depends(get_current_user)):
    sub = check_submission_access(submission_id, current_user)
    return _format_submission_response(sub, current_user)

@router.patch("/{submission_id}/status")
def update_submission_status(submission_id: str, payload: SubmissionStatusUpdate, current_user: dict = Depends(require_role(["operator", "admin"]))):
    sub = check_submission_access(submission_id, current_user, require_write=True, require_assigned_operator=True)
    validate_status_transition(sub["status"], payload.status)
    
    supabase = get_db()
    
    update_data = {
        "status": payload.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if payload.status == "operator_filling" and not sub.get("operator_started_at"):
        update_data["operator_started_at"] = datetime.now(timezone.utc).isoformat()
    elif payload.status == "submitted_to_govt_portal":
        update_data["govt_submitted_at"] = datetime.now(timezone.utc).isoformat()
        if payload.govt_portal_application_id:
            update_data["govt_portal_application_id"] = payload.govt_portal_application_id
            
    # Encrypt operator notes if any
    if payload.operator_notes or payload.rejection_reason:
        master_key = get_master_key()
        dek = decrypt_dek(sub["wrapped_dek"], master_key) if sub.get("wrapped_dek") else generate_dek()
        if not sub.get("wrapped_dek"):
            update_data["wrapped_dek"] = encrypt_dek(dek, master_key)
            
        if payload.operator_notes:
            update_data["operator_notes"] = encrypt_data(payload.operator_notes, dek)
        if payload.rejection_reason:
            update_data["rejection_reason"] = encrypt_data(payload.rejection_reason, dek)
            
    supabase.table("form_submissions").update(update_data).eq("id", submission_id).execute()
    
    return {"message": f"Status updated to {payload.status}"}

@router.post("/{submission_id}/resubmit", response_model=SubmissionResponse)
def resubmit_submission(
    submission_id: str, 
    payload: SubmissionResubmitRequest, 
    current_user: dict = Depends(get_current_user)
):
    supabase = get_db()
    sub = check_submission_access(submission_id, current_user, require_write=True)
    
    if sub["status"] not in ["correction_required", "draft"]:
        raise HTTPException(status_code=400, detail="Submission cannot be resubmitted from current state")
        
    res_form = supabase.table("forms").select("*").eq("id", sub["form_id"]).execute()
    if not res_form.data:
        raise HTTPException(status_code=404, detail="Form not found")
    form = res_form.data[0]
    
    res_fields = supabase.table("form_fields").select("*").eq("form_id", form["id"]).execute()
    form_fields = res_fields.data or []
    
    try:
        cleaned_fields = validate_form_fields(payload.field_values, form, form_fields)
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail={
                "message": e.message_en,
                "errors": {
                    e.field_key: {
                        "en": e.message_en,
                        "gu": e.message_gu,
                        "hi": e.message_hi
                    }
                }
            }
        )
        
    master_key = get_master_key()
    if not sub.get("wrapped_dek"):
        dek = generate_dek()
        wrapped_dek = encrypt_dek(dek, master_key)
        supabase.table("form_submissions").update({"wrapped_dek": wrapped_dek}).eq("id", submission_id).execute()
    else:
        dek = decrypt_dek(sub["wrapped_dek"], master_key)
        
    supabase.table("submission_field_values").delete().eq("submission_id", submission_id).execute()
    
    field_key_to_id = {f["field_key"]: f["id"] for f in form_fields}
    for k, v in cleaned_fields.items():
        enc_v = encrypt_data(str(v), dek)
        fv = {
            "submission_id": submission_id,
            "form_field_id": field_key_to_id.get(k, "f0000000-0000-0000-0000-000000000000"),
            "field_key": k,
            "field_value": enc_v
        }
        supabase.table("submission_field_values").insert(fv).execute()
        
    update_data = {
        "status": "resubmitted",
        "resubmitted_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if payload.resubmission_note:
        update_data["operator_notes"] = encrypt_data(payload.resubmission_note, dek)
        
    supabase.table("form_submissions").update(update_data).eq("id", submission_id).execute()
    
    # Refresh submission data
    res_sub = supabase.table("form_submissions").select("*").eq("id", submission_id).execute()
    return _format_submission_response(res_sub.data[0], current_user)
