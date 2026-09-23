# RESILIHEALTH AI: System Architecture

## Executive Summary
**ResiliHealth AI** is a federated AI decision-intelligence platform engineered for India's Primary Health Centre (PHC) networks and architected to scale cross-border across BRICS nations. The system links real-time clinical logistics surveillance with decentralized machine learning and Google Gemini-grounded reasoning, enforcing strict human-in-the-loop governance for all resource movements.

```
                    ┌──────────────────────────────────────────────┐
                    │       NATIONAL / BRICS COMMAND LAYER        │
                    │   - National Surveillance KPIs               │
                    │   - Google Gemini Operations Copilot         │
                    │   - Global FedAvg Aggregated Model v1.3      │
                    └──────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │                                     │
          ┌─────────────▼─────────────┐         ┌─────────────▼─────────────┐
          │     STATE HUB: TAMIL NADU  │         │   STATE HUB: KARNATAKA    │
          │  - District A (Chennai)    │         │  - Bengaluru Urban        │
          │  - District B (Kanchipuram)│         │  - Mysuru                 │
          │  - Local Model Training    │         │  - Local Model Training   │
          └─────────────┬─────────────┘         └─────────────┬─────────────┘
                        │                                     │
          ┌─────────────▼─────────────┐         ┌─────────────▼─────────────┐
          │   PHC OPERATIONAL LEVEL   │         │   PHC OPERATIONAL LEVEL   │
          │  - Medicine Inventories   │         │  - Medicine Inventories   │
          │  - Real-time Bed Status   │         │  - Real-time Bed Status   │
          │  - Staff Attendance/Avail │         │  - Staff Attendance/Avail │
          │  - 30-Day Footfall Telemet│         │  - 30-Day Footfall Telemet│
          └───────────────────────────┘         └───────────────────────────┘
```

---

## 1. End-to-End Decision Intelligence Pipeline ("Golden Path")

1. **Local Operational Telemetry**: Each PHC continuously logs medicine stocks, bed occupancy, staff presence vs active availability, and daily patient footfall.
2. **Decentralized Machine Learning**: A `GradientBoostingRegressor` predicts 7-day and 14-day demand curves, computing acute depletion thresholds.
3. **Threshold & Risk Detection**: When projected consumption outstrips inventory, days-of-stock falls below 5.0, generating a `HIGH RISK` or `CRITICAL` alert.
4. **Health Resource Stress Index (HRSI)**:
   $$\text{HRSI} = 0.35 \times \text{ShortageRisk} + 0.25 \times \text{BedOccupancy} + 0.20 \times \text{PatientSurge} + 0.20 \times \text{StaffDeficit}$$
5. **Multi-Factor Redistribution Optimization**: Scans surrounding district nodes for certified surplus, transit viability, and safety buffer requirements.
6. **Google Gemini Grounded Briefing**: Synthesizes factual clinical explanations in English, Hindi, or Tamil without hallucination.
7. **Human-in-the-Loop Gate**: An authorized District Health Officer reviews evidence, approves, modifies quantity with a mandatory justification, rejects, or escalates.
8. **Simulated Logistics Dispatch**: A secure tracking code (`TRK-XXXXXXXX`) is minted, source stock is deducted, destination stock is replenished, and destination risk resolves.
9. **Immutable Audit Ledger**: An append-only record (`AUD-2026-XXXXX`) captures the complete audit trail.
10. **Federated Learning Synchronization**: Regional hubs compute local gradient updates and submit them to the FedAvg aggregator without centralizing raw operational data.

---

## 2. Component Directory Architecture

```
backend/
├── app/
│   ├── main.py                    # FastAPI application gateway & middleware
│   ├── config.py                  # Environment config, Gemini model, dual-auth thresholds
│   ├── models/                    # Pydantic data schemas
│   │   ├── healthcare.py          # State, District, PHC, Inventory, Bed, Personnel, Alert
│   │   ├── forecast.py            # Forecast request/response, DailyForecast, StressIndex
│   │   ├── redistribution.py      # Recommendations, Approvals, Transfer records
│   │   ├── audit.py               # Append-only AuditEvent schema
│   │   └── federated.py           # FederatedNode, FederatedRound schemas
│   ├── db/
│   │   ├── repository.py          # Thread-safe in-memory store with JSON persistence
│   │   └── seed_data.py           # 48 PHCs across 8 districts and 4 Indian states
│   ├── services/
│   │   ├── metrics_service.py     # Days-of-stock, Bed occupancy, HRSI formula
│   │   ├── forecasting_service.py # Scikit-learn GradientBoostingRegressor
│   │   ├── optimizer_service.py   # Multi-factor shortage-surplus rebalancer
│   │   ├── federated_service.py   # 4-node FedAvg decentralized parameter aggregation
│   │   ├── approval_service.py    # Human governance with dual authorization
│   │   ├── gemini_service.py      # Grounded Gemini copilot & multilingual translator
│   │   └── emergency_service.py   # Dengue outbreak surge simulation engine
│   └── routers/                   # REST API routers
└── tests/                         # Automated pytest suite & Golden Path verification

frontend/
├── src/
│   ├── api/client.js              # API client connecting to FastAPI backend
│   ├── context/AppContext.jsx     # Global operational state & role switcher
│   ├── components/                # Command-center visual components
│   └── views/                     # 17 operational modules
```
