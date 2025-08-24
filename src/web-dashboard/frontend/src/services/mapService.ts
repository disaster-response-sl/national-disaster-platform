import api from './authService';

// Type definitions for map API responses - matching the guide specification
export interface Location {
  lat: number;
  lng: number;
  country?: string;
}

export interface ResourceRequirements {
  food: number;
  water: number;
  shelter: number;
  medical: number;
  rescue: number;
  [key: string]: number;
}

export interface Report {
  _id: string;
  location: Location;
  resource_requirements: ResourceRequirements;
  type: string;
  status: string;
  priority: number;
  affected_people: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeatmapPoint {
  count: number;
  totalAffected: number;
  avgPriority: number;
  types: string[];
  statuses: string[];
  lat: number;
  lng: number;
  intensity: number;
}

export interface ResourceAnalysis {
  totalReports: number;
  totalAffected: number;
  criticalReports: number;
  lat: number;
  lng: number;
  resources: ResourceRequirements;
}

export interface StatsByType {
  _id: string;
  count: number;
}

export interface MapStatistics {
  byType: StatsByType[];
  byStatus: StatsByType[];
  byPriority: StatsByType[];
  totalReports: number;
  totalAffected: number;
}

export interface Disaster {
  _id: string;
  name: string;
  type: string;
  status: string;
  location: Location;
  affectedAreas: string[];
  estimatedAffected: number;
  priority: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Query parameters for filtering
export interface ReportsQuery {
  status?: string;
  type?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  bounds?: string; // Format: "lat1,lng1,lat2,lng2"
  limit?: number;
}

export interface HeatmapQuery {
  type?: string;
  status?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  gridSize?: number;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const mapService = {
  /**
   * Get reports with optional filtering
   */
  async getReports(query: ReportsQuery = {}): Promise<ApiResponse<Report[]>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/map/reports?${params.toString()}`);
    return response.data;
  },

  /**
   * Get heatmap data for visualization
   */
  async getHeatmapData(query: HeatmapQuery = {}): Promise<ApiResponse<HeatmapPoint[]>> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/map/heatmap?${params.toString()}`);
    return response.data;
  },

  /**
   * Get resource analysis data
   */
  async getResourceAnalysis(): Promise<ApiResponse<ResourceAnalysis[]>> {
    const response = await api.get('/map/resource-analysis');
    return response.data;
  },

  /**
   * Get map statistics
   */
  async getStatistics(): Promise<ApiResponse<MapStatistics>> {
    const response = await api.get('/map/statistics');
    return response.data;
  },

  /**
   * Get list of disasters
   */
  async getDisasters(): Promise<ApiResponse<Disaster[]>> {
    const response = await api.get('/map/disasters');
    return response.data;
  },

  /**
   * Helper function to format bounds for API
   */
  formatBounds(bounds: { north: number; south: number; east: number; west: number }): string {
    return `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  },

  /**
   * Helper function to format date for API
   */
  formatDate(date: Date): string {
    return date.toISOString();
  }
};

export default mapService;
