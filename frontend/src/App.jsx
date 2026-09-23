import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GeminiCopilotDrawer } from './components/GeminiCopilotDrawer';

// Views
import { NationalDashboard } from './views/NationalDashboard';
import { StateDashboard } from './views/StateDashboard';
import { DistrictDashboard } from './views/DistrictDashboard';
import { PhcDetailView } from './views/PhcDetailView';
import { MedicineInventory } from './views/MedicineInventory';
import { BedAvailability } from './views/BedAvailability';
import { PersonnelTracker } from './views/PersonnelTracker';
import { DemandForecastView } from './views/DemandForecastView';
import { AlertsView } from './views/AlertsView';
import { RedistributionView } from './views/RedistributionView';
import { HumanApprovalView } from './views/HumanApprovalView';
import { EmergencySimView } from './views/EmergencySimView';
import { FederatedMonitor } from './views/FederatedMonitor';
import { AuditTrailView } from './views/AuditTrailView';
import { BricsExplorer } from './views/BricsExplorer';
import { SettingsView } from './views/SettingsView';

import { Bot } from 'lucide-react';

export function App() {
  const { activeTab, copilotOpen, setCopilotOpen, toast } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'national':
        return <NationalDashboard />;
      case 'states':
        return <StateDashboard />;
      case 'districts':
        return <DistrictDashboard />;
      case 'phc-detail':
        return <PhcDetailView />;
      case 'inventory':
        return <MedicineInventory />;
      case 'beds':
        return <BedAvailability />;
      case 'personnel':
        return <PersonnelTracker />;
      case 'forecast':
        return <DemandForecastView />;
      case 'alerts':
        return <AlertsView />;
      case 'redistribution':
        return <RedistributionView />;
      case 'approvals':
        return <HumanApprovalView />;
      case 'emergency':
        return <EmergencySimView />;
      case 'federated':
        return <FederatedMonitor />;
      case 'audit':
        return <AuditTrailView />;
      case 'brics':
        return <BricsExplorer />;
      case 'settings':
        return <SettingsView />;
      default:
        return <NationalDashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '40px' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Gemini Copilot Drawer */}
      <GeminiCopilotDrawer />

      {/* Floating Copilot Toggle when drawer is closed */}
      {!copilotOpen && (
        <button onClick={() => setCopilotOpen(true)} className="copilot-toggle-btn">
          <Bot size={20} />
          <span>Gemini Copilot</span>
        </button>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '76px',
            right: '24px',
            zIndex: 110,
            background: toast.type === 'error' ? '#ef4444' : (toast.type === 'warning' ? '#f59e0b' : '#0284c7'),
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'modal-appear 0.2s ease-out'
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
