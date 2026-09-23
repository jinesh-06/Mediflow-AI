import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export function RiskBadge({ level = 'STABLE', size = 'normal' }) {
  const lvl = (level || 'STABLE').toUpperCase();

  const config = {
    STABLE: { cls: 'badge-stable', icon: ShieldCheck, label: 'STABLE' },
    WATCH: { cls: 'badge-watch', icon: AlertCircle, label: 'WATCH' },
    HIGH: { cls: 'badge-high', icon: AlertTriangle, label: 'HIGH RISK' },
    CRITICAL: { cls: 'badge-critical', icon: AlertOctagon, label: 'CRITICAL' },
  }[lvl] || { cls: 'badge-stable', icon: ShieldCheck, label: lvl };

  const Icon = config.icon;
  const iconSize = size === 'small' ? 12 : 14;

  return (
    <span className={`badge ${config.cls}`}>
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
