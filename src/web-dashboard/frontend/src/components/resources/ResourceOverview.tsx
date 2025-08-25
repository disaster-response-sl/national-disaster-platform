import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardMetrics } from '../../services/resourceService';
import { DashboardMetricsResponse } from '../../types/resource';
import { canCreateResources, canAllocateResources } from '../../utils/permissions';
import { Package, Users, TrendingUp, Activity, AlertCircle, Plus, Truck, BarChart3 } from 'lucide-react';
import ResourceModal from './ResourceModal';
import QuickAllocationModal from './QuickAllocationModal';
import GenerateReportModal from './GenerateReportModal';
import toast from 'react-hot-toast';

const ResourceOverview: React.FC = () => {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetricsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showQuickAllocationModal, setShowQuickAllocationModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);

  const handleRefresh = () => {
    fetchMetrics();
  };

  const fetchMetrics = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardMetrics(token, { timeframe: '30d' });
      setMetrics(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading metrics...</span>
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

  const overview = metrics?.overview;
  const performance = metrics?.performance;
  const breakdown = metrics?.breakdown;

  return (
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {canCreateResources(user) && (
          <button 
            onClick={() => setShowResourceModal(true)}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-dashed border-blue-300 transition-colors"
          >
            <div className="text-center">
              <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-900">Add New Resource</span>
            </div>
          </button>
        )}
        {canAllocateResources(user) && (
          <button 
            onClick={() => setShowQuickAllocationModal(true)}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-dashed border-green-300 transition-colors"
          >
            <div className="text-center">
              <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-green-900">Quick Allocation</span>
            </div>
          </button>
        )}
        <button 
          onClick={() => setShowGenerateReportModal(true)}
          className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-dashed border-purple-300 transition-colors"
        >
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-900">Generate Report</span>
          </div>
        </button>
      </div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Resources</p>
              <p className="text-2xl font-semibold text-blue-900">
                {overview?.total_resources || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Available</p>
              <p className="text-2xl font-semibold text-green-900">
                {overview?.available_resources || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Allocated</p>
              <p className="text-2xl font-semibold text-yellow-900">
                {overview?.allocated_resources || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600">Utilization</p>
              <p className="text-2xl font-semibold text-purple-900">
                {overview?.utilization_rate ? `${Math.round(overview.utilization_rate)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative">
                <svg className="w-16 h-16 mx-auto" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray={`${performance.allocation_efficiency}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(performance.allocation_efficiency)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Allocation Efficiency</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(performance.response_time)}h
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Resource Turnover</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(performance.resource_turnover)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-green-600">
                {Math.round(performance.deployment_success_rate)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resource Breakdown */}
      {breakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Type */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Resources by Type</h4>
            <div className="space-y-2">
              {breakdown.by_type.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Resources by Status</h4>
            <div className="space-y-2">
              {breakdown.by_status.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{item.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      <ResourceModal
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        onSuccess={handleRefresh}
        mode="create"
      />

      {/* Quick Allocation Modal */}
      <QuickAllocationModal
        isOpen={showQuickAllocationModal}
        onClose={() => setShowQuickAllocationModal(false)}
        onSuccess={handleRefresh}
      />

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
      />
    </div>
  );
};

export default ResourceOverview;
