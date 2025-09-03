# Mock Relying Party UI

This react application is the UI for the mock relying party portal

## Overview

This repository contains the reference implementation of a relying party's portal demonstrating use of [MOSIP's Esignet (Identity Provider) services](https://github.com/mosip/esignet) to log in users into its portal.

This portal uses [OpenID specs](https://openid.net/specs/openid-connect-core-1_0.html) to communicate with [MOSIP Esignet Services](https://github.com/mosip/esignet).

This portal contains 2 pages.

1. **Home Page**: This page represents the login screen for the relying party's website. This page includes a button with the text, "Sign in with MOSIP". On the click this button, the user gets redirected to the MOSIP's Esignet Portal. The user now has to authenticate and provide consent to share information from MOSIP to relying party, on the Esignet portal.

2. **User Profile Page**: This page shows the user profile on the relying party's website. On successful authentication and consent approval, the user gets navigated to this page with an Auth Code. This Auth Code would be shared with the relying party's backend service via the `/fetchUserInfo` endpoint. The backend then uses the Auth Code to fetch the access token and user details from MOSIP Esignet services.

## Build & run (for developers)

The application runs on PORT=5000 by default.

- Env variables

  - ESIGNET_UI_BASE_URL: MOSIP ESIGNET UI URL (Example:https://esignet.dev.mosip.net/)
  - MOCK_RELYING_PARTY_SERVER_URL: This will be internally resolved to Mock relying party server by internal nginx (Example:http://esignet.dev.mosip.net/mock-relying-party-server)
  - REDIRECT_URI: Value that needs to be passed into authorize redirect_uri parameter (Example:https://health-services.com/userprofile)
  - CLIENT_ID: Relying Party client Id, that is registered with MOSIP (Example:health-services)
  - ACRS: Value that needs to be passed into authorize acr_values parameter (Example:mosip:esignet:acr:generated-code)
  - PRIVATE_KEY: Private key corresponding to the public key of registered Relying Party Client
  - MAX_AGE: Represents the maximum amount of time, in seconds, that a cached resource should be considered fresh or valid before it needs to be revalidated with the origin server.
  (Example:max_age:21)
  - DISPLAY: This property specifies how the authorization server should display the authentication and consent page to the end-user.
  Possible values are page, popup, wap, touch 
  (Exapmle: display:page)
  - PROMPT: This property specifies the type of prompt to be used during the authentication flow.
  (Exapmle: prompt:consent)
  - GRANT_TYPE: This property specifies the OAuth 2.0 grant type that the client will use to request access tokens. (Example: grant_type: authorization_code)
  - SIGN_IN_BUTTON_PLUGIN_URL: Sign in button url.
  - SCOPE_USER_PROFILE: List of scopes that are requested when initiating an authentication request.
  (Example: scope_user_profile: openid%20profile%20resident-service)

- Build and run Docker for a service:

  ```
  $ docker build -t <dockerImageName>:<tag> .
  $ docker run -it -d -p 5000:5000 -e ESIGNET_UI_BASE_URL='http://localhost:3000' -e MOCK_RELYING_PARTY_BASE_URL=http://localhost:8888 -e REDIRECT_URI=http://localhost:5000/userprofile -e CLIENT_ID=healthservices -e ACRS="mosip:esignet:acr:static-code" -e MAX_AGE=21 -e DISPLAY=page -e PROMPT=consent -e GRANT_TYPE=authorization_code -e SIGN_IN_BUTTON_PLUGIN_URL='http://127.0.0.1:5500/dist/iife/index.js' -e SCOPE_USER_PROFILE='openid%20profile%20resident-service' -e PRIVATE_KEY='-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCoUPbvrrOxtxAt\nR2rCmSrSjZjyvpLklB8wxCqWQJ5wuvw1j7SEvMFds9QeYpomO/GVZNYGbWuBwQEG\nWdBll9ZdI02H5hjNzZi3SFcv+N+OHFh5RHNnkeLtIuA684BJHkJNL19LcQlb+u1G\nWeqyPCk3rdDNPZYBJBcS4i1BF3SF2gW9nsvxS+xOB12l1Dubntfs1AXhSgZvy5oe\nhgJIDhy7BbqJEJPfbcOAQE8GlnjxjSY3Ja0m9YD2MT3V93DSz0OLyLQjnMs+FJQc\nRpFDupHSSa3QerEXwxqHmXyH0RZJmH1oZizdEImdgXRjgfy98a6ZwU2p43WSg1LR\nrIZU+HC7AgMBAAECggEAAnaE1ocI7B3Qp8j2v/g7zy7xQQQW5C9isXT9Zot1hhLG\nZAZBTvvwHG3oObWZqduQsm3yT8/EFfb8C9q+mO363gwJM2bjkAdlJ7FwTSxoIQ07\nIjMlOSvCVVQAUfyEMQ23TKfXziPOTkFCvZfNPmRw+faaKpavHj8n80fJ/7zXIKpE\n/Z7+izLhGmos7LgofZRqxYMcq6RznR7w9FQPsdnspC3EPudrwV+HBAEuqOMfN+Zs\n2bVqKbOz0z8WzQ7K1+bhX93flBqlO3lVNXHK+Oov3DmTG4SIxaim30vM5oijaD+q\nsXYq1r34GRtcEZ26qx3iCdFd5o9sBgA6EMQ8iOWfMQKBgQDUT87IQWNPBBzWoANf\nKR4iR4wc9f4O1uZFnJ5Ec8EBscUvccYErQ3YHxcmycpbLWRijgNnCYsDXVU7uFsm\no7pV1Qn95o8TDHbr+F/mmKq/UMuMjvUmZc93pKMADlsw7aXRHlzuggIH2nAkRUi3\nrCYdmrXWwTyJ8f0cFIlS/EQAaQKBgQDK845NT/ZqOUqJdAq7aoTjC41ER6CFMSxR\nO215g8kaeYbnRlzNcyqxk9PTEEadoHvZyAdYxRfdLU22zE0ImN2Y5Jfi0wRJYT+C\nj3q1sORezw65qB/CKwgMnE9Tiu9fHbrlpeb+lIBEnIFiAoPwOOOMzhXzUxOtlT7r\n/v4Dy3MDgwKBgQCtat7Rba+LTCWuHZeDdBd8Eorc4QV644fFlm8kJJSjKKyS21DO\nYvgq7wI/GZZjMUmMwsj+sanNvr+u/x/dCOFb2J7HuDpnacf9aKwUs+DMUldg4ShX\nC9QRuvW1RwSvi33kuPNZkfHMrlzpE3qZJFEh30vmNYKYfoOrGw8sLIfy+QKBgHGU\nTo478vbNq0YzmBH88fOyslOFFnOT6m5nqMO5miFj47io6yTbkAgjaAeV8z8h4k4m\nIN5wJwPT58smmPH3wwRe4hXB7IM4lnd13sGyBox8qowCaAudU3rjO43QklgT5lXB\nO/47k3FSeSIlsDsPS2GwsB4l3zxk6vreEMCE6pALAoGAZ6vITL4uljwBE3Wv+czJ\nEYiOzmnRLK3TwcNx2E1i4gLi8Fj2NUtXAU2BXEa9oW8Zh+b95X0GjgLJamjZi1cH\nU9ByKn/LBzASbvK5q2fLEsOWWigAUKfO6ecmc8MVniS4GJ+WGsUHcsC3usO4clm0\nWxOiTQVUZ7xZxXwy6DOFLFg=\n-----END PRIVATE KEY-----' <dockerImageName>:<tag>
  ```

  To host mock relying party ui on a context path:
  1. Remove the location path with `/` in the nignx file and add the location with context path as below.
    ```
    location /healthservices {
       alias /usr/share/nginx/healthservices;
       try_files $uri $uri/ /healthservices/index.html;
    }
    ```
  2. Provide the context path in the env variable `MOCK_RP_UI_PUBLIC_URL` during docker run.
  ```
  $ docker build -t <dockerImageName>:<tag> .
  $ docker run -it -d -p 3000:3000 -e MOCK_RP_UI_PUBLIC_URL='healthservices' <dockerImageName>:<tag>

  # The UI will be hosted on http://<domain>/healthservices
  ```

- Build and run on local system:
  Update "/mock-relying-party-ui/public/env-config.js" file according to the requirements
  ```
  $ npm start
  ```

## License
This project is licensed under the terms of [Mozilla Public License 2.0](../LICENSE).