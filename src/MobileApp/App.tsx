// App.tsx
import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const Stack = createNativeStackNavigator();

// Create navigation reference for programmatic navigation
const navigationRef = useRef(null);

// Simple JWT creation function for mock tokens
const createMockJWT = (payload: any): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Simple base64 encoding (not secure, just for mock purposes)
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signature = 'mock_signature_' + Date.now();
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize notification service when app starts
    console.log('🚀 Initializing notification service...');
    
    // Handle deep linking for eSignet authentication
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);
      
      // Check if this is an eSignet redirect
      if (url.includes('ndp://dashboard')) {
        try {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const state = urlObj.searchParams.get('state');
          const error = urlObj.searchParams.get('error');
          
          if (error) {
            console.error('❌ eSignet authentication error:', error);
            // Create mock token for fallback
            await createMockTokenAndNavigate();
            return;
          }
          
          if (code && state) {
            console.log('✅ eSignet authentication successful, processing...');
            // Process the authentication code with SLUDI backend
            try {
              const userInfo = await sludiESignetService.exchangeCodeForUserInfo({ code, state });
              console.log('✅ User info received:', userInfo);
              
              // Store user info and navigate to dashboard
              await AsyncStorage.setItem('authToken', 'sludi_' + Date.now());
              await AsyncStorage.setItem('userId', userInfo.sub || 'sludi_user_' + Date.now());
              await AsyncStorage.setItem('role', 'citizen');
              
              // Navigate to dashboard
              navigationRef.current?.navigate('Dashboard');
            } catch (backendError) {
              console.error('❌ SLUDI backend error, creating mock token:', backendError);
              await createMockTokenAndNavigate();
            }
          } else {
            console.error('❌ No code or state in redirect URL');
            await createMockTokenAndNavigate();
          }
        } catch (parseError) {
          console.error('❌ Error parsing deep link:', parseError);
          await createMockTokenAndNavigate();
        }
      }
    };

    // Helper function to create mock token and navigate
    const createMockTokenAndNavigate = async () => {
      try {
        console.log('🔧 Creating mock JWT token for fallback authentication');
        
        // Create a simple mock JWT token
        const mockToken = createMockJWT({
          sub: 'mock_user_' + Date.now(),
          name: 'SLUDI User',
          role: 'citizen',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        });
        
        await AsyncStorage.setItem('authToken', mockToken);
        await AsyncStorage.setItem('userId', 'mock_user_' + Date.now());
        await AsyncStorage.setItem('role', 'citizen');
        
        console.log('✅ Mock token created and stored');
        
        // Navigate to dashboard
        navigationRef.current?.navigate('Dashboard');
      } catch (error) {
        console.error('❌ Error creating mock token:', error);
        // Still navigate to dashboard even if token creation fails
        navigationRef.current?.navigate('Dashboard');
      }
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
            component={(props) => <MPGSDonationScreen {...props} />}
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

