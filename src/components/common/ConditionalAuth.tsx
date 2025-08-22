"use client";
import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ConditionalAuthProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  minRole?: UserRole;
  redirectTo?: string;
}

export const ConditionalAuth: React.FC<ConditionalAuthProps> = ({
  children,
  requiredRoles,
  minRole,
  redirectTo = '/auth',
}) => {
  const { user, isAuthenticated, isLoading, hasRole, hasMinRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth',
    '/login',
    '/register',
  ];
  
  // ทุกหน้าที่ขึ้นต้นด้วย /public เป็น public path
  const isPublicPath = pathname.startsWith('/public/') || publicPaths.includes(pathname);

  useEffect(() => {
    // Skip authentication check for public paths
    if (isPublicPath) {
      return;
    }

    if (!isLoading) {
      // Redirect to auth if not authenticated and not on public path
      if (!isAuthenticated) {
        router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role-based access for authenticated users
      if (requiredRoles && !hasRole(requiredRoles)) {
        router.replace('/dashboard');
        return;
      }

      if (minRole && !hasMinRole(minRole)) {
        router.replace('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, minRole, router, hasRole, hasMinRole, redirectTo, pathname, isPublicPath]);

  // Show loading while checking authentication (only for protected routes)
  if (!isPublicPath && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render anything while redirecting (only for protected routes)
  if (!isPublicPath && !isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check role restrictions for authenticated users on protected routes
  if (!isPublicPath && isAuthenticated) {
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
  }

  return <>{children}</>;
};
