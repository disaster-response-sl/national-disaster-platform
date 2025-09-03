# Mock Relying Party Server

This is a simple NodeJS application that will act as a backend for the Mock Relying Party portal.

## Overview

Mock Relying Party Server has 1 endpoint.

- Post /fetchUserInfo:
  Request Body (application/json) = {
  "code": "{{code}}",
  "client_id": "{{clientId}}",
  "redirect_uri": "{{redirectionUrl}}",
  "grant_type": "authorization_code",
  "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  "client_assertion": "{{client_assertion}}"
  }

  Response (application/json) = The response is signed and then encrypted, with the result being a Nested JWT.

## Build & run (for developers)

The application runs on PORT=8888.

- Env variables

  - ESIGNET_SERVICE_URL: MOSIP ESIGNET API URL (Example:http://esignet.esignet/v1/esignet)
  - ESIGNET_AUD_URL: Value to be used as `aud` claim in client_assertion. With eSignet, it is https://esignet.domain.com/v1/esignet/oauth/v2/token
  - JWE_USERINFO_PRIVATE_KEY: Used for encrypting user information.
  - CLIENT_PRIVATE_KEY: Holds private key for authentication and security.
  - USERINFO_RESPONSE_TYPE: Response type for user information retrieval.

- Build and run Docker for a service:

  ```
  $ docker build <dockerImageName>:<tag> .
  $ docker run -it -d -p 8888:8888 --env ESIGNET_SERVICE_URL='<MOSIP ESIGNET API URL>' <dockerImageName>:<tag>
  ```

- Build and run on local system:
  Update "devstart" script in package.json file : "SET PORT=8888 && SET ESIGNET_SERVICE_URL='<MOSIP ESIGNET API URL>' && node app.js && nodemon ."
  ```
  $ npm run devstart
  ```

## License
This project is licensed under the terms of [Mozilla Public License 2.0](../LICENSE).