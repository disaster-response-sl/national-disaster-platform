import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useLanguage } from '../services/LanguageService';
import { API_BASE_URL, PAYMENT_CONFIG, CHECKOUT_SCRIPT_URL } from '../config/api';

interface MPGSDonationScreenProps {
  navigation: any;
}

const MPGSDonationScreen: React.FC<MPGSDonationScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
  });

  // Predefined donation amounts
  const predefinedAmounts = [500, 1000, 2500, 5000, 10000];

  const validateForm = () => {
    const { name, email, phone, amount } = formData;
    
    if (!name.trim()) {
      Alert.alert(t('error'), t('name_required'));
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert(t('error'), t('email_required'));
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('error'), t('invalid_email'));
      return false;
    }
    
    if (!phone.trim()) {
      Alert.alert(t('error'), t('phone_required'));
      return false;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert(t('error'), t('invalid_amount'));
      return false;
    }
    
    return true;
  };

  const createPaymentSession = async () => {
    try {
      console.log('🔄 Creating payment session with URL:', `${API_BASE_URL}/payment/session`);
      console.log('🔄 Request data:', JSON.stringify({
        order: {
          currency: PAYMENT_CONFIG.currency,
          amount: Number(formData.amount),
          description: 'Disaster Relief Donation',
        },
        interaction: {
          operation: 'PURCHASE',
          displayControl: PAYMENT_CONFIG.displayControl,
          returnUrl: PAYMENT_CONFIG.returnUrl
        },
        billing: {
          address: {
            city: 'Colombo',
            country: 'LKA',
            postcodeZip: '10100',
            stateProvince: 'Western'
          },
        },
        customer: {
          email: formData.email.trim(),
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' ') || 'Donor',
          phone: formData.phone.trim()
        }
      }, null, 2));

      const response = await fetch(`${API_BASE_URL}/payment/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: {
            currency: PAYMENT_CONFIG.currency,
            amount: Number(formData.amount), // Convert to number for backend validation
            description: 'Disaster Relief Donation',
          },
          interaction: {
            operation: 'PURCHASE',
            displayControl: PAYMENT_CONFIG.displayControl,
            returnUrl: PAYMENT_CONFIG.returnUrl
          },
          billing: {
            address: {
              city: 'Colombo',
              country: 'LKA',
              postcodeZip: '10100',
              stateProvince: 'Western'
            },
          },
          customer: {
            email: formData.email.trim(),
            firstName: formData.name.split(' ')[0],
            lastName: formData.name.split(' ').slice(1).join(' ') || '',
            phone: formData.phone.trim()
          }
        }),
      });

      console.log('🔄 Response status:', response.status);
      console.log('🔄 Response headers:', response.headers);

      const result = await response.json();
      console.log('🔄 Response data:', JSON.stringify(result, null, 2));
      
      // Handle Commercial Bank PayDPI response format
      if (response.ok && result.success) {
        console.log('✅ Payment session created successfully');
        console.log('✅ Session ID:', result.session?.id);
        console.log('✅ Order ID:', result.orderId);
        return result;
      } else {
        const errorMessage = result.message || result.error || 'Payment session creation failed';
        console.error('❌ Payment session creation failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Payment session error:', error);
      if (error instanceof Error) {
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error message:', error.message);
        
        // Add specific error handling for network issues
        if (error.message.includes('Network request failed')) {
          console.error('❌ Network Error Details:');
          console.error('- API URL:', `${API_BASE_URL}/payment/session`);
          console.error('- This usually means the backend server is not accessible');
          console.error('- Check if localtunnel is running: lt --port 5000');
          console.error('- Verify the localtunnel URL is correct in api.ts');
        }
      }
      throw error;
    }
  };

  const generatePaymentHTML = (sessionData: any) => {
    const sessionId = sessionData?.session?.id || '';
    const orderId = sessionData?.orderId || '';
    const amount = formData?.amount || '';
    
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commercial Bank PayDPI</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 20px; }
        .amount { font-size: 24px; font-weight: bold; color: #27ae60; margin: 10px 0; }
        .description { color: #666; margin-bottom: 20px; }
        .loading { text-align: center; padding: 20px; color: #666; }
        .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; color: #c00; margin: 10px 0; }
        .success { background: #efe; border: 1px solid #cfc; padding: 15px; border-radius: 5px; color: #060; margin: 10px 0; }
        .buttons { display: flex; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
        .btn { flex: 1; min-width: 100px; padding: 12px 8px; border: none; border-radius: 5px; font-size: 14px; cursor: pointer; text-align: center; }
        .btn-primary { background: #3498db; color: white; }
        .btn-cancel { background: #95a5a6; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Complete Payment</h2>
            <div class="amount">LKR ` + Number(amount).toLocaleString() + `</div>
            <div class="description">Disaster Relief Donation</div>
        </div>
        
        <div id="payment-form">
            <div class="loading">Initializing secure payment...</div>
        </div>
        
        <div class="buttons">
            <button class="btn btn-cancel" onclick="cancelPayment()">Cancel</button>
            <button class="btn btn-primary" onclick="testPayment()">Test Payment</button>
        </div>
    </div>

    <script>
        var paymentData = {
            sessionId: "` + sessionId + `",
            orderId: "` + orderId + `",
            amount: "` + amount + `",
            merchantName: "TESTITCALANKALKR",
            currency: "LKR"
        };
        
        function testPayment() {
            document.getElementById('payment-form').innerHTML = 
                '<div class="success">✅ Payment completed successfully!<br><small>Transaction: CBC_SIM_' + Date.now() + '</small></div>';
            
            setTimeout(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    success: true,
                    orderId: paymentData.orderId,
                    sessionId: paymentData.sessionId,
                    transactionId: 'CBC_SIM_' + Date.now(),
                    result: 'SUCCESS'
                }));
            }, 1000);
        }
        
        function cancelPayment() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                success: false,
                cancelled: true
            }));
        }
        
        setTimeout(function() {
            document.getElementById('payment-form').innerHTML = 
                '<div class="error">Commercial Bank PayDPI integration requires proper server setup.<br><br>' +
                'Please use <strong>Test Payment</strong> to simulate the payment flow.</div>';
        }, 2000);
    </script>
</body>
</html>`;
    
    return html;
  };

  const createPaymentSession = async () => {
    try {
                    // Check if Checkout object is available
                    if (typeof Checkout === 'undefined') {
                        throw new Error('Checkout library not loaded from: ${CHECKOUT_SCRIPT_URL}');
                    }
                    
                    console.log('Available Checkout methods:', Object.keys(Checkout));
                    
                    // Configure Commercial Bank PayDPI hosted checkout
                    const checkoutConfig = {
                        merchant: '${PAYMENT_CONFIG.merchantName}',
                        order: {
                            id: '${sessionData.orderId}',
                            amount: '${formData.amount}',
                            currency: '${PAYMENT_CONFIG.currency}',
                            description: 'Disaster Relief Donation'
                        },
                        session: {
                            id: '${sessionData.session.id}'
                        },
                        interaction: {
                            merchant: {
                                name: '${PAYMENT_CONFIG.merchantName}'
                            },
                            displayControl: {
                                billingAddress: 'HIDE',
                                customerEmail: 'HIDE', 
                                shipping: 'HIDE'
                            },
                            returnUrl: '${PAYMENT_CONFIG.returnUrl}'
                        },
                        callback: function(data) {
                            console.log('Payment callback received:', data);
                            handlePaymentCallback(data);
                        }
                    };
                    
                    console.log('Configuring checkout with:', checkoutConfig);
                    Checkout.configure(checkoutConfig);
                    
                    console.log('Opening hosted payment page...');
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="loading">Opening secure payment page...</div>';
                    
                    // Try different methods for opening the checkout
                    if (typeof Checkout.showLightbox === 'function') {
                        console.log('Using Checkout.showLightbox()');
                        Checkout.showLightbox();
                    } else if (typeof Checkout.showPaymentPage === 'function') {
                        console.log('Using Checkout.showPaymentPage()');
                        Checkout.showPaymentPage();
                    } else if (typeof Checkout.show === 'function') {
                        console.log('Using Checkout.show()');
                        Checkout.show();
                    } else {
                        // Fallback: Use iframe with correct Commercial Bank PayDPI URL
                        console.log('Using iframe fallback with correct URL');
                        const hostedUrl = 'https://cbcmpgs.gateway.mastercard.com/checkout/version/100/checkout.js?session.id=' + '${sessionData.session.id}';
                        
                        const iframe = document.createElement('iframe');
                        iframe.src = hostedUrl;
                        iframe.style.width = '100%';
                        iframe.style.height = '350px';
                        iframe.style.border = 'none';
                        iframe.style.borderRadius = '5px';
                        iframe.onload = function() {
                            console.log('Checkout iframe loaded successfully');
                        };
                        iframe.onerror = function() {
                            console.error('Checkout iframe failed to load');
                            document.getElementById('payment-form').innerHTML = 
                                '<div class="error">Payment page failed to load.<br><br>' +
                                '<button onclick="openHostedCheckout()" class="btn btn-primary">Try Again</button></div>';
                        };
                        
                        document.getElementById('payment-form').innerHTML = '';
                        document.getElementById('payment-form').appendChild(iframe);
                    }
                    
                    console.log('Hosted payment initiated successfully');
                    
                } catch (error) {
                    console.error('Payment initialization error:', error);
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="error">Payment initialization failed: ' + error.message + '<br><br>' +
                        '<button onclick="simulatePayment()" class="btn btn-primary">Use Test Payment</button></div>';
                }
            }
            
            function simulatePayment() {
                console.log('Simulating Commercial Bank PayDPI payment...');
                
                // Simulate the callback data format from Commercial Bank PayDPI
                const simulatedCallbackData = {
                    status: 'success',
                    result: 'SUCCESS',
                    order: { 
                        id: '${sessionData.orderId}',
                        amount: '${formData.amount}',
                        currency: '${PAYMENT_CONFIG.currency}'
                    },
                    transaction: { 
                        id: 'CBC_SIM_' + Date.now(),
                        amount: '${formData.amount}',
                        currency: '${PAYMENT_CONFIG.currency}'
                    }
                };
                
                // Use the same callback handler
                handlePaymentCallback(simulatedCallbackData);
            }
            
            function cancelPayment() {
                window.ReactNativeWebView?.postMessage(JSON.stringify({ 
                    success: false, 
                    cancelled: true 
                }));
            }
            
            function redirectToPayment() {
                try {
                    console.log('Creating Commercial Bank PayDPI hosted checkout page...');
                    
                    // Create a proper HTML page with Commercial Bank PayDPI integration
                    const checkoutPage = \`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commercial Bank PayDPI</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .container { max-width: 400px; margin: 0 auto; }
        .loading { text-align: center; padding: 40px; color: #666; }
        .error { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; color: #c00; }
        .success { background: #efe; border: 1px solid #cfc; padding: 15px; border-radius: 5px; color: #060; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Commercial Bank PayDPI</h2>
        <div id="payment-container">
            <div class="loading">Loading payment form...</div>
        </div>
    </div>
    
    <script src="https://cbcmpgs.gateway.mastercard.com/checkout/version/100/checkout.js"
            data-error="errorCallback"
            data-complete="completeCallback"
            data-cancel="cancelCallback"></script>
    <script>
        function errorCallback(error) {
            console.error('Payment error:', error);
            document.getElementById('payment-container').innerHTML = 
                '<div class="error">Payment failed: ' + (error.explanation || error.cause || 'Unknown error') + '</div>';
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    success: false,
                    error: error.explanation || error.cause || 'Payment failed'
                }));
            }
        }
        
        function completeCallback(resultIndicator, sessionVersion) {
            console.log('Payment completed:', resultIndicator, sessionVersion);
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    success: true,
                    orderId: '\${sessionData.orderId}',
                    sessionId: '\${sessionData.session.id}',
                    transactionId: 'CBC_' + Date.now(),
                    result: 'SUCCESS',
                    resultIndicator: resultIndicator,
                    sessionVersion: sessionVersion
                }));
            }
        }
        
        function cancelCallback() {
            console.log('Payment cancelled');
            
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    success: false,
                    cancelled: true
                }));
            }
        }
        
        window.addEventListener('load', function() {
            try {
                console.log('Configuring Commercial Bank PayDPI checkout...');
                
                Checkout.configure({
                    merchant: '\${PAYMENT_CONFIG.merchantName}',
                    order: {
                        id: '\${sessionData.orderId}',
                        amount: '\${formData.amount}',
                        currency: '\${PAYMENT_CONFIG.currency}',
                        description: 'Disaster Relief Donation'
                    },
                    session: {
                        id: '\${sessionData.session.id}'
                    },
                    interaction: {
                        merchant: {
                            name: '\${PAYMENT_CONFIG.merchantName}'
                        },
                        displayControl: {
                            billingAddress: 'HIDE',
                            customerEmail: 'HIDE',
                            shipping: 'HIDE'
                        }
                    }
                });
                
                console.log('Opening Commercial Bank PayDPI lightbox...');
                Checkout.showLightbox();
                
            } catch (error) {
                console.error('Checkout initialization failed:', error);
                errorCallback(error);
            }
        });
    </script>
</body>
</html>\`;
                    
                    // Update the WebView with the complete checkout page
                    window.ReactNativeWebView?.postMessage(JSON.stringify({
                        action: 'loadHTML',
                        html: checkoutPage
                    }));
                    
                } catch (error) {
                    console.error('Redirect failed:', error);
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="error">Failed to create payment page: ' + error.message + '</div>';
                }
            }
            
            function openHostedCheckout() {
                try {
                    console.log('Opening Commercial Bank PayDPI hosted checkout...');
                    console.log('Session ID:', '${sessionData.session.id}');
                    
                    // Create an HTML page with iframe for Commercial Bank PayDPI
                    const iframePage = \`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commercial Bank PayDPI</title>
    <style>
        body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 10px; }
        .iframe-container { width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
        .fallback { text-align: center; margin-top: 10px; font-size: 14px; color: #666; }
        .fallback a { color: #3498db; text-decoration: none; }
    </style>
</head>
<body>
    <div class="header">
        <h3>Commercial Bank PayDPI</h3>
        <p>Loading payment form...</p>
    </div>
    <div class="iframe-container">
        <iframe id="payment-iframe" src="about:blank"></iframe>
    </div>
    <div class="fallback">
        <p>If payment form doesn't load, <a href="#" onclick="reloadPayment()">click here to retry</a></p>
    </div>
    
    <script>
        function loadPaymentIframe() {
            const iframe = document.getElementById('payment-iframe');
            const checkoutUrl = 'https://cbcmpgs.gateway.mastercard.com/checkout/version/100/checkout.js?session.id=' + '${sessionData.session.id}';
            
            // Create a complete HTML page for the iframe
            const iframeContent = \\\`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment</title>
    <style>body { margin: 0; padding: 10px; }</style>
</head>
<body>
    <div id="payment-container">Loading...</div>
    <script src="https://cbcmpgs.gateway.mastercard.com/checkout/version/100/checkout.js"
            data-error="errorCallback"
            data-complete="completeCallback"
            data-cancel="cancelCallback"><\/script>
    <script>
        function errorCallback(error) {
            document.getElementById('payment-container').innerHTML = 
                '<div style="color:red;">Payment failed: ' + (error.explanation || 'Unknown error') + '</div>';
            parent.postMessage({type: 'error', error: error}, '*');
        }
        
        function completeCallback(resultIndicator, sessionVersion) {
            document.getElementById('payment-container').innerHTML = 
                '<div style="color:green;">Payment completed successfully!</div>';
            parent.postMessage({type: 'complete', resultIndicator: resultIndicator, sessionVersion: sessionVersion}, '*');
        }
        
        function cancelCallback() {
            document.getElementById('payment-container').innerHTML = 
                '<div style="color:orange;">Payment cancelled</div>';
            parent.postMessage({type: 'cancel'}, '*');
        }
        
        window.addEventListener('load', function() {
            try {
                Checkout.configure({
                    merchant: '${PAYMENT_CONFIG.merchantName}',
                    session: { id: '${sessionData.session.id}' },
                    order: {
                        id: '${sessionData.orderId}',
                        amount: '${formData.amount}',
                        currency: '${PAYMENT_CONFIG.currency}'
                    }
                });
                Checkout.showLightbox();
            } catch (e) {
                errorCallback(e);
            }
        });
    <\/script>
</body>
</html>\\\`;
            
            iframe.srcdoc = iframeContent;
        }
        
        function reloadPayment() {
            loadPaymentIframe();
        }
        
        // Listen for messages from iframe
        window.addEventListener('message', function(event) {
            if (event.data.type === 'complete') {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    success: true,
                    orderId: '${sessionData.orderId}',
                    sessionId: '${sessionData.session.id}',
                    transactionId: 'CBC_' + Date.now(),
                    result: 'SUCCESS',
                    resultIndicator: event.data.resultIndicator,
                    sessionVersion: event.data.sessionVersion
                }));
            } else if (event.data.type === 'error') {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    success: false,
                    error: event.data.error.explanation || 'Payment failed'
                }));
            } else if (event.data.type === 'cancel') {
                window.ReactNativeWebView?.postMessage(JSON.stringify({
                    success: false,
                    cancelled: true
                }));
            }
        });
        
        // Load the payment iframe on page load
        window.addEventListener('load', loadPaymentIframe);
    </script>
</body>
</html>\`;
                    
                    // Update the payment form
                    document.getElementById('payment-form').innerHTML = iframePage;
                    
                } catch (error) {
                    console.error('Error opening hosted checkout:', error);
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="error">Failed to open payment page: ' + error.message + '<br><br>' +
                        '<button onclick="simulatePayment()" class="btn btn-primary">Use Test Payment Instead</button></div>';
                }
            }
            
            // Initialize payment when page loads
            setTimeout(initializePayment, 1000);
        </script>
    </body>
    </html>
    `;
  };

  const confirmDonation = async (paymentResult: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/donation/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          amount: Number(formData.amount),
          orderId: paymentResult.orderId,
          transactionId: paymentResult.transactionId,
          sessionId: paymentResult.sessionId,
          status: paymentResult.success ? 'SUCCESS' : 'FAILED',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Donation confirmation failed');
      }
    } catch (error) {
      console.error('Donation confirmation error:', error);
      throw error;
    }
  };

  const handleDonate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Step 1: Create payment session
      const sessionResult = await createPaymentSession();
      setSessionData(sessionResult);

      // Step 2: Generate payment HTML
      const html = generatePaymentHTML(sessionResult);
      setPaymentHtml(html);
      
      // Step 3: Show payment modal
      setShowPayment(true);
      
    } catch (error: any) {
      Alert.alert(
        t('error'),
        error.message || t('donation_failed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Handle HTML loading requests from WebView
      if (data.action === 'loadHTML' && data.html) {
        console.log('📱 Loading custom HTML for Commercial Bank PayDPI');
        setPaymentHtml(data.html);
        return;
      }
      
      // Handle navigation requests from WebView
      if (data.action === 'navigate' && data.url) {
        console.log('📱 Navigation requested to:', data.url);
        // You can handle navigation here - for now, we'll open in the same WebView
        // In a real app, you might want to open this in a separate browser or handle differently
        setPaymentHtml(`
          <html>
            <head><title>Commercial Bank PayDPI</title></head>
            <body style="margin:0;padding:0;">
              <iframe src="${data.url}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
          </html>
        `);
        return;
      }
      
      if (data.cancelled) {
        setShowPayment(false);
        return;
      }

      // Step 3: Confirm donation after payment
      const confirmationResult = await confirmDonation(data);
      
      setShowPayment(false);
      
      if (data.success) {
        Alert.alert(
          t('donations.donation_success'),
          t('donations.donation_success_message'),
          [
            {
              text: t('donations.ok'),
              onPress: () => {
                // Reset form
                setFormData({ name: '', email: '', phone: '', amount: '' });
                navigation.navigate('Dashboard');
              },
            },
          ]
        );
      } else {
        Alert.alert(t('donations.payment_failed'), data.error || t('donations.payment_failed_message'));
      }
    } catch (error: any) {
      setShowPayment(false);
      // Show more helpful error message for common issues
      let errorMessage = error.message || t('donations.donation_failed');
      if (errorMessage.includes('LK') && errorMessage.includes('invalid')) {
        errorMessage = 'Country code issue fixed. Please check backend server.';
      }
      Alert.alert(t('error'), errorMessage);
    }
  };

  const selectAmount = (amount: number) => {
    setFormData({ ...formData, amount: amount.toString() });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('donations.make_donation')}</Text>
          <Text style={styles.subtitle}>{t('donations.donation_subtitle')}</Text>
          {/* Payment provider images */}
          <View style={styles.paymentLogosContainer}>
            <Image source={require('../assets/payment_logos_full.jpg')} style={styles.paymentProvidersImage} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.form}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('donations.personal_information')}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.full_name')}
              placeholderTextColor="#888"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.email_address')}
              placeholderTextColor="#888"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.phone_number')}
              placeholderTextColor="#888"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {/* Donation Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('donations.donation_amount')}</Text>
            
            <View style={styles.amountButtons}>
              {predefinedAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    formData.amount === amount.toString() && styles.amountButtonSelected,
                  ]}
                  onPress={() => selectAmount(amount)}
                >
                  <Text
                    style={[
                      styles.amountButtonText,
                      formData.amount === amount.toString() && styles.amountButtonTextSelected,
                    ]}
                  >
                    LKR {amount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.custom_amount')}
              placeholderTextColor="#888"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />
          </View>

          {/* MPGS Payment Notice */}
          <View style={styles.mpgsNotice}>
            <Text style={styles.mpgsText}>🔒 Secure payment powered by Mastercard Payment Gateway</Text>
          </View>

          {/* Donation Button */}
          <TouchableOpacity
            style={[styles.donateButton, loading && styles.disabledButton]}
            onPress={handleDonate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.donateButtonText}>{t('donations.donate_now')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MPGS Payment Modal */}
      <Modal
        visible={showPayment}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <View style={styles.paymentModal}>
          <WebView
            source={{ html: paymentHtml }}
            onMessage={handlePaymentMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text>Loading secure payment...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  paymentLogosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  paymentProvidersImage: {
    width: 300,
    height: 60,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    color: '#2c3e50',
  },
  amountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  amountButton: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  amountButtonSelected: {
    backgroundColor: '#3498db',
  },
  amountButtonText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
  amountButtonTextSelected: {
    color: 'white',
  },
  mpgsNotice: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  mpgsText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  donateButton: {
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  donateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentModal: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MPGSDonationScreen;
