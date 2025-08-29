import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage, Language, getLanguageName } from '../services/LanguageService';
import { getTextStyle } from '../services/FontService';

interface LanguageSwitcherProps {
  style?: any;
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ style, compact = false }) => {
  const { language, setLanguage, t } = useLanguage();

  const languages: Language[] = ['en', 'si', 'ta'];

  const handleLanguageChange = () => {
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactButton, style]} 
        onPress={handleLanguageChange}
      >
        <Text style={[styles.compactButtonText, getTextStyle(language, 12)]}>
          {getLanguageName(language)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, getTextStyle(language, 16)]}>{t('language.change')}</Text>
      <View style={styles.languageRow}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageButton,
              language === lang && styles.activeLanguageButton
            ]}
            onPress={() => setLanguage(lang)}
          >
            <Text style={[
              styles.languageText,
              getTextStyle(lang, 14),
              language === lang && styles.activeLanguageText
            ]}>
              {getLanguageName(lang)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeLanguageButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeLanguageText: {
    color: '#ffffff',
  },
  compactButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  compactButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default LanguageSwitcher;
