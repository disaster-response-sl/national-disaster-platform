// API Configuration for Map Services
export const API_CONFIG = {
  // Base URL for the API - change this to match your backend server
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? '/api'  // Relative URL for production (proxied)
    : 'http://localhost:5000/api',  // Full URL for development
  
  // Map-specific endpoints
  ENDPOINTS: {
    REPORTS: '/map/reports',
    HEATMAP: '/map/heatmap',
    RESOURCE_ANALYSIS: '/map/resource-analysis',
    STATISTICS: '/map/statistics',
    DISASTERS: '/map/disasters',
  },
  
  // WebSocket configuration
  WEBSOCKET_URL: process.env.NODE_ENV === 'production'
    ? 'ws://localhost:3001'  // Production WebSocket URL
    : 'ws://localhost:3001', // Development WebSocket URL
};

export default API_CONFIG;
