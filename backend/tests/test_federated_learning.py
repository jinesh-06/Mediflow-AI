import pytest
from app.services.federated_service import federated_service
from app.db.repository import repo

def test_federated_status():
    status = federated_service.get_federated_status()
    assert len(status["participating_nodes"]) == 4
    assert status["aggregation_strategy"].startswith("FedAvg")
    assert status["brics_scalability_ready"] is True

def test_federated_train_round():
    prev_round = federated_service.current_global_round
    fed_round = federated_service.train_federated_round(epochs_per_node=3, learning_rate=0.01)
    
    assert fed_round.round_number == prev_round + 1
    assert len(fed_round.participating_nodes) == 4
    assert fed_round.mean_mae > 0
    assert fed_round.total_samples > 0

def test_brics_architecture_spec():
    brics = federated_service.get_brics_architecture()
    assert "brics_nodes" in brics
    assert len(brics["brics_nodes"]) == 5
    countries = [node["country"] for node in brics["brics_nodes"]]
    assert "India" in countries
    assert "Brazil" in countries
    assert "South Africa" in countries
