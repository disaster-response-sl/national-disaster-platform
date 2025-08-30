import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  MapPin
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart,
  Legend
} from 'recharts';
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

interface AnalyticsData {
  disasterStats: DisasterStats | null;
  sosStats: SosStats | null;
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
  // Force recompile to fix hot reload issue
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    disasterStats: null,
    sosStats: null,
    loading: true
  });
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = useCallback(async () => {
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

      setAnalyticsData({
        disasterStats: disasterData.success ? disasterData.data : null,
        sosStats: sosData.success ? sosData.data : null,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      setAnalyticsData(prev => ({ ...prev, loading: false }));
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, fetchAnalyticsData]);

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

  // Chart color schemes
  const PRIORITY_COLORS = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  const STATUS_COLORS = {
    active: '#3b82f6',
    monitoring: '#8b5cf6',
    resolved: '#10b981',
    pending: '#f59e0b',
    acknowledged: '#06b6d4',
    responding: '#8b5cf6',
    APPROVED: '#10b981',
    PENDING_APPROVAL: '#f59e0b',
    REJECTED: '#ef4444',
    EXPIRED: '#6b7280'
  };

  // Transform data for charts
  const getPriorityChartData = () => {
    if (!analyticsData.disasterStats?.by_priority) return [];
    return analyticsData.disasterStats.by_priority.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      color: PRIORITY_COLORS[item._id as keyof typeof PRIORITY_COLORS] || '#6b7280'
    }));
  };

  const getStatusChartData = () => {
    if (!analyticsData.disasterStats?.by_status) return [];
    return analyticsData.disasterStats.by_status.map(item => ({
      name: item._id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: item.count,
      color: STATUS_COLORS[item._id as keyof typeof STATUS_COLORS] || '#6b7280'
    }));
  };

  const getSosPriorityChartData = () => {
    if (!analyticsData.sosStats?.priorityDistribution) return [];
    return Object.entries(analyticsData.sosStats.priorityDistribution).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
      color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || '#6b7280'
    }));
  };

  const getSosStatusChartData = () => {
    if (!analyticsData.sosStats?.statusDistribution) return [];
    return Object.entries(analyticsData.sosStats.statusDistribution).map(([status, count]) => ({
      name: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: count,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280'
    }));
  };

  const getResourceChartData = () => {
    if (!analyticsData.disasterStats?.overview) return [];
    return [
      { name: 'Personnel', value: analyticsData.disasterStats.overview.total_personnel_required || 0 },
      { name: 'Vehicles', value: analyticsData.disasterStats.overview.total_vehicles_required || 0 },
      { name: 'Food Supplies', value: analyticsData.disasterStats.overview.total_food_supplies || 0 },
      { name: 'Shelters', value: analyticsData.disasterStats.overview.total_temporary_shelters || 0 }
    ];
  };

  // Generate mock trend data for line chart (in real app, this would come from API)
  const getDisasterTrendData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      day,
      disasters: Math.floor(Math.random() * 10) + 1,
      affected: Math.floor(Math.random() * 1000) + 100,
      resolved: Math.floor(Math.random() * 8) + 1
    }));
  };

  // Generate area chart data for resource allocation trends
  const getResourceTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      personnel: Math.floor(Math.random() * 500) + 100,
      vehicles: Math.floor(Math.random() * 100) + 20,
      supplies: Math.floor(Math.random() * 2000) + 500
    }));
  };

  // Generate composed chart data
  const getComposedPriorityData = () => {
    if (!analyticsData.disasterStats?.by_priority) return [];
    return analyticsData.disasterStats.by_priority.map(item => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
      trend: item.count + Math.floor(Math.random() * 5) - 2, // Mock trend line
      color: PRIORITY_COLORS[item._id as keyof typeof PRIORITY_COLORS] || '#6b7280'
    }));
  };

  // Generate scatter plot data for correlation analysis
  const getCorrelationData = () => {
    if (!analyticsData.disasterStats?.by_priority) return [];
    return analyticsData.disasterStats.by_priority.map((item) => ({
      x: item.count,
      y: Math.floor(Math.random() * 10000) + 1000, // Mock affected population
      priority: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      color: PRIORITY_COLORS[item._id as keyof typeof PRIORITY_COLORS] || '#6b7280'
    }));
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

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Priority Distribution */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Priority Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={getPriorityChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <RechartsBar dataKey="value" fill="#3b82f6" maxBarSize={45} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Status Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getStatusChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getStatusChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Resource Requirements - Full Width */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Resource Requirements</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={getResourceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <RechartsBar dataKey="value" fill="#10b981" maxBarSize={45} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Additional Chart Types Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Disaster Trends - Line Chart */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Disaster Trends (Weekly)</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getDisasterTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="disasters" stroke="#3b82f6" strokeWidth={2} name="New Disasters" />
                          <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Resource Allocation Trends - Area Chart */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Resource Allocation Trends</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getResourceTrendData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" fontSize={12} />
                          <YAxis fontSize={12} />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="personnel" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Personnel" />
                          <Area type="monotone" dataKey="vehicles" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Vehicles" />
                          <Area type="monotone" dataKey="supplies" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Supplies" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Composed Chart - Priority Distribution with Trend */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Priority Distribution with Trend</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={getComposedPriorityData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <RechartsBar dataKey="value" fill="#3b82f6" maxBarSize={45} />
                        <Line type="monotone" dataKey="trend" stroke="#ef4444" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Scatter Plot - Correlation Analysis */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Priority vs Impact Correlation</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={getCorrelationData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="x" name="Disaster Count" fontSize={12} />
                        <YAxis type="number" dataKey="y" name="Affected Population" fontSize={12} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Priority Correlation" dataKey="y" fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
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

              {/* SOS Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SOS Priority Distribution */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">SOS Priority Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={getSosPriorityChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <RechartsBar dataKey="value" fill="#f97316" maxBarSize={45} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* SOS Status Distribution - Donut Chart */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">SOS Status Distribution</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getSosStatusChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getSosStatusChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity Summary */}
          {analyticsData.disasterStats?.recent_activity && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Disaster Activity</h3>
              <div className="space-y-2">
                {analyticsData.disasterStats.recent_activity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                      <div className="text-xs text-gray-600">Code: {activity.disaster_code}</div>
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
