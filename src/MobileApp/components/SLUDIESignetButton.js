import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Linking, Alert } from 'react-native';

const SLUDIESignetButton = ({ style, onPress }) => {
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

      // Generate state and nonce for OIDC
      const state = `mobile_${Date.now()}_${generateRandomString()}`;
      const nonce = generateRandomString();

      // Define claims properly
      const claims = {
        userinfo: {
          given_name: { essential: true },
          phone_number: { essential: false },
          email: { essential: true },
          picture: { essential: false },
          gender: { essential: false },
          birthdate: { essential: false },
          address: { essential: false },
        },
        id_token: {},
      };

      // Auth params
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: 'IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMEyx', // ✅ Replace with real client_id
        redirect_uri: 'ndp://dashboard',  // ✅ Must match your app's configured redirect URI
        scope: 'openid',
        state,
        nonce,
        acr_values:
          'mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code',
        claims: JSON.stringify(claims), // ✅ stringify claims
        ui_locales: 'en',
        display: 'page',
        prompt: 'consent',
        max_age: 21, // ✅ should be number
      });

      const authUrl = `https://sludiauth.icta.gov.lk/v1/esignet/oauth/v2/authorize?${authParams.toString()}`;

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
            <Text style={styles.icon}>🏛</Text>
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