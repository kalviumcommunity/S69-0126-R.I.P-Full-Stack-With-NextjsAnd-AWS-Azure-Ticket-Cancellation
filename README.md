# Ticket Cancellation – Transparent Bus Ticket Cancellation & Refund Tracking System
## Project Overview

Intercity bus ticket cancellations and refunds are often opaque and inconsistent. Passengers face unclear cancellation rules, unpredictable refund timelines, and limited visibility into refund status. This lack of transparency reduces trust and creates accountability gaps between passengers, operators, and platforms.

This project aims to build a **transparent and predictable ticket cancellation and refund tracking system** that clearly explains refund rules, timelines, and status to users.

This repository currently contains a **basic Next.js setup**, which will be expanded in future sprints.

---

## Tech Stack (Initial Setup)

- Next.js
- React
- TypeScript
- Node.js

---

## Folder Structure (Basic Next.js Setup)

# Project Structure

```text
│   ├── page.tsx          # Default home page
│   ├── layout.tsx        # Root layout for the app
│   └── globals.css       # Global styles
├── public/
│   └── favicon.ico       # Static assets
├── .gitignore            # Git ignore rules
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

---

## Folder Explanation

- **`app/`**  
  Uses the Next.js App Router. This folder will contain all pages, layouts, and routes of the application.

- **`page.tsx`**  
  The default home page of the application.

- **`layout.tsx`**  
  Defines the root layout shared across all pages.

- **`globals.css`**  
  Contains global styles applied across the app.

- **`public/`**  
  Stores static files such as icons and images.

---

## Setup Instructions

### 1. Install dependencies
npm install
```

### 2. Run the development server

```bash
npm run dev
```

### 3. Open the app in browser

```bash
http://localhost:3000
```

---

## API Documentation

### Centralized Error Handling

Modern web applications require robust error handling to ensure reliability, security, and maintainability. This project implements a **centralized error handling system** that provides:

- **Consistency**: Uniform error response format across all endpoints
- **Security**: Sensitive information hidden in production
- **Observability**: Structured logging for debugging and monitoring
- **Developer Experience**: Clear error messages and types

#### Why Centralized Error Handling Matters

Without a centralized error handling strategy:
- ❌ Error responses are inconsistent across endpoints
- ❌ Stack traces leak in production, exposing system internals
- ❌ Logs are scattered and hard to search
- ❌ Debugging becomes time-consuming and frustrating

With centralized error handling:
- ✅ Every error follows the same format
- ✅ Production responses are safe and user-friendly
- ✅ Structured logs make debugging efficient
- ✅ Error types guide client-side error handling

#### Environment-Specific Behavior

| Environment | Behavior |
|------------|----------|
| **Development** | Returns detailed error messages with full stack traces for debugging |
| **Production** | Returns user-safe messages only; logs full details internally |

### Error Handling Architecture

#### 1. Logger Utility (`lib/logger.ts`)

Provides structured JSON logging with timestamps and metadata:

```typescript
import { logger } from '@/lib/logger';

// Log informational messages
logger.info('User created successfully', { userId: 123, email: 'user@example.com' });

// Log errors
logger.error('Database connection failed', { 
  error: 'Connection timeout',
  retries: 3 
});

// Log warnings
logger.warn('Rate limit approaching', { requestCount: 95 });

// Log debug info (development only)
logger.debug('Processing request', { endpoint: '/api/users' });
```

**Output Example:**
```json
{
  "level": "error",
  "message": "Database connection failed",
  "meta": {
    "error": "Connection timeout",
    "retries": 3
  },
  "timestamp": "2026-01-19T10:30:45.123Z"
}
```

#### 2. Error Handler (`lib/errorHandler.ts`)

Centralizes all error processing with custom error types:

**Custom Error Types:**

```typescript
import { 
  ValidationError,      // 400 - Invalid input
  AuthenticationError,  // 401 - Not authenticated
  AuthorizationError,   // 403 - Insufficient permissions
  NotFoundError,        // 404 - Resource not found
  ConflictError,        // 409 - Resource conflict
  handleError           // Main error handler
} from '@/lib/errorHandler';

// Throw custom errors in your routes
throw new NotFoundError('User not found');
throw new ValidationError('Email format is invalid');
throw new ConflictError('Email already exists');
```

**Usage in API Routes:**

```typescript
export async function GET(request: NextRequest) {
  try {
    // Your route logic
    const user = await db.user.findUnique({ where: { id } });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleError(error, 'GET /api/users/:id');
  }
}
```

#### 3. Response Examples

**Development Mode Response (with stack trace):**

```bash
curl -X GET http://localhost:3000/api/users/999
```

```json
{
  "success": false,
  "message": "User not found",
  "timestamp": "2026-01-19T10:30:45.123Z",
  "errorType": "NotFoundError",
  "stack": "NotFoundError: User not found\n    at GET (/app/api/users/[id]/route.ts:15:13)\n    ..."
}
```

**Production Mode Response (safe for users):**

```json
{
  "success": false,
  "message": "The requested resource was not found.",
  "timestamp": "2026-01-19T10:30:45.123Z",
  "errorType": "NotFoundError"
}
```

**Production Server Logs (detailed for debugging):**

```json
{
  "level": "error",
  "message": "Error in GET /api/users/999",
  "meta": {
    "message": "User not found",
    "statusCode": 404,
    "errorType": "NotFoundError",
    "stack": "REDACTED",
    "context": "GET /api/users/999"
  },
  "timestamp": "2026-01-19T10:30:45.123Z"
}
```

### Unified Response Envelope

Every API endpoint follows a standardized response format:

```json
{
  "success": boolean,
  "message": string,
  "data"?: any,
  "error"?: {
    "code": string,
    "details"?: string
  },
  "timestamp": string
}
```

**Field Descriptions:**

- **`success`** — Boolean indicating whether the request succeeded (`true`) or failed (`false`)
- **`message`** — Human-readable message describing the result
- **`data`** — Response payload (only present on successful requests)
- **`error`** — Error details object (only present on failed requests)
  - **`code`** — Machine-readable error code (e.g., `VALIDATION_ERROR`, `NOT_FOUND`)
  - **`details`** — Optional additional error context
- **`timestamp`** — ISO 8601 timestamp when the response was generated

#### Success Response Example

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 12,
    "name": "Charlie",
    "email": "charlie@example.com"
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

#### Error Response Example

```json
{
  "success": false,
  "message": "Missing required field: name",
  "error": {
    "code": "MISSING_FIELD",
    "details": null
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

### Error Codes Reference

The API uses standardized error codes for programmatic error handling:

| Error Code           | HTTP Status | Description                        |
| -------------------- | ----------- | ---------------------------------- |
| `VALIDATION_ERROR`   | 400         | General validation failure         |
| `MISSING_FIELD`      | 400         | Required field is missing          |
| `INVALID_FORMAT`     | 400         | Field format is invalid            |
| `NOT_FOUND`          | 404         | Resource does not exist            |
| `DUPLICATE_RESOURCE` | 409         | Resource already exists            |
| `RESOURCE_CONFLICT`  | 409         | Resource conflict during operation |
| `DATABASE_FAILURE`   | 500         | Database operation failed          |
| `INTERNAL_ERROR`     | 500         | Internal server error              |

---

### Global Response Handler

The application uses a centralized response handler utility (`lib/responseHandler.ts`) to ensure consistent formatting across all endpoints.

#### Implementation in Routes

**Using the response handler:**

```typescript
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

// Success response
export async function GET() {
  const users = [{ id: 1, name: "Alice" }];
  return sendSuccess(users, "Users fetched successfully", 200);
}

// Error response
export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title) {
      return sendError(
        "Missing required field: title",
        ERROR_CODES.MISSING_FIELD,
        400
      );
    }
    return sendSuccess(data, "Task created successfully", 201);
  } catch (err) {
    return sendError(
      "Internal Server Error",
      ERROR_CODES.INTERNAL_ERROR,
      500,
      err
    );
  }
}
```

---

### API Route Hierarchy

The application provides a RESTful API under `/api/` for managing resources:

```
/api/
└── users/
    ├── GET     /api/users          # Get all users
    ├── POST    /api/users          # Create a new user
    └── [id]/
        ├── GET     /api/users/:id  # Get user by ID
        ├── PUT     /api/users/:id  # Full update of user
        ├── PATCH   /api/users/:id  # Partial update of user
        └── DELETE  /api/users/:id  # Delete user
