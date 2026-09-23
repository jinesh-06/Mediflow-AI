import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AppContext = createContext();

export const ROLES = {
  PHC_OPERATOR: { id: 'PHC_OPERATOR', name: 'PHC Operator', canApprove: false, level: 'PHC' },
  DISTRICT_OFFICER: { id: 'DISTRICT_OFFICER', name: 'District Health Officer', canApprove: true, level: 'District' },
  STATE_COORDINATOR: { id: 'STATE_COORDINATOR', name: 'Regional / State Coordinator', canApprove: true, level: 'State' },
  NATIONAL_ADMIN: { id: 'NATIONAL_ADMIN', name: 'National Health Administrator', canApprove: true, level: 'National' },
  AUDITOR: { id: 'AUDITOR', name: 'Compliance Auditor', canApprove: false, level: 'National' },
};

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.DISTRICT_OFFICER);
  const [activeTab, setActiveTab] = useState('national');
  const [selectedPhcId, setSelectedPhcId] = useState('PHC-021');
  const [nationalMetrics, setNationalMetrics] = useState(null);
  const [emergencyStatus, setEmergencyStatus] = useState({ is_active: false });
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [reviewRecommendation, setReviewRecommendation] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const loadNationalData = useCallback(async () => {
    try {
      const [metrics, emStatus] = await Promise.all([
        api.getNationalMetrics().catch(() => null),
        api.getEmergencyStatus().catch(() => ({ is_active: false })),
      ]);
      if (metrics) setNationalMetrics(metrics);
      if (emStatus) setEmergencyStatus(emStatus);
    } catch (err) {
      console.error('Error refreshing metrics:', err);
    }
  }, []);

  useEffect(() => {
    loadNationalData();
    const interval = setInterval(loadNationalData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [loadNationalData]);

  const triggerEmergency = async () => {
    setIsLoading(true);
    try {
      const res = await api.simulateEmergency();
      setEmergencyStatus({ is_active: true, ...res });
      showToast('⚠️ Dengue Outbreak Emergency Triggered! Surging Footfall (+43%) & Medicine Demand (+51%)', 'error');
      await loadNationalData();
      setActiveTab('emergency');
    } catch (err) {
      showToast(`Simulation failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetEmergencyState = async () => {
    setIsLoading(true);
    try {
      await api.resetEmergency();
      setEmergencyStatus({ is_active: false });
      showToast('Operational state restored to baseline surveillance levels.', 'success');
      await loadNationalData();
    } catch (err) {
      showToast(`Reset failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeTab,
        setActiveTab,
        selectedPhcId,
        setSelectedPhcId,
        nationalMetrics,
        emergencyStatus,
        copilotOpen,
        setCopilotOpen,
        reviewRecommendation,
        setReviewRecommendation,
        toast,
        showToast,
        loadNationalData,
        triggerEmergency,
        resetEmergencyState,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
