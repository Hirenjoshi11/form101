import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import CreatePaymentIntentRequest, PaymentIntentResponse
from formseva_app.core.database import db
from formseva_app.core.security import get_current_user
from formseva_app.core.config import settings

router = APIRouter(prefix="/payments", tags=["Stripe Payments"])

@router.post("/create-intent", response_model=PaymentIntentResponse)
def create_payment_intent(payload: CreatePaymentIntentRequest, current_user: dict = Depends(get_current_user)):
    """
    Creates a Stripe PaymentIntent for the certificate submission.
    Calculates amount in INR and creates a linked payment record.
    """
    sub = db.submissions.get(payload.submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    amount_inr = float(sub.get("total_fee", 99.0))
    payment_id = str(uuid.uuid4())
    mock_pi_id = f"pi_mock_{payment_id[:8]}"
    mock_client_secret = f"{mock_pi_id}_secret_{uuid.uuid4().hex[:16]}"
    
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
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    db.payments[payment_id] = payment_record
    
    return PaymentIntentResponse(
        client_secret=mock_client_secret,
        payment_intent_id=mock_pi_id,
        amount_inr=amount_inr,
        currency="inr",
        status="created"
    )

@router.post("/confirm-mock/{payment_intent_id}")
def confirm_payment(payment_intent_id: str, current_user: dict = Depends(get_current_user)):
    """
    Confirm payment completion (simulating Stripe Webhook / client confirmation).
    Updates submission status to 'paid' and notifies citizen.
    """
    payment = next((p for p in db.payments.values() if p.get("stripe_payment_intent_id") == payment_intent_id or p.get("id") == payment_intent_id), None)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    payment["status"] = "succeeded"
    payment["updated_at"] = datetime.now(timezone.utc)
    
    sub = db.submissions.get(payment["submission_id"])
    if sub:
        sub["payment_status"] = "paid"
        sub["updated_at"] = datetime.now(timezone.utc)
        
        # Add success notification
        notif_id = str(uuid.uuid4())
        db.notifications[notif_id] = {
            "id": notif_id,
            "user_id": sub["user_id"],
            "submission_id": sub["id"],
            "title_gu": "પેમેન્ટ સફળ રહ્યું",
            "title_hi": "भुगतान सफल रहा",
            "title_en": "Payment Successful",
            "message_gu": f"રૂ. {payment['amount_inr']} નું પેમેન્ટ સફળતાપૂર્વક મળેલ છે. ઓપરેટર હવે તમારી સરકારી ફાઈલિંગ કરશે.",
            "message_hi": f"रु. {payment['amount_inr']} का भुगतान सफल रहा।",
            "message_en": f"Payment of INR {payment['amount_inr']} was successful. Your operator is now filing the application.",
            "notification_type": "payment_success",
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        }
        
    db.audit_logs.append({
        "id": str(uuid.uuid4()),
        "actor_id": current_user["id"],
        "actor_role": "citizen",
        "action": "PAYMENT_SUCCESS",
        "entity_type": "payments",
        "entity_id": payment["id"],
        "new_state": {"amount": payment["amount_inr"], "status": "succeeded"},
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Payment confirmed successfully", "payment": payment}
