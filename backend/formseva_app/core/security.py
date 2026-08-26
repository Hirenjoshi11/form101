import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Set
from fastapi import HTTPException, Security, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from formseva_app.core.config import settings

# ── Password Hashing Context ──
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a stored cryptographic hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generates a secure cryptographic password hash."""
    return pwd_context.hash(password)

# ── Server-Side Session Revocation Denylist (FS-H5) ──
REVOKED_JTIS: Set[str] = set()

def revoke_jti(jti: str) -> None:
    """Adds a token's JTI to the revocation denylist on logout."""
    if jti:
        REVOKED_JTIS.add(jti)

def is_jti_revoked(jti: str) -> bool:
    """Checks if a token JTI has been revoked."""
    return jti in REVOKED_JTIS

# ── JWT Token Utilities ──
security_scheme = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Issues a signed JWT containing a unique JTI and expiration."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Embed unique token identifier (JTI) and issued-at (IAT)
    jti = str(uuid.uuid4())
    to_encode.update({
        "exp": expire,
        "iat": now,
        "jti": jti,
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a signed JWT against SECRET_KEY."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme)
) -> Dict[str, Any]:
    """
    Extracts authenticated user identity from Authorization Bearer header or secure cookie.
    Enforces expiration, cryptographic signature, and session revocation (FS-H5).
    """
    token: Optional[str] = None
    
    # 1. Bearer Header (Preferred)
    if credentials:
        token = credentials.credentials
    # 2. Cookie Fallback (httpOnly secure cookie)
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Enforce Server-Side Token Revocation Denylist (FS-H5)
    token_jti = payload.get("jti")
    if token_jti and is_jti_revoked(token_jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been revoked / logged out. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Ensure 'id' is always available (JWT uses 'sub' per spec, but app code uses 'id')
    if "sub" in payload and "id" not in payload:
        payload["id"] = payload["sub"]
        
    # Store current token in payload for logout handler
    payload["_token_jti"] = token_jti
    return payload

def require_role(allowed_roles: list[str]):
    """Role-based authorization guard for route handlers."""
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = current_user.get("role", "citizen")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}, but found role '{user_role}'"
            )
        return current_user
    return role_checker

# ── Google ID Token Verification (FS-C2) ──
def verify_google_id_token(token_str: str) -> Optional[Dict[str, Any]]:
    """
    Verifies Google OAuth ID token using google.oauth2.id_token.
    Falls back gracefully in local development if client ID is unconfigured.
    """
    if not token_str:
        return None
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        
        request = google_requests.Request()
        client_id = settings.GOOGLE_CLIENT_ID
        id_info = id_token.verify_oauth2_token(token_str, request, client_id)
        return id_info
    except Exception as e:
        return None

# ── Unified Resource Access Control (Phase 2 / FS-H1, FS-H3) ──
def check_submission_access(
    submission_id: str,
    current_user: Dict[str, Any],
    require_write: bool = False,
    require_assigned_operator: bool = False,
) -> Dict[str, Any]:
    """
    Unified Reusable Authorization Policy for Submissions.
    - Citizen: Must own the submission (sub["user_id"] == current_user["id"]).
    - Operator:
      - Read Access: Must be assigned OR form-eligible for this form type.
      - Action/Write Access: Must be assigned to this submission AND form-eligible.
    - Admin: Full system oversight.
    """
    from formseva_app.core.database import db

    sub = db.submissions.get(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application submission not found."
        )

    role = current_user.get("role", "citizen")
    user_id = current_user.get("id")

    # 1. Admin: Unrestricted Access
    if role == "admin":
        return sub

    # 2. Citizen: Strict Resource Ownership Check
    if role == "citizen":
        if sub.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: You are not authorized to view or modify this application."
            )
        return sub

    # 3. Operator: Strict Assignment and Form-Eligibility Check
    if role == "operator":
        operator_id = user_id
        is_assigned = (sub.get("assigned_operator_id") == operator_id)
        
        # Check operator certified form eligibility
        is_form_eligible = any(
            a.get("operator_id") == operator_id and 
            a.get("form_id") == sub.get("form_id") and 
            a.get("is_active", True)
            for a in db.operator_form_assignments.values()
        )

        if require_write or require_assigned_operator:
            if not is_assigned:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access forbidden: You are not the assigned operator for this application."
                )
            if not is_form_eligible:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access forbidden: You are not certified/eligible to process this form category."
                )
        else:
            # Read access: Operator must be assigned OR eligible for the form category
            if not (is_assigned or is_form_eligible):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access forbidden: You are not authorized to access applications in this form category."
                )
        return sub

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access forbidden: Unknown or unauthorized role."
    )

# ── PII Minimization & Masking Helpers (FS-H6) ──
def mask_phone(phone: Optional[str]) -> str:
    """Masks phone number for unassigned operator views (e.g. +91 XXXXXX1234)."""
    if not phone:
        return ""
    digits = "".join(ch for ch in str(phone) if ch.isdigit())
    if len(digits) >= 10:
        return f"+91 XXXXXX{digits[-4:]}"
    elif len(digits) >= 4:
        return f"XXXXXX{digits[-4:]}"
    return "XXXX"

def mask_aadhaar(aadhaar: Optional[str]) -> str:
    """Masks 12-digit Aadhaar number to display only the last 4 digits."""
    if not aadhaar:
        return ""
    digits = "".join(ch for ch in str(aadhaar) if ch.isdigit())
    if len(digits) >= 12:
        return f"XXXX-XXXX-{digits[-4:]}"
    elif len(digits) >= 4:
        return f"XXXX-{digits[-4:]}"
    return "XXXX"

def mask_pan(pan: Optional[str]) -> str:
    """Masks PAN card to display only the last 4 characters."""
    if not pan:
        return ""
    clean = str(pan).strip().upper()
    if len(clean) >= 5:
        return f"XXXXX{clean[-4:]}"
    return "XXXX"

