import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Bed, Users, Pill, Truck, AlertTriangle, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { MapView } from '../components/MapView';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function NationalDashboard() {
  const { nationalMetrics, setActiveTab, setSelectedPhcId, setReviewRecommendation } = useApp();
  const [phcs, setPhcs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [phcList, alertList, recList] = await Promise.all([
        api.getPhcs().catch(() => []),
        api.getAlerts().catch(() => []),
        api.getRecommendations().catch(() => [])
      ]);
      setPhcs(phcList);
      setAlerts(alertList);
      setRecommendations(recList);
    } catch (err) {
      console.error('Error loading national dashboard data:', err);
    }
  };

  const m = nationalMetrics || {
    monitored_phcs: 48,
    districts_count: 8,
    states_count: 4,
    critical_phcs: 1,
    high_risk_phcs: 2,
    shortage_warnings: 3,
    average_hrsi: 41.2,
    beds: { total: 1120, occupied: 780, available: 260, occupancy_percentage: 69.6 },
    personnel: { total: 384, available: 312, availability_percentage: 81.3 }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">National Healthcare Decision Intelligence Center</h2>
          <div className="page-desc">
            Federated predictive surveillance across {m.monitored_phcs} Primary Health Centres in 8 Districts and 4 States
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('redistribution')} className="btn btn-primary">
            <Truck size={15} />
            Optimization Engine
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid-cols-4">
        <StatCard
          title="Monitored Network"
          value={m.monitored_phcs}
          subtitle={`${m.districts_count} Districts · ${m.states_count} States`}
          icon={Activity}
          color="#06b6d4"
          badge={<span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>● 100% ONLINE</span>}
        />
        <StatCard
          title="Resource Stress Index (HRSI)"
          value={`${m.average_hrsi}/100`}
          subtitle={`${m.critical_phcs} Critical · ${m.high_risk_phcs} High Stress`}
          icon={ShieldAlert}
          color={m.average_hrsi > 50 ? '#ef4444' : '#f59e0b'}
          badge={<RiskBadge level={m.critical_phcs > 0 ? 'HIGH' : 'WATCH'} size="small" />}
        />
        <StatCard
          title="Bed Occupancy"
          value={`${m.beds?.occupancy_percentage || 0}%`}
          subtitle={`${m.beds?.available || 0} Beds Available (${m.beds?.total || 0} Total)`}
          icon={Bed}
          color="#38bdf8"
        />
        <StatCard
          title="Medical Staff Availability"
          value={`${m.personnel?.availability_percentage || 0}%`}
          subtitle={`${m.personnel?.available || 0} Active / ${m.personnel?.total || 0} Total Staff`}
          icon={Users}
          color="#10b981"
        />
      </div>

      {/* Geospatial Grid & Active Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        <MapView phcs={phcs} onSelectPhc={(p) => { setSelectedPhcId(p.id); setActiveTab('phc-detail'); }} />

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={16} style={{ color: '#ef4444' }} />
              Active Shortage Warnings ({alerts.length})
            </div>
            <button onClick={() => setActiveTab('alerts')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
              View All
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                style={{
                  background: 'var(--bg-input)',
                  padding: '12px',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${a.severity === 'CRITICAL' ? '#ef4444' : '#f97316'}`,
                  cursor: 'pointer'
                }}
                onClick={() => { setSelectedPhcId(a.phc_id); setActiveTab('phc-detail'); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{a.phc_id}</span>
                  <RiskBadge level={a.severity} size="small" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {a.description}
                </div>
                {a.predicted_date && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Depletion horizon: {a.predicted_date}
                  </div>
                )}
              </div>
            ))}

            {alerts.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No active critical shortages detected. Surveillance normal.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Redistribution Recommendations Banner */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Truck size={16} style={{ color: 'var(--accent-cyan)' }} />
            Active AI Redistribution Recommendations
          </div>
          <button onClick={() => setActiveTab('redistribution')} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }}>
            Open Optimizer
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resource</th>
                <th>Source Hub (Surplus)</th>
                <th>Destination Center (Shortage)</th>
                <th>Transfer Qty</th>
                <th>Transit</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Governance</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.slice(0, 4).map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>{r.id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{r.resource}</td>
                  <td>{r.source_name}</td>
                  <td style={{ color: '#ef4444' }}>{r.destination_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {r.quantity} units
                  </td>
                  <td>{r.transport_time_hours} hrs</td>
                  <td><RiskBadge level={r.priority} size="small" /></td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: r.status === 'PENDING_REVIEW' ? '#f59e0b' : '#10b981' }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => setReviewRecommendation(r)}
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Review
                      <ArrowRight size={12} />
                    </button>
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
