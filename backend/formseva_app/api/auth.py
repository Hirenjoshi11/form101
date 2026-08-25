import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from formseva_app.models.schemas import AuthRequest, AuthResponse, GoogleAuthRequest
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
            raise HTTPException(
                status_code=403,
                detail="Admin account not found. Admins must be pre-registered by the system."
            )
        if not admin.get("is_active", True):
            raise HTTPException(status_code=403, detail="Admin account is deactivated.")
        
        token_payload = {
            "sub": admin["id"],
            "email": admin["email"],
            "role": "admin"
        }
        token = create_access_token(token_payload)
        return AuthResponse(access_token=token, user={**token_payload, "id": admin["id"], "full_name": admin["full_name"]})

    elif role == "operator":
        operator = next((o for o in db.operators.values() if o["email"].lower() == email), None)
        if not operator:
            raise HTTPException(status_code=404, detail="Operator account not found. Please contact Admin to create an operator profile.")
        
        token_payload = {
            "sub": operator["id"],
            "email": operator["email"],
            "role": "operator"
        }
        token = create_access_token(token_payload)
        return AuthResponse(access_token=token, user={**token_payload, "id": operator["id"], "full_name": operator["full_name"], "district": operator["district"]})

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
            "email": user["email"],
            "role": "citizen"
        }
        token = create_access_token(token_payload)
        return AuthResponse(access_token=token, user={**token_payload, "id": user["id"], "full_name": user["full_name"], "phone": user.get("phone", ""), "preferred_language": user.get("preferred_language", "gu")})

@router.post("/google", response_model=AuthResponse)
def google_auth_login(payload: GoogleAuthRequest):
    """
    Google OAuth login handler.
    
    ⚠️ SECURITY NOTE: In production, this endpoint MUST verify the Google ID token
    using google.oauth2.id_token.verify_oauth2_token() before trusting the email.
    Currently accepts the email directly — suitable for development only.
    """
    email = payload.email.lower().strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required for Google authentication")
        
    full_name = payload.full_name or email.split("@")[0].replace(".", " ").title()
    avatar_url = payload.avatar_url
    phone = payload.phone or ""
    
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
        "email": user["email"],
        "role": "citizen"
    }
    token = create_access_token(token_payload)
    return AuthResponse(access_token=token, user={**token_payload, "id": user["id"], "full_name": user["full_name"], "phone": user.get("phone", ""), "auth_provider": "google", "preferred_language": user.get("preferred_language", "gu")})

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
