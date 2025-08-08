# Data Sharing Consent Guide

## Overview
The National Disaster Platform mobile app implements a comprehensive data sharing consent system that allows citizens to control how their data is shared with government agencies through the National Data Exchange (NDX) system.

## How Data Sharing Consent Works

### 1. Consent Management Screen
Users can access the consent management system through:
- **Dashboard**: Tap the "🔐 Consent" button
- **Navigation**: Go to "Data Sharing Consent" from the main menu

### 2. Available Data Providers
The app connects to several government agencies:
- **Disaster Management Department**: Real-time disaster alerts and risk assessments
- **Weather Service**: Weather warnings and forecasts
- **Health Ministry**: Health-related emergency information
- **Transport Ministry**: Road conditions and transport alerts

### 3. Consent Request Process
1. **Request Consent**: User requests permission to share data with a specific agency
2. **Review Purpose**: System shows what data will be shared and why
3. **User Approval**: User explicitly approves or denies the consent
4. **Duration**: Consents expire after 24 hours for security
5. **Revocation**: Users can revoke consent at any time

### 4. Data Types Shared
- **Location Data**: For emergency response and nearby risk assessment
- **Disaster Reports**: User-submitted incident reports
- **SOS Signals**: Emergency location data when SOS is activated
- **Risk Assessments**: Local disaster risk calculations

### 5. Security Features
- **Purpose-Specific**: Each consent is for a specific purpose (emergency-response, safety-notifications)
- **Time-Limited**: Consents automatically expire after 24 hours
- **User Control**: Users can view, approve, and revoke all consents
- **Local Storage**: Consents stored locally for offline access
- **Encrypted**: All data transmission is encrypted

### 6. Benefits of Consent
- **Enhanced Disaster Information**: Access to comprehensive disaster data
- **Personalized Alerts**: Location-based emergency notifications
- **Better Risk Assessment**: More accurate local risk calculations
- **Government Coordination**: Improved emergency response coordination

### 7. Privacy Protection
- **Minimal Data**: Only necessary data is shared
- **User Control**: Complete control over what data is shared
- **Transparency**: Clear information about data usage
- **Compliance**: Follows government data protection guidelines

## User Experience Flow

### First-Time Setup
1. User logs in via SLUDI authentication
2. Navigates to Consent Management
3. Reviews available data providers
4. Requests consent for disaster data
5. Approves consent for emergency response
6. Can now access enhanced disaster information

### Daily Usage
1. App automatically checks for valid consents
2. If consent exists → enhanced data access
3. If consent expired → prompts for renewal
4. User can manage consents anytime

### Emergency Situations
1. SOS activation uses existing consents
2. Emergency data shared automatically (if consented)
3. Real-time location shared with emergency services
4. Enhanced disaster information displayed

## Technical Implementation

### NDX Service Integration
- **Consent Management**: Full CRUD operations for consents
- **Data Exchange**: Secure data sharing between agencies
- **Authentication**: SLUDI-based user authentication
- **Offline Support**: Local consent storage

### Mobile App Features
- **Consent UI**: User-friendly consent management interface
- **Status Tracking**: Real-time consent status display
- **Quick Actions**: One-tap consent requests
- **Notifications**: Consent expiration reminders

### Backend Integration
- **API Endpoints**: RESTful consent management APIs
- **Data Validation**: Input validation and sanitization
- **Audit Logging**: Complete consent activity tracking
- **Security**: JWT-based authentication and authorization

## Troubleshooting

### Common Issues
1. **Consent Not Working**: Check if consent has expired
2. **No Data Available**: Ensure consent is approved for relevant agency
3. **Location Issues**: Verify location permission is granted
4. **Offline Mode**: Check internet connection and cached data

### Support
- **In-App Chat**: Use the support chat for help
- **Documentation**: Refer to this guide for detailed information
- **Contact**: Reach out to disaster management authorities

## Compliance and Legal

### Government Guidelines
- Follows NDX data sharing protocols
- Complies with data protection regulations
- Implements security best practices
- Maintains audit trails for all data access

### User Rights
- **Right to Know**: What data is being shared
- **Right to Control**: Approve or deny consent
- **Right to Revoke**: Cancel consent at any time
- **Right to Access**: View all active consents

This consent system ensures that citizens have full control over their data while enabling better disaster response and emergency services coordination.
