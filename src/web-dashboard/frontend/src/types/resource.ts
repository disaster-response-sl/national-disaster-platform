// TypeScript type definitions for Resource Management API
// Based on the API documentation response structures

// Base Resource interface
export interface Resource {
  _id: string;
  name: string;
  type: string;
  category: string;
  quantity: {
    current: number;
    unit: string;
    allocated?: number;
    reserved?: number;
  };
  available_quantity: number;
  allocated_quantity: number;
  reserved_quantity: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'available' | 'allocated' | 'reserved' | 'maintenance' | 'out_of_stock';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  specifications?: Record<string, any>;
  vendor_info?: {
    vendor_id?: string;
    vendor_name?: string;
    contact_info?: string;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

// Get All Resources Response
export interface GetAllResourcesResponse {
  success: boolean;
  data: Resource[];
  pagination: Pagination;
}

// Get Resource by ID Response
export interface GetResourceByIdResponse {
  success: boolean;
  data: Resource;
}

// Create Resource Request
export interface CreateResourceRequest {
  name: string;
  type: string;
  category: string;
  quantity: {
    current: number;
    unit: string;
    allocated?: number;
    reserved?: number;
  };
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status?: string;
  priority?: string;
  description?: string;
  specifications?: Record<string, any>;
  vendor_info?: {
    vendor_id?: string;
    vendor_name?: string;
    contact_info?: string;
  };
}

// Create Resource Response
export interface CreateResourceResponse {
  success: boolean;
  message: string;
  data: Resource;
}

// Update Resource Response
export interface UpdateResourceResponse {
  success: boolean;
  message: string;
  data: Resource;
}

// Delete Resource Response
export interface DeleteResourceResponse {
  success: boolean;
  message: string;
}

// Allocation interfaces
export interface AllocationRequest {
  quantity: number;
  disaster_id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  estimated_duration?: number;
}

export interface AllocationResponse {
  success: boolean;
  message: string;
  data: {
    allocated_quantity: number;
    remaining_available: number;
    deployment_id: string;
    disaster_id: string;
    disaster_code: string;
  };
}

// Reservation interfaces
export interface ReservationRequest {
  quantity: number;
  reason: string;
  reserved_until: string; // ISO date string
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  data: {
    reserved_quantity: number;
    remaining_available: number;
    reserved_until: string;
  };
}

// Inventory Summary interfaces
export interface InventoryByType {
  type: string;
  total_quantity: number;
  available_quantity: number;
  allocated_quantity: number;
  reserved_quantity: number;
  categories: Array<{
    category: string;
    quantity: number;
    available: number;
  }>;
}

export interface InventoryOverall {
  total_resources: number;
  total_quantity: number;
  available_quantity: number;
  allocated_quantity: number;
  reserved_quantity: number;
  utilization_rate: number;
}

export interface InventorySummaryResponse {
  success: boolean;
  data: {
    by_type: InventoryByType[];
    overall: InventoryOverall;
    last_updated: string;
  };
}

// AI Allocation Recommendations interfaces
export interface DemandAnalysis {
  disaster_type: string;
  severity_level: string;
  affected_population: number;
  estimated_duration: number;
  resource_requirements: Record<string, number>;
}

export interface AllocationRecommendation {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  recommended_quantity: number;
  priority_score: number;
  reason: string;
  estimated_impact: string;
}

export interface AIAllocationResponse {
  success: boolean;
  data: {
    demand_analysis: DemandAnalysis;
    recommendations: AllocationRecommendation[];
    generated_at: string;
  };
}

// Supply Chain Status interfaces
export interface SupplyChainResource {
  resource_id: string;
  name: string;
  type: string;
  vendor_name: string;
  status: string;
  quantity: number;
  expected_delivery?: string;
  last_updated: string;
}

export interface StatusSummary {
  status: string;
  count: number;
  total_quantity: number;
}

export interface SupplyChainStatusResponse {
  success: boolean;
  data: {
    resources: SupplyChainResource[];
    status_summary: StatusSummary[];
    last_updated: string;
  };
}

// Deployment Tracking interfaces
export interface DeploymentTracking {
  deployment_id: string;
  resource_id: string;
  resource_name: string;
  resource_type: string;
  disaster_id: string;
  disaster_title: string;
  allocated_quantity: number;
  deployment_location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'in_transit' | 'deployed' | 'completed' | 'recalled';
  estimated_duration: number;
  actual_duration?: number;
  deployed_at: string;
  completed_at?: string;
  notes?: string;
}

export interface DeploymentTrackingResponse {
  success: boolean;
  data: DeploymentTracking[];
  filters_applied: Record<string, any>;
}

// Bulk Update interfaces
export interface BulkUpdateRequest {
  resource_ids: string[];
  new_status: string;
  reason: string;
}

export interface BulkUpdateResponse {
  success: boolean;
  message: string;
  data: {
    matched_count: number;
    modified_count: number;
    reason: string;
  };
}

// AI Optimization interfaces
export interface OptimizationRequest {
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
}

export interface OptimizationResults {
  current_allocation: Record<string, number>;
  optimized_allocation: Record<string, number>;
  efficiency_gain: number;
  cost_savings: number;
  recommendations: string[];
}

export interface AIOptimizationResponse {
  success: boolean;
  data: {
    target_location: {
      lat: number;
      lng: number;
    };
    demand_analysis: DemandAnalysis;
    optimization_results: OptimizationResults;
  };
}

// Supply Chain Optimization interfaces
export interface SupplyChainOptimization {
  vendor_performance: Array<{
    vendor_id: string;
    vendor_name: string;
    performance_score: number;
    delivery_reliability: number;
    cost_efficiency: number;
  }>;
  inventory_recommendations: Array<{
    resource_type: string;
    current_stock: number;
    recommended_stock: number;
    reason: string;
  }>;
  cost_analysis: {
    current_costs: number;
    projected_savings: number;
    optimization_areas: string[];
  };
}

export interface SupplyChainOptimizationResponse {
  success: boolean;
  data: SupplyChainOptimization;
}

// Dashboard Metrics interfaces
export interface DashboardOverview {
  total_resources: number;
  available_resources: number;
  allocated_resources: number;
  reserved_resources: number;
  total_value: number;
  utilization_rate: number;
}

export interface ResourceBreakdown {
  by_type: Array<{
    type: string;
    count: number;
    available: number;
    percentage: number;
  }>;
  by_category: Array<{
    category: string;
    count: number;
    available: number;
    percentage: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export interface PerformanceMetrics {
  allocation_efficiency: number;
  response_time: number;
  resource_turnover: number;
  deployment_success_rate: number;
}

export interface DashboardMetricsResponse {
  success: boolean;
  data: {
    overview: DashboardOverview;
    breakdown: ResourceBreakdown;
    performance: PerformanceMetrics;
    generated_at: string;
  };
}

// Complete Deployment interfaces
export interface CompleteDeploymentRequest {
  deployment_id: string;
  actual_duration?: number;
  notes?: string;
}

export interface CompleteDeploymentResponse {
  success: boolean;
  message: string;
  data: {
    deployment: DeploymentTracking;
    resource_status: {
      resource_id: string;
      new_status: string;
      available_quantity: number;
    };
    remaining_allocated: number;
  };
}

// Query parameter types
export interface ResourceQueryParams {
  type?: string;
  category?: string;
  status?: string;
  priority?: string;
  location?: string; // "lat,lng"
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AIAllocationQueryParams {
  disaster_id?: string;
  location?: string; // "lat,lng"
}

export interface SupplyChainQueryParams {
  status?: string;
  vendor_id?: string;
}

export interface DeploymentTrackingQueryParams {
  disaster_id?: string;
  status?: string;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
}

export interface MetricsQueryParams {
  timeframe?: string;
}

// Error response type
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
