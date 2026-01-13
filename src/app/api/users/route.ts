import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { userSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

// TODO: Import your database client here
// import { db } from '@/lib/db';

/**
 * GET /api/users
 * Get all users
 */
export async function GET() {
  try {
    // TODO: Replace with database query
    // const users = await db.user.findMany();
    const users: any[] = [];
    
    return sendSuccess(users, 'Users fetched successfully', 200);
  } catch (error) {
    return sendError(
      'Failed to fetch users',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validatedData = userSchema.parse(body);

    // TODO: Check if email already exists in database
    // const existingUser = await db.user.findUnique({ where: { email: validatedData.email } });
    // if (existingUser) {
    //   return sendError(
    //     'Email already exists',
    //     ERROR_CODES.DUPLICATE_RESOURCE,
    //     409
    //   );
    // }

    // TODO: Create user in database
    // const newUser = await db.user.create({
    //   data: {
    //     name: validatedData.name,
    //     email: validatedData.email,
    //     age: validatedData.age,
    //   },
    // });
    const newUser = { 
      id: 0, 
      name: validatedData.name, 
      email: validatedData.email,
      age: validatedData.age
    };

    return sendSuccess(newUser, 'User created successfully', 201);
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
      'Failed to create user',
      ERROR_CODES.INTERNAL_ERROR,
      500,
      error
    );
  }
}
