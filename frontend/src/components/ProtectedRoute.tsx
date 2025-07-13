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
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user && user.role !== requiredRole) {
        // Check if user has sufficient privileges
        const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
        const userRoleLevel = roleHierarchy[user.role];
        const requiredRoleLevel = roleHierarchy[requiredRole];

        if (userRoleLevel < requiredRoleLevel) {
          router.push('/permission-denied');
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requiredRole, router, redirectTo]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (requireAuth && !isAuthenticated) {
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
