import threading
from datetime import datetime
from typing import Dict, List, Optional, Any
from app.db.seed_data import generate_seed_data
from app.models.healthcare import State, District, Medicine, PHC, Inventory, Bed, Personnel, PatientFootfall, Alert
from app.models.redistribution import RedistributionRecommendation, TransferRecord
from app.models.audit import AuditEvent
from app.models.federated import FederatedNode, FederatedRound

class HealthcareRepository:
    def __init__(self):
        self._lock = threading.RLock()
        self.reset()

    def reset(self):
        with self._lock:
            data = generate_seed_data()
            self.states: Dict[str, State] = {s.id: s for s in data["states"]}
            self.districts: Dict[str, District] = {d.id: d for d in data["districts"]}
            self.medicines: Dict[str, Medicine] = {m.id: m for m in data["medicines"]}
            self.phcs: Dict[str, PHC] = {p.id: p for p in data["phcs"]}
            self.beds: Dict[str, Bed] = {b.phc_id: b for b in data["beds"]}
            
            # Personnel: keyed by id
            self.personnel: Dict[str, Personnel] = {p.id: p for p in data["personnel"]}
            
            # Inventories: keyed by id and indexed by (phc_id, medicine_id)
            self.inventories: Dict[str, Inventory] = {inv.id: inv for inv in data["inventories"]}
            
            # Footfalls: list of patient footfalls
            self.footfalls: List[PatientFootfall] = data["footfalls"]
            
            # Alerts: keyed by id
            self.alerts: Dict[str, Alert] = {}
            
            # Recommendations: keyed by id
            self.recommendations: Dict[str, RedistributionRecommendation] = {}
            
            # Transfers: keyed by id
            self.transfers: Dict[str, TransferRecord] = {}
            
            # Append-only Audit events: list
            self.audit_events: List[AuditEvent] = []
            
            # Federated Learning nodes and rounds
            self.federated_nodes: Dict[str, FederatedNode] = {
                "NODE-TN": FederatedNode(
                    id="NODE-TN",
                    name="Tamil Nadu Regional Hub",
                    state_id="STATE-TN",
                    country="India",
                    node_type="REGIONAL_HUB",
                    phc_count=12,
                    local_samples_count=3600,
                    status="ACTIVE",
                    last_round_loss=0.042,
                    last_round_accuracy=0.948,
                    model_version="demand-model-v1.3-node-tn"
                ),
                "NODE-KA": FederatedNode(
                    id="NODE-KA",
                    name="Karnataka Regional Hub",
                    state_id="STATE-KA",
                    country="India",
                    node_type="REGIONAL_HUB",
                    phc_count=12,
                    local_samples_count=3600,
                    status="ACTIVE",
                    last_round_loss=0.045,
                    last_round_accuracy=0.941,
                    model_version="demand-model-v1.3-node-ka"
                ),
                "NODE-MH": FederatedNode(
                    id="NODE-MH",
                    name="Maharashtra Regional Hub",
                    state_id="STATE-MH",
                    country="India",
                    node_type="REGIONAL_HUB",
                    phc_count=12,
                    local_samples_count=3600,
                    status="ACTIVE",
                    last_round_loss=0.039,
                    last_round_accuracy=0.952,
                    model_version="demand-model-v1.3-node-mh"
                ),
                "NODE-WB": FederatedNode(
                    id="NODE-WB",
                    name="West Bengal Regional Hub",
                    state_id="STATE-WB",
                    country="India",
                    node_type="REGIONAL_HUB",
                    phc_count=12,
                    local_samples_count=3600,
                    status="ACTIVE",
                    last_round_loss=0.047,
                    last_round_accuracy=0.939,
                    model_version="demand-model-v1.3-node-wb"
                ),
            }
            
            self.federated_rounds: List[FederatedRound] = [
                FederatedRound(
                    round_number=1,
                    timestamp=datetime.utcnow(),
                    participating_nodes=["NODE-TN", "NODE-KA", "NODE-MH", "NODE-WB"],
                    aggregation_strategy="FedAvg (Federated Averaging)",
                    global_model_version="demand-model-v1.3",
                    mean_mae=12.4,
                    mean_rmse=18.6,
                    total_samples=14400,
                    status="COMPLETED",
                    notes="Decentralized weights aggregated across 4 Indian states; zero raw patient data centralized."
                )
            ]

            # Emergency state tracker
            self.emergency_state: Dict[str, Any] = {
                "is_active": False,
                "scenario_name": "Dengue Outbreak",
                "epicenter_phc_id": "PHC-021",
                "affected_districts": ["DIST-01"],
                "started_at": None,
                "surge_factors": {
                    "footfall_multiplier": 1.43,
                    "medicine_consumption_multiplier": 1.51,
                    "ors_consumption_multiplier": 1.70,
                    "bed_occupancy_delta": 0.18
                }
            }

            # Initialize initial system audit record
            self.log_audit(
                event_type="SYSTEM_INITIALIZED",
                actor_id="SYS-INIT",
                actor_name="ResiliHealth Core Engine",
                actor_role="SYSTEM",
                reason="Repository baseline reset to 48 PHCs across 4 states",
                metadata={"phc_count": len(self.phcs), "state_count": len(self.states)}
            )

    # State & District Queries
    def get_states(self) -> List[State]:
        with self._lock:
            return list(self.states.values())

    def get_districts(self, state_id: Optional[str] = None) -> List[District]:
        with self._lock:
            if state_id:
                return [d for d in self.districts.values() if d.state_id == state_id]
            return list(self.districts.values())

    def get_district(self, district_id: str) -> Optional[District]:
        with self._lock:
            return self.districts.get(district_id)

    # PHC Queries
    def get_phcs(self, district_id: Optional[str] = None, state_id: Optional[str] = None) -> List[PHC]:
        with self._lock:
            results = list(self.phcs.values())
            if state_id:
                results = [p for p in results if p.state_id == state_id]
            if district_id:
                results = [p for p in results if p.district_id == district_id]
            return results

    def get_phc(self, phc_id: str) -> Optional[PHC]:
        with self._lock:
            return self.phcs.get(phc_id)

    # Medicine & Inventory
    def get_medicines(self) -> List[Medicine]:
        with self._lock:
            return list(self.medicines.values())

    def get_medicine(self, medicine_id: str) -> Optional[Medicine]:
        with self._lock:
            return self.medicines.get(medicine_id)

    def get_inventory(self, phc_id: Optional[str] = None, medicine_id: Optional[str] = None) -> List[Inventory]:
        with self._lock:
            items = list(self.inventories.values())
            if phc_id:
                items = [inv for inv in items if inv.phc_id == phc_id]
            if medicine_id:
                items = [inv for inv in items if inv.medicine_id == medicine_id]
            return items

    def get_inventory_item(self, phc_id: str, medicine_id: str) -> Optional[Inventory]:
        with self._lock:
            for inv in self.inventories.values():
                if inv.phc_id == phc_id and inv.medicine_id == medicine_id:
                    return inv
            return None

    def update_inventory_stock(self, phc_id: str, medicine_id: str, delta: int, reason: str = "Supply Movement") -> Optional[Inventory]:
        with self._lock:
            inv = self.get_inventory_item(phc_id, medicine_id)
            if not inv:
                return None
            prev_stock = inv.current_stock
            inv.current_stock = max(0, inv.current_stock + delta)
            inv.last_updated = datetime.utcnow()
            return inv

    # Beds
    def get_beds(self, phc_id: Optional[str] = None) -> List[Bed]:
        with self._lock:
            if phc_id:
                bed = self.beds.get(phc_id)
                return [bed] if bed else []
            return list(self.beds.values())

    def get_phc_bed(self, phc_id: str) -> Optional[Bed]:
        with self._lock:
            return self.beds.get(phc_id)

    def update_bed(self, phc_id: str, occupied: Optional[int] = None, reserved: Optional[int] = None, maintenance: Optional[int] = None) -> Optional[Bed]:
        with self._lock:
            bed = self.beds.get(phc_id)
            if not bed:
                return None
            if occupied is not None:
                bed.occupied_beds = occupied
            if reserved is not None:
                bed.reserved_beds = reserved
            if maintenance is not None:
                bed.maintenance_beds = maintenance
            bed.available_beds = max(0, bed.total_beds - bed.occupied_beds - bed.reserved_beds - bed.maintenance_beds)
            bed.last_updated = datetime.utcnow()
            return bed

    # Personnel
    def get_personnel(self, phc_id: Optional[str] = None, role: Optional[str] = None) -> List[Personnel]:
        with self._lock:
            staff = list(self.personnel.values())
            if phc_id:
                staff = [p for p in staff if p.phc_id == phc_id]
            if role:
                staff = [p for p in staff if p.role.lower() == role.lower()]
            return staff

    def update_personnel_status(self, staff_id: str, attendance: Optional[str] = None, availability: Optional[str] = None, shift: Optional[str] = None) -> Optional[Personnel]:
        with self._lock:
            staff = self.personnel.get(staff_id)
            if not staff:
                return None
            if attendance is not None:
                staff.attendance_status = attendance
            if availability is not None:
                staff.availability_status = availability
            if shift is not None:
                staff.shift = shift
            return staff

    # Patient Footfalls
    def get_footfalls(self, phc_id: str, limit_days: int = 30) -> List[PatientFootfall]:
        with self._lock:
            items = [f for f in self.footfalls if f.phc_id == phc_id]
            items.sort(key=lambda x: x.date, reverse=True)
            return items[:limit_days]

    # Alerts
    def get_alerts(self, phc_id: Optional[str] = None, severity: Optional[str] = None) -> List[Alert]:
        with self._lock:
            res = list(self.alerts.values())
            if phc_id:
                res = [a for a in res if a.phc_id == phc_id]
            if severity:
                res = [a for a in res if a.severity == severity]
            res.sort(key=lambda x: x.created_at, reverse=True)
            return res

    def add_alert(self, alert: Alert) -> Alert:
        with self._lock:
            self.alerts[alert.id] = alert
            return alert

    def clear_alerts_for_phc(self, phc_id: str):
        with self._lock:
            to_del = [aid for aid, a in self.alerts.items() if a.phc_id == phc_id]
            for aid in to_del:
                del self.alerts[aid]

    # Recommendations & Transfers
    def get_recommendations(self, status: Optional[str] = None) -> List[RedistributionRecommendation]:
        with self._lock:
            recs = list(self.recommendations.values())
            if status:
                recs = [r for r in recs if r.status == status]
            recs.sort(key=lambda x: x.created_at, reverse=True)
            return recs

    def get_recommendation(self, rec_id: str) -> Optional[RedistributionRecommendation]:
        with self._lock:
            return self.recommendations.get(rec_id)

    def add_recommendation(self, rec: RedistributionRecommendation) -> RedistributionRecommendation:
        with self._lock:
            self.recommendations[rec.id] = rec
            return rec

    def update_recommendation_status(self, rec_id: str, status: str) -> Optional[RedistributionRecommendation]:
        with self._lock:
            rec = self.recommendations.get(rec_id)
            if rec:
                rec.status = status
            return rec

    def get_transfers(self) -> List[TransferRecord]:
        with self._lock:
            trans = list(self.transfers.values())
            trans.sort(key=lambda x: x.dispatched_at, reverse=True)
            return trans

    def add_transfer(self, transfer: TransferRecord) -> TransferRecord:
        with self._lock:
            self.transfers[transfer.id] = transfer
            return transfer

    # Append-Only Audit Logging
    def log_audit(
        self,
        event_type: str,
        actor_id: str,
        actor_name: str,
        actor_role: str,
        recommendation_id: Optional[str] = None,
        previous_value: Optional[Any] = None,
        new_value: Optional[Any] = None,
        reason: Optional[str] = None,
        model_version: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        with self._lock:
            event_num = len(self.audit_events) + 1
            audit_id = f"AUD-2026-{event_num:05d}"
            event = AuditEvent(
                event_id=audit_id,
                event_type=event_type,
                actor_id=actor_id,
                actor_name=actor_name,
                actor_role=actor_role,
                recommendation_id=recommendation_id,
                timestamp=datetime.utcnow(),
                previous_value=previous_value,
                new_value=new_value,
                reason=reason,
                model_version=model_version,
                metadata=metadata or {}
            )
            self.audit_events.append(event)
            return event

    def get_audit_trail(self, limit: int = 100) -> List[AuditEvent]:
        with self._lock:
            # Return newest first
            return list(reversed(self.audit_events))[:limit]

# Global singleton repository
repo = HealthcareRepository()
