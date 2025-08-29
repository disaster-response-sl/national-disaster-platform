import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../services/LanguageService';
import { getLanguageStyle, getTextSizeMultiplier } from '../services/FontService';
import LanguageSwitcher from '../components/LanguageSwitcher';

const MultilingualDemo: React.FC = () => {
  const { t, language } = useLanguage();
  const languageStyle = getLanguageStyle(language);
  const textSizeMultiplier = getTextSizeMultiplier(language);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.title, languageStyle, { fontSize: 24 * textSizeMultiplier }]}>
          Multilingual Demo
        </Text>
        
        <LanguageSwitcher style={styles.languageSwitcher} />
        
        <View style={styles.demoSection}>
          <Text style={[styles.sectionTitle, languageStyle, { fontSize: 18 * textSizeMultiplier }]}>
            {t('welcome.back')}
          </Text>
          
          <Text style={[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            {t('welcome.user')}
          </Text>
          
          <Text style={[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            {t('location.current')}
          </Text>
          
          <Text style={[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            {t('weather.title')}
          </Text>
          
          <Text style={[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            {t('risk.title')}
          </Text>
          
          <Text style={[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            {t('actions.title')}
          </Text>
        </View>
        
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>How to use in your components:</Text>
          <Text style={styles.instructionText}>
            1. Import: import {`{ useLanguage }`} from '../services/LanguageService';
          </Text>
          <Text style={styles.instructionText}>
            2. Use hook: const {`{ t, language }`} = useLanguage();
          </Text>
          <Text style={styles.instructionText}>
            3. Translate: {`{ t('key.subkey') }`}
          </Text>
          <Text style={styles.instructionText}>
            4. Style text: style={`[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  section: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageSwitcher: {
    marginBottom: 20,
  },
  demoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
  },
  text: {
    color: '#1f2937',
    marginBottom: 8,
  },
  instructions: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});

export default MultilingualDemo;
