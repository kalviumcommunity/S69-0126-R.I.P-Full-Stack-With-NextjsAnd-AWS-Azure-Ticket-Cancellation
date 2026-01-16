import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface DecodedToken {
  id: number;
  email: string;
  role: "admin" | "user";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect specific routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

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
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
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
