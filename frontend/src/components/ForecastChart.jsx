import React from 'react';

export function ForecastChart({ dailyPredictions = [], currentStock = 850, medicineName = 'ORS' }) {
  if (!dailyPredictions || dailyPredictions.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No projection curve data available.
      </div>
    );
  }

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...dailyPredictions.map((d) => d.upper_bound), 240);
  const minVal = 0;

  const getX = (idx) => padding.left + (idx / (dailyPredictions.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  // Path for predicted points
  const points = dailyPredictions.map((d, i) => `${getX(i)},${getY(d.predicted_demand)}`).join(' ');

  // Path for confidence area
  const upperPoints = dailyPredictions.map((d, i) => `${getX(i)},${getY(d.upper_bound)}`);
  const lowerPoints = [...dailyPredictions].reverse().map((d, i) => `${getX(dailyPredictions.length - 1 - i)},${getY(d.lower_bound)}`);
  const areaPath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = padding.top + chartH * pct;
          const val = Math.round(maxVal * (1 - pct));
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
              <text x={padding.left - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="var(--font-mono)">
                {val}
              </text>
            </g>
          );
        })}

        {/* Confidence Interval Ribbon */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Forecast Line */}
        <polyline fill="none" stroke="#06b6d4" strokeWidth="2.5" points={points} />

        {/* Points & Labels */}
        {dailyPredictions.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.predicted_demand);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="4" fill="#080c14" stroke="#06b6d4" strokeWidth="2" />
              <text x={cx} y={padding.top + chartH + 20} fill="#94a3b8" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
                Day {d.day}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#06b6d4', display: 'inline-block' }} />
          <span>Projected Daily Consumption ({medicineName})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '8px', background: 'rgba(6, 182, 212, 0.25)', display: 'inline-block' }} />
          <span>95% Confidence Interval</span>
        </div>
      </div>
    </div>
  );
}
