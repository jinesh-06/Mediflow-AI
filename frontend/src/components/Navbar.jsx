import React from 'react';
import { Activity, Shield, Bot, AlertTriangle, RefreshCw, UserCheck } from 'lucide-react';
import { useApp, ROLES } from '../context/AppContext';

export function Navbar() {
  const {
    currentRole,
    setCurrentRole,
    emergencyStatus,
    triggerEmergency,
    resetEmergencyState,
    copilotOpen,
    setCopilotOpen,
    loadNationalData,
    isLoading
  } = useApp();

  const isEmergency = emergencyStatus?.is_active;

  return (
    <>
      <header className="navbar">
        <div className="navbar-brand">
          <div className="brand-logo">
            <Activity size={22} />
          </div>
          <div className="brand-text">
            <h1>
              RESILIHEALTH AI
              <span className="badge-country">INDIA · BRICS</span>
            </h1>
            <div className="brand-subtitle">
              Federated AI Decision Intelligence for Resilient Public Healthcare Supply Chains
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Live Sync Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
            <span>48 PHCs Live</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadNationalData}
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Refresh Operational Telemetry"
          >
            <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
          </button>

          {/* Emergency Simulation Toggle */}
          {isEmergency ? (
            <button
              onClick={resetEmergencyState}
              className="btn btn-warning"
              disabled={isLoading}
              style={{ padding: '6px 14px' }}
            >
              <RefreshCw size={14} />
              Reset Emergency State
            </button>
          ) : (
            <button
              onClick={triggerEmergency}
              className="btn btn-danger"
              disabled={isLoading}
              style={{ padding: '6px 14px', boxShadow: 'var(--shadow-glow-red)' }}
            >
              <AlertTriangle size={14} />
              Simulate Dengue Outbreak
            </button>
          )}

          {/* Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
            <select
              value={currentRole.id}
              onChange={(e) => setCurrentRole(ROLES[e.target.value])}
              className="input-field"
              style={{ width: 'auto', padding: '6px 10px', fontSize: '12px', fontWeight: 600 }}
            >
              {Object.values(ROLES).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.level})
                </option>
              ))}
            </select>
          </div>

          {/* Gemini Copilot Toggle */}
          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className="btn btn-primary"
            style={{ padding: '6px 14px' }}
          >
            <Bot size={16} />
            <span>Gemini Copilot</span>
          </button>
        </div>
      </header>

      {/* Emergency Alert Ticker */}
      {isEmergency && (
        <div className="emergency-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} />
            <span>
              <strong>EPIDEMIOLOGICAL SURGE DETECTED:</strong> Dengue Outbreak confirmed in District A (Epicenter: Tondiarpet Urban PHC-021). Patient footfall +43%, ORS consumption +70%. Automated redistribution recommendations mobilized.
            </span>
          </div>
          <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            EMERGENCY ACTIVE
          </span>
        </div>
      )}
    </>
  );
}
