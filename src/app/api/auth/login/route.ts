import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { loginSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import { findUserByEmail } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { sanitizePayload } from "@/lib/sanitizer";
import {
  handleError,
  NotFoundError,
  AuthenticationError,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = sanitizePayload(await request.json(), {
      skipKeys: ["password"],
    });
    const data = loginSchema.parse(body);

    const user = findUserByEmail(data.email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate access and refresh tokens
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = signRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info("User logged in successfully", {
      email: user.email,
      userId: user.id,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: { accessToken },
        message: "Login successful",
      },
      { status: 200 }
    );

    // Set HTTP-only, Secure, SameSite cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes in seconds
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = new ValidationError(
        "Validation failed: " +
          error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
      );
      return handleError(validationError, "POST /api/auth/login");
    }
    return handleError(error, "POST /api/auth/login");
  }
}
