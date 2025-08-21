"use client";
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  minRole?: UserRole;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  minRole,
  redirectTo = '/auth',
}) => {
  const { user, isAuthenticated, isLoading, hasRole, hasMinRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to auth if not authenticated
      if (!isAuthenticated) {
        router.replace(redirectTo);
        return;
      }

      // Check role-based access
      if (requiredRoles && !hasRole(requiredRoles)) {
        router.replace('/dashboard'); // Redirect to dashboard if role not allowed
        return;
      }

      if (minRole && !hasMinRole(minRole)) {
        router.replace('/dashboard'); // Redirect to dashboard if role level insufficient
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, minRole, router, hasRole, hasMinRole, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check role restrictions
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  if (minRole && !hasMinRole(minRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-gray-600">สิทธิ์การเข้าถึงไม่เพียงพอ</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
