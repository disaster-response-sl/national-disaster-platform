# SLUDI Integration Guide

This document explains how to integrate the Sri Lankan Digital Identity (SLUDI) authentication system with the National Disaster Platform mobile app.

## Overview

SLUDI is Sri Lanka's government digital identity system based on eSignet (MOSIP). This integration allows citizens to authenticate using their official digital identity instead of traditional username/password combinations.

## Architecture

```
Mobile App → WebView → SLUDI Auth Server → OAuth2 Flow → Backend API → JWT Token
```

### Components

1. **Mobile App (React Native)**: Initiates authentication and displays SLUDI login in WebView
2. **SLUDI Auth Server**: Government-hosted authentication service
3. **Backend API**: Handles OAuth2 token exchange and user profile retrieval
4. **Database**: Stores user sessions and app-specific data

## Setup Instructions

### 1. Prerequisites

- Node.js v20+
- React Native development environment
- ICTA-provided credentials (CLIENT_ID and RSA key pair)

### 2. Backend Configuration

#### Environment Variables

Copy the `.env.example` to `.env` and configure:

```bash
# SLUDI Configuration
USE_MOCK_SLUDI=true  # Set to false when ready for production
SLUDI_ESIGNET_SERVICE_URL=https://sludiauth.icta.gov.lk/service
SLUDI_ESIGNET_AUD_URL=https://sludiauth.icta.gov.lk/service/oauth/v2/token
SLUDI_CLIENT_ID=your_icta_provided_client_id
SLUDI_CLIENT_PRIVATE_KEY={"p":"...","kty":"RSA",...}  # Full JWK private key
SLUDI_REDIRECT_URI=http://localhost:3000/auth/callback
```

#### Getting ICTA Credentials

1. Contact ICTA (Information and Communication Technology Agency of Sri Lanka)
2. Request access for your hackathon team
3. Receive CLIENT_ID and instructions for RSA key pair generation
4. Generate RSA key pair using [mkjwk.org](https://mkjwk.org) as specified in ICTA guidelines

### 3. Mobile App Configuration

#### Install Dependencies

```bash
cd src/MobileApp
npm install react-native-webview
```

#### Navigation Setup

Add the SLUDI authentication screen to your navigation stack:

```javascript
// In your navigation configuration
import SLUDIAuthScreen from './screens/SLUDIAuthScreen';

// Add to your stack navigator
<Stack.Screen 
  name="SLUDIAuth" 
  component={SLUDIAuthScreen}
  options={{ headerShown: false }}
/>
```

## Usage

### 1. Mock Mode (Development)

For development and testing, use the mock SLUDI service:

```bash
# In .env
USE_MOCK_SLUDI=true
```

Mock credentials:
- Individual ID: `citizen001`, `responder001`, or `admin001`
- OTP: `123456`

### 2. Production Mode

When ready for production with real SLUDI:

```bash
# In .env
USE_MOCK_SLUDI=false
SLUDI_CLIENT_ID=your_real_client_id
SLUDI_CLIENT_PRIVATE_KEY=your_real_private_key
```

### 3. Authentication Flow

1. User taps "Sign in with SLUDI" on login screen
2. App navigates to SLUDIAuthScreen with WebView
3. WebView loads SLUDI authorization URL
4. User completes authentication on SLUDI website
5. SLUDI redirects back with authorization code
6. App exchanges code for access token
7. App retrieves user profile and creates JWT session
8. User is logged into the app

## API Endpoints

### Backend Endpoints

#### Health Check
```
GET /api/mobile/sludi/health
```

Response:
```json
{
  "success": true,
  "sludiService": {
    "type": "mock" | "real",
    "status": "healthy" | "unhealthy",
    "healthy": true
  }
}
```

#### Get Authorization URL
```
POST /api/mobile/sludi/auth-url
Body: { "individualId": "user_identifier" }
```

Response:
```json
{
  "success": true,
  "authorizationUrl": "https://sludiauth.icta.gov.lk/service/oauth/authorize?...",
  "state": "mobile_user_12345",
  "message": "Redirect user to SLUDI authorization URL"
}
```

#### Exchange Authorization Code
```
POST /api/mobile/sludi/token
Body: { "code": "auth_code", "state": "state_value" }
```

Response:
```json
{
  "success": true,
  "token": "jwt_token_for_app",
  "user": {
    "individualId": "user_id",
    "name": "User Name",
    "email": "user@email.com",
    "role": "citizen"
  },
  "message": "SLUDI authentication successful"
}
```

## Testing

### Run Integration Tests

```bash
node test-sludi-integration.js
```

This will test:
- Mock SLUDI service functionality
- Real SLUDI service configuration
- Backend API endpoints
- Overall integration health

### Manual Testing

1. Start the backend server:
   ```bash
   cd src/web-dashboard/backend
   npm start
   ```

2. Start the mobile app:
   ```bash
   cd src/MobileApp
   npm start
   ```

3. Navigate to login screen and test both:
   - Traditional OTP login (mock mode)
   - SLUDI authentication (WebView flow)

## Security Considerations

### JWT Tokens
- App JWT tokens contain user identity and roles
- Tokens expire based on JWT_EXPIRES_IN setting
- SLUDI access tokens are stored securely and used for profile updates

### Private Key Security
- Store RSA private key securely in environment variables
- Never commit private keys to version control
- Use proper key rotation practices in production

### WebView Security
- WebView only loads trusted SLUDI domains
- Implements proper error handling for auth failures
- Validates callback URLs and authorization codes

## Troubleshooting

### Common Issues

1. **"Cannot find module 'react-native-webview'"**
   ```bash
   cd src/MobileApp
   npm install react-native-webview
   ```

2. **"SLUDI health check failed"**
   - Check internet connection
   - Verify SLUDI service URLs in environment
   - Ensure SLUDI servers are accessible

3. **"Invalid CLIENT_ID"**
   - Verify CLIENT_ID from ICTA
   - Check environment variable spelling
   - Ensure no extra spaces in CLIENT_ID

4. **"JWT verification failed"**
   - Check private key format (must be valid JWK)
   - Verify key corresponds to registered public key
   - Ensure proper RSA algorithm (RS256)

### Debug Mode

Enable detailed logging:

```bash
# In .env
NODE_ENV=development
```

Check logs for:
- SLUDI service calls
- OAuth2 token exchange
- JWT token generation
- WebView navigation events

## Production Deployment

### Environment Setup

1. Set `USE_MOCK_SLUDI=false`
2. Configure production SLUDI credentials
3. Update redirect URIs for production domains
4. Implement proper logging and monitoring
5. Set up SSL/TLS for all endpoints

### Security Checklist

- [ ] Private keys stored securely
- [ ] Environment variables properly configured
- [ ] JWT secret is cryptographically secure
- [ ] HTTPS enabled for all communications
- [ ] Proper error handling implemented
- [ ] Logging configured (without sensitive data)
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

## Support

For SLUDI-specific issues:
- Contact ICTA support
- Reference SLUDI developer documentation
- Check SLUDI service status

For integration issues:
- Review backend logs
- Test with mock service first
- Verify mobile app WebView functionality
- Check network connectivity and firewall settings

## Additional Resources

- [SLUDI Official Documentation](https://sludiauth.icta.gov.lk)
- [MOSIP eSignet Documentation](https://docs.esignet.io/)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [JWT Documentation](https://jwt.io/)
- [React Native WebView Guide](https://github.com/react-native-webview/react-native-webview)
