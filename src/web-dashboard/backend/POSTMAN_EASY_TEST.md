# 🧪 EASY POSTMAN TESTING - NO AUTH REQUIRED

**Base URL**: `http://localhost:5000`

## Quick Start Guide

### 1️⃣ CREATE a disaster
**POST** `http://localhost:5000/api/test/test-create`

```json
{
  "title": "Test Earthquake Alert",
  "type": "earthquake",
  "severity": "high",
  "description": "Test earthquake for Postman testing",
  "location": {
    "coordinates": [103.8198, 1.3521],
    "address": "Singapore"
  },
  "priority_level": "high",
  "incident_commander": "Test Commander",
  "contact_number": "+65-1234-5678",
  "public_alert": true,
  "evacuation_required": false,
  "zones": [
    {
      "zone_name": "Test Zone A",
      "zone_type": "residential",
      "coordinates": [[103.8, 1.35], [103.82, 1.35], [103.82, 1.37], [103.8, 1.37]],
      "estimated_population": 5000,
      "area_km2": 2.5
    }
  ]
}
```

### 2️⃣ READ all disasters
**GET** `http://localhost:5000/api/test/test-read`

*(No body required)*

### 3️⃣ GET list of disaster IDs (helper)
**GET** `http://localhost:5000/api/test/test-list-ids`

*(No body required - this will give you IDs to use for UPDATE/DELETE/GET ONE)*

### 4️⃣ UPDATE a disaster
**PUT** `http://localhost:5000/api/test/test-update/{DISASTER_ID}`

Replace `{DISASTER_ID}` with actual ID from step 3

```json
{
  "title": "UPDATED Test Earthquake Alert",
  "severity": "critical",
  "description": "Updated description for testing",
  "priority_level": "critical",
  "evacuation_required": true
}
```

### 5️⃣ GET ONE specific disaster
**GET** `http://localhost:5000/api/test/test-get-one/{DISASTER_ID}`

Replace `{DISASTER_ID}` with actual ID from step 3

*(No body required)*

### 6️⃣ DELETE (archive) a disaster
**DELETE** `http://localhost:5000/api/test/test-delete/{DISASTER_ID}`

Replace `{DISASTER_ID}` with actual ID from step 3

*(No body required)*

---

## 🚀 Testing Flow:

1. Start server: `node app.js` in backend folder
2. Create a disaster with POST
3. Get list of IDs to find your disaster ID
4. Test READ, UPDATE, GET ONE, DELETE with that ID

All responses include a `test_note` field to confirm you're using the test endpoints (no auth required).

---

## 📝 Response Format:
All responses follow this format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "...",
  "test_note": "This was created via test endpoint (no auth required)"
}
```

## ✅ Expected Results:
- CREATE: Returns 201 with new disaster object
- READ: Returns 200 with array of disasters
- UPDATE: Returns 200 with updated disaster object  
- DELETE: Returns 200 with archived disaster (status: 'archived')
- GET ONE: Returns 200 with single disaster object
