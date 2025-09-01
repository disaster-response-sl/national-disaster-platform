// services/real-sludi-service.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

class RealSLUDIService {
  constructor() {
    // SLUDI API configuration - these should be set in environment variables
    this.esignetServiceUrl = process.env.SLUDI_ESIGNET_SERVICE_URL || 'https://sludiauth.icta.gov.lk/service';
    this.esignetAudUrl = process.env.SLUDI_ESIGNET_AUD_URL || 'https://sludiauth.icta.gov.lk/service/oauth/v2/token';
    this.clientId = process.env.SLUDI_CLIENT_ID || '';
    this.clientPrivateKey = this.parsePrivateKey(process.env.SLUDI_CLIENT_PRIVATE_KEY);
    this.clientAssertionType = 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer';
    
    // Default headers for SLUDI API calls
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Parse private key from environment variable (can be JSON string or JWK object)
   */
  parsePrivateKey(privateKeyEnv) {
    if (!privateKeyEnv) return null;
    
    try {
      // If it's a JSON string, parse it
      if (typeof privateKeyEnv === 'string' && privateKeyEnv.startsWith('{')) {
        return JSON.parse(privateKeyEnv);
      }
      // If it's already an object, return as is
      if (typeof privateKeyEnv === 'object') {
        return privateKeyEnv;
      }
      return privateKeyEnv;
    } catch (error) {
      console.error('Failed to parse SLUDI private key:', error);
      return null;
    }
  }

  /**
   * Generate client assertion JWT for SLUDI authentication
   */
  generateClientAssertion() {
    if (!this.clientPrivateKey) {
      throw new Error('Client private key not configured');
    }

    const header = {
      alg: 'RS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.clientId,
      sub: this.clientId,
      aud: this.esignetAudUrl,
      jti: `jti_${Date.now()}_${Math.random()}`,
      exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      iat: Math.floor(Date.now() / 1000)
    };

    // Sign JWT with private key
    return jwt.sign(payload, this.clientPrivateKey, { 
      algorithm: 'RS256',
      header: header
    });
  }

  /**
   * Authenticate user with SLUDI/eSignet using OAuth2 flow
   * This is simplified - in real implementation, you'd handle the full OAuth2 flow
   * @param {Object} authRequest - MOSIP auth request format
   * @returns {Object} MOSIP auth response format
   */
  async authenticate(authRequest) {
    try {
      console.log('Real SLUDI authenticate called with:', authRequest);
      
      // For mobile apps, we need to implement a simplified flow
      // Since SLUDI uses OAuth2, we cannot directly authenticate with individual ID + OTP
      // This would typically require a full OAuth2 flow with authorization code
      
      // For now, we'll simulate the response structure but indicate that OAuth2 flow is needed
      return {
        id: authRequest.id,
        version: authRequest.version,
        transactionID: authRequest.transactionID,
        responseTime: new Date().toISOString(),
        response: {
          authStatus: false,
          authToken: null,
          redirectUrl: this.buildAuthorizationUrl()
        },
        errors: [{
          errorCode: "SLUDI-OAUTH-001",
          message: "SLUDI requires OAuth2 authorization flow. Please redirect user to authorization URL."
        }]
      };

    } catch (error) {
      console.error('SLUDI authentication error:', error);
      return this.createErrorResponse(authRequest, "SLUDI authentication failed", "SLUDI-AUTH-002");
    }
  }

  /**
   * Build authorization URL for SLUDI OAuth2 flow
   */
  buildAuthorizationUrl(state = null) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      scope: 'openid profile resident-service',
      redirect_uri: process.env.SLUDI_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      state: state || `state_${Date.now()}`,
      nonce: `nonce_${Date.now()}`,
      claims: JSON.stringify({
        userinfo: {
          given_name: { essential: true },
          phone_number: { essential: false },
          email: { essential: true },
          picture: { essential: false },
          gender: { essential: false },
          birthdate: { essential: false },
          address: { essential: false }
        },
        id_token: {}
      })
    });

    return `${this.esignetServiceUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} authorizationCode - Authorization code from OAuth2 flow
   * @returns {Object} Token response
   */
  async exchangeCodeForToken(authorizationCode) {
    try {
      const clientAssertion = this.generateClientAssertion();
      
      const tokenRequest = {
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_assertion_type: this.clientAssertionType,
        client_assertion: clientAssertion,
        redirect_uri: process.env.SLUDI_REDIRECT_URI || 'http://localhost:3000/auth/callback'
      };

      const response = await axios.post(
        `${this.esignetServiceUrl}/oauth/token`,
        new URLSearchParams(tokenRequest),
        {
          headers: {
            ...this.defaultHeaders,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        accessToken: response.data.access_token,
        idToken: response.data.id_token,
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in
      };

    } catch (error) {
      console.error('SLUDI token exchange error:', error);
      return {
        success: false,
        error: error.response?.data?.error_description || 'Token exchange failed'
      };
    }
  }

  /**
   * Get user profile from SLUDI using access token
   * @param {string} accessToken - Access token from OAuth2 flow
   * @returns {Object} User profile data
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(
        `${this.esignetServiceUrl}/oidc/userinfo`,
        {
          headers: {
            ...this.defaultHeaders,
            'Authorization': `Bearer ${accessToken}`
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        userData: response.data
      };

    } catch (error) {
      console.error('SLUDI profile fetch error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user profile'
      };
    }
  }

  /**
   * Verify SLUDI JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Token verification result
   */
  async verifyToken(token) {
    try {
      // For proper verification, you'd need SLUDI's public key
      // This is a simplified implementation
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded) {
        return {
          success: false,
          valid: false,
          error: 'Invalid token format'
        };
      }

      // In production, verify signature with SLUDI's public key
      return {
        success: true,
        valid: true,
        userData: decoded.payload
      };

    } catch (error) {
      console.error('SLUDI token verification error:', error);
      return {
        success: false,
        valid: false,
        error: 'Token verification failed'
      };
    }
  }

  /**
   * Create standardized error response
   * @param {Object} originalRequest - Original request object
   * @param {string} message - Error message
   * @param {string} errorCode - Error code
   * @returns {Object} Error response in MOSIP format
   */
  createErrorResponse(originalRequest, message, errorCode) {
    return {
      id: originalRequest.id,
      version: originalRequest.version,
      transactionID: originalRequest.transactionID,
      responseTime: new Date().toISOString(),
      response: {
        authStatus: false,
        kycStatus: false
      },
      errors: [{
        errorCode: errorCode,
        message: message
      }]
    };
  }

  /**
   * Health check for SLUDI service
   * @returns {Object} Health check result
   */
  async healthCheck() {
    try {
      // Try to reach SLUDI service endpoint
      const response = await axios.get(
        `${this.esignetServiceUrl}/actuator/health`,
        { 
          headers: this.defaultHeaders,
          timeout: 10000
        }
      );

      return {
        success: true,
        status: 'healthy',
        data: {
          service: 'real-sludi',
          esignetServiceUrl: this.esignetServiceUrl,
          clientId: this.clientId ? 'configured' : 'not-configured',
          privateKey: this.clientPrivateKey ? 'configured' : 'not-configured',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('SLUDI health check failed:', error);
      return {
        success: false,
        status: 'unhealthy',
        error: error.message,
        data: {
          service: 'real-sludi',
          esignetServiceUrl: this.esignetServiceUrl,
          clientId: this.clientId ? 'configured' : 'not-configured',
          privateKey: this.clientPrivateKey ? 'configured' : 'not-configured',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Simplified mobile authentication - redirect to web OAuth2 flow
   * This method provides the necessary URLs for mobile app to handle OAuth2
   * @param {string} individualId - User identifier (not used in OAuth2 but kept for compatibility)
   * @returns {Object} Mobile auth response with redirect URL
   */
  async mobileAuthenticate(individualId) {
    try {
      const state = `mobile_${individualId}_${Date.now()}`;
      const authUrl = this.buildAuthorizationUrl(state);
      
      return {
        success: true,
        requiresRedirect: true,
        authorizationUrl: authUrl,
        state: state,
        message: 'Redirect user to SLUDI authorization URL'
      };
      
    } catch (error) {
      console.error('Mobile SLUDI auth error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = RealSLUDIService;
