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
  Linking
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import { useLanguage } from '../services/LanguageService';
import { getTextStyle } from '../services/FontService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [individualId, setIndividualId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async () => {
    console.log('Login attempt with:', { individualId, otp });

    if (!individualId || !otp) {
      Alert.alert(t('login.error'), t('login.enterCredentials'));
      return;
    }

    setLoading(true);
    try {
  console.log('Making API call to:', `${API_BASE_URL}/mobile/login`);
  const response = await axios.post(`${API_BASE_URL}/mobile/login`, {
        individualId: individualId,
        otp: otp
      });

      console.log('API response:', response.data);
      const { token, user } = response.data;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userId', user._id);
      await AsyncStorage.setItem('role', user.role);

      Alert.alert(t('login.loginSuccess'), t('login.welcomeUser', { name: user.name }));
      navigation.navigate('Dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        // Always show a user-friendly message for common authentication errors
        const msg = err.response.data.message ? err.response.data.message.toLowerCase() : '';
        if (
          msg.includes('invalid') ||
          msg.includes('incorrect') ||
          msg.includes('not found') ||
          msg.includes('authentication failed') ||
          msg.includes('unauthorized')
        ) {
          Alert.alert(
            t('login.error'),
            t('login.invalidCredentials')
          );
        } else {
          Alert.alert(t('login.error'), err.response.data.message);
        }
      } else {
        console.error('Network error:', err.message);
        Alert.alert(t('login.error'), t('login.networkError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo_no_bg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.appTitle, getTextStyle(language)]}>
              {t('login.title')}
            </Text>
            <Text style={[styles.subtitle, getTextStyle(language)]}>
              {t('login.subtitle')}
            </Text>
          </View>

          {/* Login Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              <Text style={[styles.formTitle, getTextStyle(language)]}>
                {t('login.signIn')}
              </Text>
              <Text style={[styles.formSubtitle, getTextStyle(language)]}>
                {t('login.signInSubtitle')}
              </Text>

              {/* Individual ID Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, getTextStyle(language)]}>
                  {t('login.individualId')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    getTextStyle(language),
                    focusedInput === 'individualId' && styles.inputFocused
                  ]}
                  placeholder={t('login.individualIdPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  value={individualId}
                  onChangeText={setIndividualId}
                  onFocus={() => setFocusedInput('individualId')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                />
              </View>

              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, getTextStyle(language)]}>
                  {t('login.otp')}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    getTextStyle(language),
                    focusedInput === 'otp' && styles.inputFocused
                  ]}
                  placeholder={t('login.otpPlaceholder')}
                  placeholderTextColor="#94a3b8"
                  value={otp}
                  onChangeText={setOtp}
                  onFocus={() => setFocusedInput('otp')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="numeric"
                  secureTextEntry
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={[styles.loginButtonText, getTextStyle(language)]}>
                  {loading ? t('login.signingIn') : t('login.signIn')}
                </Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, getTextStyle(language)]}>
                  {t('login.or') || 'OR'}
                </Text>
                <View style={styles.dividerLine} />
              </View>

              {/* SLUDI eSignet Button */}
              <View style={styles.esignetContainer}>
                <TouchableOpacity 
                  style={styles.esignetButton}
                  onPress={() => {
                    // Generate state and nonce exactly like SLUDI App
                    const state = "eree2311"; // Using same state as SLUDI App
                    const generateRandomString = (strLength = 16) => {
                      let result = '';
                      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
                      for (let i = 0; i < strLength; i++) {
                        const randomInd = Math.floor(Math.random() * characters.length);
                        result += characters.charAt(randomInd);
                      }
                      return result;
                    };
                    const nonce = generateRandomString();
                    
                    // Use exact SLUDI App configuration
                    const oidcConfig = {
                      authorizeUri: "https://sludiauth.icta.gov.lk/authorize",
                      redirect_uri: "ndp://dashboard", // Mobile app redirect
                      client_id: "IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMEyx",
                      scope: "openid%20profile%20resident-service", // URL encoded
                      nonce: nonce,
                      state: state,
                      acr_values: "mosip:idp:acr:generated-code%20mosip:idp:acr:biometrics%20mosip:idp:acr:static-code",
                      claims_locales: "en",
                      display: "page",
                      prompt: "consent",
                      max_age: 21,
                      ui_locales: "en",
                      claims: "%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D"
                    };
                    
                    // Build authorization URL exactly like SLUDI App
                    const authParams = new URLSearchParams({
                      response_type: "code",
                      client_id: oidcConfig.client_id,
                      redirect_uri: oidcConfig.redirect_uri,
                      scope: oidcConfig.scope,
                      state: oidcConfig.state,
                      nonce: oidcConfig.nonce,
                      acr_values: oidcConfig.acr_values,
                      claims_locales: oidcConfig.claims_locales,
                      display: oidcConfig.display,
                      prompt: oidcConfig.prompt,
                      max_age: oidcConfig.max_age,
                      ui_locales: oidcConfig.ui_locales,
                      claims: oidcConfig.claims
                    });
                    
                    const authUrl = `${oidcConfig.authorizeUri}?${authParams.toString()}`;
                    
                    console.log('🔐 Opening SLUDI eSignet authentication:', authUrl);
                    
                    // Open external browser
                    Linking.openURL(authUrl).catch(error => {
                      console.error('Failed to open URL:', error);
                      Alert.alert('Error', 'Unable to open authentication page');
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.esignetButtonContent}>
                    <Text style={styles.esignetIcon}>🏛️</Text>
                    <Text style={styles.esignetButtonText}>Sign in with eSignet</Text>
                  </View>
                </TouchableOpacity>
                <Text style={[styles.esignetDescription, getTextStyle(language)]}>
                  {t('login.esignetDescription') || 'Sign in with your Government Digital Identity'}
                </Text>
              </View>
            </View>
          </View>

          {/* Demo Info Section */}
          <View style={styles.demoSection}>
            <View style={styles.demoContainer}>
              <Text style={[styles.demoTitle, getTextStyle(language)]}>
                {t('login.demoAccounts')}
              </Text>
              <View style={styles.demoAccountsContainer}>
                <View style={styles.demoAccount}>
                  <Text style={[styles.demoAccountType, getTextStyle(language)]}>
                    {t('login.citizen')}
                  </Text>
                  <Text style={[styles.demoAccountId, getTextStyle(language)]}>
                    citizen001
                  </Text>
                </View>

              </View>
              <View style={styles.otpInfo}>
                <Text style={[styles.otpLabel, getTextStyle(language)]}>
                  {t('login.demoOtp')}
                </Text>
                <Text style={[styles.otpValue, getTextStyle(language)]}>
                  123456
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#1a365d',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  inputFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  demoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  demoAccountsContainer: {
    marginBottom: 16,
  },
  demoAccount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  demoAccountType: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  demoAccountId: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  otpInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  otpLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginRight: 8,
  },
  otpValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  // SLUDI eSignet Button Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  esignetContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  esignetButton: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  esignetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  esignetIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  esignetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  esignetDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 16,
  },
};

export default LoginScreen;
