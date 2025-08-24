// ndx-service.js - Mock NDX (National Data Exchange) Service
// Simulates WSO2 Choreo API Manager for data exchange

class MockNDXService {
  constructor() {
    this.dataConsents = new Map();
    this.dataProviders = {
      'disaster-management': {
        name: 'Disaster Management Authority',
        apis: ['disasters', 'resources', 'sos-signals']
      },
      'weather-service': {
        name: 'Meteorological Department',
        apis: ['weather-alerts', 'flood-warnings']
      },
      'health-ministry': {
        name: 'Ministry of Health',
        apis: ['medical-supplies', 'health-status']
      },
      'transport-ministry': {
        name: 'Ministry of Transport',
        apis: ['road-conditions', 'evacuation-routes']
      }
    };
  }

  // Request data exchange with consent
  async requestDataExchange(request) {
    const {
      individualId,
      dataProvider,
      dataType,
      purpose,
      consentDuration,
      requestId
    } = request;

    // Validate request
    if (!this.dataProviders[dataProvider]) {
      return {
        success: false,
        error: 'INVALID_PROVIDER',
        message: 'Data provider not found'
      };
    }

    // Create consent record
    const consentId = `consent_${Date.now()}_${individualId}`;
    const consent = {
      consentId,
      individualId,
      dataProvider,
      dataType,
      purpose,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (consentDuration || 24 * 60 * 60 * 1000)).toISOString(),
      requestId
    };

    this.dataConsents.set(consentId, consent);

    return {
      success: true,
      consentId,
      status: 'PENDING_APPROVAL',
      message: 'Consent request created successfully'
    };
  }

  // Approve consent (simulates citizen approval)
  async approveConsent(consentId, individualId) {
    const consent = this.dataConsents.get(consentId);
    
    if (!consent || consent.individualId !== individualId) {
      return {
        success: false,
        error: 'CONSENT_NOT_FOUND',
        message: 'Consent not found or unauthorized'
      };
    }

    consent.status = 'APPROVED';
    consent.approvedAt = new Date().toISOString();

    return {
      success: true,
      status: 'APPROVED',
      message: 'Consent approved successfully'
    };
  }

  // Exchange data based on approved consent
  async exchangeData(consentId, dataRequest) {
    const consent = this.dataConsents.get(consentId);
    
    if (!consent || consent.status !== 'APPROVED') {
      return {
        success: false,
        error: 'INVALID_CONSENT',
        message: 'Valid consent required for data exchange'
      };
    }

    // Check if consent has expired
    if (new Date() > new Date(consent.expiresAt)) {
      consent.status = 'EXPIRED';
      return {
        success: false,
        error: 'CONSENT_EXPIRED',
        message: 'Consent has expired'
      };
    }

    // Simulate data retrieval from provider
    const mockData = this.generateMockData(consent.dataProvider, consent.dataType);
    
    return {
      success: true,
      data: mockData,
      metadata: {
        provider: consent.dataProvider,
        dataType: consent.dataType,
        retrievedAt: new Date().toISOString(),
        consentId
      }
    };
  }

  // Generate mock data based on provider and type
  generateMockData(provider, dataType) {
    switch (provider) {
      case 'disaster-management':
        switch (dataType) {
          case 'disasters':
            return [
              {
                _id: '68959322a3a58f7e8e93a61e',
                type: 'flood',
                severity: 'high',
                description: 'Severe flooding in Ratnapura district after continuous rainfall',
                location: { lat: 6.6847, lng: 80.4025 },
                timestamp: new Date('2025-08-08T16:28:52.933Z').toISOString(),
                status: 'active'
              },
              {
                _id: '68959322a3a58f7e8e93a617',
                type: 'landslide',
                severity: 'high',
                description: 'Landslide disaster in Nuwara Eliya district, Sri Lanka',
                location: { lat: 6.9497, lng: 80.7718 },
                timestamp: new Date('2025-08-08T11:04:27.670Z').toISOString(),
                status: 'active'
              },
              {
                _id: '68959322a3a58f7e8e93a61d',
                type: 'flood',
                severity: 'medium',
                description: 'Urban flooding in Colombo due to heavy monsoon rains',
                location: { lat: 6.9271, lng: 79.8612 },
                timestamp: new Date('2025-08-08T00:15:04.537Z').toISOString(),
                status: 'resolved'
              }
            ];
          case 'resources':
            return [
              {
                id: 'resource_001',
                type: 'medical',
                quantity: 100,
                location: { lat: 6.9319, lng: 79.8478 },
                status: 'available'
              }
            ];
          default:
            return [];
        }
      
      case 'weather-service':
        switch (dataType) {
          case 'weather-alerts':
            return [
              {
                _id: 'alert_001',
                type: 'heavy-rain',
                severity: 'medium',
                description: `Heavy rain alert for Western Province. Expected until ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}`,
                location: { lat: 6.9271, lng: 79.8612 }, // Colombo center as reference
                timestamp: new Date().toISOString(),
                area: 'Western Province',
                validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              },
              {
                _id: 'alert_002',
                type: 'wind',
                severity: 'low',
                description: 'Strong wind advisory for coastal areas of Western Province',
                location: { lat: 6.9271, lng: 79.8612 },
                timestamp: new Date().toISOString(),
                area: 'Western Province - Coastal',
                validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
              }
            ];
          default:
            return [];
        }
      
      default:
        return [];
    }
  }

  // Get consent status
  async getConsentStatus(consentId, individualId) {
    const consent = this.dataConsents.get(consentId);
    
    if (!consent || consent.individualId !== individualId) {
      return {
        success: false,
        error: 'CONSENT_NOT_FOUND',
        message: 'Consent not found or access denied'
      };
    }

    return {
      success: true,
      status: consent.status,
      consentId: consent.consentId,
      consent: {
        consentId: consent.consentId,
        dataProvider: consent.dataProvider,
        dataType: consent.dataType,
        purpose: consent.purpose,
        status: consent.status,
        createdAt: consent.createdAt,
        expiresAt: consent.expiresAt
      }
    };
  }

  // Revoke consent
  async revokeConsent(consentId, individualId) {
    const consent = this.dataConsents.get(consentId);
    
    if (!consent || consent.individualId !== individualId) {
      return {
        success: false,
        error: 'CONSENT_NOT_FOUND'
      };
    }

    consent.status = 'REVOKED';
    consent.revokedAt = new Date().toISOString();

    return {
      success: true,
      message: 'Consent revoked successfully'
    };
  }

  // Get all consents for a user
  async getUserConsents(individualId) {
    const userConsents = [];
    
    for (const [consentId, consent] of this.dataConsents.entries()) {
      if (consent.individualId === individualId) {
        userConsents.push({
          consentId: consent.consentId,
          dataProvider: consent.dataProvider,
          dataType: consent.dataType,
          purpose: consent.purpose,
          status: consent.status,
          createdAt: consent.createdAt,
          expiresAt: consent.expiresAt
        });
      }
    }

    return {
      success: true,
      consents: userConsents
    };
  }

  // Get available data providers
  async getDataProviders() {
    return {
      success: true,
      providers: Object.keys(this.dataProviders).map(key => ({
        id: key,
        name: this.dataProviders[key].name,
        apis: this.dataProviders[key].apis
      }))
    };
  }
}

module.exports = MockNDXService;
