# Federated Learning Architecture & BRICS Scalability

## 1. Decentralized Paradigm
In traditional healthcare management, centralizing raw patient records, local operational data, or hospital supply details across administrative jurisdictions creates severe legal, sovereign, and privacy risks.

**ResiliHealth AI** solves this through **Federated Learning (FL)**:
```
           [ Node 1: Tamil Nadu ]       [ Node 2: Karnataka ]
              Local Data: 3,600            Local Data: 3,600
              Local Weights: w_1           Local Weights: w_2
                        │                            │
                        ▼                            ▼
              ┌──────────────────────────────────────────────┐
              │          FEDERATED AGGREGATOR (FedAvg)       │
              │   w_global = sum( (n_k / N) * w_k )          │
              └──────────────────────┬───────────────────────┘
                                     │
                        ▲            │               ▲
                        │            ▼               │
           [ Node 3: Maharashtra ]      [ Node 4: West Bengal ]
              Local Data: 3,600            Local Data: 3,600
              Local Weights: w_3           Local Weights: w_4
```

---

## 2. Mathematical Aggregation: FedAvg (McMahan et al.)
Let $K = 4$ represent the regional state nodes. Each node $k$ possesses $n_k$ localized training samples with total dataset size $N = \sum_{k=1}^K n_k$.

In each communication round $t$:
1. The global coordinator broadcasts current weights $w^{(t)}$ to all regional nodes.
2. Each node executes local Stochastic Gradient Descent (SGD) for $E$ epochs on its localized partition:
   $$w_k^{(t+1)} \leftarrow w_k^{(t)} - \eta \nabla \mathcal{L}_k(w_k^{(t)})$$
3. Nodes transmit only numerical parameter vectors $w_k^{(t+1)}$ back to the coordinator.
4. The coordinator executes weighted parameter averaging:
   $$w^{(t+1)} = \sum_{k=1}^K \frac{n_k}{N} w_k^{(t+1)}$$
5. The updated global parameters $w^{(t+1)}$ are updated and versioned as `demand-model-v1.{round+2}`.

---

## 3. Extension to BRICS Nations
The same node abstraction extends seamlessly to multinational alliances:
- **India**: AIIMS / ICMR Central Health Gateway
- **Brazil**: DATASUS / Fiocruz Federated Gateway
- **Russia**: National Medical Research Radiological Centre
- **China**: National Health Commission Data Center
- **South Africa**: National Health Laboratory Service (NHLS)

Differential Privacy with Laplace noise ($\epsilon = 0.5$) is applied to weight differentials before cross-border transmission, ensuring mathematical privacy guarantees.
