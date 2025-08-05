// SosScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

const SosScreen = () => {
  const [sending, setSending] = useState(false);

  const handleSendSOS = () => {
    setSending(true);

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        try {
          const token = await AsyncStorage.getItem('authToken');

          const response = await axios.post('http://10.0.2.2:5000/api/mobile/sos', {
            location: { latitude, longitude }
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          Alert.alert("SOS Sent", "Help is on the way!");
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "Failed to send SOS");
        } finally {
          setSending(false);
        }
      },
      error => {
        Alert.alert("GPS Error", error.message);
        setSending(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      <TouchableOpacity
        style={styles.sosButton}
        onPress={handleSendSOS}
        disabled={sending}
      >
        <Text style={styles.sosButtonText}>
          {sending ? 'Sending...' : 'SEND SOS'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    fontWeight: '600'
  },
  sosButton: {
    backgroundColor: 'red',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 100
  },
  sosButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  }
});
