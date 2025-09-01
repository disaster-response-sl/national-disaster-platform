// eSignet Integration for Mobile App (Official eSignet Integration Guide Compliant)
// Following the exact structure from eSignet_Integration_Guide.md

export const ESIGNET_CONFIG = {
  // eSignet Service URLs (from Integration Guide)
  ESIGNET_UI_BASE_URL: "https://sludiauth.icta.gov.lk",
  ESIGNET_SERVICE_URL: "https://sludiauth.icta.gov.lk/service", 
  ESIGNET_AUD_URL: "https://sludiauth.icta.gov.lk/service/oauth/v2/token",
  
  // Backend Mock Relying Party Server (from Integration Guide)
  MOCK_RELYING_PARTY_SERVER_URL: "http://localhost:8888",
  
  // Client Configuration (Replace with your team's CLIENT_ID from ICTA)
  CLIENT_ID: "your_client_id_from_icta", // TODO: Replace with actual CLIENT_ID
  
  // Mobile dashboard redirect URI
  REDIRECT_URI: "ndp://dashboard",
  
  // OAuth2 Parameters (from Integration Guide)
  ACRS: "mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code",
  SCOPE_USER_PROFILE: "openid profile resident-service",
  SCOPE_REGISTRATION: "openid profile",
  
  // Claims (from Integration Guide format)
  CLAIMS_USER_PROFILE: encodeURIComponent(JSON.stringify({
    "userinfo": {
      "given_name": {"essential": true},
      "phone_number": {"essential": false}, 
      "email": {"essential": true},
      "picture": {"essential": false},
      "gender": {"essential": false},
      "birthdate": {"essential": false},
      "address": {"essential": false}
    },
    "id_token": {}
  })),
  
  CLAIMS_REGISTRATION: encodeURIComponent(JSON.stringify({
    "userinfo": {
      "given_name": {"essential": true},
      "phone_number": {"essential": false},
      "email": {"essential": true}, 
      "picture": {"essential": false},
      "gender": {"essential": false},
      "birthdate": {"essential": false},
      "address": {"essential": false}
    },
    "id_token": {}
  })),
  
  // UI Configuration (from Integration Guide)
  DISPLAY: "page",
  PROMPT: "consent", 
  GRANT_TYPE: "authorization_code",
  MAX_AGE: 21,
  CLAIMS_LOCALES: "en",
  DEFAULT_LANG: "en",
  FALLBACK_LANG: "%7B%22label%22%3A%22English%22%2C%22value%22%3A%22en%22%7D"
};

// Generate eSignet Authorization URL (eSignet Integration Guide compliant)
export const generateESignetAuthURL = (state: string, nonce: string) => {
  const params = new URLSearchParams({
    client_id: ESIGNET_CONFIG.CLIENT_ID,
    response_type: "code",
    scope: ESIGNET_CONFIG.SCOPE_USER_PROFILE,
    redirect_uri: ESIGNET_CONFIG.REDIRECT_URI,
    state: state,
    nonce: nonce,
    claims: ESIGNET_CONFIG.CLAIMS_USER_PROFILE,
    acr_values: ESIGNET_CONFIG.ACRS,
    display: ESIGNET_CONFIG.DISPLAY,
    prompt: ESIGNET_CONFIG.PROMPT,
    max_age: ESIGNET_CONFIG.MAX_AGE.toString(),
    ui_locales: ESIGNET_CONFIG.DEFAULT_LANG
  });
  
  return `${ESIGNET_CONFIG.ESIGNET_UI_BASE_URL}/oauth/v2/authorize?${params.toString()}`;
};

// Helper function to exchange authorization code for tokens (eSignet Integration Guide)
export const exchangeCodeForTokens = async (code: string, redirect_uri: string) => {
  try {
    const response = await fetch(`${ESIGNET_CONFIG.MOCK_RELYING_PARTY_SERVER_URL}/fetchUserInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        client_id: ESIGNET_CONFIG.CLIENT_ID,
        redirect_uri: redirect_uri,
        grant_type: ESIGNET_CONFIG.GRANT_TYPE
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};
