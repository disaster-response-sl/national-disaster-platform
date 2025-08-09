import api from './api';

export interface AnalyticsData {
  overview: {
    total_reports: number;
    pending_reports: number;
    addressed_reports: number;
    average_affected: number;
  };
  type_distribution: Array<{ _id: string; count: number }>;
  priority_distribution: Array<{ _id: string; count: number }>;
  timeframe_days: number;
}

export interface HeatmapData {
  clusters: Array<{
    lat: number;
    lng: number;
    intensity: number;
    types: { [key: string]: number };
    total_affected: number;
  }>;
  total_reports: number;
  timeframe_days: number;
}

export interface DashboardOverview {
  disasters: {
    active: number;
    recent_24h: number;
    total: number;
  };
  reports: {
    pending: number;
    recent_24h: number;
  };
  sos_signals: {
    active: number;
    recent_24h: number;
  };
  last_updated: string;
}

export interface PredictionData {
  disaster_likelihood: {
    next_7_days: { [key: string]: { probability: number; confidence: number } };
    next_30_days: { [key: string]: { probability: number; confidence: number } };
  };
  resource_demand: { [key: string]: { predicted_need: number; confidence: number } };
  high_risk_areas: Array<{
    area: string;
    risk_score: number;
    primary_threat: string;
  }>;
}

export interface MapData {
  type: string;
  features: Array<{
    type: string;
    properties: {
      id: string;
      name: string;
      type: string;
      status: string;
      priority: string;
      affected_population: number;
      location: {
        lat: number;
        lng: number;
      };
      timestamp: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number];
    };
  }>;
}

export interface ZoneData {
  zones: Array<{
    _id: string;
    name: string;
    type: string;
    coordinates: Array<[number, number]>;
    active_disasters: number;
    risk_level: string;
    population: number;
    resources: {
      medical: number;
      rescue: number;
      relief: number;
    };
  }>;
}

class AnalyticsService {
  // Dashboard Overview
  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await api.get('/admin/analytics/dashboard');
    return response.data;
  }

  // Reports Analytics
  async getReportsAnalytics(timeframeDays: number = 30): Promise<AnalyticsData> {
    const response = await api.get(`/analytics/reports?timeframe=${timeframeDays}`);
    return response.data;
  }

  // Heatmap Data
  async getHeatmapData(timeframeDays: number = 30): Promise<HeatmapData> {
    const response = await api.get(`/analytics/heatmap?timeframe=${timeframeDays}`);
    return response.data;
  }

  // AI Predictions
  async getPredictions(): Promise<PredictionData> {
    const response = await api.get('/admin/analytics/predictions');
    return response.data;
  }

  // Geographic Map Data
  async getMapData(filters?: {
    type?: string;
    priority?: string;
    status?: string;
    timeframe?: number;
  }): Promise<MapData> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.timeframe) params.append('timeframe', filters.timeframe.toString());

    const response = await api.get(`/analytics/map?${params.toString()}`);
    return response.data;
  }

  // Zone Data
  async getZoneData(): Promise<ZoneData> {
    const response = await api.get('/admin/analytics/zones');
    return response.data;
  }

  // Export Analytics Data
  async exportAnalytics(type: 'csv' | 'pdf', timeframeDays: number = 30): Promise<Blob> {
    const response = await api.get(`/analytics/export?format=${type}&timeframe=${timeframeDays}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Get Disaster Timeline
  async getDisasterTimeline(timeframeDays: number = 30): Promise<{
    timeline: Array<{
      date: string;
      disasters: number;
      reports: number;
      sos_signals: number;
    }>;
  }> {
    const response = await api.get(`/analytics/timeline?timeframe=${timeframeDays}`);
    return response.data;
  }

  // Get Resource Utilization Analytics
  async getResourceUtilization(): Promise<{
    utilization: Array<{
      resource_type: string;
      total: number;
      allocated: number;
      available: number;
      utilization_rate: number;
    }>;
    efficiency_score: number;
    recommendations: string[];
  }> {
    const response = await api.get('/admin/analytics/resources/utilization');
    return response.data;
  }

  // Get Response Time Analytics
  async getResponseTimeAnalytics(timeframeDays: number = 30): Promise<{
    average_response_time: number;
    response_times_by_type: { [key: string]: number };
    response_times_by_priority: { [key: string]: number };
    trends: Array<{
      date: string;
      average_response_time: number;
    }>;
  }> {
    const response = await api.get(`/analytics/response-times?timeframe=${timeframeDays}`);
    return response.data;
  }

  // Get Impact Analysis
  async getImpactAnalysis(timeframeDays: number = 30): Promise<{
    total_affected: number;
    casualties: number;
    displaced: number;
    economic_impact: number;
    infrastructure_damage: {
      roads: number;
      bridges: number;
      buildings: number;
      utilities: number;
    };
    recovery_progress: number;
  }> {
    const response = await api.get(`/analytics/impact?timeframe=${timeframeDays}`);
    return response.data;
  }

  // Get Alert Effectiveness
  async getAlertEffectiveness(timeframeDays: number = 30): Promise<{
    alerts_sent: number;
    alerts_acknowledged: number;
    acknowledgment_rate: number;
    response_rate: number;
    effectiveness_score: number;
    channels: Array<{
      channel: string;
      sent: number;
      delivered: number;
      acknowledged: number;
      delivery_rate: number;
    }>;
  }> {
    const response = await api.get(`/analytics/alerts/effectiveness?timeframe=${timeframeDays}`);
    return response.data;
  }

  // Get Comparative Analysis
  async getComparativeAnalysis(compareWith: 'previous_period' | 'last_year' | 'average'): Promise<{
    current_period: {
      disasters: number;
      reports: number;
      response_time: number;
      affected_people: number;
    };
    comparison_period: {
      disasters: number;
      reports: number;
      response_time: number;
      affected_people: number;
    };
    changes: {
      disasters: { value: number; percentage: number };
      reports: { value: number; percentage: number };
      response_time: { value: number; percentage: number };
      affected_people: { value: number; percentage: number };
    };
    insights: string[];
  }> {
    const response = await api.get(`/analytics/comparative?compare_with=${compareWith}`);
    return response.data;
  }

  // Get Real-time Statistics
  async getRealTimeStats(): Promise<{
    active_incidents: number;
    pending_reports: number;
    active_sos: number;
    response_teams_deployed: number;
    last_updated: string;
    recent_activities: Array<{
      type: string;
      message: string;
      timestamp: string;
      priority: string;
    }>;
  }> {
    const response = await api.get('/admin/analytics/realtime');
    return response.data;
  }

  // Generate Custom Report
  async generateCustomReport(params: {
    timeframe: number;
    metrics: string[];
    format: 'summary' | 'detailed';
    include_charts: boolean;
    filters?: {
      disaster_types?: string[];
      priorities?: string[];
      regions?: string[];
    };
  }): Promise<{
    report_id: string;
    generated_at: string;
    summary: any;
    detailed_data?: any;
    download_url?: string;
  }> {
    const response = await api.post('/analytics/custom-report', params);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();
