import { StyleSheet, TextStyle } from 'react-native';

/**
 * Font configuration for multilingual support
 * 
 * For production, you should:
 * 1. Add Noto Sans fonts to android/app/src/main/assets/fonts/
 * 2. Configure fonts in react-native.config.js
 * 3. Run `npx react-native link` or use auto-linking
 */

// Font families for different languages
export const FONT_FAMILIES = {
  en: {
    regular: 'System',
    bold: 'System',
    light: 'System',
  },
  si: {
    regular: 'NotoSansSinhala-Regular',
    bold: 'NotoSansSinhala-Bold',
    light: 'NotoSansSinhala-Light',
  },
  ta: {
    regular: 'NotoSansTamil-Regular',
    bold: 'NotoSansTamil-Bold',
    light: 'NotoSansTamil-Light',
  },
};

// Font sizes that work well across all languages
export const FONT_SIZES = {
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 20,
  xxxlarge: 24,
  heading: 28,
  title: 32,
};

// Line heights optimized for different scripts
export const LINE_HEIGHTS = {
  en: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 26,
    xxlarge: 28,
    heading: 36,
    title: 40,
  },
  si: {
    small: 18, // Sinhala needs more line height
    medium: 22,
    large: 26,
    xlarge: 28,
    xxlarge: 30,
    heading: 38,
    title: 42,
  },
  ta: {
    small: 18, // Tamil also needs more line height
    medium: 22,
    large: 26,
    xlarge: 28,
    xxlarge: 30,
    heading: 38,
    title: 42,
  },
};

/**
 * Get font style for specific language and weight
 */
export const getFontStyle = (
  language: 'en' | 'si' | 'ta' = 'en',
  weight: 'regular' | 'bold' | 'light' = 'regular',
  size: keyof typeof FONT_SIZES = 'medium'
): TextStyle => {
  return {
    fontFamily: FONT_FAMILIES[language][weight],
    fontSize: FONT_SIZES[size],
    lineHeight: LINE_HEIGHTS[language][size],
  };
};

/**
 * Typography styles for different languages
 */
export const createTypographyStyles = (language: 'en' | 'si' | 'ta' = 'en') => {
  return StyleSheet.create({
    // Headers
    h1: {
      ...getFontStyle(language, 'bold', 'title'),
      color: '#1a1a1a',
    },
    h2: {
      ...getFontStyle(language, 'bold', 'heading'),
      color: '#1a1a1a',
    },
    h3: {
      ...getFontStyle(language, 'bold', 'xxlarge'),
      color: '#1a1a1a',
    },
    h4: {
      ...getFontStyle(language, 'bold', 'xlarge'),
      color: '#1a1a1a',
    },
    
    // Body text
    body: {
      ...getFontStyle(language, 'regular', 'medium'),
      color: '#333333',
    },
    bodyLarge: {
      ...getFontStyle(language, 'regular', 'large'),
      color: '#333333',
    },
    bodySmall: {
      ...getFontStyle(language, 'regular', 'small'),
      color: '#666666',
    },
    
    // UI text
    button: {
      ...getFontStyle(language, 'bold', 'medium'),
      color: '#ffffff',
      textAlign: 'center',
    },
    buttonSecondary: {
      ...getFontStyle(language, 'bold', 'medium'),
      color: '#2196f3',
      textAlign: 'center',
    },
    label: {
      ...getFontStyle(language, 'regular', 'small'),
      color: '#666666',
      textTransform: 'uppercase' as const,
    },
    input: {
      ...getFontStyle(language, 'regular', 'medium'),
      color: '#333333',
    },
    placeholder: {
      ...getFontStyle(language, 'regular', 'medium'),
      color: '#999999',
    },
    
    // Emergency/Alert text
    emergency: {
      ...getFontStyle(language, 'bold', 'large'),
      color: '#d32f2f',
    },
    warning: {
      ...getFontStyle(language, 'bold', 'medium'),
      color: '#f57c00',
    },
    success: {
      ...getFontStyle(language, 'bold', 'medium'),
      color: '#388e3c',
    },
    
    // Navigation
    navigationTitle: {
      ...getFontStyle(language, 'bold', 'large'),
      color: '#1a1a1a',
    },
    tabLabel: {
      ...getFontStyle(language, 'regular', 'small'),
      color: '#666666',
    },
    tabLabelActive: {
      ...getFontStyle(language, 'bold', 'small'),
      color: '#2196f3',
    },
  });
};

/**
 * Common spacing values that work well across all languages
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Color palette
 */
export const COLORS = {
  primary: '#2196f3',
  primaryDark: '#1976d2',
  secondary: '#ff4081',
  error: '#d32f2f',
  warning: '#f57c00',
  success: '#388e3c',
  info: '#0288d1',
  
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#ffffff',
  },
  
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    disabled: '#e9ecef',
  },
  
  border: '#e0e0e0',
  divider: '#e0e0e0',
};

/**
 * Common shadows
 */
export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export default {
  FONT_FAMILIES,
  FONT_SIZES,
  LINE_HEIGHTS,
  getFontStyle,
  createTypographyStyles,
  SPACING,
  COLORS,
  SHADOWS,
};
