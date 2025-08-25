# Complete Multilingual Implementation Guide for React Native Disaster Response App

## 📁 Project Structure

```
src/
├── locales/                   # Translation files
│   ├── en/                   # English translations
│   │   ├── common.json       # Common UI elements
│   │   ├── screens.json      # Screen-specific text
│   │   ├── settings.json     # Settings screen text
│   │   └── index.ts          # Export all translations
│   ├── si/                   # Sinhala translations (same structure)
│   ├── ta/                   # Tamil translations (same structure)
│   └── index.ts              # i18n configuration
├── contexts/
│   └── LanguageContext.tsx   # Language state management
├── hooks/
│   └── useAppTranslation.ts  # Translation utilities
├── components/
│   └── LanguageSelector.tsx  # Language selection UI
└── styles/
    └── typography.ts         # Font and styling system
```

## 🚀 Quick Start Implementation

### 1. Update your App.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Import i18n configuration and providers
import initI18n from './src/locales';
import { LanguageProvider } from './src/contexts/LanguageContext';

const App: React.FC = () => {
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initI18n();
        setI18nInitialized(true);
      } catch (error) {
        console.error('Error initializing i18n:', error);
        setI18nInitialized(true); // Still show app
      }
    };
    initializeApp();
  }, []);

  if (!i18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <LanguageProvider>
      {/* Your existing navigation and screens */}
      <NavigationContainer>
        {/* ... your stack navigator ... */}
      </NavigationContainer>
    </LanguageProvider>
  );
};

export default App;
```

### 2. Update any Screen Component

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAppTranslation } from '../src/hooks/useAppTranslation';
import { useLanguage } from '../src/contexts/LanguageContext';
import LanguageSelector from '../src/components/LanguageSelector';

const ExampleScreen: React.FC = ({ navigation }) => {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Get translation functions
  const { tScreens, tCommon, formatRelativeTime, getSeverityText } = useAppTranslation();
  const { getCurrentLanguageNativeName } = useLanguage();

  const handleEmergency = () => {
    Alert.alert(
      tCommon('app.confirm'), // "Confirm"
      tScreens('sos.confirm_sos'), // "Are you sure you want to send an emergency SOS?"
      [
        { text: tCommon('app.cancel'), style: 'cancel' },
        { 
          text: tCommon('app.yes'),
          onPress: () => {
            // Send SOS logic
            Alert.alert(tCommon('app.ok'), tScreens('sos.sos_sent'));
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Language selector button */}
      <TouchableOpacity 
        style={{ alignSelf: 'flex-end', marginBottom: 20 }}
        onPress={() => setShowLanguageSelector(true)}
      >
        <Text>{getCurrentLanguageNativeName()} ⚙️</Text>
      </TouchableOpacity>

      {/* Screen content with translations */}
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        {tScreens('dashboard.welcome', { name: 'User' })}
      </Text>
      
      <TouchableOpacity 
        style={{ backgroundColor: '#ff4444', padding: 15, borderRadius: 8 }}
        onPress={handleEmergency}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {tScreens('sos.send_sos')}
        </Text>
      </TouchableOpacity>

      {/* Language selector modal */}
      <LanguageSelector 
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </View>
  );
};
```

## 🔧 Key Features Implemented

### 1. **Automatic Language Detection**
- Detects device language on first launch
- Falls back to English if device language not supported
- Saves user preference for subsequent launches

### 2. **Dynamic Language Switching**
- Change language without app restart
- Immediate UI updates
- Persistent language preference

### 3. **Font Support for Local Scripts**
- Optimized fonts for Sinhala and Tamil
- Appropriate line heights and spacing
- Fallback to system fonts if custom fonts unavailable

### 4. **Translation Utilities**
- `useAppTranslation()` hook for common patterns
- Formatted time/date/numbers for each locale
- Emergency message translations in multiple languages

### 5. **Accessible Language Selector**
- Modal interface for language selection
- Shows current language and available options
- Native script display for each language

## 📱 Usage Examples

### Basic Translation
```tsx
const { tCommon, tScreens } = useAppTranslation();

// Common elements
<Text>{tCommon('app.loading')}</Text>           // "Loading..." / "පූරණය වෙමින්..." / "ஏற்றுகிறது..."
<Text>{tCommon('app.error')}</Text>             // "Error" / "දෝෂය" / "பிழை"

// Screen-specific
<Text>{tScreens('login.title')}</Text>          // "Login" / "පිවිසීම" / "உள்நுழைவு"
<Text>{tScreens('dashboard.welcome', { name: 'John' })}</Text> // "Welcome, John" with proper localization
```

