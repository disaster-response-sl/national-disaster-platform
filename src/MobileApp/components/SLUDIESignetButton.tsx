import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Linking, Alert } from 'react-native';
import { ESIGNET_ENV_CONFIG, ESIGNET_CLIENT_DETAILS } from '../config/esignetConfig';

interface SLUDIESignetButtonProps {
  style?: any;
  onPress?: () => void;
}

const SLUDIESignetButton: React.FC<SLUDIESignetButtonProps> = ({ style, onPress }) => {
  
  // Generate fresh state and nonce for OIDC security
  const generateRandomString = (strLength = 16) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < strLength; i++) {
      const randomInd = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomInd);
    }
    return result;
  };

  const handleESignetLogin = async () => {
    try {
      if (onPress) {
        onPress();
      }

      // Generate state and nonce for OIDC security
      const state = `mobile_${Date.now()}_${generateRandomString()}`;
      const nonce = generateRandomString();
      
      // Construct the authorization URL using SLUDI backend configuration
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: ESIGNET_ENV_CONFIG.CLIENT_ID,
        redirect_uri: ESIGNET_ENV_CONFIG.REDIRECT_URI,
        scope: 'openid profile',
        state: state,
        nonce: nonce,
        acr_values: ESIGNET_ENV_CONFIG.ACRS,
        claims: ESIGNET_ENV_CONFIG.CLAIMS_USER_PROFILE,
        ui_locales: 'en'
      });

      const authUrl = `${ESIGNET_ENV_CONFIG.authorizeUri}?${authParams.toString()}`;
      
      console.log('🔐 Opening eSignet authentication URL:', authUrl);
      console.log('📱 State for session tracking:', state);
      
      // Open external browser for authentication
      const canOpen = await Linking.canOpenURL(authUrl);
      if (canOpen) {
        await Linking.openURL(authUrl);
      } else {
        Alert.alert(
          'Authentication Error',
          'Unable to open authentication page. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Failed to initiate eSignet login:', error);
      Alert.alert(
        'Authentication Error',
        'Failed to start authentication process. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleESignetLogin}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏛️</Text>
          </View>
          <Text style={styles.buttonText}>Sign in with eSignet</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SLUDIESignetButton;
