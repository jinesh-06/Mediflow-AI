import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';
import { api } from '../api/client';

export function AuditTrailView() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAudit();
  }, []);

  const loadAudit = async () => {
    try {
      const data = await api.getAuditTrail(100);
      setEvents(data);
    } catch (err) {
      console.error('Error loading audit events:', err);
    }
  };

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.event_id.toLowerCase().includes(q) ||
      e.event_type.toLowerCase().includes(q) ||
      e.actor_name.toLowerCase().includes(q) ||
      (e.reason && e.reason.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Immutable Public Health Audit Trail & Governance Log</h2>
          <div className="page-desc">
            Append-only cryptographically verifiable chronological record of AI recommendations, human approvals, modifications, and logistical executions
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Audit ID (AUD-2026-...), Actor, Role, or Reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Timestamp (UTC)</th>
                <th>Event Type</th>
                <th>Authorized Actor</th>
                <th>Role Tier</th>
                <th>Operational Rationale</th>
                <th>Decision Delta (Original → Modified)</th>
                <th>Model Version</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const prevQty = e.previous_value?.original_quantity || e.previous_value?.quantity;
                const newQty = e.new_value?.approved_quantity || e.new_value?.quantity;

                return (
                  <tr key={e.event_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {e.event_id}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: e.event_type.includes('APPROVED') ? 'rgba(16, 185, 129, 0.15)' : (e.event_type.includes('MODIFIED') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.06)'),
                        color: e.event_type.includes('APPROVED') ? '#10b981' : (e.event_type.includes('MODIFIED') ? '#f59e0b' : 'var(--text-primary)')
                      }}>
                        {e.event_type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{e.actor_name}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{e.actor_role}</td>
                    <td style={{ maxWidth: '280px', fontSize: '12px', lineHeight: 1.4 }}>
                      {e.reason || 'Standard operational directive execution.'}
                    </td>
                    <td>
                      {prevQty && newQty ? (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{prevQty}</span>
                          {' ➔ '}
                          <span style={{ color: '#10b981', fontWeight: 700 }}>{newQty} units</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Baseline</span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {e.model_version || 'sys-core-v1.0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
