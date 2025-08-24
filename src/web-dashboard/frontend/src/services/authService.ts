import axios from 'axios';


// API base URL - matching the guide specification
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Relative URL for production (proxied)
  : 'http://localhost:5000/api';  // Full URL for development as per guide


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  individualId: string;
  otp: string;
}

export interface User {
  individualId?: string | null; // From JWT token, can be null
  name: string;
  email?: string;
  phone?: string;
  role: 'citizen' | 'responder' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  errors?: Array<{
    errorCode: string;
    message: string;
  }>;
}

export interface ProfileResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  saveAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Helper to extract individualId from JWT token
  getIndividualIdFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.individualId || null;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  },
};

export default api;
