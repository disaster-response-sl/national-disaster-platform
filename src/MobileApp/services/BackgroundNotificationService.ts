// services/BackgroundNotificationService.ts
import NotificationService from './NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class BackgroundNotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start background monitoring for disaster alerts
  startBackgroundMonitoring = () => {
    if (this.isRunning) return;
    
    console.log('🔍 Starting background disaster monitoring...');
    this.isRunning = true;

    // Check for high-risk location every 30 seconds
    this.checkInterval = setInterval(async () => {
      await this.checkForDisasterRisks();
    }, 30000); // 30 seconds
  };

  // Stop background monitoring
  stopBackgroundMonitoring = () => {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Background disaster monitoring stopped');
  };

  // Check if user is in a high-risk area
  private checkForDisasterRisks = async () => {
    try {
      const locationData = await AsyncStorage.getItem('currentLocation');
      const riskStatus = await AsyncStorage.getItem('currentRiskStatus');
      
      if (!locationData || !riskStatus) return;

      const location = JSON.parse(locationData);
      const risk = riskStatus.toLowerCase();

      console.log(`🔍 Background check - Location: ${location.name}, Risk: ${risk}`);

      // Send notification for high-risk areas
      if (risk === 'high') {
        const lastNotification = await AsyncStorage.getItem('lastBackgroundNotification');
        const now = Date.now();
        
        // Only send notification if last one was more than 5 minutes ago
        if (!lastNotification || (now - parseInt(lastNotification)) > 300000) {
          await NotificationService.sendLocalNotification(
            '🚨 High Risk Area Detected!',
            `You are currently in ${location.name}, which has active disaster risks. Stay alert and follow safety guidelines.`,
            'high',
            {
              type: 'background_alert',
              location: location.name,
              timestamp: new Date().toISOString(),
            }
          );

          await AsyncStorage.setItem('lastBackgroundNotification', now.toString());
          console.log('🚨 Background high-risk notification sent');
        }
      }
    } catch (error) {
      console.error('❌ Background monitoring error:', error);
    }
  };

  // Manually trigger a demo notification (for testing)
  sendDemoNotification = async () => {
    await NotificationService.sendLocalNotification(
      '🧪 Demo Background Alert',
      'This is a test of the background notification system. In a real scenario, this would alert you about nearby disasters.',
      'medium',
      {
        type: 'demo',
        timestamp: new Date().toISOString(),
      }
    );
    console.log('🧪 Demo notification sent');
  };
}

export default new BackgroundNotificationService();
