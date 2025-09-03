const axios = require("axios");
const jose = require("jose");
const { importJWK, SignJWT, decodeJwt } = require("jose");

const { ESIGNET_SERVICE_URL, ESIGNET_AUD_URL, CLIENT_ASSERTION_TYPE, CLIENT_PRIVATE_KEY, USERINFO_RESPONSE_TYPE, JWE_USERINFO_PRIVATE_KEY } = require("./config");

const baseUrl = ESIGNET_SERVICE_URL.trim();
const getTokenEndPoint = "/oauth/v2/token";
const getUserInfoEndPoint = "/oidc/userinfo";

const alg = "RS256";
const jweEncryAlgo = "RSA-OAEP-256";
const expirationTime = "1h";

/**
 * Triggers /oauth/v2/token API on esignet service to fetch access token
 * @param {string} code auth code
 * @param {string} client_id registered client id
 * @param {string} redirect_uri validated redirect_uri
 * @param {string} grant_type grant_type
 * @returns access token
 */
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
  console.log(baseUrl)
  console.log(endpoint)
  const response = await axios.post(endpoint, request, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  console.log(response.data)
  return response.data;
};

/**
 * Triggers /oidc/userinfo API on esignet service to fetch userInformation
 * @param {string} access_token valid access token
 * @returns decrypted/decoded json user information
 */
const get_GetUserInfo = async (access_token) => {
  const endpoint = baseUrl + getUserInfoEndPoint;
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  return decodeUserInfoResponse(response.data);
};

/**
 * Generates client assertion signedJWT
 * @param {string} clientId registered client id
 * @returns client assertion signedJWT
 */

async function generateSignedJwt(clientId) {
  const privateKey = await importJWK(CLIENT_PRIVATE_KEY, alg);

  const jwt = await new SignJWT({ iss: clientId, sub: clientId, aud: ESIGNET_AUD_URL })
    .setProtectedHeader({ alg, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return jwt;
}


// const generateSignedJwt = async (clientId) => {
//   // Set headers for JWT
//   var header = {
//     alg: alg,
//     typ: "JWT",
//   };

//   var payload = {
//     iss: clientId,
//     sub: clientId,
//     aud: ESIGNET_AUD_URL,
//   };

//   var decodeKey = Buffer.from(CLIENT_PRIVATE_KEY, 'base64')?.toString();
//   const jwkObject = JSON.parse(decodeKey);
//   const privateKey = await jose.importJWK(jwkObject, alg);
//   // var privateKey = await jose.importPKCS8(CLIENT_PRIVATE_KEY, alg);

//   const jwt = new jose.SignJWT(payload)
//     .setProtectedHeader(header)
//     .setIssuedAt()
//     .setJti(Math.random().toString(36).substring(2,7))
//     .setExpirationTime(expirationTime)
//     .sign(privateKey);

//   return jwt;
// };

/**
 * decrypts and decodes the user information fetched from esignet services
 * @param {string} userInfoResponse JWE encrypted or JWT encoded user information
 * @returns decrypted/decoded json user information
 */
const decodeUserInfoResponse = async (userInfoResponse) => {

  let response = userInfoResponse;

  if (USERINFO_RESPONSE_TYPE.toLowerCase() === "jwe") {
    var decodeKey = Buffer.from(JWE_USERINFO_PRIVATE_KEY, 'base64')?.toString();
    const jwkObject = JSON.parse(decodeKey);
    const privateKeyObj = await jose.importJWK(jwkObject, jweEncryAlgo);

    try {
      const { plaintext, protectedHeader } = await jose.compactDecrypt(response, privateKeyObj)
      response = new TextDecoder().decode(plaintext);
    } catch (error) {
      try {
        const { plaintext } = await jose.flattenedDecrypt(response, privateKeyObj)
        response = new TextDecoder().decode(plaintext);
      } catch (error) {
        const { plaintext } = await jose.generalDecrypt(response, privateKeyObj)
        response = new TextDecoder().decode(plaintext);
      }
    }
  }
  console.log("userInfoResponse", response);
  return await new jose.decodeJwt(response);
};

module.exports = {
  post_GetToken: post_GetToken,
  get_GetUserInfo: get_GetUserInfo,
};
