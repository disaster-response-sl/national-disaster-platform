// components/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  StatusBar,
  Dimensions,
  Image
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

interface Location {
  lat: number;
  lng: number;
}

interface Weather {
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
}

interface AlertItem {
  id: number;
  type: string;
  location: string;
  severity: string;
  timestamp: string;
}

interface NavigationProps {
  navigation: any;
}

const DashboardScreen = ({ navigation }: NavigationProps) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [riskStatus, setRiskStatus] = useState<string>('Low');
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('User');
  const [availableResources, setAvailableResources] = useState<any[]>([]);

  // ... (keep all the existing functions unchanged)
  useEffect(() => {
    getUserInfo();
    getCurrentLocation();
    fetchRecentAlerts();
    fetchAvailableResources();
  }, []);

  const getUserInfo = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      const userId = await AsyncStorage.getItem('userId');
      setUserRole(role || 'citizen');
      setUserName('SafeLanka User');
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('role');
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        fetchWeatherData(latitude, longitude);
        fetchRiskStatus(latitude, longitude);
      },
      error => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchWeatherData = async (lat: number, lng: number) => {
    try {
      const API_KEY = 'ef2e48a91b8c1c679ab689747a5bc8a1';
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`
      );

      if (response.data) {
        const weatherData = response.data;
        const weather: Weather = {
          temperature: `${Math.round(weatherData.main.temp)}°C`,
          condition: weatherData.weather[0].main,
          humidity: `${weatherData.main.humidity}%`,
          windSpeed: `${Math.round(weatherData.wind.speed * 3.6)} km/h`
        };
        setWeather(weather);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      const mockWeather: Weather = {
        temperature: '24°C',
        condition: 'Clear',
        humidity: '68%',
        windSpeed: '6 km/h'
      };
      setWeather(mockWeather);
    }
  };

  const fetchRiskStatus = async (lat: number, lng: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://10.0.2.2:5000/api/mobile/disasters', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const disasters = response.data.data;

        let riskLevel = 'Low';
        let highRiskCount = 0;
        let mediumRiskCount = 0;

        disasters.forEach((disaster: any) => {
          if (disaster.location && disaster.location.lat && disaster.location.lng) {
            const distance = Math.sqrt(
              Math.pow(disaster.location.lat - lat, 2) +
              Math.pow(disaster.location.lng - lng, 2)
            );

            if (distance < 0.1) {
              if (disaster.severity === 'high') {
                highRiskCount++;
              } else if (disaster.severity === 'medium') {
                mediumRiskCount++;
              }
            }
          }
        });

        if (highRiskCount > 0) {
          riskLevel = 'High';
        } else if (mediumRiskCount > 0 || highRiskCount > 0) {
          riskLevel = 'Medium';
        } else {
          riskLevel = 'Low';
        }

        setRiskStatus(riskLevel);
      } else {
        setRiskStatus('Low');
      }
    } catch (error) {
      console.error('Risk assessment error:', error);
      setRiskStatus('Low');
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://10.0.2.2:5000/api/mobile/disasters', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const disasters = response.data.data.map((disaster: any) => ({
          id: disaster._id,
          type: disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1) + ' Alert',
          location: `${disaster.location?.lat?.toFixed(2)}, ${disaster.location?.lng?.toFixed(2)}`,
          severity: disaster.severity,
          timestamp: disaster.timestamp,
          description: disaster.description
        }));
        setRecentAlerts(disasters);
      }
    } catch (error) {
      console.error('Alerts fetch error:', error);
      setRecentAlerts([]);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get('http://10.0.2.2:5000/api/mobile/resources', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAvailableResources(response.data.data);
      }
    } catch (error) {
      console.error('Resources fetch error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    getCurrentLocation();
    fetchRecentAlerts();
    fetchAvailableResources();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'sos':
        navigation.navigate('Sos');
        break;
      case 'report':
        navigation.navigate('Report');
        break;
      case 'chat':
        navigation.navigate('Chat');
        break;
      case 'riskmap':
        navigation.navigate('RiskMap');
        break;
      case 'consent':
        navigation.navigate('ConsentManagement');
        break;
      default:
        break;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return '#ef4444';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#10b981';
      default:
        return '#10b981';
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <ScrollView
        style={styles.container}
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
        {/* Clean Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarIcon}>👤</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userNameText}>{userName}</Text>
                <Text style={styles.roleText}>{userRole}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>➡️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Location Section */}
        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>📍 Current Location</Text>
          {location ? (
            <View style={styles.locationContent}>
              <View style={styles.coordinateRow}>
                <Text style={styles.coordinateLabel}>Latitude:</Text>
                <Text style={styles.coordinateValue}>{location.lat.toFixed(6)}</Text>
              </View>
              <View style={styles.coordinateRow}>
                <Text style={styles.coordinateLabel}>Longitude:</Text>
                <Text style={styles.coordinateValue}>{location.lng.toFixed(6)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.loadingText}>Getting location...</Text>
          )}
        </View>

        {/* Weather & Risk Status Row */}
        <View style={styles.statusRow}>
          {/* Weather Card */}
          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>☀️ Weather</Text>
            {weather ? (
              <View style={styles.weatherContent}>
                <Text style={styles.mainWeatherText}>{weather.temperature}</Text>
                <Text style={styles.weatherCondition}>{weather.condition}</Text>
                <View style={styles.weatherDetails}>
                  <Text style={styles.weatherDetail}>💧 {weather.humidity}</Text>
                  <Text style={styles.weatherDetail}>💨 {weather.windSpeed}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>

          {/* Risk Status Card */}
          <View style={styles.statusCard}>
            <Text style={styles.statusCardTitle}>🛡️ Risk Status</Text>
            <View style={styles.riskContent}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskStatus) }]}>
                <Text style={styles.riskText}>{riskStatus}</Text>
              </View>
              <Text style={styles.riskDescription}>Current area risk level</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={() => handleQuickAction('sos')}
            >
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={styles.actionText}>Emergency SOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => handleQuickAction('report')}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>Report Incident</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => handleQuickAction('riskmap')}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionText}>View Map</Text>
            </TouchableOpacity>

             <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                  onPress={() => handleQuickAction('chat')}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={styles.actionText}>Emergency Chat</Text>
                </TouchableOpacity>

                {/* Added Consent/Privacy Action */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
                  onPress={() => handleQuickAction('consent')}
                >
                  <Text style={styles.actionIcon}>🔐</Text>
                  <Text style={styles.actionText}>Privacy Settings</Text>
                </TouchableOpacity>
          </View>
        </View>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>🚨 Recent Alerts</Text>
            <View style={styles.alertsList}>
              {recentAlerts.slice(0, 2).map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertType}>{alert.type}</Text>
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                  </View>
                  <View style={styles.alertSeverity}>
                    <Text style={[styles.severityText, { color: getRiskColor(alert.severity) }]}>
                      {alert.severity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  roleText: {
    fontSize: 12,
    color: '#bfdbfe',
    textTransform: 'capitalize',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 20,
    color: '#ffffff',
  },
  locationSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  locationContent: {
    gap: 8,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  weatherContent: {
    alignItems: 'center',
  },
  mainWeatherText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  weatherDetails: {
    gap: 2,
  },
  weatherDetail: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  riskContent: {
    alignItems: 'center',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  riskDescription: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActionsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  alertsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  alertLocation: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertSeverity: {
    marginLeft: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 24,
  },
});

export default DashboardScreen;
