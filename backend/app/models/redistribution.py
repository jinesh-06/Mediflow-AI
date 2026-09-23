from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class RedistributionRecommendation(BaseModel):
    id: str
    source_phc_id: str
    source_district_id: str
    source_name: str
    destination_phc_id: str
    destination_district_id: str
    destination_name: str
    resource: str  # e.g., ORS, Paracetamol, etc.
    quantity: int
    priority: str  # LOW, MEDIUM, HIGH, CRITICAL
    reason: str
    expected_impact: str
    transport_time_hours: float
    source_current_stock: int
    source_projected_surplus: int
    destination_current_stock: int
    destination_stockout_days: float
    model_version: str = "optimizer-v1.0"
    status: str = "PENDING_REVIEW"  # PENDING_REVIEW, APPROVED, MODIFIED, REJECTED, ESCALATED, DISPATCHED, COMPLETED
    requires_dual_auth: bool = False
    first_approval: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ApprovalActionRequest(BaseModel):
    action: str  # APPROVE, MODIFY, REJECT, ESCALATE
    reviewer_id: str = "OFFICER-001"
    reviewer_name: str = "Dr. Rajesh Kumar"
    reviewer_role: str = "District Health Officer"  # PHC_OPERATOR, DISTRICT_OFFICER, STATE_COORDINATOR, NATIONAL_ADMIN
    modified_quantity: Optional[int] = None
    reason: Optional[str] = None

class TransferRecord(BaseModel):
    id: str
    recommendation_id: str
    source_phc_id: str
    source_name: str
    destination_phc_id: str
    destination_name: str
    resource: str
    quantity: int
    status: str = "DISPATCHED"  # DISPATCHED, IN_TRANSIT, DELIVERED, CONFIRMED
    dispatched_at: datetime = Field(default_factory=datetime.utcnow)
    received_at: Optional[datetime] = None
    tracking_code: str
    vehicle_id: str = "MH-EMS-402"
