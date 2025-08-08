# Web Dashboard Backend

This is the backend API for the National Disaster Platform web dashboard, providing map visualization, heatmap functionality, and comprehensive filtering capabilities for disaster reports and resource management.

## 🚀 Features

### Map Visualization
- **Geographic Report Display**: View all citizen reports on an interactive map
- **Heatmap Generation**: Visualize report density and intensity by geographic areas
- **Real-time Filtering**: Filter reports by type, status, priority, and date range
- **Geographic Bounds Filtering**: Limit data to specific map regions

### Resource Management
- **Resource Requirement Analysis**: Detailed breakdown of needed resources by area
- **Urgency Scoring**: Intelligent prioritization based on critical reports and affected people
- **Status Tracking**: Monitor pending vs addressed reports
- **Affected Population Tracking**: Track number of people affected by each report

### Analytics & Statistics
- **Comprehensive Statistics**: Reports by type, status, priority, and geographic spread
- **Dashboard Metrics**: Total reports, affected people, and critical incidents
- **Time-based Analysis**: Filter data by date ranges for trend analysis

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd src/web-dashboard/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/disaster-platform
   PORT=5000
   JWT_SECRET=your-secret-key-here
   ```

4. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the test suite to verify all endpoints are working:

```bash
npm test
```

This will test:
- Basic connectivity
- Reports endpoint
- Heatmap generation
- Resource analysis
- Statistics endpoint
- Disasters endpoint
- Filtering capabilities

## 📡 API Endpoints

### Map Visualization
- `GET /api/map/reports` - Get reports with geographic data
- `GET /api/map/heatmap` - Get heatmap data
- `GET /api/map/disasters` - Get disaster data

### Resource Analysis
- `GET /api/map/resource-analysis` - Get resource requirement analysis
- `GET /api/map/statistics` - Get dashboard statistics

### Authentication (Existing)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 5000 |
| `JWT_SECRET` | JWT signing secret | Required |

### Database Models

#### Report Model
```javascript
{
  user_id: String,
  disaster_id: String,
  type: String, // food, shelter, danger, medical, water, transportation, communication
  description: String,
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
  timestamp: Date
}
```

#### Disaster Model
```javascript
{
  type: String, // flood, landslide, cyclone
  severity: String, // low, medium, high
  description: String,
  location: {
    lat: Number,
    lng: Number
  },
  status: String, // active, resolved
  timestamp: Date
}
```

## 🗺️ Map Features

### Heatmap Generation
The heatmap endpoint aggregates reports by geographic grid and calculates:
- **Intensity**: Based on report count and priority
- **Affected Population**: Total people affected in each area
- **Report Types**: Types of reports in each area
- **Status Distribution**: Pending vs addressed reports

### Resource Analysis
The resource analysis provides:
- **Resource Requirements**: Detailed breakdown by area
- **Urgency Scoring**: Prioritization algorithm
- **Status Tracking**: Pending vs addressed reports
- **Critical Incident Tracking**: Number of critical priority reports

### Filtering Capabilities
All endpoints support filtering by:
- **Report Type**: food, shelter, danger, medical, water, transportation, communication
- **Status**: pending, addressed, in_progress
- **Priority**: low, medium, high, critical
- **Date Range**: startDate and endDate parameters
- **Geographic Bounds**: north, south, east, west coordinates

## 📊 Sample Data

The seed script creates:
- **50 sample reports** across Bangladesh with realistic coordinates
- **10 sample disasters** with various types and severities
- **Geographic clustering** for realistic heatmap visualization
- **Varied resource requirements** for comprehensive testing

## 🔍 Usage Examples

### Frontend Integration

```javascript
// Fetch reports for map markers
const fetchReports = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/map/reports?${params}`);
  return response.json();
};

// Fetch heatmap data
const fetchHeatmap = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/map/heatmap?${params}`);
  return response.json();
};

// Fetch resource analysis
const fetchAnalysis = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/map/resource-analysis?${params}`);
  return response.json();
};
```

### API Testing with curl

```bash
# Get all reports
curl http://localhost:5000/api/map/reports

# Get heatmap data
curl http://localhost:5000/api/map/heatmap?gridSize=0.02

# Get filtered reports
curl "http://localhost:5000/api/map/reports?status=pending&type=medical&priority=critical"

# Get resource analysis
curl http://localhost:5000/api/map/resource-analysis

# Get statistics
curl http://localhost:5000/api/map/statistics
```

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔄 Development

### Adding New Endpoints
1. Create new route file in `routes/` directory
2. Add route to `app.js`
3. Update API documentation
4. Add tests to `test-endpoints.js`

### Database Changes
1. Update model schemas in `models/` directory
2. Update seed data if needed
3. Test with existing endpoints

## 📝 API Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure all endpoints return consistent response formats

## 📞 Support

For issues or questions:
1. Check the API documentation
2. Run the test suite
3. Verify environment variables
4. Check MongoDB connection

---

**Built for the National Disaster Platform** 🌍

