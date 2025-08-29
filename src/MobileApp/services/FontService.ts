import { Platform } from 'react-native';
import { Language } from './LanguageService';

// Font families that support Sinhala and Tamil
export const getFontFamily = (language: Language): string => {
  if (Platform.OS === 'ios') {
    switch (language) {
      case 'si':
        return 'Noto Sans Sinhala'; // iOS has this built-in
      case 'ta':
        return 'Noto Sans Tamil'; // iOS has this built-in
      default:
        return 'System';
    }
  } else {
    // Android - use system fonts that support Unicode properly
    switch (language) {
      case 'si':
        return 'sans-serif'; // Android default with Unicode support
      case 'ta':
        return 'sans-serif'; // Android default with Unicode support
      default:
        return 'Roboto';
    }
  }
};

// Font styles for different languages
export const getLanguageStyle = (language: Language) => {
  const fontFamily = getFontFamily(language);
  
  return {
    fontFamily,
    // Increase line height significantly for better readability of Sinhala/Tamil
    lineHeight: language === 'si' || language === 'ta' ? 28 : 20,
    // Add letter spacing for better character separation
    letterSpacing: language === 'si' || language === 'ta' ? 0.5 : 0,
  };
};

// Text size adjustments for different scripts
export const getTextSizeMultiplier = (language: Language): number => {
  switch (language) {
    case 'si':
      return 1.15; // Sinhala needs larger text for clarity
    case 'ta':
      return 1.1; // Tamil needs slightly larger text
    default:
      return 1.0;
  }
};

// Get complete text style for a given language and base font size
export const getTextStyle = (language: Language, baseFontSize: number = 16) => {
  const languageStyle = getLanguageStyle(language);
  const textSizeMultiplier = getTextSizeMultiplier(language);
  
  return {
    ...languageStyle,
    fontSize: baseFontSize * textSizeMultiplier,
    // Ensure proper text rendering for complex scripts
    includeFontPadding: false, // Android only
    textAlignVertical: 'center' as const, // Android only
  };
};
