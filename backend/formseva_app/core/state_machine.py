"""
FormSeva Application State Machine (FS-H2).
Validates lifecycle transitions across the assisted-filing process.
Strictly decoupled from payment state (payment system is pass-through).
"""
from typing import Dict, Set
from fastapi import HTTPException, status

VALID_TRANSITIONS: Dict[str, Set[str]] = {
    "draft": {"submitted"},
    "submitted": {"operator_filling", "rejected"},
    "resubmitted": {"operator_filling", "rejected"},
    "operator_filling": {
        "awaiting_otp",
        "submitted_to_govt_portal",
        "approved",
        "rejected",
        "correction_required",
    },
    "awaiting_otp": {
        "otp_received",
        "operator_filling",
        "rejected",
    },
    "otp_received": {
        "operator_filling",
        "submitted_to_govt_portal",
        "approved",
        "rejected",
    },
    "submitted_to_govt_portal": {
        "approved",
        "rejected",
        "correction_required",
    },
    "correction_required": {"resubmitted"},
    "rejected": {"resubmitted"},
    "approved": set(),  # Terminal state
}

def validate_status_transition(current_status: str, target_status: str) -> None:
    """
    Validates if transitioning from current_status -> target_status is permitted.
    Raises 400 Bad Request with clear diagnostics if invalid.
    """
    if current_status == target_status:
        return
        
    allowed_targets = VALID_TRANSITIONS.get(current_status)
    if allowed_targets is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown current status '{current_status}' in lifecycle state machine."
        )
        
    if target_status not in allowed_targets:
        allowed_str = ", ".join(sorted(allowed_targets)) if allowed_targets else "None (terminal state)"
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid status transition: Cannot transition application from '{current_status}' "
                f"to '{target_status}'. Permitted next states from '{current_status}': [{allowed_str}]."
            )
        )
