import React, { useState, useEffect } from 'react';
import { ndxService } from '../services/ndxService';
import { Shield, CheckCircle, XCircle, Clock, RefreshCw, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ConsentRequestForm from './ConsentRequestForm';

interface ConsentRequest {
  dataProvider: string;
  dataType: string;
  purpose: string;
  consentDuration: number;
  location: { lat: number; lng: number };
}

interface ConsentStatus {
  consentId: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REVOKED';
  dataProvider?: string;
  dataType?: string;
  approvedAt?: string;
  message?: string;
  exchangedData?: any[];
  lastExchangeAt?: string;
}

const NDXConsentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [consentRequests, setConsentRequests] = useState<ConsentStatus[]>([]);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [disasterInfoLoading, setDisasterInfoLoading] = useState(false);
  const [disasterInfoData, setDisasterInfoData] = useState<any>(null);

  // Validation helper functions
  const validateConsentId = (consentId: string): { isValid: boolean; error?: string } => {
    if (!consentId || typeof consentId !== 'string') {
      return { isValid: false, error: 'Consent ID is required' };
    }
    if (consentId.trim().length === 0) {
      return { isValid: false, error: 'Consent ID cannot be empty' };
    }
    if (!consentId.startsWith('consent_')) {
      return { isValid: false, error: 'Invalid consent ID format' };
    }
    if (consentId.length < 15) {
      return { isValid: false, error: 'Consent ID is too short' };
    }
    return { isValid: true };
  };

  const isNetworkError = (error: any): boolean => {
    return (
      !navigator.onLine ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('fetch')
    );
  };

  // Auto-refresh consent statuses every 30 seconds
  useEffect(() => {
    const refreshAllStatuses = async () => {
      if (consentRequests.length === 0) return;
      
      try {
        const updates = await Promise.allSettled(
          consentRequests.map(async (consent) => {
            try {
              const response = await ndxService.getConsentStatus(consent.consentId);
              return { 
                consentId: consent.consentId, 
                status: response.status, 
                success: response.success,
                error: null 
              };
            } catch (error: any) {
              // Handle individual consent check failures
              let errorType = 'unknown';
              if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
                errorType = 'network';
              } else if (error.response?.status === 401) {
                errorType = 'auth';
              } else if (error.response?.status === 404) {
                errorType = 'not_found';
              } else if (error.response?.status >= 500) {
                errorType = 'server';
              }
              
              return { 
                consentId: consent.consentId, 
                status: null, 
                success: false,
                error: errorType 
              };
            }
          })
        );

        let hasUpdates = false;
        let authErrors = 0;
        let networkErrors = 0;
        let notFoundErrors = 0;

        setConsentRequests(prev => {
          const updated = prev.map(consent => {
            const update = updates.find((u) => 
              u.status === 'fulfilled' && u.value.consentId === consent.consentId
            );
            
            if (update && update.status === 'fulfilled') {
              const result = update.value;
              
              // Count errors for summary
              if (result.error === 'auth') authErrors++;
              else if (result.error === 'network') networkErrors++;
              else if (result.error === 'not_found') notFoundErrors++;
              
              // Only update if successful and status changed
              if (result.success && result.status && result.status !== consent.status) {
                hasUpdates = true;
                return { ...consent, status: result.status };
              }
            }
            return consent;
          });
          return updated;
        });

        // Show appropriate feedback based on results
        if (authErrors > 0) {
          toast.error('Authentication expired. Please login again.', { duration: 5000 });
        } else if (networkErrors === consentRequests.length) {
          toast.error('Network connection lost. Auto-refresh paused.', { duration: 4000 });
        } else if (hasUpdates) {
          toast.success('Consent statuses updated automatically', { duration: 2000 });
        }
        
      } catch (error: any) {
        // Global auto-refresh failure
        if (!navigator.onLine) {
          console.warn('Auto-refresh paused: No network connection');
        } else {
          console.warn('Auto-refresh failed:', error);
        }
      }
    };

    const interval = setInterval(refreshAllStatuses, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [consentRequests]);

  const handleRequestConsent = async (requestData: ConsentRequest) => {
    setLoading(true);
    try {
      const response = await ndxService.requestConsent(requestData);
      if (response.success) {
        const newConsent: ConsentStatus = {
          consentId: response.consentId,
          status: response.status,
          dataProvider: requestData.dataProvider,
          dataType: requestData.dataType,
          message: response.message || 'Consent request created successfully'
        };
        setConsentRequests(prev => [...prev, newConsent]);
        toast.success('Consent request created successfully');
        return { success: true, consentId: response.consentId };
      } else {
        toast.error('Failed to create consent request');
        return { success: false, error: 'Failed to create consent request' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error creating consent request';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleApproveConsent = async (consentId: string) => {
    // Validate that consent exists and is in pending state
    const consentToApprove = consentRequests.find(c => c.consentId === consentId);
    if (!consentToApprove) {
      toast.error('Consent not found');
      return;
    }

    if (consentToApprove.status !== 'PENDING_APPROVAL') {
      toast.error(`Cannot approve consent with status: ${consentToApprove.status}`);
      return;
    }

    setActionLoading(prev => ({ ...prev, [consentId]: true }));
    try {
      const response = await ndxService.approveConsent(consentId);
      if (response.success) {
        setConsentRequests(prev => 
          prev.map(consent => 
            consent.consentId === consentId 
              ? { 
                  ...consent, 
                  status: 'APPROVED',
                  approvedAt: new Date().toISOString(),
                  message: response.message || 'Consent approved successfully'
                }
              : consent
          )
        );
        toast.success(response.message || 'Consent approved successfully');
      } else {
        const errorMsg = response.message || response.error || 'Failed to approve consent';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      let errorMessage = 'Error approving consent';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to approve this consent.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Consent not found on server.';
      } else if (error.response?.status === 409) {
        errorMessage = 'Consent has already been processed.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [consentId]: false }));
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    // Validate that consent exists and can be revoked
    const consentToRevoke = consentRequests.find(c => c.consentId === consentId);
    if (!consentToRevoke) {
      toast.error('Consent not found');
      return;
    }

    if (consentToRevoke.status !== 'APPROVED') {
      toast.error(`Cannot revoke consent with status: ${consentToRevoke.status}`);
      return;
    }

    setActionLoading(prev => ({ ...prev, [consentId]: true }));
    try {
      const response = await ndxService.revokeConsent(consentId);
      if (response.success) {
        setConsentRequests(prev => 
          prev.map(consent => 
            consent.consentId === consentId 
              ? { 
                  ...consent, 
                  status: 'REVOKED',
                  message: response.message || 'Consent revoked successfully'
                }
              : consent
          )
        );
        toast.success(response.message || 'Consent revoked successfully');
      } else {
        const errorMsg = response.message || response.error || 'Failed to revoke consent';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      let errorMessage = 'Error revoking consent';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to revoke this consent.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Consent not found on server.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [consentId]: false }));
    }
  };

  const handleExchangeData = async (consentId: string) => {
    // Validate that consent exists and is in approved state
    const consentToExchange = consentRequests.find(c => c.consentId === consentId);
    if (!consentToExchange) {
      toast.error('Consent not found');
      return;
    }

    if (consentToExchange.status !== 'APPROVED') {
      toast.error(`Cannot exchange data with consent status: ${consentToExchange.status}`);
      return;
    }

    setActionLoading(prev => ({ ...prev, [consentId]: true }));
    try {
      const response = await ndxService.exchangeData({
        consentId,
        dataProvider: 'disaster-management',
        dataType: 'disasters',
        purpose: 'exchange-test',
        location: { lat: 6.9271, lng: 79.8612 }
      });
      
      if (response.success) {
        toast.success(`Data exchange successful! Retrieved ${response.data?.length || 0} records`);
        
        // Update consent with exchange info
        setConsentRequests(prev => 
          prev.map(consent => 
            consent.consentId === consentId 
              ? { 
                  ...consent, 
                  exchangedData: response.data,
                  lastExchangeAt: new Date().toISOString(),
                  message: `Data exchanged successfully - ${response.data?.length || 0} records retrieved`
                }
              : consent
          )
        );
      } else {
        toast.error(response.message || 'Failed to exchange data');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error exchanging data';
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [consentId]: false }));
    }
  };

  const handleGetDisasterInfo = async () => {
    setDisasterInfoLoading(true);
    try {
      const response = await ndxService.getDisasterInfo({
        lat: 6.9271, // Default Colombo coordinates
        lng: 79.8612
      });
      
      if (response.success) {
        setDisasterInfoData(response);
        toast.success(`Disaster info retrieved! Found ${response.data?.length || 0} records via NDX shortcut`);
      } else {
        toast.error(response.message || 'Failed to get disaster information');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error getting disaster information';
      toast.error(errorMessage);
    } finally {
      setDisasterInfoLoading(false);
    }
  };

  const handleCheckStatus = async (consentId: string) => {
    // Validate consent ID before making request
    const validation = validateConsentId(consentId);
    if (!validation.isValid) {
      toast.error(`Invalid consent ID: ${validation.error}`);
      return;
    }

    // Check network connectivity
    if (!navigator.onLine) {
      toast.error('No network connection. Please check your internet connection.');
      return;
    }

    setActionLoading(prev => ({ ...prev, [`status_${consentId}`]: true }));
    try {
      const response = await ndxService.getConsentStatus(consentId);
      
      if (response.success) {
        setConsentRequests(prev => 
          prev.map(consent => 
            consent.consentId === consentId 
              ? { ...consent, status: response.status }
              : consent
          )
        );
        toast.success(`Status updated: ${response.status}`, { duration: 3000 });
      } else {
        const errorMsg = response.message || response.error || 'Failed to check status';
        toast.error(`Status check failed: ${errorMsg}`);
      }
    } catch (error: any) {
      let errorMessage = 'Error checking status';
      
      if (isNetworkError(error)) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication expired. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to check this consent status.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Consent not found on server. It may have been deleted.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server is currently unavailable. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = `Server error: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Request failed: ${error.message}`;
      }
      
      toast.error(errorMessage, { duration: 5000 });
      
      // If consent not found, suggest removing it from the list
      if (error.response?.status === 404) {
        setTimeout(() => {
          toast.error('Consider removing this consent from your list as it no longer exists.', { 
            duration: 4000,
            id: `remove-suggestion-${consentId}` 
          });
        }, 1000);
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`status_${consentId}`]: false }));
    }
  };

  const handleRefreshAll = async () => {
    if (consentRequests.length === 0) {
      toast.success('No consent requests to refresh');
      return;
    }

    // Check network connectivity first
    if (!navigator.onLine) {
      toast.error('No network connection. Please check your internet connection.');
      return;
    }

    setActionLoading(prev => ({ ...prev, 'refresh_all': true }));
    try {
      const updates = await Promise.allSettled(
        consentRequests.map(async (consent) => {
          try {
            const response = await ndxService.getConsentStatus(consent.consentId);
            return { 
              consentId: consent.consentId, 
              status: response.status, 
              success: response.success,
              error: null 
            };
          } catch (error: any) {
            // Handle individual consent check failures
            let errorType = 'unknown';
            let errorMessage = 'Unknown error';
            
            if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
              errorType = 'network';
              errorMessage = 'Network error';
            } else if (error.response?.status === 401) {
              errorType = 'auth';
              errorMessage = 'Authentication failed';
            } else if (error.response?.status === 403) {
              errorType = 'forbidden';
              errorMessage = 'Access forbidden';
            } else if (error.response?.status === 404) {
              errorType = 'not_found';
              errorMessage = 'Consent not found';
            } else if (error.response?.status === 429) {
              errorType = 'rate_limit';
              errorMessage = 'Too many requests';
            } else if (error.response?.status >= 500) {
              errorType = 'server';
              errorMessage = 'Server error';
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            return { 
              consentId: consent.consentId, 
              status: null, 
              success: false,
              error: errorType,
              errorMessage 
            };
          }
        })
      );

      let updatedCount = 0;
      let errorCount = 0;
      let authErrors = 0;
      let networkErrors = 0;
      let notFoundErrors = 0;
      let serverErrors = 0;
      
      setConsentRequests(prev => {
        const updated = prev.map(consent => {
          const update = updates.find((u) => 
            u.status === 'fulfilled' && u.value.consentId === consent.consentId
          );
          
          if (update && update.status === 'fulfilled') {
            const result = update.value;
            
            // Count errors by type
            if (!result.success) {
              errorCount++;
              switch (result.error) {
                case 'auth': authErrors++; break;
                case 'network': networkErrors++; break;
                case 'not_found': notFoundErrors++; break;
                case 'server': serverErrors++; break;
              }
              return consent; // Don't update on error
            }
            
            // Update successful results
            if (result.success && result.status && result.status !== consent.status) {
              updatedCount++;
              return { ...consent, status: result.status };
            }
          }
          return consent;
        });
        return updated;
      });

      // Provide detailed feedback based on results
      if (authErrors > 0) {
        toast.error('Authentication expired. Please login again.');
      } else if (networkErrors > 0 && networkErrors === consentRequests.length) {
        toast.error('All requests failed due to network issues. Please check your connection.');
      } else if (serverErrors > 0 && serverErrors === consentRequests.length) {
        toast.error('Server is currently unavailable. Please try again later.');
      } else if (errorCount > 0 && updatedCount === 0) {
        toast.error(`Failed to refresh ${errorCount} consent${errorCount > 1 ? 's' : ''}. Some may no longer exist.`);
      } else if (errorCount > 0 && updatedCount > 0) {
        toast.success(`${updatedCount} consent${updatedCount > 1 ? 's' : ''} updated. ${errorCount} failed to refresh.`);
      } else if (updatedCount > 0) {
        toast.success(`${updatedCount} consent status${updatedCount > 1 ? 'es' : ''} updated`);
      } else {
        toast.success('All consent statuses are up to date');
      }
    } catch (error: any) {
      // Handle global refresh failure
      let errorMessage = 'Failed to refresh consent statuses';
      
      if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication expired. Please login again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server is currently unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = `Refresh failed: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, 'refresh_all': false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REVOKED': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING_APPROVAL': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REVOKED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionButtonTitle = (consent: ConsentStatus, action: 'approve' | 'revoke') => {
    if (action === 'approve') {
      if (consent.status === 'APPROVED') return 'Consent is already approved';
      if (consent.status === 'REVOKED') return 'Cannot approve revoked consent';
      return 'Approve this consent request';
    } else {
      if (consent.status === 'PENDING_APPROVAL') return 'Approve consent first before revoking';
      if (consent.status === 'REVOKED') return 'Consent is already revoked';
      return 'Revoke this approved consent';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800">NDX Consent Management</h2>
      </div>

      {/* Request New Consent */}
      <div className="mb-8">
        <ConsentRequestForm onSubmit={handleRequestConsent} loading={loading} />
      </div>

      {/* Disaster Info Shortcut */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Quick Disaster Information</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get disaster information instantly using NDX shortcut (auto-creates and approves consent)
        </p>
        <button
          onClick={handleGetDisasterInfo}
          disabled={disasterInfoLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {disasterInfoLoading ? (
            <>
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              Getting Disaster Info...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Get Disaster Info
            </>
          )}
        </button>
      </div>

      {/* Disaster Info Results */}
      {disasterInfoData && (
        <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Disaster Information Retrieved</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600"><strong>Consent ID:</strong> {disasterInfoData.consentId}</p>
              <p className="text-sm text-gray-600"><strong>Message:</strong> {disasterInfoData.message}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600"><strong>Records Found:</strong> {disasterInfoData.data?.length || 0}</p>
              <p className="text-sm text-gray-600"><strong>Retrieved:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
          
          {disasterInfoData.data && disasterInfoData.data.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Disaster Records:</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {disasterInfoData.data.map((disaster: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      disaster.severity === 'high' ? 'bg-red-100 text-red-700' :
                      disaster.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {disaster.severity?.toUpperCase() || 'N/A'}
                    </span>
                    <span className="text-sm font-medium">{disaster.type || 'Unknown'}</span>
                    <span className="text-sm text-gray-600">at {disaster.location?.lat?.toFixed(4)}, {disaster.location?.lng?.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Consent Requests List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">Consent Requests</h3>
          {consentRequests.length > 0 && (
            <button
              onClick={handleRefreshAll}
              disabled={actionLoading['refresh_all']}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="Refresh all consent statuses"
            >
              {actionLoading['refresh_all'] ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Refresh All
                </>
              )}
            </button>
          )}
        </div>
        {consentRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No consent requests yet. Create one above.
          </div>
        ) : (
          <div className="space-y-4">
            {consentRequests.map((consent) => (
              <div key={consent.consentId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(consent.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(consent.status)}`}>
                      {consent.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckStatus(consent.consentId)}
                      disabled={actionLoading[`status_${consent.consentId}`]}
                      className="flex items-center gap-1 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title={actionLoading[`status_${consent.consentId}`] ? "Checking status..." : "Check current status"}
                    >
                      {actionLoading[`status_${consent.consentId}`] ? (
                        <div className="w-4 h-4 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {actionLoading[`status_${consent.consentId}`] ? "Checking..." : "Check Status"}
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Consent ID:</strong> {consent.consentId}</p>
                  <p><strong>Provider:</strong> {consent.dataProvider}</p>
                  <p><strong>Data Type:</strong> {consent.dataType}</p>
                  {consent.status === 'APPROVED' && consent.approvedAt && (
                    <p><strong>Approved At:</strong> {new Date(consent.approvedAt).toLocaleString()}</p>
                  )}
                  {consent.message && (
                    <p><strong>Message:</strong> {consent.message}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {consent.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApproveConsent(consent.consentId)}
                      disabled={actionLoading[consent.consentId]}
                      title={getActionButtonTitle(consent, 'approve')}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {actionLoading[consent.consentId] ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </>
                      )}
                    </button>
                  )}
                  {consent.status === 'APPROVED' && (
                    <>
                      <button
                        onClick={() => handleExchangeData(consent.consentId)}
                        disabled={actionLoading[consent.consentId]}
                        title="Exchange data using this approved consent"
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {actionLoading[consent.consentId] ? (
                          <>
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            Exchanging...
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="w-3 h-3" />
                            Exchange Data
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRevokeConsent(consent.consentId)}
                        disabled={actionLoading[consent.consentId]}
                        title={getActionButtonTitle(consent, 'revoke')}
                        className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {actionLoading[consent.consentId] ? (
                          <>
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            Revoking...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Revoke
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Exchanged Data Display */}
                {consent.exchangedData && consent.exchangedData.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-800">Exchanged Data</h4>
                      <span className="text-xs text-gray-500">
                        ({consent.exchangedData.length} records)
                      </span>
                      {consent.lastExchangeAt && (
                        <span className="text-xs text-gray-500 ml-auto">
                          Last exchange: {new Date(consent.lastExchangeAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {consent.exchangedData.map((item: any, index: number) => (
                          <div key={item._id || index} className="bg-white rounded border p-3 text-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                item.severity === 'high' ? 'bg-red-100 text-red-800' :
                                item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.severity?.toUpperCase() || 'UNKNOWN'}
                              </span>
                              <span className="font-medium text-gray-800 capitalize">
                                {item.type || 'Unknown Type'}
                              </span>
                            </div>
                            
                            {item.description && (
                              <p className="text-gray-600 mb-2">{item.description}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                              {item.location && (
                                <span>
                                  📍 {item.location.lat?.toFixed(4)}, {item.location.lng?.toFixed(4)}
                                </span>
                              )}
                              {item.timestamp && (
                                <span>
                                  🕒 {new Date(item.timestamp).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NDXConsentManagement;
