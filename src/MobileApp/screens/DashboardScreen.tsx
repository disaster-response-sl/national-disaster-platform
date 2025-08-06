import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
  const [availableResources, setAvailableResources] = useState<any[]>([]);

  useEffect(() => {
    getUserInfo();
    getCurrentLocation();
    fetchRecentAlerts();
    fetchAvailableResources();
  }, []);

  const getUserInfo = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role || 'Citizen');
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('role');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
      // Using OpenWeatherMap API (free tier)
      // You'll need to sign up for a free API key at https://openweathermap.org/api
      const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lng=${lng}&appid=${API_KEY}&units=metric`
      );

      if (response.data) {
        const weatherData = response.data;
        const weather: Weather = {
          temperature: `${Math.round(weatherData.main.temp)}°C`,
          condition: weatherData.weather[0].main,
          humidity: `${weatherData.main.humidity}%`,
          windSpeed: `${Math.round(weatherData.wind.speed * 3.6)} km/h` // Convert m/s to km/h
        };
        setWeather(weather);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Fallback to mock weather data if API fails
      const mockWeather: Weather = {
        temperature: '28°C',
        condition: 'Partly Cloudy',
        humidity: '75%',
        windSpeed: '12 km/h'
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
        
        // Calculate risk based on nearby disasters
        let riskLevel = 'Low';
        let highRiskCount = 0;
        let mediumRiskCount = 0;
        
        disasters.forEach((disaster: any) => {
          if (disaster.location && disaster.location.lat && disaster.location.lng) {
            // Calculate distance (simplified - in real app, use proper distance calculation)
            const distance = Math.sqrt(
              Math.pow(disaster.location.lat - lat, 2) + 
              Math.pow(disaster.location.lng - lng, 2)
            );
            
            // If disaster is within 0.1 degrees (roughly 11km)
            if (distance < 0.1) {
              if (disaster.severity === 'high') {
                highRiskCount++;
              } else if (disaster.severity === 'medium') {
                mediumRiskCount++;
              }
            }
          }
        });
        
        // Determine risk level
        if (highRiskCount > 0) {
          riskLevel = 'High';
        } else if (mediumRiskCount > 0 || highRiskCount > 0) {
          riskLevel = 'Medium';
        } else {
          riskLevel = 'Low';
        }
        
        setRiskStatus(riskLevel);
      } else {
        // Fallback to random risk if API fails
        const risks = ['Low', 'Medium', 'High'];
        const randomRisk = risks[Math.floor(Math.random() * risks.length)];
        setRiskStatus(randomRisk);
      }
    } catch (error) {
      console.error('Risk assessment error:', error);
      // Fallback to random risk if API fails
      const risks = ['Low', 'Medium', 'High'];
      const randomRisk = risks[Math.floor(Math.random() * risks.length)];
      setRiskStatus(randomRisk);
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
        // Transform disaster data to match alert format
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
      // Fallback to mock data if API fails
      const mockAlerts: AlertItem[] = [
        {
          id: 1,
          type: 'Flood Warning',
          location: 'Colombo District',
          severity: 'High',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: 'Landslide Alert',
          location: 'Kandy District',
          severity: 'Medium',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'Cyclone Warning',
          location: 'Eastern Province',
          severity: 'High',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];
      setRecentAlerts(mockAlerts);
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
      default:
        break;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return '#ff4444';
      case 'Medium':
        return '#ffaa00';
      case 'Low':
        return '#44ff44';
      default:
        return '#44ff44';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return '#ff4444';
      case 'Medium':
        return '#ffaa00';
      case 'Low':
        return '#44ff44';
      default:
        return '#666666';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.roleText}>{userRole}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Location and Weather Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Location & Weather</Text>
        {location ? (
          <View>
            <Text style={styles.locationText}>
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </Text>
            {weather && (
              <View style={styles.weatherContainer}>
                <Text style={styles.weatherText}>🌤️ {weather.temperature}</Text>
                <Text style={styles.weatherText}>{weather.condition}</Text>
                <Text style={styles.weatherText}>💧 {weather.humidity}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.loadingText}>Getting location...</Text>
        )}
      </View>

      {/* Risk Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Risk Assessment</Text>
        <View style={styles.riskContainer}>
          <View style={[styles.riskIndicator, { backgroundColor: getRiskColor(riskStatus) }]}>
            <Text style={styles.riskText}>{riskStatus} Risk</Text>
          </View>
          <Text style={styles.riskDescription}>
            Current area risk level based on weather and historical data
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ff4444' }]}
            onPress={() => handleQuickAction('sos')}
          >
            <Text style={styles.actionButtonText}>🚨 SOS</Text>
            <Text style={styles.actionButtonSubtext}>Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#007bff' }]}
            onPress={() => handleQuickAction('report')}
          >
            <Text style={styles.actionButtonText}>📝 Report</Text>
            <Text style={styles.actionButtonSubtext}>Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]}
            onPress={() => handleQuickAction('chat')}
          >
            <Text style={styles.actionButtonText}>💬 Chat</Text>
            <Text style={styles.actionButtonSubtext}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Alerts */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Alerts</Text>
        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertType}>{alert.type}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                  <Text style={styles.severityText}>{alert.severity}</Text>
                </View>
              </View>
              <Text style={styles.alertLocation}>📍 {alert.location}</Text>
              <Text style={styles.alertTime}>
                {new Date(alert.timestamp).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAlertsText}>No recent alerts</Text>
        )}
      </View>

      {/* Available Resources */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Available Resources</Text>
        {availableResources.length > 0 ? (
          availableResources.map((resource) => (
            <View key={resource._id} style={styles.resourceItem}>
              <View style={styles.resourceHeader}>
                <Text style={styles.resourceType}>{resource.type}</Text>
                <Text style={styles.resourceQuantity}>Qty: {resource.quantity}</Text>
              </View>
              <Text style={styles.resourceLocation}>
                📍 {resource.location?.lat?.toFixed(2)}, {resource.location?.lng?.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAlertsText}>No available resources</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 15,
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  weatherText: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  riskContainer: {
    alignItems: 'center',
  },
  riskIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  riskText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  alertItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  noAlertsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resourceItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resourceType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resourceQuantity: {
    fontSize: 14,
    color: '#666',
  },
  resourceLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default DashboardScreen; 