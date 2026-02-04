import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signupSchema } from "@/lib/schemas/authSchema";
import redis from "@/lib/redis";
import { ZodError } from "zod";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { sanitizePayload } from "@/lib/sanitizer";
import {
  ConflictError,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    console.log("=== SIGNUP REQUEST ===");
    const rawBody = await request.json();
    console.log("Raw body received:", rawBody);

    const body = sanitizePayload(rawBody, {
      skipKeys: ["password"],
    });
    console.log("Sanitized body:", body);

    const data = signupSchema.parse(body);
    console.log("Parsed/validated data:", data);

    const existing = await findUserByEmail(data.email);
    if (existing) {
      console.log("User already exists:", data.email);
      throw new ConflictError("User already exists");
    }

    // Verify OTP
    if (!data.otp) {
      console.log("OTP missing");
      throw new ValidationError("OTP is required");
    }

    const storedOtp = await redis.get(`otp:${data.email}`);
    if (!storedOtp) {
      console.log("OTP expired or not found for:", data.email);
      throw new ValidationError("OTP expired or invalid. Please request a new one.");
    }

    if (storedOtp !== data.otp) {
      console.log("Invalid OTP provided");
      throw new ValidationError("Invalid OTP. Please try again.");
    }

    // OTP verified, delete it to prevent reuse
    await redis.del(`otp:${data.email}`);

    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = await createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      age: data.age,
    });
    console.log("User created:", created.id);

    // Map database enum role back to lowercase for tokens
    const roleMap = {
      PASSENGER: "user",
      OPERATOR: "user",
      ADMIN: "admin",
    } as const;
    const normalizedRole = roleMap[created.role as keyof typeof roleMap];

    // Generate access and refresh tokens using jose
    const accessToken = await signAccessToken({
      id: created.id,
      email: created.email,
      role: normalizedRole,
    });

    const refreshToken = await signRefreshToken({
      id: created.id,
      email: created.email,
      role: normalizedRole,
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

    console.log("=== SIGNUP SUCCESS ===");
    return response;
  } catch (error) {
    console.error("=== SIGNUP ERROR ===", error);

    if (error instanceof ZodError) {
      // Return all field errors as an object: { field: message }
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const field = err.path.join(".");
        fieldErrors[field] = err.message;
      });
      console.log("Zod validation errors:", fieldErrors);
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error instanceof ConflictError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          fieldErrors: {},
        },
        { status: 409 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          fieldErrors: {},
        },
        { status: 400 }
      );
    }

    let errorMessage = "Signup failed";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log("Error response:", errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        fieldErrors: {},
      },
      { status: 500 }
    );
  }
}
