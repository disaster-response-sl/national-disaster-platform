# Resource Management API Documentation

## Overview

The Resource Management API provides comprehensive functionality for managing disaster relief resources including inventory tracking, AI-powered allocation recommendations, supply chain management, and deployment tracking.

## Base URL
```
/api/resources
```

## Authentication
All endpoints require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Role-based Access Control
- **Citizen**: Read-only access to public resource information
- **Responder**: Full CRUD operations except deletion
- **Admin**: Full access including deletion and bulk operations

---

## Endpoints

### 1. Get All Resources
**GET** `/api/resources`

Retrieve all resources with filtering, pagination, and geographic search.

**Query Parameters:**
- `type` (string): Filter by resource type (medicine, food, shelter, water, etc.)
- `category` (string): Filter by category (emergency, medical, basic_needs, etc.)
- `status` (string): Filter by status (available, dispatched, depleted, etc.)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `location` (string): Geographic center point as "lat,lng"
- `radius` (number): Search radius in kilometers (default: 50)
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Sort field (default: created_at)
- `sortOrder` (string): Sort order - asc/desc (default: desc)

**Example:**
```bash
GET /api/resources?type=medical_supplies&status=available&location=6.9271,79.8612&radius=25&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Emergency Medical Kit - Type A",
      "type": "medical_supplies",
      "category": "medical",
      "quantity": {
        "current": 150,
        "allocated": 20,
        "reserved": 10,
        "unit": "pieces"
      },
      "status": "available",
      "priority": "high",
      "location": {
        "lat": 6.9271,
        "lng": 79.8612,
        "address": "Colombo General Hospital",
        "facility_name": "National Medical Warehouse"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 47,
    "items_per_page": 10
  }
}
```

### 2. Get Specific Resource
**GET** `/api/resources/{id}`

Retrieve detailed information about a specific resource.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Emergency Medical Kit - Type A",
    "deployment_history": [...],
    "supply_chain": {...},
    "ai_recommendations": {...}
  }
}
```

### 3. Create New Resource
**POST** `/api/resources` 🔒 *Requires Responder role*

Create a new resource entry.

**Request Body:**
```json
{
  "name": "Emergency Tents",
  "type": "shelter",
  "category": "basic_needs",
  "quantity": {
    "current": 100,
    "unit": "pieces"
  },
  "priority": "medium",
  "location": {
    "lat": 6.0367,
    "lng": 80.2170,
    "address": "Galle Emergency Center",
    "facility_name": "Southern Region Depot",
    "city": "Galle",
    "district": "Galle",
    "province": "Southern"
  },
  "supplier": {
    "name": "Shelter Solutions Lanka",
    "contact": "+94912345678",
    "organization": "Emergency Shelter Corp"
  },
  "specifications": {
    "description": "Waterproof emergency tents for 4-6 people",
    "manufacturer": "Lanka Tent Manufacturing"
  }
}
```

### 4. Update Resource
**PUT** `/api/resources/{id}` 🔒 *Requires Responder role*

Update an existing resource.

### 5. Delete Resource
**DELETE** `/api/resources/{id}` 🔒 *Requires Admin role*

Delete a resource (use with caution).

---

## Resource Allocation & Deployment

### 6. Allocate Resource
**POST** `/api/resources/{id}/allocate` 🔒 *Requires Responder role*

Allocate a resource to a specific disaster or location.

**Request Body:**
```json
{
  "quantity": 50,
  "disaster_id": "DIS001",
  "location": {
    "lat": 6.6847,
    "lng": 80.4025,
    "address": "Ratnapura Flood Area"
  },
  "estimated_duration": 48
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resource allocated successfully",
  "data": {
    "allocated_quantity": 50,
    "remaining_available": 75,
    "deployment_id": "64f1a2b3c4d5e6f7a8b9c0d2"
  }
}
```

### 7. Reserve Resource
**POST** `/api/resources/{id}/reserve` 🔒 *Requires Responder role*

Reserve a resource for future allocation.

**Request Body:**
```json
{
  "quantity": 25,
  "reason": "Anticipated cyclone in the area",
  "reserved_until": "2025-08-15T23:59:59Z"
}
```

### 8. Complete Deployment
**POST** `/api/resources/{id}/complete-deployment` 🔒 *Requires Responder role*

Mark a deployment as completed and free up allocated quantities.

**Request Body:**
```json
{
  "deployment_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "actual_duration": 36,
  "notes": "Successfully distributed to affected families"
}
```

---

## AI-Powered Features

### 9. AI Allocation Optimization
**POST** `/api/resources/ai/optimize-allocation`

Get AI-powered recommendations for optimal resource allocation.

**Request Body:**
```json
{
  "location": {
    "lat": 6.6847,
    "lng": 80.4025
  },
  "radius": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "target_location": {...},
    "demand_analysis": {
      "total_disasters": 2,
      "total_reports": 15,
      "severity_score": 45,
      "urgency_level": "high",
      "resource_requirements": {
        "food": 300,
        "water": 500,
        "medical_supplies": 100
      }
    },
    "optimization_results": {
      "recommendations": [
        {
          "resource_id": "...",
          "resource_name": "Emergency Food Packets",
          "allocation_score": 87.5,
          "recommended_quantity": 75,
          "estimated_deployment_time": "2.5 hours",
          "deployment_priority": 95
        }
      ]
    }
  }
}
```

### 10. Supply Chain Optimization
**GET** `/api/resources/ai/supply-chain-optimization` 🔒 *Requires Responder role*

Get AI recommendations for supply chain management and reordering.

**Query Parameters:**
- `timeframe` (number): Analysis timeframe in days (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "consumption_analysis": [...],
    "low_stock_alerts": [...],
    "reorder_recommendations": [
      {
        "resource_id": "...",
        "resource_name": "Emergency Blankets",
        "current_available": 2,
        "recommended_reorder_quantity": 200,
        "urgency": "high",
        "estimated_stockout_date": "Within 1 week"
      }
    ],
    "optimization_suggestions": [...]
  }
}
```

