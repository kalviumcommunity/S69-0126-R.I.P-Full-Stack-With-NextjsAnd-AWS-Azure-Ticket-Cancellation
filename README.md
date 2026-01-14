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

### Unified Response Envelope

Every API endpoint follows a standardized response format to ensure consistency, improve debugging, and enhance developer experience.

#### Response Structure

All responses include the following envelope:

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


