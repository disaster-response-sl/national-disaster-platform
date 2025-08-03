// components/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AuthService from '../services/AuthService';

const LoginScreen = ({ navigation }) => {
  const [individualId, setIndividualId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!individualId || !otp) {
      Alert.alert('Error', 'Please enter both ID and OTP');
      return;
    }

    setLoading(true);
    
    const result = await AuthService.login(individualId, otp);
    
    if (result.success) {
      navigation.navigate('Dashboard');
    } else {
      Alert.alert('Login Failed', result.error);
    }
    
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SLUDI Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Individual ID (try: citizen001, responder001, admin001)"
        value={individualId}
        onChangeText={setIndividualId}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="OTP (use: 123456 for demo)"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        secureTextEntry
      />
      
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? 'Logging in...' : 'Login with SLUDI'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Demo Accounts:{'\n'}
        citizen001 - Citizen{'\n'}
        responder001 - Emergency Responder{'\n'}
        admin001 - Admin{'\n'}
        OTP: 123456
      </Text>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
};

export default LoginScreen;
