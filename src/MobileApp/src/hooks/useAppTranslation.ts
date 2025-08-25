import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook for common translation patterns in the disaster response app
 */
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();

  // Common translation shortcuts
  const tCommon = (key: string, options?: any) => t(`common:${key}`, options);
  const tScreens = (key: string, options?: any) => t(`screens:${key}`, options);
  const tSettings = (key: string, options?: any) => t(`settings:${key}`, options);

  // Disaster type translations
  const getDisasterTypeText = (type: string): string => {
    const translated = tCommon(`disaster_types.${type}`);
    return typeof translated === 'string' ? translated : type;
  };

  // Severity level translations
  const getSeverityText = (severity: string): string => {
    const translated = tCommon(`severity.${severity}`);
    return typeof translated === 'string' ? translated : severity;
  };

  // Time formatting with localization
  const formatRelativeTime = (timestamp: string | Date): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      const translated = tCommon('time.now');
      return typeof translated === 'string' ? translated : 'Now';
    } else if (diffInMinutes < 60) {
      const translated = tCommon('time.minutes_ago', { count: diffInMinutes });
      return typeof translated === 'string' ? translated : `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      const translated = tCommon('time.hours_ago', { count: hours });
      return typeof translated === 'string' ? translated : `${hours} hours ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      const translated = tCommon('time.days_ago', { count: days });
      return typeof translated === 'string' ? translated : `${days} days ago`;
    }
  };

  // Format numbers according to locale
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(currentLanguage === 'si' ? 'si-LK' : 
                                currentLanguage === 'ta' ? 'ta-LK' : 'en-US').format(num);
  };

  // Format currency (Sri Lankan Rupees)
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(currentLanguage === 'si' ? 'si-LK' : 
                                currentLanguage === 'ta' ? 'ta-LK' : 'en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Get localized date format
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(currentLanguage === 'si' ? 'si-LK' : 
                                     currentLanguage === 'ta' ? 'ta-LK' : 'en-LK');
  };

  // Get localized time format
  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(currentLanguage === 'si' ? 'si-LK' : 
                                     currentLanguage === 'ta' ? 'ta-LK' : 'en-LK', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get appropriate font family for current language
  const getFontFamily = (): string => {
    switch (currentLanguage) {
      case 'si':
        return 'NotoSansSinhala-Regular'; // You'll need to add this font
      case 'ta':
        return 'NotoSansTamil-Regular'; // You'll need to add this font
      default:
        return 'System'; // Default system font for English
    }
  };

  // Get text direction style
  const getTextDirection = () => ({
    textAlign: isRTL ? 'right' as const : 'left' as const,
    writingDirection: isRTL ? 'rtl' as const : 'ltr' as const,
  });

  return {
    // Core translation functions
    t,
    tCommon,
    tScreens,
    tSettings,
    
    // Specialized translations
    getDisasterTypeText,
    getSeverityText,
    
    // Formatting functions
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    
    // Styling helpers
    getFontFamily,
    getTextDirection,
    
    // Language info
    currentLanguage,
    isRTL,
    i18n,
  };
};

/**
 * Hook for emergency/critical messages that need immediate translation
 */
export const useEmergencyTranslation = () => {
  const { tCommon, tScreens } = useAppTranslation();

  const getEmergencyMessage = (type: 'sos_sent' | 'sos_failed' | 'alert_received' | 'evacuation_required'): string => {
    let translated: string | object;
    
    switch (type) {
      case 'sos_sent':
        translated = tScreens('sos.sos_sent');
        return typeof translated === 'string' ? translated : 'SOS sent successfully';
      case 'sos_failed':
        translated = tScreens('sos.sos_failed');
        return typeof translated === 'string' ? translated : 'Failed to send SOS';
      case 'alert_received':
        translated = tScreens('dashboard.recent_alerts');
        return typeof translated === 'string' ? translated : 'Recent Alerts';
      case 'evacuation_required':
        return 'Evacuation Required - පිටවීම අවශ්‍යයි - வெளியேற்றம் தேவை';
      default:
        translated = tCommon('app.error');
        return typeof translated === 'string' ? translated : 'Error';
    }
  };

  return {
    getEmergencyMessage,
  };
};

export default useAppTranslation;
