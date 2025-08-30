import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Users, AlertTriangle, Clock, CheckCircle, Database, Activity, MapPin, Package, Layers } from 'lucide-react';
import MainLayout from './MainLayout';
import toast from 'react-hot-toast';

interface DisasterStats {
  overview: {
    total_disasters: number;
    total_affected_population: number;
    total_area_km2: number;
    average_duration_hours: number;
    total_personnel_required: number;
    total_vehicles_required: number;
    total_food_supplies: number;
    total_temporary_shelters: number;
  };
  by_priority: Array<{ _id: string; count: number }>;
  by_status: Array<{ _id: string; count: number }>;
  recent_activity: Array<{
    disaster_code: string;
    title: string;
    priority_level: string;
    updatedAt: string;
  }>;
}

interface SosStats {
  summary: {
    totalSignals: number;
    resolutionRate: string;
    averageResponseTime: number;
    escalatedCount: number;
  };
  priorityDistribution: { [key: string]: number };
  statusDistribution: { [key: string]: number };
}

interface NdxStats {
  consents: Array<{
    consentId: string;
    status: string;
    dataProvider: string;
    dataType: string;
  }>;
}

interface AnalyticsData {
  disasterStats: DisasterStats | null;
  sosStats: SosStats | null;
  ndxStats: NdxStats | null;
  loading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    disasterStats: null,
    sosStats: null,
    ndxStats: null,
    loading: true
  });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, loading: true }));

      // Fetch disaster analytics
      const disasterResponse = await fetch(`/api/admin/analytics/statistics?startDate=${getStartDate()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const disasterData = await disasterResponse.json();

      // Fetch SOS analytics
      const sosResponse = await fetch(`/api/admin/sos/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const sosData = await sosResponse.json();

      // Fetch NDX analytics (consents)
      const ndxResponse = await fetch('/api/ndx/consents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const ndxData = await ndxResponse.json();

      setAnalyticsData({
        disasterStats: disasterData.success ? disasterData.data : null,
        sosStats: sosData.success ? sosData.data : null,
        ndxStats: ndxData.success ? ndxData : null,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      setAnalyticsData(prev => ({ ...prev, loading: false }));
    }
  };

  const getStartDate = () => {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '90d':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return startDate.toISOString().split('T')[0];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: StatCardProps) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );

  const PriorityBadge = ({ priority, count }: { priority: string; count: number }) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {priority}: {count}
      </span>
    );
  };

  if (analyticsData.loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-2">Comprehensive insights into disaster response operations</p>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Disaster Analytics */}
          {analyticsData.disasterStats && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Disaster Response Analytics</h2>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Disasters"
                  value={formatNumber(analyticsData.disasterStats.overview?.total_disasters || 0)}
                  icon={AlertTriangle}
                  color="border-l-4 border-l-blue-500"
                />
                <StatCard
                  title="Affected Population"
                  value={formatNumber(analyticsData.disasterStats.overview?.total_affected_population || 0)}
                  icon={Users}
                  color="border-l-4 border-l-green-500"
                />
                <StatCard
                  title="Area Affected (km²)"
                  value={formatNumber(analyticsData.disasterStats.overview?.total_area_km2 || 0)}
                  icon={MapPin}
                  color="border-l-4 border-l-purple-500"
                />
                <StatCard
                  title="Avg Response Time"
                  value={formatDuration(analyticsData.disasterStats.overview?.average_duration_hours * 60 || 0)}
                  icon={Clock}
                  color="border-l-4 border-l-orange-500"
                />
              </div>

              {/* Priority Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
                <div className="flex flex-wrap gap-2">
                  {analyticsData.disasterStats.by_priority?.map((item) => (
                    <PriorityBadge key={item._id} priority={item._id} count={item.count} />
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analyticsData.disasterStats.by_status?.map((item) => (
                    <div key={item._id} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                      <div className="text-sm text-gray-600 capitalize">{item._id.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Requirements */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Requirements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.disasterStats.overview?.total_personnel_required || 0)}</div>
                    <div className="text-sm text-gray-600">Personnel</div>
                  </div>
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.disasterStats.overview?.total_vehicles_required || 0)}</div>
                    <div className="text-sm text-gray-600">Vehicles</div>
                  </div>
                  <div className="text-center">
                    <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.disasterStats.overview?.total_food_supplies || 0)}</div>
                    <div className="text-sm text-gray-600">Food Supplies</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-gray-900">{formatNumber(analyticsData.disasterStats.overview?.total_temporary_shelters || 0)}</div>
                    <div className="text-sm text-gray-600">Shelters</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SOS Analytics */}
          {analyticsData.sosStats && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-semibold text-gray-800">SOS Response Analytics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Signals"
                  value={formatNumber(analyticsData.sosStats.summary?.totalSignals || 0)}
                  icon={AlertTriangle}
                  color="border-l-4 border-l-red-500"
                />
                <StatCard
                  title="Resolution Rate"
                  value={`${analyticsData.sosStats.summary?.resolutionRate || 0}%`}
                  icon={CheckCircle}
                  color="border-l-4 border-l-green-500"
                />
                <StatCard
                  title="Avg Response Time"
                  value={formatDuration(analyticsData.sosStats.summary?.averageResponseTime || 0)}
                  icon={Clock}
                  color="border-l-4 border-l-blue-500"
                />
                <StatCard
                  title="Escalated Cases"
                  value={formatNumber(analyticsData.sosStats.summary?.escalatedCount || 0)}
                  icon={TrendingUp}
                  color="border-l-4 border-l-orange-500"
                />
              </div>

              {/* SOS Priority Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SOS Priority Distribution</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analyticsData.sosStats.priorityDistribution || {}).map(([priority, count]) => (
                    <PriorityBadge key={priority} priority={priority} count={count as number} />
                  ))}
                </div>
              </div>

              {/* SOS Status Distribution */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SOS Status Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analyticsData.sosStats.statusDistribution || {}).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count as number}</div>
                      <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NDX Analytics */}
          {analyticsData.ndxStats && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">NDX Data Exchange Analytics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Consents"
                  value={formatNumber(analyticsData.ndxStats.consents?.length || 0)}
                  icon={Database}
                  color="border-l-4 border-l-indigo-500"
                />
                <StatCard
                  title="Approved Consents"
                  value={formatNumber(analyticsData.ndxStats.consents?.filter((c) => c.status === 'APPROVED').length || 0)}
                  icon={CheckCircle}
                  color="border-l-4 border-l-green-500"
                />
                <StatCard
                  title="Pending Consents"
                  value={formatNumber(analyticsData.ndxStats.consents?.filter((c) => c.status === 'PENDING_APPROVAL').length || 0)}
                  icon={Clock}
                  color="border-l-4 border-l-yellow-500"
                />
              </div>

              {/* Consent Status Breakdown */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Consent Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['APPROVED', 'PENDING_APPROVAL', 'REJECTED', 'EXPIRED'].map((status) => {
                    const count = analyticsData.ndxStats.consents?.filter((c) => c.status === status).length || 0;
                    return (
                      <div key={status} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Summary */}
          {analyticsData.disasterStats?.recent_activity && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Disaster Activity</h3>
              <div className="space-y-3">
                {analyticsData.disasterStats.recent_activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-600">Code: {activity.disaster_code}</div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        activity.priority_level === 'critical' ? 'bg-red-100 text-red-800' :
                        activity.priority_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.priority_level}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
