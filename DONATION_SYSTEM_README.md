# Donation System - Mobile Frontend & Backend

## Overview

This implementation provides a complete donation system for the National Disaster Platform with:

### Backend Features (API)
- **MPGS Payment Integration** - Mastercard Payment Gateway Services
- **Donation Management** - Complete donation lifecycle
- **Donor Management** - Profile creation and history tracking
- **Real-time Statistics** - Analytics and reporting
- **Security** - Input validation, sanitization, error handling

### Mobile Frontend Features
- **Donation Screen** - Make donations with form validation
- **Donation History** - Search and view donation history by email
- **Donation Statistics** - Overview of all platform donations
- **Multi-language Support** - English, Sinhala, Tamil
- **Payment Simulation** - Test environment with success/failure simulation

## Backend Implementation

### API Endpoints

#### Payment Session Management
```
POST /api/payment/session - Create payment session
GET /api/payment/session/:sessionId - Verify payment session
```

#### Donation Management
```
POST /api/donation/confirm - Confirm donation after payment
GET /api/donations - Get donations with filtering/pagination
GET /api/donations/stats - Get donation statistics
GET /api/donations/donor/:email - Get donor history
```

### Models

#### Donor Model (`models/Donor.js`)
- Personal information (name, email, phone)
- Donation statistics (count, total amount, dates)
- Automatic stats updating

#### Donation Model (`models/Donation.js`)
- Complete donation details
- MPGS integration fields
- Status tracking and timestamps
- Static methods for analytics

### Services

#### DonationService (`services/donation.service.js`)
- Find/create donors with deduplication
- Create and confirm donations
- Get donations with filtering
- Generate statistics and analytics

#### MPGSService (`services/mpgs.service.js`)
- Payment session creation
- Session verification
- Direct payment processing
- Commercial Bank ITCA integration

### Middleware

#### ValidationMiddleware (`middleware/donation.middleware.js`)
- Input validation and sanitization
- Error handling without information leakage
- Response data sanitization

## Mobile Frontend Implementation

### Screens

#### DonationScreen (`screens/DonationScreen.tsx`)
- Donation form with validation
- Predefined amount buttons
- Payment simulation for testing
- Multi-language support

#### DonationHistoryScreen (`screens/DonationHistoryScreen.tsx`)
- Email-based search
- Donation history with details
- Donor statistics summary
- Pull-to-refresh functionality

#### DonationStatsScreen (`screens/DonationStatsScreen.tsx`)
- Platform-wide donation statistics
- Status breakdown with percentages
- Recent activity visualization
- Real-time data updates

### Navigation Integration

Added donation screens to main navigation stack:
- `Donation` - Make new donation
- `DonationHistory` - View donation history
- `DonationStats` - View platform statistics

### Dashboard Integration

Added donation actions to DashboardScreen:
- Quick action button for donations
- Testing buttons for history and stats

## Configuration

### Backend Environment Variables

Create `.env` file from `.env.example`:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/disaster-platform

# MPGS Configuration
MERCHANT_ID=your_merchant_id
API_USERNAME=your_api_username
API_PASSWORD=your_api_password
MPGS_BASE_URL=https://test-gateway.mastercard.com

# ITCA Test Environment
ITCA_TEST_PASSWORD=TESTITCALANKALKR
```

### Mobile API Configuration

Update `config/api.ts` with your backend URL:

```typescript
export const API_BASE_URL = 'https://your-tunnel-url/api';
```

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
```bash
cd src/web-dashboard/backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Backend Server**
```bash
npm start
```

### Mobile Setup

1. **Update API Configuration**
Edit `src/MobileApp/config/api.ts` with your backend URL

2. **Install Dependencies** (if needed)
```bash
cd src/MobileApp
npm install
```

3. **Run Mobile App**
```bash
npx react-native run-android
# or
npx react-native run-ios
```

## Testing

### Backend API Testing

Run the donation API test script:
```bash
cd src/web-dashboard/backend
node test-donation-api.js
```

### Mobile Testing

1. **Open Donation Screen**
   - Navigate to Dashboard
   - Tap "Make Donation" button

2. **Test Payment Flow**
   - Fill donation form
   - Choose "Simulate Success" or "Simulate Failure"
   - Verify donation confirmation

3. **Test History & Stats**
   - Use testing buttons in Dashboard
   - Search donation history by email
   - View platform statistics

## MPGS Integration

### Commercial Bank ITCA Setup

1. **Contact Commercial Bank** for ITCA test credentials
2. **Access ITCA TEST** folder with password: `TESTITCALANKALKR`
3. **Configure test environment** with provided credentials

### Payment Flow

1. **Create Session** - Generate payment session with MPGS
2. **Process Payment** - Handle payment through gateway
3. **Confirm Donation** - Save donation details after payment
4. **Update Statistics** - Automatically update donor and platform stats

## Multi-language Support

Translation keys added for all three languages:

### English (`locales/en.json`)
- Complete donation terminology
- Form labels and validation messages
- Screen titles and descriptions

### Sinhala (`locales/si.json`)
- Comprehensive Sinhala translations
- Proper Unicode character support
- Cultural context considerations

### Tamil (`locales/ta.json`)
- Complete Tamil translations
- Proper script rendering
- Localized formatting

## Security Features

### Input Validation
- Email format validation
- Phone number validation
- Amount range validation
- Required field checking

### Data Sanitization
- Automatic trimming and formatting
- SQL injection prevention
- XSS protection
- Response data cleaning

### Error Handling
- No sensitive information exposure
- Graceful error messages
- Proper HTTP status codes
- Logging for debugging

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "User-friendly error message"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Field-specific error messages"]
}
```

## Future Enhancements

### Planned Features
- **Real Payment Gateway** - Production MPGS integration
- **Donation Receipts** - Email receipts with PDF generation
- **Recurring Donations** - Subscription-based donations
- **Social Sharing** - Share donation achievements
- **Push Notifications** - Donation confirmations and updates

### Technical Improvements
- **Offline Support** - Cache donations for offline submission
- **Analytics Dashboard** - Advanced donation analytics
- **Admin Panel** - Donation management interface
- **Webhook Integration** - Real-time payment notifications

## Support

For technical support or questions:
- **Backend API**: Check `test-donation-api.js` for endpoint testing
- **Mobile Issues**: Verify API_BASE_URL configuration
- **MPGS Integration**: Contact Commercial Bank for credentials
- **Translation Issues**: Check locale files for missing keys

---

**Implementation Status**: ✅ Complete
**Testing Status**: ✅ API and Mobile tested
**Documentation**: ✅ Comprehensive
**Production Ready**: ⚠️ Requires MPGS production credentials
