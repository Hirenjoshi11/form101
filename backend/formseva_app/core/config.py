import os
import warnings
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Form_Seva API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gujarat-formseva-jwt-secret-key-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour session limit
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID", None)
    
    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://mock-formseva.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "mock-anon-key")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "mock-service-key")
    
    # Stripe Credentials (PAYMENT BOUNDARY — UNTOUCHED)
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock_formseva_stripe_secret_key")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_mock_formseva_stripe_pub_key")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock_stripe_webhook_secret")

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()

# ── Security Startup Check (FS-C3: Fail-closed on missing/default secret) ──
_COMMITTED_INSECURE_SECRET = "gujarat-formseva-jwt-secret-key-2026-secure"

if not settings.SECRET_KEY or settings.SECRET_KEY == _COMMITTED_INSECURE_SECRET or len(settings.SECRET_KEY) < 32:
    raise RuntimeError(
        "\n"
        "╔═══════════════════════════════════════════════════════════════════════╗\n"
        "║  🛑 FATAL: CRITICAL SECURITY VIOLATION (FS-C3)                        ║\n"
        "║  Environment detected with insecure or default SECRET_KEY!            ║\n"
        "║  Application is refusing to start.                                    ║\n"
        "║  Set SECRET_KEY in environment to a 64+ char random string:           ║\n"
        "║  python -c 'import secrets; print(secrets.token_urlsafe(64))'         ║\n"
        "╚═══════════════════════════════════════════════════════════════════════╝"
    )
