// MobileApp/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }: any) => {
  const [nic, setNic] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!nic || !otp) {
      Alert.alert('Error', 'Please enter NIC and OTP');
      return;
    }

    setLoading(true);
    try {
//       await axios.post('http://10.0.2.2:5000/api/mobile/login', { //10.0.2.2  192.168.1.3
//         individualId: nic,
//         otp: otp
//       });
//
//       const { token, user } = response.data;
         const response = await axios.post('http://10.0.2.2:5000/api/mobile/login', {
           individualId: nic,
           otp: otp
         });
         const { token, user } = response.data;


      // TODO: Save token securely (e.g., AsyncStorage)
      Alert.alert('Login Success', `Welcome, ${user.name}`);
      // navigation.navigate('Home'); // or Dashboard screen
    } catch (err: any) {
      if (err.response) {
        Alert.alert('Login Failed', err.response.data.message);
      } else {
        Alert.alert('Error', 'Could not connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <Text style={styles.title}>Disaster Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter NIC"
        value={nic}
        onChangeText={setNic}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef3f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1a1a1a'
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%'
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600'
  }
});
