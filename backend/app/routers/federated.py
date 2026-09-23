from fastapi import APIRouter
from app.models.federated import FederatedTrainingRequest, FederatedRound
from app.services.federated_service import federated_service

router = APIRouter(prefix="/api/federated", tags=["Federated Learning Engine"])

@router.get("/status")
def get_status():
    return federated_service.get_federated_status()

@router.post("/train-round", response_model=FederatedRound)
def execute_round(req: FederatedTrainingRequest):
    return federated_service.train_federated_round(
        epochs_per_node=req.epochs_per_node,
        learning_rate=req.learning_rate
    )

@router.get("/brics-architecture")
def get_brics_architecture():
    return federated_service.get_brics_architecture()
