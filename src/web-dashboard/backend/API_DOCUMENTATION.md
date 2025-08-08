# Web Dashboard Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Map Visualization Endpoints

### 1. Get Reports for Map Visualization
**GET** `/map/reports`

Returns all reports with geographic data for map visualization with filtering capabilities.

**Query Parameters:**
- `status` (optional): Filter by status - `pending`, `addressed`, `in_progress`
- `type` (optional): Filter by report type - `food`, `shelter`, `danger`, `medical`, `water`, `transportation`, `communication`
- `priority` (optional): Filter by priority - `low`, `medium`, `high`, `critical`
- `startDate` (optional): Start date for filtering (ISO string)
- `endDate` (optional): End date for filtering (ISO string)
- `bounds` (optional): Geographic bounds object `{north, south, east, west}`
- `limit` (optional): Maximum number of reports to return (default: 1000)

**Example Request:**
```
GET /api/map/reports?status=pending&type=medical&priority=critical&limit=100
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "location": {
        "lat": 23.7937,
        "lng": 90.4066
      },
      "type": "medical",
      "status": "pending",
      "priority": "critical",
      "description": "Urgent medical assistance needed",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "affected_people": 25,
      "resource_requirements": {
        "food": 0,
        "water": 0,
        "medical_supplies": 15,
        "shelter": 0,
        "transportation": 2,
        "personnel": 5
      }
    }
  ],
  "count": 1
}
```

### 2. Get Heatmap Data
**GET** `/map/heatmap`

Returns aggregated heatmap data for geographic visualization with intensity calculations.

**Query Parameters:**
- `type` (optional): Filter by report type
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `gridSize` (optional): Grid size for aggregation (default: 0.01)

**Example Request:**
```
GET /api/map/heatmap?type=medical&gridSize=0.02
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "lat": 23.7937,
      "lng": 90.4066,
      "count": 5,
      "totalAffected": 125,
      "avgPriority": 3.2,
      "types": ["medical", "food"],
      "statuses": ["pending", "addressed"],
      "intensity": 16.0
    }
  ],
  "gridSize": 0.02
}
```

### 3. Get Resource Requirement Analysis
**GET** `/map/resource-analysis`

Returns detailed resource requirement analysis by geographic areas with urgency scoring.

**Query Parameters:**
- `type` (optional): Filter by report type
- `status` (optional): Filter by status
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering
- `bounds` (optional): Geographic bounds object

**Example Request:**
```
GET /api/map/resource-analysis?status=pending
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "lat": 23.7937,
      "lng": 90.4066,
      "totalReports": 10,
      "totalAffected": 250,
      "resources": {
        "food": 500,
        "water": 200,
        "medicalSupplies": 50,
        "shelter": 25,
        "transportation": 10,
        "personnel": 30
      },
      "status": {
        "pending": 7,
        "addressed": 3
      },
      "criticalReports": 3,
      "urgencyScore": 85
    }
  ],
  "summary": {
    "totalAreas": 15,
    "totalReports": 150,
    "totalAffected": 2500,
    "totalCritical": 25
  }
}
```

### 4. Get Dashboard Statistics
**GET** `/map/statistics`

Returns comprehensive statistics for dashboard filters and analytics.

**Query Parameters:**
- `startDate` (optional): Start date for filtering
- `endDate` (optional): End date for filtering

**Example Request:**
```
GET /api/map/statistics?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "byType": [
      { "_id": "medical", "count": 25 },
      { "_id": "food", "count": 20 },
      { "_id": "shelter", "count": 15 }
    ],
    "byStatus": [
      { "_id": "pending", "count": 35 },
      { "_id": "addressed", "count": 20 },
      { "_id": "in_progress", "count": 5 }
    ],
    "byPriority": [
      { "_id": "medium", "count": 30 },
      { "_id": "high", "count": 15 },
      { "_id": "critical", "count": 10 },
      { "_id": "low", "count": 5 }
    ],
    "totalReports": 60,
    "totalAffected": 1200,
    "geographicSpread": [
      {
        "_id": { "lat": 23.8, "lng": 90.4 },
        "count": 15
      }
    ]
  }
}
```

### 5. Get Disasters
**GET** `/map/disasters`

Returns disaster data with geographic information.

**Query Parameters:**
- `status` (optional): Filter by status - `active`, `resolved`
- `type` (optional): Filter by type - `flood`, `landslide`, `cyclone`
- `severity` (optional): Filter by severity - `low`, `medium`, `high`

**Example Request:**
```
GET /api/map/disasters?status=active&type=flood
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "location": {
        "lat": 23.7937,
        "lng": 90.4066
      },
      "type": "flood",
      "severity": "high",
      "description": "Major flooding in Dhaka area",
      "timestamp": "2024-01-15T08:00:00.000Z",
      "status": "active"
    }
  ],
  "count": 1
}
```

## Data Models

### Report Model
```javascript
{
  user_id: String,
  disaster_id: String,
  type: String, // food, shelter, danger, medical, water, transportation, communication
  description: String,
  image_url: String,
  status: String, // pending, addressed, in_progress
  priority: String, // low, medium, high, critical
  location: {
    lat: Number,
    lng: Number,
    address: String,
    city: String,
    state: String,
    country: String
  },
  resource_requirements: {
    food: Number,
    water: Number,
    medical_supplies: Number,
    shelter: Number,
    transportation: Number,
    personnel: Number
  },
  affected_people: Number,
  timestamp: Date,
  updated_at: Date
}
```

### Disaster Model
```javascript
{
  type: String, // flood, landslide, cyclone
  severity: String, // low, medium, high
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  timestamp: Date,
  status: String // active, resolved
}
```

## Usage Examples

### Frontend Integration Examples

#### 1. Fetching Reports for Map Markers
```javascript
const fetchReports = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/map/reports?${params}`);
  const data = await response.json();
  return data.data;
};

// Usage
const reports = await fetchReports({
  status: 'pending',
  type: 'medical',
  priority: 'critical'
});
```

#### 2. Fetching Heatmap Data
```javascript
const fetchHeatmapData = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/map/heatmap?${params}`);
  const data = await response.json();
  return data.data;
};

// Usage
const heatmapData = await fetchHeatmapData({
  type: 'medical',
  gridSize: 0.02
});
```

#### 3. Fetching Resource Analysis
```javascript
const fetchResourceAnalysis = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/map/resource-analysis?${params}`);
  const data = await response.json();
  return data;
};

// Usage
const analysis = await fetchResourceAnalysis({
  status: 'pending',
  bounds: { north: 25, south: 22, east: 93, west: 88 }
});
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Environment Variables:**
   Create a `.env` file with:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

3. **Seed Database:**
   ```bash
   npm run seed
   ```

4. **Start Server:**
   ```bash
   npm run dev
   ```

## Testing Endpoints

You can test the endpoints using curl or Postman:

```bash
# Test basic connectivity
curl http://localhost:5000/api/test

# Get reports
curl http://localhost:5000/api/map/reports

# Get heatmap data
curl http://localhost:5000/api/map/heatmap

# Get statistics
curl http://localhost:5000/api/map/statistics
```

