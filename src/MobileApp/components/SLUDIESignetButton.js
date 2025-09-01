import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import 'react-native-url-polyfill/auto';

const SLUDIESignetButton = ({ style, onPress, onSuccess, onError }) => {
  
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
      
      // Construct authorization URL with your exact values
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: 'IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjNjin',
        redirect_uri: 'ndp://dashboard',
        scope: 'openid%20profile%20resident-service',
        state: state,
        nonce: nonce,
        acr_values: 'mosip:idp:acr:generated-code%20mosip:idp:acr:biometrics%20mosip:idp:acr:static-code',
        claims: '%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D',
        ui_locales: 'en',
        display: 'page',
        prompt: 'consent',
        max_age: '21'
      });

    //   const authUrl = `https://sludiauth.icta.gov.lk/login?${authParams.toString()}`;
      const authUrl=`https://sludiauth.icta.gov.lk/v1/esignet/oauth/v2/authorize?${authParams.toString()}`;
      
      console.log('🔐 Opening eSignet authentication URL:', authUrl);

      // Check if InAppBrowser is available
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(authUrl, 'ndp://dashboard', {
          // iOS properties
          ephemeralWebSession: false,
          preferredBarTintColor: '#1e40af',
          preferredControlTintColor: 'white',
          readerMode: false,
          
          // Android properties
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: false,
          
          // General properties
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        console.log('🔐 Browser result:', result);

        if (result.type === 'success') {
          // Parse the callback URL to extract authorization code
          const url = new URL(result.url);
          const code = url.searchParams.get('code');
          const returnedState = url.searchParams.get('state');
          const error = url.searchParams.get('error');
          const errorDescription = url.searchParams.get('error_description');

          if (error) {
            console.error('❌ Authentication error:', error, errorDescription);
            if (onError) {
              onError({ error, errorDescription });
            } else {
              Alert.alert(
                'Authentication Failed',
                errorDescription || 'An error occurred during authentication',
                [{ text: 'OK' }]
              );
            }
          } else if (code && returnedState === state) {
            console.log('✅ Authorization code received:', code);
            if (onSuccess) {
              onSuccess({ code, state: returnedState });
            } else {
              // Here you would typically exchange the code for tokens
              Alert.alert(
                'Success',
                'Authentication successful! Code: ' + code,
                [{ text: 'OK' }]
              );
            }
          } else {
            console.error('❌ Invalid state or missing code');
            Alert.alert(
              'Authentication Error',
              'Invalid response from authentication server',
              [{ text: 'OK' }]
            );
          }
        } else if (result.type === 'cancel') {
          console.log('🚫 User cancelled authentication');
          if (onError) {
            onError({ error: 'cancelled', errorDescription: 'User cancelled authentication' });
          }
        }
      } else {
        // Fallback to regular Linking if InAppBrowser is not available
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
      }
    } catch (error) {
      console.error('❌ Failed to initiate eSignet login:', error);
      if (onError) {
        onError({ error: 'unknown', errorDescription: error.message });
      } else {
        Alert.alert(
          'Authentication Error',
          'Failed to start authentication process. Please try again.',
          [{ text: 'OK' }]
        );
      }
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
    marginVertical: 20,
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