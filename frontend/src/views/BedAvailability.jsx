import React, { useState, useEffect } from 'react';
import { Bed, Edit2, Check, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function BedAvailability() {
  const { currentRole, showToast } = useApp();
  const [beds, setBeds] = useState([]);
  const [phcs, setPhcs] = useState({});
  const [editingPhcId, setEditingPhcId] = useState(null);
  const [editOccupied, setEditOccupied] = useState(0);

  useEffect(() => {
    loadBeds();
  }, []);

  const loadBeds = async () => {
    try {
      const [bedList, phcList] = await Promise.all([api.getBeds(), api.getPhcs()]);
      setBeds(bedList);
      const map = {};
      phcList.forEach((p) => { map[p.id] = p; });
      setPhcs(map);
    } catch (err) {
      console.error('Error loading bed metrics:', err);
    }
  };

  const handleSaveBedUpdate = async (phcId) => {
    try {
      await api.updateBeds(phcId, { occupied: parseInt(editOccupied, 10) });
      showToast(`Updated bed occupancy for ${phcId}.`, 'success');
      setEditingPhcId(null);
      loadBeds();
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  const totalBeds = beds.reduce((acc, b) => acc + b.total_beds, 0);
  const occupiedBeds = beds.reduce((acc, b) => acc + b.occupied_beds, 0);
  const availableBeds = beds.reduce((acc, b) => acc + b.available_beds, 0);
  const avgOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Real-Time Bed Availability & Capacity Management</h2>
          <div className="page-desc">
            Surveillance of critical care beds, isolation wards, and maintenance status across 48 facilities
          </div>
        </div>
      </div>

      <div className="grid-cols-4">
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL BEDS</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>{totalBeds}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OCCUPIED BEDS</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ef4444' }}>{occupiedBeds}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AVAILABLE BEDS</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981' }}>{availableBeds}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NETWORK OCCUPANCY</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: avgOccupancy > 75 ? '#f97316' : '#06b6d4' }}>
            {avgOccupancy}%
          </div>
        </div>
      </div>

      {/* Bed Distribution Cards */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Bed size={16} style={{ color: 'var(--accent-cyan)' }} />
            Facility Bed Capacity Breakdown (Formula: Available = Total - Occupied - Reserved - Maintenance)
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Total Beds</th>
                <th>Occupied</th>
                <th>Reserved</th>
                <th>Maintenance</th>
                <th>Available</th>
                <th>Occupancy Visualizer</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {beds.slice(0, 30).map((b, idx) => {
                const p = phcs[b.phc_id || `PHC-${String(idx + 1).padStart(3, '0')}`];
                const phcId = b.phc_id || `PHC-${String(idx + 1).padStart(3, '0')}`;
                const isEditing = editingPhcId === phcId;

                return (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p?.name || phcId}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{phcId}</div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{b.total_beds}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 600 }}>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editOccupied}
                          onChange={(e) => setEditOccupied(e.target.value)}
                          className="input-field"
                          style={{ width: '60px', padding: '2px 6px' }}
                        />
                      ) : (
                        b.occupied_beds
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{b.reserved_beds}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{b.maintenance_beds}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#10b981', fontWeight: 700 }}>{b.available_beds}</td>
                    <td style={{ width: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${b.occupancy_percentage}%`, height: '100%', background: b.occupancy_percentage > 85 ? '#ef4444' : (b.occupancy_percentage > 70 ? '#f59e0b' : '#10b981') }} />
                        </div>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', width: '38px', textAlign: 'right' }}>
                          {b.occupancy_percentage}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {isEditing ? (
                        <button onClick={() => handleSaveBedUpdate(phcId)} className="btn btn-success" style={{ padding: '3px 8px', fontSize: '11px' }}>
                          <Check size={12} />
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPhcId(phcId);
                            setEditOccupied(b.occupied_beds);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          title="Update Occupancy as PHC Operator"
                        >
                          <Edit2 size={12} />
                          Update
                        </button>
                      )}
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
