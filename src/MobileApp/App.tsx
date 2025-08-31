// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize notification service when app starts
    console.log('🚀 Initializing notification service...');
  }, []);

  return (
    <LanguageProvider>
      <NavigationContainer>
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

