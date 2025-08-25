// Resource Analysis Map - Visualizes resource distribution and gaps
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { ResourceAnalysisPoint } from '../../types/mapTypes';
import MapService from '../../services/mapService';

interface ResourceAnalysisMapProps {
  map?: L.Map;
  filters?: any;
  onDataLoad?: (data: ResourceAnalysisPoint[]) => void;
}

const ResourceAnalysisMap: React.FC<ResourceAnalysisMapProps> = ({ 
  map,
  filters = {}, 
  onDataLoad
}) => {
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
      console.log('ResourceAnalysisMap: Map not ready yet, skipping resource analysis loading');
      return;
    }

    console.log('ResourceAnalysisMap: Starting to load resource data');
    console.log('ResourceAnalysisMap: Map instance available:', !!map);

    try {
      // Clear existing circles
      circles.forEach(circle => {
        map.removeLayer(circle);
      });
      setCircles([]);

      const response = await MapService.getResourceAnalysis();
      console.log('ResourceAnalysisMap: API Response:', response);
      const data = response.data;
      onDataLoad?.(data);
      console.log(`ResourceAnalysisMap: Loaded ${data.length} resource points`);

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
      console.error('Resource analysis loading error:', err);
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

  // Don't render anything - circles are added directly to the map
  return null;
};

export default ResourceAnalysisMap;
