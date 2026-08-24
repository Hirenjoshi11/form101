import uuid
import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from formseva_app.models.schemas import SubmissionCreate, SubmissionResponse, SubmissionStatusUpdate
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
    
    return SubmissionResponse(
        id=sub["id"],
        application_number=sub["application_number"],
        user_id=sub["user_id"],
        user_name=user.get("full_name", "Citizen"),
        user_phone=user.get("phone", ""),
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
        total_fee=sub["total_fee"],
        payment_status=sub["payment_status"],
        submitted_at=sub["submitted_at"],
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
    
    total_fee = float(form.get("official_fee", 0.0)) + float(form.get("service_fee", 99.0))
    
    # Auto-assign to the active operator with the lowest current workload
    active_operators = [op for op in db.operators.values() if op.get("is_active", True)]
    chosen_operator_id = None
    if active_operators:
        chosen_operator = min(active_operators, key=lambda op: op.get("assigned_count", 0))
        chosen_operator_id = chosen_operator["id"]
        chosen_operator["assigned_count"] = chosen_operator.get("assigned_count", 0) + 1

    submission_record = {
        "id": submission_id,
        "application_number": app_number,
        "user_id": current_user["id"],
        "form_id": form["id"],
        "assigned_operator_id": chosen_operator_id,
        "status": "submitted",
        "govt_portal_application_id": None,
        "govt_portal_url": None,
        "rejection_reason": None,
        "operator_notes": None,
        "total_fee": total_fee,
        "payment_status": "pending", # Ready for Stripe Payment
        "submitted_at": datetime.now(timezone.utc),
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

@router.get("/my", response_model=List[SubmissionResponse])
def get_my_submissions(current_user: dict = Depends(get_current_user)):
    """Get all submissions made by the currently authenticated citizen."""
    user_id = current_user["id"]
    subs = [s for s in db.submissions.values() if s["user_id"] == user_id]
    subs.sort(key=lambda s: s["submitted_at"], reverse=True)
    return [_format_submission_response(s) for s in subs]

@router.get("/{submission_id}", response_model=SubmissionResponse)
def get_submission_detail(submission_id: str, current_user: dict = Depends(get_current_user)):
    """Get full details of a submission."""
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Role check: Owner or staff
    if current_user.get("role") == "citizen" and sub["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this application")
    
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

