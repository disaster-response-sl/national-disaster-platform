import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  AlertTriangle, 
  Users, 
  Layers, 
  Filter,
  RefreshCw,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { analyticsService, MapData, ZoneData } from '../services/analyticsService';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const createCustomIcon = (color: string, type: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const getMarkerColor = (type: string, priority: string) => {
  const priorityColors = {
    'critical': '#EF4444',
    'high': '#F97316',
    'medium': '#F59E0B',
    'low': '#10B981'
  };
  
  return priorityColors[priority as keyof typeof priorityColors] || '#6B7280';
};

interface MapFilters {
  type: string;
  priority: string;
  status: string;
  timeframe: number;
}

interface LayerVisibility {
  disasters: boolean;
  reports: boolean;
  sos: boolean;
  zones: boolean;
  heatmap: boolean;
}

const RealTimeMap: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [zoneData, setZoneData] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const [filters, setFilters] = useState<MapFilters>({
    type: '',
    priority: '',
    status: '',
    timeframe: 24
  });

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    disasters: true,
    reports: true,
    sos: true,
    zones: false,
    heatmap: false
  });

  useEffect(() => {
    loadMapData();
    
    if (autoRefresh) {
      refreshInterval.current = setInterval(loadMapData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [filters, autoRefresh]);

  const loadMapData = async () => {
    try {
      const [mapResponse, zoneResponse] = await Promise.all([
        analyticsService.getMapData(filters),
        analyticsService.getZoneData()
      ]);
      
      setMapData(mapResponse);
      setZoneData(zoneResponse);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof MapFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleLayer = (layer: keyof LayerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const exportMapData = async () => {
    try {
      const blob = await analyticsService.exportAnalytics('csv', filters.timeframe);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `map-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting map data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': '#EF4444',
      'monitoring': '#F59E0B',
      'resolved': '#10B981',
      'pending': '#6B7280'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Real-Time Disaster Map</h1>
            <p className="text-gray-600">Live tracking of disasters, reports, and emergency responses</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="auto-refresh" className="text-sm text-gray-600">Auto-refresh</label>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            <button
              onClick={loadMapData}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={exportMapData}
              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${showFilters ? 'w-80' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex-shrink-0`}>
          {showFilters ? (
            <div className="p-4">
              {/* Filters */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="fire">Fire</option>
                      <option value="storm">Storm</option>
                      <option value="landslide">Landslide</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="monitoring">Monitoring</option>
                      <option value="resolved">Resolved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe (hours)</label>
                    <select
                      value={filters.timeframe}
                      onChange={(e) => handleFilterChange('timeframe', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>Last hour</option>
                      <option value={6}>Last 6 hours</option>
                      <option value={24}>Last 24 hours</option>
                      <option value={72}>Last 3 days</option>
                      <option value={168}>Last week</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Layer Controls */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Map Layers</h3>
                
                <div className="space-y-2">
                  {Object.entries(layerVisibility).map(([layer, visible]) => (
                    <div key={layer} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 capitalize">
                        {layer.replace('_', ' ')}
                      </label>
                      <button
                        onClick={() => toggleLayer(layer as keyof LayerVisibility)}
                        className={`p-1 rounded ${visible ? 'text-blue-600' : 'text-gray-400'}`}
                      >
                        {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              {mapData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Current View</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Total Features: {mapData.features.length}</div>
                    <div>Active: {mapData.features.filter(f => f.properties.status === 'active').length}</div>
                    <div>Critical: {mapData.features.filter(f => f.properties.priority === 'critical').length}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <button
                onClick={() => setShowFilters(true)}
                className="w-full p-2 text-gray-600 hover:text-gray-900"
                title="Show Filters"
              >
                <Layers className="w-6 h-6 mx-auto" />
              </button>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20.5937, 78.9629]} // Center of India
            zoom={6}
            style={{ height: 'calc(100vh - 80px)', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Disaster/Report Markers */}
            {mapData && layerVisibility.disasters && mapData.features.map((feature, index) => (
              <Marker
                key={index}
                position={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
                icon={createCustomIcon(
                  getMarkerColor(feature.properties.type, feature.properties.priority),
                  feature.properties.type
                )}
                eventHandlers={{
                  click: () => setSelectedFeature(feature)
                }}
              >
                <Popup>
                  <div className="min-w-64">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{feature.properties.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        feature.properties.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        feature.properties.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        feature.properties.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {feature.properties.priority}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {feature.properties.type}</div>
                      <div><strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          feature.properties.status === 'active' ? 'bg-red-100 text-red-800' :
                          feature.properties.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {feature.properties.status}
                        </span>
                      </div>
                      <div><strong>Affected:</strong> {feature.properties.affected_population.toLocaleString()} people</div>
                      <div><strong>Time:</strong> {new Date(feature.properties.timestamp).toLocaleString()}</div>
                      <div><strong>Location:</strong> {feature.properties.location.lat.toFixed(4)}, {feature.properties.location.lng.toFixed(4)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Risk Zones */}
            {zoneData && layerVisibility.zones && zoneData.zones.map((zone, index) => (
              <Polygon
                key={index}
                positions={zone.coordinates}
                pathOptions={{
                  color: zone.risk_level === 'high' ? '#EF4444' : 
                         zone.risk_level === 'medium' ? '#F59E0B' : '#10B981',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="min-w-48">
                    <h3 className="font-bold text-lg mb-2">{zone.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div><strong>Type:</strong> {zone.type}</div>
                      <div><strong>Risk Level:</strong> 
                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          zone.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                          zone.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {zone.risk_level}
                        </span>
                      </div>
                      <div><strong>Population:</strong> {zone.population.toLocaleString()}</div>
                      <div><strong>Active Disasters:</strong> {zone.active_disasters}</div>
                      <div className="mt-2">
                        <strong>Resources:</strong>
                        <div className="ml-2">
                          <div>Medical: {zone.resources.medical}</div>
                          <div>Rescue: {zone.resources.rescue}</div>
                          <div>Relief: {zone.resources.relief}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            ))}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span>Critical Priority</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                <span>High Priority</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Medium Priority</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span>Low Priority</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMap;
