/**
 * Role-Based Access Control Components
 *
 * Provides React components for conditional rendering based on user roles
 */

"use client";

import { ReactNode } from "react";

export interface UserSession {
  user: {
    id: number;
    email: string;
    role: "admin" | "user";
    name?: string;
  };
}

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<"admin" | "user">;
  session: UserSession | null;
  fallback?: ReactNode;
}

/**
 * RoleGuard - Conditionally render children based on user role
 *
 * @example
 * <RoleGuard allowedRoles={["admin"]} session={session}>
 *   <button>Delete User</button>
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  session,
  fallback = null,
}: RoleGuardProps) {
  if (!session || !allowedRoles.includes(session.user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: string;
  session: UserSession | null;
  fallback?: ReactNode;
}

/**
 * PermissionGuard - Conditionally render based on permission
 * Note: This is a simplified client-side check. Always enforce on backend.
 */
export function PermissionGuard({
  children,
  requiredPermission,
  session,
  fallback = null,
}: PermissionGuardProps) {
  if (!session) {
    return <>{fallback}</>;
  }

  // Simple permission mapping (in production, fetch from API)
  const adminPermissions = [
    "bus.create",
    "bus.update",
    "bus.delete",
    "booking.read.all",
    "booking.cancel.all",
  ];

  const userPermissions = [
    "booking.create",
    "booking.read.own",
    "booking.cancel.own",
  ];

  const hasPermission =
    session.user.role === "admin"
      ? adminPermissions.includes(requiredPermission)
      : userPermissions.includes(requiredPermission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  session: UserSession | null;
  fallback?: ReactNode;
}

/**
 * AdminOnly - Shorthand for admin-only content
 */
export function AdminOnly({
  children,
  session,
  fallback = null,
}: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles={["admin"]} session={session} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface AuthenticatedProps {
  children: ReactNode;
  session: UserSession | null;
  fallback?: ReactNode;
}

/**
 * Authenticated - Show content only to logged-in users
 */
export function Authenticated({
  children,
  session,
  fallback = null,
}: AuthenticatedProps) {
  if (!session) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
