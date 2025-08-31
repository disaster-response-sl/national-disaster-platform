import React, { useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

interface FormData {
  name: string;
  email: string;
  phone: string;
  amount: string;
}

const API_BASE_URL = 'https://orange-readers-know.loca.lt';

const PAYMENT_CONFIG = {
  currency: 'LKR',
  displayControl: {
    billingAddress: 'OPTIONAL',
    customerEmail: 'OPTIONAL'
  },
  returnUrl: 'https://nationaldrp.online/payment/callback'
};

const MPGSDonationScreen: React.FC = () => {
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
              },
            },
          ]
        );
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
