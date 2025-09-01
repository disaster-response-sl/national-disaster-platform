// routes/mobileAuth.routes.js
const SosSignal = require('../models/SosSignal');
const Disaster = require('../models/Disaster');
const Report = require('../models/Report');
const Resource = require('../models/Resource');
const ChatLog = require('../models/ChatLog');

const express = require('express');
const jwt = require('jsonwebtoken');
const MockSLUDIService = require('../services/mock-sludi-service');
const RealSLUDIService = require('../services/real-sludi-service');

// Config flag to switch between mock and real SLUDI/eSignet integration
const USE_MOCK_SLUDI = process.env.USE_MOCK_SLUDI === 'true';

// Gemini AI integration
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Safety system prompt for AI responses
const SAFETY_SYSTEM_PROMPT = `You are an AI Safety Assistant for emergency preparedness and crisis response. 

CRITICAL SAFETY GUIDELINES:
- Always prioritize user safety in your responses
- Provide clear, step-by-step instructions for emergency situations
- Include relevant safety warnings and precautions
- Suggest appropriate emergency contacts when necessary (112 for emergencies in Sri Lanka, 119 for police, 110 for fire)
- Be supportive but factual and accurate
- If someone is in immediate danger, immediately direct them to call emergency services
- For disaster-related queries, provide location-specific guidance when possible
- Always include preventive measures and preparation tips

RESPONSE FORMAT:
- Start with immediate safety action if urgent
- Provide step-by-step instructions
- Include relevant warnings and precautions
- End with follow-up resources or contacts`;

const router = express.Router();
const sludiService = USE_MOCK_SLUDI ? new MockSLUDIService() : new RealSLUDIService();
const { authenticateToken } = require('../middleware/auth');

// Utility function to validate NIC (simplified)
const validateNIC = (nic) => /^[a-zA-Z0-9]{6,20}$/.test(nic);

