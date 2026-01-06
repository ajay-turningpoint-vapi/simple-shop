import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, getAuthToken, setAuthToken } from '@/services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  authError: string | null;
  revalidate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check auth status on mount and provide revalidate
  const revalidate = async () => {
    setLoading(true);
    setAuthError(null);
    const token = getAuthToken();
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    // If we have a token, optimistically assume authenticated
    // This prevents showing login screen while verifying
    setIsAuthenticated(true);
    
    try {
      const response = await authApi.getProfile();
      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        // Token exists but profile not returned - might be invalid
        // But don't clear it yet, might be API format issue
        console.warn('Profile response missing user data:', response);
        setIsAuthenticated(true); // Keep authenticated if we have token
        setAuthError(null);
      }
    } catch (error: any) {
      // Only clear token on authentication errors (401, 403)
      // Don't clear on network errors or other errors - token might still be valid
      const status = error?.status || error?.response?.status;
      const isAuthError = status === 401 || status === 403 ||
                         error?.message?.includes('401') || 
                         error?.message?.includes('403') ||
                         error?.message?.includes('Unauthorized') ||
                         error?.message?.includes('Forbidden');
      
      if (isAuthError) {
        // Token is invalid or expired - clear it
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setAuthError(error?.message || 'Authentication failed');
      } else {
        // Network error or other error - keep token and assume still authenticated
        // This prevents clearing valid tokens due to temporary network issues
        setIsAuthenticated(true); // Keep authenticated if we have a token
        setAuthError(null); // Don't show error for network issues
        console.warn('Failed to verify session, but keeping token:', error?.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    revalidate();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.token) {
        setUser(response.user);
        setIsAuthenticated(true);
        setAuthError(null);
        return true;
      }
      setAuthError('Invalid credentials');
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError(error?.message || String(error));
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      return response.success;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, authError, revalidate, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
