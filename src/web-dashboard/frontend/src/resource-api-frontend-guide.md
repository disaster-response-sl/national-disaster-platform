# National Disaster Platform: Resource API Frontend Integration Guide

This guide provides a comprehensive reference for integrating the Resource Management API endpoints into your frontend application. It covers all available endpoints under `/api/resources`, including request/response structures, authentication requirements, and usage notes.

---

## Authentication
All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Endpoints Overview

### 1. Get All Resources
- **Endpoint:** `GET /api/resources`
- **Query Params:**
  - `type`, `category`, `status`, `priority`, `location` ("lat,lng"), `radius`, `page`, `limit`, `sortBy`, `sortOrder`
- **Response:**
```
{
  success: true,
  data: [ ...resources ],
  pagination: { ... }
}
```

### 2. Get Resource by ID
- **Endpoint:** `GET /api/resources/:id`
- **Response:**
```
{
  success: true,
  data: { ...resource }
}
```

### 3. Create Resource
- **Endpoint:** `POST /api/resources`
- **Body:** `{ name, type, category, quantity, location, ... }`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  message: 'Resource created successfully',
  data: { ...resource }
}
```

### 4. Update Resource
- **Endpoint:** `PUT /api/resources/:id`
- **Body:** `{ ...fields to update }`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  message: 'Resource updated successfully',
  data: { ...resource }
}
```

### 5. Delete Resource
- **Endpoint:** `DELETE /api/resources/:id`
- **Roles:** Admin
- **Response:**
```
{
  success: true,
  message: 'Resource deleted successfully'
}
```

### 6. Allocate Resource
- **Endpoint:** `POST /api/resources/:id/allocate`
- **Body:** `{ quantity, disaster_id, location, estimated_duration }`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  message: 'Resource allocated successfully',
  data: { allocated_quantity, remaining_available, deployment_id }
}
```

### 7. Reserve Resource
- **Endpoint:** `POST /api/resources/:id/reserve`
- **Body:** `{ quantity, reason, reserved_until }`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  message: 'Resource reserved successfully',
  data: { reserved_quantity, remaining_available, reserved_until }
}
```

### 8. Inventory Summary
- **Endpoint:** `GET /api/resources/inventory/summary`
- **Response:**
```
{
  success: true,
  data: { by_type: [...], overall: {...}, last_updated }
}
```

### 9. AI Allocation Recommendations
- **Endpoint:** `GET /api/resources/analytics/allocation`
- **Query:** `disaster_id` or `location`
- **Response:**
```
{
  success: true,
  data: { demand_analysis, recommendations, generated_at }
}
```

### 10. Supply Chain Status
- **Endpoint:** `GET /api/resources/supply-chain/status`
- **Query:** `status`, `vendor_id`
- **Response:**
```
{
  success: true,
  data: { resources: [...], status_summary: [...], last_updated }
}
```

### 11. Deployment Tracking
- **Endpoint:** `GET /api/resources/deployment/tracking`
- **Query:** `disaster_id`, `status`, `start_date`, `end_date`
- **Response:**
```
{
  success: true,
  data: [...],
  filters_applied: {...}
}
```

### 12. Bulk Update Resource Status
- **Endpoint:** `POST /api/resources/bulk/update-status`
- **Body:** `{ resource_ids: [ ... ], new_status, reason }`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  message: 'Bulk status update completed',
  data: { matched_count, modified_count, reason }
}
```

### 13. AI Optimize Allocation
- **Endpoint:** `POST /api/resources/ai/optimize-allocation`
- **Body:** `{ location: { lat, lng }, radius }`
- **Response:**
```
{
  success: true,
  data: { target_location, demand_analysis, optimization_results }
}
```

### 14. AI Supply Chain Optimization
- **Endpoint:** `GET /api/resources/ai/supply-chain-optimization`
- **Query:** `timeframe`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  data: { ...optimization }
}
```

### 15. Dashboard Metrics
- **Endpoint:** `GET /api/resources/dashboard/metrics`
- **Query:** `timeframe`
- **Response:**
```
{
  success: true,
  data: { overview: {...}, breakdown: {...}, performance: {...}, generated_at }
}
```

### 16. Complete Deployment
- **Endpoint:** `POST /api/resources/:id/complete-deployment`
- **Body:** `{ deployment_id, actual_duration, notes }`
- **Roles:** Responder/Admin
- **Response:**
```
{
  success: true,
  message: 'Deployment marked as completed',
  data: { deployment, resource_status, remaining_allocated }
}
```

---

## API Call Example (Fetch)
```js
fetch('/api/resources', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Notes
- All endpoints return a `success` boolean and may include `message` and `data` fields.
- Error responses include `success: false` and an `error` message.
- Some endpoints require Responder/Admin roles (see above).
- For geospatial queries, use `{ location: { lat, lng } }` or `location` query param as specified.

---

For further details, refer to backend API documentation or contact the backend team.
