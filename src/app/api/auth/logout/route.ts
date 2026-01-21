import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Logout endpoint that clears authentication cookies
 *
 * Security Considerations:
 * - Clears both access and refresh tokens
 * - Uses HTTP-only cookies to prevent XSS attacks
 * - SameSite=Strict prevents CSRF attacks
 */
export async function POST(request: NextRequest) {
  try {
    logger.info("User logged out");

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Clear tokens by setting maxAge to 0
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    logger.error("Logout failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}
