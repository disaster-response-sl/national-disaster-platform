import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getInventorySummary } from '../../services/resourceService';
import { InventorySummaryResponse } from '../../types/resource';
import { canCreateResources } from '../../utils/permissions';
import { Package2, TrendingUp, TrendingDown, Minus, AlertCircle, Plus, Download, RefreshCw } from 'lucide-react';
import GenerateReportModal from './GenerateReportModal';
import ResourceModal from './ResourceModal';
import toast from 'react-hot-toast';

const ResourceInventory: React.FC = () => {
  const { user, token } = useAuth();
  const [inventory, setInventory] = useState<InventorySummaryResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  const fetchInventory = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await getInventorySummary(token);
      setInventory(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleRefresh = () => {
    fetchInventory();
  };

  const exportInventory = async () => {
    try {
      // Create CSV content from inventory data
      const csvContent = generateInventoryCSV();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Inventory exported successfully');
    } catch (err) {
      console.error('Failed to export inventory:', err);
      toast.error('Failed to export inventory');
    }
  };

  const generateInventoryCSV = () => {
    let csv = 'Type,Total Quantity,Available Quantity,Allocated Quantity,Reserved Quantity\n';
    
    if (inventory?.overall) {
      csv += `Overall Summary,${inventory.overall.total_quantity},${inventory.overall.available_quantity},${inventory.overall.allocated_quantity},${inventory.overall.reserved_quantity}\n`;
    }

    if (inventory?.by_type && Array.isArray(inventory.by_type)) {
      inventory.by_type.forEach(type => {
        csv += `${type.type},${type.total_quantity},${type.available_quantity},${type.allocated_quantity},${type.reserved_quantity}\n`;
        
        // Add categories for this type (only if categories exist and is an array)
        if (type.categories && Array.isArray(type.categories) && type.categories.length > 0) {
          type.categories.forEach(cat => {
            csv += `  ${cat.category},${cat.quantity},${cat.available},,\n`;
          });
        }
      });
    }

    return csv;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Failed to Load Data</h3>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overall = inventory?.overall;

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationIcon = (rate: number) => {
    if (rate >= 80) return TrendingUp;
    if (rate >= 60) return Minus;
    return TrendingDown;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage resource inventory levels</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canCreateResources(user) && (
          <button
            onClick={() => setShowResourceModal(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </button>
        )}
        <button
          onClick={exportInventory}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
        <button
          onClick={() => setShowGenerateReportModal(true)}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>
      {/* Overall Summary */}
      {overall && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Overview</h3>
            <span className="text-sm text-gray-500">Real-time data</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-3">
                <Package2 className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{overall.total_resources}</p>
              <p className="text-sm text-gray-600">Total Resources</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-3">
                <Package2 className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{overall.total_quantity}</p>
              <p className="text-sm text-gray-600">Total Quantity</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mb-3">
                <Package2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-semibold text-green-600">{overall.available_quantity}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-3">
                <Package2 className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-semibold text-blue-600">{overall.allocated_quantity}</p>
              <p className="text-sm text-gray-600">Allocated</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-lg mb-3">
                {React.createElement(getUtilizationIcon(overall.utilization_rate), {
                  className: `w-6 h-6 ${getUtilizationColor(overall.utilization_rate)}`
                })}
              </div>
              <p className={`text-2xl font-semibold ${getUtilizationColor(overall.utilization_rate)}`}>
                {Math.round(overall.utilization_rate)}%
              </p>
              <p className="text-sm text-gray-600">Utilization</p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory by Type */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Inventory by Type</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {inventory?.by_type.map((typeData, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    <Package2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">{typeData.type}</h4>
                    <p className="text-sm text-gray-600">
                      {typeData.available_quantity} of {typeData.total_quantity} available
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    (typeData.available_quantity / typeData.total_quantity) * 100 >= 80 ? 'text-red-600' :
                    (typeData.available_quantity / typeData.total_quantity) * 100 >= 60 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {Math.round((typeData.available_quantity / typeData.total_quantity) * 100)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (typeData.available_quantity / typeData.total_quantity) * 100 >= 80 ? 'bg-red-500' :
                    (typeData.available_quantity / typeData.total_quantity) * 100 >= 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{
                    width: `${(typeData.available_quantity / typeData.total_quantity) * 100}%`
                  }}
                ></div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Categories</p>
                {typeData.categories && typeData.categories.length > 0 ? (
                  <div className="space-y-2">
                    {typeData.categories.map((category, catIndex) => (
                      <div key={catIndex} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900 capitalize">{category.category}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {category.available}/{category.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic py-2">No categories available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      {inventory?.last_updated && (
        <div className="text-center text-sm text-gray-500 py-4">
          Last updated: {new Date(inventory.last_updated).toLocaleString()}
        </div>
      )}

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
      />

      {/* Add Resource Modal */}
      <ResourceModal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        onSuccess={handleRefresh}
        mode="create"
      />
    </div>
  );
};

export default ResourceInventory;
