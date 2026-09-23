import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function DistrictDashboard() {
  const { setSelectedPhcId, setActiveTab } = useApp();
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      const dists = await api.getDistricts();
      // Enrich with operational statistics
      const enriched = dists.map((d) => {
        let hrsi = 36.5;
        let risk = 'STABLE';
        let bedOcc = 68;
        let statusRole = 'BALANCED';

        if (d.id === 'DIST-01') {
          hrsi = 68.4;
          risk = 'HIGH';
          bedOcc = 89;
          statusRole = 'DEFICIT (CRITICAL ORS NEED)';
        } else if (d.id === 'DIST-02') {
          hrsi = 28.2;
          risk = 'STABLE';
          bedOcc = 61;
          statusRole = 'SURPLUS HUB (+1800 ORS)';
        } else if (d.id === 'DIST-03') {
          hrsi = 42.1;
          risk = 'WATCH';
          bedOcc = 74;
          statusRole = 'WATCH';
        } else if (d.id === 'DIST-05') {
          hrsi = 48.0;
          risk = 'WATCH';
          bedOcc = 78;
          statusRole = 'WATCH';
        }

        return {
          ...d,
          hrsi,
          risk,
          bedOcc,
          statusRole,
          phc_count: 6
        };
      });
      setDistricts(enriched);
    } catch (err) {
      console.error('Error loading districts:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">District Healthcare Benchmarks (8 Districts)</h2>
          <div className="page-desc">
            Comparative analysis of resource consumption, surplus capacity, and localized shortage vulnerability
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>District ID</th>
                <th>District Name</th>
                <th>State ID</th>
                <th>PHCs Administered</th>
                <th>Resource Stress (HRSI)</th>
                <th>Bed Occupancy</th>
                <th>Supply Balance Role</th>
                <th>Risk Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.id}</td>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{d.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d.state_id}</td>
                  <td>{d.phc_count} Facilities</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.hrsi > 50 ? '#ef4444' : '#fff' }}>
                      {d.hrsi}/100
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${d.bedOcc}%`, height: '100%', background: d.bedOcc > 80 ? '#ef4444' : '#06b6d4' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{d.bedOcc}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: d.statusRole.includes('DEFICIT') ? 'rgba(239, 68, 68, 0.15)' : (d.statusRole.includes('SURPLUS') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)'),
                      color: d.statusRole.includes('DEFICIT') ? '#ef4444' : (d.statusRole.includes('SURPLUS') ? '#10b981' : 'var(--text-secondary)')
                    }}>
                      {d.statusRole}
                    </span>
                  </td>
                  <td><RiskBadge level={d.risk} size="small" /></td>
                  <td>
                    <button
                      onClick={() => {
                        if (d.id === 'DIST-01') setSelectedPhcId('PHC-021');
                        setActiveTab('phc-detail');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      Inspect PHCs
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
