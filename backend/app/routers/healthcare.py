from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.db.repository import repo
from app.models.healthcare import State, District, Medicine, PHC, Inventory, Bed, Personnel, PatientFootfall, Alert
from app.services.metrics_service import metrics_service

router = APIRouter(prefix="/api", tags=["Healthcare Operational Data"])

@router.get("/states", response_model=List[State])
def get_states():
    return repo.get_states()

@router.get("/districts", response_model=List[District])
def get_districts(state_id: Optional[str] = None):
    return repo.get_districts(state_id=state_id)

@router.get("/phcs", response_model=List[PHC])
def get_phcs(district_id: Optional[str] = None, state_id: Optional[str] = None):
    return repo.get_phcs(district_id=district_id, state_id=state_id)

@router.get("/phcs/{phc_id}")
def get_phc_details(phc_id: str):
    phc = repo.get_phc(phc_id)
    if not phc:
        raise HTTPException(status_code=404, detail="PHC not found")
    
    bed = repo.get_phc_bed(phc_id)
    bed_metrics = metrics_service.calculate_bed_metrics(bed) if bed else {}
    staff_metrics = metrics_service.calculate_personnel_metrics(phc_id)
    stress_metrics = metrics_service.calculate_hrsi(phc_id)
    inventories = repo.get_inventory(phc_id=phc_id)
    
    # Calculate days of stock for all items
    inventory_items = []
    for inv in inventories:
        med = repo.get_medicine(inv.medicine_id)
        dos = metrics_service.calculate_days_of_stock(inv.current_stock, inv.daily_consumption)
        inventory_items.append({
            **inv.model_dump(),
            "medicine_name": med.name if med else inv.medicine_id,
            "category": med.category if med else "General",
            "unit": med.unit if med else "Units",
            "days_of_stock_remaining": dos,
            "risk_level": "CRITICAL" if dos <= 2.5 else ("HIGH" if dos <= 5.0 else ("WATCH" if dos <= 8.0 else "STABLE"))
        })

    footfall = repo.get_footfalls(phc_id, limit_days=14)

    return {
        "phc": phc,
        "district": repo.get_district(phc.district_id),
        "state": next((s for s in repo.get_states() if s.id == phc.state_id), None),
        "beds": bed_metrics,
        "personnel": staff_metrics,
        "stress_index": stress_metrics,
        "inventory": inventory_items,
        "recent_footfall": footfall
    }

@router.get("/medicines", response_model=List[Medicine])
def get_medicines():
    return repo.get_medicines()

@router.get("/inventory")
def get_inventory(phc_id: Optional[str] = None, medicine_id: Optional[str] = None):
    items = repo.get_inventory(phc_id=phc_id, medicine_id=medicine_id)
    results = []
    for inv in items:
        med = repo.get_medicine(inv.medicine_id)
        phc = repo.get_phc(inv.phc_id)
        dos = metrics_service.calculate_days_of_stock(inv.current_stock, inv.daily_consumption)
        results.append({
            **inv.model_dump(),
            "medicine_name": med.name if med else inv.medicine_id,
            "category": med.category if med else "General",
            "unit": med.unit if med else "Units",
            "phc_name": phc.name if phc else inv.phc_id,
            "days_of_stock_remaining": dos,
            "risk_level": "CRITICAL" if dos <= 2.5 else ("HIGH" if dos <= 5.0 else ("WATCH" if dos <= 8.0 else "STABLE"))
        })
    return results

@router.post("/inventory/update")
def update_inventory(phc_id: str, medicine_id: str, delta: int, reason: str = "Manual Operator Adjustment"):
    inv = repo.update_inventory_stock(phc_id, medicine_id, delta, reason=reason)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    
    # Audit log
    repo.log_audit(
        event_type="INVENTORY_UPDATED",
        actor_id="OPERATOR-PHC",
        actor_name="PHC Staff Operator",
        actor_role="PHC Operator",
        reason=reason,
        metadata={"phc_id": phc_id, "medicine_id": medicine_id, "delta": delta, "new_stock": inv.current_stock}
    )
    return inv

@router.get("/beds")
def get_beds(phc_id: Optional[str] = None):
    beds = repo.get_beds(phc_id=phc_id)
    return [metrics_service.calculate_bed_metrics(b) for b in beds]

@router.post("/beds/update")
def update_beds(phc_id: str, occupied: Optional[int] = None, reserved: Optional[int] = None, maintenance: Optional[int] = None):
    bed = repo.update_bed(phc_id, occupied=occupied, reserved=reserved, maintenance=maintenance)
    if not bed:
        raise HTTPException(status_code=404, detail="Bed record not found")
    return metrics_service.calculate_bed_metrics(bed)

@router.get("/personnel")
def get_personnel(phc_id: Optional[str] = None, role: Optional[str] = None):
    return repo.get_personnel(phc_id=phc_id, role=role)

@router.post("/personnel/status")
def update_personnel_status(staff_id: str, attendance: Optional[str] = None, availability: Optional[str] = None, shift: Optional[str] = None):
    staff = repo.update_personnel_status(staff_id, attendance=attendance, availability=availability, shift=shift)
    if not staff:
        raise HTTPException(status_code=404, detail="Personnel record not found")
    return staff

@router.get("/footfall/{phc_id}")
def get_footfall(phc_id: str, limit_days: int = 14):
    return repo.get_footfalls(phc_id, limit_days=limit_days)

@router.get("/metrics/national")
def get_national_metrics():
    return metrics_service.get_national_overview()

@router.get("/metrics/hrsi/{phc_id}")
def get_phc_hrsi(phc_id: str):
    try:
        return metrics_service.calculate_hrsi(phc_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/alerts", response_model=List[Alert])
def get_alerts(phc_id: Optional[str] = None, severity: Optional[str] = None):
    return repo.get_alerts(phc_id=phc_id, severity=severity)
