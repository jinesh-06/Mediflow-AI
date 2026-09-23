# RESILIHEALTH AI
### *"Federated AI Decision Intelligence for Resilient Public Healthcare Supply Chains"*

**India-First · BRICS-Ready**

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3+-orange.svg)](https://scikit-learn.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Integrated-4285f4.svg)](https://ai.google.dev/)
[![Federated Learning](https://img.shields.io/badge/Federated%20Learning-FedAvg-purple.svg)](#federated-learning)

---

## 1. Problem Statement & Motivation
Public healthcare networks across developing nations face chronic supply-chain vulnerabilities. Across Primary Health Centres (PHCs) and Community Health Centres (CHCs), administrators struggle with:
- **Medicine Stock-Outs**: Essential pharmaceuticals (e.g., ORS, antibiotics, insulin) unexpectedly run dry due to delayed detection of surge demand.
- **Bed Saturation & Staff Mismatch**: Facility overcrowding during outbreaks with no visibility into neighboring district capacity.
- **Delayed Cross-District Coordination**: Surplus supplies in District B sit unused while District A enters a critical supply deficit.
- **Privacy & Jurisdictional Silos**: Centralizing sensitive patient data into a single monolithic database creates severe sovereign, regulatory, and legal hurdles.

---

## 2. The ResiliHealth AI Solution
**ResiliHealth AI** is not merely a dashboard; it is a **closed-loop AI decision-intelligence layer**:

```
PHC DATA TELEMETRY
       ↓
LOCAL DATA PROCESSING
       ↓
FEDERATED LEARNING (FedAvg across 4 State Nodes)
       ↓
ML DEMAND FORECASTING (GradientBoostingRegressor)
       ↓
EARLY WARNING RISK DETECTION
       ↓
RESOURCE REDISTRIBUTION OPTIMIZER
       ↓
GOOGLE GEMINI GROUNDED EXPLANATION
       ↓
HUMAN GOVERNANCE GATE (Approve / Modify / Reject / Escalate)
       ↓
SIMULATED DISPATCH & INVENTORY UPDATE
       ↓
IMMUTABLE AUDIT TRAIL (AUD-2026-XXXXX)
```

---

## 3. Core Architectural Capabilities

### A. Health Resource Stress Index (HRSI) — Operational Metric
$$\text{HRSI} = 0.35 \times \text{ShortageRisk} + 0.25 \times \text{BedOccupancy} + 0.20 \times \text{PatientSurge} + 0.20 \times (1 - \text{StaffAvailability})$$
- `0–30`: **STABLE** (Green)
- `31–50`: **WATCH** (Amber)
- `51–70`: **HIGH** (Orange)
- `71–100`: **CRITICAL** (Red)

### B. Machine Learning Demand Forecasting
- Model: Trained `GradientBoostingRegressor` (`demand-model-v1.3`).
- Generates 7-day and 14-day daily consumption curves with $\pm 95\%$ confidence bounds and computes acute stock-out horizons:
  $$\text{stockout\_days} = \frac{\text{current\_stock}}{\text{expected\_daily\_consumption}}$$

### C. Federated Learning (FedAvg) Cluster
- 4 Regional State Hubs: **Tamil Nadu**, **Karnataka**, **Maharashtra**, and **West Bengal**.
- Nodes train localized models on on-premise records.
- **Zero raw operational data is pooled centrally**; only numerical weights/gradients are averaged via McMahan's FedAvg algorithm.

### D. Google Gemini Grounding & Multilingual Operations Copilot
- Grounded context injection: Fetches verified inventory records and transit times into the system prompt to **prevent hallucination**.
- Multilingual support: Generates explanations in **English**, **Hindi (हिंदी)**, and **Tamil (தமிழ்)**.
- Robust deterministic fallback when offline.

### E. Human-in-the-Loop Governance & Audit Trail
- **Zero Autonomous Transfers**: AI formulates recommendations; authorized health officers retain exclusive authority to **Approve**, **Modify** (with mandatory reason), **Reject**, or **Escalate**.
- **Dual Authorization**: Shipments $\ge 1,000$ units require secondary clearance.
- **Append-Only Audit Trail**: Cryptographically traceable records (`AUD-2026-XXXXX`) preserve the original AI recommendation alongside human modifications.

### F. India-First · BRICS-Ready Scalability
The decentralized node abstraction scales hierarchical tiers:
$$\text{PHC} \longrightarrow \text{District} \longrightarrow \text{State} \longrightarrow \text{National (India)} \longrightarrow \text{BRICS Gateway}$$
Partners: India (AIIMS/ICMR), Brazil (DATASUS/Fiocruz), Russia, China (NHC), South Africa (NHLS).

---

## 4. Technology Stack & Licensing

| Component | Technology | License |
|---|---|---|
| **Backend API Gateway** | FastAPI, Uvicorn, Pydantic | MIT License |
| **Machine Learning** | Scikit-Learn (Gradient Boosting), NumPy, Pandas | BSD-3-Clause |
| **GenAI & LLM Grounding** | Google GenAI SDK (`gemini-2.5-flash`) | Apache-2.0 |
| **Frontend SPA** | React 18, Vite 5, Custom Command-Center Design | MIT License |
| **Visual Indicators** | Lucide React Icons | ISC License |

---

## 5. Quick Start & Local Execution

### Prerequisites
- Python 3.11+
- Node.js 18+ (npm 9+)

### Installation

1. **Clone and Enter Workspace**:
   ```bash
   git clone <repo-url>
   cd Mediflow-AI
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   copy .env.example .env
   # Add your GEMINI_API_KEY in .env (optional: fallback engine works offline)
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

**Option 1: One-Click PowerShell Script**
```powershell
./run_demo.ps1
```

**Option 2: Manual Terminal Execution**
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```

Access the interfaces:
- **Command Center Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Interactive REST Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 6. Automated Testing & Verification
Execute the test suite to verify the end-to-end Golden Path:
```bash
python -m pytest backend/tests -v
```
All 7 test suites verify:
- Days-of-stock and bed occupancy formulas
- Composite HRSI calculation
- 4-Node Federated Learning parameter aggregation
- BRICS scalability schema
- **Complete End-to-End Golden Path** (PHC-021 ORS 850 units $\rightarrow$ 4.2d stockout $\rightarrow$ High Risk alert $\rightarrow$ District B transfer $\rightarrow$ Gemini explanation $\rightarrow$ Officer modification $\rightarrow$ Inventory update $\rightarrow$ Audit trail).

---

## 7. Project Documentation Index
- [Architecture Blueprint](docs/architecture.md)
- [API Contracts & Endpoints](docs/api.md)
- [Federated Learning & FedAvg](docs/federated-learning.md)
- [AI Governance & Human-in-the-Loop Rules](docs/ai-governance.md)
- [3-Minute Demonstration Script](docs/demo-script.md)
- [Production Deployment Guide](docs/deployment.md)

---

## 8. Responsible AI & Public Health Safety
> [!IMPORTANT]
> **Clinical Disclaimer**: ResiliHealth AI is an operational logistics and supply-chain decision-support system. It does not diagnose medical conditions, prescribe pharmaceutical treatments, or replace qualified medical personnel. All resource movements require explicit human authorization.
