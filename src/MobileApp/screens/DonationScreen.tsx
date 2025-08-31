import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLanguage } from '../services/LanguageService';
import { API_BASE_URL, PAYMENT_CONFIG } from '../config/api';

interface DonationScreenProps {
  navigation: any;
}

const DonationScreen: React.FC<DonationScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
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
            amount: formData.amount.toString(),
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
            },
          },
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

  const confirmDonation = async (sessionData: any, status: string = 'SUCCESS') => {
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
          orderId: sessionData.orderId,
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          sessionId: sessionData.session.id,
          status: status,
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

  const handleDonate = () => {
    // Redirect to MPGS-based donation screen for secure payment
    navigation.navigate('MPGSDonation');
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
          <Text style={styles.title}>{t('make_donation')}</Text>
          <Text style={styles.subtitle}>{t('donation_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('personal_information')}</Text>
            
            <TextInput
              style={styles.input}
              placeholder={t('full_name')}
              placeholderTextColor="#888"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('email_address')}
              placeholderTextColor="#888"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder={t('phone_number')}
              placeholderTextColor="#888"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {/* Donation Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('donation_amount')}</Text>
            
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
              placeholder={t('custom_amount')}
              placeholderTextColor="#888"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />
          </View>

          {/* Donation Button */}
          <TouchableOpacity
            style={styles.donateButton}
            onPress={handleDonate}
          >
            <Text style={styles.donateButtonText}>{t('donations.donate_now')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    color: 'black', // Make input text black
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
});

export default DonationScreen;
