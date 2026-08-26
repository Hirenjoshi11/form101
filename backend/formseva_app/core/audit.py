"""
FormSeva Audit Logging Service (FS-L1).
Appends structured security and lifecycle event entries with client IP, user agent, and actor context.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import Request
from formseva_app.core.database import db

def record_audit_log(
    action: str,
    actor_id: str,
    actor_role: str,
    entity_type: str,
    entity_id: str,
    old_state: Optional[Dict[str, Any]] = None,
    new_state: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
) -> Dict[str, Any]:
    """Records an immutable audit event."""
    client_ip = request.client.host if (request and request.client) else "internal"
    user_agent = request.headers.get("user-agent", "unknown") if request else "unknown"
    
    log_entry = {
        "id": str(uuid.uuid4()),
        "actor_id": actor_id,
        "actor_role": actor_role,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "old_state": old_state,
        "new_state": new_state,
        "client_ip": client_ip,
        "user_agent": user_agent,
        "created_at": datetime.now(timezone.utc)
    }
    
    db.audit_logs.append(log_entry)
    return log_entry
