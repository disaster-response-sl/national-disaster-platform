import React, { useState } from 'react';
import { MapPin, AlertTriangle, Users, Activity } from 'lucide-react';

interface DisasterZone {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: { lat: number; lng: number };
  affectedPeople: number;
  status: 'active' | 'responding' | 'contained';
}

const SimpleMap: React.FC = () => {
  // Mock disaster data - in a real app, this would come from an API
  const [disasterZones] = useState<DisasterZone[]>([
    {
      id: '1',
      name: 'Colombo Flood Zone',
      severity: 'high',
      coordinates: { lat: 6.9271, lng: 79.8612 },
      affectedPeople: 2500,
      status: 'active'
    },
    {
      id: '2',
      name: 'Kandy Landslide Area',
      severity: 'critical',
      coordinates: { lat: 7.2906, lng: 80.6337 },
      affectedPeople: 1200,
      status: 'responding'
    },
    {
      id: '3',
      name: 'Galle Coastal Erosion',
      severity: 'medium',
      coordinates: { lat: 6.0329, lng: 80.2168 },
      affectedPeople: 800,
      status: 'contained'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'responding': return 'bg-yellow-500';
      case 'contained': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-gray-100 relative overflow-hidden">
      {/* Map Background Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Sri Lanka outline placeholder */}
        <div className="absolute inset-4 bg-white rounded-lg shadow-lg border-2 border-gray-200">
          <div className="p-4">
            <div className="text-center text-gray-500 mb-4">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <h3 className="text-lg font-semibold">Sri Lanka Disaster Risk Map</h3>
              <p className="text-sm">Real-time monitoring system</p>
            </div>

            {/* Map Grid */}
            <div className="grid grid-cols-3 gap-2 h-64">
              {/* Colombo Area */}
              <div className="relative bg-blue-50 rounded border-2 border-blue-200 p-2">
                <div className="text-xs font-medium text-blue-800 mb-1">Colombo</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Flood Risk</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Kandy Area */}
              <div className="relative bg-green-50 rounded border-2 border-green-200 p-2">
                <div className="text-xs font-medium text-green-800 mb-1">Kandy</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Landslide</span>
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Galle Area */}
              <div className="relative bg-yellow-50 rounded border-2 border-yellow-200 p-2">
                <div className="text-xs font-medium text-yellow-800 mb-1">Galle</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Coastal</span>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disaster Zones Overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
          Active Disaster Zones
        </h4>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {disasterZones.map((zone) => (
            <div key={zone.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="text-sm font-medium text-gray-900">{zone.name}</h5>
                  <div className="flex items-center mt-1">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(zone.severity)}`}>
                      {zone.severity.toUpperCase()}
                    </div>
                    <div className={`ml-2 w-2 h-2 rounded-full ${getStatusColor(zone.status)}`}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {zone.affectedPeople} affected
                </div>
                <div className="flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {zone.status}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Severity Legend</h5>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-yellow-400 rounded mr-1"></div>
              Low
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-orange-400 rounded mr-1"></div>
              Medium
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-red-400 rounded mr-1"></div>
              High
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-red-600 rounded mr-1"></div>
              Critical
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">System Online</span>
            </div>
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-1 text-blue-500" />
              <span className="text-gray-600">3 Active Zones</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
