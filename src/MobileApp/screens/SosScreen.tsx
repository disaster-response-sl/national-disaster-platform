import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const SosScreen = () => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('high');

  const handleSendSOS = () => {
    if (!message.trim()) {
      Alert.alert("Missing Message", "Please describe your situation.");
      return;
    }

    setSending(true);

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        try {
          const token = await AsyncStorage.getItem('authToken');
          const userId = await AsyncStorage.getItem('userId');
          const response = await axios.post('http://10.0.2.2:5000/api/mobile/sos', {
            location: { lat: latitude, lng: longitude },
            message,
            priority
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          Alert.alert("SOS Sent", "Help is on the way!");
          setMessage('');
        } catch (err) {
          console.error(err);
          Alert.alert("Error", err?.response?.data?.message || "Failed to send SOS");
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

      <TextInput
        style={styles.input}
        placeholder="Describe your emergency..."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Priority Level:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={priority}
            onValueChange={(itemValue) => setPriority(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="High Priority" value="high" />
            <Picker.Item label="Medium Priority" value="medium" />
            <Picker.Item label="Low Priority" value="low" />
          </Picker>
        </View>
      </View>

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
  input: {
    width: '100%',
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 20
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '500',
    textAlign: 'left'
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9'
  },
  picker: {
    height: 50,
    width: '100%'
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
