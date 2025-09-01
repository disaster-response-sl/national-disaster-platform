// screens/SLUDIAuthScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { ESIGNET_CONFIG, generateESignetAuthURL, exchangeCodeForTokens } from '../config/sludi';

interface SLUDIAuthScreenProps {
  navigation: any;
  route: any;
}

const SLUDIAuthScreen: React.FC<SLUDIAuthScreenProps> = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  React.useEffect(() => {
    initializeSLUDIAuth();
  }, []);

  const initializeSLUDIAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate eSignet authorization URL directly (eSignet Integration Guide compliant)
      const state = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store state and nonce for validation
      await AsyncStorage.setItem('esignet_state', state);
      await AsyncStorage.setItem('esignet_nonce', nonce);
      
      const esignetAuthUrl = generateESignetAuthURL(state, nonce);
      console.log('🔐 Generated eSignet Auth URL:', esignetAuthUrl);
      
      setAuthUrl(esignetAuthUrl);
    } catch (err) {
      console.error('eSignet initialization error:', err);
      setError('Failed to initialize eSignet authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('🌐 WebView navigation:', url);
    
    // Check if this is the callback URL with authorization code
    if (url.includes('/auth/callback') || url.includes('code=')) {
      try {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const state = urlObj.searchParams.get('state');
        const error = urlObj.searchParams.get('error');

        if (error) {
          Alert.alert(
            'Authentication Failed',
            error,
            [
              { text: 'Try Again', onPress: initializeSLUDIAuth },
              { text: 'Cancel', onPress: () => navigation.goBack() }
            ]
          );
          return;
        }

        if (code && state) {
          console.log('✅ Authorization code received:', { code, state });
          handleAuthorizationCode(code, state);
        } else {
          console.warn('⚠️ Missing code or state in callback URL');
          setError('Invalid callback parameters');
        }
      } catch (urlError) {
        console.error('❌ Error parsing callback URL:', urlError);
        setError('Invalid callback URL format');
      }
    }
  };

  const handleAuthorizationCode = async (code: string, state: string | null) => {
    try {
      setLoading(true);
      
      // Validate state parameter
      const storedState = await AsyncStorage.getItem('esignet_state');
      if (state !== storedState) {
        Alert.alert('Security Error', 'Invalid state parameter. Authentication cannot continue.');
        return;
      }
      
      // Exchange authorization code for user info using eSignet Integration Guide approach
      const userInfo = await exchangeCodeForTokens(code, ESIGNET_CONFIG.REDIRECT_URI_USER_PROFILE);
      
      if (userInfo) {
        // Store user information
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        
        Alert.alert(
          'Authentication Successful',
          'You have been successfully authenticated with eSignet.',
          [
            {
              text: 'Continue',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }]
                });
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Authentication Failed',
          'Failed to retrieve user information',
          [
            { text: 'Try Again', onPress: initializeSLUDIAuth },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (err) {
      console.error('Token exchange error:', err);
      Alert.alert(
        'Authentication Error',
        'Failed to complete authentication. Please try again.',
        [
          { text: 'Try Again', onPress: initializeSLUDIAuth },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  if (loading && !authUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Initializing SLUDI Authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Authentication Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeSLUDIAuth}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SLUDI Authentication</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Processing authentication...</Text>
        </View>
      )}

      {/* WebView */}
      {authUrl && (
        <WebView
          ref={webViewRef}
          source={{ 
            uri: authUrl,
            headers: {
              'bypass-tunnel-reminder': 'mobile-app',
              'User-Agent': 'MobileApp-SLUDI/1.0.0'
            }
          }}
          style={styles.webview}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            setError('Failed to load SLUDI authentication page');
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  backButton: {
    padding: 8
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center'
  },
  refreshButton: {
    padding: 8
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 12
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  webview: {
    flex: 1
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  }
});

export default SLUDIAuthScreen;
