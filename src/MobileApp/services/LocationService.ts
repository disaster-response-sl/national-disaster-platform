import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationData {
  lat: number;
  lng: number;
}

export interface LocationResult {
  success: boolean;
  location?: LocationData;
  name?: string;
  error?: string;
}

// Sri Lanka fallback locations
const SRI_LANKA_FALLBACK_LOCATIONS = {
  colombo: { lat: 6.9271, lng: 79.8612, name: 'Colombo' },
  malabe: { lat: 6.9056, lng: 79.958, name: 'Malabe' },
  kandy: { lat: 7.2906, lng: 80.6337, name: 'Kandy' },
  galle: { lat: 6.0535, lng: 80.2210, name: 'Galle' },
  negombo: { lat: 7.2008, lng: 79.8737, name: 'Negombo' },
};

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      
      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }
  return true; // iOS permissions are handled automatically
};

export const getCurrentLocationWithFallback = (): Promise<LocationResult> => {
  return new Promise(async (resolve) => {
    console.log('🎯 Starting location detection...');

    // First, request permissions
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('📍 Permission denied, using fallback');
      const fallback = SRI_LANKA_FALLBACK_LOCATIONS.colombo;
      return resolve({
        success: true,
        location: { lat: fallback.lat, lng: fallback.lng },
        name: `${fallback.name} (Default)`,
        error: 'Permission denied'
      });
    }

    // Try to get current position
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 GPS Location detected:', latitude, longitude);
        
        // Check if we're in Sri Lanka (lat: 5.9-9.9, lng: 79.5-81.9)
        const isInSriLanka = (latitude >= 5.9 && latitude <= 9.9) && 
                            (longitude >= 79.5 && longitude <= 81.9);
        
        if (isInSriLanka) {
          console.log('✅ Valid Sri Lankan location detected');
          resolve({
            success: true,
            location: { lat: latitude, lng: longitude },
            name: 'Current Location',
          });
        } else {
          console.warn('⚠️ GPS shows location outside Sri Lanka, using fallback');
          const fallback = SRI_LANKA_FALLBACK_LOCATIONS.colombo;
          resolve({
            success: true,
            location: { lat: fallback.lat, lng: fallback.lng },
            name: `${fallback.name} (Outside SL)`,
            error: 'Outside Sri Lanka'
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
        
        // Handle specific error codes with appropriate fallbacks
        let errorMessage = '';
        const fallback = SRI_LANKA_FALLBACK_LOCATIONS.colombo;
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = 'Permission denied';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = 'GPS unavailable';
            break;
          case 3: // TIMEOUT
            errorMessage = 'Location timeout';
            break;
          default:
            errorMessage = 'Unknown location error';
        }
        
        console.log(`🧪 ${errorMessage}, using fallback location`);
        resolve({
          success: true,
          location: { lat: fallback.lat, lng: fallback.lng },
          name: `${fallback.name} (${errorMessage})`,
          error: errorMessage
        });
      },
      {
        enableHighAccuracy: false, // Less battery intensive
        timeout: 15000, // 15 seconds timeout
        maximumAge: 60000, // Accept location up to 1 minute old
      }
    );
  });
};

export const showLocationErrorAlert = (error: string) => {
  let title = 'Location Notice';
  let message = '';
  
  switch(error) {
    case 'Permission denied':
      message = 'Location permission was denied. Using default location (Colombo). You can enable location in device settings for more accurate information.';
      break;
    case 'GPS unavailable':
      message = 'GPS is currently unavailable. Using default location (Colombo). Please check if location services are enabled.';
      break;
    case 'Location timeout':
      message = 'Location request timed out. Using default location (Colombo). This might happen in areas with poor GPS signal.';
      break;
    case 'Outside Sri Lanka':
      message = 'Current location appears to be outside Sri Lanka. Using Colombo as default location for relevant disaster information.';
      break;
    default:
      message = 'Unable to get current location. Using default location (Colombo). You can manually select your location if needed.';
  }
  
  Alert.alert(title, message, [{ text: 'OK' }]);
};

export const getSriLankanFallbackLocations = () => {
  return Object.values(SRI_LANKA_FALLBACK_LOCATIONS);
};

export default {
  getCurrentLocationWithFallback,
  requestLocationPermission,
  showLocationErrorAlert,
  getSriLankanFallbackLocations,
};
