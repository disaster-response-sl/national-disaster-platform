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
import { useLanguage } from '../services/LanguageService';
import { getTextStyle } from '../services/FontService';

const { width } = Dimensions.get('window');

interface ConsentManagementScreenProps {
  navigation: any;
}

const ConsentManagementScreen: React.FC<ConsentManagementScreenProps> = ({ navigation }) => {
  const { t, language } = useLanguage();
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

      // Load consents from backend and sync with local storage
      const backendConsentsResult = await NDXService.getUserConsents();
      if (backendConsentsResult.success && backendConsentsResult.consents) {
        // Store all backend consents locally
        const consentMap: Record<string, NDXConsent> = {};
        for (const consent of backendConsentsResult.consents) {
          consentMap[consent.consentId] = consent;
          await NDXService.storeConsentLocally(consent);
        }
        setConsents(consentMap);
      } else {
        // Fallback to stored consents if backend fails
        const storedConsents = await NDXService.getStoredConsents();
        setConsents(storedConsents);
      }
    } catch (error) {
      console.error('Error loading consent data:', error);
      Alert.alert(t('common.error'), t('consent.consentFailedMessage'));
      
      // Fallback to stored consents
      const storedConsents = await NDXService.getStoredConsents();
      setConsents(storedConsents);
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
        // Fetch the created consent from backend to get full details
        const consentResult = await NDXService.getConsentStatus(result.consentId);
        
        if (consentResult.success && consentResult.consent) {
          // Store the pending consent locally
          await NDXService.storeConsentLocally(consentResult.consent);
        }

        Alert.alert(
          t('consent.alertRequestTitle'),
          t('consent.alertRequestMessage', { provider: provider.name, dataType }),
          [
            {
              text: t('consent.approveNow'),
              style: 'default',
              onPress: () => handleApproveConsent(result.consentId!),
            },
            { text: t('common.cancel'), style: 'cancel' },
          ]
        );
      } else {
        Alert.alert(t('consent.requestFailed'), result.message || t('consent.requestFailedMessage'));
      }
    } catch (error) {
      console.error('Error requesting consent:', error);
      Alert.alert(t('consent.requestError'), t('consent.requestErrorMessage'));
    }
  };

  const handleApproveConsent = async (consentId: string) => {
    try {
      const result = await NDXService.approveConsent(consentId);

      if (result.success) {
        // Fetch the updated consent from backend
        const consentResult = await NDXService.getConsentStatus(consentId);
        
        if (consentResult.success && consentResult.consent) {
          // Store the consent locally
          await NDXService.storeConsentLocally(consentResult.consent);
          
          Alert.alert(t('consent.consentGranted'), t('consent.consentGrantedMessage'));
          
          // Refresh consents from local storage
          const storedConsents = await NDXService.getStoredConsents();
          setConsents(storedConsents);
        } else {
          Alert.alert(t('consent.approvedTitle'), t('consent.approvedMessage'));
        }
      } else {
        Alert.alert(t('consent.approvalFailed'), result.message || t('consent.approvalFailedMessage'));
      }
      } catch (error) {
      console.error('Error approving consent:', error);
      Alert.alert(t('consent.approvalError'), t('consent.approvalErrorMessage'));
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    Alert.alert(
      t('consent.revokeTitle'),
      t('consent.revokeMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('consent.revokeConsent'),
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await NDXService.revokeConsent(consentId);

              if (result.success) {
                Alert.alert(t('consent.consentRevoked'), t('consent.consentRevokedMessage'));
                // Remove from local storage
                await NDXService.removeStoredConsent(consentId);
                // Refresh consents
                const storedConsents = await NDXService.getStoredConsents();
                setConsents(storedConsents);
              } else {
                Alert.alert(t('consent.revocationFailed'), result.message || t('consent.revocationFailedMessage'));
              }
            } catch (error) {
              console.error('Error revoking consent:', error);
              Alert.alert(t('consent.revocationError'), t('consent.revocationErrorMessage'));
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
            <Text style={[styles.loadingTitle, getTextStyle(language)]}>
              {t('consent.loading')}
            </Text>
            <Text style={[styles.loadingText, getTextStyle(language)]}>
              {t('consent.loadingSubtitle')}
            </Text>
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
              <Text style={[styles.title, getTextStyle(language)]}>
                {t('consent.title')}
              </Text>
              <Text style={[styles.subtitle, getTextStyle(language)]}>
                {t('consent.subtitle')}
              </Text>
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
            <Text style={styles.sectionTitle}>{t('consent.quickActions')}</Text>
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
                <Text style={styles.quickActionText}>{t('consent.quickActionsItems.emergency.title')}</Text>
                <Text style={styles.quickActionSubtext}>{t('consent.quickActionsItems.emergency.desc')}</Text>
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
                <Text style={styles.quickActionText}>{t('consent.quickActionsItems.weather.title')}</Text>
                <Text style={styles.quickActionSubtext}>{t('consent.quickActionsItems.weather.desc')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Available Providers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('consent.availableProviders')}</Text>
            <Text style={styles.sectionDescription}>{t('consent.providersDescription')}</Text>

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
                          {t('consent.providerServices', { count: provider.apis.length })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.apisList}>
                    <Text style={styles.apisTitle}>{t('consent.availableServices')}</Text>
                    <View style={styles.apiButtons}>
                      {provider.apis.map((api) => (
                        <TouchableOpacity
                          key={api}
                          style={styles.apiButton}
                          onPress={() => handleRequestConsent(provider, api)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.apiButtonText}>{t('consent.requestApi', { api })}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🏛️</Text>
                <Text style={styles.noDataText}>{t('consent.noProviders')}</Text>
                <Text style={styles.noDataSubtext}>{t('consent.noProvidersMessage')}</Text>
              </View>
            )}
          </View>

          {/* Active Consents Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('consent.activeConsents')}</Text>
            <Text style={styles.sectionDescription}>{t('consent.consentsDescription')}</Text>

            {Object.keys(consents).length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🔐</Text>
                <Text style={styles.noDataText}>{t('consent.noActiveConsents')}</Text>
                <Text style={styles.noDataSubtext}>{t('consent.noActiveConsentsMessage')}</Text>
                <TouchableOpacity style={styles.helpButton} onPress={() => {
                  Alert.alert(t('consent.aboutTitle'), t('consent.aboutMessage'));
                }}>
                  <Text style={styles.helpButtonText}>{t('consent.learnMore')}</Text>
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
                        <Text style={styles.consentDetailLabel}>{t('consent.detailPurpose')}</Text>
                        <Text style={styles.consentDetailValue}>{consent.purpose}</Text>
                      </View>
                    </View>

                    <View style={styles.consentDetailRow}>
                      <Text style={styles.consentDetailIcon}>📅</Text>
                      <View style={styles.consentDetailContent}>
                        <Text style={styles.consentDetailLabel}>{t('consent.detailCreated')}</Text>
                        <Text style={styles.consentDetailValue}>{formatDate(consent.createdAt)}</Text>
                      </View>
                    </View>

                    <View style={styles.consentDetailRow}>
                      <Text style={styles.consentDetailIcon}>⏰</Text>
                      <View style={styles.consentDetailContent}>
                        <Text style={styles.consentDetailLabel}>{t('consent.detailExpires')}</Text>
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
                      <Text style={styles.revokeButtonText}>{t('consent.revokeConsent')}</Text>
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
