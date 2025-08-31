# Mobile App Commercial Bank PayDPI Integration

## Overview
The mobile app has been updated to work with Commercial Bank PayDPI (Payment Gateway) for secure donation processing.

## Updated Files

### Configuration
- `src/MobileApp/config/api.ts` - Updated with Commercial Bank PayDPI URLs and configuration

### Screens
- `src/MobileApp/screens/DonationScreen.tsx` - Basic donation form screen
- `src/MobileApp/screens/MPGSDonationScreen.tsx` - MPGS-enabled donation screen with payment processing

## Key Changes Made

### 1. API Configuration Updates
- Base URL: Updated to point to local backend server
- Payment Gateway URL: `https://cbcmpgs.gateway.mastercard.com`
- Checkout Script URL: `https://cbcmpgs.gateway.mastercard.com/checkout/version/100/checkout.js`

### 2. Payment Flow Updates
- **API Operation**: Changed from `CREATE_CHECKOUT_SESSION` to `INITIATE_CHECKOUT`
- **Amount Format**: Ensured amount is passed as string (not number)
- **Display Controls**: Added Commercial Bank specific settings (hide billing, email, shipping)
- **Merchant Name**: Uses Commercial Bank test merchant ID `TESTITCALANKALKR`

### 3. Integration Features
- Secure hosted checkout using Commercial Bank's gateway
- Real-time payment session creation
- Donation confirmation and tracking
- Error handling and user feedback

## Usage Flow

### 1. Donation Screen (`DonationScreen.tsx`)
```typescript
// User fills out donation form
const formData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+94123456789',
  amount: '1000'
};

// Navigate to MPGS payment screen
navigation.navigate('MPGSDonation');
```

### 2. MPGS Payment Screen (`MPGSDonationScreen.tsx`)
```typescript
// Create payment session with Commercial Bank
const sessionResponse = await createPaymentSession();

// Show MPGS hosted checkout in WebView
const paymentHtml = generatePaymentHTML(sessionResponse);

// Handle payment completion
const confirmationResponse = await confirmDonation(paymentResult);
```

## API Integration

### Payment Session Creation
```javascript
POST /api/payment/session
{
  "order": {
    "currency": "LKR",
    "amount": "1000.00",
    "description": "Disaster Relief Donation"
  },
  "interaction": {
    "operation": "PURCHASE",
    "displayControl": {
      "billingAddress": "HIDE",
      "customerEmail": "HIDE", 
      "shipping": "HIDE"
    },
    "returnUrl": "https://www.abcd.lk"
  }
}
```

### Donation Confirmation
```javascript
POST /api/donation/confirm
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+94123456789",
  "amount": 1000,
  "orderId": "ORD123456",
  "transactionId": "TXN789012",
  "sessionId": "SESSION_ID",
  "status": "SUCCESS"
}
```

## Development Setup

### 1. Install Dependencies
```bash
cd src/MobileApp
npm install
```

### 2. Update API Configuration
Edit `src/MobileApp/config/api.ts`:
```typescript
export const API_BASE_URL = 'http://YOUR_BACKEND_URL:5000/api';
```

### 3. Run the App
```bash
# For iOS
npx react-native run-ios

# For Android  
npx react-native run-android
```

## Testing

### Test Data
Use these test values for development:
- **Amount**: Any valid amount (e.g., 15.00, 1000.00)
- **Currency**: LKR (Sri Lankan Rupee)
- **Test Cards**: Use test card numbers provided by Commercial Bank

### Environment
- **Test Gateway**: https://cbcmpgs.gateway.mastercard.com
- **Merchant ID**: TESTITCALANKALKR (from ITCA test environment)

## Security Features

### Client-Side Security
- No sensitive payment data stored on device
- All payment processing handled by MPGS hosted checkout
- Secure HTTPS communication
- Input validation and sanitization

### Payment Flow Security
- Payment session created server-side with backend credentials
- Hosted checkout ensures PCI compliance
- Transaction confirmation handled by backend
- No card details processed by mobile app

## Error Handling

### Common Error Scenarios
1. **Network Connection Issues**
   - Show user-friendly error message
   - Retry mechanism for API calls

2. **Payment Session Creation Failure**
   - Log error details
   - Show fallback options

3. **Payment Processing Errors**
   - Handle MPGS error responses
   - Allow user to retry payment

4. **Session Timeout**
   - Detect expired sessions
   - Restart payment flow

## Production Considerations

### Environment Variables
Set these for production deployment:
```bash
REACT_NATIVE_API_BASE_URL=https://your-production-api.com/api
```

### Performance Optimization
- Implement loading states during payment processing
- Cache payment session data temporarily
- Optimize WebView performance for payment pages

### Monitoring
- Log payment session creation attempts
- Track payment success/failure rates
- Monitor API response times

## Support
For integration support or issues:
- Check backend server logs
- Verify Commercial Bank PayDPI configuration
- Test with Commercial Bank provided test credentials
- Review MPGS documentation for error codes
