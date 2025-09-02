import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationContainerRef } from '@react-navigation/native';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SosScreen from './screens/SosScreen';
import ReportScreen from './screens/ReportScreen';
import ChatScreen from './screens/ChatScreen';
import RiskMapScreen from './screens/RiskMapScreen';
import ConsentManagementScreen from './screens/ConsentManagementScreen';
// import DonationScreen from './screens/DonationScreen';
import MPGSDonationScreen from './screens/MPGSDonationScreen';
import DonationHistoryScreen from './screens/DonationHistoryScreen';
import DonationStatsScreen from './screens/DonationStatsScreen';
import NotificationService from './services/NotificationService';
import { LanguageProvider } from './services/LanguageService';
import { sludiESignetService } from './services/SLUDIESignetService';
import AuthService from './services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config/api';

const Stack = createNativeStackNavigator();

// Simple mock JWT token generator for fallback
const generateMockJWT = () => {
  // Since we can't do HMAC signing in React Native without crypto libraries,
  // let's create a simpler solution: generate a token that mimics the backend's format
  // Note: In production, this would be replaced with real SLUDI authentication
  
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    _id: 'mock-sludi-user-123',
    individualId: 'sludi-demo-user',
    sub: 'mock-sludi-user-123',
    name: 'SLUDI Demo User',
    given_name: 'SLUDI',
    family_name: 'User',
    email: 'sludi.demo@gov.lk',
    email_verified: true,
    phone_number: '+94771234567',
    phone_number_verified: true,
    role: 'Citizen',
    iss: 'https://sludiauth.icta.gov.lk',
    aud: 'ndp-mobile-app',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    auth_method: 'SLUDI_ESIGNET_MOCK',
    acr: 'mosip:idp:acr:generated-code'
  };
  
  // Create a simple base64 encoded token
  // Note: This is a mock - real implementation would use proper HMAC
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  
  // For now, use a mock signature that the backend can recognize
  // In real implementation, this would be HMAC-SHA256 signed
  const signature = btoa('mock-sludi-signature-for-testing');
  
  return `${headerB64}.${payloadB64}.${signature}`;
};

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  useEffect(() => {
    // Initialize notification service when app starts
    console.log('🚀 Initializing notification service...');
    
    // Handle deep linking for eSignet authentication
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Check if this is an eSignet redirect
      if (url.includes('ndp://dashboard')) {
        console.log('✅ SLUDI redirect received - logging in with citizen001...');
        
        // Simple: Any SLUDI redirect = automatic login with citizen001
        await useMockAuth();
        
        // Navigate to dashboard
        setTimeout(() => {
          if (navigationRef.current) {
            console.log('🏠 Navigating to dashboard...');
            navigationRef.current.navigate('Dashboard' as never);
          }
        }, 500);
      }
    };

    // Authentication fallback - try backend login first, then offline mock
    const useMockAuth = async () => {
      console.log('🔧 Trying backend login with demo credentials...');
      
      try {
        // First try: Real backend login with correct demo credentials
        const apiUrl = `${API_BASE_URL}/mobile/login`;
        console.log('📡 Calling backend login at:', apiUrl);
        
        const loginResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            individualId: 'citizen001',
            otp: '123456'
          })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginData.success && loginData.token) {
          console.log('✅ Backend login successful with citizen001 credentials');
          
          await AsyncStorage.setItem('authToken', loginData.token);
          await AsyncStorage.setItem('userInfo', JSON.stringify(loginData.user || {
            name: 'Citizen User',
            email: 'citizen001@gov.lk',
            role: 'Citizen'
          }));
          await AsyncStorage.setItem('userId', loginData.user?._id || 'citizen001');
          
          console.log('👤 Authenticated with real JWT token from backend');
          return; // Success - exit function
        }
        
        throw new Error('Backend login failed');
        
      } catch (error) {
        console.error('❌ Backend login failed:', error);
        console.log('🔧 Using offline mock token as fallback...');
        
        // Fallback: Generate offline mock token
        const currentTime = Math.floor(Date.now() / 1000);
        const tokenPayload = {
          _id: 'offline-user-' + Date.now(),
          individualId: 'offline-user-' + Date.now(),
          role: 'Citizen',
          name: 'Offline Demo User',
          email: 'offline.demo@gov.lk',
          iat: currentTime,
          exp: currentTime + (24 * 60 * 60)
        };
        
        const tokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const tokenBody = btoa(JSON.stringify(tokenPayload));
        const mockToken = `${tokenHeader}.${tokenBody}.offline_signature_${Date.now()}`;
        
        await AsyncStorage.setItem('authToken', mockToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify({
          _id: tokenPayload._id,
          name: tokenPayload.name,
          email: tokenPayload.email,
          role: tokenPayload.role,
          authMethod: 'OFFLINE_FALLBACK'
        }));
        await AsyncStorage.setItem('userId', tokenPayload._id);
        
        console.log('✅ Offline fallback token created');
      }
      
      // Navigate to dashboard after successful authentication
      setTimeout(() => {
        if (navigationRef.current) {
          console.log('🏠 Navigating to dashboard...');
          navigationRef.current.navigate('Dashboard' as never);
        }
      }, 1000); // Small delay to ensure navigation is ready
    };

    // Get the initial URL if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      linkingListener.remove();
    };
  }, []);

  return (
    <LanguageProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{ 
              title: 'Disaster Platform',
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="Sos" 
            component={SosScreen}
            options={{ 
              title: 'Emergency SOS',
              headerStyle: { backgroundColor: '#ff4444' },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen 
            name="Report" 
            component={ReportScreen}
            options={{ 
              title: 'Report Incident',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ 
              title: 'Support Chat',
              headerStyle: { backgroundColor: '#007bff' },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen 
            name="RiskMap" 
            component={RiskMapScreen}
            options={{ 
              title: 'Risk Map',
              headerStyle: { backgroundColor: '#28a745' },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen 
            name="ConsentManagement" 
            component={ConsentManagementScreen}
            options={{ 
              title: 'Data Sharing Consent',
              headerStyle: { backgroundColor: '#6f42c1' },
              headerTintColor: 'white'
            }}
          />

          <Stack.Screen 
            name="MPGSDonation" 
            component={(props: any) => <MPGSDonationScreen {...props} />}
            options={{ 
              title: 'Make Donation',
              headerStyle: { backgroundColor: '#27ae60' },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen 
            name="DonationHistory" 
            component={DonationHistoryScreen}
            options={{ 
              title: 'Donation History',
              headerStyle: { backgroundColor: '#3498db' },
              headerTintColor: 'white'
            }}
          />
          <Stack.Screen 
            name="DonationStats" 
            component={DonationStatsScreen}
            options={{ 
              title: 'Donation Statistics',
              headerStyle: { backgroundColor: '#9b59b6' },
              headerTintColor: 'white'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
};

export default App;

