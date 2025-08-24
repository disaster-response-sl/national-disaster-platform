// Map API service following the integration guide exactly
// Base URL as specified in the guide
const API_BASE_URL = 'http://localhost:5000/api/map';

// Types matching the guide's response formats
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export interface Location {
  lat: number;
  lng: number;
  country?: string;
}

export interface ResourceRequirements {
  food: number;
  water: number;
  [key: string]: number;
}

export interface Report {
  location: Location;
  resource_requirements: ResourceRequirements;
  [key: string]: any; // Additional fields as specified in guide
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

export interface MapStatistics {
  byType: Array<{ _id: string; count: number }>;
  [key: string]: any; // Additional fields as mentioned in guide
}

export interface Disaster {
  [key: string]: any; // Generic structure as guide shows empty array
}

// Query parameters for reports endpoint
export interface ReportsQuery {
  status?: string;
  type?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  bounds?: string;
  limit?: number;
}

// Query parameters for heatmap endpoint
export interface HeatmapQuery {
  type?: string;
  status?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
  gridSize?: number;
}

export class MapApiService {
  /**
   * 1. Get Reports - following guide example exactly
   */
  static async getReports(query: ReportsQuery = {}): Promise<ApiResponse<Report[]>> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/reports${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching reports from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Reports response:', result);
      
      return {
        success: true,
        data: Array.isArray(result.data) ? result.data : [],
        count: result.count || 0
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * 2. Get Heatmap Data - following guide example exactly  
   */
  static async getHeatmap(query: HeatmapQuery = {}): Promise<ApiResponse<HeatmapPoint[]>> {
    try {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/heatmap${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching heatmap from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Heatmap response:', result);
      
      return {
        success: true,
        data: Array.isArray(result.data) ? result.data : [],
        count: result.count || 0
      };
    } catch (error) {
      console.error('Error fetching heatmap:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * 3. Resource Analysis - following guide example exactly
   */
  static async getResourceAnalysis(): Promise<ApiResponse<ResourceAnalysis[]>> {
    try {
      const url = `${API_BASE_URL}/resource-analysis`;
      console.log('Fetching resource analysis from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Resource analysis response:', result);
      
      return {
        success: true,
        data: Array.isArray(result.data) ? result.data : [],
        count: result.count || 0
      };
    } catch (error) {
      console.error('Error fetching resource analysis:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * 4. Map Statistics - following guide example exactly
   */
  static async getStatistics(): Promise<ApiResponse<MapStatistics>> {
    try {
      const url = `${API_BASE_URL}/statistics`;
      console.log('Fetching statistics from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Statistics response:', result);
      
      return {
        success: true,
        data: result.data || { byType: [] },
        count: result.count || 0
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { success: false, data: { byType: [] } };
    }
  }

  /**
   * 5. List Disasters - following guide example exactly
   */
  static async getDisasters(): Promise<ApiResponse<Disaster[]>> {
    try {
      const url = `${API_BASE_URL}/disasters`;
      console.log('Fetching disasters from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Disasters response:', result);
      
      return {
        success: true,
        data: Array.isArray(result.data) ? result.data : [],
        count: result.count || 0
      };
    } catch (error) {
      console.error('Error fetching disasters:', error);
      return { success: false, data: [] };
    }
  }
}

export default MapApiService;
