# How the eSignet Sign-In Button Links to eSignet

## Overview

The eSignet sign-in button in your React application is not a simple HTML link but an interactive component powered by an external JavaScript plugin. This guide explains how the button is loaded, configured, and how it generates the link to redirect users to the eSignet authentication portal.

## Step-by-Step Process

### 1. Loading the Plugin Script

- The button functionality is provided by an external script hosted at `SIGN_IN_BUTTON_PLUGIN_URL` (e.g., `https://sludiauth.icta.gov.lk/plugins/sign-in-button-plugin.js`).
- In `Login.js`, the `useExternalScript` hook dynamically loads this script into the DOM:
  ```javascript
  const signInButtonScript = window._env_.SIGN_IN_BUTTON_PLUGIN_URL;
  const state = useExternalScript(signInButtonScript);
  ```
- The hook creates a `<script>` tag, appends it to `<head>`, and listens for load/error events.
- Once loaded (`state === "ready"`), the button container is rendered: `<div id="sign-in-with-esignet"></div>`.

### 2. Initializing the Button

- After the script loads, `renderSignInButton()` is called.
- This function constructs an `oidcConfig` object with OIDC parameters from `clientDetails.js`:
  ```javascript
  const oidcConfig = {
    authorizeUri: clientDetails.uibaseUrl + clientDetails.authorizeEndpoint,  // e.g., https://sludiauth.icta.gov.lk/authorize
    redirect_uri: clientDetails.redirect_uri_userprofile,  // e.g., http://localhost:5000/userprofile
    client_id: clientDetails.clientId,
    scope: clientDetails.scopeUserProfile,  // e.g., openid profile resident-service
    nonce: clientDetails.nonce,  // Random string for security
    state: clientDetails.state,  // Random string for CSRF protection
    acr_values: clientDetails.acr_values,  // Authentication context
    claims_locales: clientDetails.claims_locales,
    display: clientDetails.display,
    prompt: clientDetails.prompt,
    max_age: clientDetails.max_age,
    ui_locales: i18n.language,
    claims: JSON.parse(decodeURIComponent(clientDetails.userProfileClaims)),
  };
  ```
- The plugin's `window.SignInWithEsignetButton.init()` method is called with this config and button styling:
  ```javascript
  window.SignInWithEsignetButton?.init({
    oidcConfig: oidcConfig,
    buttonConfig: {
      shape: "soft_edges",
      labelText: t("sign_in_with"),  // Localized text, e.g., "Sign in with MOSIP"
      width: "100%"
    },
    signInElement: document.getElementById("sign-in-with-esignet"),
  });
  ```

### 3. How the Link is Made

- The plugin internally constructs the full authorization URL using the `authorizeUri` and appends the OIDC parameters as query strings.
- Example constructed URL:
  ```
  https://sludiauth.icta.gov.lk/authorize?
  response_type=code&
  client_id=your-client-id&
  redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fuserprofile&
  scope=openid%20profile%20resident-service&
  nonce=abc123...&
  state=eree2311&
  acr_values=mosip%3Aidp%3Aacr%3Agenerated-code%20...&
  claims_locales=en&
  display=page&
  prompt=consent&
  max_age=21&
  ui_locales=en&
  claims=%7B%22userinfo%22%3A%7B...%7D%7D
  ```
- When the user clicks the button, the browser redirects to this URL, initiating the OIDC Authorization Code Flow.

### 4. OIDC Flow Summary

1. **User Clicks Button**: Redirects to eSignet with the constructed URL.
2. **eSignet Authentication**: User logs in and consents to share data.
3. **Redirect Back**: eSignet redirects to `redirect_uri` with an authorization code (e.g., `http://localhost:5000/userprofile?code=abc123&state=eree2311`).
4. **Code Exchange**: Your app sends the code to the backend (`/fetchUserInfo`), which exchanges it for an access token and fetches user info.
5. **User Profile**: User data is displayed, completing the sign-in.

## Key Components Involved

- **`useExternalScript` Hook**: Handles dynamic script loading.
- **`clientDetails.js`**: Centralizes OIDC configuration from `window._env_`.
- **`Login.js`**: Renders the button and handles initialization.
- **Plugin Script**: Provided by eSignet; handles URL construction and redirection.

## Customization

- **Button Styling**: Modify `buttonConfig` in `renderSignInButton()`.
- **OIDC Params**: Update values in `env-config.js` or `clientDetails.js`.
- **Localization**: The button text uses `react-i18next` for multi-language support.

## Troubleshooting

- **Button Not Loading**: Check browser console for script errors. Ensure `SIGN_IN_BUTTON_PLUGIN_URL` is accessible.
- **Invalid Redirect**: Verify `redirect_uri` matches eSignet registration and includes a frontend route.
- **OIDC Errors**: Review the constructed URL in browser dev tools (Network tab) for missing/invalid params.

This process ensures secure, standards-compliant authentication via eSignet.</content>
<parameter name="filePath">c:\Users\gaind\OneDrive\Desktop\sludi\sliit_hackathon_sludi\eSignet_Button_Link_Guide.md
