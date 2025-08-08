// Test script for Gemini API integration
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');

async function testGeminiIntegration() {
  try {
    console.log('Testing Gemini API integration...');
    
    // Initialize Gemini model - using flash for better rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Test query
    const testQuery = "What should I do in an earthquake?";
    
    console.log('Sending test query:', testQuery);

    // Use simple generateContent to reduce token usage
    const prompt = `You are an AI Safety Assistant. User asks: ${testQuery}. Provide a concise, helpful response.`;
    
    // Send test message
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('\n✅ Gemini API Test Successful!');
    console.log('\nTest Query:', testQuery);
    console.log('\nAI Response:');
    console.log(text);
    
    // Test safety analysis
    const safetyAnalysis = analyzeSafetyLevel(testQuery, text);
    console.log('\nSafety Analysis:', safetyAnalysis);
    
    // Test recommendations extraction
    const recommendations = extractRecommendations(text);
    console.log('\nRecommendations:', recommendations);

  } catch (error) {
    console.error('❌ Gemini API Test Failed:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Set GEMINI_API_KEY in your .env file');
    console.log('2. Have a valid Gemini API key from Google AI Studio');
    console.log('3. Have an active internet connection');
  }
}

// Helper function to analyze safety level
function analyzeSafetyLevel(query, response) {
  const emergencyKeywords = ['emergency', 'urgent', 'danger', 'fire', 'flood', 'earthquake', 'hurricane', 'tornado', 'tsunami', 'evacuate', 'immediate', 'critical'];
  const safetyKeywords = ['safe', 'preparation', 'plan', 'supplies', 'checklist', 'guidance', 'information'];
  
  const queryLower = query.toLowerCase();
  const responseLower = response.toLowerCase();
  
  let emergencyCount = 0;
  let safetyCount = 0;
  
  emergencyKeywords.forEach(keyword => {
    if (queryLower.includes(keyword) || responseLower.includes(keyword)) {
      emergencyCount++;
    }
  });
  
  safetyKeywords.forEach(keyword => {
    if (queryLower.includes(keyword) || responseLower.includes(keyword)) {
      safetyCount++;
    }
  });
  
  if (emergencyCount > 2) {
    return { level: 'high', reason: 'Emergency situation detected' };
  } else if (emergencyCount > 0 || safetyCount > 2) {
    return { level: 'medium', reason: 'Safety concern identified' };
  } else {
    return { level: 'low', reason: 'General information request' };
  }
}

// Helper function to extract recommendations from response
function extractRecommendations(response) {
  const recommendations = [];
  const lines = response.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      recommendations.push(trimmed.substring(1).trim());
    } else if (trimmed.includes('recommend') || trimmed.includes('suggest') || trimmed.includes('should')) {
      recommendations.push(trimmed);
    }
  });
  
  // If no structured recommendations found, create general ones
  if (recommendations.length === 0) {
    if (response.toLowerCase().includes('emergency')) {
      recommendations.push('Contact emergency services if immediate danger');
      recommendations.push('Follow evacuation procedures if instructed');
    }
    if (response.toLowerCase().includes('preparation')) {
      recommendations.push('Create an emergency preparedness kit');
      recommendations.push('Develop a family emergency plan');
    }
  }
  
  return recommendations.slice(0, 3); // Limit to 3 recommendations
}

// Run the test
testGeminiIntegration();
