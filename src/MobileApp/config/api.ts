//config/api.ts

// For Android Emulator, use 10.0.2.2
// For iOS Simulator, use localhost
// For real device, use your computer's IP address
const getBaseURL = () => {
  // You can change this for testing different environments
  const useLocalhost = false; // Set to true for testing with localhost
  
  if (useLocalhost) {
    return 'http://localhost:5000/api';
  }
  
  // Default for Android emulator
  return 'http://192.168.1.8:5000/api';
};

export const API_BASE_URL = getBaseURL();
