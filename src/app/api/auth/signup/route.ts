import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { signupSchema } from "@/lib/schemas/authSchema";
import { ZodError } from "zod";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    const existing = findUserByEmail(data.email);
    if (existing) {
      return sendError(
        "User already exists",
        ERROR_CODES.DUPLICATE_RESOURCE,
        409
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const created = createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      age: data.age,
    });

    return sendSuccess(toPublicUser(created), "Signup successful", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        "Validation failed",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.issues.map((e) => ({ field: e.path.join("."), message: e.message }))
      );
    }

    return sendError("Signup failed", ERROR_CODES.INTERNAL_ERROR, 500, error);
  }
}
