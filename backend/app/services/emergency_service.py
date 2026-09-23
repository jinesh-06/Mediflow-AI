from datetime import datetime
from typing import Dict, Any
from app.db.repository import repo
from app.services.metrics_service import metrics_service
from app.services.forecasting_service import forecasting_service
from app.services.optimizer_service import optimizer_service
from app.services.gemini_service import gemini_service

class EmergencySimulationService:
    def simulate_dengue_outbreak(self) -> Dict[str, Any]:
        """
        Triggers the deterministic Dengue Outbreak emergency scenario:
        - Patient footfall: +43%
        - Medicine consumption: +51% (ORS +70%)
        - Bed occupancy: +18%
        - Triggers demand forecast update for PHC-021
        - Triggers high-risk alert
        - Triggers redistribution optimizer (District B -> District A: 800 units ORS)
        - Triggers Gemini grounded explanation
        """
        repo.emergency_state["is_active"] = True
        repo.emergency_state["started_at"] = datetime.utcnow().isoformat()
        
        epicenter_id = repo.emergency_state["epicenter_phc_id"]  # PHC-021
        
        # 1. Update Bed Occupancy (+18% from baseline 72% to 90%)
        bed = repo.get_phc_bed(epicenter_id)
        if bed:
            new_occ = min(bed.total_beds - bed.reserved_beds - bed.maintenance_beds, int(bed.total_beds * 0.90))
            repo.update_bed(epicenter_id, occupied=new_occ)

        # 2. Update Patient Footfall (+43%)
        footfalls = repo.get_footfalls(epicenter_id, limit_days=7)
        if footfalls:
            footfalls[0].patient_count = int(footfalls[0].patient_count * 1.43)
            footfalls[0].emergency_count = int(footfalls[0].emergency_count * 1.65)

        # 3. Update Medicine Consumptions in affected PHC
        inv_ors = repo.get_inventory_item(epicenter_id, "MED-ORS")
        if inv_ors:
            inv_ors.daily_consumption = 202.4  # so 850 / 202.4 = 4.2 days exactly

        inv_pcm = repo.get_inventory_item(epicenter_id, "MED-PCM")
        if inv_pcm:
            inv_pcm.daily_consumption = round(inv_pcm.daily_consumption * 1.51, 1)

        # 4. Recalculate Forecast for PHC-021 ORS
        forecast_result = forecasting_service.forecast_demand(epicenter_id, "MED-ORS", horizon_days=7)

        # 5. Calculate new HRSI (will now be HIGH or CRITICAL)
        stress_result = metrics_service.calculate_hrsi(epicenter_id)

        # 6. Run Optimizer to generate redistribution recommendations
        recommendations = optimizer_service.generate_recommendations()

        # Find the recommendation for PHC-021
        p21_rec = next((r for r in recommendations if r.destination_phc_id == epicenter_id and "ors" in r.resource.lower()), None)
        
        # 7. Generate grounded Gemini explanation for this recommendation
        gemini_explanation = None
        if p21_rec:
            gemini_explanation = gemini_service.explain_recommendation(p21_rec.id, language="en")

        # 8. Log Emergency Simulation Audit Event
        audit = repo.log_audit(
            event_type="EMERGENCY_SIMULATED",
            actor_id="SYS-SIM-01",
            actor_name="Emergency Simulation Engine",
            actor_role="SIMULATOR",
            reason="Public Health Dengue Outbreak Simulation initiated at PHC-021 (District A)",
            metadata={
                "footfall_surge": "+43%",
                "medicine_demand_surge": "+51%",
                "bed_occupancy_delta": "+18%",
                "stress_index": stress_result.stress_index,
                "stress_category": stress_result.category,
                "predicted_stockout_days": forecast_result.stockout_days
            }
        )

        return {
            "status": "EMERGENCY_ACTIVE",
            "scenario": "Dengue Outbreak",
            "epicenter": epicenter_id,
            "metrics_before": {
                "patient_footfall": "Normal (120/day)",
                "medicine_demand": "Normal (120 units/day)",
                "bed_occupancy": "72%",
                "ors_stockout_days": "7.1 days",
                "hrsi_score": 38.4,
                "risk_level": "WATCH"
            },
            "metrics_after": {
                "patient_footfall": "+43% (172/day)",
                "medicine_demand": "+51% (202 units/day)",
                "bed_occupancy": "90% (+18%)",
                "ors_stockout_days": f"{forecast_result.stockout_days} days",
                "hrsi_score": stress_result.stress_index,
                "risk_level": stress_result.category
            },
            "forecast": forecast_result.model_dump(),
            "stress_index": stress_result.model_dump(),
            "recommendation": p21_rec.model_dump() if p21_rec else None,
            "gemini_explanation": gemini_explanation,
            "audit_id": audit.event_id
        }

    def reset_emergency(self) -> Dict[str, Any]:
        """
        Resets all operational metrics back to the stable baseline state.
        """
        repo.reset()
        forecasting_service._train_baseline_model()
        return {
            "status": "NORMAL_SURVEILLANCE",
            "message": "Emergency state deactivated. All PHC metrics, bed states, and inventory runways restored to baseline surveillance levels."
        }

emergency_service = EmergencySimulationService()
