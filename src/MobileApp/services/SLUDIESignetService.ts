// SLUDI eSignet Service
// Handles communication with SLUDI backend for token exchange

import { ESIGNET_ENV_CONFIG } from '../config/esignetConfig';

interface TokenExchangeRequest {
  code: string;
  state?: string;
}

interface ESignetUserInfo {
  sub?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  picture?: string;
  gender?: string;
  birthdate?: string;
  address?: any;
  [key: string]: any;
}

class SLUDIESignetService {
  private backendUrl: string;

  constructor() {
    // Use SLUDI backend URL from config
    this.backendUrl = ESIGNET_ENV_CONFIG.MOCK_RELYING_PARTY_SERVER_URL;
  }

  /**
   * Exchange authorization code for user information
   * Calls SLUDI backend /fetchUserInfo endpoint
   */
  async exchangeCodeForUserInfo(request: TokenExchangeRequest): Promise<ESignetUserInfo> {
    try {
      console.log('📞 Calling SLUDI backend for token exchange...');
      console.log('Backend URL:', this.backendUrl);
      console.log('Request:', { code: request.code.substring(0, 10) + '...' });

      const response = await fetch(`${this.backendUrl}/fetchUserInfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: request.code,
          state: request.state
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SLUDI backend error: ${response.status} - ${errorText}`);
      }

      const userInfo = await response.json();
      console.log('✅ User info received from SLUDI backend:', userInfo);

      return userInfo;
    } catch (error) {
      console.error('❌ SLUDI token exchange failed:', error);
      throw new Error(`Failed to exchange token with SLUDI backend: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate eSignet authorization response
   */
  validateAuthorizationResponse(url: string): { code: string; state: string } | null {
    try {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');
      const errorDescription = urlObj.searchParams.get('error_description');

      if (error) {
        throw new Error(`eSignet authentication error: ${error} - ${errorDescription || 'Unknown error'}`);
      }

      if (!code) {
        throw new Error('No authorization code received from eSignet');
      }

      return { code, state: state || '' };
    } catch (error) {
      console.error('Invalid authorization response:', error);
      return null;
    }
  }

  /**
   * Build eSignet authorization URL manually (for fallback scenarios)
   */
  buildAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: ESIGNET_ENV_CONFIG.CLIENT_ID,
      response_type: 'code',
      scope: decodeURIComponent(ESIGNET_ENV_CONFIG.SCOPE_USER_PROFILE),
      redirect_uri: ESIGNET_ENV_CONFIG.REDIRECT_URI,
      state: state,
      nonce: nonce,
      display: ESIGNET_ENV_CONFIG.DISPLAY,
      prompt: ESIGNET_ENV_CONFIG.PROMPT,
      max_age: ESIGNET_ENV_CONFIG.MAX_AGE.toString(),
      ui_locales: ESIGNET_ENV_CONFIG.DEFAULT_LANG,
      acr_values: decodeURIComponent(ESIGNET_ENV_CONFIG.ACRS),
      claims_locales: ESIGNET_ENV_CONFIG.CLAIMS_LOCALES,
      claims: ESIGNET_ENV_CONFIG.CLAIMS_USER_PROFILE
    });

    return `${ESIGNET_ENV_CONFIG.ESIGNET_UI_BASE_URL}/authorize?${params.toString()}`;
  }

  /**
   * Check if SLUDI backend is accessible
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/`, {
        method: 'GET',
        timeout: 5000,
      } as any);

      return response.ok;
    } catch (error) {
      console.warn('SLUDI backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const sludiESignetService = new SLUDIESignetService();
export default sludiESignetService;
