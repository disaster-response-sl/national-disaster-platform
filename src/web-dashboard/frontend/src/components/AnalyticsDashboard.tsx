import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Clock, 
  MapPin,
  Download,
  Filter,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    total_reports: number;
    pending_reports: number;
    addressed_reports: number;
    average_affected: number;
  };
  type_distribution: Array<{ _id: string; count: number }>;
  priority_distribution: Array<{ _id: string; count: number }>;
  timeframe_days: number;
}

interface HeatmapData {
  clusters: Array<{
    lat: number;
    lng: number;
    intensity: number;
    types: { [key: string]: number };
    total_affected: number;
  }>;
  total_reports: number;
  timeframe_days: number;
}

interface DashboardOverview {
  disasters: {
    active: number;
    recent_24h: number;
    total: number;
  };
  reports: {
    pending: number;
    recent_24h: number;
  };
  sos_signals: {
    active: number;
    recent_24h: number;
  };
  last_updated: string;
}

interface PredictionData {
  disaster_likelihood: {
    next_7_days: { [key: string]: { probability: number; confidence: number } };
    next_30_days: { [key: string]: { probability: number; confidence: number } };
  };
  resource_demand: { [key: string]: { predicted_need: number; confidence: number } };
  high_risk_areas: Array<{
    area: string;
    risk_score: number;
    primary_threat: string;
  }>;
}

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316'];

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(30);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, heatmapData, dashboardData, predictionsData] = await Promise.all([
        analyticsService.getReportsAnalytics(timeframe),
        analyticsService.getHeatmapData(timeframe),
        analyticsService.getDashboardOverview(),
        analyticsService.getPredictions()
      ]);
      
      setAnalytics(analyticsData);
      setHeatmap(heatmapData);
      setDashboard(dashboardData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.success('Exporting analytics data...');
      await analyticsService.exportAnalytics('csv', timeframe);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const formatChartData = (data: Array<{ _id: string; count: number }>) => {
    return data.map(item => ({
      name: item._id,
      value: item.count
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive disaster management analytics and insights</p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <button
                onClick={loadData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={handleExportData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'reports', name: 'Reports Analytics', icon: AlertTriangle },
                { id: 'predictions', name: 'Predictions', icon: Clock },
                { id: 'heatmap', name: 'Geographic Analysis', icon: MapPin }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && dashboard && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Disasters</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.disasters.active}</p>
                    <p className="text-xs text-gray-500">
                      {dashboard.disasters.recent_24h} in last 24h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.reports.pending}</p>
                    <p className="text-xs text-gray-500">
                      {dashboard.reports.recent_24h} in last 24h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active SOS</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.sos_signals.active}</p>
                    <p className="text-xs text-gray-500">
                      {dashboard.sos_signals.recent_24h} in last 24h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Disasters</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.disasters.total}</p>
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(dashboard.last_updated).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Analytics Tab */}
        {selectedTab === 'reports' && analytics && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Total Reports</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.overview.total_reports}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{analytics.overview.pending_reports}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Addressed</div>
                <div className="text-2xl font-bold text-green-600">{analytics.overview.addressed_reports}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">Avg. Affected People</div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(analytics.overview.average_affected)}</div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Type Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reports by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={formatChartData(analytics.type_distribution)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {formatChartData(analytics.type_distribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reports by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={formatChartData(analytics.priority_distribution)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {selectedTab === 'predictions' && predictions && (
          <div className="space-y-6">
            {/* Disaster Likelihood */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Disaster Likelihood Predictions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Next 7 Days</h4>
                  <div className="space-y-2">
                    {Object.entries(predictions.disaster_likelihood.next_7_days).map(([type, data]) => (
                      <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="capitalize">{type}</span>
                        <div className="text-right">
                          <div className="font-medium">{(data.probability * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">
                            {(data.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Next 30 Days</h4>
                  <div className="space-y-2">
                    {Object.entries(predictions.disaster_likelihood.next_30_days).map(([type, data]) => (
                      <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="capitalize">{type}</span>
                        <div className="text-right">
                          <div className="font-medium">{(data.probability * 100).toFixed(1)}%</div>
                          <div className="text-xs text-gray-500">
                            {(data.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Demand Predictions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Predicted Resource Demand</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(predictions.resource_demand).map(([resource, data]) => (
                  <div key={resource} className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 capitalize">
                      {resource.replace('_', ' ')}
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {data.predicted_need.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600">
                      {(data.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Risk Areas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">High Risk Areas</h3>
              <div className="space-y-3">
                {predictions.high_risk_areas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-900">{area.area}</div>
                      <div className="text-sm text-red-700">Primary threat: {area.primary_threat}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-900">
                        {(area.risk_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-red-600">Risk Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Geographic Analysis Tab */}
        {selectedTab === 'heatmap' && heatmap && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Analysis Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{heatmap.total_reports}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{heatmap.clusters.length}</div>
                  <div className="text-sm text-gray-600">Hotspot Clusters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{heatmap.timeframe_days}</div>
                  <div className="text-sm text-gray-600">Days Analyzed</div>
                </div>
              </div>
            </div>

            {/* Clusters List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Report Clusters</h3>
              <div className="space-y-4">
                {heatmap.clusters.slice(0, 10).map((cluster, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">
                          {cluster.lat.toFixed(4)}, {cluster.lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Types: {Object.keys(cluster.types).join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{cluster.intensity}</div>
                      <div className="text-sm text-gray-600">Reports</div>
                      <div className="text-xs text-gray-500">
                        {cluster.total_affected} affected
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
