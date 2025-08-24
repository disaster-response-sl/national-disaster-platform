# Map API Integration Guide (Frontend)

This document provides a comprehensive overview of the available `/api/map` endpoints for frontend integration, including request/response formats and usage examples.

---

## 1. Get Reports
- **Endpoint:** `GET /api/map/reports`
- **Query Params:** (optional) `status`, `type`, `priority`, `startDate`, `endDate`, `bounds`, `limit`
- **Example Request:**
```js
fetch('http://localhost:5000/api/map/reports')
  .then(res => res.json())
  .then(data => console.log(data));
```
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "location": {"lat": 37.42, "lng": -122.08, "country": "Bangladesh"},
      "resource_requirements": {"food": 0, "water": 0, ...},
      ...
    }
  ],
  "count": 1
}
```

---

## 2. Get Heatmap Data
- **Endpoint:** `GET /api/map/heatmap`
- **Query Params:** (optional) `type`, `status`, `priority`, `startDate`, `endDate`, `gridSize`
- **Example Request:**
```js
fetch('http://localhost:5000/api/map/heatmap')
  .then(res => res.json())
  .then(data => console.log(data));
```
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "count": 5,
      "totalAffected": 5,
      "avgPriority": 2,
      "types": ["danger"],
      "statuses": ["pending"],
      "lat": 6.9271,
      "lng": 79.8612,
      "intensity": 10
    }
  ]
}
```

---

## 3. Resource Analysis
- **Endpoint:** `GET /api/map/resource-analysis`
- **Example Request:**
```js
fetch('http://localhost:5000/api/map/resource-analysis')
  .then(res => res.json())
  .then(data => console.log(data));
```
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "totalReports": 1,
      "totalAffected": 46,
      "criticalReports": 1,
      "lat": 23.47,
      "lng": 91.17,
      "resources": {"food": 0, "water": 0, ...}
    }
  ]
}
```

---

## 4. Map Statistics
- **Endpoint:** `GET /api/map/statistics`
- **Example Request:**
```js
fetch('http://localhost:5000/api/map/statistics')
  .then(res => res.json())
  .then(data => console.log(data));
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "byType": [{"_id": "danger", "count": 15}, ...],
    ...
  }
}
```

---

## 5. List Disasters
- **Endpoint:** `GET /api/map/disasters`
- **Example Request:**
```js
fetch('http://localhost:5000/api/map/disasters')
  .then(res => res.json())
  .then(data => console.log(data));
```
- **Response:**
```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

---

## Notes
- All `/api/map` endpoints are read-only (GET only).
- All endpoints return JSON.
- Use query parameters to filter or aggregate data as needed.
- For CRUD operations on disasters or reports, use the appropriate admin or resource endpoints.

---

For more details or advanced usage, refer to the backend API documentation or contact the backend team.
