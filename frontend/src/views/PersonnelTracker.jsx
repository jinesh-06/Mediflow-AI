import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function PersonnelTracker() {
  const { showToast } = useApp();
  const [personnel, setPersonnel] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ALL');

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await api.getPersonnel();
      setPersonnel(data);
    } catch (err) {
      console.error('Error loading personnel:', err);
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      await api.updatePersonnelStatus(staffId, { availability: newStatus });
      showToast('Staff availability status updated.', 'success');
      loadStaff();
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
    }
  };

  const total = personnel.length;
  const present = personnel.filter((p) => p.attendance_status === 'PRESENT').length;
  const available = personnel.filter((p) => p.attendance_status === 'PRESENT' && p.availability_status === 'AVAILABLE').length;
  const engaged = personnel.filter((p) => p.availability_status === 'ENGAGED_EMERGENCY').length;

  const filtered = selectedRole === 'ALL' ? personnel : personnel.filter((p) => p.role.toLowerCase() === selectedRole.toLowerCase());

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Medical Personnel Attendance & Availability</h2>
          <div className="page-desc">
            Surveillance of doctors, nurses, and pharmacists distinguishing physical attendance from active emergency availability
          </div>
        </div>
      </div>

      <div className="grid-cols-4">
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ASSIGNED CADRE</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>{total}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRESENT ON-DUTY</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{present}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{Math.round((present / total) * 100 || 0)}% Attendance Rate</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ACTIVELY AVAILABLE</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981' }}>{available}</div>
          <div style={{ fontSize: '12px', color: '#10b981' }}>Available for triage & care</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ENGAGED IN EMERGENCY</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>{engaged}</div>
          <div style={{ fontSize: '12px', color: '#f59e0b' }}>Critical procedure deployment</div>
        </div>
      </div>

      {/* Role Filters */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['ALL', 'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECH'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              background: selectedRole === role ? 'var(--accent-cyan)' : 'var(--bg-input)',
              color: selectedRole === role ? '#000' : 'var(--text-secondary)'
            }}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel ID</th>
                <th>Staff Name</th>
                <th>Role</th>
                <th>Facility ID</th>
                <th>Shift</th>
                <th>Attendance</th>
                <th>Availability Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map((staff) => (
                <tr key={staff.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{staff.id}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{staff.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{staff.role}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{staff.phc_id}</td>
                  <td>
                    <span style={{ fontSize: '11px', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
                      {staff.shift}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: staff.attendance_status === 'PRESENT' ? '#10b981' : '#ef4444'
                    }}>
                      ● {staff.attendance_status}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: staff.availability_status === 'AVAILABLE' ? 'rgba(16, 185, 129, 0.15)' : (staff.availability_status === 'ENGAGED_EMERGENCY' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                      color: staff.availability_status === 'AVAILABLE' ? '#10b981' : (staff.availability_status === 'ENGAGED_EMERGENCY' ? '#f59e0b' : '#ef4444')
                    }}>
                      {staff.availability_status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={staff.availability_status}
                      onChange={(e) => handleStatusChange(staff.id, e.target.value)}
                      className="input-field"
                      style={{ padding: '2px 6px', fontSize: '11px', width: 'auto' }}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ENGAGED_EMERGENCY">ENGAGED_EMERGENCY</option>
                      <option value="BREAK">BREAK</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                    </select>
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
