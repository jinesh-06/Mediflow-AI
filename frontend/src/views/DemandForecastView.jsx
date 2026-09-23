import React, { useState, useEffect } from 'react';
import { TrendingUp, Cpu, Calendar, ShieldCheck } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { ForecastChart } from '../components/ForecastChart';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export function DemandForecastView() {
  const { selectedPhcId, setSelectedPhcId } = useApp();
  const [medicines, setMedicines] = useState([]);
  const [selectedMedId, setSelectedMedId] = useState('MED-ORS');
  const [horizonDays, setHorizonDays] = useState(7);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    loadForecast();
  }, [selectedPhcId, selectedMedId, horizonDays]);

  const loadMedicines = async () => {
    try {
      const list = await api.getMedicines();
      setMedicines(list);
    } catch (err) {
      console.error('Error loading medicines:', err);
    }
  };

  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await api.forecastDemand(selectedPhcId, selectedMedId, horizonDays);
      setForecast(data);
    } catch (err) {
      console.error('Error fetching forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Machine Learning Demand Forecasting Service</h2>
          <div className="page-desc">
            Decentralized GradientBoostingRegressor predicting multi-day pharmaceutical consumption and acute stock-out horizons
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 180px auto', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Select Facility
            </label>
            <select
              value={selectedPhcId}
              onChange={(e) => setSelectedPhcId(e.target.value)}
              className="input-field"
            >
              <option value="PHC-021">PHC-021 (Tondiarpet Urban PHC - Golden Path)</option>
              <option value="PHC-001">PHC-001 (Chennai Sector-1 PHC)</option>
              <option value="PHC-007">PHC-007 (Kanchipuram Warehouse Hub)</option>
              <option value="PHC-013">PHC-013 (Bengaluru Urban CHC)</option>
              <option value="PHC-025">PHC-025 (Pune Sector-1 PHC)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Select Therapeutic Resource
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              className="input-field"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Horizon Projection
            </label>
            <select
              value={horizonDays}
              onChange={(e) => setHorizonDays(parseInt(e.target.value, 10))}
              className="input-field"
            >
              <option value={7}>7 Days (Standard)</option>
              <option value={14}>14 Days (Extended)</option>
            </select>
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button onClick={loadForecast} className="btn btn-primary" disabled={loading}>
              Run Inference
            </button>
          </div>
        </div>
      </div>

      {forecast && (
        <>
          <div className="grid-cols-4">
            <div className="card">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CURRENT PHYSICAL STOCK</div>
              <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {forecast.current_stock}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Units on shelves</div>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PREDICTED 7-DAY DEMAND</div>
              <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {forecast.predicted_demand_7d}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Units projected</div>
            </div>

            <div className="card" style={{ borderLeft: `4px solid ${forecast.stockout_days <= 5 ? '#ef4444' : '#10b981'}` }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DEPLETION HORIZON</div>
              <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: forecast.stockout_days <= 5 ? '#ef4444' : '#fff' }}>
                {forecast.stockout_days} Days
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Risk: <RiskBadge level={forecast.risk} size="small" />
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MODEL CONFIDENCE</div>
              <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#10b981' }}>
                {Math.round(forecast.confidence * 100)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {forecast.model_version}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <TrendingUp size={16} style={{ color: 'var(--accent-cyan)' }} />
                Day-by-Day Forecasted Consumption Curve & Upper/Lower Uncertainty Bounds
              </div>
            </div>

            <ForecastChart
              dailyPredictions={forecast.daily_predictions}
              currentStock={forecast.current_stock}
              medicineName={forecast.medicine_name}
            />

            <div className="table-container" style={{ marginTop: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Day Offset</th>
                    <th>Date</th>
                    <th>Predicted Consumption</th>
                    <th>Lower Bound (-95% CI)</th>
                    <th>Upper Bound (+95% CI)</th>
                    <th>Cumulative Depletion</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.daily_predictions.map((p, idx) => {
                    const cum = forecast.daily_predictions.slice(0, idx + 1).reduce((acc, c) => acc + c.predicted_demand, 0);
                    return (
                      <tr key={p.day}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Day {p.day}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.date}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                          {p.predicted_demand} units
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.lower_bound}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.upper_bound}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', color: cum > forecast.current_stock ? '#ef4444' : '#fff' }}>
                          {Math.round(cum)} units {cum > forecast.current_stock && '⚠️ Depleted'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
