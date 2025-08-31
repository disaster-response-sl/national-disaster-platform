import React, { useState, useEffect, useCallback } from 'react';
import { ndxService } from '../services/ndxService';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  Download,
  Calendar,
  Target,
  ArrowRightLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConsentRequestForm from './ConsentRequestForm';

interface Consent {
  _id: string;
  dataProvider: string;
  dataType: string;
  purpose: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';
  consentDuration: number;
  location: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  requester: string;
  approver?: string;
  exchangedData?: { _id?: string; severity?: string; type?: string; description?: string; location?: { lat: number; lng: number }; timestamp?: string }[];
  lastExchangeAt?: string;
}

const NDXConsentManagement: React.FC = () => {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [filteredConsents, setFilteredConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const loadConsents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ndxService.getConsents();
      if (response.success) {
        setConsents(response.consents || []);
        setFilteredConsents(response.consents || []);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load consents';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterConsents = useCallback(() => {
    let filtered = consents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(consent =>
        consent.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.dataProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consent.dataType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(consent => consent.status === statusFilter);
    }

    setFilteredConsents(filtered);
  }, [consents, searchTerm, statusFilter]);

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  useEffect(() => {
    filterConsents();
  }, [filterConsents]);

  const handleStatusChange = async (consentId: string, newStatus: 'APPROVED' | 'REJECTED' | 'REVOKED') => {
    setActionLoading(prev => ({ ...prev, [consentId]: true }));
    try {
      let response;
      if (newStatus === 'APPROVED') {
        response = await ndxService.approveConsent(consentId);
      } else if (newStatus === 'REJECTED') {
        response = await ndxService.rejectConsent(consentId);
      } else {
        response = await ndxService.revokeConsent(consentId);
      }

      if (response.success) {
        toast.success(`Consent ${newStatus.toLowerCase()} successfully`);
        loadConsents();
      } else {
        toast.error(`Failed to ${newStatus.toLowerCase()} consent`);
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to ${newStatus.toLowerCase()} consent`;
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [consentId]: false }));
    }
  };

  const handleExchangeData = async (consentId: string) => {
    setActionLoading(prev => ({ ...prev, [consentId]: true }));
    try {
      const response = await ndxService.exchangeData({
        consentId,
        dataProvider: 'disaster-management',
        dataType: 'disasters',
        purpose: 'exchange-test'
      });

      if (response.success) {
        toast.success(`Data exchange successful! Retrieved ${response.data?.length || 0} records`);
        loadConsents();
      } else {
        toast.error(response.message || 'Failed to exchange data');
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error exchanging data';
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [consentId]: false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING_APPROVAL':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REVOKED':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
      case 'EXPIRED':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REVOKED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const exportConsents = () => {
    const csvData = filteredConsents.map(consent => ({
      'Consent ID': consent._id,
      'Data Provider': consent.dataProvider,
      'Data Type': consent.dataType,
      'Purpose': consent.purpose,
      'Status': consent.status,
      'Created': formatDate(consent.createdAt),
      'Expires': formatDate(consent.expiresAt),
      'Location': consent.location ? `${consent.location.lat.toFixed(4)}, ${consent.location.lng.toFixed(4)}` : 'N/A'
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (showRequestForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Request New Consent</h2>
          <button
            onClick={() => setShowRequestForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Consents
          </button>
        </div>
        <ConsentRequestForm onSubmit={async (data) => {
          try {
            const response = await ndxService.requestConsent(data);
            if (response.success) {
              setShowRequestForm(false);
              loadConsents();
              return { success: true, consentId: response.consentId };
            } else {
              return { success: false, error: 'Failed to create consent request' };
            }
          } catch (error: unknown) {
            const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error creating consent request';
            return { success: false, error: errorMessage };
          }
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consent Management</h2>
            <p className="text-gray-600">Manage data exchange consents and permissions</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadConsents}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Request Consent
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search consents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING_APPROVAL">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="REVOKED">Revoked</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportConsents}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Consents Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading consents...</p>
          </div>
        ) : filteredConsents.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consents found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by requesting your first data exchange consent'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Consent
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Provider</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Purpose</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expires</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConsents.map((consent) => (
                  <tr key={consent._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {consent.dataProvider.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{consent.dataType}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{consent.purpose}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(consent.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(consent.status)}`}>
                          {consent.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatDate(consent.expiresAt)}
                          </div>
                          {isExpiringSoon(consent.expiresAt) && (
                            <div className="text-xs text-orange-600 font-medium">
                              Expires soon
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {consent.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => handleExchangeData(consent._id)}
                              disabled={actionLoading[consent._id]}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                              title="Exchange Data"
                            >
                              {actionLoading[consent._id] ? (
                                <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <ArrowRightLeft className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusChange(consent._id, 'REVOKED')}
                              disabled={actionLoading[consent._id]}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                              title="Revoke Consent"
                            >
                              {actionLoading[consent._id] ? (
                                <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NDXConsentManagement;
