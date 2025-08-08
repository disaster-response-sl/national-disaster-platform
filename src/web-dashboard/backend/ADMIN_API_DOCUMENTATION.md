# Admin Disaster Management API Documentation

## Overview
This API provides comprehensive disaster management capabilities for administrators, including CRUD operations, zone management, analytics, and bulk import/export functionality.

## Authentication
All admin endpoints require authentication via JWT token and admin role.

```javascript
Headers: {
  "Authorization": "Bearer <admin-jwt-token>",
  "Content-Type": "application/json"
}
```

## Base URL
```
http://localhost:5000/api/admin/disasters
```

## Core CRUD Operations

### 1. Create Disaster
**POST** `/`

Creates a new disaster with zones, resources, and administrative details.

**Request Body:**
```json
{
  "title": "Severe Flooding in Colombo",
  "type": "flood",
  "severity": "high",
  "description": "Heavy monsoon rains causing severe flooding",
  "location": { "lat": 6.9271, "lng": 79.8612 },
  "zones": [
    {
      "zone_name": "Colombo Central",
      "boundary_coordinates": [
        [6.9271, 79.8612],
        [6.9371, 79.8612],
        [6.9371, 79.8712],
        [6.9271, 79.8712],
        [6.9271, 79.8612]
      ],
      "estimated_population": 50000,
      "area_km2": 10.5,
      "risk_level": "high"
    }
  ],
  "priority_level": "high",
  "incident_commander": "Commander Silva",
  "contact_number": "+94771234567",
  "reporting_agency": "SLDDMC",
  "public_alert": true,
  "alert_message": "Severe flooding alert for Colombo area",
  "evacuation_required": true,
  "evacuation_zones": ["Colombo Central"],
  "assigned_teams": ["Rescue Team Alpha"],
  "estimated_duration": 72
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "disaster_id",
    "disaster_code": "DIS-2025-000001",
    "title": "Severe Flooding in Colombo",
    "zones": [...],
    "resources_required": {
      "personnel": 100,
      "vehicles": 20,
      "food_supplies": 12500,
      "water_supplies": 75000
    },
    "createdAt": "2025-08-08T...",
    "total_affected_population": 50000,
    "total_area_km2": 10.5
  },
  "warnings": ["Zone overlap warning..."],
  "message": "Disaster created successfully"
}
```

### 2. Get Disasters List
**GET** `/?status=active&type=flood&page=1&limit=20`

**Query Parameters:**
- `status`: active, monitoring, resolved, archived
- `type`: flood, landslide, cyclone, fire, earthquake, drought, tsunami
- `severity`: low, medium, high, critical
- `priority_level`: low, medium, high, critical, emergency
- `startDate`: ISO date string
- `endDate`: ISO date string
- `zone`: Zone name search
- `search`: Text search across title, description, disaster_code
- `sortBy`: createdAt, updatedAt, priority_level, severity
- `sortOrder`: asc, desc
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": [...disasters],
  "pagination": {
    "total": 150,
    "page": 1,
    "pages": 8,
    "limit": 20
  },
  "summary": {
    "total_disasters": 150,
    "active": 45,
    "resolved": 100,
    "critical": 5
  }
}
```

### 3. Get Specific Disaster
**GET** `/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "disaster_id",
    "disaster_code": "DIS-2025-000001",
    "title": "Severe Flooding in Colombo",
    "zones": [...],
    "resources_required": {...},
    "created_by": {
      "name": "Admin User",
      "role": "admin"
    }
  },
  "computed": {
    "total_affected_population": 75000,
    "total_area_km2": 25.7,
    "is_critical": true,
    "duration_hours": 36
  }
}
```

### 4. Update Disaster
**PUT** `/:id`

Updates all or partial disaster information.

### 5. Update Status Only
**PATCH** `/:id/status`

**Request Body:**
```json
{
  "status": "resolved",
  "response_status": "completed",
  "actual_duration": 48
}
```

### 6. Delete Disaster (Archive)
**DELETE** `/:id?permanent=false`

Soft deletes (archives) by default. Use `permanent=true` for hard delete.

## Zone Management

### Add Zone to Disaster
**POST** `/:id/zones`

**Request Body:**
```json
{
  "zone_name": "New Zone",
  "boundary_coordinates": [[lat, lng], ...],
  "estimated_population": 25000,
  "area_km2": 5.5,
  "risk_level": "medium"
}
```

### Update Zone
**PUT** `/:id/zones/:zoneId`

### Delete Zone
**DELETE** `/:id/zones/:zoneId`

### Get All Zones for Disaster
**GET** `/:id/zones`

### Get Specific Zone
**GET** `/:id/zones/:zoneId`

## Analytics & Reports

### Dashboard Statistics
**GET** `/statistics?startDate=2025-01-01&endDate=2025-12-31`

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_disasters": 150,
      "total_affected_population": 500000,
      "total_area_km2": 1250.5,
      "average_duration_hours": 48.5,
      "total_personnel_required": 2500,
      "total_vehicles_required": 500
    },
    "by_status": [
      { "_id": "active", "count": 45 },
      { "_id": "resolved", "count": 100 }
    ],
    "by_type": [...],
    "by_severity": [...],
    "recent_activity": [...],
    "monthly_trend": [...]
  }
}
```