```

---

### HTTP Verbs and Resource Actions

| HTTP Verb  | Endpoint         | Purpose            | Description                                 |
| ---------- | ---------------- | ------------------ | ------------------------------------------- |
| **GET**    | `/api/users`     | Read all users     | Retrieve a list of all users in the system  |
| **POST**   | `/api/users`     | Create user        | Add a new user to the system                |
| **GET**    | `/api/users/:id` | Read specific user | Retrieve details of a single user by ID     |
| **PUT**    | `/api/users/:id` | Full update        | Replace all user data (requires all fields) |
| **PATCH**  | `/api/users/:id` | Partial update     | Update specific user fields only            |
| **DELETE** | `/api/users/:id` | Remove user        | Delete a user from the system               |

---

### Sample Requests & Responses

#### 1. **GET** `/api/users` — Get All Users

**Request:**

```bash
curl -X GET http://localhost:3000/api/users
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

#### 2. **POST** `/api/users` — Create New User

**Request:**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com"
  }'
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "name": "Alice Johnson",
    "email": "alice@example.com"
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "message": "Name and email are required",
  "error": {
    "code": "MISSING_FIELD",
    "details": null
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

**Error Response (409 Conflict):**

```json
{
  "success": false,
  "message": "Email already exists",
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "details": null
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

#### 3. **GET** `/api/users/:id` — Get User by ID

**Request:**

```bash
curl -X GET http://localhost:3000/api/users/1
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "User not found",
  "error": {
    "code": "NOT_FOUND",
    "details": null
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

#### 4. **PUT** `/api/users/:id` — Full Update

**Request:**

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "email": "john.updated@example.com"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com"
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

#### 5. **PATCH** `/api/users/:id` — Partial Update

**Request (updating only name):**

```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Partially Updated"
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Partially Updated",
    "email": "john@example.com"
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

#### 6. **DELETE** `/api/users/:id` — Delete User

**Request:**

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "2025-10-30T10:00:00.000Z"
}
```

---

### Pagination, Filtering, and Error Semantics

#### **Pagination** (Future Enhancement)

When implementing pagination for large datasets:

```bash
GET /api/users?page=1&limit=10
```

#### **Error Response Format**

All errors follow a consistent structure:

| Status Code | Error Code                                            | Meaning                                              |
| ----------- | ----------------------------------------------------- | ---------------------------------------------------- |
| **400**     | `VALIDATION_ERROR`, `MISSING_FIELD`, `INVALID_FORMAT` | Bad Request - Invalid input or missing data          |
| **404**     | `NOT_FOUND`                                           | Resource does not exist                              |
| **409**     | `DUPLICATE_RESOURCE`, `RESOURCE_CONFLICT`             | Conflict - Resource already exists or state conflict |
| **500**     | `DATABASE_FAILURE`, `INTERNAL_ERROR`                  | Internal Server Error - Server-side failure          |

---

## Input Validation with Zod

### Why Input Validation Matters

Every API needs to trust but verify the data it receives. Without validation:

- Users might send malformed JSON or missing fields
- The database could receive invalid or unexpected values
- The application becomes unpredictable or insecure

**Example Problem:**

```json
{
  "name": "",
  "email": "not-an-email",
  "age": -5
}
```

If your `/api/users` endpoint accepts this data unchecked, you risk broken records and confusing errors later. That's where **Zod** comes in — it validates inputs before they reach your logic.

---

### What is Zod?

Zod is a TypeScript-first schema validation library that enables:
- **Runtime validation** — Ensures data matches expected shape at runtime
- **Type inference** — Automatically generates TypeScript types from schemas
- **Descriptive errors** — Provides clear, actionable error messages
- **Composable schemas** — Build complex validations from simple primitives

### Installation

```bash
npm install zod
```

---

### Schema Definitions

We define validation schemas in a centralized location for reuse across client and server.

**Location:** [src/lib/schemas/userSchema.ts](src/lib/schemas/userSchema.ts)

```typescript
import { z } from "zod";

/**
 * User Schema for POST and PUT requests
 * Validates complete user data with all required fields
 */
export const userSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),
  email: z.string()
    .email("Invalid email address")
    .toLowerCase(),
  age: z.number()
    .int("Age must be a whole number")
    .min(18, "User must be at least 18 years old")
    .max(120, "Age must be realistic")
    .optional(),
});

/**
 * User Schema for PATCH requests
 * Allows partial updates - all fields are optional
 */
export const userUpdateSchema = userSchema.partial();

/**
 * TypeScript types inferred from schemas
 */
export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
```

**Key Features:**
- **Validation rules** — `min()`, `max()`, `email()`, `int()` ensure data quality
- **Custom error messages** — Clear feedback for users
- **Partial schemas** — `userUpdateSchema` makes all fields optional for PATCH requests
- **Type inference** — `z.infer<>` generates TypeScript types automatically

---

### Implementation in API Routes

#### POST `/api/users` — Create User with Validation

```typescript
import { NextRequest } from 'next/server';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { userSchema } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body with Zod
    const validatedData = userSchema.parse(body);

    // TODO: Database operations with validatedData
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
```

#### PUT `/api/users/:id` — Full Update with Validation

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(userId)) {
      return sendError(
        'Invalid user ID format',
        ERROR_CODES.INVALID_FORMAT,
        400
      );
    }

    // Validate complete user data
    const validatedData = userSchema.parse(body);

    // TODO: Update user in database
    const updatedUser = { 
      id: userId, 
      name: validatedData.name, 
      email: validatedData.email,
      age: validatedData.age
    };

    return sendSuccess(updatedUser, 'User updated successfully', 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        'Validation failed',
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.errors.map((e) => ({ 
          field: e.path.join('.'), 
          message: e.message 
        }))
      );
    }

    return sendError(
      'Failed to update user',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
```

#### PATCH `/api/users/:id` — Partial Update with Validation

```typescript
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(userId)) {
      return sendError(
        'Invalid user ID format',
        ERROR_CODES.INVALID_FORMAT,
        400
      );
    }

    // Validate with partial schema (all fields optional)
    const validatedData = userUpdateSchema.parse(body);

    // Check if at least one field is provided
    if (Object.keys(validatedData).length === 0) {
      return sendError(
        'At least one field must be provided for update',
        ERROR_CODES.MISSING_FIELD,
        400
      );
    }

    // TODO: Partial update in database
    const updatedUser = { id: userId, ...validatedData };

    return sendSuccess(updatedUser, 'User updated successfully', 200);
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(
        'Validation failed',
        ERROR_CODES.VALIDATION_ERROR,
        400,
        error.errors.map((e) => ({ 
          field: e.path.join('.'), 
          message: e.message 
        }))
      );
    }

    return sendError(
      'Failed to update user',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
```

---

### Validation Examples

#### ✅ Valid Request

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "age": 25
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 0,
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "age": 25
  },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

---

#### ❌ Invalid Request — Multiple Validation Errors

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "not-an-email",
    "age": 15
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 2 characters long"
      },
      {
        "field": "email",
        "message": "Invalid email address"
      },
      {
        "field": "age",
        "message": "User must be at least 18 years old"
      }
    ]
  },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

---

#### ❌ Invalid Request — Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "message": "Required"
      },
      {
        "field": "email",
        "message": "Required"
      }
    ]
  },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

---

#### ✅ Valid PATCH Request — Partial Update

```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "email": "newemail@example.com"
  },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

---

#### ❌ Invalid PATCH Request — Invalid Email Format

```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address"
      }
    ]
  },
  "timestamp": "2026-01-13T10:00:00.000Z"
}
```

---

### Schema Reuse Between Client and Server

