import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { loginSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import { findUserByEmail } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { handleError, NotFoundError, AuthenticationError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = findUserByEmail(data.email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    logger.info('User logged in successfully', { email: user.email, userId: user.id });
    return NextResponse.json(
      {
        success: true,
        data: { token },
        message: "Login successful",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = new ValidationError(
        'Validation failed: ' + error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
      return handleError(validationError, 'POST /api/auth/login');
    }
    return handleError(error, 'POST /api/auth/login');
  }
}
