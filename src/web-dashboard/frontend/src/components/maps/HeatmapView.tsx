// Heatmap View Component - Display disaster intensity zones
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import MapService from '../../services/mapService';
import { HeatmapPoint, HeatmapQueryParams } from '../../types/mapTypes';

interface HeatmapViewProps {
  map?: L.Map;
  filters?: HeatmapQueryParams;
  onPointClick?: (point: HeatmapPoint) => void;
}

const HeatmapView: React.FC<HeatmapViewProps> = ({ 
  map,
  filters = {}, 
  onPointClick 
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [circles, setCircles] = useState<L.CircleMarker[]>([]);

  useEffect(() => {
    loadHeatmapData();
  }, [filters]);

  const loadHeatmapData = async () => {
    console.log('HeatmapView: Starting to load heatmap data with filters:', filters);
    console.log('HeatmapView: Map instance available:', !!map);

    try {
      const response = await MapService.getHeatmapData(filters);
      setHeatmapData(response.data || []);
      console.log(`HeatmapView: Loaded ${response.data?.length || 0} heatmap points`);
    } catch (error) {
      console.error('HeatmapView: Error loading heatmap data:', error);
      setHeatmapData([]);
    }
  };

  // Add circles to map when data changes
  useEffect(() => {
    if (!map || !heatmapData.length) return;

    // Clear existing circles
    circles.forEach(circle => map.removeLayer(circle));
    
    // Add new circles
    const newCircles: L.CircleMarker[] = [];
    heatmapData.forEach(point => {
      if (!point.lat || !point.lng) return;

      // Determine color based on intensity
      const getIntensityColor = (intensity: number) => {
        if (intensity >= 0.8) return '#DC2626'; // Red
        if (intensity >= 0.6) return '#EA580C'; // Orange-red
        if (intensity >= 0.4) return '#F59E0B'; // Orange
        if (intensity >= 0.2) return '#EAB308'; // Yellow
        return '#10B981'; // Green
      };

      const circle = L.circleMarker([point.lat, point.lng], {
        radius: Math.max(5, point.intensity * 20),
        fillColor: getIntensityColor(point.intensity),
        color: '#fff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6
      });

      const popupContent = `
        <div style="min-width:160px;">
          <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">
            Intensity Zone
          </div>
          <div style="font-size:12px;color:#555;margin-bottom:4px;">
            📍 ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}
          </div>
          <div><b>Intensity:</b> ${(point.intensity * 100).toFixed(1)}%</div>
          <div><b>Incidents:</b> ${point.count}</div>
          <div><b>Avg Priority:</b> ${point.avgPriority.toFixed(1)}</div>
        </div>
      `;

      circle.bindPopup(popupContent, { maxWidth: 200 });
      
      if (onPointClick) {
        circle.on('click', () => onPointClick(point));
      }

      circle.addTo(map);
      newCircles.push(circle);
    });

    setCircles(newCircles);

    // Fit map bounds to show all points
    if (newCircles.length > 0) {
      const bounds = L.latLngBounds(newCircles.map(circle => circle.getLatLng()));
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    // Cleanup function
    return () => {
      newCircles.forEach(circle => map.removeLayer(circle));
    };
  }, [map, heatmapData, onPointClick]);

  // Don't render anything - circles are added directly to the map
  return null;
};

export default HeatmapView;
