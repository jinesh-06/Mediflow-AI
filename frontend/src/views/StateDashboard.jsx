import React, { useState, useEffect } from 'react';
import { Map, Building2, Bed, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function StateDashboard() {
  const { setActiveTab } = useApp();
  const [states, setStates] = useState([]);
  const [stateMetrics, setStateMetrics] = useState([]);

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const stateList = await api.getStates();
      setStates(stateList);

      // Predefined state profile statistics based on the 48 PHC network
      const profiles = [
        {
          id: 'STATE-TN',
          name: 'Tamil Nadu',
          code: 'TN',
          region: 'South Hub',
          phcs: 12,
          beds_total: 280,
          bed_occupancy: 78.4,
          personnel_avail: 84.2,
          hrsi: 54.2,
          status: 'HIGH',
          districts: ['Chennai Central (District A)', 'Kanchipuram Rural (District B)'],
          epicenter_active: true
        },
        {
          id: 'STATE-KA',
          name: 'Karnataka',
          code: 'KA',
          region: 'South-West Hub',
          phcs: 12,
          beds_total: 280,
          bed_occupancy: 67.5,
          personnel_avail: 88.0,
          hrsi: 34.0,
          status: 'WATCH',
          districts: ['Bengaluru Urban', 'Mysuru'],
          epicenter_active: false
        },
        {
          id: 'STATE-MH',
          name: 'Maharashtra',
          code: 'MH',
          region: 'Western Hub',
          phcs: 12,
          beds_total: 280,
          bed_occupancy: 72.1,
          personnel_avail: 81.5,
          hrsi: 41.5,
          status: 'WATCH',
          districts: ['Pune District', 'Nashik Rural'],
          epicenter_active: false
        },
        {
          id: 'STATE-WB',
          name: 'West Bengal',
          code: 'WB',
          region: 'Eastern Hub',
          phcs: 12,
          beds_total: 280,
          bed_occupancy: 64.0,
          personnel_avail: 76.9,
          hrsi: 36.8,
          status: 'STABLE',
          districts: ['Kolkata North', 'Howrah'],
          epicenter_active: false
        }
      ];
      setStateMetrics(profiles);
    } catch (err) {
      console.error('Error loading states:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">State Healthcare Command Networks</h2>
          <div className="page-desc">
            Regional operational performance, bed strain, and supply stress across federated state clusters
          </div>
        </div>
      </div>

      <div className="grid-cols-2">
        {stateMetrics.map((st) => (
          <div key={st.id} className="card" style={{ borderTop: `3px solid ${st.status === 'HIGH' ? '#ef4444' : '#06b6d4'}` }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{st.name}</span>
                  <span style={{ background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    {st.code}
                  </span>
                  {st.epicenter_active && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      EPIDEMIC SURGE
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {st.region} · {st.phcs} Monitored Health Facilities
                </div>
              </div>
              <RiskBadge level={st.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '14px 0', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Resource Stress</div>
                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  {st.hrsi}/100
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bed Occupancy</div>
                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: st.bed_occupancy > 75 ? '#f97316' : '#fff' }}>
                  {st.bed_occupancy}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Staff Readiness</div>
                <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                  {st.personnel_avail}%
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong>Administered Districts:</strong> {st.districts.join(' · ')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={() => setActiveTab('districts')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                View Districts
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
