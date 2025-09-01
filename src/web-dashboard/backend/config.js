// config.js - eSignet Integration Configuration
require('dotenv').config();

module.exports = {
  ESIGNET_SERVICE_URL: process.env.ESIGNET_SERVICE_URL ?? "https://sludiauth.icta.gov.lk/service",
  PORT: process.env.PORT ?? 5000,
  CLIENT_PRIVATE_KEY: JSON.parse(process.env.CLIENT_PRIVATE_KEY ?? '{}'),
  ESIGNET_AUD_URL: process.env.ESIGNET_AUD_URL ?? "https://sludiauth.icta.gov.lk/service/oauth/v2/token",
  CLIENT_ASSERTION_TYPE: process.env.CLIENT_ASSERTION_TYPE ?? "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  USERINFO_RESPONSE_TYPE: process.env.USERINFO_RESPONSE_TYPE ?? "jwk",
  JWE_USERINFO_PRIVATE_KEY: process.env.JWE_USERINFO_PRIVATE_KEY ?? '',
  CLIENT_ID: process.env.CLIENT_ID ?? 'your_client_id_from_icta',
  REDIRECT_URI_USER_PROFILE: process.env.REDIRECT_URI_USER_PROFILE ?? 'http://localhost:5173/userprofile',
  REDIRECT_URI_REGISTRATION: process.env.REDIRECT_URI_REGISTRATION ?? 'http://localhost:5173/registration',
};
