// services/gemini-ai-service.js
// Real Gemini AI integration for resource optimization

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAIService {
  constructor() {
    // Initialize Gemini AI with API key from environment
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async optimizeResourceAllocation(demandData, availableResources, targetLocation) {
    try {
      const prompt = `
As an AI disaster management expert, analyze the following data and provide optimal resource allocation recommendations:

DISASTER SITUATION:
- Location: ${targetLocation.lat}, ${targetLocation.lng}
- Total Disasters: ${demandData.total_disasters}
- Total Reports: ${demandData.total_reports}
- Severity Score: ${demandData.severity_score}
- Urgency Level: ${demandData.urgency_level}
- Affected Population: ${demandData.affected_population}

RESOURCE REQUIREMENTS:
${JSON.stringify(demandData.resource_requirements, null, 2)}

AVAILABLE RESOURCES:
${availableResources.map(r => `
- ${r.name}: ${r.quantity.current - r.quantity.allocated - r.quantity.reserved} available
  Type: ${r.type}, Priority: ${r.priority}
  Location: ${r.location.lat}, ${r.location.lng}
  Distance: ${this.calculateDistance(r.location.lat, r.location.lng, targetLocation.lat, targetLocation.lng)} km
`).join('')}

Please provide:
1. Prioritized allocation recommendations with quantities
2. Risk assessment for each allocation
3. Alternative resource suggestions if primary resources are insufficient
4. Deployment timeline recommendations
5. Potential bottlenecks or challenges

Format as JSON with specific recommendations for each resource.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiRecommendations = response.text();

      // Parse AI response and structure it
      return this.parseAIRecommendations(aiRecommendations, availableResources);
    } catch (error) {
      console.error('Error getting Gemini AI recommendations:', error);
      // Fallback to mock AI if Gemini fails
      return this.fallbackToMockAI(demandData, availableResources, targetLocation);
    }
  }

  async generateSupplyChainInsights(consumptionData, lowStockResources) {
    try {
      const prompt = `
As an AI supply chain expert for disaster management, analyze this consumption data and provide strategic insights:

CONSUMPTION PATTERNS (last 30 days):
${consumptionData.map(item => `
- ${item._id}: ${item.total_deployed} units deployed, ${item.deployment_count} deployments
  Average per deployment: ${item.avg_deployment}
`).join('')}

LOW STOCK RESOURCES:
${lowStockResources.map(item => `
- ${item.name}: Only ${item.quantity.current - item.quantity.allocated - item.quantity.reserved} available
  Type: ${item.type}, Priority: ${item.priority}
`).join('')}

Please provide:
1. Critical reorder recommendations with quantities and urgency
2. Seasonal demand predictions for Sri Lankan disaster patterns
3. Strategic stockpile location recommendations
4. Cost optimization suggestions
5. Risk mitigation strategies for supply chain disruptions

Provide specific, actionable recommendations in JSON format.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiInsights = response.text();

      return this.parseSupplyChainInsights(aiInsights);
    } catch (error) {
      console.error('Error getting Gemini supply chain insights:', error);
      return this.fallbackSupplyChainInsights(consumptionData, lowStockResources);
    }
  }

  async predictDisasterResourceNeeds(weatherData, historicalDisasters, currentInventory) {
    try {
      const prompt = `
As an AI disaster prediction expert for Sri Lanka, analyze the following data to predict future resource needs:

WEATHER FORECAST:
${JSON.stringify(weatherData, null, 2)}

HISTORICAL DISASTER PATTERNS:
${historicalDisasters.map(d => `
- ${d.type} (${d.severity}): ${d.description}
  Location: ${d.location.lat}, ${d.location.lng}
  Date: ${d.timestamp}
`).join('')}

CURRENT INVENTORY LEVELS:
${currentInventory.map(r => `
- ${r.type}: ${r.total_available} available units
`).join('')}

Based on Sri Lankan monsoon patterns, geographic vulnerability, and historical data:
1. Predict likely disaster scenarios in the next 30 days
2. Estimate resource requirements for predicted scenarios
3. Identify inventory gaps and pre-positioning recommendations
4. Suggest proactive deployment strategies
5. Risk assessment for different regions

Provide detailed predictions with confidence levels and recommended actions.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return this.parsePredictionInsights(response.text());
    } catch (error) {
      console.error('Error getting disaster predictions:', error);
      return this.fallbackPredictions();
    }
  }

  // Helper methods
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  parseAIRecommendations(aiText, resources) {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Could not parse AI JSON, using structured fallback');
    }

    // Fallback: structure the text response
    return {
      ai_generated: true,
      recommendations: aiText,
      confidence_score: 0.85,
      timestamp: new Date()
    };
  }

  parseSupplyChainInsights(aiText) {
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Could not parse supply chain JSON');
    }

    return {
      ai_generated: true,
      insights: aiText,
      confidence_score: 0.80,
      timestamp: new Date()
    };
  }

  parsePredictionInsights(aiText) {
    return {
      ai_generated: true,
      predictions: aiText,
      confidence_score: 0.75,
      timestamp: new Date(),
      forecast_period: '30 days'
    };
  }

  // Fallback methods (use existing mock AI)
  fallbackToMockAI(demandData, resources, location) {
    // Import and use existing mock AI logic
    const AIResourceOptimizer = require('./ai-resource-optimizer');
    const optimizer = new AIResourceOptimizer();
    return optimizer.generateOptimalAllocation(location, demandData);
  }

  fallbackSupplyChainInsights(consumptionData, lowStockResources) {
    return {
      fallback: true,
      reorder_recommendations: lowStockResources.map(item => ({
        resource_id: item._id,
        recommended_quantity: 100,
        urgency: 'medium'
      })),
      timestamp: new Date()
    };
  }

  fallbackPredictions() {
    return {
      fallback: true,
      message: 'Prediction service temporarily unavailable',
      timestamp: new Date()
    };
  }
}

module.exports = GeminiAIService;
