// Map API TypeScript Interfaces
export interface Location {
  lat: number;
  lng: number;
  country?: string;
}

export interface ResourceRequirements {
  food: number;
  water: number;
  medical: number;
  shelter: number;
  personnel: number;
  rescue_teams: number;
  medical_units: number;
  vehicles: number;
  boats: number;
  helicopters: number;
  food_supplies: number;
  water_supplies: number;
  medical_supplies: number;
  temporary_shelters: number;
}

// 1. Reports API Response
export interface Report {
  _id: string;
  location: Location;
  resource_requirements: ResourceRequirements;
  type: string;
  status: string;
  priority: number;
  description: string;
  affected_population: number;
  created_at: string;
  updated_at: string;
}

export interface ReportsResponse {
  success: boolean;
  data: Report[];
  count: number;
}

// 2. Heatmap API Response
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

export interface HeatmapResponse {
  success: boolean;
  data: HeatmapPoint[];
}

// 3. Resource Analysis API Response
export interface ResourceAnalysisPoint {
  totalReports: number;
  totalAffected: number;
  criticalReports: number;
  lat: number;
  lng: number;
  resources: ResourceRequirements;
}

export interface ResourceAnalysisResponse {
  success: boolean;
  data: ResourceAnalysisPoint[];
}

// 4. Map Statistics API Response
export interface StatsByType {
  _id: string;
  count: number;
}

export interface StatsByStatus {
  _id: string;
  count: number;
}

export interface StatsByPriority {
  _id: number;
  count: number;
}

export interface MapStatistics {
  totalReports: number;
  totalAffected: number;
  byType: StatsByType[];
  byStatus: StatsByStatus[];
  byPriority: StatsByPriority[];
  criticalCount: number;
  avgResponseTime: number;
}

export interface MapStatisticsResponse {
  success: boolean;
  data: MapStatistics;
}

// 5. Disasters API Response
export interface Disaster {
  _id: string;
  disaster_code: string;
  title: string;
  type: string;
  severity: string;
  description: string;
  location: Location;
  status: string;
  priority_level: string;
  affected_population: number;
  created_at: string;
  updated_at: string;
}

export interface DisastersResponse {
  success: boolean;
  data: Disaster[];
  count: number;
}

// Query Parameters for filtering
export interface ReportsQueryParams {
  status?: string;
  type?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  bounds?: string; // "lat1,lng1,lat2,lng2"
  limit?: number;
}

export interface HeatmapQueryParams {
  type?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  gridSize?: number;
}

export interface DisastersQueryParams {
  status?: string;
  type?: string;
  severity?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Map View Types
export type MapViewType = 'reports' | 'heatmap' | 'resources' | 'disasters';

// Map Bounds for filtering
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export default {};
