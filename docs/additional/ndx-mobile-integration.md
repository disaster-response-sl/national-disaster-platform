# NDX Mobile App Integration

## Overview
The mobile app now includes full NDX (National Data Exchange) integration with consent management features, allowing citizens to control their data sharing with government agencies.

## Mobile App Components

### 1. NDX Service (`NDXService.ts`)
Complete TypeScript service for NDX operations:

**Features:**
- ✅ Get available data providers
- ✅ Request data exchange consent
- ✅ Approve/revoke consent
- ✅ Exchange data using approved consent
- ✅ Local consent storage for offline access
- ✅ Automatic disaster data retrieval via NDX

**Key Methods:**
```typescript
// Get disaster information via NDX (with auto consent)
await NDXService.getDisasterInfo(location);

// Manual consent management
await NDXService.requestConsent(request);
await NDXService.approveConsent(consentId);
await NDXService.revokeConsent(consentId);
```

### 2. Consent Management Screen (`ConsentManagementScreen.tsx`)
Full-featured UI for managing data sharing consents:

**Features:**
- 📋 View available data providers (Disaster Management, Weather Service, Health Ministry, Transport Ministry)
- 🔐 Request consent for specific data types
- ✅ Approve pending consents
- ❌ Revoke active consents
- 📊 View consent status and expiration dates
- 🚀 Quick actions for common consent requests

**UI Components:**
- Provider cards with available APIs
- Consent status badges (PENDING, APPROVED, REVOKED, EXPIRED)
- Quick action buttons for disaster and weather data
- Pull-to-refresh functionality

### 3. Navigation Integration
Added to main app navigation:

```typescript
// App.tsx - Added ConsentManagement screen
<Stack.Screen 
  name="ConsentManagement" 
  component={ConsentManagementScreen}
  options={{ 
    title: 'Data Sharing Consent',
    headerStyle: { backgroundColor: '#6f42c1' },
    headerTintColor: 'white'
  }}
/>
```

### 4. Dashboard Integration
Added consent management button to dashboard:

```typescript
// DashboardScreen.tsx - Added consent quick action
<TouchableOpacity
  style={[styles.quickActionButton, { backgroundColor: '#6f42c1' }]}
  onPress={() => handleQuickAction('consent')}
>
  <Text style={styles.quickActionIcon}>🔐</Text>
  <Text style={styles.quickActionText}>Consent</Text>
</TouchableOpacity>
```

### 5. Risk Map NDX Integration
Updated RiskMapScreen to use NDX for disaster data:

```typescript
// RiskMapScreen.tsx - NDX integration
const ndxResult = await NDXService.getDisasterInfo(userLocationForNDX);
if (ndxResult.success && ndxResult.data) {
  setDisasters(ndxResult.data);
  return;
}
// Fallback to direct API if NDX fails
```

## User Experience Flow

### 1. First-Time User
1. User opens app and logs in via SLUDI
2. Navigates to "Consent" from dashboard
3. Views available government data providers
4. Requests consent for disaster data
5. Approves consent for emergency response
6. Can now access enhanced disaster information

### 2. Data Access Flow
1. App requests disaster data via NDX
2. NDX checks for valid consent
3. If consent exists and is valid → data returned
4. If no consent → consent request created
5. User approves consent → data access granted
6. Data displayed in Risk Map and other screens

### 3. Consent Management
1. User can view all active consents
2. See consent status, purpose, and expiration
3. Revoke consents at any time
4. Request new consents for different data types
5. Track consent history and usage

## Security Features

### 1. Consent-Based Access
- All data access requires explicit user consent
- Consent has expiration dates (24 hours default)
- Purpose-specific data sharing (emergency-response, safety-notifications)
- User can revoke consent at any time

### 2. Local Storage
- Consents stored locally for offline access
- Secure storage using AsyncStorage
- Consent status tracking and management

### 3. Authentication Integration
- Uses SLUDI authentication tokens
- Individual ID verification for consent attribution
- JWT-based API access control

## API Integration

### Backend Endpoints Used
- `GET /api/ndx/providers` - Get available data providers
- `POST /api/ndx/consent/request` - Request consent
- `POST /api/ndx/consent/approve` - Approve consent
- `POST /api/ndx/consent/revoke` - Revoke consent
- `POST /api/ndx/data/disaster-info` - Get disaster data via NDX
- `POST /api/ndx/data/weather-alerts` - Get weather alerts via NDX

### Error Handling
- Graceful fallback to direct API if NDX unavailable
- User-friendly error messages
- Offline mode support with cached data

## Testing

### Manual Testing Steps
1. **Login**: Use demo credentials (citizen001, 123456)
2. **Access Consent**: Tap "Consent" button on dashboard
3. **Request Consent**: Tap "Request disasters" for Disaster Management Authority
4. **Approve Consent**: Tap "Approve Now" in alert dialog
5. **View Active Consents**: See approved consent in "Your Active Consents" section
6. **Test Data Access**: Navigate to Risk Map to see NDX-powered disaster data
7. **Revoke Consent**: Tap "Revoke Consent" to test revocation

### Demo Credentials
- **Individual ID**: citizen001, responder001, admin001
- **OTP**: 123456
- **Test Location**: Colombo (6.9271, 79.8612)

## Compliance with ReviveNation Requirements

✅ **WSO2 Choreo API Manager Pattern**: Implemented with proper API gateway patterns
✅ **Consent Management**: Full consent lifecycle with citizen control
✅ **Mobile App Integration**: Complete UI for consent management
✅ **Data Exchange**: Secure, auditable data sharing between agencies
✅ **User Experience**: Intuitive consent management interface
✅ **Offline Support**: Local consent storage and caching
✅ **Error Handling**: Graceful fallbacks and user feedback

## Future Enhancements

1. **Push Notifications**: Alert users when consents are about to expire
2. **Bulk Consent**: Allow requesting multiple data types at once
3. **Consent Analytics**: Show users how their data is being used
4. **Advanced Privacy**: Granular consent with specific data fields
5. **Biometric Approval**: Use fingerprint/face ID for consent approval
6. **Consent Templates**: Pre-defined consent templates for common use cases
