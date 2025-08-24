import React, { useState } from 'react';
import { MapPin, Calendar, Users, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Disaster } from '../../types/map';
import { getTypeColor, getPriorityColor, formatPriority, formatStatus } from '../../utils/mapHelpers';
import { formatDateTimeForDisplay } from '../../utils/dateUtils';

interface DisasterListProps {
  disasters: Disaster[];
  loading?: boolean;
  onDisasterClick?: (disaster: Disaster) => void;
  className?: string;
}

const DisasterList: React.FC<DisasterListProps> = ({
  disasters,
  loading = false,
  onDisasterClick,
  className = '',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-gray-200 rounded p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (disasters.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Disasters</h3>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Disasters</h4>
          <p className="text-gray-600">
            There are currently no active disasters in the system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Active Disasters</h3>
        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
          {disasters.length} Active
        </span>
      </div>

      <div className="space-y-3">
        {disasters.map((disaster) => (
          <div
            key={disaster._id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{disaster.name}</h4>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded"
                    style={{
                      backgroundColor: getTypeColor(disaster.type),
                      color: 'white',
                    }}
                  >
                    {disaster.type.toUpperCase()}
                  </span>
                  <span
                    className="px-2 py-1 text-xs font-medium rounded"
                    style={{
                      backgroundColor: getPriorityColor(disaster.priority),
                      color: 'white',
                    }}
                  >
                    {formatPriority(disaster.priority)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {disaster.location.lat.toFixed(4)}, {disaster.location.lng.toFixed(4)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {disaster.estimatedAffected.toLocaleString()} affected
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDateTimeForDisplay(disaster.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    disaster.status === 'active' ? 'bg-red-100 text-red-800' :
                    disaster.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {formatStatus(disaster.status)}
                  </span>
                </div>

                {/* Affected Areas */}
                {disaster.affectedAreas && disaster.affectedAreas.length > 0 && (
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Affected Areas: </span>
                    <span className="text-sm text-gray-900">
                      {disaster.affectedAreas.slice(0, 3).join(', ')}
                      {disaster.affectedAreas.length > 3 && ` +${disaster.affectedAreas.length - 3} more`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {onDisasterClick && (
                  <button
                    onClick={() => onDisasterClick(disaster)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View
                  </button>
                )}
                <button
                  onClick={() => toggleExpanded(disaster._id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {expandedId === disaster._id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === disaster._id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {disaster.description && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-sm text-gray-700">{disaster.description}</p>
                  </div>
                )}

                {disaster.affectedAreas && disaster.affectedAreas.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">All Affected Areas</h5>
                    <div className="flex flex-wrap gap-1">
                      {disaster.affectedAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <div className="font-medium">{formatDateTimeForDisplay(disaster.createdAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <div className="font-medium">{formatDateTimeForDisplay(disaster.updatedAt)}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Disaster ID: {disaster._id}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisasterList;
