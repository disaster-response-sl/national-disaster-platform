// Maps Page - Comprehensive disaster maps with interactive components
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  MapPin, 
  Target,
  Wifi,
  WifiOff,
  AlertTriangle,
  Thermometer,
  Package
} from 'lucide-react';
import L from 'leaflet';
import MapService from '../services/mapService';

// Types for statistics and disasters
interface MapStatistics {
  byType: { _id: string; count: number }[];
  byStatus: { _id: string; count: number }[];
  byPriority: { _id: number; count: number }[];
  totalReports: number;
  totalAffected: number;
  criticalCount: number;
  avgResponseTime: number;
}

import { Disaster } from '../types/mapTypes';
import { Report, HeatmapPoint, ResourceAnalysisPoint, MapViewType } from '../types/mapTypes';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapsPageProps {
  onBack: () => void;
}

interface DisasterData extends Report {
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

const MapsPage: React.FC<MapsPageProps> = ({ onBack }) => {
  // State management
  const [currentView, setCurrentView] = useState<MapViewType>('reports');
  const [disasters, setDisasters] = useState<DisasterData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [resourceData, setResourceData] = useState<ResourceAnalysisPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllDisasters, setShowAllDisasters] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [statistics, setStatistics] = useState<MapStatistics | null>(null);
  const [disasterList, setDisasterList] = useState<Disaster[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const getDisasterIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flood': return '🌊';
      case 'landslide': return '⛰️';
      case 'cyclone': return '🌀';
      case 'fire': return '🔥';
      case 'earthquake': return '🏔️';
      default: return '⚠️';
    }
  };

  const getSeverityColor = (priority: number): string => {
    if (priority >= 4) return '#dc2626'; // Red - High
    if (priority >= 3) return '#ea580c'; // Orange - Medium-High
    if (priority >= 2) return '#f59e0b'; // Yellow - Medium
    return '#10b981'; // Green - Low
  };

  const getSeverityLevel = (priority: number): 'high' | 'medium' | 'low' => {
    if (priority >= 4) return 'high';
    if (priority >= 2) return 'medium';
    return 'low';
  };

  // Create custom icons
  const createDisasterIcon = (type: string, priority: number) => {
    const color = getSeverityColor(priority);
    const emoji = getDisasterIcon(type);
    
    return L.divIcon({
      className: 'custom-disaster-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 16px;
        ">
          ${emoji}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const createHeatmapIcon = (intensity: number) => {
    const colors = ['#10b981', '#f59e0b', '#ea580c', '#dc2626', '#991b1b'];
    const color = colors[Math.min(intensity, 4)];
    
    return L.divIcon({
      className: 'custom-heatmap-marker',
      html: `
        <div style="
          background-color: ${color};
          width: ${20 + intensity * 5}px;
          height: ${20 + intensity * 5}px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          opacity: 0.8;
        "></div>
      `,
      iconSize: [20 + intensity * 5, 20 + intensity * 5],
      iconAnchor: [(20 + intensity * 5) / 2, (20 + intensity * 5) / 2]
    });
  };

  const createResourceIcon = (criticalReports: number) => {
    const color = criticalReports >= 5 ? '#dc2626' : criticalReports >= 3 ? '#f59e0b' : '#10b981';
    
    return L.divIcon({
      className: 'custom-resource-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 14px;
        ">
          📦
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  // Data fetching functions
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [reportsResponse, heatmapResponse, resourceResponse, statisticsResponse, disastersResponse] = await Promise.all([
        MapService.getReports({ limit: 100 }),
        MapService.getHeatmapData(),
        MapService.getResourceAnalysis(),
        MapService.getMapStatistics(),
        MapService.getDisasters()
      ]);

      if (reportsResponse.success) {
        const processedReports = reportsResponse.data.map(report => ({
          ...report,
          severity: getSeverityLevel(report.priority),
          timestamp: new Date(report.created_at).toISOString()
        }));
        setDisasters(processedReports);
      }

      if (heatmapResponse.success) {
        setHeatmapData(heatmapResponse.data);
      }

      if (resourceResponse.success) {
        setResourceData(resourceResponse.data);
      }

      if (statisticsResponse.success) {
        setStatistics(statisticsResponse.data);
      }
      if (disastersResponse.success) {
        setDisasterList(disastersResponse.data);
      }
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const testAPIConnection = async () => {
    try {
      await MapService.getReports({ limit: 1 });
      setIsConnected(true);
    } catch (error) {
      console.error('API Connection failed:', error);
      setIsConnected(false);
    }
  };

  // Filter function
  const getFilteredData = () => {
    let filtered = disasters;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(disaster => disaster.severity === selectedFilter);
    }
    
    if (!showAllDisasters) {
      filtered = filtered.filter(disaster => disaster.status === 'active');
    }
    
    return filtered;
  };

  // Statistics calculation
  const getDataStats = () => {
    const filteredData = getFilteredData();
    
    return {
      high: filteredData.filter(d => d.severity === 'high').length,
      medium: filteredData.filter(d => d.severity === 'medium').length,
      low: filteredData.filter(d => d.severity === 'low').length,
      active: disasters.filter(d => d.status === 'active').length,
      heatmapZones: heatmapData.length,
      resourceAreas: resourceData.length
    };
  };

  // Map initialization
  useEffect(() => {
    if (mapRef.current && !mapInstance) {
      const map = L.map(mapRef.current).setView([7.8731, 80.7718], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      setMapInstance(map);
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        setMapInstance(null);
      }
    };
  }, [mapRef.current]);

  // Update map markers when data or view changes
  useEffect(() => {
    if (!mapInstance) return;

    // Clear existing markers
    markers.forEach(marker => {
      mapInstance.removeLayer(marker);
    });
    setMarkers([]);

    const newMarkers: L.Marker[] = [];

    if (currentView === 'reports') {
      const filteredData = getFilteredData();
      filteredData.forEach((disaster) => {
        const marker = L.marker([disaster.location.lat, disaster.location.lng], {
          icon: createDisasterIcon(disaster.type, disaster.priority)
        });

        const popupContent = `
          <div style="max-width: 300px; font-family: system-ui;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">${getDisasterIcon(disaster.type)}</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold;">
                ${disaster.type} - ${disaster.severity.toUpperCase()}
              </h3>
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong>Status:</strong> ${disaster.status}<br>
              <strong>Priority:</strong> ${disaster.priority}/5<br>
              <strong>Affected:</strong> ${disaster.affected_population.toLocaleString()} people
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong>Description:</strong><br>
              ${disaster.description}
            </div>
            
            <div style="font-size: 12px; color: #888; margin-top: 8px;">
              📅 ${new Date(disaster.created_at).toLocaleDateString()}<br>
              📍 ${disaster.location.lat.toFixed(4)}, ${disaster.location.lng.toFixed(4)}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.addTo(mapInstance);
        newMarkers.push(marker);
      });
    } else if (currentView === 'heatmap') {
      heatmapData.forEach((point) => {
        const marker = L.marker([point.lat, point.lng], {
          icon: createHeatmapIcon(point.intensity)
        });

        const popupContent = `
          <div style="max-width: 250px; font-family: system-ui;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">🌡️</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold;">
                Intensity Zone
              </h3>
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong>Intensity:</strong> ${point.intensity}/5<br>
              <strong>Reports:</strong> ${point.count}<br>
              <strong>Affected:</strong> ${point.totalAffected.toLocaleString()}
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong>Disaster Types:</strong><br>
              ${point.types.join(', ')}
            </div>
            
            <div style="font-size: 12px; color: #888; margin-top: 8px;">
              📍 ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 250 });
        marker.addTo(mapInstance);
        newMarkers.push(marker);
      });
    } else if (currentView === 'resources') {
      resourceData.forEach((resource) => {
        const marker = L.marker([resource.lat, resource.lng], {
          icon: createResourceIcon(resource.criticalReports)
        });
        
        const popupContent = `
          <div style="max-width: 300px; font-family: system-ui;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 20px;">📦</span>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold;">
                Resource Analysis
              </h3>
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong>Critical Reports:</strong> ${resource.criticalReports}<br>
              <strong>Total Affected:</strong> ${resource.totalAffected.toLocaleString()}<br>
              <strong>Total Reports:</strong> ${resource.totalReports}
            </div>
            
            <div style="margin-bottom: 8px;">
              <strong>Required Resources:</strong><br>
              • Food: ${resource.resources.food}<br>
              • Water: ${resource.resources.water}<br>
              • Medical: ${resource.resources.medical}<br>
              • Shelter: ${resource.resources.shelter}
            </div>
            
            <div style="font-size: 12px; color: #888; margin-top: 8px;">
              📍 ${resource.lat.toFixed(4)}, ${resource.lng.toFixed(4)}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 300 });
        marker.addTo(mapInstance);
        newMarkers.push(marker);
      });
    }

    setMarkers(newMarkers);
  }, [mapInstance, currentView, disasters, heatmapData, resourceData, selectedFilter, showAllDisasters]);

  // Utility functions
  const recenterMap = () => {
    if (mapInstance) {
      mapInstance.setView([7.8731, 80.7718], 7);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, []);

  const stats = getDataStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Maps</h2>
          <p className="text-gray-600">Fetching disaster data and initializing maps...</p>
        </div>
      </div>
    );
  }

  // ...existing code...
  // Show statistics summary above map
  // ...existing code...
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Interactive Maps Dashboard</h1>
            {!isConnected && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                <WifiOff className="w-4 h-4 inline mr-1" />
                Offline Mode
              </span>
            )}
            {isConnected && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                <Wifi className="w-4 h-4 inline mr-1" />
                Connected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={testAPIConnection}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Wifi className="w-4 h-4" />
              Test API
            </button>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Disaster Reports
            </button>
            <button
              onClick={() => setCurrentView('heatmap')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'heatmap'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              Intensity Heatmap
            </button>
            <button
              onClick={() => setCurrentView('resources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'resources'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Resource Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards & Map Statistics */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-900">{stats.high}</div>
            <div className="text-sm text-gray-600">High Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-gray-900">{stats.medium}</div>
            <div className="text-sm text-gray-600">Medium Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-900">{stats.low}</div>
            <div className="text-sm text-gray-600">Low Risk</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-gray-900">{stats.heatmapZones}</div>
            <div className="text-sm text-gray-600">Heat Zones</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-900">{stats.resourceAreas}</div>
            <div className="text-sm text-gray-600">Resource Areas</div>
          </div>
        </div>
        {/* Map Statistics Summary */}
        {statistics && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Map Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">Total Reports</div>
                <div className="text-xl font-bold">{statistics.totalReports}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Affected</div>
                <div className="text-xl font-bold">{statistics.totalAffected}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Critical Reports</div>
                <div className="text-xl font-bold">{statistics.criticalCount}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Avg Response Time</div>
                <div className="text-xl font-bold">{statistics.avgResponseTime}h</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-1">Reports by Type:</div>
              <div className="flex flex-wrap gap-2">
                {statistics.byType.map(type => (
                  <span key={type._id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{type._id}: {type.count}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Disaster List Count */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Disaster List</h3>
          <div className="text-sm text-gray-700">Total Disasters: <span className="font-bold">{disasterList.length}</span></div>
        </div>

        {/* Controls - Show only for reports view */}
        {currentView === 'reports' && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showAllDisasters}
                    onChange={(e) => setShowAllDisasters(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Show All Disasters</span>
                </label>
              </div>
              
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Levels
              </button>
              <button
                onClick={() => setSelectedFilter('high')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'high'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                🔴 High Risk
              </button>
              <button
                onClick={() => setSelectedFilter('medium')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'medium'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                🟡 Medium Risk
              </button>
              <button
                onClick={() => setSelectedFilter('low')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFilter === 'low'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                🟢 Low Risk
              </button>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="relative h-[600px]">
            <div ref={mapRef} className="w-full h-full"></div>
            
            {/* Map Controls */}
            <button
              onClick={recenterMap}
              className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              title="Recenter Map"
            >
              <Target className="w-5 h-5 text-gray-600" />
            </button>
            
            <button
              onClick={onRefresh}
              className="absolute top-4 right-16 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* View Info Panel */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-4">
              <div className="text-sm text-gray-700">
                <div className="font-medium mb-2 flex items-center gap-2">
                  {currentView === 'reports' && <AlertTriangle className="w-4 h-4" />}
                  {currentView === 'heatmap' && <Thermometer className="w-4 h-4" />}
                  {currentView === 'resources' && <Package className="w-4 h-4" />}
                  {currentView === 'reports' ? 'Disaster Reports' : 
                   currentView === 'heatmap' ? 'Intensity Heatmap' : 'Resource Analysis'}
                </div>
                
                {currentView === 'reports' && (
                  <>
                    <div>Total Reports: <span className="font-semibold">{getFilteredData().length}</span></div>
                    <div>Active Reports: <span className="font-semibold text-red-600">{stats.active}</span></div>
                  </>
                )}
                
                {currentView === 'heatmap' && (
                  <>
                    <div>Heat Zones: <span className="font-semibold">{stats.heatmapZones}</span></div>
                    <div>High Intensity: <span className="font-semibold text-red-600">
                      {heatmapData.filter(p => p.intensity >= 3).length}
                    </span></div>
                  </>
                )}
                
                {currentView === 'resources' && (
                  <>
                    <div>Resource Areas: <span className="font-semibold">{stats.resourceAreas}</span></div>
                    <div>Critical Areas: <span className="font-semibold text-red-600">
                      {resourceData.filter(r => r.criticalReports >= 5).length}
                    </span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapsPage;
