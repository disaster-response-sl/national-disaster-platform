import React from 'react';
import { AlertTriangle, Users, Shield, Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { DashboardMetrics } from '../services/dashboardService';

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, isLoading }) => {
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="text-center text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No data available</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Active Disasters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Disasters</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.activeDisasters}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {metrics.activeDisasters > 0 ? 'Immediate attention required' : 'All clear'}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              metrics.activeDisasters === 0 ? 'bg-green-500' : 
              metrics.activeDisasters <= 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              {metrics.activeDisasters === 0 ? 'Operational status normal' : 
               metrics.activeDisasters <= 5 ? 'Monitoring situation' : 'High alert status'}
            </span>
          </div>
        </div>
      </div>

      {/* Pending SOS Signals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pending SOS</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.pendingSosSignals}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <span className={metrics.pendingSosSignals > 0 ? 'text-orange-600 font-medium' : 'text-green-600'}>
                {metrics.pendingSosSignals > 0 ? 'Awaiting response' : 'No pending signals'}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              metrics.pendingSosSignals === 0 ? 'bg-green-500' : 
              metrics.pendingSosSignals <= 3 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              Response time: &lt; 5 min avg
            </span>
          </div>
        </div>
      </div>

      {/* Citizens Affected */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Citizens Affected</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.totalCitizensAffected.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Across all active incidents
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              metrics.totalCitizensAffected === 0 ? 'bg-green-500' : 
              metrics.totalCitizensAffected <= 1000 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500">
              Population monitoring active
            </span>
          </div>
        </div>
      </div>

      {/* Response Teams */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Response Teams</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.responseTeamsDeployed}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Currently deployed
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {getHealthIcon(metrics.systemHealth)}
                <div className="ml-2">
                  <p className="text-xs font-medium text-gray-900">System</p>
                  <p className="text-xs text-gray-500 capitalize">{metrics.systemHealth}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {getSyncIcon(metrics.dataSyncStatus)}
                <div className="ml-2">
                  <p className="text-xs font-medium text-gray-900">Sync</p>
                  <p className="text-xs text-gray-500 capitalize">{metrics.dataSyncStatus}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center">
                <div className="text-xs font-medium text-gray-900 mr-2">
                  Alerts: {Math.round(metrics.alertDistributionRate)}%
                </div>
              </div>
              <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${metrics.alertDistributionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;