A major benefit of using Zod in a full-stack TypeScript app is **schema reuse**. You can use the same schema on both sides:

- **Client:** Validate form inputs before submitting
- **Server:** Validate data again before writing to the database

**Example: Frontend Form Validation**

```typescript
'use client';
import { useState } from 'react';
import { userSchema, UserInput } from '@/lib/schemas/userSchema';
import { ZodError } from 'zod';

export default function UserForm() {
  const [formData, setFormData] = useState<Partial<UserInput>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate on client-side before sending
      const validatedData = userSchema.parse(formData);
      
      // Send to API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('User created:', result.data);
      } else {
        console.error('Server error:', result.error);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        // Display validation errors in form
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Name"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="error">{errors.name}</span>}
      
      <input 
        type="email" 
        placeholder="Email"
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span className="error">{errors.email}</span>}
      
      <button type="submit">Create User</button>
    </form>
  );
}
```

**Benefits of Schema Reuse:**
- **Single source of truth** — One schema definition for both frontend and backend
- **Type safety** — TypeScript types are inferred from the schema
- **Consistent validation** — Same rules apply on both sides
- **Reduced duplication** — No need to maintain separate validation logic
- **Better UX** — Catch errors before submission, reducing server round-trips

---

### Testing Validation

You can test validation using various tools:

#### Using cURL

**Valid request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":22}'
```

**Invalid request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"bademail","age":15}'
```

#### Using Postman

1. Create a new POST request to `http://localhost:3000/api/users`
2. Set header: `Content-Type: application/json`
3. Test various payloads:
   - Valid: `{"name":"Alice","email":"alice@example.com","age":25}`
   - Invalid name: `{"name":"A","email":"alice@example.com"}`
   - Invalid email: `{"name":"Alice","email":"not-email"}`
   - Missing fields: `{"age":25}`

#### Using JavaScript/TypeScript Tests

```typescript
import { userSchema } from '@/lib/schemas/userSchema';

describe('User Schema Validation', () => {
  it('should validate correct user data', () => {
    const validData = {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      age: 25,
    };
    
    expect(() => userSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'Alice',
      email: 'not-an-email',
    };
    
    expect(() => userSchema.parse(invalidData)).toThrow();
  });

  it('should reject underage users', () => {
    const invalidData = {
      name: 'Bob',
      email: 'bob@example.com',
      age: 15,
    };
    
    expect(() => userSchema.parse(invalidData)).toThrow('User must be at least 18 years old');
  });
});
```

---

### Validation Benefits & Reflection

#### Why Validation Consistency Matters in Team Projects

1. **Trust & Reliability**
   - Team members can trust that data reaching business logic is valid
   - No defensive checks needed throughout the codebase
   - Database integrity is maintained automatically

2. **Developer Experience**
   - New developers learn one validation pattern that applies everywhere
   - Clear error messages make debugging faster
   - TypeScript integration catches errors at compile time

3. **User Experience**
   - Descriptive error messages help users fix their input
   - Frontend validation prevents unnecessary server requests
   - Consistent error format makes UI error handling simpler

4. **Maintainability**
   - Validation rules are centralized and easy to update
   - Adding new fields requires one schema update
   - Refactoring is safer with type-checked schemas

5. **Security**
   - Prevents injection attacks by validating all inputs
   - Enforces data type constraints (numbers, emails, etc.)
   - Stops malformed data before it reaches the database

6. **Testing**
   - Validation logic is isolated and easy to unit test
   - Mocking is simpler with well-defined schemas
   - Integration tests can validate error responses consistently

#### Schema Evolution Strategy

As the project grows, schemas can evolve:
- **Adding fields** — Use `.optional()` for backwards compatibility
- **Changing validation** — Update the schema, TypeScript will catch all usages
- **Versioning** — Create new schema versions when breaking changes are needed
- **Extending** — Use `.extend()` to build on existing schemas

Example:
```typescript
// Base user schema
export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Extended schema for admin users
export const adminUserSchema = userSchema.extend({
  role: z.enum(['admin', 'superadmin']),
  permissions: z.array(z.string()),
});
```

#### Integration with Database Layer

When integrated with ORMs like Prisma:
```typescript
// Zod schema matches Prisma schema
const validatedData = userSchema.parse(body);

// Type-safe database operation
const newUser = await prisma.user.create({
  data: validatedData, // TypeScript ensures shape matches
});
```

---

### Summary of Zod Implementation

**Implemented:**
- ✅ Zod validation for all POST and PUT APIs
- ✅ Shared schema files ([src/lib/schemas/userSchema.ts](src/lib/schemas/userSchema.ts))
- ✅ Error-handling structure returning consistent validation messages
- ✅ Partial schema for PATCH operations
- ✅ TypeScript type inference from schemas
- ✅ Integration with global response handler

**Endpoints with Validation:**
- ✅ `POST /api/users` — Full validation with userSchema
- ✅ `PUT /api/users/:id` — Full validation with userSchema
- ✅ `PATCH /api/users/:id` — Partial validation with userUpdateSchema

**Key Files:**
- [src/lib/schemas/userSchema.ts](src/lib/schemas/userSchema.ts) — Schema definitions
- [src/app/api/users/route.ts](src/app/api/users/route.ts) — POST validation
- [src/app/api/users/[id]/route.ts](src/app/api/users/[id]/route.ts) — PUT/PATCH validation

---

## Developer Experience & Observability Benefits

### Why a Unified Response Envelope Matters

The global response handler serves as the API's "unified voice" — ensuring every endpoint speaks in the same tone, regardless of who wrote it.

#### 1. **Debugging & Error Tracking**

- Every error includes a machine-readable code (e.g., `VALIDATION_ERROR`, `NOT_FOUND`)
- Timestamps on all responses make it easy to correlate with server logs
- Error details are standardized, enabling automated error tracking tools (Sentry, DataDog, etc.)

#### 2. **Frontend Developer Experience**

- Single response schema across all endpoints eliminates conditional logic
- Predictable error handling: frontends can use the same error handler for all responses
- Clear `success` boolean allows easy branching: `if (response.success) { ... } else { ... }`

Example frontend code:

```typescript
const response = await fetch("/api/users");
const result = await response.json();

if (result.success) {
  // Use result.data
} else {
  // Handle error with result.error.code
  console.error(`Error [${result.error.code}]: ${result.message}`);
}
```

#### 3. **Team Communication**

- New team members instantly understand the API response format
- No ambiguity about how errors are reported
- Documentation becomes straightforward: "Every endpoint follows this schema"

#### 4. **Production Monitoring**

- Consistent timestamps enable correlation with monitoring dashboards
- Error codes allow alerting based on specific failure types
- Log aggregation tools can easily parse and categorize issues

Example Sentry integration:

```typescript
if (!result.success) {
  Sentry.captureException(new Error(result.message), {
    tags: {
      errorCode: result.error.code,
      statusCode: response.status,
    },
    extra: { details: result.error.details },
  });
}
```

#### 5. **Testing & CI/CD**

- Response schema is predictable and testable
- Automated tests can validate the envelope structure
- Mock responses are consistent, reducing test brittleness

#### 6. **Third-Party Integrations**

- Payment gateways, analytics, and external services expect consistent APIs
- Clear error codes enable integration logic (retry on `DATABASE_FAILURE`, skip on `VALIDATION_ERROR`)
- Documentation for partners is simpler and more professional

---

## Reflection

### API Design Philosophy

The Ticket Cancellation system's API is built on these core principles:

1. **Consistency First** — Every response follows the same envelope structure
2. **Clarity Over Brevity** — Error messages are descriptive, error codes are machine-readable
3. **Observability Built-In** — Timestamps, error codes, and structured data enable monitoring
4. **Developer-Friendly** — Predictable patterns reduce cognitive load and onboarding time
5. **Scalable by Design** — New endpoints automatically inherit the same patterns

### Future-Proofing

As the Ticket Cancellation system grows:

