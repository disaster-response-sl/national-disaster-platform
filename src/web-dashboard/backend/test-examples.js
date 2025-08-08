const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTestExamples() {
  console.log('🌟 Additional Test Examples for Web Dashboard Backend Endpoints\n');

  try {
    // Example 1: Advanced Filtering with Multiple Parameters
    console.log('📍 Example 1: Advanced Filtering - Medical reports with high priority from last 3 days');
    console.log('Request: GET /api/map/reports?status=pending&type=medical&priority=high&limit=3');
    
    const advancedFilter = await axios.get(`${BASE_URL}/map/reports`, {
      params: {
        status: 'pending',
        type: 'medical',
        priority: 'high',
        limit: 3
      }
    });
    
    console.log(`✅ Found ${advancedFilter.data.count} high priority pending medical reports`);
    if (advancedFilter.data.data.length > 0) {
      const sample = advancedFilter.data.data[0];
      console.log(`   📋 Sample: ${sample.description}`);
      console.log(`   📍 Location: (${sample.location.lat.toFixed(4)}, ${sample.location.lng.toFixed(4)})`);
      console.log(`   👥 Affected people: ${sample.affected_people}`);
      console.log(`   🏥 Medical supplies needed: ${sample.resource_requirements.medical_supplies}`);
    }
    console.log('');

    // Example 2: Geographic Bounds Filtering
    console.log('📍 Example 2: Geographic Bounds Filtering - Reports within Dhaka region');
    console.log('Request: GET /api/map/reports?bounds={"north":24.0,"south":23.5,"east":90.5,"west":90.0}');
    
    const boundsFilter = await axios.get(`${BASE_URL}/map/reports`, {
      params: {
        bounds: JSON.stringify({
          north: 24.0,
          south: 23.5,
          east: 90.5,
          west: 90.0
        }),
        limit: 5
      }
    });
    
    console.log(`✅ Found ${boundsFilter.data.count} reports within Dhaka region bounds`);
    if (boundsFilter.data.data.length > 0) {
      boundsFilter.data.data.slice(0, 2).forEach((report, index) => {
        console.log(`   ${index + 1}. ${report.type} - ${report.status} at (${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)})`);
      });
    }
    console.log('');

    // Example 3: Heatmap with Custom Grid Size
    console.log('📍 Example 3: Custom Heatmap Generation - Fine-grained grid for detailed analysis');
    console.log('Request: GET /api/map/heatmap?type=food&gridSize=0.005&status=pending');
    
    const customHeatmap = await axios.get(`${BASE_URL}/map/heatmap`, {
      params: {
        type: 'food',
        gridSize: 0.005,
        status: 'pending'
      }
    });
    
    console.log(`✅ Generated ${customHeatmap.data.data.length} heatmap points for pending food reports`);
    console.log(`   🔥 Grid size: ${customHeatmap.data.gridSize}`);
    if (customHeatmap.data.data.length > 0) {
      const topIntensity = customHeatmap.data.data[0];
      console.log(`   🌡️ Highest intensity area: ${topIntensity.intensity.toFixed(2)}`);
      console.log(`   📍 Location: (${topIntensity.lat.toFixed(4)}, ${topIntensity.lng.toFixed(4)})`);
      console.log(`   📊 ${topIntensity.count} reports affecting ${topIntensity.totalAffected} people`);
      console.log(`   🏷️ Types in area: ${topIntensity.types.join(', ')}`);
    }
    console.log('');

    // Example 4: Resource Analysis with Status Filter
    console.log('📍 Example 4: Resource Analysis - Focus on pending requests only');
    console.log('Request: GET /api/map/resource-analysis?status=pending');
    
    const pendingResources = await axios.get(`${BASE_URL}/map/resource-analysis`, {
      params: {
        status: 'pending'
      }
    });
    
    console.log(`✅ Analyzed ${pendingResources.data.data.length} areas with pending resource requests`);
    console.log(`📊 Summary:`);
    console.log(`   • Total reports: ${pendingResources.data.summary.totalReports}`);
    console.log(`   • Total affected people: ${pendingResources.data.summary.totalAffected}`);
    console.log(`   • Critical incidents: ${pendingResources.data.summary.totalCritical}`);
    
    if (pendingResources.data.data.length > 0) {
      const urgentArea = pendingResources.data.data[0];
      console.log(`   🚨 Most urgent area (urgency score: ${urgentArea.urgencyScore}):`);
      console.log(`   📍 Location: (${urgentArea.lat.toFixed(4)}, ${urgentArea.lng.toFixed(4)})`);
      console.log(`   🏥 Resources needed:`);
      console.log(`      - Food: ${urgentArea.resources.food}`);
      console.log(`      - Water: ${urgentArea.resources.water}`);
      console.log(`      - Medical supplies: ${urgentArea.resources.medicalSupplies}`);
      console.log(`      - Personnel: ${urgentArea.resources.personnel}`);
    }
    console.log('');

    // Example 5: Time-based Statistics
    console.log('📍 Example 5: Time-based Statistics - Reports from the last 3 days');
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    console.log(`Request: GET /api/map/statistics?startDate=${threeDaysAgo.toISOString()}`);
    
    const recentStats = await axios.get(`${BASE_URL}/map/statistics`, {
      params: {
        startDate: threeDaysAgo.toISOString()
      }
    });
    
    console.log(`✅ Statistics for reports from last 3 days:`);
    console.log(`   📊 Total reports: ${recentStats.data.data.totalReports}`);
    console.log(`   👥 Total people affected: ${recentStats.data.data.totalAffected}`);
    console.log(`   🏷️ By type:`);
    recentStats.data.data.byType.slice(0, 5).forEach(type => {
      console.log(`      - ${type._id}: ${type.count} reports`);
    });
    console.log(`   📋 By status:`);
    recentStats.data.data.byStatus.forEach(status => {
      console.log(`      - ${status._id}: ${status.count} reports`);
    });
    console.log(`   ⚠️ By priority:`);
    recentStats.data.data.byPriority.forEach(priority => {
      console.log(`      - ${priority._id}: ${priority.count} reports`);
    });
    console.log('');

    // Example 6: Disaster Filtering
    console.log('📍 Example 6: Disaster Information - Active disasters with high severity');
    console.log('Request: GET /api/map/disasters?status=active&severity=high');
    
    const activeDisasters = await axios.get(`${BASE_URL}/map/disasters`, {
      params: {
        status: 'active',
        severity: 'high'
      }
    });
    
    console.log(`✅ Found ${activeDisasters.data.count} active high-severity disasters`);
    if (activeDisasters.data.data.length > 0) {
      activeDisasters.data.data.forEach((disaster, index) => {
        console.log(`   ${index + 1}. ${disaster.type} - ${disaster.severity} severity`);
        console.log(`      📍 Location: (${disaster.location.lat.toFixed(4)}, ${disaster.location.lng.toFixed(4)})`);
        console.log(`      📝 Description: ${disaster.description}`);
        console.log(`      📅 Time: ${new Date(disaster.timestamp).toLocaleString()}`);
      });
    }
    console.log('');

    console.log('🎉 All test examples completed successfully!\n');
    
    // Summary of all capabilities
    console.log('📋 Summary of API Capabilities Demonstrated:');
    console.log('   ✅ Multi-parameter filtering (status, type, priority)');
    console.log('   ✅ Geographic bounds filtering');
    console.log('   ✅ Custom heatmap grid sizing');
    console.log('   ✅ Resource requirement analysis');
    console.log('   ✅ Time-based filtering and statistics');
    console.log('   ✅ Disaster information retrieval');
    console.log('   ✅ Data aggregation and sorting');
    console.log('   ✅ Urgency scoring and prioritization');

  } catch (error) {
    console.error('❌ Error in test examples:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTestExamples();
}

module.exports = { runTestExamples };
