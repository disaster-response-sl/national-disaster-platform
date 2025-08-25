import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppTranslation } from '../src/hooks/useAppTranslation';
import { useLanguage } from '../src/contexts/LanguageContext';
import LanguageSelector from '../src/components/LanguageSelector';

/**
 * Test component to demonstrate multilingual functionality
 * Add this to your navigation stack to test translations
 */
const MultilingualTestScreen: React.FC = ({ navigation }: any) => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [testTimestamp] = useState(new Date(Date.now() - 3600000)); // 1 hour ago

  const { 
    tCommon, 
    tScreens, 
    tSettings,
    getDisasterTypeText, 
    getSeverityText,
    formatRelativeTime,
    formatDate,
    formatTime,
    currentLanguage 
  } = useAppTranslation();
  
  const { getCurrentLanguageNativeName } = useLanguage();

  const testDisasterTypes = ['flood', 'earthquake', 'fire', 'tsunami', 'landslide'];
  const testSeverities = ['low', 'medium', 'high', 'critical', 'emergency'];

  const showAlert = () => {
    Alert.alert(
      tCommon('app.confirm'),
      tScreens('sos.confirm_sos'),
      [
        { text: tCommon('app.cancel'), style: 'cancel' },
        { 
          text: tCommon('app.yes'),
          onPress: () => Alert.alert(tCommon('app.ok'), tScreens('sos.sos_sent'))
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Multilingual Test Screen
        </Text>
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={() => setShowLanguageSelector(true)}
        >
          <Text style={styles.languageButtonText}>
            {getCurrentLanguageNativeName()} 🌐
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current Language Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Language</Text>
        <Text style={styles.infoText}>Code: {currentLanguage}</Text>
        <Text style={styles.infoText}>Name: {getCurrentLanguageNativeName()}</Text>
      </View>

      {/* Common Translations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Translations</Text>
        <View style={styles.testItem}>
          <Text style={styles.label}>App Name:</Text>
          <Text style={styles.value}>{tCommon('app.name')}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Loading:</Text>
          <Text style={styles.value}>{tCommon('app.loading')}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Error:</Text>
          <Text style={styles.value}>{tCommon('app.error')}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Save:</Text>
          <Text style={styles.value}>{tCommon('app.save')}</Text>
        </View>
      </View>

      {/* Screen Translations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Translations</Text>
        <View style={styles.testItem}>
          <Text style={styles.label}>Dashboard:</Text>
          <Text style={styles.value}>{tScreens('dashboard.welcome', { name: 'John' })}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Login Title:</Text>
          <Text style={styles.value}>{tScreens('login.title')}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>SOS Title:</Text>
          <Text style={styles.value}>{tScreens('sos.title')}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Report Title:</Text>
          <Text style={styles.value}>{tScreens('report.title')}</Text>
        </View>
      </View>

      {/* Disaster Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disaster Types</Text>
        {testDisasterTypes.map(type => (
          <View key={type} style={styles.testItem}>
            <Text style={styles.label}>{type}:</Text>
            <Text style={styles.value}>{getDisasterTypeText(type)}</Text>
          </View>
        ))}
      </View>

      {/* Severity Levels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Severity Levels</Text>
        {testSeverities.map(severity => (
          <View key={severity} style={styles.testItem}>
            <Text style={styles.label}>{severity}:</Text>
            <Text style={styles.value}>{getSeverityText(severity)}</Text>
          </View>
        ))}
      </View>

      {/* Time Formatting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time Formatting</Text>
        <View style={styles.testItem}>
          <Text style={styles.label}>Relative Time:</Text>
          <Text style={styles.value}>{formatRelativeTime(testTimestamp)}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{formatDate(new Date())}</Text>
        </View>
        <View style={styles.testItem}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>{formatTime(new Date())}</Text>
        </View>
      </View>

      {/* Interactive Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interactive Tests</Text>
        
        <TouchableOpacity style={styles.testButton} onPress={showAlert}>
          <Text style={styles.testButtonText}>
            {tScreens('sos.send_sos')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.secondaryButton]} 
          onPress={() => setShowLanguageSelector(true)}
        >
          <Text style={[styles.testButtonText, styles.secondaryButtonText]}>
            {tSettings('language.select')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>
            ← {tCommon('app.previous')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector Modal */}
      <LanguageSelector 
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2196f3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  languageButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  languageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
    fontWeight: '500',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#2196f3',
  },
  secondaryButtonText: {
    color: 'white',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MultilingualTestScreen;
