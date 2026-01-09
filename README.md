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

| HTTP Verb | Endpoint | Purpose | Description |
|-----------|----------|---------|-------------|
| **GET** | `/api/users` | Read all users | Retrieve a list of all users in the system |
| **POST** | `/api/users` | Create user | Add a new user to the system |
| **GET** | `/api/users/:id` | Read specific user | Retrieve details of a single user by ID |
| **PUT** | `/api/users/:id` | Full update | Replace all user data (requires all fields) |
| **PATCH** | `/api/users/:id` | Partial update | Update specific user fields only |
| **DELETE** | `/api/users/:id` | Remove user | Delete a user from the system |

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
  "count": 2
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
  "data": {
    "id": 3,
    "name": "Alice Johnson",
    "email": "alice@example.com"
  },
  "message": "User created successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Name and email are required"
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "error": "Email already exists"
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
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found"
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
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com"
  },
  "message": "User updated successfully"
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
  "data": {
    "id": 1,
    "name": "John Partially Updated",
    "email": "john@example.com"
  },
  "message": "User updated successfully"
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
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User deleted successfully"
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

| Status Code | Meaning | Example |
|-------------|---------|---------|
| **400** | Bad Request | Invalid input data or missing required fields |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Duplicate resource (e.g., email already exists) |
| **500** | Internal Server Error | Server-side error or database failure |

**Standard error format:**
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---



## Reflection on API Design

### How Consistent Naming Improves Maintainability

**1. Predictable URL Structure**
- Using RESTful conventions (`/api/users` for collection, `/api/users/:id` for specific resource) makes the API intuitive
- Developers can predict endpoint URLs without documentation
- Reduces onboarding time for new team members

**2. Standard HTTP Verb Mapping**
- Each verb has a clear, single purpose (GET = read, POST = create, etc.)
- Prevents confusion about which endpoint to use for specific actions
- Makes API behavior consistent with industry standards

**3. Consistent Response Format**
- Every response includes `success` boolean and either `data` or `error`
- Standardized error messages across all endpoints
- Frontend can handle responses uniformly, reducing error-prone conditional logic

**4. Clear Separation: PUT vs PATCH**
- **PUT** requires all fields (full replacement)
- **PATCH** allows partial updates (send only changed fields)
- This distinction prevents accidental data loss and makes intent explicit

**5. Reduces Integration Errors**
- Consistent field names (`id`, `name`, `email`) across all endpoints
- Status codes follow HTTP standards (201 for creation, 404 for not found)
- Validation errors are descriptive and actionable

**6. Easier Testing and Documentation**
- Uniform patterns make automated testing straightforward
- API documentation can follow a template
- Mock responses are predictable

**7. Future-Proof Scalability**
- Adding new resources (e.g., `/api/tickets`, `/api/refunds`) follows the same pattern
- Query parameters for pagination/filtering can be standardized
- Middleware for authentication/authorization applies uniformly

### Impact on This Project

For the Ticket Cancellation system, this consistent API design will:
- Enable reliable integration between frontend booking interface and backend
- Make it easy to add new resources (tickets, refunds, cancellations)
- Provide clear contracts for third-party integrations (payment gateways, bus operators)
- Facilitate automated testing and monitoring
- Reduce debugging time with predictable error handling

---

## Reflection

This structure follows the default Next.js App Router convention, keeping the project simple and easy to understand for all team members.

Clear separation between routing (app/) and static assets (public/)

Easy to introduce new pages like dashboard, login, and admin panels

Supports gradual addition of APIs, authentication, and database logic

Prevents over-engineering in early stages while allowing smooth scaling.

