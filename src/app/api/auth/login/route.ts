import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { loginSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import { findUserByEmail } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = findUserByEmail(data.email);
    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      return sendError("Invalid credentials", ERROR_CODES.UNAUTHORIZED, 401);
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return sendSuccess(
      { token },
      "Login successful",
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      );
    }
    return sendError("Login failed", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
