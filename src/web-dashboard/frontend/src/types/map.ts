// Import and re-export types from mapService for easy importing
import type {
  Location,
  ResourceRequirements,
  Report,
  HeatmapPoint,
  ResourceAnalysis,
  StatsByType,
  MapStatistics,
  Disaster,
  ReportsQuery,
  HeatmapQuery,
  ApiResponse
} from '../services/mapService';

export type {
  Location,
  ResourceRequirements,
  Report,
  HeatmapPoint,
  ResourceAnalysis,
  StatsByType,
  MapStatistics,
  Disaster,
  ReportsQuery,
  HeatmapQuery,
  ApiResponse
};

// Additional types for map components
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MarkerData {
  id: string;
  position: [number, number];
  type: string;
  priority: number;
  status: string;
  data: Report | Disaster;
}

export interface FilterState {
  status: string;
  type: string;
  priority: number | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Map layer types
export type MapLayerType = 'reports' | 'heatmap' | 'disasters' | 'resources';

export interface MapLayerConfig {
  id: MapLayerType;
  name: string;
  visible: boolean;
  opacity: number;
}

// Component props interfaces
export interface MapContainerProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  onBoundsChange?: (bounds: MapBounds) => void;
}

export interface ReportsLayerProps {
  reports: Report[];
  onReportClick?: (report: Report) => void;
  visible?: boolean;
}

export interface HeatmapLayerProps {
  heatmapData: HeatmapPoint[];
  visible?: boolean;
  opacity?: number;
}

export interface StatisticsPanelProps {
  statistics: MapStatistics | null | undefined;
  loading?: boolean;
  className?: string;
}

export interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
}
