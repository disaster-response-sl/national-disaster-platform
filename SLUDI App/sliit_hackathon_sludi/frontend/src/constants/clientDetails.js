// method to check non-empty and non-null
// values, if present then give default value
const checkEmptyNullValue = (initialValue, defaultValue) =>
  initialValue && initialValue !== "" ? initialValue : defaultValue;

const generateRandomString = (strLength = 16) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < strLength; i++) {
    const randomInd = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomInd);
  }
  return result;
}

const state = "eree2311";
const nonce = generateRandomString();
const responseType = "code";
const scopeUserProfile = checkEmptyNullValue(
  window._env_.SCOPE_USER_PROFILE,
  "openid profile"
);
const scopeRegistration = checkEmptyNullValue(
  window._env_.SCOPE_REGISTRATION,
  "openid profile"
);
const display = checkEmptyNullValue(window._env_.DISPLAY, "page");
const prompt = checkEmptyNullValue(window._env_.PROMPT, "consent");
const grantType = checkEmptyNullValue(
  window._env_.GRANT_TYPE,
  "authorization_code"
);
const maxAge = window._env_.MAX_AGE;
const claimsLocales = checkEmptyNullValue(window._env_.CLAIMS_LOCALES, "en");
const authorizeEndpoint = "/authorize";
const clientId = window._env_.CLIENT_ID;
const uibaseUrl = window._env_.ESIGNET_UI_BASE_URL;
const redirect_uri_userprofile = checkEmptyNullValue(
  window._env_.REDIRECT_URI_USER_PROFILE,
  window._env_.REDIRECT_URI
);
const redirect_uri_registration = checkEmptyNullValue(
  window._env_.REDIRECT_URI_REGISTRATION,
  window._env_.REDIRECT_URI
);
const acr_values = window._env_.ACRS;
const userProfileClaims = checkEmptyNullValue(
  window._env_.CLAIMS_USER_PROFILE,
  "{}"
);
const registrationClaims = checkEmptyNullValue(
  window._env_.CLAIMS_REGISTRATION,
  "{}"
);

const claims = {
  userinfo: {
    given_name: {
      essential: true,
    },
    phone_number: {
      essential: false,
    },
    email: {
      essential: true,
    },
    picture: {
      essential: false,
    },
    gender: {
      essential: false,
    },
    birthdate: {
      essential: false,
    },
    address: {
      essential: false,
    },
  },
  id_token: {},
};

const clientDetails = {
  nonce: nonce,
  state: state,
  clientId: clientId,
  scopeUserProfile: scopeUserProfile,
  scopeRegistration: scopeRegistration,
  response_type: responseType,
  redirect_uri_userprofile: redirect_uri_userprofile,
  redirect_uri_registration: redirect_uri_registration,
  display: display,
  prompt: prompt,
  acr_values: acr_values,
  claims_locales: claimsLocales,
  max_age: maxAge,
  grant_type: grantType,
  uibaseUrl: uibaseUrl,
  authorizeEndpoint: authorizeEndpoint,
  userProfileClaims: userProfileClaims ?? encodeURI(JSON.stringify(claims)),
  registrationClaims: registrationClaims ?? encodeURI(JSON.stringify(claims)),
};

export default clientDetails;
