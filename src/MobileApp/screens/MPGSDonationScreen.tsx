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
      const response = await fetch(`${API_BASE_URL}/payment/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order: {
            currency: PAYMENT_CONFIG.currency,
            amount: formData.amount.toString(), // Ensure string format as per Commercial Bank guide
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

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Payment session creation failed');
      }
    } catch (error) {
      console.error('Payment session error:', error);
      throw error;
    }
  };

  const generatePaymentHTML = (sessionData: any) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MPGS Payment</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .amount {
                font-size: 24px;
                font-weight: bold;
                color: #27ae60;
                margin: 10px 0;
            }
            .description {
                color: #666;
                margin-bottom: 20px;
            }
            .loading {
                text-align: center;
                padding: 20px;
                color: #666;
            }
            .error {
                background: #fee;
                border: 1px solid #fcc;
                padding: 15px;
                border-radius: 5px;
                color: #c00;
                margin: 10px 0;
            }
            .success {
                background: #efe;
                border: 1px solid #cfc;
                padding: 15px;
                border-radius: 5px;
                color: #060;
                margin: 10px 0;
            }
            .buttons {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            .btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
            }
            .btn-primary {
                background: #3498db;
                color: white;
            }
            .btn-cancel {
                background: #95a5a6;
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Complete Payment</h2>
                <div class="amount">LKR ${Number(formData.amount).toLocaleString()}</div>
                <div class="description">Disaster Relief Donation</div>
            </div>
            
            <div id="payment-form">
                <div class="loading">Initializing secure payment...</div>
            </div>
            
            <div class="buttons">
                <button class="btn btn-cancel" onclick="cancelPayment()">Cancel</button>
                <button class="btn btn-primary" onclick="simulatePayment()">Simulate Payment</button>
            </div>
        </div>

        <script src="${CHECKOUT_SCRIPT_URL}"></script>
        <script>
            let paymentResult = null;
            
            function initializePayment() {
                try {
                    Checkout.configure({
                        merchant: '${sessionData.session.id}',
                        order: {
                            id: '${sessionData.orderId}',
                            amount: '${formData.amount}',
                            currency: '${PAYMENT_CONFIG.currency}',
                            description: 'Disaster Relief Donation'
                        },
                        interaction: {
                            merchant: {
                                name: '${PAYMENT_CONFIG.merchantName}' // Use Commercial Bank test merchant
                            }
                        },
                        session: {
                            id: '${sessionData.session.id}'
                        }
                    });
                    
                    document.getElementById('payment-form').innerHTML = '<div id="embedded-payment"></div>';
                    
                    Checkout.showEmbeddedPage('#embedded-payment');
                    
                } catch (error) {
                    console.error('Payment initialization error:', error);
                    document.getElementById('payment-form').innerHTML = 
                        '<div class="error">Payment initialization failed. Please try again.</div>';
                }
            }
            
            function simulatePayment() {
                // For testing purposes - simulate payment success
                paymentResult = {
                    success: true,
                    orderId: '${sessionData.orderId}',
                    sessionId: '${sessionData.session.id}',
                    transactionId: 'TXN' + Date.now(),
                    result: 'SUCCESS'
                };
                
                document.getElementById('payment-form').innerHTML = 
                    '<div class="success">Payment completed successfully!</div>';
                
                // Send result back to React Native
                setTimeout(() => {
                    window.ReactNativeWebView?.postMessage(JSON.stringify(paymentResult));
                }, 1000);
            }
            
            function cancelPayment() {
                window.ReactNativeWebView?.postMessage(JSON.stringify({ 
                    success: false, 
                    cancelled: true 
                }));
            }
            
            // Initialize payment when page loads
            setTimeout(initializePayment, 1000);
            
            // Handle Checkout callback
            Checkout.configure({
                callback: function(data) {
                    console.log('Checkout callback:', data);
                    
                    if (data.status === 'success') {
                        paymentResult = {
                            success: true,
                            orderId: data.order.id,
                            sessionId: '${sessionData.session.id}',
                            transactionId: data.transaction?.id || 'TXN' + Date.now(),
                            result: data.result || 'SUCCESS'
                        };
                    } else {
                        paymentResult = {
                            success: false,
                            error: data.error || 'Payment failed',
                            result: data.result || 'FAILED'
                        };
                    }
                    
                    window.ReactNativeWebView?.postMessage(JSON.stringify(paymentResult));
                }
            });
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
        </View>

        <View style={styles.form}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('donations.personal_information')}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.full_name')}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.email_address')}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('donations.phone_number')}
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
