import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Disaster {
  _id: string;
  type: 'flood' | 'landslide' | 'cyclone';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  status: 'active' | 'resolved';
}

interface RiskMapScreenProps {
  navigation: any;
}

const RiskMapScreen: React.FC<RiskMapScreenProps> = ({ navigation }) => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [showAllDisasters, setShowAllDisasters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch disasters from backend
  const fetchDisasters = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/mobile/disasters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const fetchedDisasters = response.data;
      setDisasters(fetchedDisasters);
      
      // Cache the data for offline use
      await AsyncStorage.setItem('cachedDisasters', JSON.stringify(fetchedDisasters));
      await AsyncStorage.setItem('disastersCacheTime', new Date().toISOString());
      
      setOfflineMode(false);
    } catch (error) {
      console.error('Error fetching disasters:', error);
      // Try to load cached data
      await loadCachedDisasters();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load cached disasters for offline mode
  const loadCachedDisasters = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('cachedDisasters');
      const cacheTime = await AsyncStorage.getItem('disastersCacheTime');
      
      if (cachedData && cacheTime) {
        const parsedDisasters = JSON.parse(cachedData);
        const cacheAge = new Date().getTime() - new Date(cacheTime).getTime();
        const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (cacheAge < maxCacheAge) {
          setDisasters(parsedDisasters);
          setOfflineMode(true);
          Alert.alert('Offline Mode', 'Showing cached disaster data. Some data may be outdated.');
        } else {
          Alert.alert('Cache Expired', 'Cached data is too old. Please check your internet connection.');
        }
      } else {
        Alert.alert('No Cached Data', 'No offline data available. Please check your internet connection.');
      }
    } catch (error) {
      console.error('Error loading cached disasters:', error);
      Alert.alert('Cache Error', 'Unable to load cached disaster data.');
    }
  };

  // Get disaster icon based on type
  const getDisasterIcon = (type: string) => {
    switch (type) {
      case 'flood':
        return '🌊';
      case 'landslide':
        return '⛰️';
      case 'cyclone':
        return '🌀';
      default:
        return '⚠️';
    }
  };

  // Get risk color based on severity
  const getRiskColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#44ff44';
      default:
        return '#666666';
    }
  };

  // Filter disasters based on showAllDisasters toggle
  const filteredDisasters = showAllDisasters 
    ? disasters 
    : disasters.filter(disaster => disaster.status === 'active');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDisasters();
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Risk Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Risk Map</Text>
        <View style={styles.controls}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Show All Disasters</Text>
            <Switch
              value={showAllDisasters}
              onValueChange={setShowAllDisasters}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={showAllDisasters ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          {offlineMode && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>📱 Offline</Text>
            </View>
          )}
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>🗺️ Interactive Map</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Map functionality will be implemented with react-native-maps
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Currently showing disaster list view
        </Text>
      </View>

      {/* Disaster List */}
      <ScrollView 
        style={styles.disasterList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>
          {showAllDisasters ? 'All Disasters' : 'Active Disasters'} ({filteredDisasters.length})
        </Text>
        
        {filteredDisasters.length > 0 ? (
          filteredDisasters.map((disaster) => (
            <View key={disaster._id} style={styles.disasterItem}>
              <View style={styles.disasterHeader}>
                <Text style={styles.disasterIcon}>{getDisasterIcon(disaster.type)}</Text>
                <View style={styles.disasterInfo}>
                  <Text style={styles.disasterType}>
                    {disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}
                  </Text>
                  <Text style={styles.disasterDescription}>{disaster.description}</Text>
                </View>
                <View style={[styles.severityBadge, { backgroundColor: getRiskColor(disaster.severity) }]}>
                  <Text style={styles.severityText}>{disaster.severity}</Text>
                </View>
              </View>
              
              <View style={styles.disasterDetails}>
                <Text style={styles.locationText}>
                  📍 {disaster.location.lat.toFixed(4)}, {disaster.location.lng.toFixed(4)}
                </Text>
                <Text style={styles.timeText}>
                  ⏰ {new Date(disaster.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.statusText}>
                  Status: {disaster.status}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No disasters found</Text>
            <Text style={styles.noDataSubtext}>
              {showAllDisasters ? 'No disasters in the system' : 'No active disasters'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Risk Levels</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ff4444' }]} />
          <Text style={styles.legendText}>High Risk</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ffaa00' }]} />
          <Text style={styles.legendText}>Medium Risk</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#44ff44' }]} />
          <Text style={styles.legendText}>Low Risk</Text>
        </View>
      </View>

      {/* Refresh button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchDisasters}>
        <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
      </TouchableOpacity>
    </View>
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  offlineIndicator: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  mapPlaceholder: {
    backgroundColor: '#e8f4fd',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d0e7f7',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  disasterList: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  disasterItem: {
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
  disasterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  disasterIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  disasterInfo: {
    flex: 1,
  },
  disasterType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  disasterDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  disasterDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
  },
  legend: {
    position: 'absolute',
    bottom: 80,
    right: 15,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RiskMapScreen;
