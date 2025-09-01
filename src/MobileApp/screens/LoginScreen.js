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
  Dimensions
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import { useLanguage } from '../services/LanguageService';
import { getTextStyle } from '../services/FontService';
import ESignetButton from '../components/ESignetButton';

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

              {/* Separator */}
              <View style={styles.separatorContainer}>
                <View style={styles.separatorLine} />
                <Text style={[styles.separatorText, getTextStyle(language)]}>
                  OR
                </Text>
                <View style={styles.separatorLine} />
              </View>

              {/* eSignet Authentication Button (Integration Guide Compliant) */}
              <ESignetButton 
                navigation={navigation}
                disabled={loading}
                style={styles.esignetButtonContainer}
              />
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
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  separatorText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  esignetButtonContainer: {
    marginTop: 4,
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
};

export default LoginScreen;
