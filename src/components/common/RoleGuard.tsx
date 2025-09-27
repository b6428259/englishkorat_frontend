"use client";
import { ReactNode } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  roles?: UserRole | UserRole[];
  minRole?: UserRole;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  minRole,
  fallback = null,
  requireAuth = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return fallback;
  }

  // If no role restrictions, show content
  if (!roles && !minRole) {
    return <>{children}</>;
  }

  // Check specific roles
  if (roles) {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    if (!user || !rolesArray.includes(user.role)) {
      return <>{fallback}</>;
    }
  }

  // Check minimum role level
  if (minRole) {
    const roleHierarchy: Record<UserRole, number> = {
      student: 1,
      teacher: 2,
      admin: 3,
      owner: 4,
    };

    if (!user || roleHierarchy[user.role] < roleHierarchy[minRole]) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
