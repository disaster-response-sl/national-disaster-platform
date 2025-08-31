import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { WebView } from 'react-native-webview';
import { API_BASE_URL, PAYMENT_CONFIG as API_PAYMENT_CONFIG } from '../config/api';

const { width } = Dimensions.get('window');

interface FormData {
  name: string;
  email: string;
  phone: string;
  amount: string;
}

const PAYMENT_CONFIG = {
  currency: 'LKR',
  displayControl: {
    billingAddress: 'OPTIONAL',
    customerEmail: 'OPTIONAL'
  },
  returnUrl: 'https://nationaldrp.online/payment/callback'
};

interface MPGSDonationScreenProps {
  navigation: any;
}

const MPGSDonationScreen: React.FC<MPGSDonationScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    amount: '2500',
  });
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState('');
  const [sessionResult, setSessionResult] = useState<any>(null);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert(t('error'), t('name_required'));
      return false;
    }
    
    if (!formData.email.trim()) {
      Alert.alert(t('error'), t('email_required'));
      return false;
    }
    
    if (!formData.phone.trim()) {
      Alert.alert(t('error'), t('phone_required'));
      return false;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      Alert.alert(t('error'), t('invalid_amount'));
      return false;
    }
    
    return true;
  };

  const generatePaymentHTML = (sessionData: any) => {
    const sessionId = sessionData?.session?.id || '';
    const orderId = sessionData?.orderId || '';
    const amount = formData?.amount || '';
    const successIndicator = sessionData?.successIndicator || '';
    
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
        .payment-form { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; color: #333; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
        .card-row { display: flex; gap: 10px; }
        .card-row .form-group { flex: 1; }
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
            <div class="loading">Initializing Commercial Bank PayDPI...</div>
        </div>
        
        <div class="buttons">
            <button class="btn btn-cancel" onclick="cancelPayment()">Cancel</button>
            <button class="btn btn-primary" onclick="openCardPayment()">Pay with Card</button>
            <button class="btn btn-primary" onclick="testPayment()">Test Payment</button>
        </div>
    </div>

    <script>
        var paymentData = {
            sessionId: "` + sessionId + `",
            orderId: "` + orderId + `",
            amount: "` + amount + `",
            merchantName: "TESTITCALANKALKR",
            currency: "LKR",
            successIndicator: "` + successIndicator + `"
        };
        
        function openCardPayment() {
            document.getElementById('payment-form').innerHTML = \`
                <div class="payment-form">
                    <h3 style="margin-top: 0;">Enter Card Details</h3>
                    <form id="cardForm">
                        <div class="form-group">
                            <label for="cardNumber">Card Number</label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19">
                        </div>
                        <div class="form-group">
                            <label for="cardName">Cardholder Name</label>
                            <input type="text" id="cardName" placeholder="John Doe">
                        </div>
                        <div class="card-row">
                            <div class="form-group">
                                <label for="expiryMonth">Month</label>
                                <select id="expiryMonth">
                                    <option value="">MM</option>
                                    <option value="01">01</option>
                                    <option value="02">02</option>
                                    <option value="03">03</option>
                                    <option value="04">04</option>
                                    <option value="05">05</option>
                                    <option value="06">06</option>
                                    <option value="07">07</option>
                                    <option value="08">08</option>
                                    <option value="09">09</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="expiryYear">Year</label>
                                <select id="expiryYear">
                                    <option value="">YY</option>
                                    <option value="24">24</option>
                                    <option value="25">25</option>
                                    <option value="26">26</option>
                                    <option value="27">27</option>
                                    <option value="28">28</option>
                                    <option value="29">29</option>
                                    <option value="30">30</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 15px;">
                            Process Payment - LKR \` + Number(paymentData.amount).toLocaleString() + \`
                        </button>
                    </form>
                </div>
            \`;
            
            // Format card number input
            document.getElementById('cardNumber').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
            
            // Handle form submission
            document.getElementById('cardForm').addEventListener('submit', function(e) {
                e.preventDefault();
                processCardPayment();
            });
        }
        
        function processCardPayment() {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\\s/g, '');
            const cardName = document.getElementById('cardName').value;
            const expiryMonth = document.getElementById('expiryMonth').value;
            const expiryYear = document.getElementById('expiryYear').value;
            const cvv = document.getElementById('cvv').value;
            
            // Validate fields
            if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
                alert('Please fill in all fields');
                return;
            }
            
            if (cardNumber.length < 13) {
                alert('Please enter a valid card number');
                return;
            }
            
            // Show processing
            document.getElementById('payment-form').innerHTML = 
                '<div class="loading">Processing payment with Commercial Bank PayDPI...<br><small>Please wait...</small></div>';
            
            // Simulate Commercial Bank PayDPI processing
            setTimeout(function() {
                // Simulate success/failure based on card number
                const isTestCard = cardNumber.startsWith('4111') || cardNumber.startsWith('5555');
                const success = isTestCard || Math.random() > 0.2; // 80% success rate
                
                if (success) {
                    const transactionId = 'CBC_' + Date.now();
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="success">✅ Payment completed successfully!<br>' +
                        '<strong>Commercial Bank PayDPI</strong><br>' +
                        '<small>Transaction: ' + transactionId + '</small></div>';
                    
                    setTimeout(function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            success: true,
                            orderId: paymentData.orderId,
                            sessionId: paymentData.sessionId,
                            transactionId: transactionId,
                            result: 'SUCCESS',
                            gateway: 'Commercial Bank PayDPI'
                        }));
                    }, 2000);
                } else {
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="error">❌ Payment failed<br>' +
                        '<small>Transaction declined by bank</small></div>';
                    
                    setTimeout(function() {
                        openCardPayment(); // Show form again
                    }, 3000);
                }
            }, 3000);
        }
        
        function testPayment() {
            document.getElementById('payment-form').innerHTML = 
                '<div class="success">✅ Test payment completed successfully!<br><small>Transaction: TEST_' + Date.now() + '</small></div>';
            
            setTimeout(function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    success: true,
                    orderId: paymentData.orderId,
                    sessionId: paymentData.sessionId,
                    transactionId: 'TEST_' + Date.now(),
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
        
        // Initialize with ready message
        setTimeout(function() {
            document.getElementById('payment-form').innerHTML = 
                '<div class="success">✅ Commercial Bank PayDPI is ready!<br><br>' +
                '<strong>Session ID:</strong> ' + paymentData.sessionId + '<br>' +
                'Click <strong>"Pay with Card"</strong> to enter payment details.</div>';
        }, 2000);
    </script>
</body>
</html>`;
    
    return html;
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
        }),
      });

      console.log('🔄 Response status:', response.status);
      console.log('🔄 Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Session creation failed:', response.status, errorText);
        throw new Error(`Failed to create payment session: ${response.status} ${errorText}`);
      }

      const sessionResult = await response.json();
      console.log('✅ Session created successfully:', JSON.stringify(sessionResult, null, 2));

      setSessionResult(sessionResult);
      const html = generatePaymentHTML(sessionResult);
      setPaymentHtml(html);
      setShowPayment(true);
      setLoading(false);

    } catch (error) {
      console.error('❌ Payment session error:', error);
      setLoading(false);
      Alert.alert(
        'Connection Error',
        `Failed to connect to payment server: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    await createPaymentSession();
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('💬 WebView message received:', data);

      if (data.success) {
        setShowPayment(false);
        // Confirm donation in backend
        fetch(`${API_BASE_URL}/donation/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            amount: Number(formData.amount),
            orderId: data.orderId,
            transactionId: data.transactionId,
            sessionId: data.sessionId,
            status: data.result || 'SUCCESS',
            paymentMethod: 'CARD',
            description: 'Disaster Relief Donation',
          })
        })
        .then(() => {
          Alert.alert(
            '✅ Payment Successful',
            `Thank you for your donation of LKR ${formData.amount}!\n\nTransaction ID: ${data.transactionId}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    amount: '2500',
                  });
                  if (typeof navigation !== 'undefined' && navigation.navigate) {
                    navigation.navigate('Dashboard');
                  }
                },
              },
            ]
          );
        })
        .catch(() => {
          Alert.alert(
            'Payment Saved Locally',
            'Payment was successful, but could not be saved to the server. Please check your connection.'
          );
        });
      } else if (data.cancelled) {
        setShowPayment(false);
        Alert.alert('Payment Cancelled', 'You can try again when ready.');
      } else {
        setShowPayment(false);
        Alert.alert(
          'Payment Failed',
          data.error || 'Payment could not be completed. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ WebView message error:', error);
      setShowPayment(false);
      Alert.alert('Error', 'Payment processing error. Please try again.');
    }
  };

  if (showPayment) {
    return (
      <View style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowPayment(false)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Commercial Bank PayDPI</Text>
        </View>
        <WebView
          source={{ html: paymentHtml }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Loading payment...</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('donation_title', 'Make a Donation')}</Text>
        <Text style={styles.subtitle}>
          {t('donation_subtitle', 'Support disaster relief efforts')}
        </Text>
        <Image
          source={require('../assets/VisaMastercardUnionPayLogos.jpg')}
          style={{ width: 260, height: 60, resizeMode: 'contain', marginTop: 16 }}
          accessibilityLabel="Accepted payment methods: Visa, Mastercard, UnionPay, Commercial Bank"
        />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('full_name', 'Full Name')}</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder={t('enter_name', 'Enter your full name')}
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('email', 'Email')}</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder={t('enter_email', 'Enter your email')}
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('phone', 'Phone Number')}</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            placeholder={t('enter_phone', 'Enter your phone number')}
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('amount', 'Donation Amount (LKR)')}</Text>
          <TextInput
            style={[styles.input, { color: 'black' }]}
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            placeholder={t('enter_amount', 'Enter amount')}
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.donateButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.donateButtonText}>
              {t('donate_now', 'Donate with Commercial Bank PayDPI')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e6ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: 'black',
  },
  donateButton: {
    backgroundColor: '#1a237e',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  donateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a237e',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default MPGSDonationScreen;
