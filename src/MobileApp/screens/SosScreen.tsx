// components/SosScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const SosScreen = ({ navigation }) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('high');
  const [focusedInput, setFocusedInput] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for SOS button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (!sending) {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    return () => pulseAnimation.stop();
  }, [sending]);

  const handleSendSOS = () => {
    if (!message.trim()) {
      Alert.alert(
        "Emergency Description Required",
        "Please describe your emergency situation so responders can help you better.",
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      "Send Emergency SOS?",
      "This will immediately alert emergency responders to your location. Are you sure you want to proceed?",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send SOS', style: 'destructive', onPress: proceedWithSOS }
      ]
    );
  };

  const proceedWithSOS = () => {
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

          Alert.alert(
            "🚨 SOS Signal Sent Successfully",
            "Emergency responders have been notified of your location. Help is on the way. Stay calm and follow any safety instructions.",
            [
              {
                text: 'OK',
                onPress: () => {
                  setMessage('');
                  navigation.goBack();
                }
              }
            ]
          );
        } catch (err) {
          console.error(err);
          Alert.alert(
            "SOS Send Failed",
            err?.response?.data?.message || "Unable to send emergency signal. Please try again or call emergency services directly.",
            [{ text: 'Retry', onPress: () => setSending(false) }]
          );
        } finally {
          setSending(false);
        }
      },
      error => {
        Alert.alert(
          "Location Access Required",
          "We need your location to send help to you. Please enable GPS and try again.",
          [{ text: 'Retry', onPress: () => setSending(false) }]
        );
        setSending(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#ef4444';
    }
  };

  const getPriorityDescription = (level) => {
    switch (level) {
      case 'high':
        return 'Life-threatening emergency';
      case 'medium':
        return 'Urgent but not life-threatening';
      case 'low':
        return 'Non-urgent emergency';
      default:
        return 'Life-threatening emergency';
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.emergencyIconContainer}>
            <Text style={styles.emergencyIcon}>🚨</Text>
          </View>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>Get immediate help from emergency responders</Text>
        </View>

        {/* Emergency Information Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoTitle}>Your Location Will Be Shared</Text>
          </View>
          <Text style={styles.infoDescription}>
            Emergency responders will receive your exact GPS coordinates along with your message.
          </Text>
        </View>

        {/* Emergency Description */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Emergency Description</Text>
          <View style={[styles.inputContainer, focusedInput && styles.inputFocused]}>
            <TextInput
              style={styles.input}
              placeholder="Describe your emergency situation (e.g., medical emergency, accident, fire, etc.)"
              placeholderTextColor="#94a3b8"
              value={message}
              onChangeText={setMessage}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Priority Level */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Emergency Priority</Text>
          <View style={styles.priorityContainer}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) }]}>
              <Text style={styles.priorityText}>{priority.toUpperCase()}</Text>
            </View>
            <Text style={styles.priorityDescription}>
              {getPriorityDescription(priority)}
            </Text>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue) => setPriority(itemValue)}
              style={styles.picker}
              mode="dropdown"
              dropdownIconColor="#64748b"
            >
              <Picker.Item
                label="🔴 High Priority - Life Threatening"
                value="high"
                color="#1f2937"
              />
              <Picker.Item
                label="🟡 Medium Priority - Urgent"
                value="medium"
                color="#1f2937"
              />
              <Picker.Item
                label="🟢 Low Priority - Non-urgent"
                value="low"
                color="#1f2937"
              />
            </Picker>
          </View>
        </View>

        {/* Emergency Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>💡 Emergency Tips</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>• Stay calm and in a safe location</Text>
            <Text style={styles.instructionItem}>• Keep your phone charged and nearby</Text>
            <Text style={styles.instructionItem}>• Follow instructions from responders</Text>
            <Text style={styles.instructionItem}>• Don't move if injured unless necessary</Text>
          </View>
        </View>

        {/* SOS Button */}
        <View style={styles.buttonContainer}>
          <Animated.View
            style={[
              styles.sosButtonContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <TouchableOpacity
              style={[styles.sosButton, sending && styles.sosButtonSending]}
              onPress={handleSendSOS}
              disabled={sending}
              activeOpacity={0.8}
            >
              <View style={styles.sosButtonContent}>
                <Text style={styles.sosButtonIcon}>
                  {sending ? '📡' : '🚨'}
                </Text>
                <Text style={styles.sosButtonText}>
                  {sending ? 'SENDING EMERGENCY SIGNAL...' : 'SEND EMERGENCY SOS'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {sending && (
            <View style={styles.sendingStatus}>
              <Text style={styles.sendingText}>📍 Getting your location...</Text>
              <Text style={styles.sendingSubtext}>Please wait while we send your emergency signal</Text>
            </View>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.emergencyContactsCard}>
          <Text style={styles.emergencyContactsTitle}>📞 Alternative Emergency Contacts</Text>
          <View style={styles.contactsList}>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactLabel}>Police Emergency</Text>
              <Text style={styles.contactNumber}>119</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactLabel}>Fire & Ambulance</Text>
              <Text style={styles.contactNumber}>110</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem}>
              <Text style={styles.contactLabel}>Disaster Management</Text>
              <Text style={styles.contactNumber}>117</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#dc2626',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emergencyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fca5a5',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  infoDescription: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  formSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputFocused: {
    borderColor: '#dc2626',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  priorityDescription: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: 50,
    color: '#1f2937',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 6,
  },
  instructionItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
    alignItems: 'center',
  },
  sosButtonContainer: {
    width: '100%',
  },
  sosButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonSending: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  sosButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sosButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sendingStatus: {
    marginTop: 16,
    alignItems: 'center',
  },
  sendingText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginBottom: 4,
  },
  sendingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emergencyContactsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyContactsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  contactsList: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  contactNumber: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  bottomPadding: {
    height: 32,
  },
});

export default SosScreen;
