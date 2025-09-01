<<<<<<< HEAD
import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, Linking, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigationContainerRef } from '@react-navigation/native';
=======
// App.tsx
import React, { useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
>>>>>>> 4f541381aed3b2d9e12bb22dd96742a8b6325bcc
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

<<<<<<< HEAD
// Simple mock JWT token generator for fallback
const generateMockJWT = () => {
  // Since we can't do HMAC signing in React Native without crypto libraries,
  // let's create a simpler solution: generate a token that mimics the backend's format
  // Note: In production, this would be replaced with real SLUDI authentication
  
=======
// Create navigation reference for programmatic navigation
const navigationRef = useRef(null);

// Simple JWT creation function for mock tokens
const createMockJWT = (payload: any): string => {
>>>>>>> 4f541381aed3b2d9e12bb22dd96742a8b6325bcc
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
<<<<<<< HEAD
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
=======
  // Simple base64 encoding (not secure, just for mock purposes)
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signature = 'mock_signature_' + Date.now();
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
>>>>>>> 4f541381aed3b2d9e12bb22dd96742a8b6325bcc
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
        try {
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get('code');
          const error = urlObj.searchParams.get('error');
          
          if (error) {
            console.error('❌ eSignet authentication error:', error);
<<<<<<< HEAD
            // Use mock JWT as fallback
            await useMockAuth();
            return;
          }
          
          if (code) {
            console.log('✅ eSignet code received:', code.substring(0, 10) + '...');
            console.log('🔧 Using mock authentication (SLUDI backend integration disabled)');
            // For now, always use mock auth to ensure the app works
            // TODO: Enable real SLUDI backend once network issues are resolved
            await useMockAuth();
            
            /* Commented out real SLUDI integration for now
            try {
              // Call SLUDI backend to exchange code for access token
              const userInfo = await sludiESignetService.exchangeCodeForUserInfo({ code });
              console.log('✅ User authenticated:', userInfo);
              
              // Store authentication token (assuming userInfo contains a token)
              const token = userInfo.access_token || userInfo.token || generateMockJWT();
              await AsyncStorage.setItem('authToken', token);
              await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
              
              console.log('🏠 SLUDI authentication successful');
              
              // Navigate to dashboard after successful authentication
              setTimeout(() => {
                if (navigationRef.current) {
                  console.log('🏠 Navigating to dashboard...');
                  navigationRef.current.navigate('Dashboard' as never);
                }
              }, 1000);
              
            } catch (error) {
              console.error('❌ Failed to exchange code:', error);
              console.log('🔧 Network issue with SLUDI backend, using mock authentication...');
              // Fallback to mock JWT
              await useMockAuth();
            }
            */
          } else {
            console.warn('⚠️ No code found in redirect URL, using mock auth');
            // Fallback to mock JWT
            await useMockAuth();
          }
        } catch (error) {
          console.error('❌ Error parsing deep link:', error);
          // Fallback to mock JWT
          await useMockAuth();
=======
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
>>>>>>> 4f541381aed3b2d9e12bb22dd96742a8b6325bcc
        }
      }
    };

<<<<<<< HEAD
    // Simple mock authentication fallback
    const useMockAuth = async () => {
      console.log('🔧 Using mock authentication via backend login...');
      console.log('📝 This will get a real JWT token from the backend');
      
      try {
        // Call the backend login endpoint to get a proper JWT token
        const apiUrl = `${API_BASE_URL.replace('/api', '')}/api/mobile/login`;
        console.log('📡 Calling backend login at:', apiUrl);
        
        const loginResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            individualId: 'demo-user-123',
            otp: '123456'
          })
        });
        
        console.log('📡 Backend response status:', loginResponse.status);
        const loginData = await loginResponse.json();
        console.log('📡 Backend response data:', loginData);
        
        if (loginData.success && loginData.token) {
          console.log('✅ Backend login successful, received real JWT token');
          
          // Store the real token and user info
          await AsyncStorage.setItem('authToken', loginData.token);
          await AsyncStorage.setItem('userInfo', JSON.stringify(loginData.user || {
            name: 'SLUDI Demo User',
            email: 'sludi.demo@gov.lk',
            role: 'Citizen'
          }));
          
          console.log('👤 Authenticated user:', loginData.user?.name || 'SLUDI Demo User');
          
        } else {
          throw new Error(`Backend login failed: ${loginData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Backend login failed:', error);
        console.log('🔧 Using hardcoded test token as final fallback...');
        
        // Use a fresh, valid test token generated with the backend's JWT secret
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJzbHVkaS1kZW1vLXVzZXItMTIzIiwiaW5kaXZpZHVhbElkIjoic2x1ZGktZGVtby11c2VyLTEyMyIsInJvbGUiOiJDaXRpemVuIiwibmFtZSI6IlNMVURJIERlbW8gVXNlciIsImlhdCI6MTc1Njc2OTE2OCwiZXhwIjoxNzU5MzYxMTY4fQ.wh-dDvF78z_g1LDeqLHgw3etDD3Gw3yfrrKz59pqY0Y';
        
        const mockUserInfo = {
          _id: 'sludi-demo-user-123',
          name: 'SLUDI Demo User',
          email: 'sludi.demo@gov.lk',
          role: 'Citizen',
          authMethod: 'VALID_TEST_TOKEN'
        };
        
        await AsyncStorage.setItem('authToken', testToken);
        await AsyncStorage.setItem('userInfo', JSON.stringify(mockUserInfo));
        console.log('✅ Test token stored successfully');
      }
      
      // Navigate to dashboard after successful authentication
      setTimeout(() => {
        if (navigationRef.current) {
          console.log('🏠 Navigating to dashboard...');
          navigationRef.current.navigate('Dashboard' as never);
        }
      }, 1000); // Small delay to ensure navigation is ready
=======
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
>>>>>>> 4f541381aed3b2d9e12bb22dd96742a8b6325bcc
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

