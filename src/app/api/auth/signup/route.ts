import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signupSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/db";
import { handleError, ConflictError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    logger.info('User signed up successfully', { email: created.email, userId: created.id });
    return NextResponse.json(
      {
        success: true,
        data: toPublicUser(created),
        message: "Signup successful",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = new ValidationError(
        'Validation failed: ' + error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
      return handleError(validationError, 'POST /api/auth/signup');
    }

    return handleError(error, 'POST /api/auth/signup');
  }
}
