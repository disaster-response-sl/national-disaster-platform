import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StyleSheet
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';

// Import internationalization hooks
import { useAppTranslation } from '../src/hooks/useAppTranslation';
import { useLanguage } from '../src/contexts/LanguageContext';
import LanguageSelector from '../src/components/LanguageSelector';
import { createTypographyStyles, COLORS, SPACING } from '../src/styles/typography';

const { width, height } = Dimensions.get('window');

interface NavigationProps {
  navigation: any;
}

const LoginScreen = ({ navigation }: NavigationProps) => {
  const [individualId, setIndividualId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  // Internationalization hooks
  const { tScreens, tCommon, getTextDirection, currentLanguage } = useAppTranslation();
  const { getCurrentLanguageNativeName } = useLanguage();
  
  // Get typography styles for current language
  const typography = createTypographyStyles(currentLanguage as 'en' | 'si' | 'ta');
  const textDirection = getTextDirection();

  const handleLogin = async () => {
    console.log('Login attempt with:', { individualId, otp });

    if (!individualId || !otp) {
      Alert.alert(
        tCommon('app.error'),
        tScreens('login.required_fields') || 'Please fill all required fields'
      );
      return;
    }

    setLoading(true);

    try {
      const userData = await AuthService.login(individualId, otp);
      console.log('✅ Login successful:', userData);
      
      if (userData.success) {
        // Set default values since AuthService doesn't return role/name
        await AsyncStorage.setItem('userRole', 'individual');
        await AsyncStorage.setItem('userName', individualId || 'User');
        
        Alert.alert(
          tCommon('app.ok'),
          tScreens('login.login_success'),
          [
            {
              text: tCommon('app.ok'),
              onPress: () => navigation.replace('Dashboard')
            }
          ]
        );
      } else {
        Alert.alert(
          tCommon('app.error'),
          userData.error || tScreens('login.login_failed') || 'Login failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      Alert.alert(
        tCommon('app.error'),
        tScreens('login.login_failed') || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1976d2" barStyle="light-content" />
      
      {/* Language Selector Button */}
      <TouchableOpacity 
        style={styles.languageButton}
        onPress={() => setShowLanguageSelector(true)}
      >
        <Text style={[styles.languageButtonText, textDirection]}>
          {getCurrentLanguageNativeName()} ⚙️
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[typography.h1, styles.title, textDirection]}>
              {tCommon('app.name')}
            </Text>
            <Text style={[typography.body, styles.subtitle, textDirection]}>
              {tScreens('login.title')}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Individual ID Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.label, styles.inputLabel, textDirection]}>
                {tScreens('login.individual_id')}
              </Text>
              <TextInput
                style={[
                  typography.input,
                  styles.textInput,
                  textDirection,
                  focusedInput === 'individualId' && styles.textInputFocused
                ]}
                placeholder={tScreens('login.enter_id') || 'Enter your Individual ID'}
                placeholderTextColor={COLORS.text.disabled}
                value={individualId}
                onChangeText={setIndividualId}
                onFocus={() => setFocusedInput('individualId')}
                onBlur={() => setFocusedInput(null)}
                autoCapitalize="none"
                keyboardType="default"
              />
            </View>

            {/* OTP Input */}
            <View style={styles.inputContainer}>
              <Text style={[typography.label, styles.inputLabel, textDirection]}>
                {tScreens('login.otp')}
              </Text>
              <TextInput
                style={[
                  typography.input,
                  styles.textInput,
                  textDirection,
                  focusedInput === 'otp' && styles.textInputFocused
                ]}
                placeholder={tScreens('login.enter_otp') || 'Enter OTP'}
                placeholderTextColor={COLORS.text.disabled}
                value={otp}
                onChangeText={setOtp}
                onFocus={() => setFocusedInput('otp')}
                onBlur={() => setFocusedInput(null)}
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[typography.button, styles.loginButtonText]}>
                {loading ? tCommon('app.loading') : tScreens('login.login_button')}
              </Text>
            </TouchableOpacity>

            {/* Additional Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity style={styles.linkButton}>
                <Text style={[typography.bodySmall, styles.linkText, textDirection]}>
                  {tScreens('login.forgot_password')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.linkButton}>
                <Text style={[typography.bodySmall, styles.linkText, textDirection]}>
                  {tScreens('login.register')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Selector Modal */}
      <LanguageSelector 
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  languageButton: {
    position: 'absolute' as const,
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  languageButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    paddingHorizontal: SPACING.lg,
  },
  headerSection: {
    alignItems: 'center' as const,
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: SPACING.lg,
  },
  title: {
    marginBottom: SPACING.sm,
    textAlign: 'center' as const,
  },
  subtitle: {
    textAlign: 'center' as const,
    color: COLORS.text.secondary,
  },
  formSection: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    marginBottom: SPACING.xs,
    color: COLORS.text.secondary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.background.primary,
  },
  textInputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.text.disabled,
  },
  loginButtonText: {
    textAlign: 'center' as const,
    color: COLORS.text.inverse,
  },
  linksContainer: {
    alignItems: 'center' as const,
  },
  linkButton: {
    paddingVertical: SPACING.sm,
  },
  linkText: {
    color: COLORS.primary,
    textAlign: 'center' as const,
  },
});

export default LoginScreen;
