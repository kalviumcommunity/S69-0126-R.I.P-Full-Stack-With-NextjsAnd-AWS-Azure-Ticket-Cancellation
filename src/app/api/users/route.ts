import { NextRequest, NextResponse } from 'next/server';
import { userSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';
import { getPublicUsers } from '@/lib/db';
import { handleError, AuthenticationError, ValidationError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

// TODO: Import your database client here
// import { db } from '@/lib/db';

/**
 * GET /api/users
 * Get all users (Protected - requires valid JWT)
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');

    if (!userEmail) {
      throw new AuthenticationError('Unauthorized access');
    }

    const users = getPublicUsers();
    logger.info('Users fetched successfully', { email: userEmail, count: users.length });
    
    return NextResponse.json(
      {
        success: true,
        data: {
          users,
          accessedBy: { email: userEmail, role: userRole },
        },
        message: 'Users fetched successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, 'GET /api/users');
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
    //   throw new ConflictError('Email already exists');
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

    logger.info('User created successfully', { userId: newUser.id, email: newUser.email });
    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'User created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const validationError = new ValidationError(
        'Validation failed: ' + error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
      return handleError(validationError, 'POST /api/users');
    }

    return handleError(error, 'POST /api/users');
  }
}
