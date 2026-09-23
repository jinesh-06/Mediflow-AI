from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field

class AuditEvent(BaseModel):
    event_id: str  # AUD-2026-XXXXX
    event_type: str  # RECOMMENDATION_GENERATED, RECOMMENDATION_APPROVED, RECOMMENDATION_MODIFIED, RECOMMENDATION_REJECTED, RECOMMENDATION_ESCALATED, TRANSFER_DISPATCHED, INVENTORY_UPDATED, EMERGENCY_SIMULATED, FL_ROUND_COMPLETED
    actor_id: str
    actor_name: str
    actor_role: str
    recommendation_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    previous_value: Optional[Any] = None
    new_value: Optional[Any] = None
    reason: Optional[str] = None
    model_version: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
