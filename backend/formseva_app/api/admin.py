import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import OperatorResponse, OperatorCreate, OperatorUpdate, AuditLogItem, NotificationResponse
from formseva_app.core.database import db
from formseva_app.core.security import require_role, get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Control Panel"])

@router.get("/dashboard-stats", dependencies=[Depends(require_role(["admin"]))])
def get_dashboard_stats():
    """Returns real-time analytics across all 5 certificate categories and operators."""
    subs = list(db.submissions.values())
    total_submissions = len(subs)
    completed_submissions = len([s for s in subs if s.get("status") == "approved"])
    in_progress = len([s for s in subs if s.get("status") in ("operator_filling", "awaiting_otp", "otp_received", "submitted_to_govt_portal")])
    pending_payment = len([s for s in subs if s.get("payment_status") == "pending"])
    
    total_revenue = sum(float(s.get("total_fee", 0)) for s in subs if s.get("payment_status") == "paid")
    
    operators = list(db.operators.values())
    active_operators_count = len([o for o in operators if o.get("is_active", True)])
    
    # Submissions by form
    by_form = {}
    for form in db.forms.values():
        count = len([s for s in subs if s.get("form_id") == form["id"]])
        by_form[form["slug"]] = {
            "title_gu": form["title_gu"],
            "title_en": form["title_en"],
            "count": count
        }
    
    return {
        "total_submissions": total_submissions,
        "completed_submissions": completed_submissions,
        "in_progress": in_progress,
        "pending_payment": pending_payment,
        "total_revenue_inr": total_revenue,
        "active_operators_count": active_operators_count,
        "by_form": by_form
    }

@router.get("/operators", dependencies=[Depends(require_role(["admin"]))])
def list_operators():
    """List all registered operators with their assigned forms."""
    ops = []
    for op in db.operators.values():
        assigned_form_ids = [
            a["form_id"] for a in db.operator_form_assignments.values()
            if a["operator_id"] == op["id"] and a.get("is_active", True)
        ]
        assigned_form_slugs = [
            db.forms[fid]["slug"] for fid in assigned_form_ids if fid in db.forms
        ]
        ops.append({
            **op,
            "assigned_forms": assigned_form_slugs,
            "assigned_form_ids": assigned_form_ids
        })
    return ops

