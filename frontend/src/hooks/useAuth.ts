import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_profile_completed: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await apiClient.getCurrentUser();
      
      // Add name property for compatibility
      const userWithName = {
        ...userData,
        name: userData.first_name && userData.last_name 
          ? `${userData.first_name} ${userData.last_name}`
          : userData.email
      };
      
      setUser(userWithName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
      console.log('Auth error:', errorMessage);
      
      // Don't set error state for authentication failures, just set user to null
      if (errorMessage.includes('authentication') || errorMessage.includes('401')) {
        setError(null);
      } else {
        setError(errorMessage);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.login(email, password);
      await fetchUser(); // Refresh user data after login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.register(email, password);
      await fetchUser(); // Refresh user data after registration
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: { first_name?: string; last_name?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await apiClient.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    refetch: fetchUser,
  };
}
