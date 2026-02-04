import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface DecodedToken {
  id: number;
  email: string;
  role: "admin" | "user";
}

// Define routes that require the custom JWT/Admin check
// We want to keep the existing logic for /api/admin/* and /api/users/*
const isProtectedApiRoute = createRouteMatcher(["/api/admin(.*)", "/api/users(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Run the detailed custom auth logic ONLY for specific API routes
  if (isProtectedApiRoute(req)) {
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
    // "admin-token" is used specifically for the hardcoded admin login
    if (token === "secure-session" || token === "admin-token") {
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

  // default protection for other routes (if any)
  // for now, we just proceed
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
