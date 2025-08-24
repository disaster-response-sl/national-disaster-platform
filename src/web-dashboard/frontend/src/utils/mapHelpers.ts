import type { Report, HeatmapPoint, Location } from '../types/map';

// Default map center (Sri Lanka)
export const DEFAULT_MAP_CENTER: [number, number] = [7.8731, 80.7718];
export const DEFAULT_MAP_ZOOM = 8;

// Color schemes for different data types
export const PRIORITY_COLORS = {
  1: '#22c55e', // Low - Green
  2: '#eab308', // Medium - Yellow
  3: '#f97316', // High - Orange
  4: '#ef4444', // Critical - Red
  5: '#dc2626', // Emergency - Dark Red
};

export const STATUS_COLORS = {
  pending: '#f59e0b',
  'in-progress': '#3b82f6',
  resolved: '#10b981',
  closed: '#6b7280',
};

export const TYPE_COLORS = {
  flood: '#3b82f6',
  earthquake: '#8b5cf6',
  fire: '#ef4444',
  cyclone: '#06b6d4',
  landslide: '#f59e0b',
  accident: '#f97316',
  medical: '#ec4899',
  security: '#6366f1',
  other: '#6b7280',
};

/**
 * Get color based on priority level
 */
export const getPriorityColor = (priority: number): string => {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[1];
};

/**
 * Get color based on status
 */
export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
};

/**
 * Get color based on type
 */
export const getTypeColor = (type: string): string => {
  return TYPE_COLORS[type as keyof typeof TYPE_COLORS] || TYPE_COLORS.other;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a location is within given bounds
 */
export const isLocationInBounds = (
  location: Location,
  bounds: { north: number; south: number; east: number; west: number }
): boolean => {
  return (
    location.lat >= bounds.south &&
    location.lat <= bounds.north &&
    location.lng >= bounds.west &&
    location.lng <= bounds.east
  );
};

/**
 * Generate marker icon based on type and priority
 */
export const getMarkerIcon = (type: string, _priority: number): string => {
  const iconMap: { [key: string]: string } = {
    flood: '🌊',
    earthquake: '🌍',
    fire: '🔥',
    cyclone: '🌪️',
    landslide: '⛰️',
    accident: '🚗',
    medical: '🏥',
    security: '🚔',
    other: '⚠️',
  };
  
  return iconMap[type] || iconMap.other;
};

/**
 * Format priority level to readable text
 */
export const formatPriority = (priority: number): string => {
  const priorityMap: { [key: number]: string } = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Critical',
    5: 'Emergency',
  };
  
  return priorityMap[priority] || 'Unknown';
};

/**
 * Format status to readable text
 */
export const formatStatus = (status: string): string => {
  return status
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calculate heatmap intensity based on data
 */
export const calculateHeatmapIntensity = (point: HeatmapPoint): number => {
  // Normalize intensity based on count and priority
  const normalizedCount = Math.min(point.count / 10, 1); // Max out at 10 reports
  const priorityWeight = point.avgPriority / 5; // Normalize priority (1-5 to 0-1)
  
  return Math.min((normalizedCount * 0.7 + priorityWeight * 0.3) * 100, 100);
};

/**
 * Group reports by location for clustering
 */
export const groupReportsByLocation = (
  reports: Report[],
  tolerance: number = 0.01 // ~1km tolerance
): Array<{ location: Location; reports: Report[] }> => {
  const groups: Array<{ location: Location; reports: Report[] }> = [];

  reports.forEach(report => {
    const existingGroup = groups.find(group =>
      Math.abs(group.location.lat - report.location.lat) < tolerance &&
      Math.abs(group.location.lng - report.location.lng) < tolerance
    );

    if (existingGroup) {
      existingGroup.reports.push(report);
    } else {
      groups.push({
        location: report.location,
        reports: [report],
      });
    }
  });

  return groups;
};

/**
 * Convert coordinates to display format
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};
