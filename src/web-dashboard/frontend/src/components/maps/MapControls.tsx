// Map Controls - Filter controls and view toggles for map interface
import React, { useState } from 'react';
import { Filter, Calendar, MapPin, Thermometer, Package, Building, RotateCcw } from 'lucide-react';
import { ReportsQueryParams, HeatmapQueryParams, DisastersQueryParams, MapViewType } from '../../types/mapTypes';

interface MapControlsProps {
  currentView: MapViewType;
  onViewChange: (view: MapViewType) => void;
  onFiltersChange: (filters: any) => void;
  className?: string;
}

const MapControls: React.FC<MapControlsProps> = ({ 
  currentView, 
  onViewChange, 
  onFiltersChange,
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    severity: '',
    startDate: '',
    endDate: '',
    limit: 100
  });

  // Map view options
  const viewOptions = [
    { id: 'reports', label: 'Reports', icon: MapPin, description: 'Individual disaster reports' },
    { id: 'heatmap', label: 'Heatmap', icon: Thermometer, description: 'Intensity visualization' },
    { id: 'resources', label: 'Resources', icon: Package, description: 'Resource analysis' },
    { id: 'disasters', label: 'Disasters', icon: Building, description: 'Official disasters' }
  ];

  // Filter options
  const filterOptions = {
    type: ['flood', 'landslide', 'cyclone', 'fire', 'earthquake', 'drought', 'tsunami'],
    status: ['pending', 'active', 'resolved', 'closed'],
    priority: ['1', '2', '3', '4'],
    severity: ['low', 'medium', 'high', 'critical']
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert to appropriate format based on current view
    let formattedFilters: any = {};
    
    if (currentView === 'reports') {
      formattedFilters = {
        type: newFilters.type || undefined,
        status: newFilters.status || undefined,
        priority: newFilters.priority || undefined,
        startDate: newFilters.startDate || undefined,
        endDate: newFilters.endDate || undefined,
        limit: newFilters.limit
      } as ReportsQueryParams;
    } else if (currentView === 'heatmap') {
      formattedFilters = {
        type: newFilters.type || undefined,
        status: newFilters.status || undefined,
        priority: newFilters.priority || undefined,
        startDate: newFilters.startDate || undefined,
        endDate: newFilters.endDate || undefined,
        gridSize: 0.1
      } as HeatmapQueryParams;
    } else if (currentView === 'disasters') {
      formattedFilters = {
        type: newFilters.type || undefined,
        status: newFilters.status || undefined,
        severity: newFilters.severity || undefined,
        startDate: newFilters.startDate || undefined,
        endDate: newFilters.endDate || undefined,
        limit: newFilters.limit
      } as DisastersQueryParams;
    }
    
    onFiltersChange(formattedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: '',
      status: '',
      priority: '',
      severity: '',
      startDate: '',
      endDate: '',
      limit: 100
    };
    setFilters(clearedFilters);
    onFiltersChange({});
  };

  return (
    <div className={`absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg ${className}`}>
      {/* View Toggle Buttons */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Map View</h3>
        <div className="grid grid-cols-2 gap-2">
          {viewOptions.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => onViewChange(id as MapViewType)}
              className={`p-3 rounded-lg text-left transition-colors ${
                currentView === id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
              }`}
              title={description}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {isExpanded ? 'Less' : 'More'}
          </button>
        </div>

        <div className="space-y-3">
          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {filterOptions.type.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {filterOptions.status.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional filters based on view */}
          {(currentView === 'reports' || currentView === 'heatmap') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                {filterOptions.priority.map(priority => (
                  <option key={priority} value={priority}>
                    Priority {priority}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentView === 'disasters' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Severities</option>
                {filterOptions.severity.map(severity => (
                  <option key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Expanded Filters */}
          {isExpanded && (
            <>
              {/* Date Range */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3 h-3 text-gray-600" />
                  <label className="text-xs font-medium text-gray-600">Date Range</label>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Limit */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Limit ({filters.limit})
                </label>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapControls;