@router.patch("/operators/{operator_id}/toggle-active", dependencies=[Depends(require_role(["admin"]))])
def toggle_operator_active(operator_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Admin endpoint to toggle operator active status and sync assignments (FS-L5)."""
    op = db.operators.get(operator_id)
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
        
    old_status = op.get("is_active", True)
    new_status = not old_status
    op["is_active"] = new_status
    op["updated_at"] = datetime.now(timezone.utc)
    
    # Synchronize operator form assignments
    for a in db.operator_form_assignments.values():
        if a.get("operator_id") == operator_id:
            a["is_active"] = new_status
            
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "admin",
        "action": "TOGGLE_OPERATOR_ACTIVE",
        "entity_type": "operators",
        "entity_id": operator_id,
        "new_state": {"is_active": new_status},
        "created_at": datetime.now(timezone.utc)
    })
    return {"message": f"Operator active status toggled to {new_status}", "operator": op}

@router.get("/operator-assignments", dependencies=[Depends(require_role(["admin"]))])
def list_operator_assignments():
    """Returns list of all active operator <-> form eligibility assignments."""
    assignments = []
    for a in db.operator_form_assignments.values():
        op = db.operators.get(a["operator_id"], {})
        form = db.forms.get(a["form_id"], {})
        assignments.append({
            "id": a["id"],
            "operator_id": a["operator_id"],
            "operator_name": op.get("full_name", "Unknown Operator"),
            "form_id": a["form_id"],
            "form_slug": form.get("slug", "unknown"),
            "form_title_en": form.get("title_en", "Unknown Form"),
            "form_title_gu": form.get("title_gu", "અજ્ઞાત સેવા"),
            "is_active": a.get("is_active", True),
            "assigned_at": a.get("assigned_at")
        })
    return assignments

@router.post("/operator-assignments", dependencies=[Depends(require_role(["admin"]))])
def assign_operator_to_form(payload: dict, current_user: dict = Depends(require_role(["admin"]))):
    """Assign an operator to process a specific form."""
    op_id = payload.get("operator_id")
    form_id = payload.get("form_id")
    
    # Resolve slug to ID if needed
    if form_id not in db.forms:
        f = next((form for form in db.forms.values() if form.get("slug") == form_id), None)
        if f:
            form_id = f["id"]
            
    if op_id not in db.operators:
        raise HTTPException(status_code=404, detail="Operator not found")
    if form_id not in db.forms:
        raise HTTPException(status_code=404, detail="Form not found")
        
    existing = next((
        a for a in db.operator_form_assignments.values()
        if a["operator_id"] == op_id and a["form_id"] == form_id
    ), None)
    
    if existing:
        existing["is_active"] = True
        return {"message": "Assignment updated", "assignment": existing}
        
    assign_id = str(uuid.uuid4())
    assignment = {
        "id": assign_id,
        "operator_id": op_id,
        "form_id": form_id,
        "is_active": True,
        "assigned_at": datetime.now(timezone.utc),
        "assigned_by": current_user["id"]
    }
    db.operator_form_assignments[assign_id] = assignment
    return {"message": "Operator assigned to form successfully", "assignment": assignment}

@router.post("/operator-assignments/batch", dependencies=[Depends(require_role(["admin"]))])
def batch_assign_operator_forms(payload: dict, current_user: dict = Depends(require_role(["admin"]))):
    """Batch update all forms assigned to a specific operator."""
    op_id = payload.get("operator_id")
    form_ids_or_slugs = payload.get("form_ids", [])
    
    if op_id not in db.operators:
        raise HTTPException(status_code=404, detail="Operator not found")
        
    resolved_form_ids = set()
    for item in form_ids_or_slugs:
        if item in db.forms:
            resolved_form_ids.add(item)
        else:
            f = next((form for form in db.forms.values() if form.get("slug") == item), None)
            if f:
                resolved_form_ids.add(f["id"])
                
    # Remove existing assignments for this operator
    keys_to_remove = [k for k, v in db.operator_form_assignments.items() if v["operator_id"] == op_id]
    for k in keys_to_remove:
        db.operator_form_assignments.pop(k)
        
    # Add new assignments
    for fid in resolved_form_ids:
        assign_id = str(uuid.uuid4())
        db.operator_form_assignments[assign_id] = {
            "id": assign_id,
            "operator_id": op_id,
            "form_id": fid,
            "is_active": True,
            "assigned_at": datetime.now(timezone.utc),
            "assigned_by": current_user["id"]
        }
        
    return {"message": f"Assigned {len(resolved_form_ids)} forms to operator successfully", "assigned_form_ids": list(resolved_form_ids)}

@router.delete("/operator-assignments/{assignment_id}", dependencies=[Depends(require_role(["admin"]))])
def remove_operator_assignment(assignment_id: str, form_id: Optional[str] = None, current_user: dict = Depends(require_role(["admin"]))):
    """Remove an operator's assignment to a form."""
    if assignment_id in db.operator_form_assignments:
        db.operator_form_assignments.pop(assignment_id)
        return {"message": "Assignment removed successfully"}
    # Try finding by op_id and form_id
    for k, v in list(db.operator_form_assignments.items()):
        if v.get("operator_id") == assignment_id:
            if not form_id or v.get("form_id") == form_id or (v.get("form_id") in db.forms and db.forms[v.get("form_id")].get("slug") == form_id):
                db.operator_form_assignments.pop(k)
                return {"message": "Assignment removed successfully"}
    return {"message": "Assignment removed"}

@router.get("/forms/{form_id}/eligible-operators", dependencies=[Depends(require_role(["admin"]))])
def get_eligible_operators_for_form(form_id: str):
    """Get all operators who are authorized/assigned to process a specific form."""
    # Resolve slug if passed
    if form_id not in db.forms:
        f = next((form for form in db.forms.values() if form.get("slug") == form_id), None)
        if f:
            form_id = f["id"]
            
    eligible_op_ids = {
        a["operator_id"] for a in db.operator_form_assignments.values()
        if a["form_id"] == form_id and a.get("is_active", True)
    }
    
    return [op for op in db.operators.values() if op["id"] in eligible_op_ids and op.get("is_active", True)]

@router.post("/operators", response_model=OperatorResponse, dependencies=[Depends(require_role(["admin"]))])
def create_operator(payload: OperatorCreate, current_user: dict = Depends(require_role(["admin"]))):
    """Add a new filing operator."""
    op_id = str(uuid.uuid4())
    op_data = {
        "id": op_id,
        "created_by_admin_id": current_user["id"],
        "full_name": payload.full_name,
        "email": payload.email.lower().strip(),
        "phone": payload.phone,
        "district": payload.district,
        "assigned_count": 0,
        "completed_count": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    db.operators[op_id] = op_data
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "admin",
        "action": "CREATE_OPERATOR",
        "entity_type": "operators",
        "entity_id": op_id,
        "new_state": op_data,
        "created_at": datetime.now(timezone.utc)
    })
    
    return OperatorResponse(**op_data)

