import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useLanguage } from '../services/LanguageService';
import { API_BASE_URL } from '../config/api';

interface DonationHistoryScreenProps {
  navigation: any;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  orderId: string;
  transactionId: string;
  createdAt: string;
  description?: string;
}

interface DonorStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
}

const DonationHistoryScreen: React.FC<DonationHistoryScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [email, setEmail] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchDonorHistory = async (donorEmail: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/donations/donor/${encodeURIComponent(donorEmail)}`);
      const result = await response.json();

      if (result.success) {
        setDonations(result.data.donations || []);
        setDonorStats(result.data.stats || null);
        setSearchPerformed(true);
      } else {
        throw new Error(result.message || 'Failed to fetch donation history');
      }
    } catch (error: any) {
      console.error('Fetch donor history error:', error);
      Alert.alert(t('error'), error.message || t('failed_to_load_history'));
      setDonations([]);
      setDonorStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('error'), t('invalid_email'));
      return;
    }

    fetchDonorHistory(email.trim());
  };

  const onRefresh = () => {
    if (email.trim() && searchPerformed) {
      setRefreshing(true);
      fetchDonorHistory(email.trim());
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'FAILED':
        return '#e74c3c';
      case 'CANCELLED':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return t('successful');
      case 'PENDING':
        return t('pending');
      case 'FAILED':
        return t('failed');
      case 'CANCELLED':
        return t('cancelled');
      default:
        return status;
    }
  };

  const renderDonationItem = ({ item }: { item: Donation }) => (
    <View style={styles.donationItem}>
      <View style={styles.donationHeader}>
        <Text style={styles.donationAmount}>
          {item.currency} {item.amount.toLocaleString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.donationDate}>{formatDate(item.createdAt)}</Text>
      
      {item.description && (
        <Text style={styles.donationDescription}>{item.description}</Text>
      )}
      
      <View style={styles.donationDetails}>
        <Text style={styles.detailText}>{t('order_id')}: {item.orderId}</Text>
        <Text style={styles.detailText}>{t('transaction_id')}: {item.transactionId}</Text>
      </View>
    </View>
  );

  const renderStatsCard = () => {
    if (!donorStats) return null;

    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>{t('donation_summary')}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{donorStats.totalDonations}</Text>
            <Text style={styles.statLabel}>{t('total_donations')}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>LKR {donorStats.totalAmount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t('total_amount')}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>LKR {donorStats.averageDonation.toLocaleString()}</Text>
            <Text style={styles.statLabel}>{t('average_donation')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {searchPerformed ? t('no_donations_found') : t('enter_email_to_search')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('enter_email_address')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.disabledButton]}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>{t('search')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      {renderStatsCard()}

      {/* Donations List */}
      <FlatList
        data={donations}
        renderItem={renderDonationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  donationItem: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  donationAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  donationDate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  donationDescription: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  donationDetails: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default DonationHistoryScreen;
