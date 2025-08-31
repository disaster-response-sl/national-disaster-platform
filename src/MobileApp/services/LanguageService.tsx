import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import language files
import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

// Language type
export type Language = 'en' | 'si' | 'ta';

// Translation resources
const translations = {
  en,
  si,
  ta
};

// Language context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  isLoading: boolean;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Get device language
const getDeviceLanguage = (): Language => {
  let deviceLanguage = 'en';
  
  if (Platform.OS === 'ios') {
    deviceLanguage = NativeModules.SettingsManager?.settings?.AppleLocale ||
                    NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
                    'en';
  } else {
    deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
  }
  
  // Extract language code (first 2 characters)
  const langCode = deviceLanguage.substring(0, 2).toLowerCase();
  
  // Map to supported languages
  switch (langCode) {
    case 'si':
      return 'si';
    case 'ta':
      return 'ta';
    default:
      return 'en';
  }
};

// Translation function
const translate = (key: string, language: Language, vars?: Record<string, string | number>): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if not found in fallback
        }
      }
      break;
    }
  }
  
  let result = typeof value === 'string' ? value : key;

  // Simple token replacement for {var} in translation strings
  if (vars && typeof result === 'string') {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return result;
};

// Language provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize language
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Try to get saved language from storage
        const savedLanguage = await AsyncStorage.getItem('app_language');
        
        if (savedLanguage && ['en', 'si', 'ta'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Language);
        } else {
          // Use device language if no saved preference
          const deviceLang = getDeviceLanguage();
          setLanguageState(deviceLang);
          await AsyncStorage.setItem('app_language', deviceLang);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        setLanguageState('en'); // Fallback to English
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Set language function
  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('app_language', lang);
      console.log(`Language changed to: ${lang}`);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Translation function
  const t = (key: string, vars?: Record<string, string | number>): string => {
    return translate(key, language, vars);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language names for display
export const getLanguageName = (lang: Language): string => {
  switch (lang) {
    case 'en':
      return 'English';
    case 'si':
      return 'සිංහල';
    case 'ta':
      return 'தமிழ்';
    default:
      return 'English';
  }
};
