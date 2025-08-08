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
} from 'react-native';
import NDXService, { NDXProvider, NDXConsent } from '../services/NDXService';

interface ConsentManagementScreenProps {
  navigation: any;
}

const ConsentManagementScreen: React.FC<ConsentManagementScreenProps> = ({ navigation }) => {
  const [providers, setProviders] = useState<NDXProvider[]>([]);
  const [consents, setConsents] = useState<Record<string, NDXConsent>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
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
      Alert.alert('Error', 'Failed to load consent data');
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
          'Consent Requested',
          `Consent requested for ${provider.name} - ${dataType}. Please approve to continue.`,
          [
            {
              text: 'Approve Now',
              onPress: () => handleApproveConsent(result.consentId!),
            },
            { text: 'Later', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to request consent');
      }
    } catch (error) {
      console.error('Error requesting consent:', error);
      Alert.alert('Error', 'Failed to request consent');
    }
  };

  const handleApproveConsent = async (consentId: string) => {
    try {
      const result = await NDXService.approveConsent(consentId);
      
      if (result.success) {
        Alert.alert('Success', 'Consent approved successfully');
        // Refresh consents
        const storedConsents = await NDXService.getStoredConsents();
        setConsents(storedConsents);
      } else {
        Alert.alert('Error', result.message || 'Failed to approve consent');
      }
    } catch (error) {
      console.error('Error approving consent:', error);
      Alert.alert('Error', 'Failed to approve consent');
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    Alert.alert(
      'Revoke Consent',
      'Are you sure you want to revoke this consent? This will stop data sharing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await NDXService.revokeConsent(consentId);
              
              if (result.success) {
                Alert.alert('Success', 'Consent revoked successfully');
                // Remove from local storage
                await NDXService.removeStoredConsent(consentId);
                // Refresh consents
                const storedConsents = await NDXService.getStoredConsents();
                setConsents(storedConsents);
              } else {
                Alert.alert('Error', result.message || 'Failed to revoke consent');
              }
            } catch (error) {
              console.error('Error revoking consent:', error);
              Alert.alert('Error', 'Failed to revoke consent');
            }
          },
        },
      ]
    );
  };

  const getConsentStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'REVOKED':
        return '#F44336';
      case 'EXPIRED':
        return '#9E9E9E';
      default:
        return '#666666';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Consent Management...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Data Sharing Consent</Text>
        <Text style={styles.subtitle}>
          Manage your data sharing permissions with government agencies
        </Text>
      </View>

      {/* Available Providers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Data Providers</Text>
        {providers.map((provider) => (
          <View key={provider.id} style={styles.providerCard}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerApis}>
              APIs: {provider.apis.join(', ')}
            </Text>
            <View style={styles.apiButtons}>
              {provider.apis.map((api) => (
                <TouchableOpacity
                  key={api}
                  style={styles.apiButton}
                  onPress={() => handleRequestConsent(provider, api)}
                >
                  <Text style={styles.apiButtonText}>Request {api}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Active Consents Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Active Consents</Text>
        {Object.keys(consents).length === 0 ? (
          <View style={styles.noConsentsContainer}>
            <Text style={styles.noConsentsText}>No active consents</Text>
            <Text style={styles.noConsentsSubtext}>
              Request data sharing permissions from providers above
            </Text>
          </View>
        ) : (
          Object.values(consents).map((consent) => (
            <View key={consent.consentId} style={styles.consentCard}>
              <View style={styles.consentHeader}>
                <Text style={styles.consentProvider}>{consent.dataProvider}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getConsentStatusColor(consent.status) }]}>
                  <Text style={styles.statusText}>{consent.status}</Text>
                </View>
              </View>
              
              <Text style={styles.consentDetails}>
                <Text style={styles.consentLabel}>Data Type:</Text> {consent.dataType}
              </Text>
              <Text style={styles.consentDetails}>
                <Text style={styles.consentLabel}>Purpose:</Text> {consent.purpose}
              </Text>
              <Text style={styles.consentDetails}>
                <Text style={styles.consentLabel}>Created:</Text> {formatDate(consent.createdAt)}
              </Text>
              <Text style={styles.consentDetails}>
                <Text style={styles.consentLabel}>Expires:</Text> {formatDate(consent.expiresAt)}
              </Text>

              {consent.status === 'APPROVED' && (
                <TouchableOpacity
                  style={styles.revokeButton}
                  onPress={() => handleRevokeConsent(consent.consentId)}
                >
                  <Text style={styles.revokeButtonText}>Revoke Consent</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              // Request disaster data consent
              const disasterProvider = providers.find(p => p.id === 'disaster-management');
              if (disasterProvider) {
                handleRequestConsent(disasterProvider, 'disasters');
              }
            }}
          >
            <Text style={styles.quickActionText}>📊 Disaster Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              // Request weather data consent
              const weatherProvider = providers.find(p => p.id === 'weather-service');
              if (weatherProvider) {
                handleRequestConsent(weatherProvider, 'weather-alerts');
              }
            }}
          >
            <Text style={styles.quickActionText}>🌦️ Weather Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  providerApis: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  apiButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  apiButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  apiButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noConsentsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  noConsentsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  noConsentsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  consentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  consentProvider: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  consentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  consentLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  revokeButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  revokeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ConsentManagementScreen;
