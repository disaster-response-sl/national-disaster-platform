import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../services/LanguageService';
import { API_BASE_URL } from '../config/api';

interface DonationStatsScreenProps {
  navigation: any;
}

interface DonationStats {
  summary: {
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    uniqueDonors: number;
  };
  statusBreakdown: {
    SUCCESS: number;
    PENDING: number;
    FAILED: number;
    CANCELLED: number;
  };
  recentActivity: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}

const { width } = Dimensions.get('window');

const DonationStatsScreen: React.FC<DonationStatsScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DonationStats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/donations/stats`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      console.error('Fetch stats error:', error);
      Alert.alert(t('error'), error.message || t('failed_to_load_stats'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
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

  const getStatusPercentage = (count: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const renderSummaryCard = () => {
    if (!stats) return null;

    const { summary } = stats;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('donation_summary')}</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalDonations.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t('total_donations')}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>LKR {summary.totalAmount.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t('total_amount')}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>LKR {summary.averageDonation.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t('average_donation')}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.uniqueDonors.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>{t('unique_donors')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatusBreakdown = () => {
    if (!stats) return null;

    const { statusBreakdown } = stats;
    const totalDonations = Object.values(statusBreakdown).reduce((sum, count) => sum + count, 0);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('status_breakdown')}</Text>
        
        {Object.entries(statusBreakdown).map(([status, count]) => {
          const percentage = getStatusPercentage(count, totalDonations);
          
          return (
            <View key={status} style={styles.statusItem}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusLabel}>{t(status.toLowerCase())}</Text>
                <Text style={styles.statusCount}>{count} ({percentage}%)</Text>
              </View>
              
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: getStatusColor(status),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderRecentActivity = () => {
    if (!stats || stats.recentActivity.length === 0) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('recent_activity')} (7 {t('days')})</Text>
        
        {stats.recentActivity.map((activity, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityDate}>
              <Text style={styles.activityDateText}>
                {new Date(activity.date).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.activityData}>
              <Text style={styles.activityCount}>
                {activity.count} {t('donations')}
              </Text>
              <Text style={styles.activityAmount}>
                LKR {activity.amount.toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>{t('loading_stats')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3498db']}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('donation_statistics')}</Text>
        <Text style={styles.subtitle}>{t('overview_of_all_donations')}</Text>
      </View>

      {renderSummaryCard()}
      {renderStatusBreakdown()}
      {renderRecentActivity()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
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
    color: '#7f8c8d',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 15,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statusItem: {
    marginBottom: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  activityDate: {
    flex: 1,
  },
  activityDateText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activityData: {
    alignItems: 'flex-end',
  },
  activityCount: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  activityAmount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default DonationStatsScreen;