// POST /api/mobile/login
router.post('/login', async (req, res) => {
  console.log('Login request received:', req.body);
  
  try {
    const { individualId, otp } = req.body;
    console.log('Processing login for:', { individualId, otp });
    
    // Mock SLUDI authentication
    const authRequest = {
      id: "mosip.identity.auth",
      version: "1.0",
      individualId: individualId,
      individualIdType: "UIN",
      transactionID: `TXN_${Date.now()}`,
      requestTime: new Date().toISOString(),
      request: {
        otp: otp,
        timestamp: new Date().toISOString()
      },
      consentObtained: true
    };
    
    console.log('Calling SLUDI service with:', authRequest);
    const authResponse = await sludiService.authenticate(authRequest);
    console.log('SLUDI response:', authResponse);
    
    if (authResponse.response.authStatus) {
      let userData = null;
      
      if (USE_MOCK_SLUDI) {
        // Use mock data for testing
        userData = sludiService.mockUsers.find(u => u.individualId === individualId);
      } else {
        // Fetch real user data from SLUDI
        try {
          const profileResponse = await sludiService.getUserProfile(individualId, authResponse.response.authToken);
          if (profileResponse.success) {
            userData = {
              individualId: individualId,
              name: profileResponse.userData.name || 'Unknown',
              email: profileResponse.userData.email,
              phone: profileResponse.userData.phone,
              role: profileResponse.userData.role || 'citizen',
              location: profileResponse.userData.location
            };
          }
        } catch (error) {
          console.warn('Failed to fetch user profile from SLUDI, using basic data:', error);
          userData = {
            individualId: individualId,
            name: 'Unknown',
            role: 'citizen'
          };
        }
      }
      
      // Generate a user object for JWT
      const user = {
        _id: userData ? userData.individualId : individualId,
        individualId: userData ? userData.individualId : individualId,
        name: userData ? userData.name : 'Unknown',
        role: userData ? userData.role : 'citizen',
        email: userData ? userData.email : null,
        phone: userData ? userData.phone : null,
        location: userData ? userData.location : null
      };
      
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
      const appToken = jwt.sign(
        {
          _id: user._id,
          individualId: user.individualId,
          role: user.role,
          name: user.name,
          sludiToken: authResponse.response.authToken
        },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      console.log('Sending success response with user:', user);
      res.json({
        success: true,
        token: appToken,
        user,
        message: "Authentication successful"
      });
    } else {
      console.log('Authentication failed:', authResponse.errors);
      res.status(401).json({
        success: false,
        message: "Authentication failed",
        errors: authResponse.errors
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/mobile/sludi/health - Health check for SLUDI service
router.get('/sludi/health', async (req, res) => {
  try {
    const healthResult = await sludiService.healthCheck();
    res.json({
      success: true,
      sludiService: {
        type: USE_MOCK_SLUDI ? 'mock' : 'real',
        status: healthResult.status,
        healthy: healthResult.success
      },
      data: healthResult.data
    });
  } catch (error) {
    console.error('SLUDI health check error:', error);
    res.status(500).json({
      success: false,
      sludiService: {
        type: USE_MOCK_SLUDI ? 'mock' : 'real',
        status: 'unhealthy',
        healthy: false
      },
      error: error.message
    });
  }
});

// POST /api/mobile/sludi/auth-url - Get SLUDI authorization URL for mobile
router.post('/sludi/auth-url', async (req, res) => {
  try {
    const { individualId } = req.body;
    
    if (!USE_MOCK_SLUDI) {
      // Use real SLUDI service
      const authResult = await sludiService.mobileAuthenticate(individualId);
      
      if (authResult.success) {
        res.json({
          success: true,
          authorizationUrl: authResult.authorizationUrl,
          state: authResult.state,
          message: authResult.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: authResult.error || 'Failed to generate SLUDI authorization URL'
        });
      }
    } else {
      // For mock service, return a tunnel-accessible mock authentication URL
      const mockState = `mock_${individualId}_${Date.now()}`;
      // Use the same host that the request came from (works with any tunnel URL)
      const tunnelHost = req.get('host');
      const protocol = req.secure ? 'https' : 'http';
      const mockAuthUrl = `${protocol}://${tunnelHost}/api/mobile/mock-sludi-auth?state=${mockState}&individual_id=${individualId}`;
      
      console.log('🌐 Generated mock SLUDI URL:', mockAuthUrl);
      
      res.json({
        success: true,
        authorizationUrl: mockAuthUrl,
        state: mockState,
        message: 'Mock SLUDI authorization URL generated (tunnel-aware)'
      });
    }
  } catch (error) {
    console.error('SLUDI auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
});

// POST /api/mobile/sludi/token - Exchange authorization code for token
router.post('/sludi/token', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }
    
    if (!USE_MOCK_SLUDI) {
      // Use real SLUDI service
      const tokenResult = await sludiService.exchangeCodeForToken(code);
      
      if (tokenResult.success) {
        // Get user profile
        const profileResult = await sludiService.getUserProfile(tokenResult.accessToken);
        
        let userData = {
          individualId: 'unknown',
          name: 'Unknown User',
          role: 'citizen'
        };
        
        if (profileResult.success) {
          userData = {
            individualId: profileResult.userData.sub || 'unknown',
            name: profileResult.userData.given_name || profileResult.userData.name || 'Unknown User',
            email: profileResult.userData.email,
            phone: profileResult.userData.phone_number,
            role: 'citizen' // Default role for SLUDI users
          };
        }
        
        // Generate JWT token for the app
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
        const appToken = jwt.sign(
          {
            _id: userData.individualId,
            individualId: userData.individualId,
            role: userData.role,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            sludiToken: tokenResult.accessToken
          },
          jwtSecret,
          { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        
        res.json({
          success: true,
          token: appToken,
          user: userData,
          message: 'SLUDI authentication successful'
        });
      } else {
        res.status(400).json({
          success: false,
          message: tokenResult.error || 'Failed to exchange authorization code'
        });
      }
    } else {
      // Mock response for testing
      const mockUser = {
        individualId: 'mock_citizen_001',
        name: 'Mock SLUDI User',
        role: 'citizen',
        email: 'mock@example.com'
      };
      
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
      const appToken = jwt.sign(
        {
          _id: mockUser.individualId,
          individualId: mockUser.individualId,
          role: mockUser.role,
          name: mockUser.name,
          email: mockUser.email,
          sludiToken: 'mock_sludi_token'
        },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      res.json({
        success: true,
        token: appToken,
        user: mockUser,
        message: 'Mock SLUDI authentication successful'
      });
    }
  } catch (error) {
    console.error('SLUDI token exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process authorization code'
    });
  }
});

  // POST /api/mobile/sos
  router.post('/sos', authenticateToken, async (req, res) => {
  try {
    const { location, message, priority } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    console.log('SOS request received:', { location, message, priority, userId });

    if (!location || !message) {
      return res.status(400).json({
        success: false,
        message: "Location and message are required"
      });
    }

    const sos = new SosSignal({
      user_id: userId,
      location,
      message,
      priority: priority || 'medium'
    });

    console.log('Saving SOS signal:', sos);
    await sos.save();
    console.log('SOS signal saved successfully to sos_signals collection');

    res.json({
      success: true,
      message: "SOS signal sent",
      data: sos
    });
  } catch (error) {
    console.error('[SOS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Server error sending SOS"
    });
  }
});

// GET /api/mobile/disasters - Get all disasters (active and resolved)
router.get('/disasters', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status; // Allow filtering by status if specified
    }
    
         const disasters = await Disaster.find(query)
       .sort({ timestamp: -1 })
       .limit(50); // Increased limit to show more disasters
     
     console.log('Found disasters:', disasters.length);
     
     const response = {
       success: true,
       data: disasters
     };
    
    res.json(response);
  } catch (error) {
    console.error('[DISASTERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching disasters"
    });
  }
});

// POST /api/mobile/populate-test-disasters - Populate test disaster data with proper coordinates
router.post('/populate-test-disasters', authenticateToken, async (req, res) => {
  try {
    // Clear existing disasters
    await Disaster.deleteMany({});
    
         // Create test disasters matching the actual database structure
     const testDisasters = [
       {
         type: 'flood',
         severity: 'high',
         description: 'Severe flooding in Ratnapura district after continuous rainfall',
         location: { lat: 6.6847, lng: 80.4025 },
         timestamp: new Date('2025-08-08T16:28:52.933Z'),
         status: 'active'
       },
       {
         type: 'landslide',
         severity: 'high',
         description: 'Landslide disaster in Nuwara Eliya district, Sri Lanka',
         location: { lat: 6.9497, lng: 80.7718 },
         timestamp: new Date('2025-08-08T11:04:27.670Z'),
         status: 'active'
       },
       {
         type: 'flood',
         severity: 'medium',
         description: 'Urban flooding in Colombo due to heavy monsoon rains',
         location: { lat: 6.9271, lng: 79.8612 },
         timestamp: new Date('2025-08-08T00:15:04.537Z'),
         status: 'resolved'
       }
     ];
    
    const createdDisasters = await Disaster.insertMany(testDisasters);
    
    res.json({
      success: true,
      message: 'Test disaster data populated successfully',
      data: createdDisasters
    });
  } catch (error) {
    console.error('[POPULATE TEST DISASTERS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error populating test disaster data"
    });
  }
});

// GET /api/mobile/reports - Get recent reports
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('[REPORTS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports"
    });
  }
});

