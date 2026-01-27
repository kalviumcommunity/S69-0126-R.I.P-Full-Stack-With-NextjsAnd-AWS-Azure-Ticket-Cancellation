/**
 * RBAC Middleware - Role-Based Access Control
 *
 * Provides middleware utilities to enforce role-based permissions
 * on API routes and protect sensitive operations.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "./auth";
import { hasPermission, Permission, Role } from "@/config/roles";
import { logger } from "./logger";

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Extract and verify token from request
 */
export const extractAndVerifyToken = (
  req: NextRequest
): TokenPayload | null => {
  try {
    // Try Authorization header first (Bearer token)
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // Fall back to access token from cookies
    if (!token) {
      token = req.cookies.get("accessToken")?.value;
    }

    if (!token) {
      return null;
    }

    return verifyAccessToken(token);
  } catch (error) {
    logger.error("Token verification failed", { error });
    return null;
  }
};

/**
 * Check if user has required permission
 * Returns error response if not authorized
 */
export const requirePermission = (
  user: TokenPayload | null,
  permission: Permission,
  resource = "resource"
): NextResponse | null => {
  if (!user) {
    logger.warn(
      `[RBAC] Unauthenticated user attempted to access ${resource}: DENIED`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      },
      { status: 401 }
    );
  }

  const allowed = hasPermission(user.role as Role, permission);

  if (!allowed) {
    logger.warn(
      `[RBAC] ${user.role} (${user.email}) attempted to access ${resource} with permission ${permission}: DENIED`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Insufficient permissions",
        message: `You do not have permission to ${permission}`,
      },
      { status: 403 }
    );
  }

  logger.info(
    `[RBAC] ${user.role} (${user.email}) accessed ${resource} with permission ${permission}: ALLOWED`
  );

  return null; // No error, user is authorized
};

/**
 * Check if user has required role
 * Returns error response if not authorized
 */
export const requireRole = (
  user: TokenPayload | null,
  allowedRoles: Role[],
  resource = "resource"
): NextResponse | null => {
  if (!user) {
    logger.warn(
      `[RBAC] Unauthenticated user attempted to access ${resource}: DENIED`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      },
      { status: 401 }
    );
  }

  const allowed = allowedRoles.includes(user.role as Role);

  if (!allowed) {
    logger.warn(
      `[RBAC] ${user.role} (${user.email}) attempted to access ${resource} (required: ${allowedRoles.join(", ")}): DENIED`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Access denied",
        message: `Only ${allowedRoles.join(" or ")} can access this resource`,
      },
      { status: 403 }
    );
  }

  logger.info(
    `[RBAC] ${user.role} (${user.email}) accessed ${resource}: ALLOWED`
  );

  return null; // No error, user is authorized
};

/**
 * Check if user owns the resource (by userId)
 * Returns error response if not authorized
 */
export const requireOwnership = (
  user: TokenPayload | null,
  resourceOwnerId: number,
  resource = "resource"
): NextResponse | null => {
  if (!user) {
    logger.warn(
      `[RBAC] Unauthenticated user attempted to access ${resource}: DENIED`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      },
      { status: 401 }
    );
  }

  // Admin can access any resource
  if (user.role === "admin") {
    logger.info(
      `[RBAC] ${user.role} (${user.email}) accessed ${resource} as admin: ALLOWED`
    );
    return null;
  }

  // Check if user owns the resource
  if (user.id !== resourceOwnerId) {
    logger.warn(
      `[RBAC] ${user.role} (${user.email}) attempted to access ${resource} owned by user ${resourceOwnerId}: DENIED`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Access denied",
        message: "You can only access your own resources",
      },
      { status: 403 }
    );
  }

  logger.info(
    `[RBAC] ${user.role} (${user.email}) accessed own ${resource}: ALLOWED`
  );

  return null; // No error, user is authorized
};
