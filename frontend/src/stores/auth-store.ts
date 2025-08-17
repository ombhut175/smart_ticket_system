"use client";

import { create } from "zustand";
import { authService } from "@/services/auth.service";
import { resetRedirectFlag } from "@/lib/api";
import type { User, LoginData, SignupData } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  // actions
  initialize: () => Promise<void>;
  login: (credentials: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  initialized: false,
  isAuthenticated: false,

  initialize: async () => {
    const { initialized } = get();
    if (initialized) return;
    try {
      const userData = await authService.getCurrentUser();
      // Compute display name for backward compatibility
      const name = userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.first_name || userData.last_name || userData.email.split("@")[0];
      (userData as any).name = name;
      set({ user: userData, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false, initialized: true });
    }
  },

  login: async (credentials) => {
    const { user } = await authService.login(credentials);
    const name = user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name || user.last_name || user.email.split("@")[0];
    (user as any).name = name;
    set({ user, isAuthenticated: true });
    resetRedirectFlag();
  },

  signup: async (data) => {
    const { user: newUser } = await authService.signup(data);
    const name = newUser.first_name && newUser.last_name
      ? `${newUser.first_name} ${newUser.last_name}`
      : newUser.first_name || newUser.last_name || newUser.email.split("@")[0];
    (newUser as any).name = name;
    set({ user: newUser, isAuthenticated: true });
    resetRedirectFlag();
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  refreshUser: async () => {
    try {
      const userData = await authService.getCurrentUser();
      const name = userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.first_name || userData.last_name || userData.email.split("@")[0];
      (userData as any).name = name;
      set({ user: userData, isAuthenticated: true });
      resetRedirectFlag();
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));

// Optional convenience selector hooks
export const useAuth = () => useAuthStore((s) => ({
  user: s.user,
  isLoading: s.isLoading,
  isAuthenticated: s.isAuthenticated,
  login: s.login,
  signup: s.signup,
  logout: s.logout,
  refreshUser: s.refreshUser,
}));

