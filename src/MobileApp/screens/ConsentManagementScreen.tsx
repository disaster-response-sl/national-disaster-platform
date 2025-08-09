// components/ConsentManagementScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import NDXService, { NDXProvider, NDXConsent } from '../services/NDXService';

const { width } = Dimensions.get('window');

interface ConsentManagementScreenProps {
  navigation: any;
}

const ConsentManagementScreen: React.FC<ConsentManagementScreenProps> = ({ navigation }) => {
  const [providers, setProviders] = useState<NDXProvider[]>([]);
  const [consents, setConsents] = useState<Record<string, NDXConsent>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load providers
      const providersResult = await NDXService.getDataProviders();
      if (providersResult.success && providersResult.providers) {
        setProviders(providersResult.providers);
      }

      // Load stored consents
      const storedConsents = await NDXService.getStoredConsents();
      setConsents(storedConsents);
    } catch (error) {
      console.error('Error loading consent data:', error);
      Alert.alert('Connection Error', 'Unable to load consent data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRequestConsent = async (provider: NDXProvider, dataType: string) => {
    try {
      const request = {
        dataProvider: provider.id,
        dataType: dataType,
        purpose: 'emergency-response',
        consentDuration: 24 * 60 * 60 * 1000, // 24 hours
      };

      const result = await NDXService.requestConsent(request);

      if (result.success && result.consentId) {
        Alert.alert(
          '🔐 Consent Request',
          `Request consent for ${provider.name} to access ${dataType} data for emergency response purposes?`,
          [
            {
              text: 'Approve Now',
              style: 'default',
              onPress: () => handleApproveConsent(result.consentId!),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Request Failed', result.message || 'Unable to request consent. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting consent:', error);
      Alert.alert('Request Error', 'Failed to submit consent request. Please check your connection.');
    }
  };

  const handleApproveConsent = async (consentId: string) => {
    try {
      const result = await NDXService.approveConsent(consentId);

      if (result.success) {
        Alert.alert('✅ Consent Approved', 'Your data sharing consent has been approved successfully.');
        // Refresh consents
        const storedConsents = await NDXService.getStoredConsents();
        setConsents(storedConsents);
      } else {
        Alert.alert('Approval Failed', result.message || 'Unable to approve consent. Please try again.');
      }
    } catch (error) {
      console.error('Error approving consent:', error);
      Alert.alert('Approval Error', 'Failed to approve consent. Please check your connection.');
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    Alert.alert(
      '⚠️ Revoke Consent',
      'Revoking this consent will stop data sharing with this provider. This may affect emergency response services. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Consent',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await NDXService.revokeConsent(consentId);

              if (result.success) {
                Alert.alert('🔐 Consent Revoked', 'Your consent has been revoked successfully.');
                // Remove from local storage
                await NDXService.removeStoredConsent(consentId);
                // Refresh consents
                const storedConsents = await NDXService.getStoredConsents();
                setConsents(storedConsents);
              } else {
                Alert.alert('Revocation Failed', result.message || 'Unable to revoke consent. Please try again.');
              }
            } catch (error) {
              console.error('Error revoking consent:', error);
              Alert.alert('Revocation Error', 'Failed to revoke consent. Please check your connection.');
            }
          },
        },
      ]
    );
  };

  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'REVOKED':
        return '#ef4444';
      case 'EXPIRED':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getConsentStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'REVOKED':
        return '❌';
      case 'EXPIRED':
        return '⏰';
      default:
        return '❓';
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'disaster-management':
        return '🚨';
      case 'weather-service':
        return '🌦️';
      case 'health-ministry':
        return '🏥';
      case 'police-service':
        return '👮';
      default:
        return '🏛️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m remaining`;
    } else if (diffHrs < 24) {
      return `${diffHrs}h remaining`;
    } else {
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d remaining`;
    }
  };

  const getConsentStats = () => {
    const consentList = Object.values(consents);
    return {
      total: consentList.length,
      approved: consentList.filter(c => c.status === 'APPROVED').length,
      pending: consentList.filter(c => c.status === 'PENDING').length,
      expired: consentList.filter(c => c.status === 'EXPIRED').length,
    };
  };

  const stats = getConsentStats();

  if (loading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingTitle}>Loading Privacy Settings</Text>
            <Text style={styles.loadingText}>Fetching your data sharing preferences...</Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.headerIconContainer}>
                <Text style={styles.headerIcon}>🔐</Text>
              </View>
              <Text style={styles.title}>Privacy & Consent</Text>
              <Text style={styles.subtitle}>Manage your data sharing permissions</Text>
            </View>
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Consents</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: '#10b981' }]}>
              <Text style={styles.statNumber}>{stats.approved}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: '#f59e0b' }]}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={[styles.statCard, { borderTopColor: '#6b7280' }]}>
              <Text style={styles.statNumber}>{stats.expired}</Text>
              <Text style={styles.statLabel}>Expired</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>🚀 Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: '#ef4444' }]}
                onPress={() => {
                  const disasterProvider = providers.find(p => p.id === 'disaster-management');
                  if (disasterProvider) {
                    handleRequestConsent(disasterProvider, 'disasters');
                  } else {
                    Alert.alert('Provider Not Available', 'Disaster Management service is currently unavailable.');
                  }
                }}
              >
                <Text style={styles.quickActionIcon}>🚨</Text>
                <Text style={styles.quickActionText}>Emergency Data</Text>
                <Text style={styles.quickActionSubtext}>Disaster alerts & response</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: '#3b82f6' }]}
                onPress={() => {
                  const weatherProvider = providers.find(p => p.id === 'weather-service');
                  if (weatherProvider) {
                    handleRequestConsent(weatherProvider, 'weather-alerts');
                  } else {
                    Alert.alert('Provider Not Available', 'Weather Service is currently unavailable.');
                  }
                }}
              >
                <Text style={styles.quickActionIcon}>🌦️</Text>
                <Text style={styles.quickActionText}>Weather Data</Text>
                <Text style={styles.quickActionSubtext}>Weather alerts & forecasts</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Providers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏛️ Available Data Providers</Text>
            <Text style={styles.sectionDescription}>
              Government agencies and services that can share data to help during emergencies
            </Text>

            {providers.length > 0 ? (
              providers.map((provider) => (
                <View key={provider.id} style={styles.providerCard}>
                  <View style={styles.providerHeader}>
                    <View style={styles.providerLeft}>
                      <View style={styles.providerIconContainer}>
                        <Text style={styles.providerIcon}>{getProviderIcon(provider.id)}</Text>
                      </View>
                      <View style={styles.providerInfo}>
                        <Text style={styles.providerName}>{provider.name}</Text>
                        <Text style={styles.providerDescription}>
                          {provider.apis.length} data service{provider.apis.length !== 1 ? 's' : ''} available
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.apisList}>
                    <Text style={styles.apisTitle}>Available Services:</Text>
                    <View style={styles.apiButtons}>
                      {provider.apis.map((api) => (
                        <TouchableOpacity
                          key={api}
                          style={styles.apiButton}
                          onPress={() => handleRequestConsent(provider, api)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.apiButtonText}>Request {api}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🏛️</Text>
                <Text style={styles.noDataText}>No Providers Available</Text>
                <Text style={styles.noDataSubtext}>Data providers are currently unavailable</Text>
              </View>
            )}
          </View>

          {/* Active Consents Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Your Data Sharing Consents</Text>
            <Text style={styles.sectionDescription}>
              Manage your active data sharing permissions with government services
            </Text>

            {Object.keys(consents).length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🔐</Text>
                <Text style={styles.noDataText}>No Active Consents</Text>
                <Text style={styles.noDataSubtext}>
                  You haven't granted any data sharing permissions yet
                </Text>
                <TouchableOpacity style={styles.helpButton} onPress={() => {
                  Alert.alert(
                    'About Data Consents',
                    'Data consents allow government services to access your information during emergencies to provide better assistance. All data sharing is secure and temporary.'
                  );
                }}>
                  <Text style={styles.helpButtonText}>Learn More</Text>
                </TouchableOpacity>
              </View>
            ) : (
              Object.values(consents).map((consent) => (
                <View key={consent.consentId} style={styles.consentCard}>
                  <View style={styles.consentHeader}>
                    <View style={styles.consentLeft}>
                      <View style={styles.consentIconContainer}>
                        <Text style={styles.consentIcon}>{getProviderIcon(consent.dataProvider)}</Text>
                      </View>
                      <View style={styles.consentInfo}>
                        <Text style={styles.consentProvider}>{consent.dataProvider}</Text>
                        <Text style={styles.consentDataType}>{consent.dataType}</Text>
                      </View>
                    </View>
                    <View style={styles.consentRight}>
                      <View style={[styles.statusBadge, { backgroundColor: getConsentStatusColor(consent.status) }]}>
                        <Text style={styles.statusIcon}>{getConsentStatusIcon(consent.status)}</Text>
                        <Text style={styles.statusText}>{consent.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.consentDetails}>
                    <View style={styles.consentDetailRow}>
                      <Text style={styles.consentDetailIcon}>🎯</Text>
                      <View style={styles.consentDetailContent}>
                        <Text style={styles.consentDetailLabel}>Purpose:</Text>
                        <Text style={styles.consentDetailValue}>{consent.purpose}</Text>
                      </View>
                    </View>

                    <View style={styles.consentDetailRow}>
                      <Text style={styles.consentDetailIcon}>📅</Text>
                      <View style={styles.consentDetailContent}>
                        <Text style={styles.consentDetailLabel}>Created:</Text>
                        <Text style={styles.consentDetailValue}>{formatDate(consent.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.consentDetailRow}>
                      <Text style={styles.consentDetailIcon}>⏰</Text>
                      <View style={styles.consentDetailContent}>
                        <Text style={styles.consentDetailLabel}>Expires:</Text>
                        <Text style={styles.consentDetailValue}>{formatDate(consent.expiresAt)}</Text>
                        {consent.status === 'APPROVED' && (
                          <Text style={styles.timeRemaining}>
                            {getTimeRemaining(consent.expiresAt)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {consent.status === 'APPROVED' && (
                    <TouchableOpacity
                      style={styles.revokeButton}
                      onPress={() => handleRevokeConsent(consent.consentId)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.revokeButtonIcon}>🚫</Text>
                      <Text style={styles.revokeButtonText}>Revoke Consent</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#1f2937',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 3,
    borderTopColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  providerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  providerIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerIcon: {
    fontSize: 24,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  providerDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  apisList: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  apisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  apiButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  apiButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  apiButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  helpButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  consentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  consentIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  consentIcon: {
    fontSize: 20,
  },
  consentInfo: {
    flex: 1,
  },
  consentProvider: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  consentDataType: {
    fontSize: 14,
    color: '#6b7280',
  },
  consentRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  consentDetails: {
    gap: 12,
    marginBottom: 16,
  },
  consentDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  consentDetailIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
    width: 20,
  },
  consentDetailContent: {
    flex: 1,
  },
  consentDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  consentDetailValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 2,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  revokeButtonIcon: {
    fontSize: 16,
  },
  revokeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 32,
  },
});

export default ConsentManagementScreen;