---

## Analytics & Reporting

### 11. Inventory Summary
**GET** `/api/resources/inventory/summary`

Get comprehensive inventory statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "by_type": [
      {
        "_id": "medical_supplies",
        "total_resources": 25,
        "total_quantity": 5000,
        "statuses": [...]
      }
    ],
    "overall": {
      "total_resources": 157,
      "total_quantity": 12500,
      "critical_resources": 8,
      "depleted_resources": 3
    }
  }
}
```

### 12. Dashboard Metrics
**GET** `/api/resources/dashboard/metrics`

Get comprehensive metrics for dashboard display.

**Query Parameters:**
- `timeframe` (number): Analysis timeframe in days (default: 7)

### 13. Supply Chain Status
**GET** `/api/resources/supply-chain/status`

Track procurement and supply chain status.

**Query Parameters:**
- `status` (string): Filter by procurement status
- `vendor_id` (string): Filter by vendor

### 14. Deployment Tracking
**GET** `/api/resources/deployment/tracking`

Track resource deployments across disasters.

**Query Parameters:**
- `disaster_id` (string): Filter by disaster
- `status` (string): Filter by deployment status
- `start_date` (string): Start date for filtering
- `end_date` (string): End date for filtering

---

## Bulk Operations

### 15. Bulk Status Update
**POST** `/api/resources/bulk/update-status` 🔒 *Requires Responder role*

Update status for multiple resources at once.

**Request Body:**
```json
{
  "resource_ids": [
    "64f1a2b3c4d5e6f7a8b9c0d1",
    "64f1a2b3c4d5e6f7a8b9c0d2"
  ],
  "new_status": "maintenance",
  "reason": "Routine maintenance check"
}
```

---

## Data Models

### Resource Schema
```javascript
{
  name: String,              // Resource name
  type: String,              // medicine, food, shelter, water, etc.
  category: String,          // emergency, medical, basic_needs, etc.
  quantity: {
    current: Number,         // Total quantity
    allocated: Number,       // Currently allocated
    reserved: Number,        // Reserved for future use
    unit: String            // pieces, kg, liters, etc.
  },
  status: String,           // available, dispatched, depleted, etc.
  priority: String,         // low, medium, high, critical
  location: {
    lat: Number,
    lng: Number,
    address: String,
    facility_name: String,
    city: String,
    district: String,
    province: String
  },
  supplier: {
    name: String,
    contact: String,
    organization: String
  },
  deployment_history: [{
    deployed_to: {
      disaster_id: String,
      location: Object
    },
    quantity_deployed: Number,
    deployed_at: Date,
    deployed_by: String,
    status: String,
    estimated_duration: Number,
    actual_duration: Number
  }],
  supply_chain: {
    procurement_status: String,
    expected_delivery: Date,
    tracking_number: String,
    vendor_id: String
  },
  specifications: {
    description: String,
    expiry_date: Date,
    batch_number: String,
    manufacturer: String,
    storage_requirements: String
  },
  ai_recommendations: {
    optimal_allocation: Number,
    deployment_priority: Number,
    risk_assessment: String,
    alternative_resources: [String]
  }
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Usage Examples

### Example: Emergency Response Flow

1. **Analyze situation and get AI recommendations:**
```bash
POST /api/resources/ai/optimize-allocation
{
  "location": {"lat": 6.6847, "lng": 80.4025},
  "radius": 50
}
```

2. **Allocate recommended resources:**
```bash
POST /api/resources/64f1a2b3c4d5e6f7a8b9c0d1/allocate
{
  "quantity": 75,
  "disaster_id": "FLOOD_2025_001",
  "location": {"lat": 6.6847, "lng": 80.4025, "address": "Ratnapura"}
}
```

3. **Track deployment:**
```bash
GET /api/resources/deployment/tracking?disaster_id=FLOOD_2025_001
```

4. **Complete deployment:**
```bash
POST /api/resources/64f1a2b3c4d5e6f7a8b9c0d1/complete-deployment
{
  "deployment_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "actual_duration": 36
}
```

### Example: Supply Chain Management

1. **Check low stock alerts:**
```bash
GET /api/resources/ai/supply-chain-optimization?timeframe=30
```

2. **Bulk update status for maintenance:**
```bash
POST /api/resources/bulk/update-status
{
  "resource_ids": ["id1", "id2", "id3"],
  "new_status": "maintenance",
  "reason": "Quarterly maintenance"
}
```

---

## Seeding Sample Data

To populate the database with sample resources for testing:

```bash
node src/web-dashboard/backend/seeders/resource-seeder.js
```

This will create sample resources including medical supplies, food, water, shelter materials, personnel, and transportation resources across different locations in Sri Lanka.

---

## AI Features Explanation

### Allocation Optimization Algorithm
The AI allocation system considers:
- **Priority Weight (30%)**: Resource priority level
- **Distance Weight (25%)**: Geographic proximity to need
- **Quantity Needed (20%)**: Demand vs. availability ratio
- **Resource Availability (15%)**: Current stock levels
- **Deployment Speed (10%)**: How quickly resource can be deployed

### Supply Chain Intelligence
- Consumption pattern analysis
- Predictive reordering recommendations
- Stockout date estimation
- Vendor performance tracking
- Cost optimization suggestions

---

This API provides a comprehensive foundation for disaster resource management with advanced AI capabilities for optimization and predictive analytics.
