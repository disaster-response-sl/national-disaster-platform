import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { authService } from '../services/authService';

const AnalyticsDashboard: React.FC = () => {
  // Get JWT token from authService
  const token = useMemo(() => authService.getToken() || '', []);
  const { statistics, loading, error } = useDashboardAnalytics(token);

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics Overview</h2>
        {loading && <div>Loading analytics...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {statistics && statistics.overview && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total Disasters</div>
              <div className="text-2xl font-bold text-blue-800">{statistics.overview.total_disasters}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Affected Population</div>
              <div className="text-2xl font-bold text-green-800">{statistics.overview.total_affected_population}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total Area (km²)</div>
              <div className="text-2xl font-bold text-yellow-800">{statistics.overview.total_area_km2}</div>
            </div>
          </div>
        )}
      </div>

      {/* Disasters by Status and Type Charts Side by Side */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Disasters by Status Bar Chart */}
          {statistics.by_status && statistics.by_status.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Disasters by Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.by_status} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} angle={0} dy={10} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Disasters by Type Bar Chart */}
          {statistics.by_type && statistics.by_type.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Disasters by Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.by_type} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(value) =>
                      value === '' || value === undefined ? 'Unknown' : value
                    }
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e42" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
