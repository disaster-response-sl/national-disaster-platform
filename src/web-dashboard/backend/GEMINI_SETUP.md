# Gemini AI Setup Guide

## Overview
The AI Safety Assistant now uses Google's Gemini AI to provide intelligent safety recommendations and emergency guidance.

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/national-disaster-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Gemini AI Configuration
GEMINI_API_KEY=your-actual-gemini-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Install Dependencies
```bash
cd src/web-dashboard/backend
npm install
```

### 4. Start the Backend
```bash
npm run dev
```

## Features

### AI Safety Assistant
- **Natural Language Processing**: Understands user queries in natural language
- **Safety Level Assessment**: Automatically assesses risk levels (low/medium/high)
- **Safety Recommendations**: Provides actionable safety advice
- **Emergency Guidance**: Offers step-by-step instructions for crisis situations

### Quick Questions
Pre-defined questions for common emergency scenarios:
- Earthquake safety procedures
- Hurricane preparation
- Emergency supplies checklist
- Flood safety measures
- Evacuation procedures
- Crisis support guidance

### Safety Features
- Real-time risk assessment
- Contextual safety recommendations
- Emergency contact suggestions
- Step-by-step crisis response guidance

## API Endpoints

### POST /api/mobile/chat/gemini
Processes user queries through Gemini AI and returns safety-focused responses.

**Request Body:**
```json
{
  "query": "What should I do in an earthquake?",
  "context": "AI Safety Assistant for emergency preparedness"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What should I do in an earthquake?",
    "response": "During an earthquake, follow these safety steps...",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "safetyLevel": "high",
    "recommendations": [
      "Drop, cover, and hold on",
      "Stay away from windows and heavy objects",
      "Have an emergency kit ready"
    ]
  }
}
```

## Safety Guidelines
The AI Safety Assistant is programmed with specific safety guidelines:
- Always prioritize user safety
- Provide clear, actionable instructions
- Include relevant warnings and precautions
- Suggest appropriate emergency contacts
- Maintain factual accuracy while being supportive

## Troubleshooting

### Common Issues
1. **API Key Error**: Ensure your Gemini API key is correctly set in the .env file
2. **Rate Limiting**: The free tier has rate limits; consider upgrading for production use
3. **Network Issues**: Ensure stable internet connection for API calls

### Testing
Test the integration by sending a message through the mobile app chat interface or using the API directly with a tool like Postman.
