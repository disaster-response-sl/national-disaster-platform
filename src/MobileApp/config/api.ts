
const getBaseURL = () => {
  // Try environment variable first (set in .env or via process.env)
  const envUrl = process.env.REACT_NATIVE_API_BASE_URL;
  if (envUrl) return envUrl;

  // Fallback: set your ngrok/public tunnel URL here

  return 'https://neat-dingos-punch.loca.lt/api';
};


export const API_BASE_URL = 'https://neat-dingos-punch.loca.lt/api';
