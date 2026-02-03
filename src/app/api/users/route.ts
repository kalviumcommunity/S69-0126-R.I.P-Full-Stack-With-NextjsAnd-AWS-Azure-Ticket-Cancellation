import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import { getPublicUsers } from "@/lib/db";
import {
  handleError,
  AuthenticationError,
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
 * GET /api/users
 * Get all users (Protected - requires valid JWT)
 *
 * Cache Strategy: Cache-Aside Pattern
 * - Check Redis cache first
 * - If hit, return cached data (low latency)
 * - If miss, fetch from DB and cache for future requests
 */
export async function GET(request: NextRequest) {
  try {
    const userEmailHeader = request.headers.get("x-user-email");
    const userRoleHeader = request.headers.get("x-user-role");

    const userEmail = userEmailHeader ? sanitizeInput(userEmailHeader) : "";
    const userRole = userRoleHeader ? sanitizeInput(userRoleHeader) : "";

    if (!userEmail) {
      throw new AuthenticationError("Unauthorized access");
    }

    // Step 1: Check Redis Cache
    let cachedUsers = null;
    try {
      cachedUsers = await redis.get(CACHE_KEY_USERS_LIST);
    } catch (err) {
      logger.warn("Redis cache error, continuing without cache", { error: err });
    }
    
    if (cachedUsers) {
      logger.info("Cache Hit - Users fetched from Redis", { email: userEmail });
      return NextResponse.json(
        {
          success: true,
          data: {
            users: JSON.parse(cachedUsers),
            accessedBy: { email: userEmail, role: userRole },
            cacheStatus: "HIT",
          },
          message: "Users fetched successfully (from cache)",
        },
        { status: 200 }
      );
    }

    // Step 2: Cache Miss - Fetch from Database
    logger.info("Cache Miss - Fetching users from database", {
      email: userEmail,
    });
    const users = await getPublicUsers();

    // Step 3: Store in cache with TTL (non-blocking)
    try {
      await redis.setex(
        CACHE_KEY_USERS_LIST,
        CACHE_TTL_SECONDS,
        JSON.stringify(users)
      );
    } catch (err) {
      logger.warn("Redis cache set error, continuing", { error: err });
    }

    logger.info("Users fetched and cached successfully", {
      email: userEmail,
      count: users.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          accessedBy: { email: userEmail, role: userRole },
          cacheStatus: "MISS",
        },
        message: "Users fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "GET /api/users");
  }
}

/**
 * POST /api/users
 * Create a new user
 *
 * Cache Invalidation: After creating a new user, invalidate the users:list cache
 * to ensure next request fetches fresh data from database
 */
export async function POST(request: NextRequest) {
  try {
    const body = sanitizePayload(await request.json());

    // Validate request body with Zod
    const validatedData = userSchema.parse(body);


    // Check if email already exists in database
    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        age: validatedData.age,
        // Add other fields as needed
      },
    });

    // Invalidate cache - clear the users:list cache after new user creation
    await redis.del(CACHE_KEY_USERS_LIST);
    logger.info("Cache invalidated after user creation", {
      userId: newUser.id,
    });

    logger.info("User created successfully", {
      userId: newUser.id,
      email: newUser.email,
    });
    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "User created successfully",
      },
      { status: 201 }
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
      return handleError(validationError, "POST /api/users");
    }

    return handleError(error, "POST /api/users");
  }
}
