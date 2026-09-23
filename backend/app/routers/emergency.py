from fastapi import APIRouter
from app.services.emergency_service import emergency_service
from app.db.repository import repo

router = APIRouter(prefix="/api/emergency", tags=["Emergency Simulation"])

@router.post("/simulate")
def simulate_emergency():
    """
    Triggers the Dengue Outbreak emergency simulation.
    Surges footfall (+43%), consumption (+51%), bed occupancy (+18%),
    recalculates forecasts, triggers shortage alert, activates optimizer,
    and prepares Gemini explanation.
    """
    return emergency_service.simulate_dengue_outbreak()

@router.post("/reset")
def reset_emergency():
    """
    Restores the system state to standard surveillance mode.
    """
    return emergency_service.reset_emergency()

@router.get("/status")
def get_emergency_status():
    return repo.emergency_state
