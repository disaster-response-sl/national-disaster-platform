# Commercial Bank PayDPI Integration Setup Guide

## Overview
This guide provides step-by-step instructions for implementing Commercial Bank PayDPI (Payment Gateway) integration for the National Disaster Platform donation system.

## Prerequisites
- Node.js 16+ installed
- MongoDB running
- Access to Commercial Bank ITCA Test Environment
- Test credentials from Commercial Bank

## Step 1: Environment Configuration

### Backend Configuration
1. Copy the Commercial Bank environment file:
   ```bash
   cp src/web-dashboard/backend/.env.commercial-bank src/web-dashboard/backend/.env
   ```

2. Update the credentials in `.env` file with your actual test credentials from Commercial Bank:
   ```bash
   MERCHANT_ID=your_actual_merchant_id
   API_USERNAME=your_actual_api_username
   API_PASSWORD=your_actual_api_password
   ```

### Test Environment Details
- **Base URL**: https://cbcmpgs.gateway.mastercard.com
- **API Version**: 100
- **API Operation**: INITIATE_CHECKOUT
- **Test Merchant**: TESTITCALANKALKR (provided in ITCA test.txt)

## Step 2: Backend Setup

### Install Dependencies
```bash
cd src/web-dashboard/backend
npm install
```

### Start Backend Server
```bash
npm start
```

The backend will run on http://localhost:5000

## Step 3: Mobile App Configuration

### Update API Configuration
Update `src/MobileApp/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:5000/api';
export const PAYMENT_GATEWAY_URL = 'https://cbcmpgs.gateway.mastercard.com';
```

### Install Mobile Dependencies
```bash
cd src/MobileApp
npm install
```

### Start Mobile App
For iOS:
```bash
npx react-native run-ios
```

For Android:
```bash
npx react-native run-android
```

## Step 4: Payment Flow Implementation

### Backend Implementation
The backend now uses:
- **MPGS Service**: `src/web-dashboard/backend/services/mpgs.service.js`
- **Payment Routes**: `src/web-dashboard/backend/routes/payment.routes.js`
- **Donation Routes**: `src/web-dashboard/backend/routes/donation.routes.js`

### Key API Endpoints
1. **Create Payment Session**: `POST /api/payment/session`
2. **Confirm Donation**: `POST /api/donation/confirm`
3. **Get Donations**: `GET /api/donations`
4. **Donation Statistics**: `GET /api/donations/stats`

### Mobile App Implementation
The mobile app uses:
- **Donation Screen**: `src/MobileApp/screens/DonationScreen.tsx`
- **MPGS Payment Screen**: `src/MobileApp/screens/MPGSDonationScreen.tsx`

## Step 5: Testing the Integration

### Using Postman (Backend Testing)

1. **Create Payment Session**:
   ```
   POST http://localhost:5000/api/payment/session
   Content-Type: application/json

   {
     "order": {
       "currency": "LKR",
       "amount": "15.00",
       "description": "Test Order"
     }
   }
   ```

2. **Confirm Donation**:
   ```
   POST http://localhost:5000/api/donation/confirm
   Content-Type: application/json

   {
     "name": "John Doe",
     "email": "john.doe@example.com",
     "phone": "+94123456789",
     "amount": 15.00,
     "orderId": "ORD034",
     "transactionId": "TXN123456789",
     "sessionId": "SESSION_ID_FROM_STEP_1",
     "status": "SUCCESS"
   }
   ```

### Mobile App Testing
1. Open the app and navigate to Donation screen
2. Fill in donor details
3. Select amount
4. Tap "Donate Now"
5. Complete payment through MPGS hosted checkout
6. Verify donation is confirmed in backend

## Step 6: Commercial Bank PayDPI Specific Configuration

### Key Differences from Standard MPGS
1. **Base URL**: Uses `cbcmpgs.gateway.mastercard.com` instead of `test-gateway.mastercard.com`
2. **API Operation**: Uses `INITIATE_CHECKOUT` instead of `CREATE_CHECKOUT_SESSION`
3. **Merchant Configuration**: Uses specific merchant ID format
4. **Display Controls**: Configured to hide billing address, customer email, and shipping

### Sample Request Format (as per Commercial Bank guide)
```javascript
{
  "apiOperation": "INITIATE_CHECKOUT",
  "interaction": {
    "merchant": {
      "name": "TESTXXXXXXLKR"
    },
    "operation": "PURCHASE",
    "displayControl": {
      "billingAddress": "HIDE",
      "customerEmail": "HIDE",
      "shipping": "HIDE"
    },
    "returnUrl": "https://www.abcd.lk"
  },
  "order": {
    "id": "ORD034",
    "currency": "LKR",
    "description": "Test Order",
    "amount": "15.00"
  }
}
```

## Step 7: Production Deployment

### Environment Variables for Production
```bash
NODE_ENV=production
MERCHANT_ID=your_production_merchant_id
API_USERNAME=your_production_api_username
API_PASSWORD=your_production_api_password
MPGS_BASE_URL=https://cbcmpgs.gateway.mastercard.com
```

### Security Considerations
1. Never expose API credentials in client-side code
2. Use HTTPS in production
3. Implement proper error handling
4. Log transactions for audit purposes
5. Validate all payment responses server-side

## Troubleshooting

### Common Issues
1. **Invalid Credentials**: Verify merchant ID, username, and password
2. **Network Issues**: Check if cbcmpgs.gateway.mastercard.com is accessible
3. **Session Expired**: Payment sessions have limited validity
4. **Amount Format**: Ensure amount is passed as string

### Debug Logs
Enable debug logging by setting:
```bash
LOG_LEVEL=debug
```

### Support Contacts
- **Commercial Bank Support**: Contact for ITCA test environment access
- **MasterCard MPGS Documentation**: https://test-gateway.mastercard.com/api/documentation/

## Notes
- This implementation follows Commercial Bank's MPGS hosted checkout integration guide
- The system maintains compatibility with the existing donation management features
- All sensitive payment data is handled by MPGS, ensuring PCI compliance
- The integration supports both test and production environments
