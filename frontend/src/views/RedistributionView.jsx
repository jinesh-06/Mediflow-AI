import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, CheckCircle, ShieldCheck, ArrowRight, Bot } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { ApprovalModal } from '../components/ApprovalModal';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function RedistributionView() {
  const { setReviewRecommendation, reviewRecommendation, showToast } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunOptimizer = async () => {
    setLoading(true);
    try {
      const recs = await api.generateRecommendations();
      setRecommendations(recs);
      showToast(`Optimization run completed: ${recs.length} replenishment pathways synthesized.`, 'success');
    } catch (err) {
      showToast(`Optimization failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">AI Resource Redistribution & Rebalancing Engine</h2>
          <div className="page-desc">
            Multi-factor optimization balancing acute shortage severity, source surplus, transport logistics, and safety reserves
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRunOptimizer} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            Re-run Multi-Factor Optimizer
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Truck size={16} style={{ color: 'var(--accent-cyan)' }} />
            Algorithmic Redistribution Directives ({recommendations.length})
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Source Hub (Surplus)</th>
                <th>Destination Center (Shortage)</th>
                <th>Recommended Transfer</th>
                <th>Transit Time</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Human Governance</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{r.resource}</td>
                  <td>
                    <div>{r.source_name}</div>
                    <div style={{ fontSize: '11px', color: '#10b981' }}>
                      Surplus: +{r.source_projected_surplus} units
                    </div>
                  </td>
                  <td>
                    <div>{r.destination_name}</div>
                    <div style={{ fontSize: '11px', color: '#ef4444' }}>
                      Stockout in ~{r.destination_stockout_days} days
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {r.quantity} units
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{r.transport_time_hours} hrs</td>
                  <td><RiskBadge level={r.priority} size="small" /></td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: r.status === 'PENDING_REVIEW' ? '#f59e0b' : (r.status.includes('APPROVED') ? '#10b981' : '#ef4444')
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setReviewRecommendation(r)}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Review & Authorize
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human Review Modal */}
      {reviewRecommendation && (
        <ApprovalModal
          recommendation={reviewRecommendation}
          onClose={() => setReviewRecommendation(null)}
          onActionComplete={() => loadRecommendations()}
        />
      )}
    </div>
  );
}
