import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import CreatePaymentIntentRequest, PaymentIntentResponse
from formseva_app.core.supabase_client import get_supabase_admin_client
from formseva_app.core.security import get_current_user
from formseva_app.core.config import settings

router = APIRouter(prefix="/payments", tags=["Stripe Payments"])

def get_db():
    client = get_supabase_admin_client()
    if not client:
        raise HTTPException(status_code=500, detail="Database connection failed")
    return client

@router.post("/create-intent", response_model=PaymentIntentResponse)
def create_payment_intent(payload: CreatePaymentIntentRequest, current_user: dict = Depends(get_current_user)):
    supabase = get_db()
    res = supabase.table("form_submissions").select("*").eq("id", payload.submission_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub = res.data[0]
    
    amount_inr = float(sub.get("total_fee", 99.0))
    payment_id = str(uuid.uuid4())
    mock_pi_id = f"pi_mock_{payment_id[:8]}"
    mock_client_secret = f"{mock_pi_id}_secret_{uuid.uuid4().hex[:16]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    payment_record = {
        "id": payment_id,
        "submission_id": sub["id"],
        "user_id": current_user["id"],
        "stripe_payment_intent_id": mock_pi_id,
        "stripe_client_secret": mock_client_secret,
        "amount_inr": amount_inr,
        "currency": "inr",
        "status": "created",
        "payment_method": "card",
        "created_at": now_iso,
        "updated_at": now_iso
    }
    
    supabase.table("payments").insert(payment_record).execute()
    
    return PaymentIntentResponse(
        client_secret=mock_client_secret,
        payment_intent_id=mock_pi_id,
        amount_inr=amount_inr,
        currency="inr",
        status="created"
    )

@router.post("/confirm-mock/{payment_intent_id}")
def confirm_payment(payment_intent_id: str, current_user: dict = Depends(get_current_user)):
    supabase = get_db()
    res = supabase.table("payments").select("*").or_(f"stripe_payment_intent_id.eq.{payment_intent_id},id.eq.{payment_intent_id}").execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Payment record not found")
    payment = res.data[0]
    
    if payment["user_id"] != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to confirm this payment")
        
    if payment["status"] == "succeeded":
        return {"message": "Payment already confirmed"}
        
    now_iso = datetime.now(timezone.utc).isoformat()
    supabase.table("payments").update({"status": "succeeded", "updated_at": now_iso}).eq("id", payment["id"]).execute()
    
    supabase.table("form_submissions").update({"payment_status": "paid", "updated_at": now_iso}).eq("id", payment["submission_id"]).execute()
    
    notif_id = str(uuid.uuid4())
    notif = {
        "id": notif_id,
        "user_id": payment["user_id"],
        "submission_id": payment["submission_id"],
        "title_gu": "ચૂકવણી સફળ",
        "title_hi": "भुगतान सफल",
        "title_en": "Payment Successful",
        "message_gu": f"તમારી અરજી માટે ₹{payment['amount_inr']} ની ફી સફળતાપૂર્વક ચૂકવવામાં આવી છે.",
        "message_hi": f"आपके आवेदन के लिए ₹{payment['amount_inr']} का शुल्क सफलतापूर्वक भुगतान किया गया है।",
        "message_en": f"Fee of ₹{payment['amount_inr']} for your application has been successfully paid.",
        "notification_type": "payment_success",
        "is_read": False,
        "created_at": now_iso
    }
    supabase.table("notifications").insert(notif).execute()
    
    audit = {
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": current_user.get("role", "citizen"),
        "action": "PAYMENT_CONFIRMED",
        "entity_type": "payments",
        "entity_id": payment["id"],
        "new_state": {"status": "succeeded"},
        "created_at": now_iso
    }
    supabase.table("audit_log").insert(audit).execute()
    
    return {"message": "Payment confirmed successfully", "payment_id": payment["id"]}
