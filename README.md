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
├── app/
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

```bash
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
