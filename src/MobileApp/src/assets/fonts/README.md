# Font Installation Guide for Multilingual Support

## Required Fonts

To properly display Sinhala and Tamil text, you need to install the following Google Noto fonts:

### Sinhala Fonts
- `NotoSansSinhala-Regular.ttf`
- `NotoSansSinhala-Bold.ttf`
- `NotoSansSinhala-Light.ttf`

### Tamil Fonts
- `NotoSansTamil-Regular.ttf`
- `NotoSansTamil-Bold.ttf`
- `NotoSansTamil-Light.ttf`

## Installation Steps

### 1. Download Fonts
Download the required fonts from Google Fonts:
- [Noto Sans Sinhala](https://fonts.google.com/noto/specimen/Noto+Sans+Sinhala)
- [Noto Sans Tamil](https://fonts.google.com/noto/specimen/Noto+Sans+Tamil)

### 2. Add Fonts to Project
Place the downloaded font files in this directory:
`src/assets/fonts/`

### 3. Update Android Configuration
Add the following to `android/app/build.gradle`:

```gradle
android {
    ...
    assetExtensions = ['ttf', 'otf']
}
```

### 4. Update iOS Configuration
For iOS, the fonts will be automatically linked through React Native's auto-linking feature.

### 5. Link Fonts
Run the following command to link the fonts:

```bash
npx react-native link
```

Or if using React Native 0.60+, the fonts should be auto-linked.

### 6. Verify Installation
After installing fonts, verify they work by:
1. Restarting the Metro bundler
2. Rebuilding the app for both Android and iOS
3. Testing with Sinhala and Tamil text

## Fallback Fonts

If custom fonts fail to load, the app will fall back to system fonts:
- Android: Default system fonts support Sinhala and Tamil
- iOS: San Francisco font with Sinhala/Tamil support

## Testing

Test the fonts with these sample texts:

### Sinhala
```
ආයුබෝවන්! මෙය සිංහල පරීක්ෂණ පාඨයකි.
```

### Tamil
```
வணக்கம்! இது தமிழ் சோதனை உரை.
```

## Troubleshooting

1. **Fonts not displaying correctly:**
   - Ensure font files are in the correct directory
   - Rebuild the app completely
   - Check font file names match exactly

2. **Performance issues:**
   - Consider using system fonts for better performance
   - Only load fonts that are actually needed

3. **Bundle size concerns:**
   - Subset fonts to include only required characters
   - Use font-display: swap for web versions
