import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, ShieldCheck, Database, Layers, ArrowDown } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function FederatedMonitor() {
  const { showToast } = useApp();
  const [flStatus, setFlStatus] = useState(null);
  const [training, setTraining] = useState(false);

  useEffect(() => {
    loadFederatedStatus();
  }, []);

  const loadFederatedStatus = async () => {
    try {
      const data = await api.getFederatedStatus();
      setFlStatus(data);
    } catch (err) {
      console.error('Error loading federated status:', err);
    }
  };

  const handleTrainRound = async () => {
    setTraining(true);
    try {
      const res = await api.trainFederatedRound(3, 0.01);
      showToast(`FedAvg Round ${res.round_number} completed across all 4 regional hubs.`, 'success');
      loadFederatedStatus();
    } catch (err) {
      showToast(`Federated round failed: ${err.message}`, 'error');
    } finally {
      setTraining(false);
    }
  };

  if (!flStatus) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Connecting to Federated Learning Aggregation Coordinator...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Federated Learning Coordination & Aggregation Center</h2>
          <div className="page-desc">
            Decentralized predictive model training across 4 regional state nodes using Federated Averaging (FedAvg) without centralizing raw operational data
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleTrainRound} className="btn btn-primary" disabled={training}>
            <RefreshCw size={14} className={training ? 'spin-anim' : ''} />
            Execute Decentralized FedAvg Round
          </button>
        </div>
      </div>

      {/* Privacy Guarantee Statement (Section 44) */}
      <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid #10b981' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={22} style={{ color: '#10b981', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              Decentralized Edge Privacy Guarantee
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Raw local operational healthcare and patient records strictly remain at the local regional node; only numerical model weights and gradient vectors are communicated to the coordinator.
            </div>
          </div>
        </div>
      </div>

      {/* 4 Decentralized Regional Nodes */}
      <div className="card-header" style={{ marginBottom: '-8px' }}>
        <div className="card-title">
          <Layers size={16} style={{ color: 'var(--accent-cyan)' }} />
          Participating Decentralized Regional Nodes ({flStatus.participating_nodes.length})
        </div>
      </div>

      <div className="grid-cols-4">
        {flStatus.participating_nodes.map((node) => (
          <div key={node.id} className="card" style={{ borderTop: '3px solid var(--accent-blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                {node.id}
              </span>
              <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                ● {node.status}
              </span>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '8px 0 2px 0' }}>
              {node.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {node.phc_count} PHCs · {node.local_samples_count.toLocaleString()} Local Samples
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '6px', margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Local Loss:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 600 }}>{node.last_round_loss}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Local Accuracy:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 600 }}>{Math.round(node.last_round_accuracy * 100)}%</span>
              </div>
            </div>

            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {node.model_version}
            </div>
          </div>
        ))}
      </div>

      {/* Global Aggregation Model Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
            Global Model Parameter State & Aggregation Weights ({flStatus.global_model_version})
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Strategy: {flStatus.aggregation_strategy}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', background: 'var(--bg-input)', padding: '14px', borderRadius: '8px' }}>
          {Object.entries(flStatus.current_global_weights).map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k}</div>
              <div style={{ fontSize: '16px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregation Rounds History */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Federated Averaging Round Convergence History
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Round #</th>
                <th>Global Model Version</th>
                <th>Participating Nodes</th>
                <th>Aggregated Samples</th>
                <th>Mean MAE Error</th>
                <th>Mean RMSE</th>
                <th>Aggregation Status</th>
              </tr>
            </thead>
            <tbody>
              {flStatus.rounds_history.map((r) => (
                <tr key={r.round_number}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    Round {r.round_number}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.global_model_version}</td>
                  <td>{r.participating_nodes.join(' · ')}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.total_samples.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#10b981' }}>{r.mean_mae}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.mean_rmse}</td>
                  <td>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                      ● {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
