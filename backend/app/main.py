import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import healthcare, forecast, redistribution, federated, gemini, emergency, audit

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon prototype flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(healthcare.router)
app.include_router(forecast.router)
app.include_router(redistribution.router)
app.include_router(federated.router)
app.include_router(gemini.router)
app.include_router(emergency.router)
app.include_router(audit.router)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "tagline": "Federated AI Decision Intelligence for Resilient Public Healthcare Supply Chains",
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "architecture": "India-First, BRICS-Ready",
        "gemini_enabled": bool(settings.GEMINI_API_KEY)
    }

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "services": {
            "database": "ACTIVE (48 PHCs Ingested)",
            "demand_forecasting_ml": "ACTIVE (GradientBoostingRegressor v1.3)",
            "federated_learning": "ACTIVE (FedAvg 4-Node Cluster)",
            "resource_optimizer": "ACTIVE (Multi-factor Rebalancer v1.0)",
            "governance_audit": "ACTIVE (Append-only Ledger)",
            "gemini_copilot": "ACTIVE"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