### Timeline View
**GET** `/timeline?startDate=2025-01-01&limit=50`

### Zone Overlap Detection
**GET** `/zones-overlap`

**Response:**
```json
{
  "success": true,
  "data": {
    "overlaps": [
      {
        "disaster1": {
          "code": "DIS-2025-000001",
          "zone": "Zone A"
        },
        "disaster2": {
          "code": "DIS-2025-000002",
          "zone": "Zone B"
        },
        "overlap_type": "zone_name_similarity",
        "requires_attention": true
      }
    ],
    "total_overlaps": 3,
    "critical_overlaps": 1
  }
}
```

### Resource Summary
**GET** `/resource-summary?status=active,monitoring`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_active_disasters": 45,
      "critical_disasters": 5
    },
    "personnel": {
      "total_personnel": 2500,
      "rescue_teams": 150,
      "medical_units": 200
    },
    "equipment": {
      "vehicles": 500,
      "boats": 50,
      "helicopters": 25
    },
    "supplies": {
      "food_supplies_kg": 125000,
      "water_supplies_liters": 750000,
      "medical_supplies": 5000,
      "temporary_shelters": 2500
    }
  }
}
```

## Bulk Operations

### Bulk Status Update
**PATCH** `/bulk-status`

**Request Body:**
```json
{
  "disaster_ids": ["id1", "id2", "id3"],
  "status": "resolved",
  "response_status": "completed"
}
```

## Import/Export

### Import Disasters
**POST** `/import`

**Request Body:**
```json
{
  "data": [
    {
      "title": "Imported Disaster",
      "type": "flood",
      "severity": "medium",
      "description": "Disaster from import"
    }
  ],
  "format": "json",
  "overwrite": false
}
```

### Export Disasters
**GET** `/export?format=csv&status=active&includeZones=true`

**Query Parameters:**
- `format`: json, csv
- `status`: Filter by status
- `type`: Filter by type
- `includeZones`: Include zone data
- `includeResources`: Include resource data

### Download Import Template
**GET** `/template?format=csv`

## Data Models

### Enhanced Disaster Schema
```javascript
{
  // Basic info
  disaster_code: "DIS-2025-000001", // Auto-generated
  title: String,
  type: "flood|landslide|cyclone|fire|earthquake|drought|tsunami",
  severity: "low|medium|high|critical",
  description: String,
  location: { lat: Number, lng: Number },
  status: "active|monitoring|resolved|archived",
  
  // Zones
  zones: [{
    zone_name: String,
    boundary_coordinates: [[Number]], // [lat, lng] pairs
    estimated_population: Number,
    area_km2: Number,
    risk_level: "low|medium|high|critical"
  }],
  
  // Resources
  resources_required: {
    personnel: Number,
    rescue_teams: Number,
    medical_units: Number,
    vehicles: Number,
    boats: Number,
    helicopters: Number,
    food_supplies: Number, // kg
    water_supplies: Number, // liters
    medical_supplies: Number,
    temporary_shelters: Number
  },
  
  // Management
  priority_level: "low|medium|high|critical|emergency",
  response_status: "preparing|responding|recovery|completed",
  incident_commander: String,
  contact_number: String,
  reporting_agency: String,
  assigned_teams: [String],
  estimated_duration: Number, // hours
  actual_duration: Number, // hours
  
  // Public alerts
  public_alert: Boolean,
  alert_message: String,
  evacuation_required: Boolean,
  evacuation_zones: [String],
  
  // Metadata
  created_by: ObjectId,
  updated_by: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `207` - Partial success (bulk operations)
- `400` - Bad request / validation error
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - Not found
- `500` - Server error

## Usage Examples

### Create a Complete Disaster
```javascript
const response = await axios.post('/api/admin/disasters', {
  title: 'Emergency Flood Response',
  type: 'flood',
  severity: 'critical',
  description: 'Severe flooding requiring immediate response',
  zones: [
    {
      zone_name: 'Critical Zone 1',
      boundary_coordinates: [[6.9271, 79.8612], [6.9371, 79.8612], [6.9371, 79.8712], [6.9271, 79.8712], [6.9271, 79.8612]],
      estimated_population: 10000,
      risk_level: 'critical'
    }
  ],
  priority_level: 'emergency',
  evacuation_required: true,
  public_alert: true
}, {
  headers: { Authorization: `Bearer ${adminToken}` }
});
```

### Get Dashboard Statistics
```javascript
const stats = await axios.get('/api/admin/disasters/statistics', {
  headers: { Authorization: `Bearer ${adminToken}` }
});
```

### Bulk Status Update
```javascript
await axios.patch('/api/admin/disasters/bulk-status', {
  disaster_ids: ['id1', 'id2', 'id3'],
  status: 'resolved'
}, {
  headers: { Authorization: `Bearer ${adminToken}` }
});
```

## Best Practices

1. **Always validate zone coordinates** - Ensure polygons have at least 3 points
2. **Use disaster codes for references** - More stable than database IDs
3. **Regular resource calculations** - Update resource requirements when zones change
4. **Monitor overlapping zones** - Check for conflicts in critical areas
5. **Bulk operations for efficiency** - Use bulk updates for large datasets
6. **Export before major changes** - Backup data before bulk modifications
