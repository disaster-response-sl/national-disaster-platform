# NDX (National Data Exchange) Implementation

## Overview
This implementation simulates the National Data Exchange (NDX) using WSO2 Choreo API Manager patterns for consent-based data sharing between government agencies.

## Architecture

### WSO2 Choreo API Manager Pattern
- **API Gateway**: Centralized API management with authentication and rate limiting
- **Consent Management**: Citizen-controlled data sharing with explicit consent
- **Data Providers**: Government agencies exposing APIs through the NDX
- **Data Consumers**: Applications requesting data with proper authorization

## Implementation Components

### 1. Mock NDX Service (`ndx-service.js`)
Simulates the core NDX functionality:

- **Data Providers**: Disaster Management, Weather Service, Health Ministry, Transport Ministry
- **Consent Management**: Request, approve, revoke, and track data sharing consents
- **Data Exchange**: Secure data retrieval based on approved consents
- **Provider Registry**: Catalog of available government data sources

### 2. NDX Routes (`ndx.routes.js`)
RESTful API endpoints following WSO2 Choreo patterns:

#### Consent Management
- `POST /api/ndx/consent/request` - Request data sharing consent
- `POST /api/ndx/consent/approve` - Approve consent (citizen action)
- `GET /api/ndx/consent/:consentId` - Check consent status
- `POST /api/ndx/consent/revoke` - Revoke consent

#### Data Exchange
- `POST /api/ndx/data/exchange` - Exchange data using approved consent
- `POST /api/ndx/data/disaster-info` - Get disaster information via NDX
- `POST /api/ndx/data/weather-alerts` - Get weather alerts via NDX

#### Provider Discovery
- `GET /api/ndx/providers` - List available data providers

## Data Flow

### 1. Consent Request Flow
```
Citizen App → NDX API → Consent Request → Provider Validation → Consent Created
```

### 2. Data Exchange Flow
```
App → NDX API → Consent Validation → Provider Data → Filtered Response
```

### 3. Consent Lifecycle
```
PENDING → APPROVED → ACTIVE → EXPIRED/REVOKED
```

## API Examples

### Request Disaster Information
```bash
POST /api/ndx/data/disaster-info
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  }
}
```

### Request Weather Alerts
```bash
POST /api/ndx/data/weather-alerts
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "area": "Western Province"
}
```

### Manual Consent Management
```bash
# Request consent
POST /api/ndx/consent/request
{
  "dataProvider": "disaster-management",
  "dataType": "disasters",
  "purpose": "emergency-response",
  "consentDuration": 86400000
}

# Approve consent
POST /api/ndx/consent/approve
{
  "consentId": "consent_1234567890_citizen001"
}

# Exchange data
POST /api/ndx/data/exchange
{
  "consentId": "consent_1234567890_citizen001",
  "dataRequest": {
    "location": { "lat": 6.9271, "lng": 79.8612 }
  }
}
```

## Security Features

### 1. Consent-Based Access
- All data access requires explicit citizen consent
- Consent has expiration dates and can be revoked
- Purpose-specific data sharing

### 2. Authentication & Authorization
- JWT-based authentication
- Individual ID verification via SLUDI
- Role-based access control

### 3. Data Privacy
- Only requested data types are shared
- Consent tracking and audit trails
- Data minimization principles

## Integration with SLUDI

The NDX implementation integrates with SLUDI for:
- **Identity Verification**: Using individualId from SLUDI authentication
- **Consent Attribution**: Linking consents to verified identities
- **Audit Trail**: Tracking data access by authenticated users

## Mock Data Providers

### Disaster Management Authority
- **APIs**: disasters, resources, sos-signals
- **Data Types**: Active disasters, available resources, emergency signals

### Meteorological Department
- **APIs**: weather-alerts, flood-warnings
- **Data Types**: Weather warnings, flood predictions

### Ministry of Health
- **APIs**: medical-supplies, health-status
- **Data Types**: Medical resource availability, health statistics

### Ministry of Transport
- **APIs**: road-conditions, evacuation-routes
- **Data Types**: Road status, evacuation route information

## Compliance with ReviveNation Requirements

✅ **WSO2 Choreo API Manager Pattern**: Implemented with proper API gateway patterns
✅ **Consent Management**: Full consent lifecycle with citizen control
✅ **Data Exchange**: Secure, auditable data sharing between agencies
✅ **Mock Implementation**: Complete simulation for hackathon demonstration
✅ **Integration Ready**: Designed for real NDX integration

## Testing

### Demo Credentials
- **Individual ID**: citizen001, responder001, admin001
- **OTP**: 123456
- **Consent Duration**: 24 hours (configurable)

### Test Scenarios
1. Request disaster information for a location
2. Get weather alerts for a specific area
3. Manage consent lifecycle (request → approve → revoke)
4. Test consent expiration and renewal

## Future Enhancements

1. **Real NDX Integration**: Replace mock with actual NDX APIs
2. **Advanced Consent**: Granular consent with specific data fields
3. **Data Encryption**: End-to-end encryption for sensitive data
4. **Audit Logging**: Comprehensive audit trails for compliance
5. **Rate Limiting**: API usage limits and quotas
