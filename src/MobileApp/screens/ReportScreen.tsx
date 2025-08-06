import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ReportScreen = ({ navigation }: { navigation: any }) => {
  const [reportType, setReportType] = useState('food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitReport = () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    setLoading(true);

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        try {
          const token = await AsyncStorage.getItem('authToken');
          
          const response = await axios.post('http://10.0.2.2:5000/api/mobile/reports', {
            type: reportType,
            description,
            location: { lat: latitude, lng: longitude }
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data.success) {
            Alert.alert('Success', 'Report submitted successfully');
            setDescription('');
            navigation.goBack();
          } else {
            Alert.alert('Error', response.data.message || 'Failed to submit report');
          }
        } catch (err) {
          console.error(err);
          Alert.alert('Error', 'Failed to submit report');
        } finally {
          setLoading(false);
        }
      },
      error => {
        Alert.alert('GPS Error', error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Report Incident</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Report Type:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={reportType}
            onValueChange={(itemValue) => setReportType(itemValue)}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="Food Shortage" value="food" />
            <Picker.Item label="Shelter Needed" value="shelter" />
            <Picker.Item label="Dangerous Situation" value="danger" />
            <Picker.Item label="Medical Emergency" value="medical" />
          </Picker>
        </View>

        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the incident in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReport}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
    fontSize: 16,
    marginBottom: 30,
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportScreen; 