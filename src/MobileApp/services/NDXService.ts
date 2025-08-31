// NDXService.ts - Mobile app service for NDX (National Data Exchange)
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export interface NDXProvider {
  id: string;
  name: string;
  apis: string[];
}

export interface NDXConsent {
  consentId: string;
  dataProvider: string;
  dataType: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

export interface NDXDataRequest {
  dataProvider: string;
  dataType: string;
  purpose: string;
  consentDuration?: number;
}

class NDXService {
  private baseURL = API_BASE_URL.replace(/\/?$/, '') + '/ndx';

  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get available data providers
  async getDataProviders(): Promise<{ success: boolean; providers?: NDXProvider[]; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.baseURL}/providers`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX getDataProviders error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch data providers'
      };
    }
  }

  // Request data exchange consent
  async requestConsent(request: NDXDataRequest): Promise<{ success: boolean; consentId?: string; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/consent/request`, request, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX requestConsent error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to request consent'
      };
    }
  }

  // Approve consent
  async approveConsent(consentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/consent/approve`, { consentId }, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX approveConsent error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve consent'
      };
    }
  }

  // Get consent status
  async getConsentStatus(consentId: string): Promise<{ success: boolean; consent?: NDXConsent; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.baseURL}/consent/${consentId}`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX getConsentStatus error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get consent status'
      };
    }
  }

  // Revoke consent
  async revokeConsent(consentId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/consent/revoke`, { consentId }, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX revokeConsent error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to revoke consent'
      };
    }
  }

  // Exchange data using approved consent
  async exchangeData(consentId: string, dataRequest: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/data/exchange`, {
        consentId,
        dataRequest
      }, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX exchangeData error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to exchange data'
      };
    }
  }

  // Get disaster information via NDX (with auto consent)
  async getDisasterInfo(location: { lat: number; lng: number }): Promise<{ success: boolean; data?: any; consentId?: string; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/data/disaster-info`, { location }, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX getDisasterInfo error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get disaster information'
      };
    }
  }

  // Get weather alerts via NDX (with auto consent)
  async getWeatherAlerts(area: string): Promise<{ success: boolean; data?: any; consentId?: string; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${this.baseURL}/data/weather-alerts`, { area }, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX getWeatherAlerts error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get weather alerts'
      };
    }
  }

  // Get all user consents from backend
  async getUserConsents(): Promise<{ success: boolean; consents?: NDXConsent[]; message?: string }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${this.baseURL}/consents`, { headers });
      return response.data;
    } catch (error: any) {
      console.error('NDX getUserConsents error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get user consents'
      };
    }
  }

  // Store consent locally for offline access
  async storeConsentLocally(consent: NDXConsent): Promise<void> {
    try {
      const existingConsents = await this.getStoredConsents();
      existingConsents[consent.consentId] = consent;
      await AsyncStorage.setItem('ndx_consents', JSON.stringify(existingConsents));
    } catch (error) {
      console.error('Failed to store consent locally:', error);
    }
  }

  // Get stored consents
  async getStoredConsents(): Promise<Record<string, NDXConsent>> {
    try {
      const consents = await AsyncStorage.getItem('ndx_consents');
      return consents ? JSON.parse(consents) : {};
    } catch (error) {
      console.error('Failed to get stored consents:', error);
      return {};
    }
  }

  // Remove stored consent
  async removeStoredConsent(consentId: string): Promise<void> {
    try {
      const existingConsents = await this.getStoredConsents();
      delete existingConsents[consentId];
      await AsyncStorage.setItem('ndx_consents', JSON.stringify(existingConsents));
    } catch (error) {
      console.error('Failed to remove stored consent:', error);
    }
  }
}

export default new NDXService();
