import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = '#06b6d4', badge = null }) {
  return (
    <div className="card stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="stat-header">
        <span>{title}</span>
        {Icon && <Icon size={18} style={{ color }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <div className="stat-value">{value}</div>
        {badge}
      </div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
}
