import React, { useState } from 'react';
import { useMapApi } from '../hooks/useMapApi';

const MapPage = (): JSX.Element => {
  const { 
    reports, 
    heatmapData, 
    resourceAnalysis, 
    statistics, 
    disasters, 
    loading, 
    error, 
    refetch 
  } = useMapApi();

  const [activeTab, setActiveTab] = useState<'reports' | 'heatmap' | 'resources' | 'statistics' | 'disasters'>('reports');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => refetch.all()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Disaster Map API Integration</h1>
            <button 
              onClick={() => refetch.all()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Refresh All Data
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'reports', name: 'Reports', count: reports.length },
              { id: 'heatmap', name: 'Heatmap', count: heatmapData.length },
              { id: 'resources', name: 'Resources', count: resourceAnalysis.length },
              { id: 'statistics', name: 'Statistics', count: statistics ? 1 : 0 },
              { id: 'disasters', name: 'Disasters', count: disasters.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports (GET /api/map/reports)</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Report #{index + 1}</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="text-sm text-gray-900">
                          {report.location.lat}, {report.location.lng}
                          {report.location.country && ` (${report.location.country})`}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Resources Required</dt>
                        <dd className="text-sm text-gray-900">
                          Food: {report.resource_requirements.food}, Water: {report.resource_requirements.water}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Heatmap Data (GET /api/map/heatmap)</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {heatmapData.map((point, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Point #{index + 1}</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="text-sm text-gray-900">{point.lat}, {point.lng}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Intensity</dt>
                        <dd className="text-sm text-gray-900">{point.intensity}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reports</dt>
                        <dd className="text-sm text-gray-900">
                          Count: {point.count}, Affected: {point.totalAffected}, Avg Priority: {point.avgPriority}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Types</dt>
                        <dd className="text-sm text-gray-900">{point.types.join(', ')}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Statuses</dt>
                        <dd className="text-sm text-gray-900">{point.statuses.join(', ')}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Analysis Tab */}
        {activeTab === 'resources' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Analysis (GET /api/map/resource-analysis)</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resourceAnalysis.map((resource, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Area #{index + 1}</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="text-sm text-gray-900">{resource.lat}, {resource.lng}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Reports</dt>
                        <dd className="text-sm text-gray-900">
                          Total: {resource.totalReports}, Critical: {resource.criticalReports}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Total Affected</dt>
                        <dd className="text-sm text-gray-900">{resource.totalAffected}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Resources</dt>
                        <dd className="text-sm text-gray-900">
                          Food: {resource.resources.food}, Water: {resource.resources.water}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics (GET /api/map/statistics)</h2>
            {statistics ? (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Map Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-700 mb-2">By Type</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statistics.byType.map((type, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="text-sm font-medium text-gray-900">{type._id}</div>
                            <div className="text-lg font-bold text-blue-600">{type.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No statistics available</p>
            )}
          </div>
        )}

        {/* Disasters Tab */}
        {activeTab === 'disasters' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Disasters (GET /api/map/disasters)</h2>
            {disasters.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {disasters.map((disaster, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Disaster #{index + 1}</h3>
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(disaster, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6 text-center">
                  <p className="text-gray-500">No disasters found (as expected from guide)</p>
                  <p className="text-sm text-gray-400 mt-2">Guide shows: "data": [], "count": 0</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MapPage;
