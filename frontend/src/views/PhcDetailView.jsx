import React, { useState, useEffect } from 'react';
import { Stethoscope, Bed, Users, Pill, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { ForecastChart } from '../components/ForecastChart';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function PhcDetailView() {
  const { selectedPhcId, setSelectedPhcId, setActiveTab } = useApp();
  const [details, setDetails] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhcData();
  }, [selectedPhcId]);

  const loadPhcData = async () => {
    setLoading(true);
    try {
      const data = await api.getPhcDetails(selectedPhcId);
      setDetails(data);

      // Automatically generate forecast for ORS on load
      const fc = await api.forecastDemand(selectedPhcId, 'MED-ORS', 7).catch(() => null);
      setForecast(fc);
    } catch (err) {
      console.error('Error loading PHC details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !details) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading telemetry for facility {selectedPhcId}...</div>
      </div>
    );
  }

  const { phc, district, state, beds, personnel, stress_index, inventory, recent_footfall } = details;

  return (
    <div className="page-container">
      {/* Facility Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="page-title">{phc.name}</h2>
            <span style={{ background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-cyan)' }}>
              {phc.id}
            </span>
            <RiskBadge level={stress_index?.category} />
          </div>
          <div className="page-desc">
            {district?.name} · {state?.name} · GPS: {phc.latitude}, {phc.longitude} · Contact: {phc.contact_number}
          </div>
        </div>

        {/* Quick facility selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={selectedPhcId}
            onChange={(e) => setSelectedPhcId(e.target.value)}
            className="input-field"
            style={{ width: 'auto', fontWeight: 600 }}
          >
            <option value="PHC-021">PHC-021 (Tondiarpet Urban PHC - Golden Path)</option>
            <option value="PHC-001">PHC-001 (Chennai Sector-1 PHC)</option>
            <option value="PHC-007">PHC-007 (Kanchipuram Warehouse Hub)</option>
            <option value="PHC-013">PHC-013 (Bengaluru Urban CHC)</option>
            <option value="PHC-025">PHC-025 (Pune Sector-1 PHC)</option>
          </select>
        </div>
      </div>

      {/* Stress & Capacity Summary Tiles */}
      <div className="grid-cols-4">
        <div className="card" style={{ borderLeft: `4px solid ${stress_index?.stress_index > 50 ? '#ef4444' : '#10b981'}` }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Health Resource Stress (HRSI)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '4px 0' }}>
            {stress_index?.stress_index}/100
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Category: <strong>{stress_index?.category}</strong>
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bed Capacity</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '4px 0' }}>
            {beds?.available_beds} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {beds?.total_beds} Avail</span>
          </div>
          <div style={{ fontSize: '12px', color: beds?.occupancy_percentage > 80 ? '#ef4444' : 'var(--text-secondary)' }}>
            Occupancy: <strong>{beds?.occupancy_percentage}%</strong> ({beds?.occupied_beds} occupied)
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Medical Staff Readiness</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', margin: '4px 0' }}>
            {personnel?.available_staff} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {personnel?.total_staff}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {personnel?.present_staff} Present · Present != Available
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ORS Stock Runway</div>
          <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: (forecast?.stockout_days <= 5 ? '#ef4444' : '#10b981'), margin: '4px 0' }}>
            {forecast?.stockout_days} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Days</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Current Stock: <strong>{forecast?.current_stock} Units</strong>
          </div>
        </div>
      </div>

      {/* ML Forecast Deep-Dive */}
      {forecast && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
              Machine Learning Predictive Demand Curve: {forecast.medicine_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {forecast.model_name} ({forecast.model_version})
              </span>
              <RiskBadge level={forecast.risk} size="small" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
            <ForecastChart
              dailyPredictions={forecast.daily_predictions}
              currentStock={forecast.current_stock}
              medicineName={forecast.medicine_name}
            />

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Predicted 7-Day Demand</div>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  {forecast.predicted_demand_7d} units
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expected Depletion Window</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#ef4444' }}>
                  {forecast.stockout_days} Days remaining
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Forecast Confidence</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {Math.round(forecast.confidence * 100)}%
                </div>
              </div>
              <button
                onClick={() => setActiveTab('redistribution')}
                className="btn btn-primary"
                style={{ marginTop: '8px', width: '100%', fontSize: '12px' }}
              >
                Inspect Rebalancing Actions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Runway Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Pill size={16} style={{ color: 'var(--accent-blue)' }} />
            Medicine Supply Runways at {phc.name}
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Daily Consumption</th>
                <th>Minimum Reserve</th>
                <th>Runway (Days)</th>
                <th>Risk Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{item.medicine_name}</td>
                  <td>{item.category}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {item.current_stock} {item.unit}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{item.daily_consumption} / day</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{item.minimum_reserve}</td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: item.days_of_stock_remaining <= 5 ? '#ef4444' : '#fff'
                    }}>
                      {item.days_of_stock_remaining} days
                    </span>
                  </td>
                  <td><RiskBadge level={item.risk_level} size="small" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
