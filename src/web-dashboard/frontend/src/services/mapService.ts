// Map API Service - Integration with all /api/map endpoints
import {
  ReportsResponse,
  HeatmapResponse,
  ResourceAnalysisResponse,
  MapStatisticsResponse,
  DisastersResponse,
  ReportsQueryParams,
  HeatmapQueryParams,
  DisastersQueryParams,
  MapBounds
} from '../types/mapTypes';

const API_BASE_URL = '/api/map';

export class MapService {
  /**
   * Build query string from parameters
   */
  private static buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Convert MapBounds to bounds string format
   */
  private static boundsToString(bounds: MapBounds): string {
    return `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private static async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      console.log(`MapService: Fetching: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`MapService: Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`MapService: API Error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log(`MapService: API Response data:`, data);
      return data;
    } catch (error) {
      console.error('MapService: Fetch error:', error);
      throw error;
    }
  }

  /**
   * 1. Get Reports - GET /api/map/reports
   * Retrieve disaster reports with optional filtering
   */
  static async getReports(params: ReportsQueryParams = {}): Promise<ReportsResponse> {
    const queryString = this.buildQueryString(params);
    const url = `${API_BASE_URL}/reports${queryString}`;
    return this.fetchWithErrorHandling<ReportsResponse>(url);
  }

  /**
   * Get Reports within map bounds
   */
  static async getReportsInBounds(bounds: MapBounds, additionalParams: Omit<ReportsQueryParams, 'bounds'> = {}): Promise<ReportsResponse> {
    const params = {
      ...additionalParams,
      bounds: this.boundsToString(bounds)
    };
    return this.getReports(params);
  }

  /**
   * 2. Get Heatmap Data - GET /api/map/heatmap  
   * Retrieve aggregated data for heatmap visualization
   */
  static async getHeatmapData(params: HeatmapQueryParams = {}): Promise<HeatmapResponse> {
    const queryString = this.buildQueryString(params);
    const url = `${API_BASE_URL}/heatmap${queryString}`;
    return this.fetchWithErrorHandling<HeatmapResponse>(url);
  }

  /**
   * 3. Get Resource Analysis - GET /api/map/resource-analysis
   * Retrieve resource requirements analysis by location
   */
  static async getResourceAnalysis(): Promise<ResourceAnalysisResponse> {
    const url = `${API_BASE_URL}/resource-analysis`;
    return this.fetchWithErrorHandling<ResourceAnalysisResponse>(url);
  }

  /**
   * 4. Get Map Statistics - GET /api/map/statistics
   * Retrieve overall map statistics and summaries
   */
  static async getMapStatistics(): Promise<MapStatisticsResponse> {
    const url = `${API_BASE_URL}/statistics`;
    return this.fetchWithErrorHandling<MapStatisticsResponse>(url);
  }

  /**
   * 5. Get Disasters - GET /api/map/disasters
   * Retrieve disaster records with optional filtering
   */
  static async getDisasters(params: DisastersQueryParams = {}): Promise<DisastersResponse> {
    const queryString = this.buildQueryString(params);
    const url = `${API_BASE_URL}/disasters${queryString}`;
    return this.fetchWithErrorHandling<DisastersResponse>(url);
  }

  /**
   * Get Disasters within map bounds
   */
  static async getDisastersInBounds(bounds: MapBounds, additionalParams: DisastersQueryParams = {}): Promise<DisastersResponse> {
    // Note: disasters endpoint might not support bounds, but we can filter client-side
    const disasters = await this.getDisasters(additionalParams);
    
    // Client-side filtering by bounds
    if (disasters.success && disasters.data.length > 0) {
      const filteredData = disasters.data.filter(disaster => {
        const { lat, lng } = disaster.location;
        return lat >= bounds.south && lat <= bounds.north && 
               lng >= bounds.west && lng <= bounds.east;
      });
      
      return {
        ...disasters,
        data: filteredData,
        count: filteredData.length
      };
    }
    
    return disasters;
  }

  /**
   * Utility: Test API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await this.getMapStatistics();
      return response.success;
    } catch (error) {
      console.error('Map API connection test failed:', error);
      return false;
    }
  }

  /**
   * Utility: Get all data for comprehensive map view
   */
  static async getAllMapData(params: {
    reports?: ReportsQueryParams;
    heatmap?: HeatmapQueryParams;
    disasters?: DisastersQueryParams;
  } = {}) {
    try {
      const [reports, heatmap, resources, statistics, disasters] = await Promise.all([
        this.getReports(params.reports),
        this.getHeatmapData(params.heatmap),
        this.getResourceAnalysis(),
        this.getMapStatistics(),
        this.getDisasters(params.disasters)
      ]);

      return {
        reports,
        heatmap,
        resources,
        statistics,
        disasters,
        success: true
      };
    } catch (error) {
      console.error('Failed to fetch all map data:', error);
      return {
        reports: null,
        heatmap: null,
        resources: null,
        statistics: null,
        disasters: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Utility: Filter data by priority level
   */
  static filterByPriority<T extends { priority: number }>(data: T[], minPriority: number): T[] {
    return data.filter(item => item.priority >= minPriority);
  }

  /**
   * Utility: Filter data by type
   */
  static filterByType<T extends { type: string }>(data: T[], types: string[]): T[] {
    return data.filter(item => types.includes(item.type));
  }

  /**
   * Utility: Filter data by status  
   */
  static filterByStatus<T extends { status: string }>(data: T[], statuses: string[]): T[] {
    return data.filter(item => statuses.includes(item.status));
  }

  /**
   * Utility: Filter data by date range
   */
  static filterByDateRange<T extends { created_at: string }>(
    data: T[], 
    startDate: string, 
    endDate: string
  ): T[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return data.filter(item => {
      const itemDate = new Date(item.created_at);
      return itemDate >= start && itemDate <= end;
    });
  }
}

export default MapService;
