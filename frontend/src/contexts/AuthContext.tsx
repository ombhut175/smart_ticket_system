'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginData, SignupData } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginData) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Function to get user's display name
  const getUserDisplayName = (user: User): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.last_name) {
      return user.last_name;
    }
    return user.email.split('@')[0];
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        // Add computed name field for backward compatibility
        userData.name = getUserDisplayName(userData);
        setUser(userData);
      } catch (error) {
        // User is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginData): Promise<void> => {
    try {
      const { user: userData } = await authService.login(credentials);
      userData.name = getUserDisplayName(userData);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (userData: SignupData): Promise<void> => {
    try {
      const { user: newUser } = await authService.signup(userData);
      newUser.name = getUserDisplayName(newUser);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser();
      userData.name = getUserDisplayName(userData);
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
