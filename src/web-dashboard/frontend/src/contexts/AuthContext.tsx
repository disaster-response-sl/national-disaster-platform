import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type User } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (individualId: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const currentToken = authService.getToken();
      if (!currentToken) return;

      const response = await authService.getProfile();
      if (response.success && response.user) {
        // Add individualId from token to user object
        const individualId = authService.getIndividualIdFromToken();
        const userWithId = { ...response.user, individualId };
        
        setUser(userWithId);
        setToken(currentToken);
        authService.saveAuthData(currentToken, userWithId);
      } else {
        // If profile fetch fails, clear auth data
        authService.logout();
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      authService.logout();
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = authService.getCurrentUser();
      const savedToken = authService.getToken();
      
      if (savedUser && savedToken) {
        setUser(savedUser);
        setToken(savedToken);
        // Optionally refresh profile to ensure it's up to date
        await refreshProfile();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (individualId: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ individualId, otp });
      
      if (response.success && response.token) {
        // Save token temporarily and fetch user profile
        authService.saveAuthData(response.token, {} as User);
        
        const profileResponse = await authService.getProfile();
        
        if (profileResponse.success && profileResponse.user) {
          // Add individualId from token to user object
          const userWithId = { ...profileResponse.user, individualId };
          authService.saveAuthData(response.token, userWithId);
          setUser(userWithId);
          setToken(response.token);
          return true;
        } else {
          authService.logout();
          setToken(null);
          toast.error('Failed to fetch user profile');
          return false;
        }
      } else {
        const errorMessage = response.message || 'Authentication failed';
        toast.error(errorMessage);
        return false;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      authService.logout();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
