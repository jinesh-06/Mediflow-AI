from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field

class State(BaseModel):
    id: str
    name: str
    code: str
    region: str = "National"

class District(BaseModel):
    id: str
    name: str
    state_id: str

class Medicine(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    criticality: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL

class Inventory(BaseModel):
    id: str
    phc_id: str
    medicine_id: str
    current_stock: int
    reserved_stock: int = 0
    incoming_stock: int = 0
    minimum_reserve: int
    daily_consumption: float
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None

class Bed(BaseModel):
    phc_id: str
    total_beds: int
    occupied_beds: int
    reserved_beds: int = 0
    maintenance_beds: int = 0
    available_beds: int
    last_updated: datetime = Field(default_factory=datetime.utcnow)

class Personnel(BaseModel):
    id: str
    phc_id: str
    name: str
    role: str  # doctor, nurse, pharmacist, lab_tech, general_staff
    assigned_status: str = "ASSIGNED"
    attendance_status: str  # PRESENT, ABSENT, ON_LEAVE
    availability_status: str  # AVAILABLE, ENGAGED_EMERGENCY, BREAK, UNAVAILABLE
    shift: str  # MORNING, EVENING, NIGHT

class PatientFootfall(BaseModel):
    phc_id: str
    date: str  # YYYY-MM-DD
    patient_count: int
    emergency_count: int

class ResourceUsage(BaseModel):
    phc_id: str
    resource_type: str
    quantity: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PHC(BaseModel):
    id: str
    name: str
    district_id: str
    state_id: str
    latitude: float
    longitude: float
    status: str = "OPERATIONAL"  # OPERATIONAL, STRESSED, CRITICAL, OFFLINE
    contact_number: Optional[str] = None
    facility_type: str = "PHC"  # PHC, CHC, SUB_CENTRE

class Alert(BaseModel):
    id: str
    phc_id: str
    alert_type: str  # MEDICINE_SHORTAGE, BED_CAPACITY, PERSONNEL_DEFICIT, SURGE_ALERT
    severity: str  # STABLE, WATCH, HIGH, CRITICAL
    description: str
    predicted_date: Optional[str] = None
    status: str = "ACTIVE"  # ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InventoryUpdateRequest(BaseModel):
    current_stock: Optional[int] = None
    reserved_stock: Optional[int] = None
    incoming_stock: Optional[int] = None
    daily_consumption: Optional[float] = None

class BedUpdateRequest(BaseModel):
    occupied_beds: Optional[int] = None
    reserved_beds: Optional[int] = None
    maintenance_beds: Optional[int] = None

class PersonnelStatusUpdateRequest(BaseModel):
    attendance_status: Optional[str] = None
    availability_status: Optional[str] = None
    shift: Optional[str] = None
