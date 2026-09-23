import pytest
from app.services.metrics_service import metrics_service
from app.models.healthcare import Bed

def test_days_of_stock_calculation():
    # current_stock = 500, expected_daily_consumption = 100 -> 5.0 days
    dos = metrics_service.calculate_days_of_stock(500, 100.0)
    assert dos == 5.0
    
    # current_stock = 850, expected_daily_consumption = 202.4 -> 4.2 days
    dos_golden = metrics_service.calculate_days_of_stock(850, 202.4)
    assert dos_golden == 4.2

def test_bed_metrics():
    bed = Bed(
        phc_id="PHC-TEST",
        total_beds=40,
        occupied_beds=28,
        reserved_beds=4,
        maintenance_beds=2,
        available_beds=6
    )
    result = metrics_service.calculate_bed_metrics(bed)
    assert result["total_beds"] == 40
    assert result["occupied_beds"] == 28
    assert result["available_beds"] == 6
    assert result["occupancy_percentage"] == 70.0

def test_hrsi_calculation():
    stress = metrics_service.calculate_hrsi("PHC-021")
    assert 0.0 <= stress.stress_index <= 100.0
    assert stress.category in ("STABLE", "WATCH", "HIGH", "CRITICAL")
