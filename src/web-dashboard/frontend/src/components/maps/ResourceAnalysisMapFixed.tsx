// Resource Analysis Map - Visualizes resource distribution and gaps
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { Package, AlertTriangle } from 'lucide-react';
import { ResourceAnalysisPoint } from '../../types/mapTypes';
import MapService from '../../services/mapService';

interface ResourceAnalysisMapProps {
  map?: L.Map;
  filters?: any;
  onDataLoad?: (data: ResourceAnalysisPoint[]) => void;
  className?: string;
}

const ResourceAnalysisMap: React.FC<ResourceAnalysisMapProps> = ({ 
  map,
  filters = {}, 
  onDataLoad,
  className = "" 
}) => {
  const [resourceData, setResourceData] = useState<ResourceAnalysisPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [circles, setCircles] = useState<L.Circle[]>([]);

  useEffect(() => {
    if (map) {
      loadResourceData();
    }
  }, [filters, map]);

  // Clean up circles when component unmounts
  useEffect(() => {
    return () => {
      if (map) {
        circles.forEach(circle => {
          map.removeLayer(circle);
        });
      }
    };
  }, [circles, map]);

  const loadResourceData = async () => {
    if (!map) {
      console.log('Map not ready yet, skipping resource analysis loading');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Clear existing circles
      circles.forEach(circle => {
        map.removeLayer(circle);
      });
      setCircles([]);

      const response = await MapService.getResourceAnalysis();
      const data = response.data;
      setResourceData(data);
      onDataLoad?.(data);

      // Add new circles
      if (data.length > 0) {
        const newCircles: L.Circle[] = [];
        
        data.forEach((point: ResourceAnalysisPoint) => {
          const criticalLevel = calculateCriticalLevel(point);
          const { color, radius } = getPointVisualization(point, criticalLevel);
          
          const circle = L.circle([point.lat, point.lng], {
            radius: radius,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
          });

          // Create popup content
          const popupContent = createPopupContent(point, criticalLevel);
          circle.bindPopup(popupContent);

          circle.addTo(map);
          newCircles.push(circle);
        });

        setCircles(newCircles);

        // Fit map bounds to show all resource points
        const bounds = data.map((point: ResourceAnalysisPoint) => [point.lat, point.lng] as [number, number]);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resource data');
      console.error('Resource analysis loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate critical level based on reports
  const calculateCriticalLevel = (point: ResourceAnalysisPoint): number => {
    if (point.totalReports === 0) return 0;
    return point.criticalReports / point.totalReports;
  };

  // Get visualization properties for a point
  const getPointVisualization = (point: ResourceAnalysisPoint, criticalLevel: number) => {
    const radius = getCircleRadius(point.totalAffected);
    const color = getResourceStatusColor(criticalLevel);
    return { color, radius };
  };

  // Create popup content for a resource point
  const createPopupContent = (point: ResourceAnalysisPoint, criticalLevel: number): string => {
    const statusText = getStatusText(criticalLevel);
    const statusColor = getResourceStatusColor(criticalLevel);
    
    return `
      <div style="padding: 12px; min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="color: #8b5cf6; font-size: 18px;">📦</div>
          <h3 style="font-weight: bold; font-size: 18px; color: #1f2937; margin: 0;">
            Resource Analysis Zone
          </h3>
        </div>

        <!-- Status Badge -->
        <div style="display: inline-block; background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
          ${statusText}
        </div>

        <!-- Key Metrics -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background-color: #f3f4f6; padding: 8px; border-radius: 8px;">
            <div style="font-size: 12px; color: #6b7280;">Total Reports</div>
            <div style="font-size: 18px; font-weight: bold; color: #1f2937;">${point.totalReports}</div>
          </div>
          <div style="background-color: #f3f4f6; padding: 8px; border-radius: 8px;">
            <div style="font-size: 12px; color: #6b7280;">Critical Reports</div>
            <div style="font-size: 18px; font-weight: bold; color: #dc2626;">${point.criticalReports}</div>
          </div>
        </div>

        <!-- Detailed Stats -->
        <div style="space-y: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: #6b7280;">Critical Level:</span>
            <span style="font-weight: 600; color: ${statusColor};">${formatPercentage(criticalLevel)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 14px; color: #6b7280;">Total Affected:</span>
            <span style="font-weight: 600; color: #1f2937;">${point.totalAffected.toLocaleString()}</span>
          </div>
        </div>

        <!-- Location -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
          <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;">
            <span>📍</span>
            <span>Location: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    `;
  };

  // Resource status color mapping based on critical level
  const getResourceStatusColor = (criticalLevel: number): string => {
    if (criticalLevel <= 0.2) return '#10b981'; // Green - low critical
    if (criticalLevel <= 0.4) return '#f59e0b'; // Yellow - moderate critical
    if (criticalLevel <= 0.6) return '#ef4444'; // Red - high critical
    return '#7c2d12'; // Dark red - very high critical
  };

  // Calculate circle radius based on total affected
  const getCircleRadius = (totalAffected: number): number => {
    const minRadius = 50;
    const maxRadius = 200;
    const normalizedAffected = Math.min(totalAffected / 1000, 1); // Normalize to 0-1
    return minRadius + (normalizedAffected * (maxRadius - minRadius));
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Get status text based on critical level
  const getStatusText = (criticalLevel: number): string => {
    if (criticalLevel <= 0.2) return 'Low Risk';
    if (criticalLevel <= 0.4) return 'Moderate Risk';
    if (criticalLevel <= 0.6) return 'High Risk';
    return 'Critical';
  };

  // Calculate total statistics
  const totalStats = resourceData.reduce((acc, point) => {
    acc.totalReports += point.totalReports;
    acc.totalAffected += point.totalAffected;
    acc.totalCritical += point.criticalReports;
    return acc;
  }, { 
    totalReports: 0, 
    totalAffected: 0, 
    totalCritical: 0
  });

  const averageCriticalLevel = totalStats.totalReports > 0 
    ? totalStats.totalCritical / totalStats.totalReports 
    : 0;

  return (
    <div className={className}>
      {/* Loading Overlay */}
      {loading && map && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Loading resource analysis...</span>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-[1000]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Overlay Statistics Panel */}
      {!loading && !error && resourceData.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Resource Summary</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Analysis Points:</span>
              <span className="font-medium">{resourceData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Reports:</span>
              <span className="font-medium">{totalStats.totalReports.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Critical Reports:</span>
              <span className="font-medium text-red-600">{totalStats.totalCritical.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Affected:</span>
              <span className="font-medium">{totalStats.totalAffected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Critical Level:</span>
              <span className={`font-medium ${
                averageCriticalLevel <= 0.2 ? 'text-green-600' :
                averageCriticalLevel <= 0.4 ? 'text-yellow-600' :
                averageCriticalLevel <= 0.6 ? 'text-red-600' : 'text-red-800'
              }`}>
                {formatPercentage(averageCriticalLevel)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Risk Levels:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Low (0-20%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Moderate (20-40%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>High (40-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-800 rounded-full"></div>
                <span>Critical (60%+)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAnalysisMap;
