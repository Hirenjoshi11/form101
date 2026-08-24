import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Form_Seva API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gujarat-formseva-jwt-secret-key-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Supabase Credentials
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://mock-formseva.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "mock-anon-key")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "mock-service-key")
    
    # Stripe Credentials
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock_formseva_stripe_secret_key")
    STRIPE_PUBLISHABLE_KEY: str = os.getenv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_mock_formseva_stripe_pub_key")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_mock_stripe_webhook_secret")

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