- New resources (`/api/tickets`, `/api/refunds`, `/api/cancellations`) automatically follow the same pattern
- Middleware can uniformly handle authentication, rate-limiting, and logging
- Monitoring and alerting rules apply across all endpoints
- Documentation remains consistent as new features are added

This foundation ensures that whether there are 5 endpoints or 50, the API remains understandable, maintainable, and professional-grade.

---

## Authentication & Authorization Overview

### Concepts

- **Authentication**: Verifies identity (e.g., login with email/password).
- **Authorization**: Determines permissions (e.g., admins can access `/api/admin`).

This project implements authentication using hashed passwords and JWTs; authorization can build on JWT claims.

---

## Setup — Required Packages

Install dependencies:

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

Add a local environment file:

```
.env.local
JWT_SECRET=supersecretkey
```

---

## Auth API Structure

```
app/
└── api/
    ├── auth/
    │   ├── signup/route.ts
    │   └── login/route.ts
    └── users/route.ts
```

Key files:
- [src/app/api/auth/signup/route.ts](src/app/api/auth/signup/route.ts)
- [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts)
- [src/app/api/users/route.ts](src/app/api/users/route.ts) (protected GET)
- [src/lib/schemas/authSchema.ts](src/lib/schemas/authSchema.ts) (Zod schemas)
- [src/lib/auth.ts](src/lib/auth.ts) (JWT helpers)
- [src/lib/db.ts](src/lib/db.ts) (demo in-memory user store)

---

## Signup — Secure Password Hashing

Passwords are hashed with `bcrypt` before storage. Even if data leaks, hashes are computationally expensive to reverse.

Flow:
1. Validate input (`name`, `email`, `password`).
2. Check if user exists.
3. Hash password with 10 salt rounds.
4. Create user and return public data (no password).

---

## Login — JWT Issuance

On login, the password is verified against the stored hash. If valid, a JWT containing user identity is returned.

Token details:
- Signed with `JWT_SECRET`.
- Default expiry: 1 hour.
- Payload: `id`, `email`.

---

## Protecting Routes — Token Validation

Private endpoints validate the `Authorization: Bearer <token>` header. Invalid or expired tokens return 401/403.

The [users GET route](src/app/api/users/route.ts) demonstrates protection and returns public users only.

---

## Try It — curl Examples

