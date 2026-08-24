from typing import Optional
from supabase import create_client, Client
from formseva_app.core.config import settings

_supabase_client: Optional[Client] = None

def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase client if valid credentials are provided.
    Falls back gracefully if mock or default credentials are in place.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if (
        settings.SUPABASE_URL
        and "mock" not in settings.SUPABASE_URL
        and settings.SUPABASE_KEY
        and "mock" not in settings.SUPABASE_KEY
    ):
        try:
            _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            return _supabase_client
        except Exception as e:
            print(f"[Supabase] Could not connect to Supabase: {e}")
            return None
    return None

def get_supabase_admin_client() -> Optional[Client]:
    """
    Returns an initialized Supabase Service Role (Admin) client for backend operations.
    """
    if (
        settings.SUPABASE_URL
        and "mock" not in settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and "mock" not in settings.SUPABASE_SERVICE_ROLE_KEY
    ):
        try:
            return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        except Exception as e:
            print(f"[Supabase Admin] Could not connect with service role key: {e}")
            return None
    return None
