import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { Filter, Loader2 } from 'lucide-react';
import MainLayout from './MainLayout';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types
interface Report {
  id: string;
  location: { lat: number; lng: number };
  type: string;
  status: string;
  priority: string;
  description?: string;
  timestamp: string;
  affected_people?: number;
  resource_requirements?: Record<string, unknown>;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  count?: number;
  totalAffected?: number;
}

interface ResourceAnalysis {
  lat: number;
  lng: number;
  totalAffected: number;
  resources?: Record<string, unknown>;
  totalReports?: number;
}

interface Filters {
  type?: string;
  status?: string;
  priority?: string;
}

interface Disaster {
  type: string;
  [key: string]: unknown;
}

// Sri Lanka center coordinates
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

// Reports Layer Component
const ReportsLayer: React.FC<{ reports: Report[]; loading: boolean }> = ({ reports, loading }) => {
  const map = useMap();

  useEffect(() => {
    if (loading || !reports.length) return;

    const markers: L.Marker[] = [];

    reports.forEach((report) => {
      const marker = L.marker([report.location.lat, report.location.lng])
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg">${report.type}</h3>
            <p class="text-sm text-gray-600">${report.description || 'No description'}</p>
            <div class="mt-2">
              <span class="inline-block bg-${report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'yellow' : 'green'}-100 text-${report.priority === 'high' ? 'red' : report.priority === 'medium' ? 'yellow' : 'green'}-800 text-xs px-2 py-1 rounded-full">
                ${report.priority.toUpperCase()}
              </span>
              <span class="inline-block ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                ${report.status}
              </span>
            </div>
            ${report.affected_people ? `<div class="mt-2"><strong>Affected People:</strong> ${report.affected_people}</div>` : ''}
            ${report.resource_requirements ? `<div class="mt-2"><strong>Resources:</strong> ${Object.keys(report.resource_requirements).join(', ')}</div>` : ''}
          </div>
        `);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }, [reports, loading, map]);

  return null;
};

// Heatmap Layer Component
const HeatmapLayer: React.FC<{ heatmapData: HeatmapPoint[]; loading: boolean }> = ({ heatmapData, loading }) => {
  const map = useMap();

  useEffect(() => {
    if (loading || !heatmapData.length) return;

    // @ts-expect-error leaflet.heat plugin type definitions may be incomplete
    const heatLayer = L.heatLayer(
      heatmapData.map(point => [point.lat, point.lng, point.intensity]),
      {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [heatmapData, loading, map]);

  return null;
};

// Resource Analysis Layer Component
const ResourceAnalysisLayer: React.FC<{ resourceData: ResourceAnalysis[]; loading: boolean }> = ({ resourceData, loading }) => {
  const map = useMap();

  useEffect(() => {
    if (loading || !resourceData.length) return;

    const circles: L.Circle[] = [];

    resourceData.forEach((resource) => {
      const radius = Math.sqrt(resource.totalAffected) * 100; // Scale the radius
      const circle = L.circle([resource.lat, resource.lng], {
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.5,
        radius: radius
      })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-lg">Resource Analysis</h3>
            <p class="text-sm">Total Affected: ${resource.totalAffected}</p>
            <p class="text-sm">Total Reports: ${resource.totalReports || 0}</p>
            ${resource.resources ? `
              <div class="mt-2">
                <strong>Resources Needed:</strong>
                <ul class="list-disc list-inside text-sm">
                  ${Object.entries(resource.resources).map(([key, value]) => `<li>${key}: ${value}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `);
      circles.push(circle);
    });

    return () => {
      circles.forEach(circle => map.removeLayer(circle));
    };
  }, [resourceData, loading, map]);

  return null;
};

// Filter Panel Component
const FilterPanel: React.FC<{
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  disasterTypes: string[];
  loading: boolean;
}> = ({ filters, onFiltersChange, disasterTypes, loading }) => {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg w-64 max-w-[calc(100vw-2rem)] md:w-64">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Filter className="w-5 h-5 mr-2" />
        Filters
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disaster Type</label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={loading}
          >
            <option value="">All Types</option>
            {disasterTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={loading}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={loading}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Main Disaster Heat Map Component
const DisasterHeatMap: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [resourceData, setResourceData] = useState<ResourceAnalysis[]>([]);
  const [disasterTypes, setDisasterTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const queryString = params.toString();

      const [reportsRes, heatmapRes, resourceRes, disastersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAP_REPORTS}${queryString ? `?${queryString}` : ''}`),
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAP_HEATMAP}${queryString ? `?${queryString}` : ''}`),
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAP_RESOURCE_ANALYSIS}${queryString ? `?${queryString}` : ''}`),
        axios.get(`${API_BASE_URL}${API_ENDPOINTS.MAP_DISASTERS}`)
      ]);

      setReports(reportsRes.data.data || []);
      setHeatmapData(heatmapRes.data.data || []);
      setResourceData(resourceRes.data.data || []);
      setDisasterTypes(disastersRes.data.data ? [...new Set((disastersRes.data.data as Disaster[]).map((d: Disaster) => d.type))] : []);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Failed to load map data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <MainLayout>
      <div className="p-6 h-full">
        <div className="max-w-7xl mx-auto h-full">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Disaster Response Heat Map</h1>
              {loading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading data...
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-200px)] relative">
            {error && (
              <div className="absolute top-4 right-4 z-[1000] bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              disasterTypes={disasterTypes}
              loading={loading}
            />

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

              <ReportsLayer reports={reports} loading={loading} />
              <HeatmapLayer heatmapData={heatmapData} loading={loading} />
              <ResourceAnalysisLayer resourceData={resourceData} loading={loading} />
            </MapContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DisasterHeatMap;
