import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Map as MapIcon, AlertTriangle, Users, Activity } from 'lucide-react';
import type { Disaster } from '../services/dashboardService';
import 'leaflet/dist/leaflet.css';

interface GeographicOverviewProps {
  disasters: Disaster[];
  isLoading: boolean;
}

// Sri Lanka bounds
const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [
  [5.9, 79.5], // Southwest
  [9.9, 81.9]  // Northeast
];

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];

const GeographicOverview: React.FC<GeographicOverviewProps> = ({ disasters, isLoading }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  const getDisasterColor = (severity: string, type: string) => {
    const colors = {
      critical: '#dc2626', // red-600
      high: '#ea580c',     // orange-600
      medium: '#d97706',   // amber-600
      low: '#65a30d'       // lime-600
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  };

  const getDisasterSize = (severity: string) => {
    const sizes = {
      critical: 15,
      high: 12,
      medium: 9,
      low: 6
    };
    return sizes[severity as keyof typeof sizes] || 6;
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood': return '🌊';
      case 'landslide': return '⛰️';
      case 'fire': return '🔥';
      case 'earthquake': return '🏗️';
      case 'cyclone': return '🌀';
      case 'drought': return '🌵';
      default: return '⚠️';
    }
  };

  // Component to fit map bounds
  const FitBounds: React.FC = () => {
    const map = useMap();
    
    useEffect(() => {
      if (disasters.length > 0) {
        const bounds = disasters.map(disaster => [disaster.location.lat, disaster.location.lng] as [number, number]);
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } else {
        map.fitBounds(SRI_LANKA_BOUNDS);
      }
    }, [map, disasters]);

    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Overview</h3>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
          <MapIcon className="w-12 h-12 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Geographic Overview</h3>
        <div className="flex items-center text-sm text-gray-500">
          <MapIcon className="w-4 h-4 mr-1" />
          Sri Lanka
        </div>
      </div>

      {/* Map Container */}
      <div className="h-80 rounded-lg overflow-hidden border border-gray-200 mb-4">
        <MapContainer
          bounds={SRI_LANKA_BOUNDS}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={true}
          attributionControl={false}
          whenCreated={() => setMapLoaded(true)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          <FitBounds />
          
          {/* Disaster Markers */}
          {disasters.map((disaster) => (
            <CircleMarker
              key={disaster._id}
              center={[disaster.location.lat, disaster.location.lng]}
              radius={getDisasterSize(disaster.severity)}
              fillColor={getDisasterColor(disaster.severity, disaster.type)}
              color="white"
              weight={2}
              opacity={1}
              fillOpacity={0.8}
            >
              <Popup>
                <div className="p-2">
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">{getTypeIcon(disaster.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {disaster.type} - {disaster.severity}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(disaster.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {disaster.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      disaster.status === 'active' ? 'bg-red-100 text-red-800' :
                      disaster.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {disaster.status.toUpperCase()}
                    </span>
                    {disaster.affected_population && (
                      <span className="text-gray-500">
                        {disaster.affected_population.toLocaleString()} affected
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        {/* Severity Legend */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Severity Levels</h4>
          <div className="space-y-1">
            {[
              { level: 'critical', label: 'Critical', color: '#dc2626' },
              { level: 'high', label: 'High', color: '#ea580c' },
              { level: 'medium', label: 'Medium', color: '#d97706' },
              { level: 'low', label: 'Low', color: '#65a30d' }
            ].map(({ level, label, color }) => (
              <div key={level} className="flex items-center text-xs">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Disaster Types Legend */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Disaster Types</h4>
          <div className="space-y-1">
            {[
              { type: 'flood', icon: '🌊', label: 'Flood' },
              { type: 'landslide', icon: '⛰️', label: 'Landslide' },
              { type: 'fire', icon: '🔥', label: 'Fire' },
              { type: 'earthquake', icon: '🏗️', label: 'Earthquake' }
            ].map(({ type, icon, label }) => (
              <div key={type} className="flex items-center text-xs">
                <span className="mr-2">{icon}</span>
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-lg font-bold text-gray-900">
                {disasters.filter(d => d.status === 'active').length}
              </span>
            </div>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-4 h-4 text-yellow-600 mr-1" />
              <span className="text-lg font-bold text-gray-900">
                {disasters.filter(d => d.status === 'monitoring').length}
              </span>
            </div>
            <p className="text-xs text-gray-500">Monitoring</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-blue-600 mr-1" />
              <span className="text-lg font-bold text-gray-900">
                {disasters.reduce((sum, d) => sum + (d.affected_population || 0), 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500">Affected</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicOverview;
