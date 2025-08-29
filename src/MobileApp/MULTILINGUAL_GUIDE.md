# Multilingual Implementation Guide

## Overview
Your disaster response app now supports English, Sinhala (සිංහල), and Tamil (தமிழ்) with automatic device language detection and manual language switching.

## Features Added

### 1. Language Files
- **English**: `src/MobileApp/locales/en.json`
- **Sinhala**: `src/MobileApp/locales/si.json` 
- **Tamil**: `src/MobileApp/locales/ta.json`

### 2. Services
- **LanguageService**: Manages translation, language detection, and storage
- **FontService**: Handles font selection and sizing for different scripts

### 3. Components
- **LanguageSwitcher**: Allows users to cycle through languages
- **Updated DashboardScreen**: Fully translated with proper font support

## How to Use in Your Components

### 1. Import the hook
```tsx
import { useLanguage } from '../services/LanguageService';
import { getLanguageStyle, getTextSizeMultiplier } from '../services/FontService';
```

### 2. Use the hook in your component
```tsx
const YourComponent = () => {
  const { t, language } = useLanguage();
  const languageStyle = getLanguageStyle(language);
  const textSizeMultiplier = getTextSizeMultiplier(language);
  
  return (
    <Text style={[styles.text, languageStyle, { fontSize: 16 * textSizeMultiplier }]}>
      {t('your.translation.key')}
    </Text>
  );
};
```

### 3. Add translations to language files
Add your text keys to all three language files:

**en.json**:
```json
{
  "your": {
    "translation": {
      "key": "Your English text"
    }
  }
}
```

**si.json**:
```json
{
  "your": {
    "translation": {
      "key": "ඔබේ සිංහල පෙළ"
    }
  }
}
```

**ta.json**:
```json
{
  "your": {
    "translation": {
      "key": "உங்கள் தமிழ் உரை"
    }
  }
}
```

## Key Features

### Automatic Device Language Detection
- Detects device language on first launch
- Falls back to English if device language not supported
- Supports Sri Lankan locale variations

### Manual Language Switching
- Compact switcher in header: `<LanguageSwitcher compact={true} />`
- Full switcher in settings: `<LanguageSwitcher />`
- Cycles through: English → සිංහල → தமிழ் → English

### Font Support
- Uses system fonts that support Sinhala/Tamil scripts
- iOS: Noto Sans Sinhala/Tamil (built-in)
- Android: noto-sans-sinhala/tamil (system fonts)
- Automatic text size adjustment for better readability

### Language Persistence
- Saves user's language choice to AsyncStorage
- Remembers preference across app restarts

## Testing
The DashboardScreen includes test buttons to verify the multilingual functionality:
- Language switcher in header
- Full language switcher at bottom
- All UI text properly translated
- Proper font rendering for Sinhala/Tamil

## Extending to Other Screens
1. Wrap your app with `LanguageProvider` (already done in App.tsx)
2. Import and use the `useLanguage` hook
3. Apply `languageStyle` and `textSizeMultiplier` to Text components
4. Add translation keys to all language files
5. Use `t('key.path')` for text content

## Performance Notes
- Language files are loaded once at app startup
- Font changes are applied dynamically based on current language
- No performance impact on text rendering
- Translations are cached in memory

## Current Implementation Status
✅ Language service and context
✅ Font support for Sinhala/Tamil  
✅ Device language detection
✅ Manual language switching
✅ DashboardScreen fully translated
✅ Notification translations
✅ AsyncStorage persistence

## Next Steps
To complete the multilingual implementation:
1. Translate other screens (LoginScreen, SosScreen, etc.)
2. Add more translation keys as needed
3. Test with actual Sinhala/Tamil speakers
4. Consider adding RTL support if needed
