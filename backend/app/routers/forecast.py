from fastapi import APIRouter, HTTPException
from app.models.forecast import ForecastRequest, ForecastResponse
from app.services.forecasting_service import forecasting_service
from app.db.repository import repo

router = APIRouter(prefix="/api/forecast", tags=["Machine Learning Demand Forecasting"])

@router.post("", response_model=ForecastResponse)
def generate_forecast(req: ForecastRequest):
    try:
        return forecasting_service.forecast_demand(
            phc_id=req.phc_id,
            medicine_id=req.medicine_id,
            horizon_days=req.horizon_days
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{phc_id}")
def get_phc_forecasts(phc_id: str):
    phc = repo.get_phc(phc_id)
    if not phc:
        raise HTTPException(status_code=404, detail="PHC not found")
    
    medicines = repo.get_medicines()
    results = []
    for m in medicines:
        try:
            fc = forecasting_service.forecast_demand(phc_id, m.id, horizon_days=7)
            results.append(fc)
        except Exception:
            continue
    return results
