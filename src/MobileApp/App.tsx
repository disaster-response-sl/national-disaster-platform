// App.tsx
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SosScreen from './screens/SosScreen';
import ReportScreen from './screens/ReportScreen';
import ChatScreen from './screens/ChatScreen';
import RiskMapScreen from './screens/RiskMapScreen';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
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
            headerStyle: { backgroundColor: '#ff6b35' },
            headerTintColor: 'white'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
