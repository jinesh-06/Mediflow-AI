import React from 'react';
import { Settings, Shield, Check, X, FileText, Cpu } from 'lucide-react';
import { useApp, ROLES } from '../context/AppContext';

export function SettingsView() {
  const { currentRole, setCurrentRole } = useApp();

  const permissions = [
    { module: 'View National / State Dashboards', operator: true, district: true, state: true, national: true, auditor: true },
    { module: 'Update Facility Inventory & Beds', operator: true, district: false, state: false, national: false, auditor: false },
    { module: 'Check-in Staff & Toggle Availability', operator: true, district: false, state: false, national: false, auditor: false },
    { module: 'Review Shortage Warnings & Run AI Forecast', operator: false, district: true, state: true, national: true, auditor: true },
    { module: 'Approve Intra-District Transfers', operator: false, district: true, state: true, national: true, auditor: false },
    { module: 'Approve Cross-District / Inter-State Movement', operator: false, district: false, state: true, national: true, auditor: false },
    { module: 'Dual Authorization for Large Shipments (≥1,000 units)', operator: false, district: true, state: true, national: true, auditor: false },
    { module: 'Inspect Immutable Audit Trail & Cryptographic IDs', operator: false, district: true, state: true, national: true, auditor: true },
    { module: 'Trigger Emergency Outbreak Simulation', operator: false, district: true, state: true, national: true, auditor: false },
  ];

  const licenses = [
    { name: 'FastAPI', license: 'MIT License', purpose: 'Asynchronous REST API Gateway' },
    { name: 'scikit-learn', license: 'BSD 3-Clause License', purpose: 'GradientBoostingRegressor for Demand Forecasting' },
    { name: 'NumPy & Pandas', license: 'BSD 3-Clause', purpose: 'High-performance Matrix & Array Operations' },
    { name: 'Google GenAI SDK', license: 'Apache-2.0', purpose: 'Grounded Natural Language Operational Copilot' },
    { name: 'React & Vite', license: 'MIT License', purpose: 'Frontend Command Center Architecture' },
    { name: 'Lucide Icons', license: 'ISC License', purpose: 'Operational Visual Indicators' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Governance, RBAC Permissions & System Configuration</h2>
          <div className="page-desc">
            Role-Based Access Control matrix, operational security boundaries, and third-party open-source licensing documentation
          </div>
        </div>
      </div>

      {/* Active Role Selector */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Shield size={16} style={{ color: 'var(--accent-cyan)' }} />
            Active User Authentication Profile
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {Object.values(ROLES).map((role) => (
            <button
              key={role.id}
              onClick={() => setCurrentRole(role)}
              className="btn"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '12px',
                background: currentRole.id === role.id ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-input)',
                border: currentRole.id === role.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                color: currentRole.id === role.id ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: currentRole.id === role.id ? 'var(--accent-cyan)' : '#fff' }}>
                {role.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tier: {role.level}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RBAC Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            Role-Based Access Control (RBAC) Permission Matrix
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Operational Capability</th>
                <th style={{ textAlign: 'center' }}>PHC Operator</th>
                <th style={{ textAlign: 'center' }}>District Officer</th>
                <th style={{ textAlign: 'center' }}>State Coordinator</th>
                <th style={{ textAlign: 'center' }}>National Admin</th>
                <th style={{ textAlign: 'center' }}>Auditor</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{p.module}</td>
                  <td style={{ textAlign: 'center' }}>{p.operator ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: 'var(--text-muted)' }} />}</td>
                  <td style={{ textAlign: 'center' }}>{p.district ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: 'var(--text-muted)' }} />}</td>
                  <td style={{ textAlign: 'center' }}>{p.state ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: 'var(--text-muted)' }} />}</td>
                  <td style={{ textAlign: 'center' }}>{p.national ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: 'var(--text-muted)' }} />}</td>
                  <td style={{ textAlign: 'center' }}>{p.auditor ? <Check size={16} style={{ color: '#10b981' }} /> : <X size={16} style={{ color: 'var(--text-muted)' }} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Third Party Licenses Documentation */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={16} style={{ color: 'var(--accent-blue)' }} />
            Third-Party Open Source Libraries & Licensing
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>License Type</th>
                <th>Architectural Purpose</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>{lic.name}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{lic.license}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{lic.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
