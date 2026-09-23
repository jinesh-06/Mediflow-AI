// RESILIHEALTH AI: Backend API Client
const BASE_URL = '/api';

export async function fetchApi(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Operational Data
  getStates: () => fetchApi('/states'),
  getDistricts: (stateId) => fetchApi(`/districts${stateId ? `?state_id=${stateId}` : ''}`),
  getPhcs: (districtId, stateId) => {
    const params = new URLSearchParams();
    if (districtId) params.append('district_id', districtId);
    if (stateId) params.append('state_id', stateId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/phcs${query}`);
  },
  getPhcDetails: (phcId) => fetchApi(`/phcs/${phcId}`),
  getMedicines: () => fetchApi('/medicines'),
  getInventory: (phcId, medicineId) => {
    const params = new URLSearchParams();
    if (phcId) params.append('phc_id', phcId);
    if (medicineId) params.append('medicine_id', medicineId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/inventory${query}`);
  },
  updateInventoryStock: (phcId, medicineId, delta, reason) =>
    fetchApi('/inventory/update', {
      method: 'POST',
      body: JSON.stringify({ phc_id: phcId, medicine_id: medicineId, delta, reason }),
    }),
  getBeds: (phcId) => fetchApi(`/beds${phcId ? `?phc_id=${phcId}` : ''}`),
  updateBeds: (phcId, data) =>
    fetchApi('/beds/update', {
      method: 'POST',
      body: JSON.stringify({ phc_id: phcId, ...data }),
    }),
  getPersonnel: (phcId, role) => {
    const params = new URLSearchParams();
    if (phcId) params.append('phc_id', phcId);
    if (role) params.append('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi(`/personnel${query}`);
  },
  updatePersonnelStatus: (staffId, data) =>
    fetchApi('/personnel/status', {
      method: 'POST',
      body: JSON.stringify({ staff_id: staffId, ...data }),
    }),
  getFootfall: (phcId) => fetchApi(`/footfall/${phcId}`),
  getNationalMetrics: () => fetchApi('/metrics/national'),
  getPhcHrsi: (phcId) => fetchApi(`/metrics/hrsi/${phcId}`),
  getAlerts: (severity) => fetchApi(`/alerts${severity ? `?severity=${severity}` : ''}`),

  // ML Demand Forecasting
  forecastDemand: (phcId, medicineId, horizonDays = 7) =>
    fetchApi('/forecast', {
      method: 'POST',
      body: JSON.stringify({ phc_id: phcId, medicine_id: medicineId, horizon_days: horizonDays }),
    }),
  getPhcForecasts: (phcId) => fetchApi(`/forecast/${phcId}`),

  // Redistribution & Governance
  generateRecommendations: () => fetchApi('/redistribution/recommend', { method: 'POST' }),
  getRecommendations: (status) => fetchApi(`/recommendations${status ? `?status=${status}` : ''}`),
  getRecommendation: (id) => fetchApi(`/recommendations/${id}`),
  approveRecommendation: (id, data) =>
    fetchApi(`/recommendations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  modifyRecommendation: (id, data) =>
    fetchApi(`/recommendations/${id}/modify`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  rejectRecommendation: (id, data) =>
    fetchApi(`/recommendations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  escalateRecommendation: (id, data) =>
    fetchApi(`/recommendations/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTransfers: () => fetchApi('/transfers'),

  // Federated Learning
  getFederatedStatus: () => fetchApi('/federated/status'),
  trainFederatedRound: (epochs = 3, lr = 0.01) =>
    fetchApi('/federated/train-round', {
      method: 'POST',
      body: JSON.stringify({ epochs_per_node: epochs, learning_rate: lr }),
    }),
  getBricsArchitecture: () => fetchApi('/federated/brics-architecture'),

  // Google Gemini
  explainRecommendation: (recommendationId, language = 'en') =>
    fetchApi('/gemini/explain', {
      method: 'POST',
      body: JSON.stringify({ recommendation_id: recommendationId, language }),
    }),
  copilotQuery: (query, language = 'en') =>
    fetchApi('/gemini/copilot', {
      method: 'POST',
      body: JSON.stringify({ query, language }),
    }),
  getEmergencySummary: (language = 'en') =>
    fetchApi(`/gemini/emergency-summary?language=${language}`),

  // Emergency Simulation
  simulateEmergency: () => fetchApi('/emergency/simulate', { method: 'POST' }),
  resetEmergency: () => fetchApi('/emergency/reset', { method: 'POST' }),
  getEmergencyStatus: () => fetchApi('/emergency/status'),

  // Audit
  getAuditTrail: (limit = 100) => fetchApi(`/audit?limit=${limit}`),
};