// GET /api/mobile/sos-signals - Get recent SOS signals
router.get('/sos-signals', authenticateToken, async (req, res) => {
  try {
    const sosSignals = await SosSignal.find()
      .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      data: sosSignals
    });
  } catch (error) {
    console.error('[SOS SIGNALS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching SOS signals"
    });
  }
});

// GET /api/mobile/resources - Get available resources
router.get('/resources', authenticateToken, async (req, res) => {
  try {
    const resources = await Resource.find({ status: 'available' })
      .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('[RESOURCES ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources"
    });
  }
});

// GET /api/mobile/chat-logs - Get user's chat history
router.get('/chat-logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    const chatLogs = await ChatLog.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    res.json({
      success: true,
      data: chatLogs
    });
  } catch (error) {
    console.error('[CHAT LOGS ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat logs"
    });
  }
});

// Test endpoint for debugging
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile API is working',
    timestamp: new Date().toISOString()
  });
});

// POST /api/mobile/reports - Submit a new report
router.post('/reports', authenticateToken, async (req, res) => {
  try {
    const { type, description, disaster_id, image_url, location } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: "Type and description are required"
      });
    }

    const report = new Report({
      user_id: userId,
      disaster_id: disaster_id || null,
      type,
      description,
      image_url: image_url || null,
      location: location || null,
      status: 'pending'
    });

    await report.save();

    res.json({
      success: true,
      message: "Report submitted successfully",
      data: report
    });
  } catch (error) {
    console.error('[REPORT SUBMISSION ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error submitting report"
    });
  }
});

// POST /api/mobile/chat - Submit a chat message
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    // Mock response - in real app, this would be AI/chatbot response
    const response = "Thank you for your message. Our support team will get back to you shortly.";

    const chatLog = new ChatLog({
      user_id: userId,
      query,
      response
    });

    await chatLog.save();

    res.json({
      success: true,
      message: "Chat message sent",
      data: {
        query,
        response,
        timestamp: chatLog.timestamp
      }
    });
  } catch (error) {
    console.error('[CHAT ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error sending chat message"
    });
  }
});

