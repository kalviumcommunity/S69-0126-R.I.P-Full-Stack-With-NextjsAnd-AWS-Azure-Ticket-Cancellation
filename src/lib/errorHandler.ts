/**
 * Centralized Error Handler
 * 
 * Handles all API errors consistently across the application.
 * - In development: Returns detailed error messages and stack traces
 * - In production: Returns safe, user-friendly messages and logs details internally
 */

import { NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Custom error types for better error classification
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Main error handler function
 * 
 * @param error - The error object to handle
 * @param context - Context string (e.g., "GET /api/users")
 * @returns NextResponse with formatted error
 */
export function handleError(error: any, context: string): NextResponse {
  const isProd = process.env.NODE_ENV === "production";
  
  // Determine status code
  let statusCode = 500;
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  }

  // Prepare user-facing error message
  const userMessage = isProd
    ? getProductionMessage(statusCode)
    : error.message || "Unknown error";

  // Prepare error response
  const errorResponse: any = {
    success: false,
    message: userMessage,
    timestamp: new Date().toISOString(),
  };

  // Include stack trace only in development
  if (!isProd && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Include error type for better client-side handling
  if (error instanceof AppError) {
    errorResponse.errorType = error.constructor.name;
  }

  // Log error with full details
  logger.error(`Error in ${context}`, {
    message: error.message,
    statusCode,
    errorType: error.constructor?.name || "Error",
    stack: isProd ? "REDACTED" : error.stack,
    context,
  });

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Get production-safe error messages based on status code
 */
function getProductionMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "Invalid request. Please check your input.";
    case 401:
      return "Authentication required.";
    case 403:
      return "You don't have permission to access this resource.";
    case 404:
      return "The requested resource was not found.";
    case 409:
      return "This operation conflicts with existing data.";
    case 500:
    default:
      return "Something went wrong. Please try again later.";
  }
}

/**
 * Async error wrapper for route handlers
 * Eliminates the need for try-catch in every route
 * 
 * @param handler - The async route handler function
 * @param context - Context string for error logging
 * @returns Wrapped handler with automatic error handling
 */
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>,
  context: string
) {
  return async (req: Request, routeContext?: any): Promise<NextResponse> => {
    try {
      return await handler(req, routeContext);
    } catch (error) {
      return handleError(error, context);
    }
  };
}
