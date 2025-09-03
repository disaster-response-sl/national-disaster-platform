// Offline Service - Provides fallback data when backend is unavailable
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineService {
  private static instance: OfflineService;

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Mock disaster data for offline mode
  getMockDisasters() {
    return [
      {
        _id: 'mock-flood-1',
        type: 'flood',
        severity: 'high',
        location: { lat: 6.9271, lng: 79.8612 }, // Colombo
        description: 'Heavy rainfall causing urban flooding in Colombo city areas',
        timestamp: new Date().toISOString(),
        status: 'active'
      },
      {
        _id: 'mock-landslide-1',
        type: 'landslide',
        severity: 'medium',
        location: { lat: 7.2906, lng: 80.6337 }, // Kandy
        description: 'Risk of landslides in hilly areas due to heavy rains',
        timestamp: new Date().toISOString(),
        status: 'active'
      },
      {
        _id: 'mock-weather-1',
        type: 'weather',
        severity: 'low',
        location: { lat: 6.0535, lng: 80.2210 }, // Galle
        description: 'Strong winds and heavy rainfall expected',
        timestamp: new Date().toISOString(),
        status: 'warning'
      }
    ];
  }

  // Mock chat responses for offline mode
  getMockChatResponse(message: string) {
    const responses = [
      {
        id: 'offline-response-' + Date.now(),
        query: message,
        response: 'I\'m currently offline, but here are some general emergency guidelines: Stay calm, follow local emergency protocols, and contact emergency services (119 or 110) if needed.',
        timestamp: new Date().toISOString(),
        type: 'assistant',
        safetyLevel: 'medium',
        recommendations: [
          'Keep emergency contact numbers handy',
          'Stay informed through local radio/TV',
          'Follow evacuation orders if issued',
          'Keep emergency supplies ready'
        ]
      }
    ];
    return responses[0];
  }

  // Mock alert data
  getMockAlerts() {
    return [
      {
        id: 'mock-alert-1',
        type: 'Weather Alert',
        location: 'Colombo, Western Province',
        severity: 'high',
        timestamp: new Date().toISOString(),
        description: 'Heavy rainfall warning - flooding expected in low-lying areas'
      },
      {
        id: 'mock-alert-2',
        type: 'Landslide Warning',
        location: 'Kandy, Central Province',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        description: 'Landslide risk in hilly areas due to prolonged rainfall'
      }
    ];
  }

  // Mock available resources
  getMockResources() {
    return [
      {
        id: 'mock-resource-1',
        name: 'Emergency Shelter - Colombo Municipal Council',
        type: 'shelter',
        location: { lat: 6.9271, lng: 79.8612 },
        address: 'Town Hall, Colombo 7',
        contact: '+94 11 2 692241',
        capacity: 500,
        available: true
      },
      {
        id: 'mock-resource-2',
        name: 'Medical Center - National Hospital',
        type: 'medical',
        location: { lat: 6.9147, lng: 79.8757 },
        address: 'Regent Street, Colombo 8',
        contact: '+94 11 2 691111',
        available: true
      }
    ];
  }

  // Create offline authentication token
  async createOfflineToken() {
    const offlineToken = {
      _id: 'offline-user-' + Date.now(),
      individualId: 'citizen001',
      name: 'Demo User (Offline)',
      email: 'demo@offline.lk',
      role: 'Citizen',
      authMethod: 'OFFLINE_MODE',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const tokenHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const tokenBody = btoa(JSON.stringify(offlineToken));
    const mockToken = `${tokenHeader}.${tokenBody}.offline_mode_${Date.now()}`;

    await AsyncStorage.setItem('authToken', mockToken);
    await AsyncStorage.setItem('userInfo', JSON.stringify(offlineToken));
    await AsyncStorage.setItem('userId', offlineToken._id);
    await AsyncStorage.setItem('isOfflineMode', 'true');

    return mockToken;
  }

  // Check if app is in offline mode
  async isOfflineMode(): Promise<boolean> {
    const offlineFlag = await AsyncStorage.getItem('isOfflineMode');
    return offlineFlag === 'true';
  }

  // Enable offline mode
  async enableOfflineMode() {
    await AsyncStorage.setItem('isOfflineMode', 'true');
    console.log('📱 Offline mode enabled');
  }

  // Disable offline mode
  async disableOfflineMode() {
    await AsyncStorage.removeItem('isOfflineMode');
    console.log('🌐 Offline mode disabled');
  }

  // Get offline status message
  getOfflineStatusMessage() {
    return "You're currently in offline mode. Limited functionality is available. Some features may not work until connection is restored.";
  }
}

export const offlineService = OfflineService.getInstance();
