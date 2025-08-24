import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo } from 'react';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { authService } from '../services/authService';
import { Layers, Database, Shield, Download, CheckCircle, Upload } from 'lucide-react';
import NDXDataProviders from './NDXDataProviders';
import NDXConsentManagement from './NDXConsentManagement';
import NDXDataExchange from './NDXDataExchange';
import ImportExportPage from './ImportExportPage';
// import NDXIntegrationSummary from './NDXIntegrationSummary';

const NDXDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'providers' | 'consent' | 'exchange' | 'import-export'>('providers');

  // Get JWT token from authService
  const token = useMemo(() => authService.getToken() || '', []);
  const { statistics, loading, error } = useDashboardAnalytics(token);
  
  // Debug log to verify component is loading
  React.useEffect(() => {
    console.log('NDX Dashboard component loaded successfully');
  }, []);

  const tabs = [
    {
      id: 'providers' as const,
      label: 'Data Providers',
      icon: <Database className="w-5 h-5" />,
      description: 'View available data providers'
    },
    {
      id: 'consent' as const,
      label: 'Consent Management',
      icon: <Shield className="w-5 h-5" />,
      description: 'Manage data exchange consent'
    },
    {
      id: 'exchange' as const,
      label: 'Data Exchange',
      icon: <Download className="w-5 h-5" />,
      description: 'Exchange data with approved consent'
    },
    {
      id: 'import-export' as const,
      label: 'Import & Export',
      icon: <Upload className="w-5 h-5" />,
      description: 'Bulk import and export disaster data'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'providers':
        return <NDXDataProviders />;
      case 'consent':
        return <NDXConsentManagement />;
      case 'exchange':
        return <NDXDataExchange />;
      case 'import-export':
        return <ImportExportPage onBack={() => setActiveTab('providers')} />;
      default:
        return null;
    }
  };

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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">NDX Integration Dashboard</h1>
            <p className="text-gray-600">National Data Exchange Platform Integration</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">System Ready</span>
            </div>
            <p className="text-sm text-green-700 mt-1">All features available</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Data Providers</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">Connect to data sources</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Consent Management</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">Control data access permissions</p>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-900">Data Exchange</span>
            </div>
            <p className="text-sm text-indigo-700 mt-1">Retrieve authorized data</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600 text-sm">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
          
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default NDXDashboard;