// POST /api/mobile/chat/gemini - AI Safety Assistant with Gemini
router.post('/chat/gemini', authenticateToken, async (req, res) => {
  try {
    const { query, context } = req.body;
    const userId = req.user._id || req.user.user_id || req.user.individualId;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    console.log('Gemini chat request:', { query, userId });

    // Initialize Gemini model - using flash for better rate limits
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Use simple generateContent instead of chat session to reduce token usage
    const prompt = `${SAFETY_SYSTEM_PROMPT}

User Query: ${query}
${context ? `Context: ${context}` : ''}

Please provide a helpful response with safety recommendations. Keep your response concise and actionable.`;

    // Get response from Gemini with reduced token usage
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Analyze response for safety level and extract recommendations
    const safetyAnalysis = analyzeSafetyLevel(query, text);
    
    // Extract recommendations from the response
    const recommendations = extractRecommendations(text);

    const chatLog = new ChatLog({
      user_id: userId,
      query,
      response: text,
      type: 'assistant',
      safetyLevel: safetyAnalysis.level,
      recommendations: recommendations
    });

    await chatLog.save();

    res.json({
      success: true,
      message: "AI Safety Assistant response generated",
      data: {
        query,
        response: text,
        timestamp: chatLog.timestamp,
        safetyLevel: safetyAnalysis.level,
        recommendations: recommendations
      }
    });
  } catch (error) {
    console.error('[GEMINI CHAT ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Error processing AI Safety Assistant request",
      error: error.message,
      details: error.stack
    });
  }
});

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

// GET /api/mobile/test-gemini - Test Gemini AI integration
router.get('/test-gemini', async (req, res) => {
  try {
    console.log('Testing Gemini AI integration...');
    
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key not configured",
        details: "Please set GEMINI_API_KEY in environment variables"
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Test prompt
    const prompt = "Respond with exactly: 'Gemini AI is working correctly for disaster response assistance.'";

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini test response:', text);

    res.json({
      success: true,
      message: "Gemini AI integration test successful",
      data: {
        response: text,
        timestamp: new Date().toISOString(),
        model: "gemini-1.5-flash"
      }
    });
  } catch (error) {
    console.error('[GEMINI TEST ERROR]', error);
    res.status(500).json({
      success: false,
      message: "Gemini AI integration test failed",
      error: error.message,
      details: error.stack
    });
  }
});

// GET /api/mobile/mock-sludi-auth - Mock SLUDI authentication page
router.get('/mock-sludi-auth', (req, res) => {
  const { state, individual_id } = req.query;
  
  const mockAuthPage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SLUDI Mock Authentication</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .auth-container {
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                max-width: 400px;
                width: 100%;
            }
            .logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo h1 {
                color: #2d3748;
                margin: 10px 0 5px 0;
                font-size: 24px;
            }
            .logo p {
                color: #718096;
                margin: 0;
                font-size: 14px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #2d3748;
                font-weight: 500;
            }
            input[type="text"], input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s;
                box-sizing: border-box;
            }
            input[type="text"]:focus, input[type="password"]:focus {
                outline: none;
                border-color: #667eea;
            }
            .auth-btn {
                width: 100%;
                padding: 12px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.3s;
            }
            .auth-btn:hover {
                background: #5a6fd8;
            }
            .info-box {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                font-size: 14px;
                color: #4a5568;
            }
            .info-box strong {
                color: #2d3748;
            }
        </style>
    </head>
    <body>
        <div class="auth-container">
            <div class="logo">
                <div style="font-size: 48px;">🏛️</div>
                <h1>SLUDI Authentication</h1>
                <p>Sri Lankan Digital Identity</p>
            </div>
            
            <div class="info-box">
                <strong>Mock Authentication</strong><br>
                This is a test environment. Use any of these credentials:<br>
                • ID: <strong>citizen001</strong>, OTP: <strong>123456</strong><br>
                • ID: <strong>responder001</strong>, OTP: <strong>123456</strong><br>
                • ID: <strong>admin001</strong>, OTP: <strong>123456</strong>
            </div>

            <form id="mockAuthForm">
                <div class="form-group">
                    <label for="individualId">Individual ID / NIC</label>
                    <input type="text" id="individualId" name="individualId" value="${individual_id || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="otp">OTP Code</label>
                    <input type="password" id="otp" name="otp" placeholder="Enter 6-digit OTP" required>
                </div>
                
                <button type="submit" class="auth-btn">Authenticate</button>
            </form>
        </div>

        <script>
            document.getElementById('mockAuthForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const individualId = document.getElementById('individualId').value;
                const otp = document.getElementById('otp').value;
                
                // Simulate authentication delay
                const button = document.querySelector('.auth-btn');
                button.textContent = 'Authenticating...';
                button.disabled = true;
                
                setTimeout(() => {
                    // Generate mock authorization code
                    const authCode = 'mock_auth_code_' + Date.now();
                    
                    // Create a callback URL that the WebView can detect
                    const callbackUrl = 'https://auth.callback.local/auth/callback?code=' + authCode + '&state=${state}&individual_id=' + individualId;
                    
                    window.location.href = callbackUrl;
                }, 1500);
            });
        </script>
    </body>
    </html>
  `;
  
  res.send(mockAuthPage);
});

module.exports = router;