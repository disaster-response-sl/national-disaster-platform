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
import { useFilters } from '../../hooks/useFilters';
import type { Report, Disaster, MapBounds } from '../../types/map';
import { isDateInRange } from '../../utils/dateUtils';
import { 
  sampleReports, 
  sampleDisasters, 
  sampleHeatmapData, 
  sampleResourceAnalysis, 
  sampleStatistics 
} from '../../data/sampleData';

const MapPageDemo: React.FC = () => {
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useFilters();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [activeTab, setActiveTab] = useState<'filters' | 'statistics' | 'disasters'>('filters');

  // Using sample data for demo
  const reports = sampleReports;
  const disasters = sampleDisasters;
  const heatmapData = sampleHeatmapData;
  const resourceAnalysis = sampleResourceAnalysis;
  const statistics = sampleStatistics;
  const loading = { reports: false, disasters: false, statistics: false, resources: false };

  // Handle map bounds change for filtering
  const handleBoundsChange = (bounds: MapBounds) => {
    console.log('Map bounds changed:', bounds);
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
              <h1 className="text-2xl font-bold text-gray-900">Disaster Map - Demo Mode</h1>
              <p className="text-sm text-gray-600">
                Demo visualization with sample disaster data (Phase 4 Complete!)
              </p>
            </div>
            
            {/* Real-time status - showing demo mode */}
            <RealTimeStatus
              status="connected"
              lastUpdate={new Date()}
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

            {/* Demo refresh button */}
            <button
              onClick={() => toast.success('Demo data refreshed!')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Refresh Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
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
            {/* Demo Mode Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-xs text-yellow-700 mt-1">
                Showing sample data. All Phase 4 features are functional including real-time status, 
                export capabilities, and advanced filtering.
              </p>
            </div>

            {/* Filters Tab */}
            {activeTab === 'filters' && (
              <FilterControls
                filters={filters}
                onFiltersChange={(newFilters) => {
                  Object.entries(newFilters).forEach(([key, value]) => {
                    if (key === 'dateRange') {
                      return;
                    }
                    updateFilter(key as keyof typeof filters, value);
                  });
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

            {/* Selected Report Details */}
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
                  <div>
                    <span className="font-medium text-gray-600">Affected Areas:</span>{' '}
                    <span>{selectedDisaster.affectedAreas.join(', ')}</span>
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

export default MapPageDemo;
