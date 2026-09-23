import pytest
from app.db.repository import repo
from app.services.emergency_service import emergency_service
from app.services.forecasting_service import forecasting_service
from app.services.optimizer_service import optimizer_service
from app.services.gemini_service import gemini_service
from app.services.approval_service import approval_service
from app.services.metrics_service import metrics_service

def test_complete_golden_path():
    # Step 1: Ensure clean baseline
    repo.reset()
    inv_initial = repo.get_inventory_item("PHC-021", "MED-ORS")
    assert inv_initial is not None
    assert inv_initial.current_stock == 850

    # Step 2: Trigger Emergency Simulation (Dengue Outbreak)
    sim_result = emergency_service.simulate_dengue_outbreak()
    assert sim_result["status"] == "EMERGENCY_ACTIVE"
    assert sim_result["epicenter"] == "PHC-021"

    # Step 3: Verify Forecast & Stockout Calculation
    fc = forecasting_service.forecast_demand("PHC-021", "MED-ORS", horizon_days=7)
    assert fc.stockout_days <= 4.5
    assert fc.risk in ("HIGH", "CRITICAL")
    assert fc.confidence >= 0.85

    # Step 4: Verify Alert Generation
    alerts = repo.get_alerts(phc_id="PHC-021")
    assert len(alerts) > 0
    shortage_alert = next((a for a in alerts if "ORS" in a.description or a.severity in ("HIGH", "CRITICAL")), None)
    assert shortage_alert is not None

    # Step 5: Verify Optimizer Recommendation (District B -> District A / PHC-021)
    recs = repo.get_recommendations()
    target_rec = next((r for r in recs if r.destination_phc_id == "PHC-021" and "ors" in r.resource.lower()), None)
    assert target_rec is not None
    assert target_rec.quantity == 800
    assert "District B" in target_rec.source_name or "DIST-02" in target_rec.source_district_id
    assert target_rec.status == "PENDING_REVIEW"

    # Step 6: Verify Grounded Gemini Explanation
    explanation_res = gemini_service.explain_recommendation(target_rec.id, language="en")
    assert explanation_res["recommendation_id"] == target_rec.id
    assert "800" in explanation_res["explanation"] or "800" in str(explanation_res["grounded_facts"])
    assert explanation_res["grounded_facts"]["source_projected_surplus"] >= 1800

    # Step 7: Human Officer Review & Modification (800 -> 500 units)
    mod_result = approval_service.process_action(
        recommendation_id=target_rec.id,
        action="MODIFY",
        reviewer_id="DHO-CHENNAI-01",
        reviewer_name="Dr. Rajesh Kumar",
        reviewer_role="District Health Officer",
        modified_quantity=500,
        reason="Maintain additional local emergency reserve."
    )
    assert mod_result["status"] == "MODIFIED_APPROVED"
    assert mod_result["audit_id"].startswith("AUD-2026-")

    # Step 8: Verify Inventory Update
    inv_after = repo.get_inventory_item("PHC-021", "MED-ORS")
    assert inv_after.current_stock == 850 + 500  # 1350 units

    # Step 9: Verify Destination Risk Reduction
    new_stress = metrics_service.calculate_hrsi("PHC-021")
    assert new_stress.stress_index < sim_result["metrics_after"]["hrsi_score"]

    # Step 10: Verify Immutable Audit Trail
    audit_trail = repo.get_audit_trail(limit=50)
    approval_event = next((e for e in audit_trail if e.event_id == mod_result["audit_id"]), None)
    assert approval_event is not None
    assert approval_event.actor_role == "District Health Officer"
    assert approval_event.reason == "Maintain additional local emergency reserve."
    assert approval_event.previous_value["original_quantity"] == 800
    assert approval_event.new_value["approved_quantity"] == 500