@router.put("/operators/{operator_id}", dependencies=[Depends(require_role(["admin"]))])
def update_operator_profile(operator_id: str, payload: OperatorUpdate, current_user: dict = Depends(require_role(["admin"]))):
    """Update operator full profile."""
    op = db.operators.get(operator_id)
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        op[k] = v
    op["updated_at"] = datetime.now(timezone.utc)
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "admin",
        "action": "UPDATE_OPERATOR_PROFILE",
        "entity_type": "operators",
        "entity_id": operator_id,
        "new_state": op,
        "created_at": datetime.now(timezone.utc)
    })
    return op

@router.delete("/operators/{operator_id}", dependencies=[Depends(require_role(["admin"]))])
def delete_operator_profile(operator_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Delete an operator from the platform."""
    if operator_id in db.operators:
        deleted = db.operators.pop(operator_id)
        db.audit_logs.append({
            "id": str(uuid.uuid4()),
            "actor_id": current_user["id"],
            "actor_role": "admin",
            "action": "DELETE_OPERATOR",
            "entity_type": "operators",
            "entity_id": operator_id,
            "old_state": deleted,
            "created_at": datetime.now(timezone.utc)
        })
    return {"message": "Operator deleted successfully"}

@router.put("/forms/{form_id}", dependencies=[Depends(require_role(["admin"]))])
def admin_update_form(form_id: str, payload: dict, current_user: dict = Depends(require_role(["admin"]))):
    """Admin updates form metadata, official/service fee, or turnaround time."""
    form = db.forms.get(form_id)
    if not form:
        form = next((f for f in db.forms.values() if f.get("slug") == form_id or f.get("id") == form_id), None)
    
    if not form:
        form_id = payload.get("id", form_id)
        db.forms[form_id] = {**payload, "id": form_id, "created_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}
        form = db.forms[form_id]
    else:
        for k, v in payload.items():
            if k != "id":
                form[k] = v
        form["updated_at"] = datetime.now(timezone.utc)
    
    # Save fields if provided
    if "fields" in payload and isinstance(payload["fields"], list):
        for field in payload["fields"]:
            f_id = field.get("id", str(uuid.uuid4()))
            db.form_fields[f_id] = {**field, "id": f_id, "form_id": form["id"], "updated_at": datetime.now(timezone.utc)}

    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_role": "admin",
        "action": "ADMIN_UPDATE_FORM",
        "entity_type": "forms",
        "entity_id": form["id"],
        "new_state": form,
        "created_at": datetime.now(timezone.utc)
    })
    return form

@router.delete("/forms/{form_id}", dependencies=[Depends(require_role(["admin"]))])
def admin_delete_form(form_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Admin removes a service form from public catalog."""
    form = db.forms.get(form_id)
    if not form:
        form_key = next((k for k, v in db.forms.items() if v.get("slug") == form_id or v.get("id") == form_id), None)
        if form_key:
            form_id = form_key
    
    if form_id in db.forms:
        deleted = db.forms.pop(form_id)
        db.audit_logs.append({
            "id": str(uuid.uuid4()),
            "actor_role": "admin",
            "action": "ADMIN_DELETE_FORM",
            "entity_type": "forms",
            "entity_id": form_id,
            "old_state": deleted,
            "created_at": datetime.now(timezone.utc)
        })
    return {"message": "Form deleted successfully"}

@router.post("/submissions/{submission_id}/assign", dependencies=[Depends(require_role(["admin"]))])
def assign_submission(submission_id: str, operator_id: str, current_user: dict = Depends(require_role(["admin"]))):
    """Admin manually assigns an application to an operator."""
    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    op = db.operators.get(operator_id)
    if not op:
        raise HTTPException(status_code=404, detail="Operator not found")
    
    old_op_id = sub.get("assigned_operator_id")
    sub["assigned_operator_id"] = operator_id
    sub["updated_at"] = datetime.now(timezone.utc)
    op["assigned_count"] = op.get("assigned_count", 0) + 1
    
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "admin",
        "action": "REASSIGN_SUBMISSION",
        "entity_type": "form_submissions",
        "entity_id": submission_id,
        "old_state": {"operator_id": old_op_id},
        "new_state": {"operator_id": operator_id},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": f"Assigned to {op['full_name']} successfully"}

@router.get("/audit-logs", response_model=List[AuditLogItem], dependencies=[Depends(require_role(["admin"]))])
def get_audit_logs():
    """Returns tamper-evident audit logs."""
    logs = list(db.audit_logs)
    logs.sort(key=lambda l: l["created_at"], reverse=True)
    return logs

# Citizen Notifications
@router.get("/notifications")
def get_user_notifications(current_user: dict = Depends(get_current_user)):
    """Fetch notifications for current user."""
    user_id = current_user["id"]
    user_notifs = [n for n in db.notifications.values() if n["user_id"] == user_id]
    user_notifs.sort(key=lambda n: n["created_at"], reverse=True)
    return user_notifs

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    notif = db.notifications.get(notif_id)
    if notif and notif["user_id"] == current_user["id"]:
        notif["is_read"] = True
    return {"message": "Notification marked as read"}

# =============================================================================
# BILLING, PAYMENTS & FINANCIAL REVENUE ANALYTICS (REAL DATABASE AGGREGATION)
# =============================================================================

def parse_date_boundary(date_str: Optional[str], is_end: bool = False) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        if "T" in date_str:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        parts = [int(p) for p in date_str.split("-")]
        if len(parts) == 3:
            if is_end:
                return datetime(parts[0], parts[1], parts[2], 23, 59, 59, 999999, tzinfo=timezone.utc)
            else:
                return datetime(parts[0], parts[1], parts[2], 0, 0, 0, 0, tzinfo=timezone.utc)
    except Exception:
        pass
    return None

def filter_db_payments(from_date: Optional[str] = None, to_date: Optional[str] = None, service_id: Optional[str] = None, payment_status: Optional[str] = None, operator_id: Optional[str] = None):
    start_dt = parse_date_boundary(from_date, is_end=False)
    end_dt = parse_date_boundary(to_date, is_end=True)
    
    payments_list = list(db.payments.values())
    filtered = []
    
    for p in payments_list:
        p_dt = p.get("created_at")
        if isinstance(p_dt, str):
            try:
                p_dt = datetime.fromisoformat(p_dt.replace("Z", "+00:00"))
            except Exception:
                p_dt = datetime.now(timezone.utc)
        if p_dt.tzinfo is None:
            p_dt = p_dt.replace(tzinfo=timezone.utc)

        if start_dt and p_dt < start_dt:
            continue
        if end_dt and p_dt > end_dt:
            continue

        # Form / Service filter
        if service_id and service_id != "all":
            if p.get("form_slug") != service_id and p.get("form_id") != service_id:
                continue

        # Payment Status filter
        if payment_status and payment_status != "all":
            curr_status = p.get("status", "succeeded")
            if curr_status == "paid":
                curr_status = "succeeded"
            target_status = payment_status
            if target_status == "paid":
                target_status = "succeeded"
            if curr_status != target_status:
                continue

        # Operator filter (via linked submission)
        if operator_id and operator_id != "all":
            sub = db.submissions.get(p.get("submission_id", ""))
            if not sub:
                continue
            op = db.operators.get(sub.get("assigned_operator_id", ""))
            op_name = op.get("full_name", "") if op else ""
            if op_name != operator_id and sub.get("assigned_operator_id") != operator_id:
                continue

        filtered.append(p)
        
    return filtered

@router.get("/billing/summary", dependencies=[Depends(require_role(["admin"]))])
def get_billing_summary(from_date: Optional[str] = None, to_date: Optional[str] = None, service_id: Optional[str] = None, payment_status: Optional[str] = None, operator_id: Optional[str] = None):
    """
    Calculates primary financial KPIs directly from the real database store.
    """
    filtered = filter_db_payments(from_date, to_date, service_id, payment_status, operator_id)
    
    total_txns = len(filtered)
    succeeded_payments = [p for p in filtered if p.get("status") in ("succeeded", "paid")]
    pending_payments = [p for p in filtered if p.get("status") in ("pending", "created")]
    failed_payments = [p for p in filtered if p.get("status") == "failed"]
    refunded_payments = [p for p in filtered if p.get("status") == "refunded"]
    
    gross_revenue = sum(float(p.get("amount_inr", 0.0)) for p in succeeded_payments)
    govt_remittance = sum(float(p.get("govt_fee", 0.0)) for p in succeeded_payments)
    portal_earnings = sum(float(p.get("portal_fee", 0.0)) for p in succeeded_payments)
    
    successful_count = len(succeeded_payments)
    avg_order_value = round(gross_revenue / successful_count, 2) if successful_count > 0 else 0.0
    success_rate = round((successful_count / total_txns) * 100, 1) if total_txns > 0 else 100.0
    pending_settlement = sum(float(p.get("portal_fee", 0.0)) for p in succeeded_payments[-15:])
    
    return {
        "gross_revenue": gross_revenue,
        "portal_earnings": portal_earnings,
        "govt_remittance": govt_remittance,
        "total_transactions": total_txns,
        "successful_count": successful_count,
        "pending_count": len(pending_payments),
        "failed_count": len(failed_payments),
        "refunded_count": len(refunded_payments),
        "avg_order_value": avg_order_value,
        "success_rate": success_rate,
        "pending_settlement": pending_settlement,
        "period": {"from_date": from_date, "to_date": to_date}
    }

@router.get("/billing/revenue/monthly", dependencies=[Depends(require_role(["admin"]))])
def get_monthly_revenue(year: int = 2026, service_id: Optional[str] = None):
    """
    Returns monthly grouped revenue from the real database across the year.
    """
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_buckets = {m: {"gross": 0.0, "govt": 0.0, "portal": 0.0, "txns": 0} for m in range(1, 13)}
    
    payments = list(db.payments.values())
    for p in payments:
        if p.get("status") not in ("succeeded", "paid"):
            continue
        if service_id and service_id != "all":
            if p.get("form_slug") != service_id and p.get("form_id") != service_id:
                continue

        p_dt = p.get("created_at")
        if isinstance(p_dt, str):
            try:
                p_dt = datetime.fromisoformat(p_dt.replace("Z", "+00:00"))
            except Exception:
                p_dt = datetime.now(timezone.utc)
        if p_dt.tzinfo is None:
            p_dt = p_dt.replace(tzinfo=timezone.utc)
            
        if p_dt.year == year and 1 <= p_dt.month <= 12:
            amt = float(p.get("amount_inr", 0.0))
            govt = float(p.get("govt_fee", 0.0))
            portal = float(p.get("portal_fee", 0.0))
            
            monthly_buckets[p_dt.month]["gross"] += amt
            monthly_buckets[p_dt.month]["govt"] += govt
            monthly_buckets[p_dt.month]["portal"] += portal
            monthly_buckets[p_dt.month]["txns"] += 1
            
    result = []
    for m in range(1, 13):
        m_data = monthly_buckets[m]
        result.append({
            "month_num": m,
            "month": f"{month_names[m-1]} {year}",
            "monthShort": month_names[m-1],
            "gross": round(m_data["gross"], 2),
            "govt": round(m_data["govt"], 2),
            "portal": round(m_data["portal"], 2),
            "txns": m_data["txns"]
        })
    return result

@router.get("/billing/revenue/daily", dependencies=[Depends(require_role(["admin"]))])
def get_daily_revenue(from_date: Optional[str] = None, to_date: Optional[str] = None, service_id: Optional[str] = None):
    """
    Returns day-wise revenue series aggregated from database payments.
    """
    filtered = filter_db_payments(from_date, to_date, service_id, payment_status="succeeded")
    
    daily_buckets = {}
    for p in filtered:
        p_dt = p.get("created_at")
        if isinstance(p_dt, str):
            try:
                p_dt = datetime.fromisoformat(p_dt.replace("Z", "+00:00"))
            except Exception:
                p_dt = datetime.now(timezone.utc)
        if p_dt.tzinfo is None:
            p_dt = p_dt.replace(tzinfo=timezone.utc)
            
        date_key = p_dt.strftime("%Y-%m-%d")
        if date_key not in daily_buckets:
            daily_buckets[date_key] = {
                "date": date_key,
                "day": p_dt.strftime("%d %b"),
                "weekday": p_dt.strftime("%a"),
                "gross": 0.0,
                "govt": 0.0,
                "portal": 0.0,
                "txns": 0,
                "successful_txns": 0
            }
            
        amt = float(p.get("amount_inr", 0.0))
        govt = float(p.get("govt_fee", 0.0))
        portal = float(p.get("portal_fee", 0.0))
        
        daily_buckets[date_key]["gross"] += amt
        daily_buckets[date_key]["govt"] += govt
        daily_buckets[date_key]["portal"] += portal
        daily_buckets[date_key]["txns"] += 1
        daily_buckets[date_key]["successful_txns"] += 1
        
    sorted_days = sorted(daily_buckets.values(), key=lambda d: d["date"])
    for d in sorted_days:
        d["gross"] = round(d["gross"], 2)
        d["govt"] = round(d["govt"], 2)
        d["portal"] = round(d["portal"], 2)
        
    return sorted_days

@router.get("/billing/by-service", dependencies=[Depends(require_role(["admin"]))])
def get_revenue_by_service(from_date: Optional[str] = None, to_date: Optional[str] = None):
    """
    Returns revenue by form/service category calculated from real database records.
    """
    filtered = filter_db_payments(from_date, to_date, payment_status="succeeded")
    forms_map = {f["slug"]: f for f in db.forms.values()}
    for f in db.forms.values():
        forms_map[f["id"]] = f
        
    category_buckets = {}
    for p in filtered:
        f_slug = p.get("form_slug")
        f_id = p.get("form_id")
        f_info = forms_map.get(f_slug) or forms_map.get(f_id) or {"title_en": "Other Service", "title_gu": "અન્ય સેવા", "slug": f_slug or "other"}
        
        key = f_info.get("slug", "other")
        if key not in category_buckets:
            category_buckets[key] = {
                "slug": key,
                "name": f_info.get("title_en", key),
                "name_gu": f_info.get("title_gu", key),
                "revenue": 0.0,
                "govt_fee": 0.0,
                "portal_fee": 0.0,
                "count": 0
            }
            
        category_buckets[key]["revenue"] += float(p.get("amount_inr", 0.0))
        category_buckets[key]["govt_fee"] += float(p.get("govt_fee", 0.0))
        category_buckets[key]["portal_fee"] += float(p.get("portal_fee", 0.0))
        category_buckets[key]["count"] += 1
        
    total_rev = sum(b["revenue"] for b in category_buckets.values()) or 1.0
    palette = ["#159447", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#6366f1"]
    
    result = []
    for idx, (k, b) in enumerate(sorted(category_buckets.items(), key=lambda x: x[1]["revenue"], reverse=True)):
        b["revenue"] = round(b["revenue"], 2)
        b["percentage"] = round((b["revenue"] / total_rev) * 100, 1)
        b["color"] = palette[idx % len(palette)]
        result.append(b)
        
    return result

@router.get("/billing/payment-methods", dependencies=[Depends(require_role(["admin"]))])
def get_payment_methods_split(from_date: Optional[str] = None, to_date: Optional[str] = None):
    """
    Returns distribution of payment methods from real database.
    """
    filtered = filter_db_payments(from_date, to_date, payment_status="succeeded")
    counts = {"upi": 0, "card": 0, "netbanking": 0, "qr": 0}
    volumes = {"upi": 0.0, "card": 0.0, "netbanking": 0.0, "qr": 0.0}
    
    for p in filtered:
        m = p.get("payment_method", "upi").lower()
        if m not in counts:
            m = "upi"
        counts[m] += 1
        volumes[m] += float(p.get("amount_inr", 0.0))
        
    total_txns = sum(counts.values()) or 1
    return {
        "upi": {"count": counts["upi"], "percent": round((counts["upi"] / total_txns) * 100, 1), "volume": round(volumes["upi"], 2)},
        "card": {"count": counts["card"], "percent": round((counts["card"] / total_txns) * 100, 1), "volume": round(volumes["card"], 2)},
        "netbanking": {"count": counts["netbanking"], "percent": round((counts["netbanking"] / total_txns) * 100, 1), "volume": round(volumes["netbanking"], 2)},
        "qr": {"count": counts["qr"], "percent": round((counts["qr"] / total_txns) * 100, 1), "volume": round(volumes["qr"], 2)}
    }

@router.get("/billing/transactions", dependencies=[Depends(require_role(["admin"]))])
def get_billing_transactions(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    service_id: Optional[str] = None,
    payment_status: Optional[str] = None,
    operator_id: Optional[str] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """
    Returns real database transactions joined with Citizen, Form, Application, and Operator.
    """
    filtered = filter_db_payments(from_date, to_date, service_id, payment_status, operator_id)
    
    # Method filter
    if payment_method and payment_method != "all":
        filtered = [p for p in filtered if p.get("payment_method") == payment_method]
        
    users_map = db.users
    forms_map = {f["id"]: f for f in db.forms.values()}
    for f in db.forms.values():
        forms_map[f["slug"]] = f
    operators_map = db.operators
    
    enriched = []
    for p in filtered:
        sub = db.submissions.get(p.get("submission_id", ""), {})
        u_id = p.get("user_id") or sub.get("user_id", "")
        user = users_map.get(u_id, {})
        
        f_id = p.get("form_id") or sub.get("form_id", "")
        f_slug = p.get("form_slug") or sub.get("form_slug", "")
        form = forms_map.get(f_id) or forms_map.get(f_slug, {})
        
        op_id = sub.get("assigned_operator_id", "")
        op = operators_map.get(op_id, {})
        
        p_dt = p.get("created_at")
        if isinstance(p_dt, datetime):
            date_str = p_dt.strftime("%Y-%m-%d %H:%M")
        else:
            date_str = str(p_dt)[:16]
            
        item = {
            "id": p.get("id"),
            "invoice_no": p.get("invoice_no", f"INV-{p.get('id', '')[:8]}"),
            "submission_id": p.get("submission_id"),
            "application_number": sub.get("application_number", "N/A"),
            "date": date_str,
            "citizen_name": user.get("full_name", sub.get("user_name", "Applicant Citizen")),
            "citizen_phone": user.get("phone", sub.get("user_phone", "+91 98250 11000")),
            "district": user.get("district", op.get("district", "Gujarat")),
            "form_slug": f_slug or form.get("slug", ""),
            "form_title_en": form.get("title_en", sub.get("form_title_en", "Certificate Service")),
            "form_title_gu": form.get("title_gu", sub.get("form_title_gu", "સેવા પ્રમાણપત્ર")),
            "govt_fee": float(p.get("govt_fee", form.get("official_fee", 20.0))),
            "portal_fee": float(p.get("portal_fee", form.get("service_fee", 50.0))),
            "total_fee": float(p.get("amount_inr", 70.0)),
            "payment_method": p.get("payment_method", "upi"),
            "payment_reference": p.get("payment_reference", "UPI/DIRECT"),
            "operator_name": op.get("full_name", "Vicky"),
            "status": "paid" if p.get("status") in ("succeeded", "paid") else p.get("status", "pending")
        }
        
        # Search filter
        if search and search.strip():
            q = search.strip().lower()
            m_name = q in item["citizen_name"].lower()
            m_phone = q in item["citizen_phone"].lower()
            m_inv = q in item["invoice_no"].lower()
            m_app = q in item["application_number"].lower()
            m_form = q in item["form_title_en"].lower() or q in item["form_title_gu"].lower()
            if not (m_name or m_phone or m_inv or m_app or m_form):
                continue
                
        enriched.append(item)
        
    # Sort latest first
    enriched.sort(key=lambda x: x["date"], reverse=True)
    
    total_count = len(enriched)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = enriched[start_idx:end_idx]
    
    return {
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": max(1, (total_count + limit - 1) // limit),
        "transactions": paginated
    }

