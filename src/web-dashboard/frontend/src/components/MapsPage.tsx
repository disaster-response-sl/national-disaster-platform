import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { useMapApiConnection } from '../hooks/useMapApiConnection';
import MapService from '../services/mapService';

interface MapsPageProps {
  onBack: () => void;
}

const MapsPage: React.FC<MapsPageProps> = ({ onBack }) => {
  const { isConnected, isLoading, error, statistics, testConnection } = useMapApiConnection();
  const [apiTestResults, setApiTestResults] = useState<Record<string, any>>({});

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
    }
  };

  useEffect(() => {
    if (isConnected) {
      testAllEndpoints();
    }
  }, [isConnected]);

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Disaster Risk Maps</h1>
                <p className="text-sm text-gray-600">Real-time monitoring and response system</p>
              </div>
            </div>
            
            {/* API Connection Status */}
            <div className="flex items-center space-x-4">
              {isLoading && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Connecting...</span>
                </div>
              )}
              {!isLoading && isConnected && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">API Connected</span>
                </div>
              )}
              {!isLoading && !isConnected && (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm">Connection Failed</span>
                </div>
              )}
              <button
                onClick={testConnection}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Test API
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-80px)] p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          
          {/* API Statistics Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Map API Statistics</h2>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <p className="text-red-700 text-sm">Error: {error}</p>
              </div>
            )}
            
            {statistics?.success && statistics.data && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">
                      {statistics.data.totalReports}
                    </div>
                    <div className="text-sm text-blue-600">Total Reports</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-800">
                      {statistics.data.totalAffected}
                    </div>
                    <div className="text-sm text-orange-600">People Affected</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">
                      {statistics.data.criticalCount}
                    </div>
                    <div className="text-sm text-red-600">Critical Reports</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">
                      {statistics.data.avgResponseTime.toFixed(1)}h
                    </div>
                    <div className="text-sm text-green-600">Avg Response Time</div>
                  </div>
                </div>
                
                {/* By Type Breakdown */}
                {statistics.data.byType.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Reports by Type</h3>
                    <div className="space-y-2">
                      {statistics.data.byType.map((type) => (
                        <div key={type._id} className="flex justify-between text-sm">
                          <span className="capitalize">{type._id}</span>
                          <span className="font-medium">{type.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* API Test Results Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">API Endpoint Tests</h2>
            
            <div className="space-y-3">
              {Object.entries(apiTestResults).map(([endpoint, result]) => (
                <div key={endpoint} className="border border-gray-200 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{endpoint}</span>
                    {result && typeof result === 'object' && 'success' in result ? (
                      result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </div>
                  
                  {result && typeof result === 'object' && (
                    <div className="text-xs text-gray-600">
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

            <button
              onClick={testAllEndpoints}
              disabled={!isConnected}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Test All Endpoints
            </button>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Interactive Map</h2>
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Map Integration Coming Soon</p>
              <p className="text-sm">Phase 2: Enhanced Map Components</p>
              {isConnected && (
                <p className="text-xs text-green-600 mt-2">✓ API Ready for Integration</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapsPage;
