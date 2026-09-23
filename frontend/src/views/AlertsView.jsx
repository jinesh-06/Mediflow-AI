import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function AlertsView() {
  const { setSelectedPhcId, setActiveTab } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  useEffect(() => {
    loadAlerts();
  }, [severityFilter]);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts(severityFilter === 'ALL' ? null : severityFilter);
      setAlerts(data);
    } catch (err) {
      console.error('Error loading alerts:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Early Warning & Shortage Alert Stream</h2>
          <div className="page-desc">
            Algorithmic threshold detections flagging imminent medicine stock-outs, bed saturation, and personnel deficits
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'WATCH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                background: severityFilter === sev ? 'var(--accent-cyan)' : 'var(--bg-input)',
                color: severityFilter === sev ? '#000' : 'var(--text-secondary)'
              }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Facility ID</th>
                <th>Alert Category</th>
                <th>Severity</th>
                <th>Diagnostic Description</th>
                <th>Predicted Depletion</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{a.id}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{a.phc_id}</td>
                  <td>{a.alert_type}</td>
                  <td><RiskBadge level={a.severity} size="small" /></td>
                  <td style={{ maxWidth: '350px', lineHeight: 1.4 }}>{a.description}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {a.predicted_date || 'Imminent'}
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: a.status === 'ACTIVE' ? '#ef4444' : '#10b981' }}>
                      ● {a.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedPhcId(a.phc_id);
                        setActiveTab('phc-detail');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No alerts matching the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
