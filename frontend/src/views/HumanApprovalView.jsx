import React, { useState, useEffect } from 'react';
import { CheckSquare, ShieldCheck, Edit3, XCircle, ArrowUpRight, AlertCircle } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { ApprovalModal } from '../components/ApprovalModal';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function HumanApprovalView() {
  const { currentRole, setReviewRecommendation, reviewRecommendation } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');

  useEffect(() => {
    loadRecommendations();
  }, [statusFilter]);

  const loadRecommendations = async () => {
    try {
      const data = await api.getRecommendations(statusFilter === 'ALL' ? null : statusFilter);
      setRecommendations(data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Human-in-the-Loop Governance & Authorization Queue</h2>
          <div className="page-desc">
            Mandatory human review gate: AI models formulate redistribution directives, but authorized health officers retain sole authority to Approve, Modify, Reject, or Escalate
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['PENDING_REVIEW', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                background: statusFilter === f ? 'var(--accent-cyan)' : 'var(--bg-input)',
                color: statusFilter === f ? '#000' : 'var(--text-secondary)'
              }}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Role Authority Banner */}
      <div className="card" style={{ background: 'var(--bg-secondary)', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              Current Reviewer Profile: {currentRole.name} ({currentRole.level} Level)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Authority Level: {currentRole.canApprove ? 'Authorized for Resource Movement Execution' : 'Read-Only Inspection Privileges'} · Dual Authorization Enforced for transfers ≥ 1,000 units.
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
            ● Audit Trail Cryptographically Sealed
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Route (Source → Destination)</th>
                <th>Recommended Quantity</th>
                <th>Estimated Transit</th>
                <th>Dual Auth Needed</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{r.id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{r.resource}</td>
                  <td>
                    <div>{r.source_name} ➔</div>
                    <div style={{ color: '#ef4444', fontWeight: 600 }}>{r.destination_name}</div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {r.quantity} units
                  </td>
                  <td>{r.transport_time_hours} hrs</td>
                  <td>
                    {r.requires_dual_auth ? (
                      <span style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        YES (≥1,000)
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Single Auth</span>
                    )}
                  </td>
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
                      Inspect & Review
                    </button>
                  </td>
                </tr>
              ))}
              {recommendations.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No redistribution items pending approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
