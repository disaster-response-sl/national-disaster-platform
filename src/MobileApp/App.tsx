// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SosScreen from './screens/SosScreen';
import ReportScreen from './screens/ReportScreen';
import ChatScreen from './screens/ChatScreen';
import RiskMapScreen from './screens/RiskMapScreen';
import ConsentManagementScreen from './screens/ConsentManagementScreen';
import NotificationService from './services/NotificationService';

// Import i18n configuration and providers
import initI18n from './src/locales';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

// Loading component while i18n initializes
const LoadingScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#2196f3" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Loading...
    </Text>
  </View>
);

// Main navigation component
const AppNavigator: React.FC = () => {
  const { t } = useTranslation();
  const isDarkMode = useColorScheme() === 'dark';

  return (
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
            title: t('common:app.name') || 'Disaster Platform',
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="Sos" 
          component={SosScreen}
          options={{ 
            title: t('screens:sos.title') || 'Emergency SOS',
            headerStyle: { backgroundColor: '#ff4444' },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen 
          name="Report" 
          component={ReportScreen}
          options={{ 
            title: t('screens:report.title') || 'Report Incident',
            headerStyle: { backgroundColor: '#007bff' },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={{ 
            title: t('screens:chat.title') || 'Support Chat',
            headerStyle: { backgroundColor: '#007bff' },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen 
          name="RiskMap" 
          component={RiskMapScreen}
          options={{ 
            title: t('screens:risk_map.title') || 'Risk Map',
            headerStyle: { backgroundColor: '#28a745' },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen 
          name="ConsentManagement" 
          component={ConsentManagementScreen}
          options={{ 
            title: 'Data Sharing Consent', // Keep this in English for now
            headerStyle: { backgroundColor: '#6f42c1' },
            headerTintColor: 'white'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize i18n
        await initI18n();
        setI18nInitialized(true);
        
        // Initialize notification service when app starts
        console.log('🚀 Initializing notification service...');
      } catch (error) {
        console.error('Error initializing app:', error);
        // Still show the app even if i18n fails
        setI18nInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!i18nInitialized) {
    return <LoadingScreen />;
  }

  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
};

export default App;