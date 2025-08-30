import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { Loader2, AlertTriangle } from 'lucide-react';
import MainLayout from './MainLayout';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// SOS Signal interface
interface SosSignal {
  _id: string;
  user_id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm';
  assigned_responder?: string;
  response_time?: Date;
  resolution_time?: Date;
  emergency_type: string;
  created_at: string;
  updated_at: string;
}

// Sri Lanka center coordinates
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

// SOS Signals Layer Component
const SosSignalsLayer: React.FC<{ sosSignals: SosSignal[]; loading: boolean }> = ({ sosSignals, loading }) => {
  const map = useMap();

  useEffect(() => {
    if (loading || !sosSignals.length) return;

    const markers: L.Marker[] = [];

    sosSignals.forEach((signal) => {
      // Create custom icon based on priority
      const getIconColor = (priority: string) => {
        switch (priority) {
          case 'critical': return 'red';
          case 'high': return 'orange';
          case 'medium': return 'yellow';
          case 'low': return 'green';
          default: return 'blue';
        }
      };

      const iconColor = getIconColor(signal.priority);
      const customIcon = L.divIcon({
        html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-sos-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([signal.location.lat, signal.location.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-3 min-w-[200px]">
            <h3 class="font-bold text-lg mb-2 flex items-center">
              <AlertTriangle class="w-4 h-4 mr-2 text-red-500" />
              SOS Alert
            </h3>
            <div class="space-y-1 text-sm">
              <p><strong>User ID:</strong> ${signal.user_id}</p>
              <p><strong>Priority:</strong>
                <span class="px-2 py-1 rounded text-xs font-medium ${
                  signal.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  signal.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  signal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }">
                  ${signal.priority.toUpperCase()}
                </span>
              </p>
              <p><strong>Status:</strong>
                <span class="px-2 py-1 rounded text-xs font-medium ${
                  signal.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                  signal.status === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                  signal.status === 'responding' ? 'bg-blue-100 text-blue-800' :
                  signal.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }">
                  ${signal.status.toUpperCase()}
                </span>
              </p>
              <p><strong>Location:</strong> ${signal.location.address || 'Unknown'}</p>
              <p><strong>Emergency Type:</strong> ${signal.emergency_type}</p>
              <p><strong>Time:</strong> ${new Date(signal.created_at).toLocaleString()}</p>
              ${signal.message ? `<p><strong>Message:</strong> ${signal.message}</p>` : ''}
              ${signal.assigned_responder ? `<p><strong>Assigned Responder:</strong> ${signal.assigned_responder}</p>` : ''}
            </div>
          </div>
        `);

      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [sosSignals, loading, map]);

  return null;
};

// Main SOS Heat Map Component
const SOSHeatMap: React.FC = () => {
  const [sosSignals, setSosSignals] = useState<SosSignal[]>([]);
  const [sosLoading, setSosLoading] = useState(true);

  // Fetch SOS data function
  const fetchSosData = useCallback(async () => {
    setSosLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.SOS_SIGNALS}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = response.data.data || [];
      setSosSignals(data);
    } catch (err) {
      console.error('Error fetching SOS data:', err);
    } finally {
      setSosLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchSosData();
  }, [fetchSosData]);

  return (
    <MainLayout>
      <div className="p-6 h-full">
        <div className="max-w-7xl mx-auto h-full">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">SOS Alerts Heat Map</h1>
              {sosLoading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading SOS signals...
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)] relative">
            {/* SOS Statistics Panel */}
            <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-64">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                SOS Statistics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Signals:</span>
                  <span className="font-medium">{sosSignals.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Critical:</span>
                  <span className="font-medium text-red-600">
                    {sosSignals.filter(s => s.priority === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High Priority:</span>
                  <span className="font-medium text-orange-600">
                    {sosSignals.filter(s => s.priority === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium text-gray-600">
                    {sosSignals.filter(s => s.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>

            <MapContainer
              center={SRI_LANKA_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              className="z-0 rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <SosSignalsLayer sosSignals={sosSignals} loading={sosLoading} />
            </MapContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SOSHeatMap;
