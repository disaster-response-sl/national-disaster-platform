const https = require('https');
const crypto = require('crypto');

class MPGSService {
  constructor() {
    // Commercial Bank PayDPI Configuration
    // Always use https://cbcmpgs.gateway.mastercard.com/ As base URL
    this.merchantId = process.env.MERCHANT_ID || 'TESTITCALANKALKR';
    this.apiUsername = process.env.API_USERNAME || 'merchant.TESTITCALANKALKR';
    this.apiPassword = process.env.API_PASSWORD || '0144a33905ebfc5a6d39dd074ce5d40d';
    this.baseUrl = 'https://cbcmpgs.gateway.mastercard.com';
    this.apiVersion = '100'; // Always maintain same API version everywhere
    this.useMockMode = process.env.MPGS_MOCK_MODE === 'true';
    
    // Debug logging for credentials (remove in production)
    console.log('Commercial Bank PayDPI Config:', {
      merchantId: this.merchantId ? this.merchantId.substring(0, 5) + '...' : 'NOT SET',
      apiUsername: this.apiUsername ? this.apiUsername.substring(0, 8) + '...' : 'NOT SET',
      apiPassword: this.apiPassword ? '***SET***' : 'NOT SET',
      baseUrl: this.baseUrl,
      mockMode: this.useMockMode
    });
    
    // Commercial Bank PayDPI Gateway URLs
    this.gatewayHost = 'cbcmpgs.gateway.mastercard.com';
    this.gatewayPath = `/api/rest/version/${this.apiVersion}/merchant/${this.merchantId}`;
  }

  // Validate MPGS configuration
  validateConfig() {
    if (!this.merchantId || !this.apiUsername || !this.apiPassword) {
      throw new Error('MPGS credentials not configured. Please set MERCHANT_ID, API_USERNAME, and API_PASSWORD in environment variables.');
    }
    
    console.log(`🔑 MPGS Config: Merchant ID: ${this.merchantId}, Username: ${this.apiUsername}`);
  }

  // Create hosted checkout session (Commercial Bank PayDPI integration method)
  async createHostedSession(sessionData) {
    try {
      // Check if mock mode is enabled
      if (this.useMockMode) {
        console.log('🎭 MPGS Mock Mode: Creating simulated session');
        return this.createMockSession(sessionData);
      }

      this.validateConfig();

      const {
        order,
        billing,
        customer,
        interaction = { operation: 'PURCHASE' }
      } = sessionData;

      // Validate required fields
      if (!order || !order.amount || !order.currency) {
        throw new Error('Order amount and currency are required');
      }

      // Generate unique order ID
      const orderId = this.generateOrderId();

      // Commercial Bank PayDPI specific configuration
      const requestData = {
        apiOperation: 'INITIATE_CHECKOUT', // Use INITIATE_CHECKOUT as per Commercial Bank guide
        interaction: {
          merchant: {
            name: 'TESTITCALANKALKR' // Use merchant ID as merchant name
          },
          operation: 'PURCHASE',
          displayControl: {
            billingAddress: 'HIDE',
            customerEmail: 'HIDE',
            shipping: 'HIDE'
          },
          returnUrl: process.env.PAYMENT_RETURN_URL || 'https://www.abcd.lk'
        },
        order: {
          id: orderId,
          currency: order.currency || 'LKR',
          amount: order.amount.toString(), // Ensure amount is string as per sample
          description: order.description || 'Test Order'
        }
      };

      // Add billing information if provided
      if (billing) {
        requestData.billing = {
          address: {
            city: billing.address?.city || 'Colombo',
            country: billing.address?.country || 'LKA',
            postcodeZip: billing.address?.postcodeZip || '10100',
            stateProvince: billing.address?.stateProvince || 'Western'
          }
        };
      }

      // Add customer information if provided
      if (customer) {
        requestData.customer = {
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone
        };
      }

      console.log('🔄 Creating MPGS session with data:', JSON.stringify(requestData, null, 2));

      const response = await this.makeRequest('POST', '/session', requestData);
      
      return {
        success: true,
        session: {
          id: response.session?.id,
          version: response.session?.version,
          status: 'ACTIVE'
        },
        orderId: orderId,
        sessionUrl: `https://${this.gatewayHost}/checkout/version/${this.apiVersion}/checkout.js?session=${response.session?.id}`,
        checkoutScript: `https://${this.gatewayHost}/checkout/version/${this.apiVersion}/checkout.js`
      };
    } catch (error) {
      console.error('❌ MPGS Session Creation Error:', error.message);
      
      return {
        success: false,
        error: 'Payment gateway session creation failed',
        message: error.message
      };
    }
  }

  // Create mock session for testing when MPGS is not available
  createMockSession(sessionData) {
    const { order } = sessionData;
    const orderId = this.generateOrderId();
    const sessionId = `MOCK_SESSION_${Date.now()}`;
    
    console.log(`🎭 Mock session created - Order: ${orderId}, Session: ${sessionId}`);
    
    return {
      success: true,
      session: {
        id: sessionId,
        version: 'MOCK_VERSION',
        status: 'ACTIVE'
      },
      orderId: orderId,
      sessionUrl: `https://mock-gateway.example.com/checkout.js?session=${sessionId}`,
      checkoutScript: `https://mock-gateway.example.com/checkout.js`,
      mockMode: true,
      message: 'This is a mock session for testing purposes'
    };
  }

