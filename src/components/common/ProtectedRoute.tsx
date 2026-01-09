import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * ProtectedRoute component props
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  allowedRoles?: ('user' | 'admin' | 'moderator')[];
}

/**
 * ProtectedRoute component wraps routes that require authentication
 *
 * @example
 * // Admin only
 * <ProtectedRoute requireAdmin>
 *   <AdminPage />
 * </ProtectedRoute>
 * 
 * // Admin or Moderator
 * <ProtectedRoute allowedRoles={['admin', 'moderator']}>
 *   <ModerationPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireModerator = false,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (requireModerator && !['admin', 'moderator'].includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || 'user')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
