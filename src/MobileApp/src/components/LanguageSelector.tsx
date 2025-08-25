import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
  showInModal?: boolean;
}

const { width, height } = Dimensions.get('window');

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
  showInModal = true,
}) => {
  const { t } = useTranslation();
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();

  // Debug logging
  console.log('🌐 LanguageSelector rendered:', {
    visible,
    currentLanguage,
    supportedLanguagesCount: supportedLanguages?.length,
    supportedLanguages,
  });

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
    onClose();
  };

  const renderLanguageOption = (language: typeof supportedLanguages[0]) => (
    <TouchableOpacity
      key={language.code}
      style={[
        styles.languageOption,
        currentLanguage === language.code && styles.selectedLanguage,
      ]}
      onPress={() => handleLanguageSelect(language.code)}
      activeOpacity={0.7}
    >
      <View style={styles.languageInfo}>
        <Text style={[
          styles.languageName,
          currentLanguage === language.code && styles.selectedLanguageText
        ]}>
          {language.name}
        </Text>
        <Text style={[
          styles.languageNativeName,
          currentLanguage === language.code && styles.selectedLanguageText
        ]}>
          {language.nativeName}
        </Text>
      </View>
      {currentLanguage === language.code && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('language.select') || 'Select Language'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {/* Debug info */}
      <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 12, color: '#666' }}>
          Debug: Languages({supportedLanguages?.length || 0}), Current: {currentLanguage}
        </Text>
      </View>
      
      <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
        {supportedLanguages.map(renderLanguageOption)}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.currentLanguageText}>
          {t('language.current') || 'Current'}: {t(`language.${currentLanguage}`) || currentLanguage.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (showInModal) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
        statusBarTranslucent={true}
        presentationStyle="overFullScreen"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={() => {}} // Prevent closing when touching modal content
          >
            {content}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  return visible ? content : null;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width * 0.85,
    minHeight: 300,
    maxHeight: height * 0.75,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    zIndex: 10000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  languageList: {
    paddingHorizontal: 20,
    minHeight: 180,
    maxHeight: 300,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedLanguage: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 2,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  languageNativeName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  selectedLanguageText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  currentLanguageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LanguageSelector;
