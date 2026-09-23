# AI Governance & Human-in-the-Loop Architecture

## 1. Core Principle: Zero Autonomous Execution
In life-critical public healthcare logistics, **AI MUST NEVER execute resource movement autonomously**. 

The boundary of artificial intelligence is strictly delimited:
- AI **Detects** shortages and surges.
- AI **Predicts** stock-out horizons.
- AI **Formulates** redistribution recommendations.
- AI **Explains** clinical and logistical reasoning.

An **authorized human health officer** must:
- **Review** operational evidence.
- **Approve**, **Modify**, **Reject**, or **Escalate** every individual directive.

---

## 2. Modification Rules & Dual Authorization
1. **Mandatory Modification Reason**: If an officer modifies a recommended quantity (e.g. from 800 to 500 units), the system strictly requires a formal operational justification.
2. **Preservation of Original AI Recommendation**: The original recommendation quantity and rationale are never overwritten or deleted from the audit ledger.
3. **Dual Authorization Threshold**: Shipments exceeding 1,000 units automatically trigger a two-tier dual authorization protocol requiring secondary clearance from a State Coordinator or National Administrator.

---

## 3. Append-Only Audit Trail
Every significant operational action generates an immutable event with a format:
`AUD-2026-XXXXX`

Captured attributes:
- Event ID, Event Type, Timestamp (UTC)
- Actor ID, Actor Name, Actor Role
- Previous State / Value vs New State / Value
- Operational Justification
- Model Name & Model Version (`demand-model-v1.3`, `optimizer-v1.0`)
