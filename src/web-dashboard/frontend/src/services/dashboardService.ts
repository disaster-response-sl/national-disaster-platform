import api from './authService';

export interface DashboardMetrics {
  activeDisasters: number;
  pendingSosSignals: number;
  totalCitizensAffected: number;
  responseTeamsDeployed: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  dataSyncStatus: 'synced' | 'syncing' | 'error';
  alertDistributionRate: number;
}

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
  status: 'pending' | 'responded' | 'resolved';
  timestamp: string;
}

export interface CitizenReport {
  _id: string;
  user_id: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'verified' | 'resolved';
  timestamp: string;
}

export interface Disaster {
  _id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'monitoring' | 'resolved';
  timestamp: string;
  affected_population?: number;
}

export interface ActivityFeedItem {
  id: string;
  type: 'sos' | 'report' | 'team_update' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export const dashboardService = {
  // Get dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await api.get('/resources/dashboard/metrics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return mock data on error
      return {
        activeDisasters: 0,
        pendingSosSignals: 0,
        totalCitizensAffected: 0,
        responseTeamsDeployed: 0,
        systemHealth: 'warning',
        dataSyncStatus: 'error',
        alertDistributionRate: 0
      };
    }
  },

  // Get recent SOS signals
  async getRecentSosSignals(): Promise<SosSignal[]> {
    try {
      const response = await api.get('/mobile/sos-signals');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching SOS signals:', error);
      return [];
    }
  },

  // Get recent citizen reports
  async getRecentReports(): Promise<CitizenReport[]> {
    try {
      const response = await api.get('/mobile/reports');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  // Get active disasters
  async getActiveDisasters(): Promise<Disaster[]> {
    try {
      const response = await api.get('/mobile/disasters?status=active');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching disasters:', error);
      return [];
    }
  },

  // Get activity feed (combined data)
  async getActivityFeed(): Promise<ActivityFeedItem[]> {
    try {
      const [sosSignals, reports] = await Promise.all([
        this.getRecentSosSignals(),
        this.getRecentReports()
      ]);

      const activities: ActivityFeedItem[] = [];

      // Add SOS signals to activity feed
      sosSignals.slice(0, 5).forEach(sos => {
        activities.push({
          id: sos._id,
          type: 'sos',
          title: 'SOS Signal Received',
          description: sos.message,
          timestamp: sos.timestamp,
          priority: sos.priority,
          location: sos.location
        });
      });

      // Add reports to activity feed
      reports.slice(0, 5).forEach(report => {
        activities.push({
          id: report._id,
          type: 'report',
          title: `Citizen Report: ${report.type}`,
          description: report.description,
          timestamp: report.timestamp,
          location: report.location
        });
      });

      // Sort by timestamp (newest first)
      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  },

  // Create new disaster alert
  async createDisasterAlert(disasterData: Partial<Disaster>): Promise<boolean> {
    try {
      await api.post('/admin/disasters', disasterData);
      return true;
    } catch (error) {
      console.error('Error creating disaster alert:', error);
      return false;
    }
  },

  // Broadcast emergency message
  async broadcastEmergencyMessage(message: string, priority: string): Promise<boolean> {
    try {
      await api.post('/admin/emergency-broadcast', { message, priority });
      return true;
    } catch (error) {
      console.error('Error broadcasting message:', error);
      return false;
    }
  }
};
