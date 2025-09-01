import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const SLUDIESignetButton = ({ style }) => {
  const handleLogin = async () => {
    try {
      // Simple authorization URL construction
      const authUrl = `https://sludiauth.icta.gov.lk/login?response_type=code&client_id=IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMEyx&redirect_uri=ndp://dashboard&scope=openid%20profile%20resident-service&acr_values=mosip:idp:acr:generated-code%20mosip:idp:acr:biometrics%20mosip:idp:acr:static-code&display=page&prompt=consent&max_age=21&ui_locales=en&claims=%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D`;

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