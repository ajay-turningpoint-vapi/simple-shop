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
    const token = getAuthToken();
    if (token) {
      try {
        const response = await authApi.getProfile();
        if (response.success && response.user) {
          setUser(response.user);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          // Token invalid, clear it
          setAuthToken(null);
          setIsAuthenticated(false);
          setAuthError('Token invalid or profile not returned');
        }
      } catch (error: any) {
        // Token invalid or expired or network error
        setAuthToken(null);
        setIsAuthenticated(false);
        setAuthError(error?.message || String(error));
      }
    } else {
      setAuthError(null);
      setIsAuthenticated(false);
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