### Disaster Types & Severity
```tsx
const { getDisasterTypeText, getSeverityText } = useAppTranslation();

<Text>{getDisasterTypeText('flood')}</Text>     // "Flood" / "ගංවතුර" / "வெள்ளம்"
<Text>{getSeverityText('high')}</Text>          // "High" / "ඉහළ" / "உயர்"
```

### Time Formatting
```tsx
const { formatRelativeTime, formatDate } = useAppTranslation();

<Text>{formatRelativeTime(new Date(Date.now() - 30000))}</Text>    // "30 seconds ago" localized
<Text>{formatDate(new Date())}</Text>                              // Formatted according to locale
```

### Emergency Messages
```tsx
const { getEmergencyMessage } = useEmergencyTranslation();

Alert.alert(getEmergencyMessage('evacuation_required')); 
// Shows in all three languages: "Evacuation Required - පිටවීම අවශ්‍යයි - வெளியேற்றம் தேவை"
```

## 🎨 Typography & Styling

### Language-Specific Fonts
```tsx
import { createTypographyStyles, getFontStyle } from '../src/styles/typography';

const MyComponent = () => {
  const { currentLanguage } = useAppTranslation();
  const typography = createTypographyStyles(currentLanguage);
  
  return (
    <Text style={typography.h1}>
      {/* Automatically uses correct font for current language */}
    </Text>
  );
};
```

### Custom Font Implementation
```tsx
const customStyle = {
  fontSize: 16,
  ...getFontStyle(currentLanguage, 'bold', 'large'),
  color: '#333'
};
```

## 📦 Required Dependencies

Already installed in your project:
- `react-native-localize` - Device language detection
- `i18next` - Core internationalization
- `react-i18next` - React integration

## 🔤 Font Installation

### For Production Use:

1. **Download Noto Fonts:**
   - [Noto Sans Sinhala](https://fonts.google.com/noto/specimen/Noto+Sans+Sinhala)
   - [Noto Sans Tamil](https://fonts.google.com/noto/specimen/Noto+Sans+Tamil)

2. **Add to Project:**
   ```
   src/assets/fonts/
   ├── NotoSansSinhala-Regular.ttf
   ├── NotoSansSinhala-Bold.ttf
   ├── NotoSansTamil-Regular.ttf
   └── NotoSansTamil-Bold.ttf
   ```

3. **Link Fonts:**
   ```bash
   npx react-native link
   ```

## 🧪 Testing

### Test Different Languages
```tsx
import { changeLanguage } from '../src/locales';

// In your test or development code
await changeLanguage('si'); // Switch to Sinhala
await changeLanguage('ta'); // Switch to Tamil
await changeLanguage('en'); // Switch to English
```

### Test Sample Content
```tsx
// Test these translations work in your UI:
const testStrings = {
  en: "Emergency Alert: Flood warning in your area",
  si: "හදිසි අනතුරු ඇඟවීම: ඔබේ ප්‍රදේශයේ ගංවතුර අනතුරු ඇඟවීම",
  ta: "அவசரகால எச්சरிக்கै: உங்கள் பகுதியில் வெள்ள எச්சரிக்கை"
};
```

## 🚀 Performance Optimizations

1. **Lazy Loading:** Translation files are loaded only when needed
2. **Caching:** Translated strings are cached for performance
3. **Fallbacks:** Graceful degradation if translations missing
4. **Font Optimization:** Only load fonts actually used

## 🔄 Adding New Languages

To add a new language (e.g., Hindi):

1. Create `src/locales/hi/` directory
2. Add translation files: `common.json`, `screens.json`, `settings.json`
3. Update `SUPPORTED_LANGUAGES` in `src/locales/index.ts`
4. Add font support in `typography.ts` if needed

## 🛠️ Troubleshooting

### Common Issues:

1. **Translations not showing:**
   - Check if i18n is initialized in App.tsx
   - Verify translation keys exist in JSON files

2. **Fonts not rendering:**
   - Ensure font files are in correct directory
   - Rebuild app after adding fonts
   - Check font names match exactly

3. **Performance issues:**
   - Use `t()` function sparingly in render loops
   - Consider memoizing translated strings

4. **Device language not detected:**
   - Check `react-native-localize` permissions
   - Verify supported languages include device language

## 📈 Best Practices

1. **Key Naming:** Use descriptive, hierarchical keys (`screens:login.title`)
2. **Pluralization:** Use i18next plural forms for count-dependent text
3. **Context:** Provide context parameters for dynamic content
4. **Fallbacks:** Always provide English fallbacks
5. **Testing:** Test with actual native speakers
6. **Performance:** Monitor app size increase with fonts/translations

This implementation provides a robust, scalable multilingual foundation for your disaster response app with proper support for Sinhala and Tamil languages.
