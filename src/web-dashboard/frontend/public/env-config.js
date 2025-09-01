// eSignet Frontend Configuration (Integration Guide Compliant)
window._env_ = {
  // eSignet URLs (provided by ICTA)
  ESIGNET_UI_BASE_URL: "https://sludiauth.icta.gov.lk",
  MOCK_RELYING_PARTY_SERVER_URL: "http://localhost:8888",
  
  // Redirect URIs (Integration Guide Requirements)
  REDIRECT_URI_USER_PROFILE: "http://localhost:5173/userprofile",
  REDIRECT_URI_REGISTRATION: "http://localhost:5173/registration",
  REDIRECT_URI: "http://localhost:5173/userprofile",
  
  // Client Configuration (Replace with your team's CLIENT_ID from ICTA)
  CLIENT_ID: "your-client-id", // TODO: Replace with actual CLIENT_ID
  
  // eSignet Configuration
  ACRS: "mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code",
  SCOPE_USER_PROFILE: "openid profile resident-service",
  SCOPE_REGISTRATION: "openid profile",
  CLAIMS_USER_PROFILE: "%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D",
  CLAIMS_REGISTRATION: "%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D",
  SIGN_IN_BUTTON_PLUGIN_URL: "https://sludiauth.icta.gov.lk/plugins/sign-in-button-plugin.js",
  
  // UI Configuration
  DISPLAY: "page",
  PROMPT: "consent",
  GRANT_TYPE: "authorization_code",
  MAX_AGE: 21,
  CLAIMS_LOCALES: "en",
  DEFAULT_LANG: "en",
  FALLBACK_LANG: "%7B%22label%22%3A%22English%22%2C%22value%22%3A%22en%22%7D"
};
