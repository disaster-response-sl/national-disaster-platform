import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLanguage } from '../services/LanguageService';
import { getLanguageStyle, getTextSizeMultiplier } from '../services/FontService';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface Props {
  navigation: any;
}

const ExampleMultilingualScreen: React.FC<Props> = ({ navigation }) => {
  const { t, language } = useLanguage();
  const languageStyle = getLanguageStyle(language);
  const textSizeMultiplier = getTextSizeMultiplier(language);

  const showAlert = () => {
    Alert.alert(
      t('notifications.testAlert'),
      t('notifications.testMessage'),
      [
        { text: t('logout.cancel'), style: 'cancel' },
        { text: t('notifications.ok') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, languageStyle, { fontSize: 24 * textSizeMultiplier }]}>
          {t('welcome.back')}
        </Text>
        <LanguageSwitcher compact={true} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, languageStyle, { fontSize: 18 * textSizeMultiplier }]}>
          {t('actions.title')}
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={showAlert}>
          <Text style={[styles.buttonText, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            {t('testing.testNotification')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#10b981' }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={[styles.infoText, languageStyle, { fontSize: 14 * textSizeMultiplier }]}>
          Current Language: {language}
        </Text>
        <Text style={[styles.infoText, languageStyle, { fontSize: 14 * textSizeMultiplier }]}>
          Font: {languageStyle.fontFamily}
        </Text>
        <Text style={[styles.infoText, languageStyle, { fontSize: 14 * textSizeMultiplier }]}>
          Size Multiplier: {textSizeMultiplier}x
        </Text>
      </View>
      
      <LanguageSwitcher style={styles.languageSwitcher} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2563eb',
  },
  title: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    color: '#6b7280',
    marginBottom: 4,
  },
  languageSwitcher: {
    margin: 20,
  },
});

export default ExampleMultilingualScreen;
