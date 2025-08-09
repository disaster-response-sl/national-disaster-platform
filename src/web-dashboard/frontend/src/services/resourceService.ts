import api from './api';

export interface Resource {
  _id: string;
  name: string;
  type: string;
  category: string;
  quantity: {
    current: number;
    allocated: number;
    reserved: number;
    unit: string;
  };
  status: 'available' | 'dispatched' | 'reserved' | 'depleted';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  supplier?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  deployment_history?: Array<{
    deployed_to: {
      disaster_id: string;
      location: any;
    };
    quantity_deployed: number;
    deployed_at: string;
    deployed_by: string;
    status?: string;
  }>;
}

export interface ResourceFilters {
  type?: string;
  category?: string;
  status?: string;
  priority?: string;
  location?: string;
  radius?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardMetrics {
  overview: {
    total_resources: number;
    low_stock_alerts: number;
    avg_utilization_rate: number;
    recent_deployments: number;
  };
  breakdown: {
    by_status: Array<{ _id: string; count: number; total_quantity: number }>;
    by_type: Array<{ _id: string; count: number; total_quantity: number }>;
  };
  performance: {
    total_quantity_deployed: number;
    deployment_rate: number;
    timeframe_days: number;
  };
}

export interface InventorySummary {
  by_type: Array<{
    _id: string;
    statuses: Array<{
      status: string;
      total_quantity: number;
      allocated_quantity: number;
      reserved_quantity: number;
      count: number;
    }>;
    total_resources: number;
    total_quantity: number;
  }>;
  overall: {
    total_resources: number;
    total_quantity: number;
    total_allocated: number;
    total_reserved: number;
    critical_resources: number;
    depleted_resources: number;
  };
}

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

export interface ReservationRequest {
  quantity: number;
  reason: string;
  reserved_until?: string;
}

export interface CreateResourceRequest {
  name: string;
  type: string;
  category: string;
  quantity: {
    current: number;
    unit: string;
  };
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'available' | 'dispatched' | 'reserved' | 'depleted';
  supplier?: {
    name: string;
    contact: string;
    organization: string;
  };
  expiry_date?: string;
  description?: string;
}

export interface AIAllocationRecommendation {
  demand_analysis: {
    totalDemand: number;
    priority_breakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  recommendations: Array<{
    resource_id: string;
    resource_name: string;
    resource_type: string;
    current_quantity: number;
    available_quantity: number;
    ai_recommendation: {
      recommended_allocation: number;
      confidence_score: number;
      risk_level: string;
      reasoning: string;
    };
  }>;
}

export interface SupplyChainStatus {
  resources: Array<{
    _id: string;
    name: string;
    type: string;
    supply_chain: {
      procurement_status: string;
      vendor_id?: string;
      last_updated: string;
    };
    quantity: {
      current: number;
      unit: string;
    };
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
    created_at: string;
  }>;
  status_summary: Array<{
    _id: string;
    count: number;
    total_quantity: number;
  }>;
}

export interface DeploymentTracking {
  _id: string;
  resource_name: string;
  resource_type: string;
  deployments: Array<{
    deployed_to: {
      disaster_id: string;
      location: any;
    };
    quantity_deployed: number;
    deployed_at: string;
    deployed_by: string;
    status?: string;
    estimated_duration?: number;
    actual_duration?: number;
    notes?: string;
  }>;
  total_deployed: number;
}

export const resourceService = {
  // Get all resources with optional filtering
  async getAllResources(filters?: ResourceFilters): Promise<Resource[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await api.get(`/resources?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  // Get specific resource by ID
  async getResourceById(id: string): Promise<Resource> {
    try {
      const response = await api.get(`/resources/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  },

  // Create new resource
  async createResource(resourceData: CreateResourceRequest): Promise<Resource> {
    try {
      const response = await api.post('/resources', resourceData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  },

  // Update resource
  async updateResource(id: string, updateData: Partial<CreateResourceRequest>): Promise<Resource> {
    try {
      const response = await api.put(`/resources/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  },

  // Delete resource
  async deleteResource(id: string): Promise<boolean> {
    try {
      await api.delete(`/resources/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  },

  // Allocate resource to disaster
  async allocateResource(id: string, allocationData: AllocationRequest): Promise<any> {
    try {
      const response = await api.post(`/resources/${id}/allocate`, allocationData);
      return response.data.data;
    } catch (error) {
      console.error('Error allocating resource:', error);
      throw error;
    }
  },

  // Reserve resource
  async reserveResource(id: string, reservationData: ReservationRequest): Promise<any> {
    try {
      const response = await api.post(`/resources/${id}/reserve`, reservationData);
      return response.data.data;
    } catch (error) {
      console.error('Error reserving resource:', error);
      throw error;
    }
  },

  // Get inventory summary
  async getInventorySummary(): Promise<InventorySummary> {
    try {
      const response = await api.get('/resources/inventory/summary');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      throw error;
    }
  },

  // Get dashboard metrics
  async getDashboardMetrics(timeframe = 7): Promise<DashboardMetrics> {
    try {
      const response = await api.get(`/resources/dashboard/metrics?timeframe=${timeframe}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  // Get AI allocation recommendations
  async getAIAllocationRecommendations(disaster_id?: string, location?: string): Promise<AIAllocationRecommendation> {
    try {
      const params = new URLSearchParams();
      if (disaster_id) params.append('disaster_id', disaster_id);
      if (location) params.append('location', location);
      
      const response = await api.get(`/resources/analytics/allocation?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching AI allocation recommendations:', error);
      throw error;
    }
  },

  // Get supply chain status
  async getSupplyChainStatus(status?: string, vendor_id?: string): Promise<SupplyChainStatus> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (vendor_id) params.append('vendor_id', vendor_id);
      
      const response = await api.get(`/resources/supply-chain/status?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching supply chain status:', error);
      throw error;
    }
  },

  // Get deployment tracking
  async getDeploymentTracking(filters?: {
    disaster_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<DeploymentTracking[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      const response = await api.get(`/resources/deployment/tracking?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching deployment tracking:', error);
      throw error;
    }
  },

  // Bulk update resource status
  async bulkUpdateStatus(resource_ids: string[], new_status: string, reason?: string): Promise<any> {
    try {
      const response = await api.post('/resources/bulk/update-status', {
        resource_ids,
        new_status,
        reason
      });
      return response.data.data;
    } catch (error) {
      console.error('Error bulk updating resource status:', error);
      throw error;
    }
  },

  // AI optimize allocation
  async optimizeAllocation(location: { lat: number; lng: number }, radius = 50): Promise<any> {
    try {
      const response = await api.post('/resources/ai/optimize-allocation', {
        location,
        radius
      });
      return response.data.data;
    } catch (error) {
      console.error('Error optimizing allocation:', error);
      throw error;
    }
  },

  // Get AI supply chain optimization
  async getSupplyChainOptimization(timeframe = 30): Promise<any> {
    try {
      const response = await api.get(`/resources/ai/supply-chain-optimization?timeframe=${timeframe}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching supply chain optimization:', error);
      throw error;
    }
  },

  // Complete deployment
  async completeDeployment(resourceId: string, deploymentId: string, data: {
    actual_duration?: number;
    notes?: string;
  }): Promise<any> {
    try {
      const response = await api.post(`/resources/${resourceId}/complete-deployment`, {
        deployment_id: deploymentId,
        ...data
      });
      return response.data.data;
    } catch (error) {
      console.error('Error completing deployment:', error);
      throw error;
    }
  }
};
