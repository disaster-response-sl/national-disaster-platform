import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES, saveLanguagePreference } from '../locales';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface LanguageContextType {
  currentLanguage: string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  changeLanguage: (languageCode: string) => Promise<void>;
  isRTL: boolean;
  getCurrentLanguageName: () => string;
  getCurrentLanguageNativeName: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language || 'en');
  
  // RTL languages (add more as needed)
  const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur']; // Tamil and Sinhala are LTR
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  useEffect(() => {
    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleChangeLanguage = async (languageCode: string): Promise<void> => {
    try {
      // Show confirmation dialog for language change
      Alert.alert(
        t('settings:language.title') || 'Language Change',
        t('settings:language.restart_required') || 'App restart may be required for full effect. Continue?',
        [
          {
            text: t('common:app.cancel') || 'Cancel',
            style: 'cancel',
          },
          {
            text: t('common:app.confirm') || 'Confirm',
            onPress: async () => {
              await changeLanguage(languageCode);
              setCurrentLanguage(languageCode);
              
              // Show success message
              Alert.alert(
                t('common:app.ok') || 'Success',
                t('settings:language.change_success') || 'Language changed successfully'
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common:app.error') || 'Error',
        'Failed to change language. Please try again.'
      );
    }
  };

  const getCurrentLanguageName = (): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    return language?.name || 'English';
  };

  const getCurrentLanguageNativeName = (): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    return language?.nativeName || 'English';
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage: handleChangeLanguage,
    isRTL,
    getCurrentLanguageName,
    getCurrentLanguageNativeName,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
