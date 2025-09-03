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
  Image,
  Platform,
  PermissionsAndroid
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NotificationService from '../services/NotificationService';
import BackgroundNotificationService from '../services/BackgroundNotificationService';
import { API_BASE_URL } from '../config/api';
import { useLanguage } from '../services/LanguageService';
import { getTextStyle } from '../services/FontService';
import LanguageSwitcher from '../components/LanguageSwitcher';

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
  const { t, language } = useLanguage();
  const [location, setLocation] = useState<Location | null>(null);
  const [locationName, setLocationName] = useState<string>('Unknown');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [riskStatus, setRiskStatus] = useState<string>('Low');
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('User');
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  // Request notification permissions
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: t('notifications.permission'),
            message: t('notifications.permissionMessage'),
            buttonNeutral: t('notifications.askLater'),
            buttonNegative: t('logout.cancel'),
            buttonPositive: t('notifications.ok'),
          }
        );
        const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        setNotificationPermission(hasPermission);
        console.log('📱 Notification permission:', hasPermission ? 'Granted' : 'Denied');
        return hasPermission;
      } catch (err) {
        console.warn('Error requesting notification permission:', err);
        return false;
      }
    } else {
      // For iOS, you would typically use @react-native-async-storage/async-storage
      // or react-native-push-notification
      setNotificationPermission(true);
      return true;
    }
  };

  // Send local notification using NotificationService
  const sendLocalNotification = async (title: string, message: string, type: 'high' | 'medium' | 'low' = 'high') => {
    console.log(`📢 Sending ${type} notification:`, title, message);
    
    // Use the new notification service for proper background notifications
    await NotificationService.sendLocalNotification(title, message, type, {
      timestamp: new Date().toISOString(),
      location: locationName,
    });

    // Store notification in AsyncStorage for notification history
    storeNotificationHistory(title, message, type);
  };

  // Store notification history
  const storeNotificationHistory = async (title: string, message: string, type: string) => {
    try {
      const existingHistory = await AsyncStorage.getItem('notificationHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const newNotification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      history.unshift(newNotification); // Add to beginning
      
      // Keep only last 50 notifications
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(history));
      console.log('💾 Notification stored in history');
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  };

  // ... (keep all the existing functions unchanged)
  useEffect(() => {
    getUserInfo();
    requestNotificationPermission();
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
      t('logout.confirm'),
      t('logout.message'),
      [
        { text: t('logout.cancel'), style: 'cancel' },
        {
          text: t('logout.logout'),
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
    // Sri Lanka location presets for testing/fallback
    const SRI_LANKA_LOCATIONS = {
      malabe: { lat: 6.9056, lng: 79.958, name: 'Malabe' },
      colombo: { lat: 6.9271, lng: 79.8612, name: 'Colombo' },
      negombo: { lat: 7.2008, lng: 79.8737, name: 'Negombo' },
      ratnapura: { lat: 6.6847, lng: 80.4025, name: 'Ratnapura' },
      kandy: { lat: 7.2906, lng: 80.6337, name: 'Kandy' },
      galle: { lat: 6.0535, lng: 80.2210, name: 'Galle' },
      jaffna: { lat: 9.6615, lng: 80.0255, name: 'Jaffna' },
      trincomalee: { lat: 8.5874, lng: 81.2152, name: 'Trincomalee' }
    };

    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log('📍 GPS Location detected:', latitude, longitude);
        
        // Check if we're in Sri Lanka (lat: 5.9-9.9, lng: 79.5-81.9)
        const isInSriLanka = (latitude >= 5.9 && latitude <= 9.9) && 
                            (longitude >= 79.5 && longitude <= 81.9);
        
        if (!isInSriLanka) {
          console.warn('⚠️ GPS shows location outside Sri Lanka');
          setLocation({ lat: latitude, lng: longitude });
          setLocationName(`Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`);
          // Optionally, you can call fetchWeatherData/fetchRiskStatus here if you want to show info for out-of-SL locations
        } else {
          // Valid Sri Lankan location
          console.log('✅ Valid Sri Lankan location detected');
          setLocation({ lat: latitude, lng: longitude });
          setLocationName('Sri Lanka');
          fetchWeatherData(latitude, longitude);
          fetchRiskStatus(latitude, longitude);
        }
      },
      error => {
        console.error('Location error:', error);
        console.log('🧪 GPS failed, using default Sri Lanka location (Colombo)');
        
        // Use default Colombo location when GPS fails
        const defaultLocation = { lat: 6.9271, lng: 79.8612 };
        setLocation(defaultLocation);
        setLocationName('Colombo (Default)');
        
        // Still fetch weather and risk data for default location
        fetchWeatherData(defaultLocation.lat, defaultLocation.lng);
        fetchRiskStatus(defaultLocation.lat, defaultLocation.lng);
        
        // Optional: Show a brief toast instead of intrusive alert
        console.log('📍 Using default location due to GPS timeout');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  const useTestLocation = (locationData: any) => {
    console.log(`🧪 Using test location: ${locationData.name}`, locationData);
    setLocation({ lat: locationData.lat, lng: locationData.lng });
    setLocationName(locationData.name);
    fetchWeatherData(locationData.lat, locationData.lng);
    fetchRiskStatus(locationData.lat, locationData.lng);
  };

  const showMoreLocations = (locations: any) => {
    Alert.alert(
      t('location.moreTitle'),
      t('location.moreMessage'),
      [
        { text: 'Kandy', onPress: () => useTestLocation(locations.kandy) },
        { text: 'Galle', onPress: () => useTestLocation(locations.galle) },
        { text: 'Jaffna', onPress: () => useTestLocation(locations.jaffna) },
        { text: 'Trincomalee', onPress: () => useTestLocation(locations.trincomalee) },
        { text: t('common.cancel'), style: 'cancel' }
      ]
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
      // TEMPORARY FIX: Use test token if no token is stored (same as RiskMapScreen)
      let token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found, using test token for risk assessment');
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ0ZXN0LXVzZXItMTIzIiwiaW5kaXZpZHVhbElkIjoidGVzdC11c2VyLTEyMyIsInJvbGUiOiJDaXRpemVuIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NTk0NzExNSwiZXhwIjoxNzU2MDMzNTE1fQ.KvJrjN-i0lDKIHf8GnQLMMRWb1cFjxpVfcnkdI8lXPI';
        await AsyncStorage.setItem('authToken', token);
      }

      console.log('🔍 Assessing risk for location:', lat, lng);
      
      const response = await axios.get(`${API_BASE_URL}/mobile/disasters`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const disasters = response.data.data;
        console.log('📊 Found disasters for risk assessment:', disasters.length);

        let riskLevel = 'Low';
        let highRiskCount = 0;
        let mediumRiskCount = 0;
        let lowRiskCount = 0;

        // Function to calculate distance between two points in kilometers
        const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
          const R = 6371; // Earth's radius in kilometers
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLng = (lng2 - lng1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        disasters.forEach((disaster: any) => {
          if (disaster.location && disaster.location.lat && disaster.location.lng) {
            const distance = calculateDistance(
              lat, lng, 
              disaster.location.lat, disaster.location.lng
            );

            console.log(`📍 Disaster ${disaster.type} at ${disaster.location.lat}, ${disaster.location.lng}`);
            console.log(`📏 Distance: ${distance.toFixed(2)}km, Severity: ${disaster.severity}`);

            // Consider disasters within 20km as affecting the area
            if (distance < 20) {
              if (disaster.severity === 'high') {
                highRiskCount++;
                console.log('🔴 High risk disaster nearby!');
              } else if (disaster.severity === 'medium') {
                mediumRiskCount++;
                console.log('🟡 Medium risk disaster nearby');
              } else if (disaster.severity === 'low') {
                lowRiskCount++;
                console.log('🟢 Low risk disaster nearby');
              }
            }
          }
        });

        // Determine risk level based on nearby disasters
        if (highRiskCount > 0) {
          riskLevel = 'High';
          console.log('🚨 RISK LEVEL: HIGH due to', highRiskCount, 'high-severity disasters');
        } else if (mediumRiskCount > 0) {
          riskLevel = 'Medium';
          console.log('⚠️ RISK LEVEL: MEDIUM due to', mediumRiskCount, 'medium-severity disasters');
        } else if (lowRiskCount > 0) {
          riskLevel = 'Medium'; // Even low-severity disasters can elevate risk from Low
          console.log('⚠️ RISK LEVEL: MEDIUM due to', lowRiskCount, 'low-severity disasters');
        } else {
          riskLevel = 'Low';
          console.log('✅ RISK LEVEL: LOW - no disasters nearby');
        }

        console.log('🛡️ Final risk assessment:', riskLevel);
        setRiskStatus(riskLevel);
        
        // Send appropriate notifications based on risk level
        if (riskLevel === 'High') {
          const highRiskDisasters = disasters.filter((d: any) => {
            if (d.location && d.location.lat && d.location.lng && d.severity === 'high') {
              const distance = calculateDistance(lat, lng, d.location.lat, d.location.lng);
              return distance < 20;
            }
            return false;
          });
          
          const disasterTypes = highRiskDisasters.map((d: any) => d.type).join(', ');
          const nearestDisaster = highRiskDisasters.sort((a: any, b: any) => {
            const distA = calculateDistance(lat, lng, a.location.lat, a.location.lng);
            const distB = calculateDistance(lat, lng, b.location.lat, b.location.lng);
            return distA - distB;
          })[0];
          
          const distance = calculateDistance(lat, lng, nearestDisaster.location.lat, nearestDisaster.location.lng);
          
          sendLocalNotification(
            t('notifications.highRisk'),
            `You are ${distance.toFixed(1)}km from a ${nearestDisaster.type} (${nearestDisaster.severity} severity). Multiple disasters detected: ${disasterTypes}. Please stay alert and follow safety guidelines.`,
            'high'
          );
          
          console.log('🚨 HIGH RISK NOTIFICATION SENT');
          
        } else if (riskLevel === 'Medium') {
          const mediumRiskDisasters = disasters.filter((d: any) => {
            if (d.location && d.location.lat && d.location.lng) {
              const distance = calculateDistance(lat, lng, d.location.lat, d.location.lng);
              return distance < 20 && (d.severity === 'medium' || d.severity === 'low');
            }
            return false;
          });
          
          if (mediumRiskDisasters.length > 0) {
            const nearestDisaster = mediumRiskDisasters[0];
            const distance = calculateDistance(lat, lng, nearestDisaster.location.lat, nearestDisaster.location.lng);
            
            sendLocalNotification(
              t('notifications.mediumRisk'),
              `You are ${distance.toFixed(1)}km from a ${nearestDisaster.type} (${nearestDisaster.severity} severity). Please stay informed about local conditions.`,
              'medium'
            );
            
            console.log('⚠️ MEDIUM RISK NOTIFICATION SENT');
          }
        } else {
          console.log('✅ Low risk area - no immediate alerts needed');
        }
      } else {
        console.error('❌ API returned unsuccessful response');
        setRiskStatus('Low');
      }
    } catch (error) {
      console.error('❌ Risk assessment error:', error);
      console.log('📱 Using default risk status (backend unavailable)');
      setRiskStatus('Medium'); // Default to medium risk when backend is unavailable
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      // TEMPORARY FIX: Use test token if no token is stored
      let token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token found, using test token for alerts');
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ0ZXN0LXVzZXItMTIzIiwiaW5kaXZpZHVhbElkIjoidGVzdC11c2VyLTEyMyIsInJvbGUiOiJDaXRpemVuIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTc1NTk0NzExNSwiZXhwIjoxNzU2MDMzNTE1fQ.KvJrjN-i0lDKIHf8GnQLMMRWb1cFjxpVfcnkdI8lXPI';
        await AsyncStorage.setItem('authToken', token);
      }

      const response = await axios.get(`${API_BASE_URL}/mobile/disasters`, {
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
      console.log('📱 Using mock alerts data (backend unavailable)');
      
      // Provide mock data when backend is unavailable
      const mockAlerts: AlertItem[] = [
        {
          id: 1,
          type: 'Weather Alert',
          location: 'Colombo District',
          severity: 'medium',
          timestamp: new Date().toISOString()
        },
        {
          id: 2, 
          type: 'Flood Alert',
          location: 'Galle District',
          severity: 'high',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setRecentAlerts(mockAlerts);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/mobile/resources`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAvailableResources(response.data.data);
      }
    } catch (error) {
      console.error('Resources fetch error:', error);
      console.log('📱 Using mock resources data (backend unavailable)');
      
      // Provide mock data when backend is unavailable
      const mockResources = [
        {
          id: 1,
          name: 'Emergency Shelter - Colombo',
          type: 'Shelter',
          location: 'Colombo 07',
          availability: 'Available',
          capacity: 100,
          contact: '+94 11 123 4567'
        },
        {
          id: 2,
          name: 'Medical Clinic - Galle',
          type: 'Medical',
          location: 'Galle Fort',
          availability: 'Available',
          capacity: 50,
          contact: '+94 91 234 5678'
        },
        {
          id: 3,
          name: 'Food Distribution Center',
          type: 'Food',
          location: 'Kandy',
          availability: 'Limited',
          capacity: 200,
          contact: '+94 81 345 6789'
        }
      ];
      
      setAvailableResources(mockResources);
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
      case 'donation':
        navigation.navigate('MPGSDonation');
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
                <Text style={[styles.welcomeText, getTextStyle(language, 14)]}>
                  {t('welcome.back')}
                </Text>
                <Text style={[styles.userNameText, getTextStyle(language, 18)]}>
                  {t('welcome.user')}
                </Text>
                <Text style={[styles.roleText, getTextStyle(language, 12)]}>
                  {userRole}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <LanguageSwitcher compact={true} />
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>➡️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Current Location Section */}
        <View style={styles.locationSection}>
          <Text style={[styles.sectionTitle, getTextStyle(language, 16)]}>
            {t('location.current')}
          </Text>
          {location ? (
            <View style={styles.locationContent}>
              <View style={styles.coordinateRow}>
                <Text style={[styles.coordinateLabel, getTextStyle(language, 14)]}>
                  {t('location.latitude')}
                </Text>
                <Text style={styles.coordinateValue}>{location.lat.toFixed(6)}</Text>
              </View>
              <View style={styles.coordinateRow}>
                <Text style={[styles.coordinateLabel, getTextStyle(language, 14)]}>
                  {t('location.longitude')}
                </Text>
                <Text style={styles.coordinateValue}>{location.lng.toFixed(6)}</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.loadingText, getTextStyle(language, 14)]}>
              {t('location.getting')}
            </Text>
          )}
        </View>

        {/* Weather & Risk Status Row */}
        <View style={styles.statusRow}>
          {/* Weather Card */}
          <View style={styles.statusCard}>
            <Text style={[styles.statusCardTitle, getTextStyle(language, 14)]}>
              {t('weather.title')}
            </Text>
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
              <Text style={[styles.loadingText, getTextStyle(language, 14)]}>
                {t('weather.loading')}
              </Text>
            )}
          </View>

          {/* Risk Status Card */}
          <View style={styles.statusCard}>
            <Text style={[styles.statusCardTitle, getTextStyle(language, 14)]}>
              {t('risk.title')}
            </Text>
            <View style={styles.riskContent}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskStatus) }]}>
                <Text style={[styles.riskText, getTextStyle(language, 14)]}>
                  {t(`risk.${riskStatus.toLowerCase()}`)}
                </Text>
              </View>
              <Text style={[styles.riskDescription, getTextStyle(language, 11)]}>
                {t('risk.description')}
              </Text>
              {riskStatus === 'High' && (
                <View style={styles.highRiskWarning}>
                  <Text style={[styles.warningText, getTextStyle(language, 10)]}>
                    {t('risk.stayAlert')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.viewDetailsButton}
                    onPress={() => navigation.navigate('RiskMap')}
                  >
                    <Text style={[styles.viewDetailsText, getTextStyle(language, 10)]}>
                      {t('risk.viewDetails')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, getTextStyle(language, 16)]}>
            {t('actions.title')}
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={() => handleQuickAction('sos')}
            >
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={[styles.actionText, getTextStyle(language, 16)]}>
                {t('actions.emergencySos')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => handleQuickAction('report')}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={[styles.actionText, getTextStyle(language, 16)]}>
                {t('actions.reportIncident')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => handleQuickAction('riskmap')}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={[styles.actionText, getTextStyle(language, 16)]}>
                {t('actions.viewMap')}
              </Text>
            </TouchableOpacity>

             <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                  onPress={() => handleQuickAction('chat')}
                >
                  <Text style={styles.actionIcon}>💬</Text>
                  <Text style={[styles.actionText, getTextStyle(language, 16)]}>
                    {t('actions.emergencyChat')}
                  </Text>
                </TouchableOpacity>

                {/* Added Consent/Privacy Action */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
                  onPress={() => handleQuickAction('consent')}
                >
                  <Text style={styles.actionIcon}>🔐</Text>
                  <Text style={[styles.actionText, getTextStyle(language, 16)]}>
                    {t('actions.privacySettings')}
                  </Text>
                </TouchableOpacity>

                {/* Donation Action */}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
                  onPress={() => handleQuickAction('donation')}
                >
                  <Text style={styles.actionIcon}>💝</Text>
                  <Text style={[styles.actionText, getTextStyle(language, 16)]}>
                    {t('donations.make_donation')}
                  </Text>
                </TouchableOpacity>
          </View>
        </View>

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, getTextStyle(language, 16)]}>
              {t('alerts.title')}
            </Text>
            <View style={styles.alertsList}>
              {recentAlerts.slice(0, 2).map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertType, getTextStyle(language, 14)]}>
                      {alert.type}
                    </Text>
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                  </View>
                  <View style={styles.alertSeverity}>
                    <Text style={[styles.severityText, { color: getRiskColor(alert.severity) }]}>
                      {t(`risk.${alert.severity.toLowerCase()}`)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Location Selection Button for Testing */}
        <View style={styles.debugSection}>
          <Text style={[styles.sectionTitle, getTextStyle(language, 16)]}>
            {t('testing.title')}
          </Text>
          <View style={styles.debugButtons}>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => getCurrentLocation()}
            >
              <Text style={[styles.debugButtonText, getTextStyle(language, 12)]}>
                {t('testing.changeLocation')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => sendLocalNotification(t('notifications.testAlert'), t('notifications.testMessage'), 'medium')}
            >
              <Text style={[styles.debugButtonText, getTextStyle(language, 12)]}>
                {t('testing.testNotification')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => BackgroundNotificationService.sendDemoNotification()}
            >
              <Text style={[styles.debugButtonText, getTextStyle(language, 12)]}>
                {t('testing.demoAlert')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.debugButton, { backgroundColor: '#3498db' }]}
              onPress={() => navigation.navigate('DonationHistory')}
            >
              <Text style={[styles.debugButtonText, getTextStyle(language, 12)]}>
                {t('donations.donation_history')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.debugButton, { backgroundColor: '#9b59b6' }]}
              onPress={() => navigation.navigate('DonationStats')}
            >
              <Text style={[styles.debugButtonText, getTextStyle(language, 12)]}>
                {t('donations.donation_statistics')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Switcher Section */}
        <LanguageSwitcher style={{ marginHorizontal: 16, marginBottom: 12 }} />

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
  highRiskWarning: {
    marginTop: 8,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  viewDetailsButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
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
  debugSection: {
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
  debugButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  debugButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
