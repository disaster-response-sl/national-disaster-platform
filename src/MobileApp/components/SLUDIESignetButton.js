import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const SLUDIESignetButton = ({ style }) => {
  // Generate random nonce for security
  const generateRandomString = (strLength = 16) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < strLength; i++) {
      const randomInd = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomInd);
    }
    return result;
  };

  const handleLogin = async () => {
    try {
      const nonce = generateRandomString();
      const state = 'eree2311'; // Fixed state like SLUDI app

      // URL encode parameters properly
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: 'IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMEyx', // Your specific client ID
        redirect_uri: 'ndp://dashboard', // Your app's deep link
        scope: 'openid profile resident-service',
        nonce: nonce,
        state: state,
        acr_values: 'mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code',
        claims_locales: 'en',
        display: 'page',
        prompt: 'consent',
        max_age: '21',
        ui_locales: 'en',
        claims: '{"userinfo":{"given_name":{"essential":true},"phone_number":{"essential":false},"email":{"essential":true},"picture":{"essential":false},"gender":{"essential":false},"birthdate":{"essential":false},"address":{"essential":false}},"id_token":{}}'
      });

      // Use correct base URL
      const authUrl = `https://sludiauth.icta.gov.lk/authorize?${params.toString()}`;

      console.log('🔐 Generated SLUDI URL:', authUrl);

      // Open in webview
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(authUrl, {
          // iOS properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: '#1e40af',
          preferredControlTintColor: 'white',

          // Android properties
          showTitle: false,
          toolbarColor: '#1e40af',
          secondaryToolbarColor: 'white',
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: false,

          // General properties
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          }
        });
      } else {
        // Fallback to external browser
        const canOpen = await Linking.canOpenURL(authUrl);
        if (canOpen) {
          await Linking.openURL(authUrl);
        } else {
          Alert.alert('Error', 'Cannot open authentication page');
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'Failed to open authentication page');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Sign in with SLUDI</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#1e40af',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SLUDIESignetButton;