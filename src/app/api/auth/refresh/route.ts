import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth";
import { handleError, AuthenticationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

/**
 * Refresh the access token using a valid refresh token
 *
 * This endpoint validates the refresh token from cookies and issues a new access token.
 * The refresh token is used to prevent the need to store passwords and allow seamless
 * re-authentication without user interaction.
 *
 * Security Flow:
 * 1. Client requests new access token with refresh token from cookie
 * 2. Server validates refresh token signature and expiry
 * 3. Server issues new access token (15 min lifespan)
 * 4. Server returns new access token (also in cookie and response)
 */
export async function POST(request: NextRequest) {
  try {
    // Extract refresh token from cookies
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      throw new AuthenticationError("Refresh token missing");
    }

    try {
      // Verify the refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Generate new access token
      const newAccessToken = signAccessToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      });

      logger.info("Access token refreshed", {
        userId: decoded.id,
        email: decoded.email,
      });

      const response = NextResponse.json(
        {
          success: true,
          data: { accessToken: newAccessToken },
          message: "Access token refreshed successfully",
        },
        { status: 200 }
      );

      // Update the access token cookie
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60, // 15 minutes
        path: "/",
      });

      return response;
    } catch (tokenError) {
      if (
        tokenError instanceof Error &&
        tokenError.message.includes("expired")
      ) {
        throw new AuthenticationError(
          "Refresh token has expired. Please log in again."
        );
      }
      throw new AuthenticationError("Invalid refresh token");
    }
  } catch (error) {
    logger.error("Token refresh failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return handleError(error, "POST /api/auth/refresh");
  }
}