  // Verify payment session status
  async verifySession(sessionId) {
    try {
      this.validateConfig();

      console.log(`🔍 Verifying session: ${sessionId}`);
      const response = await this.makeRequest('GET', `/session/${sessionId}`);
      
      return {
        success: true,
        session: response,
        status: response.status || 'UNKNOWN'
      };
    } catch (error) {
      console.error('❌ MPGS Session Verification Error:', error.message);
      
      return {
        success: false,
        error: 'Session verification failed',
        message: error.message
      };
    }
  }

  // Retrieve order information
  async retrieveOrder(orderId) {
    try {
      this.validateConfig();

      console.log(`📋 Retrieving order: ${orderId}`);
      const response = await this.makeRequest('GET', `/order/${orderId}`);
      
      return {
        success: true,
        order: response,
        result: response.result,
        totalAuthorizedAmount: response.totalAuthorizedAmount,
        totalCapturedAmount: response.totalCapturedAmount
      };
    } catch (error) {
      console.error('❌ MPGS Order Retrieval Error:', error.message);
      
      return {
        success: false,
        error: 'Order retrieval failed',
        message: error.message
      };
    }
  }

  // Process direct payment (Alternative method)
  async processDirectPayment(paymentData) {
    try {
      this.validateConfig();

      const {
        orderId,
        amount,
        currency = 'LKR',
        card,
        billing
      } = paymentData;

      const requestData = {
        apiOperation: 'PAY',
        order: {
          id: orderId,
          amount: amount,
          currency: currency
        },
        sourceOfFunds: {
          type: 'CARD',
          provided: {
            card: {
              number: card.number,
              securityCode: card.securityCode,
              expiry: {
                month: card.expiry.month,
                year: card.expiry.year
              }
            }
          }
        }
      };

      if (billing) {
        requestData.billing = billing;
      }

      console.log('💳 Processing direct payment for order:', orderId);
      const response = await this.makeRequest('PUT', `/order/${orderId}/transaction/1`, requestData);
      
      return {
        success: response.result === 'SUCCESS',
        transaction: response,
        orderId: orderId,
        transactionId: response.transaction?.id || this.generateTransactionId(),
        result: response.result,
        response: response.response
      };
    } catch (error) {
      console.error('❌ MPGS Payment Processing Error:', error.message);
      
      return {
        success: false,
        error: 'Payment processing failed',
        message: error.message
      };
    }
  }

  // Make HTTP request to MPGS API
  async makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      // Create Basic Auth header
      const auth = Buffer.from(`${this.apiUsername}:${this.apiPassword}`).toString('base64');
      const path = `${this.gatewayPath}${endpoint}`;
      
      const options = {
        hostname: this.gatewayHost,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'National-Disaster-Platform/1.0'
        }
      };

      // Add Content-Length for POST/PUT requests
      if (data && (method === 'POST' || method === 'PUT')) {
        const dataString = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(dataString);
      }

      console.log(`🌐 MPGS ${method} ${path}`);
      console.log('🔐 Auth:', {
        username: this.apiUsername,
        passwordLength: this.apiPassword ? this.apiPassword.length : 0,
        authHeader: `Basic ${auth.substring(0, 20)}...`
      });
      if (data) {
        console.log('📤 Request data:', JSON.stringify(data, null, 2));
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            console.log(`📥 MPGS Response (${res.statusCode}):`, responseData);
            
            if (responseData.trim() === '') {
              // Empty response for some successful operations
              resolve({ success: true });
              return;
            }

            const jsonResponse = JSON.parse(responseData);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonResponse);
            } else {
              const errorMessage = jsonResponse.error?.explanation || 
                                 jsonResponse.error?.cause || 
                                 jsonResponse.cause || 
                                 `HTTP ${res.statusCode}`;
              reject(new Error(`MPGS API Error: ${errorMessage}`));
            }
          } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request Error:', error);
        reject(new Error(`Request failed: ${error.message}`));
      });

      // Write data for POST/PUT requests
      if (data && (method === 'POST' || method === 'PUT')) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Generate unique order ID following MPGS guidelines
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `NDX${timestamp}${random}`;
  }

  // Generate unique session ID
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `SESSION${timestamp.toString().slice(-10)}${random.toString().padStart(4, '0')}`;
  }

  // Generate unique transaction ID
  generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    return `TXN${timestamp}${random}`;
  }

  // Create webhook signature for verification
  createWebhookSignature(payload, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature, secret) {
    const expectedSignature = this.createWebhookSignature(payload, secret);
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Format amount for MPGS (remove decimal places)
  formatAmount(amount) {
    return Math.round(amount * 100); // Convert to cents
  }

  // Parse amount from MPGS response
  parseAmount(amount) {
    return amount / 100; // Convert from cents
  }
}

module.exports = new MPGSService();

module.exports = new MPGSService();
