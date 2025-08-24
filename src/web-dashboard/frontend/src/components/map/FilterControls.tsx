import React, { useState } from 'react';
import { Calendar, Filter, X, RotateCcw } from 'lucide-react';
import type { FilterControlsProps } from '../../types/map';
import { getDateRangePresets } from '../../utils/dateUtils';

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  loading = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const datePresets = getDateRangePresets();

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleDatePreset = (preset: keyof typeof datePresets) => {
    const range = datePresets[preset];
    onFiltersChange({
      ...filters,
      dateRange: {
        start: range.start,
        end: range.end,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      type: '',
      priority: null,
      dateRange: { start: null, end: null },
    });
  };

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.type ||
    filters.priority !== null ||
    filters.dateRange.start ||
    filters.dateRange.end
  );

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateInputChange = (field: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : null;
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: date,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAdvanced ? 'Basic' : 'Advanced'}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Types</option>
            <option value="flood">🌊 Flood</option>
            <option value="earthquake">🌍 Earthquake</option>
            <option value="fire">🔥 Fire</option>
            <option value="cyclone">🌪️ Cyclone</option>
            <option value="landslide">⛰️ Landslide</option>
            <option value="accident">🚗 Accident</option>
            <option value="medical">🏥 Medical</option>
            <option value="security">🚔 Security</option>
            <option value="other">⚠️ Other</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value ? parseInt(e.target.value) : null)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">All Priorities</option>
            <option value="1">🟢 Low (1)</option>
            <option value="2">🟡 Medium (2)</option>
            <option value="3">🟠 High (3)</option>
            <option value="4">🔴 Critical (4)</option>
            <option value="5">🆘 Emergency (5)</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          {/* Date Range Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Quick Date Ranges
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(datePresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleDatePreset(key as keyof typeof datePresets)}
                  disabled={loading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange.start)}
                onChange={(e) => handleDateInputChange('start', e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange.end)}
                onChange={(e) => handleDateInputChange('end', e.target.value)}
                disabled={loading}
                min={formatDateForInput(filters.dateRange.start)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Active Date Range Display */}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-800">
                  <strong>Active Date Range:</strong>{' '}
                  {filters.dateRange.start ? filters.dateRange.start.toLocaleDateString() : 'Any'} -{' '}
                  {filters.dateRange.end ? filters.dateRange.end.toLocaleDateString() : 'Any'}
                </div>
                <button
                  onClick={() => handleFilterChange('dateRange', { start: null, end: null })}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.type && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Type: {filters.type}
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.priority !== null && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                Priority: {filters.priority}
                <button
                  onClick={() => handleFilterChange('priority', null)}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
