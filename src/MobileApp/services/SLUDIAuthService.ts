import axios from 'axios';
import { ESIGNET_ENV_CONFIG } from '../config/esignetConfig';

// SLUDI Authentication Service for Mobile App
// Based on the SLUDI app's backend implementation

class SLUDIAuthService {
  constructor() {
    this.baseUrl = ESIGNET_ENV_CONFIG.MOCK_RELYING_PARTY_SERVER_URL;
    this.tokenEndpoint = '/fetchUserInfo';
  }

  /**
   * Exchange authorization code for user information
   * @param {string} code - Authorization code from SLUDI
   * @param {string} clientId - Client ID
   * @param {string} redirectUri - Redirect URI
   * @param {string} grantType - Grant type (authorization_code)
   * @returns {Promise<Object>} User information
   */
  async exchangeCodeForUserInfo(code, clientId, redirectUri, grantType = 'authorization_code') {
    try {
      const requestData = {
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
        grant_type: grantType
      };

      const endpoint = `${this.baseUrl}${this.tokenEndpoint}`;

      console.log('🔄 Exchanging code for user info:', endpoint);
      console.log('📋 Request data:', requestData);

      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      console.log('✅ User info received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to exchange code for user info:', error);

      if (error.response) {
        // Server responded with error status
        throw new Error(`Authentication failed: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to connect to authentication server');
      } else {
        // Other error
        throw new Error(`Authentication error: ${error.message}`);
      }
    }
  }

  /**
   * Validate the authentication response
   * @param {Object} authResponse - Response from SLUDI authentication
   * @returns {boolean} Whether the response is valid
   */
  validateAuthResponse(authResponse) {
    if (!authResponse) {
      throw new Error('No authentication response received');
    }

    if (authResponse.type === 'error') {
      throw new Error(authResponse.error_description || authResponse.error || 'Authentication failed');
    }

    if (authResponse.type === 'cancel') {
      throw new Error('User cancelled authentication');
    }

    if (authResponse.type === 'success' && authResponse.url) {
      return true;
    }

    throw new Error('Invalid authentication response');
  }

  /**
   * Extract authorization code from callback URL
   * @param {string} callbackUrl - The callback URL with authorization code
   * @returns {Object} Extracted parameters
   */
  extractAuthParams(callbackUrl) {
    try {
      const url = new URL(callbackUrl);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      return {
        code,
        state,
        error,
        errorDescription
      };
    } catch (error) {
      throw new Error('Invalid callback URL format');
    }
  }

  /**
   * Handle the complete authentication flow
   * @param {Object} authResponse - Response from SLUDI authentication
   * @returns {Promise<Object>} User information
   */
  async handleAuthentication(authResponse) {
    try {
      // Validate the response
      this.validateAuthResponse(authResponse);

      // Extract parameters from callback URL
      const authParams = this.extractAuthParams(authResponse.url);

      if (authParams.error) {
        throw new Error(authParams.errorDescription || authParams.error);
      }

      if (!authParams.code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for user info
      const userInfo = await this.exchangeCodeForUserInfo(
        authParams.code,
        ESIGNET_ENV_CONFIG.CLIENT_ID,
        ESIGNET_ENV_CONFIG.REDIRECT_URI,
        'authorization_code'
      );

      return {
        success: true,
        userInfo,
        authParams
      };

    } catch (error) {
      console.error('❌ Authentication flow failed:', error);
      return {
        success: false,
        error: error.message,
        authResponse
      };
    }
  }
}

// Export singleton instance
export default new SLUDIAuthService();</content>
<filePath>c:\Users\gaind\OneDrive\Desktop\CodeFest\national-disaster-platform\src\MobileApp\services\SLUDIAuthService.ts
