# eSignet Integration Guide

## Overview

This guide provides a comprehensive step-by-step process to integrate eSignet (MOSIP's Identity Provider) into your React frontend and Node.js backend application. eSignet enables secure user authentication using OpenID Connect (OIDC) and OAuth 2.0 standards.

The integration includes:
- A sign-in button that redirects users to the eSignet portal for authentication.
- Handling the authorization code callback to fetch user information.
- Displaying user profile data after successful authentication.

**Warning:** Ensure your redirect URI includes a frontend route (e.g., `http://localhost:5000/userprofile`) where users are redirected after authentication. This URI must be registered with eSignet and match exactly to avoid authentication failures.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A registered client with eSignet (obtain client ID, private keys, etc.)
- Access to eSignet services (e.g., `https://sludiauth.icta.gov.lk`)
- Basic knowledge of React and Express.js

## Project Structure

Your project should have the following structure:

```
project/
├── backend/
│   ├── app.js
│   ├── config.js
│   ├── esignetService.js
│   ├── package.json
│   └── ...
├── frontend/
│   ├── public/
│   │   └── env-config.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useExternalScript.js
│   │   ├── constants/
│   │   │   └── clientDetails.js
│   │   └── ...
│   └── package.json
└── README.md
```

## Backend Setup

### 1. Install Dependencies

Navigate to the `backend` directory and install required packages:

```bash
cd backend
npm install express axios jose dotenv
```

### 2. Environment Variables (.env file)

Create a `.env` file in the `backend` directory with the following variables:

```env
ESIGNET_SERVICE_URL=https://sludiauth.icta.gov.lk/service
PORT=8888
ESIGNET_AUD_URL=https://sludiauth.icta.gov.lk/service/oauth/v2/token
CLIENT_ASSERTION_TYPE=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
USERINFO_RESPONSE_TYPE=jwk
CLIENT_PRIVATE_KEY={"p":"8tNbUdXZbFUO6mdqKDx8vbZMV_JLVGTX2TojWXF5c7O07yyndMZe80uY9gxbganWd_q199TIF5s-nNjUH2bsXflA08JxQyUbiqB2JuhIoMuPkuG2uc6kwOXyWrW8w8M3udyeKVy5DD7Yj8tHUggxEm03eD9YKjTX3utgB-76a2M","kty":"RSA","q":"4esQ_JOTjcT0Vt3yfPT7sRo9NW3rJWZNyEugYFHJl6IQ1nLH8VSHWSwuXIcsnCHmdgR93mc02hZIKxjskRIrrHfyTxAJbjPBLEtlZbW2en43S4LvkIITnhfyOeiJzY7iMjWSEs4R0xYBIxo_MZb7cp7tI189rNF8hAW01WjLhnM","d":"SIsgCRddjRFHblbssjdHiFiwYhd3cQ0NFpDP6rybFgVUtZtCGmsQ36ZZ8by8giyXTeYXQ8x6GsXr8PFiIG5yp_ROHDb-eeUkQADdTr95gtwJk0_p6F9rRWB-UZHDGjgOf_aqJdM_7TvfZwBnvjh_BTQMpjupE5svt8HG56tSnWc8MPr5qo8mAprtD8zGvsjefPjGDhSFnJmi116ZtrEz6gOVI_pZa77ZUJI3NPEcSFf-0G87XPu3RQmDZE8VsoCecJ0KCOpl_gEzBhsQuoUTw93pA_Vc0ix4Xxm27VPeLW9n-Sgq83Xee5JON9zMi3E0vI4GmD7WazhZ0YBaMtXG6Q","e":"AQAB","use":"sig","qi":"FZJsX6j5BcdJa3VtzOAyKXXecmorBWesm1GMCQEDQsP379QMInIV90Ah0oneSjCGPbFsPnRdPsJzSKp0A1z3uoFpEihDr5LNwPT-LnAj3RVed4KgRyb6iF8rQ2P4qjy7putRFSufGkWLL7Xl-UEMdCmv55tMUcnYmV7UznSJ6Uo","dp":"ZBSOh70O3qJ0AlJbI3hCpWI0Nu8q8v6ZI_PdS-kD-JbxlL4fynZT_gyDX62aLWfVeB_BzgJJ8cjPVo_bZZHjC5xGhsCWM-lgX5Ng_wovnO4pH42d5RjxOHvNlmtfAIQ-PIFcQonvzsc8NI_AtmOf7gtLmGjrKoIbEsqKCtsJJSc","alg":"RS256","dq":"Cq-v0gK5DA-w7xr4iWidLzdqhch5Qv-f1kWdhHDZ9E46NaqgQo4ZCOLKHp5WQdxoplR4D7kaCuba6w72wbX2UuYplAvSJmBUVuAKH9GEnC60NuIuqss8WlIPpyWUvyBvGqjmC_Wraiy0SRDIxHO72SQjW3T52d7e4O_UKfQXDHk","n":"1kq7ZIrRu__1qCXKPghILrYu4TCMx4jl5RE4sk2_FwNgtL5XQLM2bN8KXOUvx_rwos48KX2WV46JHTVeJ4_JPdAdXFimK0oI4AETonPOdMplTaCQp1_Kg-iwJvS5CT6SW8UhWlGfZxXcodFqNd2swW0EV4OOugI1KJxbxfZhQepDnHdeMQiMu-PRxK3igWI_NCG85wn0mjyiBMzmYv4eUaLGy3AzGsmOZNl7afj65W01uiG39X-W5Eh_3vMu6Rfd9neLqcxl41GLmLuqZ9TDMFGHezlNv59_6yek-CBAy3wWZuKIsDDIUQ06jHsMnQBxi0lQhy2VOynGLHw5zjUPeQ"}
JWE_USERINFO_PRIVATE_KEY=ewogICJwIjogIjJlWDNaVmxMejR1UFJBTE5uQVI3dl91aGJsOWI3OXNfLWpteFcxaTdiMGZaTV9SZHNWT09yWW9uZ05WQWpuVHFSQm1SRXRndXVHM21LMjZnTDdZMVNpb1hXMF8teWxKRDk2QnlUdDRlTlJoY1pZTXFHZnZkaUEyYTlOQnZqZ1phVkNfWWxFYXFSaVNYaFI1SlJ1emgzX1ViUDFKX3BXaHl4R29fX0txWS1XOCIsCiAgImt0eSI6ICJSU0EiLAogICJxIjogInJwM19GS09rbDdfRzNPeUM1MVBNV2w2eG80SEVwaVdfWDN2X3ZoRWc4X2k4ZFpMMlhlVGdHc1BwZGxNUGJKRU5pN0NyUkFpTnlYV0RHMXlnRklvcFU1M1pfdmEyQUlsV1BacW5rcDA3WG9oTTVQc29HQUVDUXVsMWRHOXFYc0ZkNkgwczZVZGYweVlHa05xZzBwVjVJNk5hNzBIazRkandtMlNDUE90Q2pPYyIsCiAgImQiOiAiUWhuY1RYRmhIMksxMVYtMFJDMEJKTUFNYWc4TS1IQWhHdlg0bU5RWWlWQ3RFbkZXOUdNZ1huQlF1bzlfM0pCQ1huT01McFNScTRHeVV1Rmd5SEtnRS1JZHBrM0ZXMnFjY2syVFJHdHBUdXZ0OEwzVG9nSElCNDM5cTJjXzd6UzZSSVltaV9LUUYtcWw1OXRhVHl5UV83Nk9Hb2h2ZkZsZHVFVm5Zc0tBNnVJLUpHVG92VENybDEwY3p3YVBtdGdEOTFoWnV0emRVeUhJZktKb1VCcDNlUzk0U3VEaThDSklOeXpkb2NJYVFjaDVKd3Nidm5RZHJNTV85ZUZXeXVWVk9tc2JiNGQ4WVhmaS01NVhWbndiM3lCSGJNbU5Nd25IRTNlVm56bjkzOFpjeFBleEpld0NHQjVfRm8xYW5PTUlwTm8wV3kxMFMxQ1FkTllXWmZRSlhRIiwKICAiZSI6ICJBUUFCIiwKICAidXNlIjogImVuYyIsCiAgImtpZCI6ICJtajZ0YUhXY1hOOERqSmNoSl8wNk9hNDZERnd5UGpxZGNiSFIzWEdNRmxZIiwKICAicWkiOiAiR01PMWliUlh3ZVVHaEhJRUtXNlFId3pZMEpuaG5ZOURtRS02ekhNbTd4X241cElzSGdYaVVkQ0hCd3RSOU1IM2g5Q29aRlg3b0RfR1pRWXF6MmtvXzhNa0JHQmJ4cFZtcVZlVndLVGN4NG1UNE85MjRTcTlsUTM3WkdZT2dQVmZmbXhOQ1hyZmIydDBxZ1F3TEZPQzRhSjVoRm9EVzlzOHNUTkZpZ19Jei1BIiwKICAiZHAiOiAiWTZYaWZNdlllcUsxTXdJaEsyOTFkSGZMX0tESmQ2aUoycElWeE5PUWJEU3NaVEVrdzlxVmpsRjJfVmtJLTkwRjRYemJ0b1Y4NEVVS0ZPU3podjVKNG9fYlBKd1p4a2JXNUdEUXhiYVlrLWxfSDhGYk9LVFJTODRGQmw1b0ZjaGItTklrdHJLV1hodVAyNFhkTnYxUDBzN1IxaVNSVVlDeHM1ZHZpY291eVNzIiwKICAiYWxnIjogIlJTQS1PQUVQLTI1NiIsCiAgImRxIjogImRlX3dvUmdGeXhpVVVCTE9Oei01X2ktRy0xQmlhWFdGVkJDRUl2T2V0aW1CNEVkcWJ2QnZES1RWd2oxSFphUnk2YTVoZm9ub2VmRU1wQ1pqV0h3WWZZbFgtNFRXV0hacDhTSExuSkxsem10d3hCZC1kUGY1ZHdnSGRLVHJ5eVBfTVUtYVRkVVBPNldyT1pyd2xFcXdqd2wtR2FyXzFDcWFGOXBDdkxLSk9IRSIsCiAgIm4iOiAibEtESlRUNklGMjZITEEtQi1zSkdnaDl2bl9xVXcxaFR5RTZvUVdNZ19paE0wNVp3bUxQOVBRRWdMaGgwckw4VE1uNDhXN3luVmV0T1BGOUdsb1RiZFVndkZMYlRSejA1dlRhNU41eU9SV0VvTkx0Q0c5SFJwNXRfVXFGZnpRZG1SYkJDV1I5cTJhYWZPVTJRa0tvdXBBdlNGM2tjSHhsNjgzRDVPczA0NW01ZFRMTkFpZlJzbVh4TkptVjNXY244T0tjckdQTHFhTHcxbHJJSG9kNVo5TzFDaXAxalBVcXRwd0VaX3lCVkl2VmpFYWN4T0pWV0JrNUI1T1owOXVILW1EV3pnQXFYNkNmZGU5T0xyYlVIY1hIaUt6VHIwemRGN2g2MTgwU3hWOVdUeFluLUp6RHR5a0lhUklYZ3BsWXQ0cEFqUXZzVlA4d1ZmU2EyekFfSEtRIgp9
```

**Note:** Replace the private keys with your actual keys from eSignet. Never commit real keys to version control.

### 3. Backend Code

#### config.js

```javascript
module.exports = {
  ESIGNET_SERVICE_URL: process.env.ESIGNET_SERVICE_URL ?? "https://sludiauth.icta.gov.lk/service",
  PORT: process.env.PORT ?? 8888,
  CLIENT_PRIVATE_KEY: JSON.parse(process.env.CLIENT_PRIVATE_KEY ?? '{}'),
  ESIGNET_AUD_URL: process.env.ESIGNET_AUD_URL ?? "https://sludiauth.icta.gov.lk/service/oauth/v2/token",
  CLIENT_ASSERTION_TYPE: process.env.CLIENT_ASSERTION_TYPE ?? "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  USERINFO_RESPONSE_TYPE: process.env.USERINFO_RESPONSE_TYPE ?? "jwk",
  JWE_USERINFO_PRIVATE_KEY: process.env.JWE_USERINFO_PRIVATE_KEY ?? '',
};
```

#### esignetService.js

```javascript
const axios = require("axios");
const jose = require("jose");
const { importJWK, SignJWT, decodeJwt } = require("jose");

const { ESIGNET_SERVICE_URL, ESIGNET_AUD_URL, CLIENT_ASSERTION_TYPE, CLIENT_PRIVATE_KEY, USERINFO_RESPONSE_TYPE, JWE_USERINFO_PRIVATE_KEY } = require("./config");

const baseUrl = ESIGNET_SERVICE_URL.trim();
const getTokenEndPoint = "/oauth/v2/token";
const getUserInfoEndPoint = "/oidc/userinfo";

const alg = "RS256";
const jweEncryAlgo = "RSA-OAEP-256";

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
  const response = await axios.post(endpoint, request, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data;
};

const get_GetUserInfo = async (access_token) => {
  const endpoint = baseUrl + getUserInfoEndPoint;
  const response = await axios.get(endpoint, {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });
  return decodeUserInfoResponse(response.data);
};

async function generateSignedJwt(clientId) {
  const privateKey = await importJWK(CLIENT_PRIVATE_KEY, alg);
  const jwt = await new SignJWT({ iss: clientId, sub: clientId, aud: ESIGNET_AUD_URL })
    .setProtectedHeader({ alg, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
  return jwt;
}

const decodeUserInfoResponse = async (userInfoResponse) => {
  let response = userInfoResponse;
  if (USERINFO_RESPONSE_TYPE.toLowerCase() === "jwe") {
    const privateKeyObj = await jose.importJWK(JSON.parse(JWE_USERINFO_PRIVATE_KEY), jweEncryAlgo);
    const { plaintext } = await jose.compactDecrypt(response, privateKeyObj);
    response = new TextDecoder().decode(plaintext);
  }
  return await jose.decodeJwt(response);
};

module.exports = {
  post_GetToken: post_GetToken,
  get_GetUserInfo: get_GetUserInfo,
};
```

#### app.js

```javascript
const express = require("express");
const { PORT } = require("./config");
const { post_GetToken, get_GetUserInfo } = require("./esignetService");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Mock Relying Party REST APIs!!");
});

app.post("/fetchUserInfo", async (req, res) => {
  try {
    const tokenResponse = await post_GetToken(req.body);
    res.send(await get_GetUserInfo(tokenResponse.access_token));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

const port = PORT;
app.listen(port, () => console.log(`Listening on port ${port}..`));
```

## Frontend Setup

### 1. Install Dependencies

Navigate to the `frontend` directory and install required packages:

```bash
cd frontend
npm install react react-router-dom axios react-toastify react-i18next i18next react-select
```

### 2. Environment Configuration (env-config.js)

Create `public/env-config.js` with the following content:

```javascript
window._env_ = {
  ESIGNET_UI_BASE_URL: "https://sludiauth.icta.gov.lk",
  MOCK_RELYING_PARTY_SERVER_URL: "http://localhost:8888",
  REDIRECT_URI_USER_PROFILE: "http://localhost:5000/userprofile",
  REDIRECT_URI_REGISTRATION: "http://localhost:5000/registration",
  REDIRECT_URI: "http://localhost:5000/userprofile",
  CLIENT_ID: "your-client-id",
  ACRS: "mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code",
  SCOPE_USER_PROFILE: "openid profile resident-service",
  SCOPE_REGISTRATION: "openid profile",
  CLAIMS_USER_PROFILE: "%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D",
  CLAIMS_REGISTRATION: "%7B%22userinfo%22:%7B%22given_name%22:%7B%22essential%22:true%7D,%22phone_number%22:%7B%22essential%22:false%7D,%22email%22:%7B%22essential%22:true%7D,%22picture%22:%7B%22essential%22:false%7D,%22gender%22:%7B%22essential%22:false%7D,%22birthdate%22:%7B%22essential%22:false%7D,%22address%22:%7B%22essential%22:false%7D%7D,%22id_token%22:%7B%7D%7D",
  SIGN_IN_BUTTON_PLUGIN_URL: "https://sludiauth.icta.gov.lk/plugins/sign-in-button-plugin.js",
  DISPLAY: "page",
  PROMPT: "consent",
  GRANT_TYPE: "authorization_code",
  MAX_AGE: 21,
  CLAIMS_LOCALES: "en",
  DEFAULT_LANG: "en",
  FALLBACK_LANG: "%7B%22label%22%3A%22English%22%2C%22value%22%3A%22en%22%7D"
};
```

**Warning:** Replace `your-client-id` with your actual client ID from eSignet. Ensure the redirect URIs match your frontend routes and are registered with eSignet.

### 3. React Components

#### useExternalScript.js (Hook)

```javascript
import { useEffect, useState } from "react";

export const useExternalScript = (url) => {
  let [state, setState] = useState(url ? "loading" : "idle");

  useEffect(() => {
    if (!url) {
      setState("idle");
      return;
    }

    let script = document.querySelector(`script[src="${url}"]`);

    const handleScript = (e) => {
      setState(e.type === "load" ? "ready" : "error");
    };

    if (!script) {
      script = document.createElement("script");
      script.type = "application/javascript";
      script.src = url;
      script.async = true;
      document.head.appendChild(script);
      script.addEventListener("load", handleScript);
      script.addEventListener("error", handleScript);
    }

    script.addEventListener("load", handleScript);
    script.addEventListener("error", handleScript);

    return () => {
      script.removeEventListener("load", handleScript);
      script.removeEventListener("error", handleScript);
    };
  }, [url]);

  return state;
};
```

#### clientDetails.js

```javascript
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
```

#### Login.js (Sign-In Button Component)

```javascript
import { useEffect, useState } from "react";
import { Error } from "../common/Errors";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import clientDetails from "../constants/clientDetails";
import { useExternalScript } from "../hooks/useExternalScript";

export default function Login({ i18nKeyPrefix = "login" }) {
  const { i18n, t } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const signInButtonScript = window._env_.SIGN_IN_BUTTON_PLUGIN_URL;
  const state = useExternalScript(signInButtonScript);
  
  useEffect(() => {
    const getSearchParams = async () => {
      let errorCode = searchParams.get("error");
      let error_desc = searchParams.get("error_description");

      if (errorCode) {
        setError({ errorCode: errorCode, errorMsg: error_desc, showToast: true });
      }
    };
    getSearchParams();

    renderSignInButton();

    i18n.on("languageChanged", function (lng) {
      renderSignInButton();
    });
  }, [state]);

  const renderSignInButton = () => {
    const oidcConfig = {
      authorizeUri: clientDetails.uibaseUrl + clientDetails.authorizeEndpoint,
      redirect_uri: clientDetails.redirect_uri_userprofile,
      client_id: clientDetails.clientId,
      scope: clientDetails.scopeUserProfile,
      nonce: clientDetails.nonce,
      state: clientDetails.state,
      acr_values: clientDetails.acr_values,
      claims_locales: clientDetails.claims_locales,
      display: clientDetails.display,
      prompt: clientDetails.prompt,
      max_age: clientDetails.max_age,
      ui_locales: i18n.language,
      claims: JSON.parse(decodeURIComponent(clientDetails.userProfileClaims)),
    };

    window.SignInWithEsignetButton?.init({
      oidcConfig: oidcConfig,
      buttonConfig: {
        shape: "soft_edges",
        labelText: t("sign_in_with"),
        width: "100%"
      },
      signInElement: document.getElementById("sign-in-with-esignet"),
    });
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError({
      errorCode: "sign_in_failed",
    });
  };

  return (
    <>
      <div className="w-full px-20">
        <h1 className="w-full text-center title-font sm:text-3xl text-3xl mt-8 mb-8 font-medium text-gray-900">
          {t("sign_in_with_health_portal")}
        </h1>

        <div className="w-full flex mb-6 text-slate-500">
          <span className="w-11 inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-gray-300 
          ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0">
            <img src="images/username_icon.png" />
          </span>
          <input
            type="text"
            id="user"
            className="rounded-none bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2.5
            ltr:rounded-r-lg rtl:rounded-l-lg"
            placeholder={t("username")}
          />
        </div>

        <div className="w-full flex mb-6 text-slate-500">
          <span className="w-11 inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 
          ltr:rounded-l-md ltr:border-r-0 rtl:rounded-r-md rtl:border-l-0">
            <img src="images/password_icon.png" />
          </span>
          <input
            type="password"
            id="password"
            className="rounded-none bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 text-sm border-gray-300 p-2.5
            ltr:rounded-r-lg rtl:rounded-l-lg"
            placeholder={t("password")}
          />
        </div>
        <button
          type="button"
          className="w-full justify-center text-white bg-[#2F8EA3] hover:bg-[#2F8EA3]/90 font-medium rounded-md text-sm px-5 py-2.5 flex items-center mr-2 mb-2 h-11"
          onClick={handleLogin}
        >
          {t("submit")}
        </button>

        {error && (
          <Error errorCode={error.errorCode} errorMsg={error.errorMsg} showToast={error.showToast} />
        )}

        <div className="flex w-full mb-6 mt-6 items-center px-10">
          <div className="flex-1 h-px bg-black" />
          <div>
            <p className="w-16 text-center">{t("or")}</p>
          </div>
          <div className="flex-1 h-px bg-black" />
        </div>

        {state === "ready" && <div id="sign-in-with-esignet" className="w-full"></div>}

        <div className="flex flex-justify mt-5 w-full items-center text-center">
          <p className="w-full text-center">
            {t("dont_have_existing_account")}&nbsp;
            <a
              href={process.env.PUBLIC_URL + "/signup"}
              className="text-[#2F8EA3]"
            >
              {t("sign_up_here")}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
```

## Integration Steps

1. **Register Your Application with eSignet:**
   - Obtain client ID, private keys, and configure redirect URIs.

2. **Configure Environment Variables:**
   - Update `.env` in backend and `env-config.js` in frontend with your values.

3. **Start Backend:**
   ```bash
   cd backend
   npm run devstart
   ```

4. **Start Frontend:**
   ```bash
   cd frontend
   npm start
   ```

5. **Test Integration:**
   - Visit `http://localhost:5000`.
   - Click the eSignet sign-in button.
   - Authenticate on eSignet.
   - Redirect to `/userprofile` with user data.

## Troubleshooting

- **Button Not Appearing:** Check console for script loading errors. Ensure `SIGN_IN_BUTTON_PLUGIN_URL` is correct.
- **Authentication Fails:** Verify redirect URI matches eSignet registration.
- **Backend Errors:** Check logs for JWT/key issues.

## Security Notes

- Store private keys securely (e.g., environment variables, not in code).
- Use HTTPS in production.
- Validate all inputs and handle errors gracefully.

This guide provides a complete setup for eSignet integration. Customize as needed for your application.</content>
<parameter name="filePath">c:\Users\gaind\OneDrive\Desktop\sludi\sliit_hackathon_sludi\eSignet_Integration_Guide.md
