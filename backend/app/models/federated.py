from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class FederatedNode(BaseModel):
    id: str
    name: str
    state_id: str
    country: str = "India"
    node_type: str = "REGIONAL_HUB"  # REGIONAL_HUB, NATIONAL_COORDINATOR, BRICS_PARTNER
    phc_count: int
    local_samples_count: int
    status: str = "ACTIVE"  # ACTIVE, TRAINING, SYNCHRONIZING, OFFLINE
    last_round_loss: float
    last_round_accuracy: float
    model_version: str

class FederatedRound(BaseModel):
    round_number: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    participating_nodes: List[str]
    aggregation_strategy: str = "FedAvg (Federated Averaging)"
    global_model_version: str
    mean_mae: float
    mean_rmse: float
    total_samples: int
    status: str = "COMPLETED"
    notes: str = "Decentralized weights aggregated; zero raw operational patient/inventory data transferred."

class FederatedTrainingRequest(BaseModel):
    epochs_per_node: int = 3
    learning_rate: float = 0.01
    participating_node_ids: Optional[List[str]] = None
