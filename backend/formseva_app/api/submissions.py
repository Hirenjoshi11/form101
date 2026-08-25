import uuid
import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from formseva_app.models.schemas import SubmissionCreate, SubmissionResponse, SubmissionStatusUpdate, SubmissionResubmitRequest
from formseva_app.core.database import db
from formseva_app.core.security import get_current_user, require_role

router = APIRouter(prefix="/submissions", tags=["Citizen Submissions"])

def _format_submission_response(sub: dict) -> SubmissionResponse:
    form = db.forms.get(sub["form_id"], {})
    user = db.users.get(sub["user_id"], {})
    operator = db.operators.get(sub.get("assigned_operator_id", ""), {}) if sub.get("assigned_operator_id") else {}
    
    # Docs
    docs = [d for d in db.submission_documents.values() if d["submission_id"] == sub["id"]]
    
    # Active OTP
    active_otp = next((
        otp for otp in db.otp_requests.values() 
        if otp["submission_id"] == sub["id"] and otp["status"] == "requested"
    ), None)
    
    user_phone = sub.get("user_phone") or user.get("phone", "")
    
    return SubmissionResponse(
        id=sub["id"],
        application_number=sub["application_number"],
        user_id=sub["user_id"],
        user_name=user.get("full_name", "Citizen"),
        user_phone=user_phone,
        form_id=sub["form_id"],
        form_slug=form.get("slug", "unknown"),
        form_title_gu=form.get("title_gu", ""),
        form_title_hi=form.get("title_hi", ""),
        form_title_en=form.get("title_en", ""),
        assigned_operator_id=sub.get("assigned_operator_id"),
        assigned_operator_name=operator.get("full_name"),
        status=sub["status"],
        govt_portal_application_id=sub.get("govt_portal_application_id"),
        rejection_reason=sub.get("rejection_reason"),
        operator_notes=sub.get("operator_notes"),
        official_fee=sub.get("official_fee", float(form.get("official_fee", 0.0))),
        service_fee=sub.get("service_fee", float(form.get("service_fee", 99.0))),
        total_fee=sub["total_fee"],
        payment_status=sub["payment_status"],
        submitted_at=sub["submitted_at"],
        resubmitted_at=sub.get("resubmitted_at"),
        operator_started_at=sub.get("operator_started_at"),
        completed_at=sub.get("completed_at"),
        certificate_url=sub.get("certificate_url"),
        certificate_file_name=sub.get("certificate_file_name"),
        field_values=db.submission_field_values.get(sub["id"], {}),
        documents=docs,
        active_otp_request=active_otp
    )

