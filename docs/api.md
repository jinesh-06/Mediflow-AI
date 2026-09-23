# RESILIHEALTH AI: API Contract & Endpoint Specification

Base URL: `http://localhost:8000/api`
Interactive Swagger Docs: `http://localhost:8000/docs`

---

## 1. Healthcare Operational Endpoints

### `GET /api/states`
Returns all 4 administered Indian states (Tamil Nadu, Karnataka, Maharashtra, West Bengal).

### `GET /api/districts?state_id={state_id}`
Returns administered districts with foreign key references to states.

### `GET /api/phcs?district_id={district_id}&state_id={state_id}`
Returns PHCs within specified district or state.

### `GET /api/phcs/{phc_id}`
Returns complete operational telemetry for a given PHC, including beds, personnel, current inventory, days of stock remaining, and 14-day footfall.

### `GET /api/inventory?phc_id={phc_id}&medicine_id={medicine_id}`
Returns live inventory records across facilities with computed `days_of_stock_remaining`.

### `POST /api/inventory/update`
```json
{
  "phc_id": "PHC-021",
  "medicine_id": "MED-ORS",
  "delta": 500,
  "reason": "Replenishment via transfer"
}
```

### `GET /api/beds?phc_id={phc_id}`
Returns total, occupied, reserved, maintenance, available beds, and occupancy percentage.

### `POST /api/beds/update`
```json
{
  "phc_id": "PHC-021",
  "occupied": 28,
  "reserved": 2,
  "maintenance": 1
}
```

### `GET /api/personnel?phc_id={phc_id}&role={role}`
Returns personnel records distinguishing physical attendance (`PRESENT`, `ABSENT`) from active availability (`AVAILABLE`, `ENGAGED_EMERGENCY`).

### `GET /api/metrics/national`
Returns command-center KPIs across all 48 PHCs.

### `GET /api/metrics/hrsi/{phc_id}`
Returns computed Health Resource Stress Index (HRSI: 0–100) and risk category (`STABLE`, `WATCH`, `HIGH`, `CRITICAL`).

---

## 2. Machine Learning Demand Forecasting

### `POST /api/forecast`
Request:
```json
{
  "phc_id": "PHC-021",
  "medicine_id": "MED-ORS",
  "horizon_days": 7
}
```
Response:
```json
{
  "phc_id": "PHC-021",
  "medicine_id": "MED-ORS",
  "medicine_name": "ORS (Oral Rehydration Salts)",
  "current_stock": 850,
  "expected_daily_consumption": 202.4,
  "predicted_demand_7d": 1240.0,
  "stockout_days": 4.2,
  "expected_stockout_date": "2026-09-27",
  "risk": "HIGH",
  "confidence": 0.91,
  "model_name": "ResiliHealth-GradientBoost-Forecaster",
  "model_version": "demand-model-v1.3",
  "daily_predictions": [
    { "day": 1, "predicted_demand": 172.5, "lower_bound": 158.7, "upper_bound": 186.3 }
  ]
}
```

---

## 3. Resource Redistribution & Governance

### `POST /api/redistribution/recommend`
Triggers multi-factor optimization engine to generate redistribution directives.

### `GET /api/recommendations?status={status}`
Returns generated recommendations filtered by status (`PENDING_REVIEW`, `APPROVED`, `MODIFIED`, `REJECTED`, `ESCALATED`).

### `POST /api/recommendations/{id}/approve`
Executes transfer for the recommended quantity and updates inventory.

### `POST /api/recommendations/{id}/modify`
Request:
```json
{
  "reviewer_id": "DHO-001",
  "reviewer_name": "Dr. Rajesh Kumar",
  "reviewer_role": "District Health Officer",
  "modified_quantity": 500,
  "reason": "Maintain additional local emergency reserve."
}
```

### `POST /api/recommendations/{id}/reject`
Requires mandatory operational justification to decline recommendation.

---

## 4. Federated Learning Engine

### `GET /api/federated/status`
Returns status of 4 decentralized nodes (Tamil Nadu, Karnataka, Maharashtra, West Bengal), global parameter weights, and FedAvg round convergence history.

### `POST /api/federated/train-round`
Executes decentralized round:
```json
{
  "epochs_per_node": 3,
  "learning_rate": 0.01
}
```

---

## 5. Google Gemini Grounding & Explanations

### `POST /api/gemini/explain`
Returns grounded, hallucination-free explanation for a recommendation in `en` (English), `hi` (Hindi), or `ta` (Tamil).

### `POST /api/gemini/copilot`
```json
{
  "query": "Why is District A at high risk?",
  "language": "en"
}
```
