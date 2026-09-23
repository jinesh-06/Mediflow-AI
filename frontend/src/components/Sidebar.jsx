import React from 'react';
import {
  LayoutDashboard,
  Map,
  Building2,
  Stethoscope,
  Pill,
  Bed,
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  CheckSquare,
  Flame,
  Cpu,
  History,
  Globe2,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Sidebar() {
  const { activeTab, setActiveTab, nationalMetrics, emergencyStatus } = useApp();

  const isEmergency = emergencyStatus?.is_active;
  const alertCount = nationalMetrics?.active_alerts_count || 0;

  const navGroups = [
    {
      group: 'Surveillance & Command',
      items: [
        { id: 'national', label: 'National Command Center', icon: LayoutDashboard },
        { id: 'states', label: 'State Networks (4)', icon: Map },
        { id: 'districts', label: 'District Benchmarks (8)', icon: Building2 },
        { id: 'phc-detail', label: 'PHC Drill-down (PHC-021)', icon: Stethoscope },
      ],
    },
    {
      group: 'Clinical Logistics',
      items: [
        { id: 'inventory', label: 'Medicine Inventory', icon: Pill },
        { id: 'beds', label: 'Bed Capacity Tracker', icon: Bed },
        { id: 'personnel', label: 'Medical Personnel Attendance', icon: Users },
        { id: 'forecast', label: 'ML Demand Forecasting', icon: TrendingUp },
      ],
    },
    {
      group: 'Decision & Governance',
      items: [
        {
          id: 'alerts',
          label: 'Early Warning Alerts',
          icon: AlertTriangle,
          badge: alertCount > 0 ? alertCount : null,
          badgeColor: '#ef4444'
        },
        { id: 'redistribution', label: 'AI Redistribution Engine', icon: Truck },
        { id: 'approvals', label: 'Human Approval Review', icon: CheckSquare },
        {
          id: 'emergency',
          label: 'Emergency Simulation',
          icon: Flame,
          badge: isEmergency ? 'ACTIVE' : null,
          badgeColor: '#dc2626'
        },
      ],
    },
    {
      group: 'Federated & Scalability',
      items: [
        { id: 'federated', label: 'Federated Learning (4 Nodes)', icon: Cpu },
        { id: 'audit', label: 'Immutable Audit Trail', icon: History },
        { id: 'brics', label: 'BRICS Scalability Architecture', icon: Globe2 },
        { id: 'settings', label: 'Governance & RBAC Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.group}>
            <div className="sidebar-category">{group.group}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: item.badgeColor || '#0284c7',
                        color: '#fff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Federated Hub v1.3</span>
          <span style={{ color: 'var(--accent-cyan)' }}>FedAvg Active</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Zero centralized raw PHC records
        </div>
      </div>
    </aside>
  );
}
