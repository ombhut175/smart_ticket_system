'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSkeleton } from '@/components/loading-skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'user' | 'moderator' | 'admin';
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to complete loading
    if (isLoading) return;
    
    // If we require auth and there's no user and we're not loading
    if (requireAuth && !user && !isLoading) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on auth pages
      if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
        router.push(redirectTo);
      }
      return;
    }

    // Check role permissions
    if (requiredRole && user) {
      const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
      const userRoleLevel = roleHierarchy[user.role];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        router.push('/permission-denied');
        return;
      }
    }
  }, [isLoading, user, requireAuth, requiredRole, router, redirectTo]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (requireAuth && !user && !isLoading) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && user) {
    const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return null; // Will redirect in useEffect
    }
  }

  return <>{children}</>;
};
