// Reports Map Component - Display disaster reports as markers
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import MapService from '../../services/mapService';
import { Report } from '../../types/mapTypes';

interface ReportsMapProps {
  map?: L.Map;
}

// Create priority-based icons
const createPriorityIcon = (priority: number) => {
  const colors = {
    1: { color: '#10B981', label: 'Low' },     // Green
    2: { color: '#F59E0B', label: 'Medium' },  // Yellow
    3: { color: '#EF4444', label: 'High' },    // Red
    4: { color: '#DC2626', label: 'Critical' } // Dark Red
  };
  
  const config = colors[priority as keyof typeof colors] || { color: '#6B7280', label: 'Unknown' };
  
  return L.divIcon({
    className: 'custom-priority-marker',
    html: `<div style="background-color: ${config.color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 11px;">${priority}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const ReportsMap: React.FC<ReportsMapProps> = ({ map }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [markers, setMarkers] = useState<L.Marker[]>([]);

  // Load reports data
  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await MapService.getReports({});
        setReports(response.data || []);
        console.log(`Loaded ${response.data?.length || 0} reports`);
      } catch (error) {
        console.error('Failed to load reports:', error);
        setReports([]);
      }
    };

    loadReports();
  }, []);

  // Add markers to map when reports change
  useEffect(() => {
    if (!map || !reports.length) {
      console.log('ReportsMap: Skipping marker creation - map:', !!map, 'reports:', reports.length);
      return;
    }

    console.log('ReportsMap: Adding markers to map', { mapAvailable: !!map, reportCount: reports.length });

    // Clear existing markers
    markers.forEach(marker => {
      try {
        if (map && marker) {
          map.removeLayer(marker);
        }
      } catch (error) {
        console.warn('ReportsMap: Error removing marker', error);
      }
    });
    
    // Add new markers
    const newMarkers: L.Marker[] = [];
    reports.forEach(report => {
      if (!report.location?.lat || !report.location?.lng) {
        console.warn('ReportsMap: Skipping report with invalid location', report);
        return;
      }

      try {
        const marker = L.marker([report.location.lat, report.location.lng], {
          icon: createPriorityIcon(report.priority || 1)
        });

        const popupContent = `
          <div style="min-width:180px;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:4px;">
              ${report.type || 'Unknown'}
            </div>
            <div style="font-size:12px;color:#555;margin-bottom:4px;">
              📍 ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}
            </div>
            <div><b>Priority:</b> ${report.priority || 'N/A'}</div>
            <div><b>Status:</b> ${report.status || 'Unknown'}</div>
            <div><b>Affected:</b> ${report.affected_population || 0}</div>
            <div><b>Description:</b> ${report.description || 'No description'}</div>
            <div style="font-size:11px;color:#888;margin-top:4px;">
              🕒 ${new Date(report.created_at).toLocaleString()}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 250 });
        
        if (map && typeof map.addLayer === 'function') {
          marker.addTo(map);
          newMarkers.push(marker);
        } else {
          console.error('ReportsMap: Invalid map instance', { map, hasAddLayer: typeof map?.addLayer });
        }
      } catch (error) {
        console.error('ReportsMap: Error creating marker for report', report, error);
      }
    });

    setMarkers(newMarkers);

    // Fit map bounds to show all reports
    if (newMarkers.length > 0 && map) {
      try {
        const bounds = L.latLngBounds(newMarkers.map(marker => marker.getLatLng()));
        map.fitBounds(bounds, { padding: [20, 20] });
      } catch (error) {
        console.error('ReportsMap: Error fitting bounds', error);
      }
    }

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => {
        try {
          if (map && marker) {
            map.removeLayer(marker);
          }
        } catch (error) {
          console.warn('ReportsMap: Error cleaning up marker', error);
        }
      });
    };
  }, [map, reports]);

  // Don't render anything - markers are added directly to the map
  return null;
};

export default ReportsMap;
