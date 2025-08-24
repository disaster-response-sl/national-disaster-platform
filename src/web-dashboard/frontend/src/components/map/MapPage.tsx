import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Download } from 'lucide-react';
import MapContainer from './MapContainer';
import ReportsLayer from './ReportsLayer';
import HeatmapLayer from './HeatmapLayer';
import StatisticsPanel from './StatisticsPanel';
import ResourceAnalysisModal from './ResourceAnalysisModal';
import DisasterList from './DisasterList';
import FilterControls from './FilterControls';
import ExportModal from './ExportModal';
import RealTimeStatus from './RealTimeStatus';
import { useMapData } from '../../hooks/useMapData';
import { useFilters } from '../../hooks/useFilters';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import type { Report, Disaster, MapBounds } from '../../types/map';
import { isDateInRange } from '../../utils/dateUtils';

const MapPage: React.FC = () => {
  const { reports, heatmapData, resourceAnalysis, statistics, disasters, loading, error, refetch } = useMapData();
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useFilters();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTab, setActiveTab] = useState<'filters' | 'statistics' | 'disasters'>('filters');

  // Real-time data updates
  const { connectionStatus, lastUpdate } = useRealTimeData({
    onReportUpdate: (report) => {
      // Refresh reports when new data comes in
      refetch.reports();
      toast.success(`New ${report.type} report received`, { icon: '📢' });
    },
    onDisasterUpdate: (disaster) => {
      refetch.disasters();
      toast.success(`Disaster "${disaster.name}" updated`, { icon: '⚠️' });
    },
    onResourceUpdate: () => {
      refetch.resources();
      toast.success('Resource analysis updated', { icon: '📊' });
    },
    onStatisticsUpdate: () => {
      refetch.statistics();
      toast.success('Statistics updated', { icon: '📈' });
    },
    enabled: true,
  });

  // Handle map bounds change for filtering
  const handleBoundsChange = (bounds: MapBounds) => {
    // Store bounds for potential future use
    console.log('Map bounds changed:', bounds);
    // Optionally refetch data based on new bounds
    // refetch.reports({ bounds: mapService.formatBounds(bounds) });
  };

  // Handle report selection
  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    toast.success(`Selected ${report.type} report`);
  };

  // Handle disaster selection
  const handleDisasterClick = (disaster: Disaster) => {
    setSelectedDisaster(disaster);
    setActiveTab('disasters');
    toast.success(`Selected ${disaster.name} disaster`);
  };

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.type && report.type !== filters.type) return false;
    if (filters.priority !== null && report.priority !== filters.priority) return false;
    
    // Date filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      const reportDate = new Date(report.createdAt);
      if (!isDateInRange(reportDate, filters.dateRange.start, filters.dateRange.end)) {
        return false;
      }
    }
    
    return true;
  });

  // Filter disasters based on current filters  
  const filteredDisasters = disasters.filter(disaster => {
    if (filters.status && disaster.status !== filters.status) return false;
    if (filters.type && disaster.type !== filters.type) return false;
    if (filters.priority !== null && disaster.priority !== filters.priority) return false;
    
    // Date filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      const disasterDate = new Date(disaster.createdAt);
      if (!isDateInRange(disasterDate, filters.dateRange.start, filters.dateRange.end)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Disaster Map</h1>
              <p className="text-sm text-gray-600">
                Real-time visualization of disaster reports and resources
              </p>
            </div>
            
            {/* Real-time status */}
            <RealTimeStatus
              status={connectionStatus}
              lastUpdate={lastUpdate || undefined}
              className="ml-4"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Quick stats */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-blue-800 font-medium">
                  {filteredReports.length} Reports
                </span>
              </div>
              
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-purple-800 font-medium">
                  {filteredDisasters.length} Disasters
                </span>
              </div>
              
              {statistics && (
                <div className="bg-red-100 px-3 py-1 rounded-full">
                  <span className="text-red-800 font-medium">
                    {statistics.totalAffected?.toLocaleString() || 0} Affected
                  </span>
                </div>
              )}
            </div>

            {/* Layer Controls */}
            <div className="flex items-center space-x-2 border-l pl-4">
              <span className="text-sm text-gray-600">Layers:</span>
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Heatmap</span>
              </label>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2 border-l pl-4">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={() => setShowResourceModal(true)}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
              >
                Resources
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={() => refetch.all()}
              disabled={loading.reports || loading.statistics}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {loading.reports || loading.statistics ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {error && (
            <div className="absolute top-4 left-4 right-4 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )}

          <MapContainer
            className="w-full h-full"
            onBoundsChange={handleBoundsChange}
          >
            <ReportsLayer
              reports={filteredReports}
              onReportClick={handleReportClick}
              visible={true}
            />
            <HeatmapLayer
              heatmapData={heatmapData}
              visible={showHeatmap}
              opacity={0.6}
            />
          </MapContainer>

          {/* Loading overlay */}
          {(loading.reports || loading.statistics) && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-700">Loading map data...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          {/* Sidebar Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex space-x-8 px-4" aria-label="Tabs">
              {[
                { id: 'filters', name: 'Filters', icon: '🔍' },
                { id: 'statistics', name: 'Statistics', icon: '📊' },
                { id: 'disasters', name: 'Disasters', icon: '⚠️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 space-y-6">
            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <FilterControls
                filters={filters}
                onFiltersChange={(newFilters) => {
                  Object.entries(newFilters).forEach(([key, value]) => {
                    if (key === 'dateRange') {
                      // Handle date range specially
                      return;
                    }
                    updateFilter(key as keyof typeof filters, value);
                  });
                  // Handle date range
                  if (newFilters.dateRange) {
                    updateFilter('dateRange', newFilters.dateRange);
                  }
                }}
                loading={loading.reports}
              />
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <StatisticsPanel
                statistics={statistics}
                loading={loading.statistics}
              />
            )}

            {/* Disasters Tab */}
            {activeTab === 'disasters' && (
              <DisasterList
                disasters={filteredDisasters}
                loading={loading.disasters}
                onDisasterClick={handleDisasterClick}
              />
            )}

            {/* Selected Report Details (Always visible when selected) */}
            {selectedReport && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Report
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>{' '}
                    <span className="capitalize">{selectedReport.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>{' '}
                    <span className="capitalize">{selectedReport.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>{' '}
                    <span>{selectedReport.priority}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Affected:</span>{' '}
                    <span>{selectedReport.affected_people.toLocaleString()}</span>
                  </div>
                  {selectedReport.description && (
                    <div>
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-700">{selectedReport.description}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="mt-4 w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {/* Selected Disaster Details */}
            {selectedDisaster && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Disaster
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>{' '}
                    <span>{selectedDisaster.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>{' '}
                    <span className="capitalize">{selectedDisaster.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>{' '}
                    <span className="capitalize">{selectedDisaster.status}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>{' '}
                    <span>{selectedDisaster.priority}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Estimated Affected:</span>{' '}
                    <span>{selectedDisaster.estimatedAffected.toLocaleString()}</span>
                  </div>
                  {selectedDisaster.description && (
                    <div>
                      <span className="font-medium text-gray-600">Description:</span>
                      <p className="mt-1 text-gray-700">{selectedDisaster.description}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDisaster(null)}
                  className="mt-4 w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resource Analysis Modal */}
        <ResourceAnalysisModal
          isOpen={showResourceModal}
          onClose={() => setShowResourceModal(false)}
          resourceData={resourceAnalysis}
          loading={loading.resources}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={{
            reports: filteredReports,
            disasters: filteredDisasters,
            resourceAnalysis,
            statistics,
            filters: hasActiveFilters ? filters : undefined,
          }}
        />
      </div>
    </div>
  );
};

export default MapPage;
