# ICTA Registration Requirements for SLUDI Integration

## What ICTA Needs from Your Team

ICTA requires the following information to register your application for SLUDI authentication:

### 1. **Public Key** (JWK Format)
- RSA public key in JSON Web Key (JWK) format
- Algorithm: RS256
- Key size: 2048 bits minimum

### 2. **Redirect URIs**
- URLs where SLUDI will redirect users after authentication
- Must be HTTPS in production (HTTP allowed for localhost testing)

---

## Step 1: Generate RSA Key Pair

### Option A: Using Online Tool (Recommended for Hackathon)

1. Visit [mkjwk.org](https://mkjwk.org)
2. Select these settings:
   - **Key Type**: RSA
   - **Key Size**: 2048
   - **Key Use**: Signature
   - **Algorithm**: RS256
   - **Key ID**: Generate (or use a custom ID like "sludi-key-2025")

3. Click **Generate**
4. Copy the **Public Key** (this goes to ICTA)
5. Copy the **Private Key** (this goes in your .env file)

### Option B: Using Command Line

```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem

# Convert to JWK format (requires additional tools)
```

---

## Step 2: Prepare Information for ICTA

### Public Key (JWK Format)
**Send this to ICTA:**

Example format:
```json
{
  "kty": "RSA",
  "use": "sig",
  "alg": "RS256",
  "n": "0vx7agoebGcQSu...(long base64 string)",
  "e": "AQAB"
}
```

### Redirect URIs
**Send this list to ICTA:**

#### Development/Testing URLs:
```
http://localhost:3000/auth/callback
http://localhost:3000/sludi/callback
http://127.0.0.1:3000/auth/callback
```

#### Production URLs (Update these with your actual domains):
```
https://your-app-domain.com/auth/callback
https://your-app-domain.com/sludi/callback
https://api.your-app-domain.com/auth/callback
```

#### Mobile App Deep Links:
```
ndp://auth/callback
nationalDisasterPlatform://auth/callback
```

---

## Step 3: Application Information for ICTA

### Basic Application Details

**Application Name:** National Disaster Platform

**Application Type:** Mobile Application with Web Backend

**Grant Types:** authorization_code

**Response Types:** code

**Scopes:** openid, profile, email

**Client Authentication Method:** private_key_jwt

### Technical Details

**Token Endpoint Auth Method:** private_key_jwt

**ID Token Signed Response Algorithm:** RS256

**Userinfo Signed Response Algorithm:** RS256

**Application Description:**
```
Mobile application for disaster management in Sri Lanka. 
Provides emergency response coordination, real-time alerts, 
donation management, and communication tools for citizens, 
emergency responders, and government officials.
```

**Contact Information:**
- Team Name: [Your Team Name]
- Contact Email: [Your Team Email]
- Phone: [Your Contact Number]
- Organization: SLIIT (if applicable)

---

## Step 4: Email Template for ICTA

```
Subject: SLUDI Integration Request - National Disaster Platform (Hackathon Team)

Dear ICTA SLUDI Team,

We are requesting SLUDI integration for our hackathon project: National Disaster Platform.

Application Details:
- Name: National Disaster Platform
- Type: Mobile Application with Web Backend
- Purpose: Disaster management and emergency response for Sri Lanka

Required Information:

1. PUBLIC KEY (JWK Format):
{
  "kty": "RSA",
  "use": "sig",
  "alg": "RS256",
  "n": "[YOUR_PUBLIC_KEY_N_VALUE]",
  "e": "AQAB"
}

2. REDIRECT URIs:
- http://localhost:3000/auth/callback (development)
- https://your-domain.com/auth/callback (production)
- ndp://auth/callback (mobile deep link)

3. GRANT TYPES: authorization_code
4. RESPONSE TYPES: code
5. SCOPES: openid, profile, email

Please provide:
- CLIENT_ID for our application
- Confirmation of registered redirect URIs
- Any additional configuration requirements

Contact Information:
- Team: [Your Team Name]
- Email: [Your Email]
- Phone: [Your Phone]

Thank you for your support.

Best regards,
[Your Name]
[Your Team]
```

---

## Step 5: Update Your Environment

Once you receive the CLIENT_ID from ICTA:

1. Copy your **private key** to `.env`:
```bash
SLUDI_CLIENT_ID=your_icta_provided_client_id
SLUDI_CLIENT_PRIVATE_KEY={"kty":"RSA","use":"sig",...your_full_private_key...}
```

2. Update redirect URI if needed:
```bash
SLUDI_REDIRECT_URI=https://your-production-domain.com/auth/callback
```

3. Switch to production mode:
```bash
USE_MOCK_SLUDI=false
```

---

## Testing After Registration

1. Test with mock service first:
```bash
node test-sludi-integration.js
```

2. Test real SLUDI integration:
```bash
# Set USE_MOCK_SLUDI=false in .env
node test-sludi-integration.js
```

3. Test mobile app authentication flow

---

## Security Notes

- **Never share your private key**
- Only share the **public key** with ICTA
- Keep private key secure in environment variables
- Use HTTPS for all production redirect URIs
- Regularly rotate keys in production

---

## Support

If you encounter issues:
1. Check ICTA SLUDI documentation
2. Verify key format (must be valid JWK)
3. Confirm redirect URIs match exactly
4. Test with mock service first
5. Contact ICTA support for CLIENT_ID issues

---

*This document contains all information needed for ICTA registration*
