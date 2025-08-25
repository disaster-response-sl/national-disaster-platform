import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getInventorySummary } from '../../services/resourceService';
import { InventorySummaryResponse } from '../../types/resource';
import { canCreateResources } from '../../utils/permissions';
import { Package2, TrendingUp, TrendingDown, Minus, AlertCircle, Plus } from 'lucide-react';
// import GenerateReportModal from './GenerateReportModal';
import ResourceModal from './ResourceModal';
import toast from 'react-hot-toast';

const ResourceInventory: React.FC = () => {
  const { user, token } = useAuth();
  const [inventory, setInventory] = useState<InventorySummaryResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
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
    };

    fetchInventory();
  }, [token]);

  const handleRefresh = () => {
    if (token) {
      const fetchInventory = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getInventorySummary(token);
          setInventory(response.data);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to refresh inventory';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchInventory();
    }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{error}</span>
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
    <div className="space-y-6">
      {/* Inventory Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-2">
          {canCreateResources(user) && (
            <button 
              onClick={() => setShowResourceModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </button>
          )}
          <button 
            onClick={exportInventory}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Package2 className="w-4 h-4 mr-2" />
            Export Inventory
          </button>
          <button 
            onClick={() => toast('Report generation temporarily disabled for maintenance')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Auto-refresh: Every 5 minutes
        </div>
      </div>
      {/* Overall Summary */}
      {overall && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900">{overall.total_resources}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{overall.total_quantity}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{overall.available_quantity}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Allocated</p>
              <p className="text-2xl font-bold text-blue-600">{overall.allocated_quantity}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Utilization Rate</p>
              <div className="flex items-center justify-center">
                {React.createElement(getUtilizationIcon(overall.utilization_rate), {
                  className: `w-5 h-5 mr-1 ${getUtilizationColor(overall.utilization_rate)}`
                })}
                <p className={`text-2xl font-bold ${getUtilizationColor(overall.utilization_rate)}`}>
                  {Math.round(overall.utilization_rate)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory by Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Inventory by Type</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {inventory?.by_type.map((typeData, index) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Package2 className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900 capitalize">{typeData.type}</h4>
                </div>
                <span className="text-sm text-gray-500">
                  {typeData.available_quantity}/{typeData.total_quantity} available
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(typeData.available_quantity / typeData.total_quantity) * 100}%` 
                  }}
                ></div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Categories:</p>
                {typeData.categories && typeData.categories.length > 0 ? (
                  typeData.categories.map((category, catIndex) => (
                    <div key={catIndex} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{category.category}</span>
                      <span className="text-gray-900">
                        {category.available}/{category.quantity}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">No categories available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      {inventory?.last_updated && (
        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(inventory.last_updated).toLocaleString()}
        </div>
      )}

      {/* Generate Report Modal - Temporarily Disabled */}
      {/* <GenerateReportModal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
      /> */}

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
