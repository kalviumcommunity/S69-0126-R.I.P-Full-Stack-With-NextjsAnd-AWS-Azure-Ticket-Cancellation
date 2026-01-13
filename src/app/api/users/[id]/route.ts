import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { userSchema, userUpdateSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

// TODO: Import your database client here
// import { db } from '@/lib/db';

/**
 * GET /api/users/:id
 * Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return sendError(
        "Invalid user ID format",
        ERROR_CODES.INVALID_FORMAT,
        400
      );
    }

    // TODO: Fetch user from database
    // const user = await db.user.findUnique({ where: { id: userId } });
    const user = null;

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(user, "User fetched successfully", 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return sendError(
      "Failed to fetch user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      errorMessage
    );
  }
}

/**
 * PUT /api/users/:id
 * Update a user (full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    if (isNaN(userId)) {
      return sendError(
        "Invalid user ID format",
        ERROR_CODES.INVALID_FORMAT,
        400
      );
    }

    // Validate request body with Zod
    const validatedData = userSchema.parse(body);

    // TODO: Check if user exists
    // const existingUser = await db.user.findUnique({ where: { id: userId } });
    // if (!existingUser) {
    //   return sendError(
    //     'User not found',
    //     ERROR_CODES.NOT_FOUND,
    //     404
    //   );
    // }

    // TODO: Check if email is taken by another user
    // const emailTaken = await db.user.findFirst({
    //   where: { email: validatedData.email, NOT: { id: userId } },
    // });
    // if (emailTaken) {
    //   return sendError(
    //     'Email already exists',
    //     ERROR_CODES.DUPLICATE_RESOURCE,
    //     409
    //   );
    // }

    // TODO: Update user in database
    // const updatedUser = await db.user.update({
    //   where: { id: userId },
    //   data: { name: validatedData.name, email: validatedData.email, age: validatedData.age },
    // });
    const updatedUser = { 
      id: userId, 
      name: validatedData.name, 
      email: validatedData.email,
      age: validatedData.age
    };

    return sendSuccess(updatedUser, 'User updated successfully', 200);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return sendError(
        'Validation failed',
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.issues.map((e) => ({ 
          field: e.path.join('.'), 
          message: e.message 
        }))
      );
    }

    return sendError(
      "Failed to update user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      errorMessage
    );
  }
}

/**
 * PATCH /api/users/:id
 * Update a user (partial update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    if (isNaN(userId)) {
      return sendError(
        "Invalid user ID format",
        ERROR_CODES.INVALID_FORMAT,
        400
      );
    }

    // Validate request body with Zod (partial schema allows optional fields)
    const validatedData = userUpdateSchema.parse(body);

    // Check if at least one field is provided
    if (Object.keys(validatedData).length === 0) {
      return sendError(
        'At least one field must be provided for update',
        ERROR_CODES.MISSING_FIELD,
        400
      );
    }

    // TODO: Check if user exists
    // const existingUser = await db.user.findUnique({ where: { id: userId } });
    // if (!existingUser) {
    //   return sendError(
    //     'User not found',
    //     ERROR_CODES.NOT_FOUND,
    //     404
    //   );
    // }

    // TODO: Check if email is taken by another user
    // if (validatedData.email) {
    //   const emailTaken = await db.user.findFirst({
    //     where: { email: validatedData.email, NOT: { id: userId } },
    //   });
    //   if (emailTaken) {
    //     return sendError(
    //       'Email already exists',
    //       ERROR_CODES.DUPLICATE_RESOURCE,
    //       409
    //     );
    //   }
    // }

    // TODO: Partial update in database
    // const updatedUser = await db.user.update({
    //   where: { id: userId },
    //   data: validatedData,
    // });
    const updatedUser = { id: userId, ...validatedData };

    return sendSuccess(updatedUser, 'User updated successfully', 200);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return sendError(
        'Validation failed',
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.issues.map((e) => ({ 
          field: e.path.join('.'), 
          message: e.message 
        }))
      );
    }

    return sendError(
      "Failed to update user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      errorMessage
    );
  }
}

/**
 * DELETE /api/users/:id
 * Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return sendError(
        "Invalid user ID format",
        ERROR_CODES.INVALID_FORMAT,
        400
      );
    }

    // TODO: Delete user from database
    // const deletedUser = await db.user.delete({ where: { id: userId } });
    const deletedUser = { id: userId, name: "", email: "" };

    return sendSuccess(deletedUser, "User deleted successfully", 200);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return sendError(
      "Failed to delete user",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      errorMessage
    );
  }
}
