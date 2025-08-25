// services/NotificationService.ts
import notifee, { AndroidImportance, AndroidStyle, TriggerType, TimestampTrigger } from '@notifee/react-native';
import { Platform } from 'react-native';

interface NotificationData {
  [key: string]: any;
}

class NotificationService {
  private initialized = false;

  constructor() {
    this.configure();
  }

  configure = async () => {
    if (this.initialized) return;

    try {
      // Request permissions
      await notifee.requestPermission();
      
      // Create notification channels (Android)
      if (Platform.OS === 'android') {
        // High priority channel
        await notifee.createChannel({
          id: 'disaster-alerts-high',
          name: 'High Risk Disaster Alerts',
          description: 'Critical disaster warnings and emergency alerts',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
        });

        // Medium priority channel
        await notifee.createChannel({
          id: 'disaster-alerts-medium',
          name: 'Medium Risk Disaster Alerts',
          description: 'Moderate disaster warnings and safety notifications',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
          vibration: true,
        });

        // Low priority channel
        await notifee.createChannel({
          id: 'disaster-alerts-low',
          name: 'General Disaster Information',
          description: 'General information and low-priority updates',
          importance: AndroidImportance.LOW,
          sound: 'default',
        });

        console.log('✅ Notification channels created successfully');
      }

      this.initialized = true;
      console.log('✅ Notification service initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  };

  // Send local notification that appears in notification bar
  sendLocalNotification = async (
    title: string,
    message: string,
    type: 'high' | 'medium' | 'low' = 'high',
    data?: NotificationData
  ) => {
    try {
      // Ensure notification service is configured
      if (!this.initialized) {
        console.log('🔄 Notification service not initialized, configuring now...');
        await this.configure();
      }

      const channelMap = {
        high: 'disaster-alerts-high',
        medium: 'disaster-alerts-medium',
        low: 'disaster-alerts-low',
      };

      const colorMap = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981',
      };

      const notification = {
        title,
        body: message,
        data: data || {},
        android: {
          channelId: channelMap[type],
          importance: type === 'high' ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
          pressAction: {
            id: 'default',
          },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: message,
          } as const,
          color: colorMap[type],
          smallIcon: 'ic_notification',
          largeIcon: 'ic_launcher',
          circularLargeIcon: true,
          vibrationPattern: type === 'high' ? [300, 500, 300, 500] : [300, 500],
        },
      };

      // Display the notification
      await notifee.displayNotification(notification);
      
      console.log(`📢 ${type.toUpperCase()} notification sent:`, title);
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      // Fallback notification via console
      console.log(`📢 [ERROR FALLBACK] ${type.toUpperCase()} notification:`, title, message);
    }
  };

  // Schedule notification for future delivery
  scheduleNotification = async (
    title: string,
    message: string,
    triggerDate: Date,
    type: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    try {
      await this.configure();

      const channelMap = {
        high: 'disaster-alerts-high',
        medium: 'disaster-alerts-medium',
        low: 'disaster-alerts-low',
      };

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerDate.getTime(),
      };

      await notifee.createTriggerNotification(
        {
          title,
          body: message,
          android: {
            channelId: channelMap[type],
          },
        },
        trigger
      );

      console.log(`⏰ Scheduled notification for:`, triggerDate);
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
    }
  };

  // Cancel all notifications
  cancelAllNotifications = async () => {
    try {
      await notifee.cancelAllNotifications();
      console.log('🚫 All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling notifications:', error);
    }
  };

  // Cancel specific notification
  cancelNotification = async (id: string) => {
    try {
      await notifee.cancelNotification(id);
      console.log(`🚫 Notification ${id} cancelled`);
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
    }
  };

  // Check notification permissions
  checkPermissions = async () => {
    try {
      const settings = await notifee.getNotificationSettings();
      return settings.authorizationStatus;
    } catch (error) {
      console.error('❌ Error checking permissions:', error);
      return 0;
    }
  };

  // Request permissions
  requestPermissions = async () => {
    try {
      return await notifee.requestPermission();
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return null;
    }
  };
}

export default new NotificationService();
