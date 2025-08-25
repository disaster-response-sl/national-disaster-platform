// Maps Page - Integrated disaster maps with interactive components
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Activity, 
  Thermometer, 
  Package, 
  Building,
  Wifi, 
  WifiOff, 
  RefreshCw,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useMapApiConnection } from '../hooks/useMapApiConnection';
import MapService from '../services/mapService';
import { MapViewType } from '../types/mapTypes';

// Map Components
import InteractiveMap from './maps/InteractiveMap';
import ReportsMap from './maps/ReportsMap';
import HeatmapView from './maps/HeatmapView';
import ResourceAnalysisMap from './maps/ResourceAnalysisMap';
import MapControls from './maps/MapControls';

interface MapsPageProps {
  onBack: () => void;
}

const MapsPage: React.FC<MapsPageProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<MapViewType>('reports');
  const [mapFilters, setMapFilters] = useState({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [apiTestResults, setApiTestResults] = useState<Record<string, any>>({});
  
  // API Connection Status
  const { 
    isConnected, 
    isLoading,
    error,
    statistics,
    testConnection 
  } = useMapApiConnection();

  // Test all API endpoints
  const testAllEndpoints = async () => {
    console.log('Testing all Map API endpoints...');
    
    try {
      const results = await MapService.getAllMapData({
        reports: { limit: 10 },
        heatmap: { gridSize: 0.1 },
        disasters: { limit: 10 }
      });
      
      setApiTestResults(results);
      console.log('All API Test Results:', results);
    } catch (error) {
      console.error('API Test Error:', error);
      // Set a more detailed error state
      setApiTestResults({
        error: 'Failed to connect to backend APIs. Please ensure the backend server is running on the correct port.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  useEffect(() => {
    if (isConnected) {
      testAllEndpoints();
    }
  }, [isConnected]);

  const handleRefreshData = async () => {
    setLastUpdated(new Date());
    await testConnection();
    if (isConnected) {
      await testAllEndpoints();
    }
  };

  const handleViewChange = (view: MapViewType) => {
    console.log('MapsPage: Changing view from', currentView, 'to', view);
    setCurrentView(view);
    setMapFilters({}); // Reset filters when changing views
  };

  const handleFiltersChange = (filters: any) => {
    setMapFilters(filters);
  };

  // View configurations
  const viewConfigs = {
    reports: {
      title: 'Disaster Reports',
      description: 'Interactive markers showing individual disaster reports',
      icon: MapPin,
      color: 'blue'
    },
    heatmap: {
      title: 'Intensity Heatmap',
      description: 'Heat visualization of disaster concentration and intensity',
      icon: Thermometer,
      color: 'red'
    },
    resources: {
      title: 'Resource Analysis',
      description: 'Resource distribution and gaps analysis',
      icon: Package,
      color: 'green'
    },
    disasters: {
      title: 'Official Disasters',
      description: 'Officially declared disasters and their status',
      icon: Building,
      color: 'purple'
    }
  };

  const currentConfig = viewConfigs[currentView];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Display for debugging */}
      {Object.keys(apiTestResults).length > 0 && apiTestResults.error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg z-[2000] max-w-lg">
          <div className="font-semibold">Connection Error:</div>
          <div className="text-sm mt-1">{apiTestResults.error}</div>
          {apiTestResults.details && (
            <div className="text-xs mt-2 text-red-600">{apiTestResults.details}</div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="p-2 rounded-lg bg-blue-100">
                <currentConfig.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentConfig.title}</h1>
                <p className="text-sm text-gray-600">{currentConfig.description}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {isConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {isLoading && 'Connecting...'}
                  {!isLoading && isConnected && 'Connected'}
                  {!isLoading && !isConnected && 'Connection Failed'}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* Test Connection Button */}
              <button
                onClick={testConnection}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Test APIs</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-100px)]">
        {/* Statistics Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          {/* API Status Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              API Status
            </h3>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <p className="text-red-700 text-sm">Error: {error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              {Object.entries(apiTestResults).map(([endpoint, result]) => (
                <div 
                  key={endpoint}
                  className={`p-3 rounded-lg border ${
                    result && typeof result === 'object' && 'success' in result && result.success
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}
                    </span>
                    {result && typeof result === 'object' && 'success' in result ? (
                      result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  {result && typeof result === 'object' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {result.success ? (
                        <span>✓ Data count: {result.data?.length || result.count || 'N/A'}</span>
                      ) : (
                        <span>✗ {result.error || 'Failed'}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Map Statistics */}
          {statistics?.success && statistics.data && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistics
              </h3>
              
              <div className="space-y-4">
                {/* Total Reports */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {statistics.data.totalReports?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-blue-600">Total Reports</div>
                </div>

                {/* Total Affected */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {statistics.data.totalAffected?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-red-600">People Affected</div>
                </div>

                {/* Critical Reports */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-700">
                    {statistics.data.criticalCount?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-orange-600">Critical Reports</div>
                </div>

                {/* By Type */}
                {statistics.data.byType && statistics.data.byType.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">By Disaster Type</h4>
                    <div className="space-y-1">
                      {statistics.data.byType.slice(0, 5).map((type: any) => (
                        <div key={type._id} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{type._id}</span>
                          <span className="font-medium">{type.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By Status */}
                {statistics.data.byStatus && statistics.data.byStatus.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">By Status</h4>
                    <div className="space-y-1">
                      {statistics.data.byStatus.map((status: any) => (
                        <div key={status._id} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{status._id}</span>
                          <span className="font-medium">{status.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 border-t pt-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isConnected ? (
            <InteractiveMap className="w-full h-full">
              {/* Map Controls */}
              <MapControls
                currentView={currentView}
                onViewChange={handleViewChange}
                onFiltersChange={handleFiltersChange}
              />

              {/* Map Content based on current view */}
              {currentView === 'reports' && (
                <ReportsMap 
                />
              )}

              {currentView === 'heatmap' && (
                <HeatmapView 
                  filters={mapFilters}
                />
              )}

              {currentView === 'resources' && (
                <ResourceAnalysisMap 
                  filters={mapFilters}
                />
              )}

              {currentView === 'disasters' && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg">
                  <div className="flex items-center gap-3 text-gray-600">
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                      <h3 className="font-semibold">Disasters View</h3>
                      <p className="text-sm">Official disasters component coming soon...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Debug info */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-[1001]">
                Current View: {currentView} | Connected: {isConnected ? 'Yes' : 'No'}
              </div>
            </InteractiveMap>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  {isLoading ? (
                    <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500" />
                  ) : (
                    <WifiOff className="w-12 h-12 mx-auto text-red-500" />
                  )}
                </div>
                <p className="text-lg font-medium">
                  {isLoading ? 'Connecting to Map APIs...' : 'Map API Connection Required'}
                </p>
                <p className="text-sm mt-2">
                  {isLoading ? 'Please wait while we establish connection' : 'Click "Test APIs" to connect'}
                </p>
                {error && (
                  <p className="text-xs text-red-600 mt-2 max-w-md mx-auto">
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapsPage;
