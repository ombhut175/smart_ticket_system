import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import type { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const me = await authService.getCurrentUser();

      const userWithName = {
        ...me,
        name: me.first_name && me.last_name
          ? `${me.first_name} ${me.last_name}`
          : me.email,
      } as User & { name: string };

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
      await authService.login({ email, password });
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
      await authService.logout();
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
      await authService.signup({ email, password });
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
      const updatedUser = await authService.getCurrentUser(); // placeholder to keep type, we update via profile page
      setUser({ ...updatedUser, ...profileData } as any);
      return updatedUser as any;
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
