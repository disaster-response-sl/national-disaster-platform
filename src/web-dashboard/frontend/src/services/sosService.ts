import api from './api';

export interface SosSignal {
  _id: string;
  user_id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
  emergency_type: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  assigned_responder?: string;
  user_info?: {
    name?: string;
    phone?: string;
  };
}

export interface SosDashboard {
  total_signals: number;
  pending_signals: number;
  responded_signals: number;
  average_response_time: number;
  signals_by_priority: Array<{ _id: string; count: number }>;
  signals_by_type: Array<{ _id: string; count: number }>;
  recent_signals: SosSignal[];
  response_teams: {
    available: number;
    deployed: number;
    total: number;
  };
}

export interface SosCluster {
  center: {
    lat: number;
    lng: number;
  };
  signals: SosSignal[];
  radius_km: number;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  cluster_id: string;
}

export interface SosAnalytics {
  response_time_trends: Array<{
    date: string;
    average_response_time: number;
    total_signals: number;
  }>;
  priority_distribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  type_distribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  geographic_hotspots: Array<{
    location: string;
    lat: number;
    lng: number;
    signal_count: number;
    average_priority: number;
  }>;
  performance_metrics: {
    total_signals: number;
    resolved_signals: number;
    average_response_time: number;
    resolution_rate: number;
  };
}

export interface SosFilters {
  status?: string;
  priority?: string;
  emergency_type?: string;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  assigned_responder?: string;
  page?: number;
  limit?: number;
}

export const sosService = {
  // Get all SOS signals with optional filtering
  async getAllSosSignals(filters?: SosFilters): Promise<SosSignal[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await api.get(`/admin/sos?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching SOS signals:', error);
      return [];
    }
  },

  // Get SOS dashboard data
  async getSosDashboard(): Promise<SosDashboard> {
    try {
      const response = await api.get('/admin/sos/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching SOS dashboard:', error);
      return {
        total_signals: 0,
        pending_signals: 0,
        responded_signals: 0,
        average_response_time: 0,
        signals_by_priority: [],
        signals_by_type: [],
        recent_signals: [],
        response_teams: {
          available: 0,
          deployed: 0,
          total: 0
        }
      };
    }
  },

  // Get SOS signal clusters
  async getSosClusters(radius = 10): Promise<SosCluster[]> {
    try {
      const response = await api.get(`/admin/sos/clusters?radius=${radius}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching SOS clusters:', error);
      return [];
    }
  },

  // Get SOS analytics
  async getSosAnalytics(timeframe = 30): Promise<SosAnalytics> {
    try {
      const response = await api.get(`/admin/sos/analytics?timeframe=${timeframe}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching SOS analytics:', error);
      throw error;
    }
  },

  // Get specific SOS signal by ID
  async getSosSignalById(id: string): Promise<SosSignal> {
    try {
      const response = await api.get(`/admin/sos/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching SOS signal:', error);
      throw error;
    }
  },

  // Update SOS signal status
  async updateSosStatus(id: string, status: string, notes?: string): Promise<boolean> {
    try {
      await api.put(`/admin/sos/${id}/status`, { status, notes });
      return true;
    } catch (error) {
      console.error('Error updating SOS status:', error);
      return false;
    }
  },

  // Assign responder to SOS signal
  async assignResponder(id: string, responderId: string, notes?: string): Promise<boolean> {
    try {
      await api.put(`/admin/sos/${id}/assign`, { responder_id: responderId, notes });
      return true;
    } catch (error) {
      console.error('Error assigning responder:', error);
      return false;
    }
  },

  // Bulk update SOS signals
  async bulkUpdateSosSignals(signalIds: string[], updates: {
    status?: string;
    assigned_responder?: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      await api.put('/admin/sos/bulk-update', {
        signal_ids: signalIds,
        updates
      });
      return true;
    } catch (error) {
      console.error('Error bulk updating SOS signals:', error);
      return false;
    }
  },

  // Create manual SOS signal (for testing/admin purposes)
  async createSosSignal(data: {
    user_id: string;
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    emergency_type: string;
  }): Promise<SosSignal> {
    try {
      const response = await api.post('/admin/sos', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating SOS signal:', error);
      throw error;
    }
  },

  // Export SOS signals data
  async exportSosData(filters?: SosFilters, format = 'csv'): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await api.get(`/admin/sos/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting SOS data:', error);
      throw error;
    }
  },

  // Get SOS signals for map visualization
  async getSosSignalsForMap(bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<SosSignal[]> {
    try {
      const params = new URLSearchParams();
      if (bounds) {
        params.append('bounds', `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`);
      }
      
      const response = await api.get(`/map/sos?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching SOS signals for map:', error);
      return [];
    }
  },

  // Get real-time SOS updates (for WebSocket connection)
  async subscribeToSosUpdates(callback: (signal: SosSignal) => void): Promise<() => void> {
    // This would implement WebSocket connection for real-time updates
    // For now, we'll use polling as a fallback
    const interval = setInterval(async () => {
      try {
        const recentSignals = await this.getAllSosSignals({ 
          limit: 10,
          status: 'pending'
        });
        recentSignals.forEach(callback);
      } catch (error) {
        console.error('Error in SOS polling:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
};
