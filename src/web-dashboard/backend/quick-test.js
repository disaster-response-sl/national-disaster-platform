const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function quickTestExamples() {
  console.log('🚀 Quick Test Examples for Key Endpoints\n');

  try {
    // Quick Test 1: Get critical priority reports
    console.log('🔴 Test 1: Critical Priority Reports');
    const criticalReports = await axios.get(`${BASE_URL}/map/reports?priority=critical&limit=5`);
    console.log(`Found ${criticalReports.data.count} critical priority reports`);
    console.log(`Sample critical report: ${criticalReports.data.data[0]?.type || 'None'} - ${criticalReports.data.data[0]?.description || 'No description'}\n`);

    // Quick Test 2: Heatmap for medical emergencies
    console.log('🏥 Test 2: Medical Emergency Heatmap');
    const medicalHeatmap = await axios.get(`${BASE_URL}/map/heatmap?type=medical&gridSize=0.02`);
    console.log(`Generated ${medicalHeatmap.data.data.length} heatmap points for medical reports`);
    const topMedical = medicalHeatmap.data.data[0];
    if (topMedical) {
      console.log(`Top medical hotspot: intensity ${topMedical.intensity.toFixed(2)} affecting ${topMedical.totalAffected} people\n`);
    }

    // Quick Test 3: Resource analysis summary
    console.log('📦 Test 3: Resource Requirements Overview');
    const resources = await axios.get(`${BASE_URL}/map/resource-analysis?limit=3`);
    console.log(`Resource analysis for ${resources.data.data.length} areas:`);
    console.log(`Total resources needed across all areas:`);
    const totalFood = resources.data.data.reduce((sum, area) => sum + area.resources.food, 0);
    const totalWater = resources.data.data.reduce((sum, area) => sum + area.resources.water, 0);
    const totalMedical = resources.data.data.reduce((sum, area) => sum + area.resources.medicalSupplies, 0);
    console.log(`• Food: ${totalFood} units`);
    console.log(`• Water: ${totalWater} units`);
    console.log(`• Medical supplies: ${totalMedical} units\n`);

    console.log('✅ Quick tests completed successfully!');

  } catch (error) {
    console.error('❌ Error in quick tests:', error.message);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  quickTestExamples();
}

module.exports = { quickTestExamples };
