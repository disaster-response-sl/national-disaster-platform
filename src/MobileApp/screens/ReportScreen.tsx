// components/ReportScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Import multilingual support
import { useAppTranslation } from '../src/hooks/useAppTranslation';
import { useLanguage } from '../src/contexts/LanguageContext';

const { width } = Dimensions.get('window');

const ReportScreen = ({ navigation }: { navigation: any }) => {
  // Multilingual support
  const { tScreens, tCommon } = useAppTranslation();
  const { currentLanguage } = useLanguage();
  
  const [reportType, setReportType] = useState('food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Get current location for display
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      error => {
        console.error('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  };

  const handleSubmitReport = () => {
    if (!description.trim()) {
      Alert.alert(
        'Missing Information',
        'Please provide a detailed description of the incident to help responders understand the situation.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert(
        'Description Too Short',
        'Please provide more details (at least 10 characters) to help responders better understand the situation.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Submit Report?',
      'This will send your incident report to emergency responders along with your location. Do you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit Report', style: 'default', onPress: proceedWithSubmission }
      ]
    );
  };

  const proceedWithSubmission = () => {
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
            Alert.alert(
              '✅ Report Submitted Successfully',
              'Your incident report has been sent to emergency responders. They will review and respond accordingly.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setDescription('');
                    setReportType('food');
                    navigation.goBack();
                  }
                }
              ]
            );
          } else {
            Alert.alert('Submission Failed', response.data.message || 'Failed to submit report. Please try again.');
          }
        } catch (err) {
          console.error('Report submission error:', err);
          Alert.alert(
            'Submission Error',
            'Unable to submit your report. Please check your connection and try again.',
            [{ text: 'Retry', onPress: () => setLoading(false) }]
          );
        } finally {
          setLoading(false);
        }
      },
      error => {
        Alert.alert(
          'Location Required',
          'We need your location to send the report to nearby responders. Please enable GPS and try again.',
          [{ text: 'Retry', onPress: () => setLoading(false) }]
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getReportTypeInfo = (type: string) => {
    const typeInfo: { [key: string]: { icon: string; title: string; description: string; color: string } } = {
      food: {
        icon: '🍽️',
        title: tScreens('report.food_shortage'),
        description: tScreens('report.food_shortage_desc'),
        color: '#f59e0b'
      },
      shelter: {
        icon: '🏠',
        title: tScreens('report.shelter_needed'),
        description: tScreens('report.shelter_needed_desc'),
        color: '#3b82f6'
      },
      danger: {
        icon: '⚠️',
        title: tScreens('report.dangerous_situation'),
        description: tScreens('report.dangerous_situation_desc'),
        color: '#ef4444'
      },
      medical: {
        icon: '🏥',
        title: tScreens('report.medical_emergency'),
        description: tScreens('report.medical_emergency_desc'),
        color: '#dc2626'
      }
    };
    return typeInfo[type] || typeInfo.food;
  };

  const currentTypeInfo = getReportTypeInfo(reportType);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >


          {/* Location Status */}
          {location && (
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationTitle}>{tScreens('report.report_location')}</Text>
              </View>
              <Text style={styles.locationText}>
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </Text>
              <Text style={styles.locationNote}>
                {tScreens('report.location_included')}
              </Text>
            </View>
          )}

          {/* Report Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{tScreens('report.incident_type_title')}</Text>

            {/* Current Selection Display */}
            <View style={[styles.currentSelection, { borderColor: currentTypeInfo.color }]}>
              <View style={styles.selectionContent}>
                <Text style={styles.selectionIcon}>{currentTypeInfo.icon}</Text>
                <View style={styles.selectionText}>
                  <Text style={styles.selectionTitle}>{currentTypeInfo.title}</Text>
                  <Text style={styles.selectionDescription}>{currentTypeInfo.description}</Text>
                </View>
              </View>
            </View>

            {/* Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={reportType}
                onValueChange={(itemValue) => setReportType(itemValue)}
                style={styles.picker}
                mode="dropdown"
                dropdownIconColor="#64748b"
              >
                <Picker.Item
                  label={tScreens('report.food_option')}
                  value="food"
                  color="#1f2937"
                />
                <Picker.Item
                  label={tScreens('report.shelter_option')}
                  value="shelter"
                  color="#1f2937"
                />
                <Picker.Item
                  label={tScreens('report.danger_option')}
                  value="danger"
                  color="#1f2937"
                />
                <Picker.Item
                  label={tScreens('report.medical_option')}
                  value="medical"
                  color="#1f2937"
                />
              </Picker>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Incident Description</Text>
            <Text style={styles.descriptionHelper}>
              Provide detailed information to help responders understand the situation
            </Text>

            <View style={[styles.inputContainer, focusedInput && styles.inputFocused]}>
              <TextInput
                style={styles.textArea}
                placeholder={tScreens('report.describe_placeholder', { type: currentTypeInfo.title.toLowerCase() })}
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocusedInput(true)}
                onBlur={() => setFocusedInput(false)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.characterCount}>
                <Text style={styles.characterCountText}>
                  {description.length} {tScreens('report.characters')}
                </Text>
              </View>
            </View>
          </View>

          {/* Guidelines Section */}
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>{tScreens('report.guidelines_title')}</Text>
            <View style={styles.guidelinesList}>
              <Text style={styles.guidelineItem}>{tScreens('report.guideline_specific')}</Text>
              <Text style={styles.guidelineItem}>{tScreens('report.guideline_affected')}</Text>
              <Text style={styles.guidelineItem}>{tScreens('report.guideline_dangers')}</Text>
              <Text style={styles.guidelineItem}>{tScreens('report.guideline_contact')}</Text>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmitReport}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonIcon}>
                  {loading ? '📡' : '📤'}
                </Text>
                <Text style={styles.submitButtonText}>
                  {loading ? tScreens('report.submitting') : tScreens('report.submit_incident')}
                </Text>
              </View>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingStatus}>
                <Text style={styles.loadingText}>{tScreens('report.getting_location')}</Text>
                <Text style={styles.loadingSubtext}>{tScreens('report.please_wait')}</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
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
    paddingTop: StatusBar.currentHeight || 10,
  },
  header: {
    backgroundColor: '#1f2937',
    paddingTop: 50,
    paddingBottom: 32,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
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
    color: '#d1d5db',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  locationCard: {
    backgroundColor: '#e0f2fe',
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0284c7',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
  },
  locationText: {
    fontSize: 14,
    color: '#0c4a6e',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  locationNote: {
    fontSize: 12,
    color: '#075985',
    fontStyle: 'italic',
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
  currentSelection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  selectionText: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  selectionDescription: {
    fontSize: 14,
    color: '#6b7280',
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
  descriptionHelper: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
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
    position: 'relative',
  },
  inputFocused: {
    borderColor: '#3b82f6',
  },
  textArea: {
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#6b7280',
  },
  guidelinesCard: {
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
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  guidelinesList: {
    gap: 6,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 50,
    width: '100%',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowColor: '#9ca3af',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingStatus: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 32,
  },
});

export default ReportScreen;
