// components/ESignetButton.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ESIGNET_CONFIG } from '../config/sludi';

const ESignetButton = ({ navigation, onPress, disabled = false, style = {} }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [buttonReady, setButtonReady] = useState(false);
  const webViewRef = useRef(null);

  const generateRandomString = (length = 16) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomInd = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomInd);
    }
    return result;
  };

  // Generate state and nonce for OAuth2 security
  const state = `mobile_${Date.now()}_${generateRandomString()}`;
  const nonce = generateRandomString();

  // HTML template that matches the guide's approach
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>eSignet Sign In</title>
        <style>
            body {
                margin: 0;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #ffffff;
            }
            #sign-in-with-esignet {
                width: 100%;
                height: 60px;
            }
            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="loading" id="loading">Loading eSignet...</div>
        <div id="sign-in-with-esignet" style="display: none;"></div>
        
        <script>
            // External script loader function (matching the guide)
            function useExternalScript(src) {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => resolve('ready');
                    script.onerror = () => reject('error');
                    document.head.appendChild(script);
                });
            }

            // Initialize eSignet button (following the guide exactly)
            async function renderSignInButton() {
                try {
                    // Load the external plugin script with timeout
                    const signInButtonScript = '${ESIGNET_CONFIG.ESIGNET_UI_BASE_URL}/plugins/sign-in-button-plugin.js';
                    
                    // Add timeout to script loading
                    const loadPromise = useExternalScript(signInButtonScript);
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Script load timeout')), 10000)
                    );
                    
                    await Promise.race([loadPromise, timeoutPromise]);
                    
                    // Hide loading, show button container
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('sign-in-with-esignet').style.display = 'block';
                    
                    // Check if plugin is available
                    if (!window.SignInWithEsignetButton) {
                        throw new Error('eSignet plugin not loaded');
                    }
                    
                    // OIDC Configuration (matching the guide structure)
                    const oidcConfig = {
                        authorizeUri: '${ESIGNET_CONFIG.ESIGNET_UI_BASE_URL}/oauth/v2/authorize',
                        redirect_uri: '${ESIGNET_CONFIG.REDIRECT_URI}',
                        client_id: '${ESIGNET_CONFIG.CLIENT_ID}',
                        scope: '${ESIGNET_CONFIG.SCOPE_USER_PROFILE}',
                        nonce: '${nonce}',
                        state: '${state}',
                        acr_values: '${ESIGNET_CONFIG.ACRS}',
                        claims_locales: '${ESIGNET_CONFIG.CLAIMS_LOCALES}',
                        display: '${ESIGNET_CONFIG.DISPLAY}',
                        prompt: '${ESIGNET_CONFIG.PROMPT}',
                        max_age: ${ESIGNET_CONFIG.MAX_AGE},
                        ui_locales: '${ESIGNET_CONFIG.DEFAULT_LANG}',
                        claims: ${ESIGNET_CONFIG.CLAIMS_USER_PROFILE}
                    };

                    // Initialize button using the plugin (matching the guide)
                    window.SignInWithEsignetButton.init({
                        oidcConfig: oidcConfig,
                        buttonConfig: {
                            shape: "soft_edges",
                            labelText: "Sign in with eSignet",
                            width: "100%"
                        },
                        signInElement: document.getElementById("sign-in-with-esignet"),
                    });
                    
                    // Notify React Native that button is ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'BUTTON_READY'
                    }));
                    
                } catch (error) {
                    console.error('eSignet plugin failed, using fallback:', error);
                    
                    // Fallback: Create manual button
                    createFallbackButton();
                }
            }

            // Fallback button implementation
            function createFallbackButton() {
                const container = document.getElementById('sign-in-with-esignet');
                document.getElementById('loading').style.display = 'none';
                container.style.display = 'block';
                
                // Create manual button HTML
                container.innerHTML = \`
                    <button 
                        id="fallback-esignet-btn"
                        style="
                            width: 100%;
                            height: 50px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0px)'"
                    >
                        🏛️ Sign in with eSignet
                    </button>
                \`;
                
                // Add click handler for manual redirect
                document.getElementById('fallback-esignet-btn').onclick = function() {
                    const authUrl = buildAuthURL();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'REDIRECT',
                        url: authUrl
                    }));
                };
                
                // Notify React Native that fallback button is ready
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'BUTTON_READY',
                    fallback: true
                }));
            }

            // Build authorization URL manually
            function buildAuthURL() {
                const params = new URLSearchParams({
                    client_id: '${ESIGNET_CONFIG.CLIENT_ID}',
                    response_type: 'code',
                    scope: '${ESIGNET_CONFIG.SCOPE_USER_PROFILE}',
                    redirect_uri: '${ESIGNET_CONFIG.REDIRECT_URI}',
                    state: '${state}',
                    nonce: '${nonce}',
                    display: '${ESIGNET_CONFIG.DISPLAY}',
                    prompt: '${ESIGNET_CONFIG.PROMPT}',
                    max_age: '${ESIGNET_CONFIG.MAX_AGE}',
                    ui_locales: '${ESIGNET_CONFIG.DEFAULT_LANG}',
                    acr_values: '${ESIGNET_CONFIG.ACRS}',
                    claims_locales: '${ESIGNET_CONFIG.CLAIMS_LOCALES}',
                    claims: '${ESIGNET_CONFIG.CLAIMS_USER_PROFILE}'
                });
                
                return '${ESIGNET_CONFIG.ESIGNET_UI_BASE_URL}/oauth/v2/authorize?' + params.toString();
            }
            }

            // Start initialization
            document.addEventListener('DOMContentLoaded', renderSignInButton);
        </script>
    </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'BUTTON_READY':
          setIsLoading(false);
          setButtonReady(true);
          if (data.fallback) {
            console.log('✅ eSignet fallback button ready');
          } else {
            console.log('✅ eSignet plugin button ready');
          }
          break;
          
        case 'REDIRECT':
          // Handle manual redirect from fallback button
          setIsLoading(true);
          console.log('🔐 Redirecting to eSignet:', data.url);
          
          // Use Linking to open external browser
          Linking.canOpenURL(data.url).then(supported => {
            if (supported) {
              Linking.openURL(data.url);
            } else {
              Alert.alert('Error', 'Cannot open eSignet authentication URL');
            }
            setIsLoading(false);
          }).catch(error => {
            console.error('Linking error:', error);
            Alert.alert('Error', 'Failed to open authentication URL');
            setIsLoading(false);
          });
          break;
          
        case 'ERROR':
          setIsLoading(false);
          console.error('❌ eSignet button error:', data.message);
          Alert.alert(
            'eSignet Error',
            'Failed to load eSignet authentication button. Please try again.'
          );
          break;
          
        default:
          console.log('📱 WebView message:', data);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading eSignet...</Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: htmlTemplate }}
        style={[styles.webView, { opacity: buttonReady ? 1 : 0 }]}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          Alert.alert('Error', 'Failed to load eSignet button');
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: 60,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ESignetButton;
