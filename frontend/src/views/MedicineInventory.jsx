import React, { useState, useEffect } from 'react';
import { Pill, Search, Filter, AlertTriangle } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function MedicineInventory() {
  const { setSelectedPhcId, setActiveTab } = useApp();
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'SHORTAGE' | 'CRITICAL'

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
  };

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phc_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phc_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === 'SHORTAGE') return item.days_of_stock_remaining <= 5.0;
    if (selectedFilter === 'CRITICAL') return item.days_of_stock_remaining <= 2.5;
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">National Medicine Supply & Inventory Surveillance</h2>
          <div className="page-desc">
            Real-time telemetry of medicine stocks, daily consumption rates, and predicted days of stock remaining
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSelectedFilter(selectedFilter === 'SHORTAGE' ? 'ALL' : 'SHORTAGE')}
            className={`btn ${selectedFilter === 'SHORTAGE' ? 'btn-danger' : 'btn-secondary'}`}
          >
            <AlertTriangle size={14} />
            Show Shortages Only (≤5 Days)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by medicine name, facility ID, or facility name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'SHORTAGE', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFilter(f)}
                className="btn"
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  background: selectedFilter === f ? 'var(--accent-cyan)' : 'var(--bg-input)',
                  color: selectedFilter === f ? '#000' : 'var(--text-secondary)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Medicine</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Daily Consumption</th>
                <th>Minimum Safety Reserve</th>
                <th>Stock Runway</th>
                <th>Risk Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 40).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{item.phc_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.phc_id}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{item.medicine_name}</td>
                  <td>{item.category}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {item.current_stock} {item.unit}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {item.daily_consumption} / day
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {item.minimum_reserve}
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: item.days_of_stock_remaining <= 5 ? '#ef4444' : '#10b981'
                    }}>
                      {item.days_of_stock_remaining} Days
                    </span>
                  </td>
                  <td><RiskBadge level={item.risk_level} size="small" /></td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedPhcId(item.phc_id);
                        setActiveTab('phc-detail');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                    >
                      View PHC
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
