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

@router.post("/google", response_model=AuthResponse)
def google_auth_login(payload: dict):
    """
    Direct Google OAuth login callback/token handler.
    Authenticates user seamlessly without manual password entry.
    """
    email = payload.get("email", "").lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for Google authentication")
        
    full_name = payload.get("full_name") or email.split("@")[0].replace(".", " ").title()
    avatar_url = payload.get("avatar_url")
    phone = payload.get("phone", "")
    
    user = next((u for u in db.users.values() if u["email"].lower() == email), None)
    if not user:
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "avatar_url": avatar_url,
            "auth_provider": "google",
            "preferred_language": "gu",
            "role": "citizen",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        db.users[user_id] = user
    else:
        if phone and not user.get("phone"):
            user["phone"] = phone
            user["updated_at"] = datetime.now(timezone.utc)
            
    token_payload = {
        "sub": user["id"],
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user.get("phone", ""),
        "role": "citizen",
        "auth_provider": "google",
        "preferred_language": user.get("preferred_language", "gu")
    }
    token = create_access_token(token_payload)
    return AuthResponse(access_token=token, user=token_payload)

@router.put("/phone")
def update_citizen_phone(payload: dict, current_user: dict = Depends(get_current_user)):
    """Update citizen mobile number."""
    phone = payload.get("phone", "").strip()
    if not phone or len(phone) < 10:
        raise HTTPException(status_code=400, detail="Valid 10-digit mobile number is required")
        
    user = db.users.get(current_user["id"])
    if user:
        user["phone"] = phone
        user["updated_at"] = datetime.now(timezone.utc)
    return {"message": "Phone number updated successfully", "phone": phone}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    # Always return fresh user profile with latest phone
    if current_user.get("role") == "citizen":
        u = db.users.get(current_user["id"])
        if u:
            return {**current_user, "phone": u.get("phone", "")}
    return current_user
