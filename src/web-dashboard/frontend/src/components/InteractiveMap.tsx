import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapApi } from '../hooks/useMapApi';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const InteractiveMap = ({ className = "" }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const heatmapLayerRef = useRef(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('all');

  const { 
    reports, 
    heatmapData, 
    resourceAnalysis, 
    statistics, 
    disasters, 
    loading, 
    error, 
    refetch 
  } = useMapApi();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([7.8731, 80.7718], 7); // Sri Lanka center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Filter reports by type
    const filteredReports = selectedReportType === 'all' 
      ? reports 
      : reports.filter(report => report.type === selectedReportType);

    // Add report markers
    filteredReports.forEach((report, index) => {
      if (!report.location?.lat || !report.location?.lng) return;

      const marker = L.marker([report.location.lat, report.location.lng]);
      
      const popupContent = `
        <div class="p-3 max-w-sm">
          <h3 class="font-bold text-lg mb-2">Report #${index + 1}</h3>
          <div class="space-y-1 text-sm">
            <p><span class="font-medium">Type:</span> ${report.type || 'N/A'}</p>
            <p><span class="font-medium">Status:</span> ${report.status || 'N/A'}</p>
            <p><span class="font-medium">Priority:</span> ${report.priority || 'N/A'}</p>
            <p><span class="font-medium">Affected People:</span> ${report.affected_people || 'N/A'}</p>
            <p><span class="font-medium">Description:</span> ${report.description || 'No description'}</p>
            <p><span class="font-medium">Location:</span> ${report.location.country || 'Unknown'}</p>
            <div class="mt-2">
              <p class="font-medium">Resource Requirements:</p>
              <p class="text-xs">Food: ${report.resource_requirements?.food || 0}</p>
              <p class="text-xs">Water: ${report.resource_requirements?.water || 0}</p>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
    });

    // Add resource analysis markers with different icons
    resourceAnalysis.forEach((resource, index) => {
      if (!resource.lat || !resource.lng) return;

      const icon = L.divIcon({
        html: `<div style="background-color: #dc2626; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
        className: 'custom-div-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([resource.lat, resource.lng], { icon });
      
      const popupContent = `
        <div class="p-3 max-w-sm">
          <h3 class="font-bold text-lg mb-2 text-red-600">Resource Analysis #${index + 1}</h3>
          <div class="space-y-1 text-sm">
            <p><span class="font-medium">Total Reports:</span> ${resource.totalReports}</p>
            <p><span class="font-medium">Critical Reports:</span> ${resource.criticalReports}</p>
            <p><span class="font-medium">Total Affected:</span> ${resource.totalAffected}</p>
            <div class="mt-2">
              <p class="font-medium">Required Resources:</p>
              <p class="text-xs">Food: ${resource.resources?.food || 0}</p>
              <p class="text-xs">Water: ${resource.resources?.water || 0}</p>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current?.addLayer(marker);
    });

  }, [reports, resourceAnalysis, selectedReportType]);

  // Update heatmap when data changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing heatmap
    if (heatmapLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }

    if (showHeatmap && heatmapData.length > 0) {
      const heatPoints = heatmapData.map(point => [
        point.lat,
        point.lng,
        point.intensity
      ]);

      heatmapLayerRef.current = (L as any).heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
      }).addTo(mapInstanceRef.current);
    }
  }, [heatmapData, showHeatmap]);

  // Get unique report types for filter
  const reportTypes = ['all', ...new Set(reports.map(report => report.type).filter(Boolean))];

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Map Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => refetch.all()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry Loading Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-xs">
        <h3 className="font-bold text-lg mb-3">Map Controls</h3>
        
        {/* Report Type Filter */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
          >
            {reportTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>

        {/* Heatmap Toggle */}
        <div className="mb-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Show Heatmap</span>
          </label>
        </div>

        {/* Statistics Display */}
        <div className="text-xs text-gray-600">
          <p>Reports: {reports.length}</p>
          <p>Heatmap Points: {heatmapData.length}</p>
          <p>Resource Areas: {resourceAnalysis.length}</p>
          <p>Disasters: {disasters.length}</p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => refetch.all()}
          className="w-full mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-bold text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>Reports</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span>Resource Analysis</span>
          </div>
          {showHeatmap && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-red-600 rounded mr-2"></div>
              <span>Intensity Heatmap</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default InteractiveMap;
