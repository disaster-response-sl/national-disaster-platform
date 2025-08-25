import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import language resources
import en from './en';
import si from './si';
import ta from './ta';

// Language resources with flattened structure for easier access
const resources = {
  en: {
    translation: {
      ...en.common,
      ...en.screens,
      ...en.settings,
    }
  },
  si: {
    translation: {
      ...si.common,
      ...si.screens,
      ...si.settings,
    }
  },
  ta: {
    translation: {
      ...ta.common,
      ...ta.screens,
      ...ta.settings,
    }
  },
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

// Get device's preferred language
const getDeviceLanguage = (): string => {
  const locales = getLocales();
  if (locales && locales.length > 0) {
    const deviceLanguage = locales[0].languageCode;
    // Check if device language is supported
    const supportedCodes = SUPPORTED_LANGUAGES.map(lang => lang.code);
    return supportedCodes.includes(deviceLanguage) ? deviceLanguage : 'en';
  }
  return 'en'; // fallback to English
};

// Get saved language preference or device language
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('app_language');
    if (savedLanguage && SUPPORTED_LANGUAGES.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }
    return getDeviceLanguage();
  } catch (error) {
    console.warn('Error getting saved language:', error);
    return getDeviceLanguage();
  }
};

// Save language preference
export const saveLanguagePreference = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('app_language', languageCode);
  } catch (error) {
    console.warn('Error saving language preference:', error);
  }
};

// Change language dynamically
export const changeLanguage = async (languageCode: string): Promise<void> => {
  try {
    await i18n.changeLanguage(languageCode);
    await saveLanguagePreference(languageCode);
  } catch (error) {
    console.warn('Error changing language:', error);
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  console.log('🌐 Initializing i18n with language:', initialLanguage);
  console.log('🌐 Available resources:', Object.keys(resources));
  console.log('🌐 English resources structure:', Object.keys(resources.en));
  
  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4', // For React Native compatibility
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      debug: true, // Force debug mode
      
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      // Namespace configuration
      defaultNS: 'translation',
      ns: ['translation'],
      
      // React specific options
      react: {
        useSuspense: false, // Disable suspense for React Native
      },
      
      // Pluralization rules
      pluralSeparator: '_',
      contextSeparator: '_',
      
      // Cache configuration
      cache: {
        enabled: true,
      },
    });
    
  console.log('i18n initialized with language:', initialLanguage);
};

// Export the i18n instance
export { i18n };
export default initI18n;
