import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDeploymentTracking } from '../../services/resourceService';
import { DeploymentTracking, DeploymentTrackingQueryParams } from '../../types/resource';
import { canManageDeployments, canCompleteDeployments, canRecallDeployments } from '../../utils/permissions';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const AllocationTracking: React.FC = () => {
  const { user, token } = useAuth();
  const [deployments, setDeployments] = useState<DeploymentTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DeploymentTrackingQueryParams>({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchDeployments();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchDeployments = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await getDeploymentTracking(token, filters);
      setDeployments(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deployments';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, [filters, token]);

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'recalled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return Package;
    switch (status) {
      case 'pending': return Clock;
      case 'in_transit': return Truck;
      case 'deployed': return MapPin;
      case 'completed': return CheckCircle;
      case 'recalled': return AlertCircle;
      default: return Package;
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading deployments...</span>
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

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Active Deployments</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {deployments.length} deployments
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => fetchDeployments()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="deployed">Deployed</option>
          <option value="completed">Completed</option>
          <option value="recalled">Recalled</option>
        </select>

        <input
          type="text"
          placeholder="Disaster ID"
          value={filters.disaster_id || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, disaster_id: e.target.value || undefined }))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />

        <input
          type="date"
          value={filters.start_date || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value || undefined }))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />

        <input
          type="date"
          value={filters.end_date || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value || undefined }))}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Deployment List */}
      <div className="space-y-4">
        {deployments.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No deployments found matching your criteria.</p>
          </div>
        ) : (
          deployments.map((deployment, index) => {
            const StatusIcon = getStatusIcon(deployment.status);
            return (
              <div key={deployment.deployment_id || `deployment-${index}`} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <StatusIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {deployment.resource_name || 'Unknown Resource'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deployment.status)}`}>
                        {deployment.status ? deployment.status.replace('_', ' ') : 'Unknown'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Resource Type</p>
                        <p className="font-medium capitalize">{deployment.resource_type || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-medium">{deployment.allocated_quantity || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Disaster</p>
                        <p className="font-medium">{deployment.disaster_title || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deployed At</p>
                        <p className="font-medium">{deployment.deployed_at ? new Date(deployment.deployed_at).toLocaleDateString() : 'Not deployed'}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>
                          {deployment.deployment_location?.address || 
                           (deployment.deployment_location?.lat && deployment.deployment_location?.lng 
                             ? `${deployment.deployment_location.lat}, ${deployment.deployment_location.lng}` 
                             : 'Location not specified')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          Duration: {formatDuration(deployment.estimated_duration || 0)}
                          {deployment.actual_duration && ` (Actual: ${formatDuration(deployment.actual_duration)})`}
                        </span>
                      </div>
                    </div>

                    {deployment.notes && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium">Notes:</p>
                        <p>{deployment.notes}</p>
                      </div>
                    )}
                  </div>

                  {canManageDeployments(user) && deployment.status !== 'completed' && (
                    <div className="ml-6 flex flex-col space-y-2">
                      {deployment.status === 'deployed' && canCompleteDeployments(user) && (
                        <button className="text-sm text-green-600 hover:text-green-800 px-3 py-1 border border-green-300 rounded">
                          Complete
                        </button>
                      )}
                      <button className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded">
                        Update
                      </button>
                      {deployment.status !== 'recalled' && canRecallDeployments(user) && (
                        <button className="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded">
                          Recall
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress Timeline */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className={deployment.status === 'pending' ? 'text-blue-600 font-medium' : ''}>
                      Pending
                    </span>
                    <span className={deployment.status === 'in_transit' ? 'text-blue-600 font-medium' : ''}>
                      In Transit
                    </span>
                    <span className={deployment.status === 'deployed' ? 'text-blue-600 font-medium' : ''}>
                      Deployed
                    </span>
                    <span className={deployment.status === 'completed' ? 'text-green-600 font-medium' : ''}>
                      Completed
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ 
                        width: deployment.status === 'pending' ? '25%' :
                               deployment.status === 'in_transit' ? '50%' :
                               deployment.status === 'deployed' ? '75%' :
                               deployment.status === 'completed' ? '100%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AllocationTracking;
