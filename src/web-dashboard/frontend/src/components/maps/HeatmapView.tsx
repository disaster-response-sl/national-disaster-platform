// Heatmap Component - Display disaster intensity as heatmap
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import MapService from '../../services/mapService';
import { HeatmapPoint, HeatmapQueryParams } from '../../types/mapTypes';
import { Thermometer, AlertTriangle } from 'lucide-react';

interface HeatmapViewProps {
  map?: L.Map;
  filters?: HeatmapQueryParams;
}

// Simple heatmap implementation using circle markers
const HeatmapView: React.FC<HeatmapViewProps> = ({ map, filters }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heatmapLayer, setHeatmapLayer] = useState<L.LayerGroup | null>(null);

  // Fetch heatmap data
  const fetchHeatmapData = async (queryParams?: HeatmapQueryParams) => {
    if (!map) {
      console.log('HeatmapView: Map not ready yet, skipping heatmap loading');
      return;
    }
    
    console.log('HeatmapView: Starting to load heatmap with params:', queryParams);
    console.log('HeatmapView: Map instance available:', !!map);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await MapService.getHeatmapData(queryParams);
      console.log('HeatmapView: API Response:', response);
      
      if (response.success) {
        setHeatmapData(response.data);
        console.log(`HeatmapView: Loaded ${response.data.length} heatmap points`);
      } else {
        console.error('HeatmapView: API returned success=false:', response);
        setError('Failed to load heatmap data');
      }
    } catch (err) {
      console.error('HeatmapView: Error fetching heatmap:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create heatmap visualization
  useEffect(() => {
    if (!map || !heatmapData.length) return;

    // Clear existing heatmap
    if (heatmapLayer) {
      map.removeLayer(heatmapLayer);
    }

    // Create new layer group
    const newHeatmapLayer = L.layerGroup();

    // Find max intensity for normalization
    const maxIntensity = Math.max(...heatmapData.map(point => point.intensity));

    heatmapData.forEach((point) => {
      const { lat, lng, intensity, count, totalAffected, avgPriority, types, statuses } = point;
      
      if (!lat || !lng) return;

      // Normalize intensity (0-1)
      const normalizedIntensity = intensity / maxIntensity;
      
      // Calculate radius based on count
      const radius = Math.max(20, Math.min(100, count * 10));
      
      // Color based on intensity and priority
      const getHeatmapColor = (intensity: number, priority: number) => {
        if (priority >= 3 || intensity > 0.8) return '#DC2626'; // High/Critical - Red
        if (priority >= 2 || intensity > 0.6) return '#F59E0B'; // Medium - Orange
        if (priority >= 1.5 || intensity > 0.4) return '#EAB308'; // Low-Medium - Yellow
        return '#10B981'; // Low - Green
      };
      
      const color = getHeatmapColor(normalizedIntensity, avgPriority);
      const opacity = Math.max(0.3, normalizedIntensity);

      // Create circle marker
      const circle = L.circle([lat, lng], {
        radius: radius,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: opacity
      });

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <h3 class="font-bold text-lg mb-2 text-gray-800">Disaster Intensity Zone</h3>
          
          <div class="space-y-2 text-sm">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-gray-600">Reports:</span>
                <span class="font-medium ml-1">${count}</span>
              </div>
              <div>
                <span class="text-gray-600">Affected:</span>
                <span class="font-medium ml-1">${totalAffected.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-gray-600">Avg Priority:</span>
              <span class="font-medium">${avgPriority.toFixed(1)}</span>
              <div class="w-2 h-2 rounded-full ${
                avgPriority >= 3 ? 'bg-red-500' : 
                avgPriority >= 2 ? 'bg-yellow-500' : 'bg-green-500'
              }"></div>
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-gray-600">Intensity:</span>
              <span class="font-medium">${intensity}</span>
            </div>
            
            ${types.length > 0 ? `
              <div class="mt-2">
                <span class="text-gray-600">Types:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${types.map(type => `
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${type}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            ${statuses.length > 0 ? `
              <div class="mt-2">
                <span class="text-gray-600">Statuses:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  ${statuses.map(status => `
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">${status}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      newHeatmapLayer.addLayer(circle);
    });

    newHeatmapLayer.addTo(map);
    setHeatmapLayer(newHeatmapLayer);

    // Cleanup function
    return () => {
      if (newHeatmapLayer) {
        map.removeLayer(newHeatmapLayer);
      }
    };
  }, [map, heatmapData]);

  // Fetch data when component mounts or filters change
  useEffect(() => {
    if (map) {
      fetchHeatmapData(filters);
    }
  }, [map, filters]);

  // Return loading/error states as overlay
  if (loading || error) {
    return (
      <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
        {loading && (
          <div className="flex items-center gap-2 text-orange-600">
            <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading heatmap...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        )}
      </div>
    );
  }

  // Return heatmap summary as overlay
  return (
    <div className="absolute top-20 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Thermometer className="w-4 h-4 text-orange-600" />
        <span className="font-medium">Heatmap</span>
      </div>
      <div className="text-sm text-gray-600">
        {heatmapData.length} intensity zones
      </div>
      {heatmapData.length > 0 && (
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Max Intensity:</span>
            <span className="font-medium text-orange-600">
              {Math.max(...heatmapData.map(p => p.intensity))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Reports:</span>
            <span className="font-medium">
              {heatmapData.reduce((sum, p) => sum + p.count, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Affected:</span>
            <span className="font-medium">
              {heatmapData.reduce((sum, p) => sum + p.totalAffected, 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Intensity Scale:</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs">Low</span>
          <div className="w-3 h-3 bg-yellow-500 rounded ml-2"></div>
          <span className="text-xs">Med</span>
          <div className="w-3 h-3 bg-red-500 rounded ml-2"></div>
          <span className="text-xs">High</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapView;
