import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { HeatmapLayerProps } from '../../types/map';
import { calculateHeatmapIntensity } from '../../utils/mapHelpers';

// Extend Leaflet types for heatLayer
declare module 'leaflet' {
  function heatLayer(latlngs: Array<[number, number, number]>, options?: any): any;
}

const HeatmapLayer = ({
  heatmapData,
  visible = true,
  opacity = 0.6,
}) => {
  const map = useMap();

  useEffect(() => {
    if (!visible || !heatmapData || heatmapData.length === 0) {
      // Remove existing heatmap layer if it exists
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.isHeatmapLayer) {
          map.removeLayer(layer);
        }
      });
      return;
    }

    // Convert heatmap data to Leaflet heat format
    const heatPoints: Array<[number, number, number]> = heatmapData.map(point => [
      point.lat,
      point.lng,
      calculateHeatmapIntensity(point) / 100, // Normalize to 0-1 for Leaflet
    ]);

    // Remove existing heatmap layer
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.isHeatmapLayer) {
        map.removeLayer(layer);
      }
    });

    // Create new heatmap layer
    const heatmapLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 18,
      opacity: opacity,
      gradient: {
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red',
      },
      isHeatmapLayer: true, // Custom property to identify this layer
    });

    // Add to map
    heatmapLayer.addTo(map);

    // Cleanup function
    return () => {
      map.eachLayer((layer: any) => {
        if (layer.options && layer.options.isHeatmapLayer) {
          map.removeLayer(layer);
        }
      });
    };
  }, [map, heatmapData, visible, opacity]);

  // This component doesn't render anything directly
  return null;
};

export default HeatmapLayer;
