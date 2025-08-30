import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  }) {
    const response = await api.post('/api/ndx/consent/request', data);
    return response.data;
  },

  // 3. Approve Consent
  async approveConsent(consentId: string) {
    const response = await api.post('/api/ndx/consent/approve', { consentId });
    return response.data;
  },

  // 3.5. Reject Consent
  async rejectConsent(consentId: string) {
    const response = await api.post('/api/ndx/consent/reject', { consentId });
    return response.data;
  },

  // 4. Get All Consents
  async getConsents() {
    const response = await api.get('/api/ndx/consents');
    if (response.data.success && response.data.consents) {
      // Transform backend data to match frontend interface
      const transformedConsents = response.data.consents.map((consent: {
        consentId: string;
        dataProvider: string;
        dataType: string;
        purpose: string;
        status: string;
        createdAt: string;
        expiresAt: string;
        individualId?: string;
      }) => ({
        _id: consent.consentId,
        dataProvider: consent.dataProvider,
        dataType: consent.dataType,
        purpose: consent.purpose,
        status: consent.status,
        consentDuration: 24 * 60 * 60 * 1000, // Default 24 hours
        createdAt: consent.createdAt,
        updatedAt: consent.createdAt,
        expiresAt: consent.expiresAt,
        requester: consent.individualId || 'Unknown',
        location: { lat: 6.9271, lng: 79.8612 } // Default location
      }));
      return {
        success: true,
        consents: transformedConsents
      };
    }
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
  }) {
    const response = await api.post('/api/ndx/data/exchange', data);
    return response.data;
  },

  // 7. Get Disaster Information (Shortcut)
  async getDisasterInfo(location?: { lat: number; lng: number }) {
    const response = await api.post('/api/ndx/data/disaster-info', { location });
    return response.data;
  },

  // 8. Get Weather Alerts (Shortcut)
  async getWeatherAlerts(area: string) {
    const response = await api.post('/api/ndx/data/weather-alerts', { area });
    return response.data;
  },
};
