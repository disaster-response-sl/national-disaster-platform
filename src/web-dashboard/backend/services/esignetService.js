// esignetService.js - eSignet Integration Guide Implementation
const axios = require("axios");
const jose = require("jose");
const { importJWK, SignJWT, decodeJwt } = require("jose");

// Load configuration from environment variables (eSignet Integration Guide)
const ESIGNET_SERVICE_URL = process.env.ESIGNET_SERVICE_URL || "https://sludiauth.icta.gov.lk/service";
const ESIGNET_AUD_URL = process.env.ESIGNET_AUD_URL || "https://sludiauth.icta.gov.lk/service/oauth/v2/token";
const CLIENT_ASSERTION_TYPE = process.env.CLIENT_ASSERTION_TYPE || "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const CLIENT_PRIVATE_KEY = JSON.parse(process.env.CLIENT_PRIVATE_KEY || '{}');
const USERINFO_RESPONSE_TYPE = process.env.USERINFO_RESPONSE_TYPE || "jwk";
const JWE_USERINFO_PRIVATE_KEY = process.env.JWE_USERINFO_PRIVATE_KEY || '';

const baseUrl = ESIGNET_SERVICE_URL.trim();
const getTokenEndPoint = "/oauth/v2/token";
const getUserInfoEndPoint = "/oidc/userinfo";

const alg = "RS256";
const jweEncryAlgo = "RSA-OAEP-256";

// Get access token from authorization code (eSignet Integration Guide)
const post_GetToken = async ({
  code,
  client_id,
  redirect_uri,
  grant_type
}) => {
  let request = new URLSearchParams({
    code: code,
    client_id: client_id,
    redirect_uri: redirect_uri,
    grant_type: grant_type,
    client_assertion_type: CLIENT_ASSERTION_TYPE,
    client_assertion: await generateSignedJwt(client_id),
  });
  
  const endpoint = baseUrl + getTokenEndPoint;
  console.log('🔐 eSignet Token Request:', { endpoint, client_id, redirect_uri });
  
  const response = await axios.post(endpoint, request, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  
  console.log('✅ eSignet Token Response:', response.data);
  return response.data;
};

const get_GetUserInfo = async (access_token) => {
  const endpoint = baseUrl + getUserInfoEndPoint;
  console.log('👤 eSignet UserInfo Request:', { endpoint, access_token: access_token.substring(0, 20) + '...' });
  
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });
  
  const userInfo = await decodeUserInfoResponse(response.data);
  console.log('✅ eSignet UserInfo Response:', userInfo);
  return userInfo;
};

async function generateSignedJwt(clientId) {
  const privateKey = await importJWK(CLIENT_PRIVATE_KEY, alg);
  const jwt = await new SignJWT({ 
    iss: clientId, 
    sub: clientId, 
    aud: ESIGNET_AUD_URL 
  })
    .setProtectedHeader({ alg, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
  
  console.log('🔑 Generated JWT for client:', clientId);
  return jwt;
}

const decodeUserInfoResponse = async (userInfoResponse) => {
  let response = userInfoResponse;
  
  if (USERINFO_RESPONSE_TYPE.toLowerCase() === "jwe") {
    try {
      const privateKeyObj = await jose.importJWK(JSON.parse(JWE_USERINFO_PRIVATE_KEY), jweEncryAlgo);
      const { plaintext } = await jose.compactDecrypt(response, privateKeyObj);
      response = new TextDecoder().decode(plaintext);
      console.log('🔓 Decrypted JWE userinfo response');
    } catch (error) {
      console.error('❌ JWE decryption failed:', error);
      throw error;
    }
  }
  
  return await jose.decodeJwt(response);
};

module.exports = {
  post_GetToken: post_GetToken,
  get_GetUserInfo: get_GetUserInfo,
};