@router.post("", response_model=SubmissionResponse)
def create_submission(payload: SubmissionCreate, current_user: dict = Depends(get_current_user)):
    """Citizen creates a new assisted certificate filing submission."""
    # Find form
    form = next((f for f in db.forms.values() if f["slug"] == payload.form_slug), None)
    if not form:
        raise HTTPException(status_code=404, detail=f"Form '{payload.form_slug}' not found")
    
    submission_id = str(uuid.uuid4())
    random_code = random.randint(1000, 9999)
    app_number = f"FS-2026-GJ-{random_code}"
    
    official_fee = float(form.get("official_fee", 0.0))
    service_fee = float(form.get("service_fee", 99.0))
    total_fee = official_fee + service_fee
    
    # Capture citizen mobile number (from profile or entered field values)
    phone_from_input = payload.field_values.get("mobile_number") or payload.field_values.get("mobile") or payload.field_values.get("phone")
    user_phone = current_user.get("phone") or phone_from_input or ""
    if phone_from_input and (not current_user.get("phone") or current_user.get("phone") != str(phone_from_input)):
        # Persist phone to citizen profile in database
        u = db.users.get(current_user["id"])
        if u:
            u["phone"] = str(phone_from_input)
            u["updated_at"] = datetime.now(timezone.utc)
        user_phone = str(phone_from_input)
    
    # Auto-assign only to an active operator who is eligible/assigned to this specific form
    eligible_operator_ids = [
        a["operator_id"] for a in db.operator_form_assignments.values()
        if a.get("form_id") == form["id"] and a.get("is_active", True)
    ]
    
    eligible_operators = [
        op for op in db.operators.values() 
        if op.get("is_active", True) and (not eligible_operator_ids or op["id"] in eligible_operator_ids)
    ]
    
    chosen_operator_id = None
    if eligible_operators:
        chosen_operator = min(eligible_operators, key=lambda op: op.get("assigned_count", 0))
        chosen_operator_id = chosen_operator["id"]
        chosen_operator["assigned_count"] = chosen_operator.get("assigned_count", 0) + 1

    submission_record = {
        "id": submission_id,
        "application_number": app_number,
        "user_id": current_user["id"],
        "user_phone": user_phone,
        "form_id": form["id"],
        "assigned_operator_id": chosen_operator_id,
        "status": "submitted",
        "govt_portal_application_id": None,
        "govt_portal_url": None,
        "rejection_reason": None,
        "operator_notes": None,
        "official_fee": official_fee,
        "service_fee": service_fee,
        "total_fee": total_fee,
        "payment_status": "pending", # Ready for Payment
        "submitted_at": datetime.now(timezone.utc),
        "resubmitted_at": None,
        "operator_started_at": None,
        "govt_submitted_at": None,
        "completed_at": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    db.submissions[submission_id] = submission_record
    db.submission_field_values[submission_id] = payload.field_values
    
    # Create citizen notification
    notif_id = str(uuid.uuid4())
    db.notifications[notif_id] = {
        "id": notif_id,
        "user_id": current_user["id"],
        "submission_id": submission_id,
        "title_gu": "અરજી સફળતાપૂર્વક સબમિટ થઈ",
        "title_hi": "आवेदन सफलतापूर्वक जमा हुआ",
        "title_en": "Application Submitted Successfully",
        "message_gu": f"તમારી અરજી નં. {app_number} પ્રાપ્ત થઈ છે. ટૂંક સમયમાં ઓપરેટર કામગીરી શરૂ કરશે.",
        "message_hi": f"आपका आवेदन सं. {app_number} प्राप्त हुआ है।",
        "message_en": f"Your application No. {app_number} has been received. An operator will begin filing shortly.",
        "notification_type": "status_change",
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }

    # Audit log
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "citizen",
        "action": "CREATE_SUBMISSION",
        "entity_type": "form_submissions",
        "entity_id": submission_id,
        "new_state": {"application_number": app_number, "total_fee": total_fee},
        "created_at": datetime.now(timezone.utc)
    })
    
    return _format_submission_response(submission_record)

