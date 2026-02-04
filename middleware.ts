import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/login",
    "/api/webhooks/clerk",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/send-otp",
    "/api/auth/verify-otp",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
    // Skip Clerk middleware for admin routes entirely
    if (req.nextUrl.pathname.startsWith("/api/admin")) {
        return NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // Get Clerk auth state
    const { userId } = await auth();

    // Check for traditional cookie-based auth
    const token = req.cookies.get("token")?.value;
    const accessToken = req.cookies.get("accessToken")?.value;

    // Allow if either Clerk auth OR traditional auth is present
    if (userId || token || accessToken) {
        return NextResponse.next();
    }

    // Redirect to login if not authenticated
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
