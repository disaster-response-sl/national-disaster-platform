const axios = require('axios');

class PaymentService {
  constructor() {
    // Use test environment for development/testing
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://cbcmpgs.gateway.mastercard.com'
      : 'https://test-gateway.mastercard.com';

    this.apiVersion = '100';
    this.merchantId = process.env.MERCHANT_ID;
    this.apiUsername = process.env.API_USERNAME;
    this.apiPassword = process.env.API_PASSWORD;
    this.itcaTestPassword = process.env.ITCA_TEST_PASSWORD;

    if (!this.merchantId || !this.apiUsername || !this.apiPassword) {
      throw new Error('MPGS credentials not configured. Please set MERCHANT_ID, API_USERNAME, and API_PASSWORD in environment variables.');
    }

    // Log ITCA test environment info if available
    if (this.itcaTestPassword) {
      console.log('ITCA Test Environment configured with password:', this.itcaTestPassword.substring(0, 4) + '****');
    }

    // Create axios instance with basic auth
    this.client = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.apiUsername,
        password: this.apiPassword
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a payment session with MPGS
   * @param {Object} sessionData - Session configuration data
   * @returns {Promise<Object>} - Session response from MPGS
   */
  async createSession(sessionData = {}) {
    try {
      const defaultData = {
        apiOperation: 'CREATE_CHECKOUT_SESSION',
        interaction: {
          operation: 'PURCHASE',
          returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation/success`,
          cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation/cancel`
        },
        order: {
          currency: 'LKR'
        }
      };

      const payload = { ...defaultData, ...sessionData };

      const response = await this.client.post(
        `/api/rest/version/${this.apiVersion}/merchant/${this.merchantId}/session`,
        payload
      );

      // Log session creation (without sensitive data)
      console.log(`MPGS Session created: ${response.data.session?.id}`);

      return response.data;
    } catch (error) {
      console.error('MPGS Session creation failed:', error.response?.data || error.message);
      throw new Error(`Failed to create payment session: ${error.response?.data?.error?.explanation || error.message}`);
    }
  }

  /**
   * Retrieve session details from MPGS
   * @param {string} sessionId - MPGS session ID
   * @returns {Promise<Object>} - Session details
   */
  async getSession(sessionId) {
    try {
      const response = await this.client.get(
        `/api/rest/version/${this.apiVersion}/merchant/${this.merchantId}/session/${sessionId}`
      );

      return response.data;
    } catch (error) {
      console.error('MPGS Session retrieval failed:', error.response?.data || error.message);
      throw new Error(`Failed to retrieve session: ${error.response?.data?.error?.explanation || error.message}`);
    }
  }

  /**
   * Process payment completion (for webhook handling)
   * @param {string} orderId - Order ID from MPGS
   * @returns {Promise<Object>} - Payment result
   */
  async getOrder(orderId) {
    try {
      const response = await this.client.get(
        `/api/rest/version/${this.apiVersion}/merchant/${this.merchantId}/order/${orderId}`
      );

      return response.data;
    } catch (error) {
      console.error('MPGS Order retrieval failed:', error.response?.data || error.message);
      throw new Error(`Failed to retrieve order: ${error.response?.data?.error?.explanation || error.message}`);
    }
  }
}

module.exports = new PaymentService();
