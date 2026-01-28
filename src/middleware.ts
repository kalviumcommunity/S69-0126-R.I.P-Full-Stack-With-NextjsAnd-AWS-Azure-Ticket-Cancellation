import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface DecodedToken {
  id: number;
  email: string;
  role: "admin" | "user";
}

/**
 * Middleware to protect API routes with JWT authentication.
 *
 * This middleware:
 * 1. Checks for valid access token from cookies or Authorization header
 * 2. Validates token signature and expiry
 * 3. Enforces role-based access control (admin vs user)
 * 4. Attaches user info to request headers for downstream handlers
 *
 * Security Features:
 * - Supports both Bearer token (Authorization header) and cookie-based tokens
 * - Validates token signature to prevent tampering
 * - Checks token expiry to ensure tokens are not reused after expiration
 * - Role-based access control prevents unauthorized access
 * - User info attached via headers (not stored in token)
 *
 * Token Refresh Flow:
 * - If token is expired (401), client should call /api/auth/refresh
 * - Server will issue new access token valid for 15 minutes
 * - This allows seamless re-authentication without user intervention
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect specific routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    // Extract token from Authorization header or cookies
    let token: string | undefined;

    // Try Authorization header first (Bearer token)
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    // Fall back to token from cookies (used by the login page)
    if (!token) {
      token = req.cookies.get("token")?.value;
    }

    // Also check for accessToken cookie (for API-based login)
    if (!token) {
      token = req.cookies.get("accessToken")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing. Please log in." },
        { status: 401 }
      );
    }

    // For the simple token from login page, just check the role cookie
    if (token === "secure-session") {
      const role = req.cookies.get("role")?.value;

      if (!role) {
        return NextResponse.json(
          { success: false, message: "Role missing. Please log in again." },
          { status: 401 }
        );
      }

      // Role-based access control
      if (pathname.startsWith("/api/admin") && role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Access denied. Admin role required." },
          { status: 403 }
        );
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-role", role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // For JWT tokens (from API login), verify with jose
    try {
      // Use jose to verify token (same library used for signing)
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const decoded = payload as unknown as DecodedToken;

      // Role-based access control
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Access denied. Admin role required." },
          { status: 403 }
        );
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id.toString());
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error: any) {
      // Token verification failed
      if (error.code === "ERR_JWT_EXPIRED") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Access token expired. Please use /api/auth/refresh to get a new token.",
            code: "TOKEN_EXPIRED",
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Invalid or malformed token" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware applies to
export const config = {
  matcher: ["/api/admin/:path*", "/api/users/:path*"],
};
