import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type User } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await authService.getProfile();
      if (response.success && response.user) {
        // Add individualId from token to user object
        const individualId = authService.getIndividualIdFromToken();
        const userWithId = { ...response.user, individualId };
        
        setUser(userWithId);
        authService.saveAuthData(token, userWithId);
      } else {
        // If profile fetch fails, clear auth data
        authService.logout();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      authService.logout();
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (savedUser && token) {
        setUser(savedUser);
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
          return true;
        } else {
          authService.logout();
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
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
