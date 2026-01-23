import { NextRequest, NextResponse } from "next/server";
import { userSchema, userUpdateSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import {
  handleError,
  NotFoundError,
  ValidationError,
} from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import redis from "@/lib/redis";
import { sanitizeInput, sanitizePayload } from "@/lib/sanitizer";

// TODO: Import your database client here
// import { db } from '@/lib/db';

// Cache configuration
const CACHE_KEY_USERS_LIST = "users:list";
const CACHE_TTL_SECONDS = 60; // 1 minute TTL

/**
 * GET /api/users/:id
 * Get user by ID
 *
 * Cache Strategy: Cache-Aside Pattern
 * - Individual user data cached separately from the list
 * - Reduces database queries for frequently accessed users
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(sanitizeInput(id));

    if (isNaN(userId)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Step 1: Check Redis Cache for this specific user
    const cacheKey = `user:${userId}`;
    const cachedUser = await redis.get(cacheKey);

    if (cachedUser) {
      logger.info("Cache Hit - User fetched from Redis", { userId });
      return NextResponse.json(
        {
          success: true,
          data: JSON.parse(cachedUser),
          message: "User fetched successfully (from cache)",
          cacheStatus: "HIT",
        },
        { status: 200 }
      );
    }

    // Step 2: Cache Miss - Fetch user from database
    logger.info("Cache Miss - Fetching user from database", { userId });
    // TODO: Fetch user from database
    // const user = await db.user.findUnique({ where: { id: userId } });
    const user = null;

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Step 3: Store in cache with TTL
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(user));

    logger.info("User fetched and cached by ID", { userId });
    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "User fetched successfully",
        cacheStatus: "MISS",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, `GET /api/users/${(await params).id}`);
  }
}

/**
 * PUT /api/users/:id
 * Update a user (full update)
 *
 * Cache Invalidation: After updating a user, invalidate:
 * 1. The specific user cache (user:id)
 * 2. The users list cache (users:list) - since list data changed
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(sanitizeInput(id));
    const body = sanitizePayload(await _request.json());

    if (isNaN(userId)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Validate request body with Zod
    const validatedData = userSchema.parse(body);

    // TODO: Check if user exists
    // const existingUser = await db.user.findUnique({ where: { id: userId } });
    // if (!existingUser) {
    //   throw new NotFoundError('User not found');
    // }

    // TODO: Check if email is taken by another user
    // const emailTaken = await db.user.findFirst({
    //   where: { email: validatedData.email, NOT: { id: userId } },
    // });
    // if (emailTaken) {
    //   throw new ConflictError('Email already exists');
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
      age: validatedData.age,
    };

    // Invalidate cache - clear both user-specific and list caches
    await redis.del(`user:${userId}`);
    await redis.del(CACHE_KEY_USERS_LIST);
    logger.info("Cache invalidated after user update", { userId });

    logger.info("User updated successfully", { userId });
    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationError = new ValidationError(
        "Validation failed: " +
          error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
      );
      return handleError(
        validationError,
        `PUT /api/users/${(await params).id}`
      );
    }

    return handleError(error, `PUT /api/users/${(await params).id}`);
  }
}

/**
 * PATCH /api/users/:id
 * Update a user (partial update)
 *
 * Cache Invalidation: After updating a user, invalidate:
 * 1. The specific user cache (user:id)
 * 2. The users list cache (users:list) - since list data changed
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(sanitizeInput(id));
    const body = sanitizePayload(await _request.json());

    if (isNaN(userId)) {
      throw new ValidationError("Invalid user ID format");
    }

    // Validate request body with Zod (partial schema allows optional fields)
    const validatedData = userUpdateSchema.parse(body);

    // Check if at least one field is provided
    if (Object.keys(validatedData).length === 0) {
      throw new ValidationError(
        "At least one field must be provided for update"
      );
    }

    // TODO: Check if user exists
    // const existingUser = await db.user.findUnique({ where: { id: userId } });
    // if (!existingUser) {
    //   throw new NotFoundError('User not found');
    // }

    // TODO: Check if email is taken by another user
    // if (validatedData.email) {
    //   const emailTaken = await db.user.findFirst({
    //     where: { email: validatedData.email, NOT: { id: userId } },
    //   });
    //   if (emailTaken) {
    //     throw new ConflictError('Email already exists');
    //   }
    // }

    // TODO: Partial update in database
    // const updatedUser = await db.user.update({
    //   where: { id: userId },
    //   data: validatedData,
    // });
    const updatedUser = { id: userId, ...validatedData };

    // Invalidate cache - clear both user-specific and list caches
    await redis.del(`user:${userId}`);
    await redis.del(CACHE_KEY_USERS_LIST);
    logger.info("Cache invalidated after user partial update", {
      userId,
      fields: Object.keys(validatedData),
    });

    logger.info("User partially updated", {
      userId,
      fields: Object.keys(validatedData),
    });
    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationError = new ValidationError(
        "Validation failed: " +
          error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")
      );
      return handleError(
        validationError,
        `PATCH /api/users/${(await params).id}`
      );
    }

    return handleError(error, `PATCH /api/users/${(await params).id}`);
  }
}

/**
 * DELETE /api/users/:id
 * Delete a user
 *
 * Cache Invalidation: After deleting a user, invalidate:
 * 1. The specific user cache (user:id) - no longer needed
 * 2. The users list cache (users:list) - since list has changed
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(sanitizeInput(id));

    if (isNaN(userId)) {
      throw new ValidationError("Invalid user ID format");
    }

    // TODO: Delete user from database
    // const deletedUser = await db.user.delete({ where: { id: userId } });
    const deletedUser = { id: userId, name: "", email: "" };

    // Invalidate cache - clear both user-specific and list caches
    await redis.del(`user:${userId}`);
    await redis.del(CACHE_KEY_USERS_LIST);
    logger.info("Cache invalidated after user deletion", { userId });

    logger.info("User deleted", { userId });
    return NextResponse.json(
      {
        success: true,
        data: deletedUser,
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleError(error, `DELETE /api/users/${(await params).id}`);
  }
}
