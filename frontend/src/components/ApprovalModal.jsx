import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Edit3, XCircle, ArrowUpRight, ShieldAlert, Bot } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function ApprovalModal({ recommendation, onClose, onActionComplete }) {
  const { currentRole, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'gemini'
  const [geminiExplanation, setGeminiExplanation] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [actionType, setActionType] = useState(null); // 'MODIFY' | 'REJECT' | null
  const [modifiedQty, setModifiedQty] = useState(recommendation?.quantity || 500);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setModifiedQty(recommendation.quantity === 800 ? 500 : Math.round(recommendation.quantity * 0.75));
      loadGeminiExplanation();
    }
  }, [recommendation]);

  const loadGeminiExplanation = async () => {
    if (!recommendation) return;
    setLoadingGemini(true);
    try {
      const res = await api.explainRecommendation(recommendation.id, 'en');
      setGeminiExplanation(res);
    } catch (err) {
      console.error('Error fetching Gemini explanation:', err);
    } finally {
      setLoadingGemini(false);
    }
  };

  if (!recommendation) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await api.approveRecommendation(recommendation.id, {
        reviewer_id: `OFFICER-${currentRole.id}`,
        reviewer_name: currentRole.name,
        reviewer_role: currentRole.name,
        reason: 'Authorized according to standard epidemiological rebalancing protocol.'
      });
      showToast(`Recommendation Approved! Audit Event Created: ${res.audit_id}`, 'success');
      onActionComplete(res);
      onClose();
    } catch (err) {
      showToast(`Approval failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModifyAndApprove = async () => {
    if (!reason.trim()) {
      showToast('A formal operational reason is mandatory when modifying AI recommendations.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.modifyRecommendation(recommendation.id, {
        reviewer_id: `OFFICER-${currentRole.id}`,
        reviewer_name: currentRole.name,
        reviewer_role: currentRole.name,
        modified_quantity: parseInt(modifiedQty, 10),
        reason: reason.trim()
      });
      showToast(`Recommendation Modified & Executed! Audit Event: ${res.audit_id}`, 'success');
      onActionComplete(res);
      onClose();
    } catch (err) {
      showToast(`Modification failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      showToast('A formal justification is mandatory when rejecting AI recommendations.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.rejectRecommendation(recommendation.id, {
        reviewer_id: `OFFICER-${currentRole.id}`,
        reviewer_name: currentRole.name,
        reviewer_role: currentRole.name,
        reason: reason.trim()
      });
      showToast(`Recommendation Rejected. Audit Event: ${res.audit_id}`, 'warning');
      onActionComplete(res);
      onClose();
    } catch (err) {
      showToast(`Rejection failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    setSubmitting(true);
    try {
      const res = await api.escalateRecommendation(recommendation.id, {
        reviewer_id: `OFFICER-${currentRole.id}`,
        reviewer_name: currentRole.name,
        reviewer_role: currentRole.name,
        reason: 'Escalated for cross-district authorization.'
      });
      showToast(`Recommendation Escalated. Audit Event: ${res.audit_id}`, 'info');
      onActionComplete(res);
      onClose();
    } catch (err) {
      showToast(`Escalation failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              Resource Redistribution Governance Review
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              REC ID: {recommendation.id} · Priority: {recommendation.priority}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'details' ? '2px solid var(--accent-cyan)' : 'none',
              color: activeTab === 'details' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Operational Evidence
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'gemini' ? '2px solid var(--accent-cyan)' : 'none',
              color: activeTab === 'gemini' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Bot size={14} />
            Gemini Grounded Reasoning
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'details' ? (
            <>
              {/* Transfer Pathway Box */}
              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source Surplus Hub</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{recommendation.source_name}</div>
                    <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>
                      Surplus: +{recommendation.source_projected_surplus} units
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', color: 'var(--accent-cyan)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {recommendation.quantity} units
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ~{recommendation.transport_time_hours}h transit
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Shortage Center</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{recommendation.destination_name}</div>
                    <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                      Stockout: ~{recommendation.destination_stockout_days} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Algorithmic Reason */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Algorithmic Rationale & Impact
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                  {recommendation.reason}
                </p>
              </div>

              {/* Modification Form if user clicked Modify */}
              {actionType === 'MODIFY' && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                    Human Modification Parameters (AI Recommended: {recommendation.quantity} units)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Approved Quantity:</label>
                    <input
                      type="number"
                      value={modifiedQty}
                      onChange={(e) => setModifiedQty(e.target.value)}
                      className="input-field"
                      style={{ width: '120px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Mandatory Operational Justification:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maintain additional local emergency reserve."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              {/* Rejection Form if user clicked Reject */}
              {actionType === 'REJECT' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '14px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
                    Rejection Justification Required
                  </div>
                  <input
                    type="text"
                    placeholder="Provide reason for declining AI rebalancing recommendation..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}
            </>
          ) : (
            <div>
              {loadingGemini ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Calling Gemini Grounded Reasoning Engine...
                </div>
              ) : geminiExplanation ? (
                <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: '13px' }}>
                  {geminiExplanation.explanation}
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>No explanation available.</div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {actionType === 'MODIFY' ? (
            <>
              <button onClick={() => setActionType(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleModifyAndApprove} className="btn btn-warning" disabled={submitting}>
                <Edit3 size={14} />
                Confirm Modified Transfer ({modifiedQty} units)
              </button>
            </>
          ) : actionType === 'REJECT' ? (
            <>
              <button onClick={() => setActionType(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReject} className="btn btn-danger" disabled={submitting}>
                <XCircle size={14} />
                Confirm Rejection
              </button>
            </>
          ) : (
            <>
              <button onClick={handleEscalate} className="btn btn-secondary" disabled={submitting} title="Escalate to State Coordinator">
                <ArrowUpRight size={14} />
                Escalate
              </button>
              <button onClick={() => setActionType('REJECT')} className="btn btn-danger" disabled={submitting}>
                <XCircle size={14} />
                Reject
              </button>
              <button onClick={() => setActionType('MODIFY')} className="btn btn-warning" disabled={submitting}>
                <Edit3 size={14} />
                Modify
              </button>
              <button onClick={handleApprove} className="btn btn-success" disabled={submitting}>
                <CheckCircle size={14} />
                Approve ({recommendation.quantity} units)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
