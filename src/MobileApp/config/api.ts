
const getBaseURL = () => {
  // Try environment variable first (set in .env or via process.env)
  const envUrl = process.env.REACT_NATIVE_API_BASE_URL;
  if (envUrl) return envUrl;

  // LocalTunnel for SLUDI Integration - WITH BYPASS HEADERS (NO PASSWORD!)
  // Headers automatically bypass tunnel reminder page
  return 'https://tough-parents-sip.loca.lt/api';
};

// Default headers for all API requests to bypass tunnel
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'bypass-tunnel-reminder': 'mobile-app',
  'User-Agent': 'MobileApp-SLUDI/1.0.0'
};

// Helper function for API requests with bypass headers
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getBaseURL()}${endpoint}`;
  const headers = {
    ...DEFAULT_HEADERS,
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
};

// Commercial Bank PayDPI Configuration
export const API_BASE_URL = getBaseURL();
export const PAYMENT_GATEWAY_URL = 'https://cbcmpgs.gateway.mastercard.com';
export const CHECKOUT_SCRIPT_URL = 'https://cbcmpgs.gateway.mastercard.com/checkout/version/100/checkout.js';

// Payment configuration
export const PAYMENT_CONFIG = {
  currency: 'LKR',
  merchantName: 'TESTITCALANKALKR',
  displayControl: {
    billingAddress: 'HIDE',
    customerEmail: 'HIDE',
    shipping: 'HIDE'
  },
  returnUrl: 'https://www.abcd.lk'
};
