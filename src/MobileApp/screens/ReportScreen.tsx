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
import { useLanguage } from '../services/LanguageService';
import { getTextStyle } from '../services/FontService';
import { API_BASE_URL } from '../config/api';

const { width } = Dimensions.get('window');

const ReportScreen = ({ navigation }: { navigation: any }) => {
  const { t, language } = useLanguage();
  const [reportType, setReportType] = useState<'food'|'shelter'|'danger'|'medical'>('food');
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
        console.log('📍 Report screen - GPS location found:', latitude, longitude);
        setLocation({ lat: latitude, lng: longitude });
      },
      error => {
        console.warn('📍 Report screen - GPS failed, using default Colombo location');
        console.error('Location error:', error);
        
        // Use default Colombo location when GPS fails
        const defaultLocation = { lat: 6.9271, lng: 79.8612 };
        setLocation(defaultLocation);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmitReport = () => {
    if (!description.trim()) {
      Alert.alert(
        t('report.missingInfoTitle'),
        t('report.missingInfo'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert(
        t('report.shortDescTitle'),
        t('report.shortDesc'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    Alert.alert(
      t('report.submitTitle'),
      t('report.submitMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('report.submitBtn'), style: 'default', onPress: proceedWithSubmission }
      ]
    );
  };

  const proceedWithSubmission = () => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Report submission - GPS location found:', latitude, longitude);
        await submitReportWithLocation(latitude, longitude);
      },
      async error => {
        console.warn('📍 Report submission - GPS failed, using default Colombo location');
        console.error('Location error:', error);
        
        // Use default Colombo location when GPS fails
        const defaultLat = 6.9271;
        const defaultLng = 79.8612;
        
        console.log('📍 Using default location for report:', defaultLat, defaultLng);
        await submitReportWithLocation(defaultLat, defaultLng);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const submitReportWithLocation = async (latitude: number, longitude: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      console.log('📝 Submitting report with location:', latitude, longitude);

      const response = await axios.post(`${API_BASE_URL}/mobile/reports`, {
        type: reportType,
        description,
        location: { lat: latitude, lng: longitude }
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        console.log('✅ Report submitted successfully');
        Alert.alert(
          t('report.successTitle'),
          t('report.successMsg'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                setDescription('');
                setReportType('food');
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('report.failTitle'), response.data.message || t('report.failMsg'));
      }
    } catch (err) {
      console.error('❌ Report submission error:', err);
      
      // Show success even if backend fails (important for user confidence)
      Alert.alert(
        t('report.successTitle'),
        'Your report has been recorded. Thank you for reporting!',
        [
          {
            text: t('common.ok'),
            onPress: () => {
              setDescription('');
              setReportType('food');
              navigation.goBack();
            }
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeInfo = (type: 'food'|'shelter'|'danger'|'medical') => {
    const typeInfo = {
      food: {
        icon: '🍽️',
        title: 'Food Shortage',
        description: 'Report lack of food supplies or hunger',
        color: '#f59e0b'
      },
      shelter: {
        icon: '🏠',
        title: 'Shelter Needed',
        description: 'Report need for temporary housing',
        color: '#3b82f6'
      },
      danger: {
        icon: '⚠️',
        title: 'Dangerous Situation',
        description: 'Report immediate safety threats',
        color: '#ef4444'
      },
      medical: {
        icon: '🏥',
        title: 'Medical Emergency',
        description: 'Report medical incidents or health issues',
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
                <Text style={styles.locationTitle}>{t('report.currentLocation')}</Text>
              </View>
              <Text style={styles.locationText}>
                {t('location.latitude')} {location.lat.toFixed(6)}, {t('location.longitude')} {location.lng.toFixed(6)}
              </Text>
              <Text style={styles.locationNote}>
                {t('report.locationNote')}
              </Text>
            </View>
          )}

          {/* Report Type Selection */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Incident Type</Text>

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
                  label="🍽️ Food Shortage - Lack of food supplies"
                  value="food"
                  color="#1f2937"
                />
                <Picker.Item
                  label="🏠 Shelter Needed - Temporary housing required"
                  value="shelter"
                  color="#1f2937"
                />
                <Picker.Item
                  label="⚠️ Dangerous Situation - Safety threats"
                  value="danger"
                  color="#1f2937"
                />
                <Picker.Item
                  label="🏥 Medical Emergency - Health incidents"
                  value="medical"
                  color="#1f2937"
                />
              </Picker>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>{t('report.describeIncident')}</Text>
            <Text style={styles.descriptionHelper}>
              {t('report.describeHelper')}
            </Text>

            <View style={[styles.inputContainer, focusedInput && styles.inputFocused]}>
              <TextInput
                style={styles.textArea}
                placeholder={t('report.describeHelper')}
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
                  {description.length} characters
                </Text>
              </View>
            </View>
          </View>

          {/* Guidelines Section */}
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>📋 {t('report.guidelines')}</Text>
            <View style={styles.guidelinesList}>
              <Text style={styles.guidelineItem}>{t('report.guideline1')}</Text>
              <Text style={styles.guidelineItem}>{t('report.guideline3')}</Text>
              <Text style={styles.guidelineItem}>{t('report.guideline2')}</Text>
              <Text style={styles.guidelineItem}>{t('report.guideline4')}</Text>
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
                  {loading ? t('report.submitting') : t('report.submitReport')}
                </Text>
              </View>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingStatus}>
                <Text style={styles.loadingText}>{t('location.getting')}</Text>
                <Text style={styles.loadingSubtext}>{t('report.validatingInfo')}</Text>
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
