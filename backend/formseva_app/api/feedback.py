import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from formseva_app.models.schemas import FeedbackCreate, FeedbackResponse, FeedbackStatusUpdate
from formseva_app.core.supabase_client import get_supabase_admin_client
from formseva_app.core.security import require_role, get_current_user

router = APIRouter(tags=["Feedback & Citizen Reviews"])

def get_db():
    client = get_supabase_admin_client()
    if not client:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return client

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackCreate, current_user: Optional[dict] = Depends(get_current_user)):
    supabase = get_db()
    fb_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    
    service_name = "General Feedback"
    if payload.service_id and payload.service_id != "general":
        res_form = supabase.table("forms").select("*").or_(f"slug.eq.{payload.service_id},id.eq.{payload.service_id}").execute()
        if res_form.data:
            form = res_form.data[0]
            service_name = form.get("title_en", form.get("title_gu", payload.service_id))

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
        "created_at": now_iso,
        "updated_at": now_iso
    }

    supabase.table("feedbacks").insert(fb_record).execute()

    audit = {
        "id": str(uuid.uuid4()),
        "actor_id": user_id,
        "actor_role": current_user.get("role", "citizen") if current_user else "anonymous",
        "action": "SUBMIT_FEEDBACK",
        "entity_type": "feedbacks",
        "entity_id": fb_id,
        "created_at": now_iso
    }
    supabase.table("audit_log").insert(audit).execute()

    return fb_record

@router.get("/admin/feedback", response_model=List[FeedbackResponse], dependencies=[Depends(require_role(["admin"]))])
def get_all_feedback(
    status: Optional[str] = Query(None, description="Filter by status (NEW, REVIEWED, RESOLVED)"),
    service_id: Optional[str] = Query(None, description="Filter by service ID"),
    min_rating: Optional[int] = Query(None, description="Filter by minimum rating")
):
    supabase = get_db()
    query = supabase.table("feedbacks").select("*")
    
    if status:
        query = query.eq("status", status)
    if service_id:
        query = query.eq("service_id", service_id)
    if min_rating:
        query = query.gte("rating", min_rating)
        
    res = query.order("created_at", desc=True).execute()
    return res.data

@router.post("/admin/feedback/{feedback_id}/status", response_model=FeedbackResponse, dependencies=[Depends(require_role(["admin"]))])
def update_feedback_status(feedback_id: str, payload: FeedbackStatusUpdate, current_user: dict = Depends(require_role(["admin"]))):
    supabase = get_db()
    res = supabase.table("feedbacks").select("*").eq("id", feedback_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Feedback not found")
        
    fb = res.data[0]
    old_status = fb["status"]
    now_iso = datetime.now(timezone.utc).isoformat()
    
    update_data = {
        "status": payload.status,
        "updated_at": now_iso
    }
    if payload.admin_notes is not None:
        update_data["admin_notes"] = payload.admin_notes
        
    res_upd = supabase.table("feedbacks").update(update_data).eq("id", feedback_id).execute()
    fb.update(update_data)
    
    audit = {
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "admin"),
        "action": f"UPDATE_FEEDBACK_{payload.status.upper()}",
        "entity_type": "feedbacks",
        "entity_id": feedback_id,
        "old_state": {"status": old_status},
        "new_state": {"status": payload.status, "admin_notes": payload.admin_notes},
        "created_at": now_iso
    }
    supabase.table("audit_log").insert(audit).execute()
    
    return fb