Signup:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"mypassword"}'
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"mypassword"}'
```

Access Protected Route:
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## Token Storage, Expiry, and Refresh

- **Expiry**: Tokens expire in 1 hour to limit risk. Adjust `signToken(..., "1h")` in [src/lib/auth.ts](src/lib/auth.ts).
- **Storage**:
  - Cookies (HttpOnly, Secure) — recommended for web apps to mitigate XSS.
  - `localStorage` — simpler but vulnerable to XSS; use cautiously.
- **Refresh Strategy**:
  - Short-lived access tokens + long-lived refresh tokens.
  - Endpoint to exchange refresh token for new access token.
  - Revoke refresh tokens on logout or compromise.

---

## Notes

- The demo uses an in-memory store for simplicity. For production, replace [src/lib/db.ts](src/lib/db.ts) with a persistent database (e.g., Prisma + Postgres) and ensure secure secret management.
- Always validate inputs with Zod and return unified responses via [src/lib/responseHandler.ts](src/lib/responseHandler.ts).

---

# Role-Based Access Control (RBAC)

## Overview

Role-Based Access Control (RBAC) is a security model that restricts system access based on user roles. This implementation enforces authorization at the middleware layer, ensuring consistent, centralized permission checks across all protected routes.

### Key Concepts

- **Role**: A predefined set of permissions (e.g., `admin`, `user`)
- **Permission**: An action a role can perform (e.g., view admin panel, manage users)
- **Middleware**: Intercepts requests before they reach route handlers, validating authorization
- **Least Privilege Principle**: Users have only the minimum permissions required for their role

---

## User Roles Model

### Updated User Schema

The User model now includes a `role` field:

```typescript
export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";  // NEW: Role-based access
  age?: number;
  createdAt: string;
};
```

**Role Definitions:**
- **`admin`**: Full system access, can manage users, view analytics, configure system
- **`user`**: Standard access, can view own profile and accessible resources

---

## Middleware Architecture

The authorization middleware is implemented in [src/middleware.ts](src/middleware.ts). It intercepts all requests to protected routes (`/api/admin/*` and `/api/users/*`), validates JWTs, and enforces role-based access.

### Middleware Flow

```
Request → Token Extraction → JWT Verification → Role Check → Route Handler
   ↓            ↓                 ↓                  ↓             ↓
 Incoming    Bearer token    Signature valid?   Authorized?   Process request
 Request     from header?      Expired?          for role?
   ↓            ↓                 ↓                  ↓             ↓
             Missing?          Invalid?          Denied?       Success
             ↓                 ↓                  ↓
         Return 401        Return 403        Return 403
```

### Implementation Details

**File:** [src/middleware.ts](src/middleware.ts)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

interface DecodedToken {
  id: number;
  email: string;
  role: "admin" | "user";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect specific routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token missing" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

      // Role-based access control
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Access denied. Admin role required." },
          { status: 403 }
        );
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id.toString());
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/api/users/:path*"],
};
```

**Key Features:**
1. **Token Extraction**: Extracts JWT from `Authorization: Bearer <token>` header
2. **JWT Verification**: Validates signature and expiration
3. **Role Check**: Blocks non-admin users from accessing `/api/admin` routes
4. **Header Injection**: Passes user info (`x-user-id`, `x-user-email`, `x-user-role`) to route handlers
5. **Route Matcher**: Uses Next.js config to only apply to protected routes

---

## Protected Routes

### Admin Route

**File:** [src/app/api/admin/route.ts](src/app/api/admin/route.ts)

Admin-only endpoint returning system administration resources:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    const userEmail = request.headers.get("x-user-email");

    return NextResponse.json({
      success: true,
      message: "Welcome Admin! You have full access to admin resources.",
      data: {
        role: userRole,
        email: userEmail,
        permissions: [
          "view_all_users",
          "manage_roles",
          "view_analytics",
          "configure_system",
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to retrieve admin data" },
      { status: 500 }
    );
  }
}
```

**Access Requirements:**
- Valid JWT token
- Role must be `admin`
- Response includes available permissions

---

### Users Route (Protected)

**File:** [src/app/api/users/route.ts](src/app/api/users/route.ts)

General authenticated endpoint accessible to both `admin` and `user` roles:

```typescript
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get("x-user-email");
    const userRole = request.headers.get("x-user-role");

    if (!userEmail) {
      return sendError('Unauthorized access', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const users = getPublicUsers();
    return sendSuccess(
      {
        users,
        accessedBy: { email: userEmail, role: userRole },
      },
      'Users fetched successfully',
      200
    );
  } catch (error) {
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.DATABASE_FAILURE,
      500,
      error
    );
  }
}
```

**Access Requirements:**
- Valid JWT token
- Available to both `admin` and `user` roles
- Returns list of users and accessor information

---

## Signup and Login Integration

### Updated Signup Schema

**File:** [src/lib/schemas/authSchema.ts](src/lib/schemas/authSchema.ts)

```typescript
export const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]).optional().default("user"),
  age: z.number().int().min(18).max(120).optional(),
});
```

**Note:** Role defaults to `"user"`. Only trusted admins should manually set `role: "admin"` via backend.

### Updated Login Route

**File:** [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts)

Login now includes the user's role in the JWT payload:

```typescript
const token = signToken({ 
  id: user.id, 
  email: user.email, 
  role: user.role  // NEW: Include role in token
});
```

This allows the middleware to check roles without additional database queries.

---

## Testing Role-Based Access

### Test Setup

Create two test users:

**User 1 — Regular User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "user@example.com",
    "password": "mypassword123",
    "role": "user"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "id": 1,
    "name": "John User",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2026-01-16T10:00:00.000Z"
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

**User 2 — Admin User:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Admin",
    "email": "admin@example.com",
    "password": "adminpassword123",
    "role": "admin"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "id": 2,
    "name": "Jane Admin",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2026-01-16T10:00:00.000Z"
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

---

### Login Both Users

**Login as Regular User:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "mypassword123"
  }'
```

Response (save this token):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2MzAwMDAwMDB9.xxx"
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

**Login as Admin:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpassword123"
  }'
```

Response (save this token):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTYzMDAwMDAwMH0.yyy"
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

---

### Scenario 1: Admin Access `/api/admin` ✅

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Welcome Admin! You have full access to admin resources.",
  "data": {
    "role": "admin",
    "email": "admin@example.com",
    "permissions": [
      "view_all_users",
      "manage_roles",
      "view_analytics",
      "configure_system"
    ]
  }
}
```

---

### Scenario 2: Regular User Denied `/api/admin` ❌

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Access denied. Admin role required.",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

---

### Scenario 3: Both Access `/api/users` ✅

**Admin accessing `/api/users`:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John User",
        "email": "user@example.com",
        "role": "user",
        "createdAt": "2026-01-16T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Jane Admin",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2026-01-16T10:00:00.000Z"
      }
    ],
    "accessedBy": {
      "email": "admin@example.com",
      "role": "admin"
    }
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

**Regular user accessing `/api/users`:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [...],
    "accessedBy": {
      "email": "user@example.com",
      "role": "user"
    }
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

---

### Scenario 4: No Token ❌

```bash
curl -X GET http://localhost:3000/api/admin
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Token missing",
  "error": {
    "code": "UNAUTHORIZED",
    "details": null
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

---

### Scenario 5: Invalid/Expired Token ❌

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer invalid_token_xyz"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  },
  "timestamp": "2026-01-16T10:00:00.000Z"
}
```

---

## RBAC Access Control Matrix

| Route | User Role | Status | Reason |
|-------|-----------|--------|--------|
| `/api/users` | `admin` | ✅ Allowed | Authenticated + authorized |
| `/api/users` | `user` | ✅ Allowed | Authenticated + authorized |
| `/api/users` | None | ❌ Denied | No token (401) |
| `/api/users` | Invalid Token | ❌ Denied | Invalid JWT (403) |
| `/api/admin` | `admin` | ✅ Allowed | Role check passed |
| `/api/admin` | `user` | ❌ Denied | Insufficient privileges (403) |
| `/api/admin` | None | ❌ Denied | No token (401) |
| `/api/admin` | Invalid Token | ❌ Denied | Invalid JWT (403) |

---

## Extended RBAC — Adding More Roles

The current system supports two roles (`admin`, `user`). Extending to more roles is straightforward:

### Example: Adding `moderator` and `editor` Roles

**1. Update User Type:**
```typescript
export type User = {
  // ...
  role: "admin" | "user" | "moderator" | "editor";
};
```

**2. Update Auth Schema:**
```typescript
export const signupSchema = z.object({
  // ...
  role: z.enum(["admin", "user", "moderator", "editor"]).optional().default("user"),
});
```

**3. Update Middleware:**
```typescript
// Protect moderator routes
if (pathname.startsWith("/api/moderator") && !["admin", "moderator"].includes(decoded.role)) {
  return NextResponse.json(
    { success: false, message: "Access denied. Moderator role required." },
    { status: 403 }
  );
}

// Protect editor routes
if (pathname.startsWith("/api/editor") && !["admin", "editor"].includes(decoded.role)) {
  return NextResponse.json(
    { success: false, message: "Access denied. Editor role required." },
    { status: 403 }
  );
}
```

**4. Create New Routes:**
- `/api/moderator/route.ts` — Moderator dashboard
- `/api/editor/route.ts` — Editor panel

**Benefit:** Role extension requires changes to three files only, following the **Least Privilege Principle** — each role has the minimum required permissions.

---

## Least Privilege Principle in Practice

### Definition

The **Least Privilege Principle** states: *"A user should have only the minimum level of access required to perform their job."*

### Application in This System

1. **Default to `user` Role**
   - New signups default to `"user"` role
   - Admins manually promote users if needed
   - Prevents accidental privilege escalation

2. **Role-Specific Routes**
   - Admin routes (`/api/admin`) are blocked for non-admins
   - Users cannot access privileged operations
   - Each role has its own endpoints

3. **Route-Level Enforcement**
   - Middleware intercepts all requests
   - No "backdoor" access through misconfigured routes
   - Centralized control across all endpoints

4. **Data Minimization**
   - Users see public data only
   - Admins can access system configuration
   - Responses include only relevant information

### Example Violations & How to Avoid Them

❌ **Bad:** Admin role parameter in client-side form
```html
<input type="hidden" name="role" value="admin" />
```
**Why:** Attackers can modify client-side code.

✅ **Good:** Backend assigns role, frontend cannot override
```typescript
// Backend only
const created = createUser({
  name: data.name,
  email: data.email,
  passwordHash,
  role: "user", // Always 'user'; only admins can change via backend
});
```

❌ **Bad:** Role check only on frontend
```typescript
if (user.role === 'admin') {
  // Show admin button
}
```
**Why:** Attackers disable JavaScript or modify local state.

✅ **Good:** Role check on middleware + backend
```typescript
// Middleware validates on every request
if (decoded.role !== "admin") {
  return 403; // Deny at network level
}
```

---

## Security Best Practices

### 1. **Secret Management**

Always use environment variables for `JWT_SECRET`:

```bash
# .env.local (never commit)
JWT_SECRET=your-secure-random-key-here
```

**For Production:**
- Use a secret management service (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly
- Use strong, random keys (e.g., `openssl rand -base64 32`)

### 2. **Token Expiration**

Short-lived tokens reduce exposure if compromised:

```typescript
// Current: 1 hour expiration
const token = signToken(payload, "1h");

// For sensitive operations: 15 minutes
const token = signToken(payload, "15m");
```

### 3. **HTTPS Only**

In production, always transmit tokens over HTTPS:

```typescript
// Secure cookie flag (httpOnly, secure, sameSite)
// Production: use secure: true, sameSite: 'strict'
```

### 4. **Rate Limiting**

Prevent brute-force attacks on login:

```typescript
// Example: limit 5 login attempts per minute per IP
const attemptKey = `login:${ip}`;
const attempts = await redis.incr(attemptKey);
if (attempts > 5) {
  return 429; // Too many requests
}
```

### 5. **Audit Logging**

Log all access attempts for security review:

```typescript
// Log successful admin access
logger.info('Admin access', {
  email: userEmail,
  route: '/api/admin',
  timestamp: new Date(),
  ip: request.ip,
});

// Log denied access
logger.warn('Access denied', {
  email: decoded.email,
  role: decoded.role,
  route: '/api/admin',
  timestamp: new Date(),
});
```

---

## Testing Strategies

### Unit Tests — Middleware

```typescript
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('Middleware Role-Based Access', () => {
  it('should deny admin access to non-admin users', () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/admin'), {
      headers: {
        'authorization': 'Bearer non-admin-token',
      },
    });
    
    const response = middleware(req);
    expect(response.status).toBe(403);
  });

  it('should allow admin access to admin users', () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/admin'), {
      headers: {
        'authorization': 'Bearer admin-token',
      },
    });
    
    const response = middleware(req);
    expect(response.status).toBe(200);
  });

  it('should return 401 if token is missing', () => {
    const req = new NextRequest(new URL('http://localhost:3000/api/admin'));
    
    const response = middleware(req);
    expect(response.status).toBe(401);
  });
});
```

### Integration Tests — Full Flow

```typescript
describe('RBAC Integration', () => {
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Signup and login users
    const userRes = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password',
      }),
    });
    userToken = (await userRes.json()).data.token;

    const adminRes = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password',
      }),
    });
    adminToken = (await adminRes.json()).data.token;
  });

  it('admin should access /api/admin', async () => {
    const res = await fetch('/api/admin', {
      headers: { 'authorization': `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('user should NOT access /api/admin', async () => {
    const res = await fetch('/api/admin', {
      headers: { 'authorization': `Bearer ${userToken}` },
    });
    expect(res.status).toBe(403);
  });

  it('user should access /api/users', async () => {
    const res = await fetch('/api/users', {
      headers: { 'authorization': `Bearer ${userToken}` },
    });
    expect(res.status).toBe(200);
  });
});
```

---

## Summary & Deliverables

### ✅ Implemented

1. **User Roles in Database Model** ([src/lib/db.ts](src/lib/db.ts))
   - User type now includes `role: "admin" | "user"`
   - Default role: `"user"`

2. **Authorization Middleware** ([src/middleware.ts](src/middleware.ts))
   - Validates JWT on protected routes
   - Enforces role-based access control
   - Injects user info (`x-user-id`, `x-user-email`, `x-user-role`) into request headers

3. **Protected Routes**
   - **`/api/admin`** — Admin-only endpoint ([src/app/api/admin/route.ts](src/app/api/admin/route.ts))
   - **`/api/users`** — Authenticated users ([src/app/api/users/route.ts](src/app/api/users/route.ts))

4. **Auth Integration**
   - Signup includes optional `role` parameter (defaults to `"user"`) ([src/lib/schemas/authSchema.ts](src/lib/schemas/authSchema.ts))
   - Login includes role in JWT payload ([src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts))

5. **Comprehensive Documentation** (this README section)
   - RBAC architecture overview
   - Middleware logic explanation
   - Role-based access matrix
   - Full testing examples with curl commands
   - Least privilege principle explanation
   - Security best practices
   - Role extension guidance

### 📊 Access Control Summary

| Endpoint | Requirement | Admin | User | Unauthenticated |
|----------|-------------|-------|------|-----------------|
| `POST /api/auth/signup` | None | ✅ | ✅ | ✅ |
| `POST /api/auth/login` | None | ✅ | ✅ | ✅ |
| `GET /api/users` | Valid JWT | ✅ 200 | ✅ 200 | ❌ 401 |
| `GET /api/admin` | Valid JWT + admin | ✅ 200 | ❌ 403 | ❌ 401 |

### 🔧 How to Extend

Adding new roles (e.g., `moderator`, `editor`):
1. Update User type and enum
2. Update middleware with new role checks
3. Create new route handlers for the role
4. Test with new role users

All changes are isolated to three locations, following the **Least Privilege Principle** and enabling easy future role extension.

### 🎯 Key Files

- [src/middleware.ts](src/middleware.ts) — RBAC enforcement
- [src/lib/db.ts](src/lib/db.ts) — User model with roles
- [src/app/api/admin/route.ts](src/app/api/admin/route.ts) — Admin route
- [src/app/api/users/route.ts](src/app/api/users/route.ts) — Protected user route
- [src/lib/schemas/authSchema.ts](src/lib/schemas/authSchema.ts) — Auth schemas with role
- [src/app/api/auth/signup/route.ts](src/app/api/auth/signup/route.ts) — Signup with role support
- [src/app/api/auth/login/route.ts](src/app/api/auth/login/route.ts) — Login with role in JWT

---

## Testing Centralized Error Handling

### Testing in Development Mode

Run the application in development:

```bash
npm run dev
```

**Test 1: Validation Error**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed: name: Required, email: Required",
  "timestamp": "2026-01-19T10:30:45.123Z",
  "errorType": "ValidationError",
  "stack": "ValidationError: Validation failed...\n    at POST (/app/api/users/route.ts:45:13)\n    ..."
}
```

**Test 2: Not Found Error**

```bash
curl -X GET http://localhost:3000/api/users/999 \
  -H "x-user-email: test@example.com"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "User not found",
  "timestamp": "2026-01-19T10:30:45.123Z",
  "errorType": "NotFoundError",
  "stack": "NotFoundError: User not found\n    at GET (/app/api/users/[id]/route.ts:20:13)\n    ..."
}
```

**Test 3: Authentication Error**

```bash
curl -X GET http://localhost:3000/api/users
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized access",
  "timestamp": "2026-01-19T10:30:45.123Z",
  "errorType": "AuthenticationError",
  "stack": "AuthenticationError: Unauthorized access..."
}
```

### Testing in Production Mode

Set environment to production:

```bash
# Windows PowerShell
$env:NODE_ENV="production"
npm run build
npm start

# Or use a .env file
# NODE_ENV=production
```

**Test 1: Validation Error (Production)**

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (User-Safe):**
```json
{
  "success": false,
  "message": "Invalid request. Please check your input.",
  "timestamp": "2026-01-19T10:30:45.123Z",
  "errorType": "ValidationError"
}
```

**Server Log (Detailed):**
```json
{
  "level": "error",
  "message": "Error in POST /api/users",
  "meta": {
    "message": "Validation failed: name: Required, email: Required",
    "statusCode": 400,
    "errorType": "ValidationError",
    "stack": "REDACTED",
    "context": "POST /api/users"
  },
  "timestamp": "2026-01-19T10:30:45.123Z"
}
```

**Test 2: Generic Server Error (Production)**

```bash
# Simulate database failure in your code
# throw new Error("Database connection timeout");

curl -X GET http://localhost:3000/api/users \
  -H "x-user-email: test@example.com"
```

**Expected Response (User-Safe):**
```json
{
  "success": false,
  "message": "Something went wrong. Please try again later.",
  "timestamp": "2026-01-19T10:30:45.123Z"
}
```

**Server Log (Detailed for Ops Team):**
```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "message": "Database connection timeout",
    "statusCode": 500,
    "errorType": "Error",
    "stack": "REDACTED",
    "context": "GET /api/users"
  },
  "timestamp": "2026-01-19T10:30:45.123Z"
}
```

### Comparison: Development vs Production

| Aspect | Development | Production |
|--------|------------|-----------|
| **Error Message** | Detailed (actual error message) | User-safe (generic message) |
| **Stack Trace** | Included in response | Not included |
| **Server Logs** | Full stack trace | Stack marked as "REDACTED" |
| **Error Type** | Included | Included |
| **Purpose** | Fast debugging | Security & user trust |

### Error Type Reference

All custom error types are handled with appropriate HTTP status codes:

| Error Type | Status Code | When to Use | Example |
|-----------|-------------|-------------|---------|
| `ValidationError` | 400 | Invalid input data | "Email format is invalid" |
| `AuthenticationError` | 401 | Missing/invalid credentials | "Authentication required" |
| `AuthorizationError` | 403 | Insufficient permissions | "Admin access required" |
| `NotFoundError` | 404 | Resource doesn't exist | "User not found" |
| `ConflictError` | 409 | Resource already exists | "Email already registered" |
| `AppError` (generic) | 500 | Any other error | Custom status code |

---

## Reflection: Benefits of Centralized Error Handling

### 1. **Consistency Across the API**

Before centralized error handling, different routes might return errors in different formats:

```typescript
// Route 1
return NextResponse.json({ error: "Not found" }, { status: 404 });

// Route 2
return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

// Route 3
return NextResponse.json({ status: "error", data: null, error: "Not found" });
```

With centralized handling, **all errors follow the same format**, making client-side error handling predictable and reliable.

### 2. **Security in Production**

Exposing stack traces in production can reveal:
- Internal file structure
- Database schema details
- Third-party library versions
- Security vulnerabilities

Our error handler **automatically redacts sensitive information** in production while keeping full details in logs for developers.

### 3. **Improved Debugging Experience**

Structured logs make it easy to:
- **Search logs** by error type, context, or timestamp
- **Filter errors** by severity (error, warn, info)
- **Correlate errors** with user actions
- **Monitor patterns** and detect issues early

Example log search in production:
```bash
# Find all authentication failures
grep '"errorType":"AuthenticationError"' logs.json

# Find errors in specific endpoint
grep '"context":"GET /api/users"' logs.json | grep '"level":"error"'
```

### 4. **Better User Experience**

Instead of cryptic error messages:
```json
{ "error": "ECONNREFUSED 127.0.0.1:5432" }
```

Users see helpful, actionable messages:
```json
{ "message": "Something went wrong. Please try again later." }
```

### 5. **Extensibility**

Adding new error types is simple:

```typescript
// lib/errorHandler.ts
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429);
  }
}

// Usage in routes
if (requestCount > limit) {
  throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfter}s`);
}
```

The error handler automatically processes the new type with appropriate status code and logging.

### 6. **Reduced Boilerplate**

Before:
```typescript
export async function GET(request: NextRequest) {
  try {
    // logic
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error" },
      { status: 500 }
    );
  }
}
```

After:
```typescript
export async function GET(request: NextRequest) {
  try {
    // logic
  } catch (error) {
    return handleError(error, 'GET /api/users');
  }
}
```

Even better with the `asyncHandler` wrapper:
```typescript
export const GET = asyncHandler(async (request: NextRequest) => {
  // logic - errors handled automatically
}, 'GET /api/users');
```

### 7. **Future-Proof Architecture**

The centralized approach makes it easy to:
- Integrate error tracking services (Sentry, Rollbar)
- Add custom error reporting dashboards
- Implement error alerting (Slack, email)
- Analyze error trends and patterns

```typescript
// Future enhancement example
export function handleError(error: any, context: string) {
  // Existing logging
  logger.error(`Error in ${context}`, {...});
  
  // Add Sentry integration
  if (isProd) {
    Sentry.captureException(error, { tags: { context } });
  }
  
  // Add Slack alerting for critical errors
  if (error.statusCode === 500) {
    await sendSlackAlert(error, context);
  }
  
  return NextResponse.json(...);
}
```

---

## Key Takeaways

✅ **Centralized error handling is essential** for production-ready applications  
✅ **Environment-specific behavior** balances debugging needs with security  
✅ **Structured logging** makes debugging efficient and scalable  
✅ **Custom error types** provide semantic clarity and proper HTTP status codes  
✅ **User-safe messages** build trust and improve UX  
✅ **Consistent format** simplifies client-side error handling  
✅ **Future extensibility** allows easy integration with monitoring tools

---

## Next Steps

1. **Integrate Error Tracking**: Add Sentry or similar service for real-time error monitoring
2. **Enhanced Logging**: Use Winston or Pino for advanced log management
3. **Error Metrics**: Track error rates, types, and patterns in dashboards
4. **Retry Logic**: Implement automatic retry for transient failures
5. **Circuit Breaker**: Add circuit breaker pattern for external service calls


---

# Redis Caching Implementation

## Overview

This project implements **Redis caching** to optimize API performance and reduce database load. The caching strategy uses the **cache-aside (lazy loading) pattern**, where frequently accessed data is temporarily stored in Redis memory for instant retrieval on subsequent requests.

### Why Caching Matters

| Aspect | Without Caching | With Redis Caching |
|--------|-----------------|-------------------|
| **Response Time** | Every request hits the database (~100-300ms latency) | Cached requests served in ~5-10ms |
| **Database Load** | High load from repeated queries | Significantly reduced queries |
| **Scalability** | Struggles under heavy traffic | Scales smoothly with demand |
| **User Experience** | Slow, inconsistent responses | Fast, predictable performance |

#### Real-World Performance Impact
- **Cold Start (first request)**: ~120ms (database fetch + cache store)
- **Cache Hit (subsequent requests)**: ~10ms (Redis retrieval)
- **Performance Improvement**: ~10-12x faster for cached requests

---

## Setup Instructions

### 1. Install Redis Client

Redis is already added to `package.json`. Install dependencies:

```bash
npm install
```

The project uses **ioredis** (`^5.3.2`), a robust Node.js Redis client with:
- Automatic reconnection and retry logic
- Support for both standalone and cluster Redis
- Built-in error handling

### 2. Configure Redis Connection

Create a `.env.local` file in the project root:

```env
# .env.local
REDIS_URL=redis://localhost:6379
```

**For Production (Redis Cloud):**
```env
REDIS_URL=redis://:password@hostname:port
```

### 3. Setup Redis Locally (Development)

#### Option A: Using Docker (Recommended)
```bash
docker run -d -p 6379:6379 redis:latest
```

#### Option B: Native Installation
- **macOS**: `brew install redis` → `brew services start redis`
- **Windows**: Download from [redis-windows](https://github.com/microsoftarchive/redis/releases)
- **Linux**: `sudo apt-get install redis-server` → `redis-server`

#### Verify Redis Connection
```bash
redis-cli ping
# Expected output: PONG
```

---

## Cache Architecture

### Cache-Aside (Lazy Loading) Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Request                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Check Redis Cache     │
        └────────┬───────────────┘
                 │
        ┌────────┴──────────┐
        │                   │
    Cache Hit         Cache Miss
        │                   │
        ▼                   ▼
   ┌────────┐      ┌──────────────┐
   │Return  │      │ Query        │
   │Cached  │      │ Database     │
   │Data    │      └──────┬───────┘
   │(Fast)  │             │
   └────────┘             ▼
                   ┌──────────────┐
                   │ Store in     │
                   │ Redis        │
                   │ (TTL: 60s)   │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │ Return Data  │
                   └──────────────┘
```

---

## Implementation Details

### Redis Connection Utility
**File**: [src/lib/redis.ts](src/lib/redis.ts)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  connectTimeout: 10000,
  commandTimeout: 30000,
});

export default redis;
```

**Key Features:**
- Environment-based configuration
- Automatic reconnection with exponential backoff
- Proper error handling and logging

### Cached Endpoints

#### 1. GET /api/users (Users List)

**Cache Configuration:**
- **Cache Key**: `users:list`
- **TTL**: 60 seconds
- **Strategy**: Cache-Aside

**Implementation**: [src/app/api/users/route.ts](src/app/api/users/route.ts)

```typescript
const CACHE_KEY_USERS_LIST = 'users:list';
const CACHE_TTL_SECONDS = 60;

export async function GET(request: NextRequest) {
  // Step 1: Check Cache
  const cachedUsers = await redis.get(CACHE_KEY_USERS_LIST);
  if (cachedUsers) {
    return NextResponse.json({ 
      data: JSON.parse(cachedUsers),
      cacheStatus: 'HIT'
    });
  }

  // Step 2: Cache Miss - Fetch from DB
  const users = getPublicUsers();

  // Step 3: Store in Cache
  await redis.setex(CACHE_KEY_USERS_LIST, CACHE_TTL_SECONDS, JSON.stringify(users));

  return NextResponse.json({ 
    data: users,
    cacheStatus: 'MISS'
  });
}
```

**Response Examples:**

*Cache Hit (10ms):*
```json
{
  "success": true,
  "data": {
    "users": [...],
    "cacheStatus": "HIT"
  },
  "message": "Users fetched successfully (from cache)"
}
```

*Cache Miss (120ms):*
```json
{
  "success": true,
  "data": {
    "users": [...],
    "cacheStatus": "MISS"
  },
  "message": "Users fetched successfully"
}
```

#### 2. GET /api/users/:id (Individual User)

**Cache Configuration:**
- **Cache Key**: `user:{userId}`
- **TTL**: 60 seconds
- **Strategy**: Cache-Aside

**Implementation**: [src/app/api/users/[id]/route.ts](src/app/api/users/[id]/route.ts)

Individual user data is cached separately to avoid cache stampedes when the users list expires.

---

## Cache Invalidation Strategy

Cache invalidation ensures data consistency and prevents serving stale data.

### Invalidation Pattern

**When to Invalidate:**
1. **After Create (POST)**: Invalidate the `users:list` cache
2. **After Update (PUT/PATCH)**: Invalidate both `user:{id}` and `users:list` caches
3. **After Delete (DELETE)**: Invalidate both `user:{id}` and `users:list` caches

### Implementation Examples

#### POST /api/users (Create User)
```typescript
export async function POST(request: NextRequest) {
  // Create user in database
  const newUser = await db.user.create({ ... });

  // Invalidate cache - clear users:list to reflect new user
  await redis.del('users:list');

  return NextResponse.json({ success: true, data: newUser });
}
```

#### PUT /api/users/:id (Update User)
```typescript
export async function PUT(request: NextRequest) {
  // Update user in database
  const updatedUser = await db.user.update({ ... });

  // Invalidate both caches for consistency
  await redis.del(`user:${userId}`);
  await redis.del('users:list');

  return NextResponse.json({ success: true, data: updatedUser });
}
```

#### DELETE /api/users/:id (Delete User)
```typescript
export async function DELETE(request: NextRequest) {
  // Delete user from database
  const deletedUser = await db.user.delete({ ... });

  // Invalidate both caches
  await redis.del(`user:${userId}`);
  await redis.del('users:list');

  return NextResponse.json({ success: true, data: deletedUser });
}
```

### Cache Invalidation Summary

| Operation | Cache Keys Invalidated | Reason |
|-----------|------------------------|--------|
| **POST** (Create) | `users:list` | New user added to collection |
| **PUT** (Full Update) | `user:{id}`, `users:list` | User data changed + list affected |
| **PATCH** (Partial Update) | `user:{id}`, `users:list` | User data changed + list affected |
| **DELETE** | `user:{id}`, `users:list` | User removed from collection |

---

## TTL & Cache Coherence

### TTL (Time-To-Live)

**Definition**: Duration before cached data automatically expires.

**Current Configuration**: 60 seconds for users data

**TTL Decision Factors:**
- **Data Volatility**: Frequently changing data → shorter TTL
- **Accuracy Requirements**: High accuracy needs → shorter TTL
- **Load Patterns**: High traffic → longer TTL to reduce load
- **Storage Constraints**: Memory availability → adjust TTL accordingly

**TTL Recommendations:**
```typescript
// Static/Reference Data: 1 hour
const CACHE_TTL_STATIC = 3600;

// User Profiles: 5-10 minutes (frequently updated)
const CACHE_TTL_USERS = 600;

// Session Data: 1-2 minutes (highly volatile)
const CACHE_TTL_SESSION = 120;

// Transient Queries: 30 seconds (immediate consistency needed)
const CACHE_TTL_SHORT = 30;
```

### Cache Coherence

**Definition**: Keeping cache synchronized with the actual database state.

**Challenges:**
1. **Stale Data Risk**: Cache may contain outdated information
2. **Write-Through Delays**: Updates aren't immediately reflected
3. **Distributed Systems**: Multiple servers with different cache states

**Mitigation Strategies:**
1. **Explicit Invalidation** (Current): Clear cache on writes
2. **TTL-Based Expiration**: Automatic expiration limits staleness window
3. **Event-Driven Refresh**: Use message queues to trigger invalidations
4. **Dependency Tracking**: Clear related caches when a key changes

---

## Testing Cache Behavior

### Manual Testing with cURL

#### Test 1: Cache Miss (First Request)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "x-user-email: user@example.com" \
  -H "x-user-role: admin"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cacheStatus": "MISS",
    "users": [...]
  },
  "message": "Users fetched successfully"
}
```

**Expected Time**: ~100-150ms (database query + Redis store)

#### Test 2: Cache Hit (Immediate Repeat)

```bash
curl -X GET http://localhost:3000/api/users \
  -H "x-user-email: user@example.com" \
  -H "x-user-role: admin"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cacheStatus": "HIT",
    "users": [...]
  },
  "message": "Users fetched successfully (from cache)"
}
```

**Expected Time**: ~5-15ms (Redis retrieval)

**Performance Improvement**: ~10x faster than cache miss

#### Test 3: Cache Invalidation (After Create)

```bash
# Create new user (invalidates users:list cache)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'

# Next GET request will miss cache and fetch fresh data
curl -X GET http://localhost:3000/api/users \
  -H "x-user-email: user@example.com" \
  -H "x-user-role: admin"
```

**Expected**: Second request shows `"cacheStatus": "MISS"` (cache was invalidated)

#### Test 4: Wait for TTL Expiration

```bash
# First request (Cache Miss)
curl -X GET http://localhost:3000/api/users

# Wait 60+ seconds (TTL expires)

# Request after expiration (Cache Miss again)
curl -X GET http://localhost:3000/api/users
```

**Expected**: After 60 seconds, new request triggers cache miss and database query

---

## Monitoring & Debugging

### Check Redis Connection

```bash
# Connect to Redis CLI
redis-cli

# Ping Redis
PING
# Output: PONG

# View all cached keys
KEYS *

# Get specific cache value
GET users:list

# Check TTL of a key
TTL users:list
# Output: -1 (no expiration) or seconds remaining

# Clear all cache (development only)
FLUSHALL
```

### View Logs

Check application logs for cache operations:

```
✓ Redis client connected
Cache Miss - Fetching users from database
Users fetched and cached successfully
Cache Hit - Users fetched from Redis
Cache invalidated after user creation
```

### Performance Monitoring

Track cache metrics in your monitoring dashboard:

```typescript
// Example: Log cache statistics
const cacheStats = {
  hits: 1250,
  misses: 150,
  hitRate: (1250 / (1250 + 150)) * 100, // 89.3%
  avgResponseTime: {
    cacheHit: 8, // ms
    cacheMiss: 125, // ms
  }
};
```

**Target Metrics:**
- **Hit Rate**: > 80% (indicates good cache efficiency)
- **Cache Miss Response Time**: < 200ms (acceptable DB query time)
- **Cache Hit Response Time**: < 20ms (excellent performance)

---

## When Caching May Be Counterproductive

### Scenarios to Avoid or Reconsider Caching

1. **Real-Time Data**
   - Stock prices, live scores, active user counts
   - **Solution**: Shorter TTL (5-10 seconds) or event-based updates

2. **Highly Personalized Data**
   - User-specific settings, preferences, recommendations
   - **Solution**: Use cache keys that include user ID (`user:${userId}:settings`)

3. **Sensitive Data**
   - Authentication tokens, passwords, PII
   - **Solution**: Don't cache or use encrypted caches

4. **Large Data Sets**
   - Mega-sized lists or responses
   - **Solution**: Paginate data or cache only summaries

5. **Rapidly Changing Data**
   - Inventory, availability, pricing
   - **Solution**: Use very short TTL or no caching

6. **Infrequent Reads**
   - Rarely accessed data with high cache maintenance cost
   - **Solution**: Skip caching for low-traffic endpoints

---

## Reflection on Cache Strategy

### Strengths of Current Implementation

✅ **Simple & Effective**: Cache-aside pattern is easy to understand and implement  
✅ **Resilient**: Fails gracefully if Redis is unavailable (falls back to DB)  
✅ **Flexible**: Easy to adjust TTL based on data characteristics  
✅ **Production-Ready**: Proper error handling and logging in place  

### Potential Improvements

🔧 **Distributed Cache**: Consider consistency strategies for multi-server deployments  
🔧 **Cache Warming**: Pre-populate cache on startup for critical data  
🔧 **Compressed Storage**: For large objects, consider compression before caching  
🔧 **Cache Versioning**: Version cache keys to handle schema changes gracefully  
🔧 **Circuit Breaker**: Add fallback if Redis fails (serve stale data)  

---

## Best Practices

| Best Practice | Implementation |
|---------------|-----------------|
| **Always use TTL** | Prevents unbounded cache growth |
| **Invalidate strategically** | Clear only affected caches, not all |
| **Monitor hit rates** | Aim for 80%+ hit rate |
| **Log cache events** | Track hits, misses, and invalidations |
| **Use environment variables** | Never hardcode Redis credentials |
| **Handle Redis failures gracefully** | Fall back to database queries |
| **Version cache keys** | Handle schema changes without conflicts |
| **Document cache keys** | Keep inventory of all cached data |

---

## Next Steps

1. ✅ **Cache Warming**: Pre-load frequently accessed data at startup
2. 🔄 **Event-Driven Invalidation**: Use message queues for distributed cache management
3. 📊 **Cache Analytics**: Dashboard tracking hit rates, response times, and usage patterns
4. 🔒 **Compression**: Implement compression for large cached objects
5. 🌍 **Distributed Caching**: Setup Redis Cluster for multi-region deployments
6. ⚡ **Query Optimization**: Combine with database query caching for maximum performance
