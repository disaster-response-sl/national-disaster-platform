# SLUDI Registration Information for ICTA

## Application Details
- **Application Name**: National Disaster Platform
- **Team**: [Your Hackathon Team Name]
- **Contact Email**: [Your Team Email]
- **Phone**: [Your Contact Number]

## 1. PUBLIC KEY (JWK Format)
**Send this exact JSON to ICTA:**

```json
{
  "kty": "RSA",
  "n": "ltmhOjd1O2PuxcZrWlw0opeM-CXep-jwgDgGLEWUJOpzBo0CjqAS0FjC_79nAubxXEENdUDHPBG3MGYMOH2SANrpQlQ1gCeVkTkq30H-tkNBrqMkCJ5swQmeNgn5ruxnaFNUe0Nd3QLCI-sOLg3ALVl_N-HCsX3lZFl_B_k7MjmcxY3h-8ofsHVzI41eFqBZMeCAMvpwmFV-WiMvFGWaJMG5ejuMDO2sTyjJvDZqGdkdx8TKwcDmqo5JJbvPigTtk-yxyQDMTsVWmIIry3kg2QtRMQBaILvk1iIyqmxtZWW9Ea8fenqDejT7Mw1OP4eaOPHZ-J2Vr0XULMIJzeU04w",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "kid": "sludi-key-1756719862413"
}
```

## 2. REDIRECT URIs
**Register these URLs with ICTA:**

### Development/Testing:
- `http://localhost:3000/auth/callback`
- `http://localhost:5000/auth/callback`
- `http://127.0.0.1:3000/auth/callback`

### Production (update with your actual domain):
- `https://nationalDisasterPlatform.lk/auth/callback`
- `https://api.nationalDisasterPlatform.lk/auth/callback`

### Mobile Deep Links:
- `ndp://auth/callback`
- `nationalDisasterPlatform://auth/callback`

## 3. Technical Configuration

### OAuth2 Settings:
- **Grant Types**: `authorization_code`
- **Response Types**: `code`
- **Scopes**: `openid`, `profile`, `email`
- **Client Authentication Method**: `private_key_jwt`
- **Token Endpoint Auth Method**: `private_key_jwt`
- **ID Token Signed Response Algorithm**: `RS256`

### Application Type:
- Web Application with Mobile Components
- Uses WebView for mobile authentication
- Backend API handles token exchange

## 4. Application Description

```
Mobile application for disaster management in Sri Lanka providing:
- Emergency response coordination
- Real-time disaster alerts and notifications
- Donation management system
- Communication tools for citizens and emergency responders
- Location-based emergency services
- Multi-language support (Sinhala, Tamil, English)

Target users: Citizens, Emergency Responders, Government Officials
Platform: React Native (Mobile) + Node.js (Backend)
```

## 5. Contact Information for ICTA

**Primary Contact:**
- Name: [Your Name]
- Email: [Your Email]
- Phone: [Your Phone]
- Role: Team Lead/Developer

**Secondary Contact:**
- Name: [Team Member Name]
- Email: [Team Member Email]
- Phone: [Team Member Phone]
- Role: Developer

## 6. Expected Response from ICTA

Please provide:
1. **CLIENT_ID** for our application
2. **Confirmation** of registered redirect URIs
3. **Service URLs** (if different from standard)
4. **Additional configuration** requirements
5. **Testing guidelines** and procedures

## 7. Email Template for ICTA

```
Subject: SLUDI Integration Request - National Disaster Platform

Dear ICTA SLUDI Integration Team,

We are requesting SLUDI authentication integration for our hackathon project "National Disaster Platform".

Application Details:
- Name: National Disaster Platform  
- Type: Mobile Disaster Management Application
- Team: [Your Team Name]
- Contact: [Your Email]

Required Registration Information:

1. PUBLIC KEY (JWK):
{
  "kty": "RSA",
  "n": "ltmhOjd1O2PuxcZrWlw0opeM-CXep-jwgDgGLEWUJOpzBo0CjqAS0FjC_79nAubxXEENdUDHPBG3MGYMOH2SANrpQlQ1gCeVkTkq30H-tkNBrqMkCJ5swQmeNgn5ruxnaFNUe0Nd3QLCI-sOLg3ALVl_N-HCsX3lZFl_B_k7MjmcxY3h-8ofsHVzI41eFqBZMeCAMvpwmFV-WiMvFGWaJMG5ejuMDO2sTyjJvDZqGdkdx8TKwcDmqo5JJbvPigTtk-yxyQDMTsVWmIIry3kg2QtRMQBaILvk1iIyqmxtZWW9Ea8fenqDejT7Mw1OP4eaOPHZ-J2Vr0XULMIJzeU04w",
  "e": "AQAB",
  "use": "sig",
  "alg": "RS256",
  "kid": "sludi-key-1756719862413"
}

2. REDIRECT URIs:
- http://localhost:3000/auth/callback (development)
- https://nationalDisasterPlatform.lk/auth/callback (production)
- ndp://auth/callback (mobile)

3. OAUTH2 CONFIGURATION:
- Grant Types: authorization_code
- Response Types: code
- Scopes: openid, profile, email
- Client Auth Method: private_key_jwt

Please provide our CLIENT_ID and confirm the registration.

Thank you for your support.

Best regards,
[Your Name]
[Your Team]
[Your Contact Information]
```

---

## Next Steps After ICTA Response

1. **Update .env file** with received CLIENT_ID
2. **Test integration** using provided credentials
3. **Switch to production mode** by setting `USE_MOCK_SLUDI=false`
4. **Validate authentication flow** with real SLUDI service

---

*Generated on: September 1, 2025*
*Key ID: sludi-key-1756719862413*
