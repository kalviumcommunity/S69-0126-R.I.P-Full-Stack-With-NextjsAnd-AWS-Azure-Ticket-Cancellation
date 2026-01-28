/**
 * RBAC Configuration - Role-Based Access Control
 *
 * This file defines the permissions for each role in the system.
 * Each role has a set of permissions that determine what actions they can perform.
 *
 * Roles:
 * - admin: Full system access - can manage buses, view all bookings, manage all operations
 * - user: Limited access - can view and manage only their own bookings
 *
 * Permissions:
 * - bus.create: Create new bus routes
 * - bus.read: View bus route details
 * - bus.update: Update bus route information
 * - bus.delete: Remove bus routes
 * - booking.create: Create new bookings
 * - booking.read.own: View own bookings
 * - booking.read.all: View all bookings (admin)
 * - booking.update.own: Update own bookings
 * - booking.update.all: Update any booking (admin)
 * - booking.cancel.own: Cancel own bookings
 * - booking.cancel.all: Cancel any booking (admin)
 * - user.read.all: View all users
 * - user.update.all: Update any user
 */

export type Permission =
  | "bus.create"
  | "bus.read"
  | "bus.update"
  | "bus.delete"
  | "booking.create"
  | "booking.read.own"
  | "booking.read.all"
  | "booking.update.own"
  | "booking.update.all"
  | "booking.cancel.own"
  | "booking.cancel.all"
  | "user.read.all"
  | "user.update.all";

export type Role = "admin" | "user";

/**
 * Role to Permissions mapping
 */
export const roles: Record<Role, Permission[]> = {
  admin: [
    "bus.create",
    "bus.read",
    "bus.update",
    "bus.delete",
    "booking.create",
    "booking.read.own",
    "booking.read.all",
    "booking.update.own",
    "booking.update.all",
    "booking.cancel.own",
    "booking.cancel.all",
    "user.read.all",
    "user.update.all",
  ],
  user: [
    "bus.read",
    "booking.create",
    "booking.read.own",
    "booking.cancel.own",
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: Role, permission: Permission): boolean => {
  return roles[role]?.includes(permission) || false;
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (
  role: Role,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (
  role: Role,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: Role): Permission[] => {
  return roles[role] || [];
};

/**
 * Role descriptions for documentation
 */
export const roleDescriptions: Record<Role, string> = {
  admin:
    "Full system access - can manage buses, view all bookings, and perform all operations",
  user: "Standard user - can view buses and manage their own bookings",
};
