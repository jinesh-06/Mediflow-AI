from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class ForecastRequest(BaseModel):
    phc_id: str
    medicine_id: str
    horizon_days: int = 7

class DailyForecast(BaseModel):
    day: int
    date: str
    predicted_demand: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    phc_id: str
    medicine_id: str
    medicine_name: str
    current_stock: int
    expected_daily_consumption: float
    predicted_demand_7d: float
    predicted_demand_14d: Optional[float] = None
    stockout_days: float
    expected_stockout_date: Optional[str] = None
    risk: str  # STABLE, WATCH, HIGH, CRITICAL
    confidence: float
    model_name: str = "ResiliHealth-GradientBoost-Forecaster"
    model_version: str = "demand-model-v1.3"
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    daily_predictions: List[DailyForecast] = []

class StressIndexResponse(BaseModel):
    phc_id: str
    phc_name: str
    district_id: str
    state_id: str
    stress_index: float  # 0 to 100
    category: str        # STABLE, WATCH, HIGH, CRITICAL
    medicine_risk_score: float
    bed_occupancy_ratio: float
    patient_surge_ratio: float
    staff_deficit_ratio: float
    critical_shortages: List[str] = []
