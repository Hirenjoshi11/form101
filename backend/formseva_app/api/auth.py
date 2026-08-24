import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import AuthRequest, AuthResponse
from formseva_app.core.database import db
from formseva_app.core.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=AuthResponse)
def login_or_register(payload: AuthRequest):
    """
    One-tap OAuth / Magic Link login simulation for Citizen, Operator, or Admin.
    No password field needed. Creates profile if citizen doesn't exist.
    """
    email = payload.email.lower().strip()
    role = payload.role.lower()

    if role == "admin":
        admin = next((a for a in db.admins.values() if a["email"].lower() == email), None)
        if not admin:
            # Register or bootstrap admin
            admin_id = str(uuid.uuid4())
            admin = {
                "id": admin_id,
                "full_name": payload.full_name or "Gujarat Seva Admin",
                "email": email,
                "role": "super_admin",
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            db.admins[admin_id] = admin
        
        token_payload = {
            "sub": admin["id"],
            "id": admin["id"],
            "email": admin["email"],
            "full_name": admin["full_name"],
            "role": "admin"
        }
        token = create_access_token(token_payload)
        return AuthResponse(access_token=token, user=token_payload)

    elif role == "operator":
        operator = next((o for o in db.operators.values() if o["email"].lower() == email), None)
        if not operator:
            raise HTTPException(status_code=404, detail="Operator account not found. Please contact Admin to create an operator profile.")
        
        token_payload = {
            "sub": operator["id"],
            "id": operator["id"],
            "email": operator["email"],
            "full_name": operator["full_name"],
            "district": operator["district"],
            "role": "operator"
        }
        token = create_access_token(token_payload)
        return AuthResponse(access_token=token, user=token_payload)

    else: # Citizen
        user = next((u for u in db.users.values() if u["email"].lower() == email), None)
        if not user:
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "full_name": payload.full_name or email.split("@")[0].capitalize(),
                "email": email,
                "phone": payload.phone or "",
                "preferred_language": "gu",
                "role": "citizen",
                "created_at": datetime.now(timezone.utc)
            }
            db.users[user_id] = user
        
        token_payload = {
            "sub": user["id"],
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user.get("phone", ""),
            "role": "citizen",
            "preferred_language": user.get("preferred_language", "gu")
        }
        token = create_access_token(token_payload)
        return AuthResponse(access_token=token, user=token_payload)

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
