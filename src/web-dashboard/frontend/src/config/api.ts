// API Configuration
// Handles environment-specific API base URLs

const getApiBaseUrl = (): string => {
  // In development, use relative URLs to leverage Vite proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, use absolute URL
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  
  // Resources
  RESOURCES: '/resources',
  RESOURCE_BY_ID: (id: string) => `/resources/${id}`,
  ALLOCATE_RESOURCE: (id: string) => `/resources/${id}/allocate`,
  RELEASE_RESOURCE: (id: string) => `/resources/${id}/release`,
  RESOURCE_USAGE_HISTORY: (id: string) => `/resources/${id}/usage-history`,
  RESOURCE_STATS: '/resources/stats',
  DASHBOARD_METRICS: '/resources/dashboard/metrics',
  
  // Allocation tracking
  ALLOCATIONS: '/resources/allocations',
  ALLOCATION_BY_ID: (id: string) => `/resources/allocations/${id}`,
  
  // Vendors
  VENDORS: '/resources/vendors',
  VENDOR_BY_ID: (id: string) => `/resources/vendors/${id}`,
  
  // Categories and types
  CATEGORIES: '/resources/categories',
  TYPES: '/resources/types',
  
  // Locations
  LOCATIONS: '/resources/locations',
  
  // Map endpoints
  MAP_REPORTS: '/map/reports',
  MAP_HEATMAP: '/map/heatmap',
  MAP_RESOURCE_ANALYSIS: '/map/resource-analysis',
  MAP_DISASTERS: '/map/disasters',
  
  // SOS endpoints
  SOS_SIGNALS: '/mobile/sos-signals',
  SOS_ANALYTICS: '/admin/sos/analytics',
} as const;

export default {
  API_BASE_URL,
  API_ENDPOINTS
};
