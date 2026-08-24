import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from formseva_app.models.schemas import FeedbackCreate, FeedbackResponse, FeedbackStatusUpdate
from formseva_app.core.database import db
from formseva_app.core.security import require_role, get_current_user

router = APIRouter(tags=["Feedback & Citizen Reviews"])

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackCreate, current_user: Optional[dict] = Depends(get_current_user)):
    """
    Public Citizen Feedback submission endpoint.
    Accepts user feedback, rating (1-5), category, message, and saves it to the database.
    """
    fb_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Resolve service title
    service_name = "General Feedback"
    if payload.service_id and payload.service_id != "general":
        for form in db.forms.values():
            if form["slug"] == payload.service_id or form["id"] == payload.service_id:
                service_name = form.get("title_en", form.get("title_gu", payload.service_id))
                break

    user_id = current_user.get("id") if current_user else None
    name = payload.name
    email = payload.email
    mobile = payload.mobile

    if current_user:
        if not name and current_user.get("full_name"):
            name = current_user.get("full_name")
        if not email and current_user.get("email"):
            email = current_user.get("email")
        if not mobile and current_user.get("phone"):
            mobile = current_user.get("phone")

    fb_record = {
        "id": fb_id,
        "user_id": user_id,
        "name": (name or "").strip() or "Anonymous Citizen",
        "email": (email or "").strip() or None,
        "mobile": (mobile or "").strip() or None,
        "service_id": payload.service_id or "general",
        "service_name": service_name,
        "feedback_type": payload.feedback_type,
        "rating": payload.rating,
        "message": payload.message.strip(),
        "status": "NEW",
        "admin_notes": None,
        "created_at": now,
        "updated_at": None
    }

    db.feedbacks[fb_id] = fb_record

    # Add audit log
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": user_id or "anonymous",
        "actor_role": "citizen" if user_id else "anonymous",
        "action": "SUBMIT_FEEDBACK",
        "entity_type": "feedback",
        "entity_id": fb_id,
        "created_at": now
    })

    return FeedbackResponse(**fb_record)


@router.get("/admin/feedback", response_model=List[FeedbackResponse], dependencies=[Depends(require_role(["admin"]))])
def list_admin_feedbacks(
    status: Optional[str] = Query(None, description="Filter by status (NEW, REVIEWED, RESOLVED, ARCHIVED)"),
    feedback_type: Optional[str] = Query(None, description="Filter by feedback type"),
    rating: Optional[int] = Query(None, ge=1, le=5, description="Filter by exact rating"),
    service_id: Optional[str] = Query(None, description="Filter by service"),
    search: Optional[str] = Query(None, description="Search citizen name, email, or message")
):
    """
    Admin endpoint to list and filter all citizen feedback records.
    """
    items = list(db.feedbacks.values())

    if status and status != "all":
        items = [i for i in items if i.get("status") == status]

    if feedback_type and feedback_type != "all":
        items = [i for i in items if i.get("feedback_type") == feedback_type]

    if rating and rating > 0:
        items = [i for i in items if i.get("rating") == rating]

    if service_id and service_id != "all":
        items = [i for i in items if i.get("service_id") == service_id]

    if search:
        s_lower = search.lower().strip()
        items = [
            i for i in items
            if s_lower in (i.get("name") or "").lower()
            or s_lower in (i.get("email") or "").lower()
            or s_lower in (i.get("mobile") or "").lower()
            or s_lower in (i.get("message") or "").lower()
            or s_lower in (i.get("service_name") or "").lower()
        ]

    # Sort newest first
    items.sort(key=lambda x: x.get("created_at") or datetime.min, reverse=True)
    return items


@router.get("/admin/feedback/{feedback_id}", response_model=FeedbackResponse, dependencies=[Depends(require_role(["admin"]))])
def get_feedback_detail(feedback_id: str):
    """
    Get detailed view of a single feedback.
    """
    fb = db.feedbacks.get(feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return fb


@router.patch("/admin/feedback/{feedback_id}", response_model=FeedbackResponse, dependencies=[Depends(require_role(["admin"]))])
def update_feedback_status(
    feedback_id: str,
    payload: FeedbackStatusUpdate,
    current_user: dict = Depends(require_role(["admin"]))
):
    """
    Admin updates feedback status (NEW, REVIEWED, RESOLVED, ARCHIVED) and adds internal admin notes.
    """
    fb = db.feedbacks.get(feedback_id)
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")

    valid_statuses = ["NEW", "REVIEWED", "RESOLVED", "ARCHIVED"]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    now = datetime.now(timezone.utc)
    fb["status"] = payload.status
    if payload.admin_notes is not None:
        fb["admin_notes"] = payload.admin_notes
    fb["updated_at"] = now

    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "admin",
        "action": f"UPDATE_FEEDBACK_STATUS_{payload.status}",
        "entity_type": "feedback",
        "entity_id": feedback_id,
        "created_at": now
    })

    return FeedbackResponse(**fb)
