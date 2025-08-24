import React from 'react';
import { X, MapPin, Users, AlertTriangle, Package } from 'lucide-react';
import type { ResourceAnalysis } from '../../types/map';
import { formatCoordinates } from '../../utils/mapHelpers';

interface ResourceAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceData: ResourceAnalysis[];
  loading?: boolean;
}

const ResourceAnalysisModal = ({
  isOpen,
  onClose,
  resourceData,
  loading = false,
}) => {
  if (!isOpen) return null;

  const getTotalResources = () => {
    const totals: { [key: string]: number } = {};
    
    resourceData.forEach(area => {
      Object.entries(area.resources).forEach(([resource, amount]) => {
        totals[resource] = (totals[resource] || 0) + (amount as number);
      });
    });
    
    return totals;
  };

  const totalResources = getTotalResources();
  const totalReports = resourceData.reduce((sum, area) => sum + area.totalReports, 0);
  const totalAffected = resourceData.reduce((sum, area) => sum + area.totalAffected, 0);
  const totalCritical = resourceData.reduce((sum, area) => sum + area.criticalReports, 0);

  const getResourceIcon = (resource: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      food: '🍞',
      water: '💧',
      shelter: '🏠',
      medical: '🏥',
      rescue: '🚑',
      clothing: '👕',
      fuel: '⛽',
      equipment: '🔧',
    };
    return icons[resource] || '📦';
  };

  const getResourceColor = (amount: number, maxAmount: number) => {
    const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
    if (percentage < 25) return 'bg-green-100 text-green-800';
    if (percentage < 50) return 'bg-yellow-100 text-yellow-800';
    if (percentage < 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const maxResourceAmount = Math.max(...Object.values(totalResources));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Resource Analysis</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading resource analysis...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {totalReports}
                      </div>
                      <div className="text-sm text-blue-700">Total Reports</div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-red-600">
                        {totalAffected.toLocaleString()}
                      </div>
                      <div className="text-sm text-red-700">People Affected</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {totalCritical}
                      </div>
                      <div className="text-sm text-orange-700">Critical Reports</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <MapPin className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold text-green-600">
                        {resourceData.length}
                      </div>
                      <div className="text-sm text-green-700">Affected Areas</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Resource Requirements */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Total Resource Requirements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(totalResources)
                    .filter(([_, amount]) => amount > 0)
                    .map(([resource, amount]) => (
                      <div
                        key={resource}
                        className={`p-3 rounded-lg ${getResourceColor(amount, maxResourceAmount)}`}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{getResourceIcon(resource)}</span>
                          <div>
                            <div className="font-semibold text-lg">{amount.toLocaleString()}</div>
                            <div className="text-sm capitalize">{resource}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Detailed Area Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Breakdown by Area</h3>
                <div className="space-y-4">
                  {resourceData.map((area, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Area {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            {formatCoordinates(area.lat, area.lng)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {area.totalReports} reports • {area.totalAffected.toLocaleString()} affected
                          </div>
                          {area.criticalReports > 0 && (
                            <div className="text-sm text-red-600 font-medium">
                              {area.criticalReports} critical
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Resources for this area */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(area.resources)
                          .filter(([_, amount]) => (amount as number) > 0)
                          .map(([resource, amount]) => (
                            <div
                              key={resource}
                              className="bg-gray-100 p-2 rounded text-center"
                            >
                              <div className="text-lg">{getResourceIcon(resource)}</div>
                              <div className="text-sm font-medium">{amount}</div>
                              <div className="text-xs text-gray-600 capitalize">{resource}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {resourceData.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Resource Data Available
                  </h3>
                  <p className="text-gray-600">
                    There are currently no resource analysis data to display.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceAnalysisModal;
