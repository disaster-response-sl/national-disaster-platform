import clientDetails from "../constants/clientDetails";

/**
 * creates redirect URI for sign in/sign up form
 * @returns redirect URI for sign in/sign up form
 */
const getURIforSignIn = () => {
  return getURI(
    clientDetails.redirect_uri_userprofile,
    clientDetails.scopeUserProfile,
    clientDetails.userProfileClaims
  );
};

/**
 * creates redirect URI for registration form
 * @returns redirect URI for registration form
 */
const getURIforRegistration = () => {
  return getURI(
    clientDetails.redirect_uri_registration,
    clientDetails.scopeRegistration,
    clientDetails.registrationClaims
  );
};

const getURI = (redirect_uri, scope, encodedClaims) => {
  let nonce = clientDetails.nonce;
  let state = clientDetails.state;
  let clientId = clientDetails.clientId;
  let response_type = clientDetails.response_type;
  let acr_values = clientDetails.acr_values;
  let display = clientDetails.display;
  let prompt = clientDetails.prompt;
  let maxAge = clientDetails.max_age;
  let claimsLocales = clientDetails.claims_locales;
  let uibaseUrl = clientDetails.uibaseUrl;
  let authorizeEndpoint = clientDetails.authorizeEndpoint;

  let uri_UI =
    uibaseUrl +
    authorizeEndpoint +
    "?nonce=" +
    nonce +
    "&state=" +
    state +
    "&client_id=" +
    clientId +
    "&redirect_uri=" +
    redirect_uri +
    "&response_type=" +
    response_type +
    "&scope=" +
    scope +
    "&acr_values=" +
    acr_values +
    "&claims=" +
    encodedClaims +
    "&display=" +
    display +
    "&prompt=" +
    prompt +
    "&max_age=" +
    maxAge +
    "&claims_locales=" +
    claimsLocales;

  return uri_UI;
};

const clientService = {
  getURIforSignIn,
  getURIforRegistration,
};

export default clientService;
