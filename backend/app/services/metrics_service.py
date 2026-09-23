from typing import Dict, Any, List
from app.db.repository import repo
from app.models.healthcare import Bed, Inventory, Personnel
from app.models.forecast import StressIndexResponse

class MetricsService:
    @staticmethod
    def calculate_days_of_stock(current_stock: int, expected_daily_consumption: float) -> float:
        """
        days_of_stock_remaining = current_stock / expected_daily_consumption
        """
        if expected_daily_consumption <= 0:
            return 999.0
        return round(current_stock / expected_daily_consumption, 1)

    @staticmethod
    def calculate_bed_metrics(bed: Bed) -> Dict[str, Any]:
        """
        available_beds = total_beds - occupied_beds - reserved_beds - maintenance_beds
        occupancy_percentage = (occupied_beds / total_beds) * 100
        """
        available = max(0, bed.total_beds - bed.occupied_beds - bed.reserved_beds - bed.maintenance_beds)
        occupancy_pct = round((bed.occupied_beds / bed.total_beds * 100) if bed.total_beds > 0 else 0, 1)
        return {
            "total_beds": bed.total_beds,
            "occupied_beds": bed.occupied_beds,
            "reserved_beds": bed.reserved_beds,
            "maintenance_beds": bed.maintenance_beds,
            "available_beds": available,
            "occupancy_percentage": occupancy_pct
        }

    @staticmethod
    def calculate_personnel_metrics(phc_id: str) -> Dict[str, Any]:
        """
        Distinguishes: PRESENT != NECESSARILY AVAILABLE
        A person may be present but engaged in an emergency procedure or break.
        """
        staff_members = repo.get_personnel(phc_id=phc_id)
        total = len(staff_members)
        if total == 0:
            return {
                "total_staff": 0, "present_staff": 0, "absent_staff": 0,
                "available_staff": 0, "availability_ratio": 0.0,
                "by_role": {}
            }
        
        present = sum(1 for s in staff_members if s.attendance_status == "PRESENT")
        absent = sum(1 for s in staff_members if s.attendance_status in ("ABSENT", "ON_LEAVE"))
        available = sum(1 for s in staff_members if s.attendance_status == "PRESENT" and s.availability_status == "AVAILABLE")
        
        by_role: Dict[str, Dict[str, int]] = {}
        for s in staff_members:
            r = s.role
            if r not in by_role:
                by_role[r] = {"total": 0, "present": 0, "available": 0}
            by_role[r]["total"] += 1
            if s.attendance_status == "PRESENT":
                by_role[r]["present"] += 1
                if s.availability_status == "AVAILABLE":
                    by_role[r]["available"] += 1

        availability_ratio = round(available / total, 3)

        return {
            "total_staff": total,
            "present_staff": present,
            "absent_staff": absent,
            "available_staff": available,
            "availability_ratio": availability_ratio,
            "by_role": by_role
        }

    @classmethod
    def calculate_hrsi(cls, phc_id: str) -> StressIndexResponse:
        """
        Health Resource Stress Index (HRSI) - Composite Operational Prototype Metric (0-100)
        HRSI = 0.35 * ShortageRiskScore + 0.25 * BedOccupancyRatio + 0.20 * PatientSurgeRatio + 0.20 * StaffDeficitRatio
        0–30 = Stable (Green)
        31–50 = Watch (Amber)
        51–70 = High (Orange)
        71–100 = Critical (Red)
        """
        phc = repo.get_phc(phc_id)
        if not phc:
            raise ValueError(f"PHC with id {phc_id} not found")

        # 1. Medicine Shortage Risk Score (0-100)
        inventories = repo.get_inventory(phc_id=phc_id)
        shortage_score = 0.0
        critical_shortages: List[str] = []

        if inventories:
            for inv in inventories:
                dos = cls.calculate_days_of_stock(inv.current_stock, inv.daily_consumption)
                if dos <= 2.0:
                    shortage_score = max(shortage_score, 100.0)
                    med = repo.get_medicine(inv.medicine_id)
                    critical_shortages.append(f"{med.name if med else inv.medicine_id} ({dos}d stock)")
                elif dos <= 4.5:
                    shortage_score = max(shortage_score, 75.0)
                    med = repo.get_medicine(inv.medicine_id)
                    critical_shortages.append(f"{med.name if med else inv.medicine_id} ({dos}d stock)")
                elif dos <= 7.0:
                    shortage_score = max(shortage_score, 45.0)
                elif dos <= 12.0:
                    shortage_score = max(shortage_score, 20.0)

        # 2. Bed Occupancy Ratio (0 to 1)
        bed = repo.get_phc_bed(phc_id)
        bed_ratio = 0.5
        if bed and bed.total_beds > 0:
            bed_ratio = min(1.0, bed.occupied_beds / bed.total_beds)

        # 3. Patient Surge Ratio (0 to 1)
        footfalls = repo.get_footfalls(phc_id, limit_days=7)
        surge_ratio = 0.5
        if len(footfalls) >= 2:
            latest = footfalls[0].patient_count
            avg_prev = sum(f.patient_count for f in footfalls[1:]) / (len(footfalls) - 1)
            if avg_prev > 0:
                surge = latest / avg_prev
                surge_ratio = min(1.0, max(0.0, (surge - 0.7) / 0.8))  # normalized around baseline

        # 4. Staff Deficit Ratio (0 to 1)
        personnel_metrics = cls.calculate_personnel_metrics(phc_id)
        avail_ratio = personnel_metrics.get("availability_ratio", 0.5)
        staff_deficit = 1.0 - avail_ratio

        # Weighted composite score
        # Weights: Shortage: 35%, Bed: 25%, Surge: 20%, Staff: 20%
        raw_score = (
            0.35 * shortage_score +
            0.25 * (bed_ratio * 100.0) +
            0.20 * (surge_ratio * 100.0) +
            0.20 * (staff_deficit * 100.0)
        )
        stress_score = round(min(100.0, max(0.0, raw_score)), 1)

        # Categorize
        if stress_score <= 30.0:
            category = "STABLE"
        elif stress_score <= 50.0:
            category = "WATCH"
        elif stress_score <= 70.0:
            category = "HIGH"
        else:
            category = "CRITICAL"

        return StressIndexResponse(
            phc_id=phc.id,
            phc_name=phc.name,
            district_id=phc.district_id,
            state_id=phc.state_id,
            stress_index=stress_score,
            category=category,
            medicine_risk_score=round(shortage_score, 1),
            bed_occupancy_ratio=round(bed_ratio, 2),
            patient_surge_ratio=round(surge_ratio, 2),
            staff_deficit_ratio=round(staff_deficit, 2),
            critical_shortages=critical_shortages
        )

    @classmethod
    def get_national_overview(cls) -> Dict[str, Any]:
        """
        Aggregated command-center KPI metrics across all PHCs
        """
        all_phcs = repo.get_phcs()
        total_phcs = len(all_phcs)
        
        critical_phcs = 0
        high_phcs = 0
        watch_phcs = 0
        stable_phcs = 0
        
        total_beds = 0
        occupied_beds = 0
        available_beds = 0
        
        all_beds = repo.get_beds()
        for b in all_beds:
            total_beds += b.total_beds
            occupied_beds += b.occupied_beds
            available_beds += b.available_beds
            
        stress_scores = []
        for p in all_phcs:
            score_data = cls.calculate_hrsi(p.id)
            stress_scores.append(score_data.stress_index)
            if score_data.category == "CRITICAL":
                critical_phcs += 1
            elif score_data.category == "HIGH":
                high_phcs += 1
            elif score_data.category == "WATCH":
                watch_phcs += 1
            else:
                stable_phcs += 1

        avg_stress = round(sum(stress_scores) / len(stress_scores), 1) if stress_scores else 0.0
        
        # Medicine alerts count
        active_alerts = len(repo.get_alerts())
        shortage_count = 0
        for inv in repo.get_inventory():
            dos = cls.calculate_days_of_stock(inv.current_stock, inv.daily_consumption)
            if dos <= 5.0:
                shortage_count += 1

        all_staff = repo.get_personnel()
        total_staff = len(all_staff)
        available_staff = sum(1 for s in all_staff if s.attendance_status == "PRESENT" and s.availability_status == "AVAILABLE")
        staff_avail_pct = round((available_staff / total_staff * 100) if total_staff > 0 else 0, 1)

        bed_occupancy_pct = round((occupied_beds / total_beds * 100) if total_beds > 0 else 0, 1)

        return {
            "monitored_phcs": total_phcs,
            "districts_count": len(repo.get_districts()),
            "states_count": len(repo.get_states()),
            "critical_phcs": critical_phcs,
            "high_risk_phcs": high_phcs,
            "watch_phcs": watch_phcs,
            "stable_phcs": stable_phcs,
            "average_hrsi": avg_stress,
            "shortage_warnings": shortage_count,
            "active_alerts_count": active_alerts,
            "beds": {
                "total": total_beds,
                "occupied": occupied_beds,
                "available": available_beds,
                "occupancy_percentage": bed_occupancy_pct
            },
            "personnel": {
                "total": total_staff,
                "available": available_staff,
                "availability_percentage": staff_avail_pct
            }
        }

metrics_service = MetricsService()
