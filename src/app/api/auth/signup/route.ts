import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signupSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { sanitizePayload } from "@/lib/sanitizer";
import {
  handleError,
  ConflictError,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = sanitizePayload(await request.json(), {
      skipKeys: ["password"],
    });
    const data = signupSchema.parse(body);

    const existing = findUserByEmail(data.email);
    if (existing) {
      throw new ConflictError("User already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      age: data.age,
    });

    // Generate access and refresh tokens using jose
    const accessToken = await signAccessToken({
      id: created.id,
      email: created.email,
      role: created.role,
    });

    const refreshToken = await signRefreshToken({
      id: created.id,
      email: created.email,
      role: created.role,
    });

    logger.info("User signed up successfully", {
      email: created.email,
      userId: created.id,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: toPublicUser(created),
        message: "Signup successful",
      },
      { status: 201 }
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
      return handleError(validationError, "POST /api/auth/signup");
    }

    return handleError(error, "POST /api/auth/signup");
  }
}
