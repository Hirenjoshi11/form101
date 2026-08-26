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
        # If token is not a valid Google ID token or verification fails
        return None
