import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { loginSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import prisma from "@/lib/db";
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
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Hardcoded admin credentials check
    const ADMIN_EMAIL = "Admin@kalvium.com";
    const ADMIN_PASSWORD = "12345";

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedAdminEmail = ADMIN_EMAIL.toLowerCase();

    logger.info("Login attempt received", { email: normalizedEmail });

    if (normalizedEmail === normalizedAdminEmail) {
      if (password !== ADMIN_PASSWORD) {
        logger.warn("Admin password mismatch");
        return NextResponse.json({
          success: false,
          error: "Admin password incorrect"
        }, { status: 401 });
      }

      logger.info("Admin credentials matched");
      // Admin login successful
      const accessToken = await signAccessToken({
        id: 0,
        email: ADMIN_EMAIL,
        role: "admin",
      });

      const refreshToken = await signRefreshToken({
        id: 0,
        email: ADMIN_EMAIL,
        role: "admin",
      });

      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          email: ADMIN_EMAIL,
          role: "admin",
          name: "Admin"
        }
      });

      // Set cookies
      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      });

      response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60, // 90 days
        path: "/",
      });

      // Public cookie for UI state
      response.cookies.set("role", "admin", {
        httpOnly: false, // Allow client JS to read this
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      });

      logger.info("Admin login successful", { email: ADMIN_EMAIL });
      return response;
    }

    // Regular user login - validate with schema
    // Sanitize payload before parsing with Zod
    const sanitizedBody = sanitizePayload(body, {
      skipKeys: ["password"],
    });
    const validatedData = loginSchema.parse(sanitizedBody);

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      logger.warn("Login failed: User not found", { email: validatedData.email });
      throw new NotFoundError("User not found"); // Changed to throw NotFoundError for consistency
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      logger.warn("Login failed: OAuth user trying password login", { email: validatedData.email });
      return NextResponse.json(
        { success: false, error: "Please sign in with Google" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(validatedData.password, user.password);
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate access and refresh tokens using jose
    // Convert role to lowercase to match expected format
    const role = user.role === "ADMIN" ? "admin" : "user";

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: role,
    });

    const refreshToken = await signRefreshToken({
      id: user.id,
      email: user.email,
      role: role,
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
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 90 * 24 * 60 * 60, // 90 days in seconds
      path: "/",
    });

    // Public cookie for UI state
    response.cookies.set("role", role, {
      httpOnly: false, // Allow client JS to read this
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
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
