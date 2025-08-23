import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// NDX Service Functions
export const ndxService = {
  // 1. Get Data Providers
  async getProviders() {
    const response = await api.get('/api/ndx/providers');
    return response.data;
  },

  // 2. Request Data Exchange Consent
  async requestConsent(data: {
    dataProvider: string;
    dataType: string;
    purpose: string;
    consentDuration: number;
    location: { lat: number; lng: number };
  }) {
    const response = await api.post('/api/ndx/consent/request', data);
    return response.data;
  },

  // 3. Approve Consent
  async approveConsent(consentId: string) {
    const response = await api.post('/api/ndx/consent/approve', { consentId });
    return response.data;
  },

  // 4. Get Consent Status
  async getConsentStatus(consentId: string) {
    const response = await api.get(`/api/ndx/consent/${consentId}`);
    return response.data;
  },

  // 5. Revoke Consent
  async revokeConsent(consentId: string) {
    const response = await api.post('/api/ndx/consent/revoke', { consentId });
    return response.data;
  },

  // 6. Exchange Data
  async exchangeData(data: {
    consentId: string;
    dataProvider: string;
    dataType: string;
    purpose: string;
    location: { lat: number; lng: number };
  }) {
    const response = await api.post('/api/ndx/data/exchange', data);
    return response.data;
  },

  // 7. Get Disaster Information (Shortcut)
  async getDisasterInfo(location: { lat: number; lng: number }) {
    const response = await api.post('/api/ndx/data/disaster-info', { location });
    return response.data;
  },

  // 8. Get Weather Alerts (Shortcut)
  async getWeatherAlerts(area: string) {
    const response = await api.post('/api/ndx/data/weather-alerts', { area });
    return response.data;
  },
};
