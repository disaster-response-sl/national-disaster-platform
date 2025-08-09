import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { sosService } from '../services/sosService';
import toast from 'react-hot-toast';

interface SosSignal {
  _id: string;
  user_id: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'responding' | 'resolved' | 'cancelled';
  emergency_type: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  assigned_responder?: string;
  user_info?: {
    name?: string;
    phone?: string;
  };
}

interface SosDashboard {
  total_signals: number;
  pending_signals: number;
  responded_signals: number;
  average_response_time: number;
  signals_by_priority: Array<{ _id: string; count: number }>;
  signals_by_type: Array<{ _id: string; count: number }>;
  recent_signals: SosSignal[];
}

interface SosCluster {
  center: {
    lat: number;
    lng: number;
  };
  signals: SosSignal[];
  radius_km: number;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  cluster_id: string;
}

const SosManagement: React.FC = () => {
  const [sosSignals, setSosSignals] = useState<SosSignal[]>([]);
  const [dashboard, setDashboard] = useState<SosDashboard | null>(null);
  const [clusters, setClusters] = useState<SosCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedSignal, setSelectedSignal] = useState<SosSignal | null>(null);
  const [showModal, setShowModal] = useState(false);

  const statusColors = {
    pending: 'bg-red-100 text-red-800',
    acknowledged: 'bg-yellow-100 text-yellow-800',
    responding: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [signalsData, dashboardData, clustersData] = await Promise.all([
        sosService.getAllSosSignals(),
        sosService.getSosDashboard(),
        sosService.getSosClusters()
      ]);
      setSosSignals(signalsData);
      setDashboard(dashboardData);
      setClusters(clustersData);
    } catch (error) {
      console.error('Error loading SOS data:', error);
      toast.error('Failed to load SOS data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (signalId: string, newStatus: string) => {
    try {
      await sosService.updateSosStatus(signalId, newStatus);
      toast.success('Status updated successfully');
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error updating SOS status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleAssignResponder = async (signalId: string, responderId: string) => {
    try {
      await sosService.assignResponder(signalId, responderId);
      toast.success('Responder assigned successfully');
      await loadData();
    } catch (error) {
      console.error('Error assigning responder:', error);
      toast.error('Failed to assign responder');
    }
  };

  const handleExportReport = async () => {
    try {
      toast.success('Exporting SOS report...');
      await sosService.exportSosData('csv', 30);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const filteredSignals = sosSignals.filter(signal => {
    const matchesStatus = statusFilter === 'all' || signal.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || signal.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getResponseTime = (signal: SosSignal) => {
    if (!signal.acknowledged_at) return 'Pending';
    const created = new Date(signal.created_at);
    const acknowledged = new Date(signal.acknowledged_at);
    const diffMins = Math.floor((acknowledged.getTime() - created.getTime()) / 60000);
    return `${diffMins}m`;
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
              <h1 className="text-3xl font-bold text-gray-900">SOS Signal Management</h1>
              <p className="text-gray-600">Monitor and respond to emergency signals</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button 
                onClick={handleExportReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Signals</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.total_signals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.pending_signals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Responded</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.responded_signals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.average_response_time}m</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="responding">Responding</option>
              <option value="resolved">Resolved</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* SOS Signals Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signal Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSignals.map((signal) => (
                  <tr key={signal._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {signal.emergency_type || 'Emergency'}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {signal.message}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTimeAgo(signal.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {signal.user_info?.name || 'Unknown User'}
                      </div>
                      {signal.user_info?.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {signal.user_info.phone}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">ID: {signal.user_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <div>
                          {signal.location.address || `${signal.location.lat}, ${signal.location.lng}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[signal.priority]}`}>
                        {signal.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[signal.status]}`}>
                        {signal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getResponseTime(signal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedSignal(signal);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {signal.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(signal._id, 'acknowledged')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {signal.status !== 'resolved' && signal.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleStatusUpdate(signal._id, 'resolved')}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredSignals.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No SOS signals found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Signal Detail Modal */}
        {showModal && selectedSignal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">SOS Signal Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Type</label>
                    <p className="text-sm text-gray-900">{selectedSignal.emergency_type}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="text-sm text-gray-900">{selectedSignal.message}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[selectedSignal.priority]}`}>
                      {selectedSignal.priority}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedSignal.status]}`}>
                      {selectedSignal.status}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">
                      {selectedSignal.location.address || `${selectedSignal.location.lat}, ${selectedSignal.location.lng}`}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedSignal.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Close
                  </button>
                  {selectedSignal.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedSignal._id, 'acknowledged');
                        setShowModal(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SosManagement;
