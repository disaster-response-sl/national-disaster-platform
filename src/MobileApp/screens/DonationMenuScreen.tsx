import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../services/LanguageService';

interface DonationMenuScreenProps {
  navigation: any;
}

const DonationMenuScreen: React.FC<DonationMenuScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();

  const navigateToMPGSDonation = () => {
    navigation.navigate('MPGSDonation');
  };

  const navigateToHistory = () => {
    navigation.navigate('DonationHistory');
  };

  const navigateToStats = () => {
    navigation.navigate('DonationStats');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('donations.donations')}</Text>
        <Text style={styles.subtitle}>{t('donations.help_those_in_need')}</Text>
      </View>

      <View style={styles.content}>
        {/* Make a Donation */}
        <TouchableOpacity style={styles.primaryCard} onPress={navigateToMPGSDonation}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💝</Text>
            <Text style={[styles.cardTitle, styles.primaryCardTitle]}>{t('donations.make_donation')}</Text>
          </View>
          <Text style={[styles.cardDescription, styles.primaryCardDescription]}>
            {t('donations.secure_payment_description')}
          </Text>
          <Text style={styles.cardCTA}>{t('donations.donate_now')} →</Text>
        </TouchableOpacity>

        {/* Donation History */}
        <TouchableOpacity style={styles.secondaryCard} onPress={navigateToHistory}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={[styles.cardTitle, styles.secondaryCardTitle]}>{t('donations.donation_history')}</Text>
          </View>
          <Text style={[styles.cardDescription, styles.secondaryCardDescription]}>
            {t('donations.view_past_donations')}
          </Text>
        </TouchableOpacity>

        {/* Platform Statistics */}
        <TouchableOpacity style={styles.secondaryCard} onPress={navigateToStats}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={[styles.cardTitle, styles.secondaryCardTitle]}>{t('donations.platform_stats')}</Text>
          </View>
          <Text style={[styles.cardDescription, styles.secondaryCardDescription]}>
            {t('donations.view_platform_statistics')}
          </Text>
        </TouchableOpacity>

        {/* MPGS Security Notice */}
        <View style={styles.securityNotice}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            {t('donations.mpgs_security_notice')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
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
  content: {
    padding: 20,
  },
  primaryCard: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  primaryCardTitle: {
    color: 'white',
  },
  secondaryCardTitle: {
    color: '#2c3e50',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  primaryCardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  secondaryCardDescription: {
    color: '#7f8c8d',
  },
  cardCTA: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
  },
  securityNotice: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#27ae60',
    lineHeight: 18,
  },
});

export default DonationMenuScreen;
