// Reports Map Component - Display disaster reports as markers
import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import MapService from '../../services/mapService';
import { Report, ReportsQueryParams } from '../../types/mapTypes';
import { AlertTriangle } from 'lucide-react';

interface ReportsMapProps {
  filters?: ReportsQueryParams;
  onReportClick?: (report: Report) => void;
  map?: L.Map; // Accept Leaflet map instance
}

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create priority-based icons with safer approach
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

const ReportsMap: React.FC<ReportsMapProps> = ({ 
  filters = {}, 
  onReportClick,
  map 
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);

  useEffect(() => {
    if (map && map.getContainer()) {
      loadReports();
    }
  }, [filters, map]);

  // Clean up markers when component unmounts or reports change
  useEffect(() => {
    return () => {
      if (map && map.getContainer()) {
        markers.forEach(marker => {
          try {
            map.removeLayer(marker);
          } catch (err) {
            console.warn('ReportsMap: Failed to cleanup marker:', err);
          }
        });
      }
    };
  }, [markers, map]);

  const loadReports = async () => {
    if (!map) {
      console.log('ReportsMap: Map not ready yet, skipping report loading');
      return;
    }

    if (!map.getContainer()) {
      console.log('ReportsMap: Map container not ready, skipping report loading');
      return;
    }

    console.log('ReportsMap: Starting to load reports with filters:', filters);
    console.log('ReportsMap: Map instance available:', !!map);

    try {
      setLoading(true);
      setError(null);
      
      // Clear existing markers
      markers.forEach(marker => {
        if (map && map.getContainer()) {
          try {
            map.removeLayer(marker);
          } catch (err) {
            console.warn('ReportsMap: Failed to remove marker:', err);
          }
        }
      });
      setMarkers([]);

      const response = await MapService.getReports(filters);
      console.log('ReportsMap: API Response:', response);
      setReports(response.data);
      console.log(`ReportsMap: Loaded ${response.data.length} reports`);

      // Add new markers
      if (response.data.length > 0 && map && map.getContainer()) {
        const newMarkers: L.Marker[] = [];
        
        response.data.forEach((report: Report) => {
          // Validate map instance before creating markers
          if (!map || !map.getContainer()) {
            console.warn('ReportsMap: Map instance invalid, skipping marker creation');
            return;
          }

          const marker = L.marker([report.location.lat, report.location.lng], {
            icon: createPriorityIcon(report.priority)
          });

          // Create popup content
          const popupContent = createPopupContent(report);
          marker.bindPopup(popupContent);
          
          // Add click handler
          marker.on('click', () => {
            onReportClick?.(report);
          });

          // Safely add marker to map with validation
          try {
            marker.addTo(map);
            newMarkers.push(marker);
          } catch (err) {
            console.error('ReportsMap: Failed to add marker to map:', err);
          }
        });

        setMarkers(newMarkers);

        // Fit map bounds to show all reports - only if we have valid markers
        if (newMarkers.length > 0) {
          const bounds = response.data.map((report: Report) => [
            report.location.lat, 
            report.location.lng
          ] as [number, number]);
          
          try {
            map.fitBounds(bounds, { padding: [20, 20] });
          } catch (err) {
            console.error('ReportsMap: Failed to fit bounds:', err);
          }
        }
      } else {
        console.warn('ReportsMap: No data or invalid map instance for marker creation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      console.error('Reports loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPopupContent = (report: Report): string => {
    const priorityLabel = getPriorityLabel(report.priority);
    
    return `
      <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="color: #f97316; font-size: 18px;">⚠️</div>
          <h3 style="font-weight: bold; font-size: 18px; color: #1f2937; margin: 0;">
            ${report.type?.charAt(0).toUpperCase() + (report.type?.slice(1) || '')} Report
          </h3>
        </div>

        <!-- Priority and Status -->
        <div style="display: flex; gap: 16px; margin-bottom: 12px;">
              {/* Debug Overlay: List all report locations */}
              {!loading && !error && reports.length > 0 && (
                <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-90 text-white rounded-lg shadow-lg p-4 z-[1100] max-h-[60vh] overflow-y-auto text-xs" style={{width: '320px'}}>
                  <div className="font-bold mb-2">🛠 Debug: All Report Locations</div>
                  <ul className="space-y-1">
                    {reports.map((r, idx) => (
                      <li key={r._id || idx} className="border-b border-gray-700 pb-1 mb-1">
                        <span className="font-mono">[{r.location.lat?.toFixed(4)}, {r.location.lng?.toFixed(4)}]</span>
                        {r.location.country && <span> | <span className="font-semibold">{r.location.country}</span></span>}
                        {r.location.city && <span> | <span className="font-semibold">{r.location.city}</span></span>}
                        {r.type && <span> | <span className="text-yellow-300">{r.type}</span></span>}
                        {r.status && <span> | <span className="text-blue-300">{r.status}</span></span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          <div>
            <span style="font-size: 14px; color: #6b7280;">Priority:</span>
            <span style="font-weight: 600; color: ${getPriorityColor(report.priority)}; margin-left: 4px;">
              ${priorityLabel} (${report.priority})
            </span>
          </div>
          <div>
            <span style="font-size: 14px; color: #6b7280;">Status:</span>
            <span style="font-weight: 600; color: ${getStatusColor(report.status)}; margin-left: 4px;">
              ${report.status?.charAt(0).toUpperCase() + (report.status?.slice(1) || '')}
            </span>
          </div>
        </div>

        <!-- Description -->
        ${report.description ? `
          <div style="margin-bottom: 12px;">
            <span style="font-size: 14px; color: #6b7280;">Description:</span>
            <p style="font-size: 14px; color: #1f2937; margin: 4px 0 0 0; line-height: 1.4;">
              ${report.description}
            </p>
          </div>
        ` : ''}

        <!-- Affected Count -->
        ${report.affected_population ? `
          <div style="margin-bottom: 12px;">
            <span style="font-size: 14px; color: #6b7280;">People Affected:</span>
            <span style="font-weight: 600; color: #1f2937; margin-left: 4px;">
              ${report.affected_population.toLocaleString()}
            </span>
          </div>
        ` : ''}

        <!-- Timestamp -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; text-xs; color: #6b7280;">
            <span>📅 ${new Date(report.created_at).toLocaleDateString()}</span>
            <span>📍 ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    `;
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return '#10B981'; // Green
      case 2: return '#F59E0B'; // Yellow
      case 3: return '#EF4444'; // Red
      case 4: return '#DC2626'; // Dark Red
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#F59E0B'; // Yellow
      case 'active': return '#EF4444'; // Red
      case 'addressed': return '#10B981'; // Green
      case 'in_progress': return '#3B82F6'; // Blue
      case 'resolved': return '#10B981'; // Green
      case 'closed': return '#6B7280'; // Gray
      default: return '#6B7280'; // Gray
    }
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {loading && map && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[1000] pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading reports...</span>
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

      {/* Info panel */}
      {!loading && !error && reports.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-4 z-[1000]">
          <div className="text-sm text-gray-700">
            <div className="font-medium mb-2">📊 Reports Summary</div>
            <div>Total Reports: <span className="font-semibold">{reports.length}</span></div>
            <div>Critical: <span className="font-semibold text-red-600">
              {reports.filter(r => r.priority >= 3).length}
            </span></div>
            <div>Active: <span className="font-semibold text-blue-600">
              {reports.filter(r => r.status === 'active' || r.status === 'pending').length}
            </span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsMap;