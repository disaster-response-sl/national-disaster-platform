
const getBaseURL = () => {
  // Try environment variable first (set in .env or via process.env)
  const envUrl = process.env.REACT_NATIVE_API_BASE_URL;
  if (envUrl) return envUrl;

  // Development fallback - update this with your backend URL
  // For local development: 'http://localhost:5000/api'
  // For production: your production API URL
  return 'https://lovely-bats-smoke.loca.lt/api'; 
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