@router.post("/{submission_id}/resubmit", response_model=SubmissionResponse)
def resubmit_submission(
    submission_id: str,
    payload: SubmissionResubmitRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Citizen resubmits a rejected/correction-required application.
    Updates the existing application in place without creating duplicate records or charging new fees.
    """
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if current_user.get("role") == "citizen" and sub["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to resubmit this application")
    
    # Update field values
    if submission_id in db.submission_field_values:
        db.submission_field_values[submission_id].update(payload.field_values)
    else:
        db.submission_field_values[submission_id] = payload.field_values
    
    # Update status to resubmitted
    sub["status"] = "resubmitted"
    sub["resubmitted_at"] = datetime.now(timezone.utc)
    sub["updated_at"] = datetime.now(timezone.utc)
    if payload.resubmission_note:
        sub["operator_notes"] = f"Citizen Resubmission Note: {payload.resubmission_note}"
    
    # Notify Citizen
    notif_id = str(uuid.uuid4())
    db.notifications[notif_id] = {
        "id": notif_id,
        "user_id": sub["user_id"],
        "submission_id": sub["id"],
        "title_gu": "અરજી ફરીથી સબમિટ થઈ",
        "title_hi": "आवेदन पुनः जमा हुआ",
        "title_en": "Application Resubmitted",
        "message_gu": f"તમારી અરજી {sub['application_number']} માં સુધારો કરીને સફળતાપૂર્વક ફરીથી મોકલવામાં આવી છે.",
        "message_hi": f"आपका आवेदन {sub['application_number']} पुनः जमा हुआ।",
        "message_en": f"Your application {sub['application_number']} has been corrected and resubmitted for operator review.",
        "notification_type": "status_change",
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }

    # Audit log
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "citizen",
        "action": "RESUBMIT_SUBMISSION",
        "entity_type": "form_submissions",
        "entity_id": submission_id,
        "new_state": {"status": "resubmitted", "resubmitted_at": sub["resubmitted_at"].isoformat()},
        "created_at": datetime.now(timezone.utc)
    })

    return _format_submission_response(sub)

@router.get("/my", response_model=List[SubmissionResponse])
def get_my_submissions(current_user: dict = Depends(get_current_user)):
    """Get all submissions made by the currently authenticated citizen."""
    user_id = current_user["id"]
    subs = [s for s in db.submissions.values() if s["user_id"] == user_id]
    subs.sort(key=lambda s: s["submitted_at"], reverse=True)
    return [_format_submission_response(s) for s in subs]

@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission_detail(submission_id: str, current_user: dict = Depends(get_current_user)):
    """
    Get full details of a submission.
    Enforces role-based visibility security:
    - Citizen: only own applications.
    - Operator: only applications assigned to them OR forms they are authorized to handle.
    - Admin: all applications.
    """
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    role = current_user.get("role", "citizen")
    
    if role == "citizen":
        if sub["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to view this application")
    elif role == "operator":
        operator_id = current_user["id"]
        # Check if assigned to operator
        is_assigned = (sub.get("assigned_operator_id") == operator_id)
        # Check if operator is eligible for this form
        is_eligible_for_form = any(
            a["operator_id"] == operator_id and a["form_id"] == sub["form_id"] and a.get("is_active", True)
            for a in db.operator_form_assignments.values()
        )
        if not (is_assigned or is_eligible_for_form):
            raise HTTPException(status_code=403, detail="You are not authorized to access applications for this form/service.")
    
    return _format_submission_response(sub)

@router.post("/{submission_id}/upload-doc")
def upload_submission_document(
    submission_id: str,
    document_type_key: str = Form(...),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Direct document upload endpoint.
    Complies with DPDP Act 2023 - files are indexed per submission vault.
    """
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if current_user.get("role") == "citizen" and sub["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to upload files for this application")
    
    doc_id = str(uuid.uuid4())
    storage_path = f"submissions/{submission_id}/{document_type_key}_{file.filename}"
    
    # Overwrite if document_type_key already exists for this submission
    existing_doc = next((d for d in db.submission_documents.values() if d["submission_id"] == submission_id and d["document_type_key"] == document_type_key), None)
    if existing_doc:
        existing_doc["file_name"] = file.filename
        existing_doc["storage_path"] = storage_path
        existing_doc["mime_type"] = file.content_type or "application/pdf"
        existing_doc["created_at"] = datetime.now(timezone.utc)
        return {"message": "Document replaced successfully", "document": existing_doc}
    
    doc_meta = {
        "id": doc_id,
        "submission_id": submission_id,
        "document_type_key": document_type_key,
        "file_name": file.filename,
        "file_size_bytes": 1024 * 512, # mock approx 512 KB
        "mime_type": file.content_type or "application/pdf",
        "storage_path": storage_path,
        "is_verified": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    db.submission_documents[doc_id] = doc_meta
    return {"message": "Document uploaded successfully", "document": doc_meta}

@router.get("/{submission_id}/certificate")
def get_submission_certificate(submission_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve digital certificate metadata for an approved submission."""
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    if current_user.get("role") == "citizen" and sub["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    form = db.forms.get(sub["form_id"], {})
    user = db.users.get(sub["user_id"], {})
    fields = db.submission_field_values.get(submission_id, {})
    
    cert_no = f"GJ-CERT-{sub['application_number'].replace('FS-', '')}-2026"
    
    return {
        "certificate_number": cert_no,
        "application_number": sub["application_number"],
        "status": sub["status"],
        "is_ready_for_download": sub["status"] == "approved",
        "form_title_en": form.get("title_en"),
        "form_title_gu": form.get("title_gu"),
        "applicant_name": fields.get("applicant_name") or user.get("full_name"),
        "issued_at": sub.get("completed_at") or datetime.now(timezone.utc),
        "valid_years": 3,
        "issuing_authority": "Revenue Department, Government of Gujarat",
        "digital_signature": "SHA256:VERIFIED:MAMLATDAR:OFFICE:GUJARAT",
        "field_values": fields
    }
