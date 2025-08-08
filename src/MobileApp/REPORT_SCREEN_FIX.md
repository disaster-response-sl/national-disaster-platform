# Report Screen Fix Documentation

## Issues Found and Fixed

### 1. Database Schema Issues
- **Problem**: The Report model required `disaster_id` as a mandatory field, but the mobile app wasn't sending it
- **Fix**: Made `disaster_id` optional in the Report schema
- **File**: `src/web-dashboard/backend/models/Report.js`

### 2. Missing Location Field
- **Problem**: Mobile app was sending location data but the backend schema didn't have a location field
- **Fix**: Added location field to the Report schema with lat/lng coordinates
- **File**: `src/web-dashboard/backend/models/Report.js`

### 3. Backend API Updates
- **Problem**: Backend wasn't handling location data from mobile app
- **Fix**: Updated the reports POST endpoint to accept and store location data
- **File**: `src/web-dashboard/backend/routes/mobileAuth.routes.js`

### 4. Environment Variables
- **Problem**: Backend might fail if environment variables aren't set
- **Fix**: Added fallback values for JWT_SECRET and MONGO_URI
- **Files**: 
  - `src/web-dashboard/backend/routes/mobileAuth.routes.js`
  - `src/web-dashboard/backend/middleware/auth.js`
  - `src/web-dashboard/backend/app.js`

### 5. Enhanced Error Handling
- **Problem**: Poor error messages made debugging difficult
- **Fix**: Added detailed error logging and better error messages
- **File**: `src/MobileApp/screens/ReportScreen.tsx`

### 6. Authentication Testing
- **Problem**: No way to verify if authentication is working
- **Fix**: Added authentication test on component mount and a test button
- **File**: `src/MobileApp/screens/ReportScreen.tsx`

## How to Test

### Prerequisites
1. Make sure MongoDB is running locally on port 27017
2. Start the backend server: `cd src/web-dashboard/backend && npm start`
3. Start the mobile app: `cd src/MobileApp && npm start`

### Testing Steps
1. **Login to the mobile app** using any NIC and OTP (the backend uses mock authentication)
2. **Navigate to the Report screen**
3. **Test API Connection** using the green "Test API Connection" button
4. **Submit a report**:
   - Select a report type (food, shelter, danger, medical)
   - Enter a description
   - Tap "Submit Report"
   - Allow location access when prompted

### Expected Behavior
- The "Test API Connection" button should show a success message
- Report submission should show "Report submitted successfully"
- The report should be saved to the MongoDB database with location data

### Debugging
- Check the backend console for detailed logs
- Check the mobile app console for request/response logs
- If authentication fails, the app will redirect to login

## Database Schema
The reports collection now has this structure:
```javascript
{
  "_id": "ObjectId",
  "user_id": "String", // User ID from JWT token
  "disaster_id": "String", // Optional
  "type": "food | shelter | danger | medical",
  "description": "String",
  "image_url": "String", // Optional
  "location": {
    "lat": "Number",
    "lng": "Number"
  },
  "status": "pending | addressed",
  "timestamp": "ISODate"
}
```

## API Endpoints
- `GET /api/mobile/test` - Test authentication
- `POST /api/mobile/reports` - Submit a new report
- `GET /api/mobile/reports` - Get recent reports (requires authentication)
