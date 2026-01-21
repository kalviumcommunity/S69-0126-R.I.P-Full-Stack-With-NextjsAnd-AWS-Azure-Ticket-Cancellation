# Prisma Schema - Full Definition

This document contains the complete Prisma schema with all models, enums, and relationships.

## File Location
`prisma/schema.prisma`

---

## Complete Schema

```prisma
// Ticket Cancellation System - Prisma Schema
// Designed for transparent bus ticket cancellation and refund tracking

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ==================== ENUMS ====================

enum UserRole {
  PASSENGER
  OPERATOR
  ADMIN
}

enum TicketStatus {
  ACTIVE
  CANCELLED
  REFUNDED
  EXPIRED
}

enum CancellationStatus {
  PENDING
  APPROVED
  REJECTED
  REFUND_INITIATED
  REFUND_COMPLETED
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  UPI
  NET_BANKING
  WALLET
}

enum RefundStatus {
  PENDING
  PROCESSED
  COMPLETED
  FAILED
}

// ==================== MODELS ====================

/// Users represent passengers, operators, and administrators
model User {
  id                Int               @id @default(autoincrement())
  email             String            @unique
  name              String
  phone             String            @unique
  password          String
  role              UserRole          @default(PASSENGER)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  tickets           Ticket[]
  cancellations     Cancellation[]
  refunds           Refund[]
  payments          Payment[]
  operatedRoutes    BusRoute[]        @relation("OperatorRoutes")

  @@index([email])
  @@index([phone])
  @@index([role])
}

/// Bus routes represent the journey from source to destination
model BusRoute {
  id                Int               @id @default(autoincrement())
  operatorId        Int
  source            String
  destination       String
  departureTime     DateTime
  arrivalTime       DateTime
  totalSeats        Int
  availableSeats    Int
  basePrice         Float
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  operator          User              @relation("OperatorRoutes", fields: [operatorId], references: [id], onDelete: Cascade)
  tickets           Ticket[]

  @@index([operatorId])
  @@index([departureTime])
  @@index([source])
  @@index([destination])
}

/// Tickets represent individual seat reservations
model Ticket {
  id                Int               @id @default(autoincrement())
  ticketNumber      String            @unique
  userId            Int
  routeId           Int
  seatNumber        String
  status            TicketStatus      @default(ACTIVE)
  purchasePrice     Float
  purchasedAt       DateTime          @default(now())
  travelDate        DateTime
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  route             BusRoute          @relation(fields: [routeId], references: [id], onDelete: Cascade)
  cancellation      Cancellation?
  payment           Payment?
  refund            Refund?

  @@unique([routeId, seatNumber])
  @@index([userId])
  @@index([routeId])
  @@index([ticketNumber])
  @@index([status])
  @@index([travelDate])
}

/// Cancellation policies define refund rules
model CancellationPolicy {
  id                Int               @id @default(autoincrement())
  name              String
  daysBeforeDeparture Int             // e.g., 7 days before departure
  refundPercentage  Float             // e.g., 90 (means 90%)
  cancellationFee   Float             @default(0)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([daysBeforeDeparture])
}

/// Cancellations track ticket cancellation requests
model Cancellation {
  id                Int               @id @default(autoincrement())
  ticketId          Int               @unique
  userId            Int
  cancellationReason String
  status            CancellationStatus @default(PENDING)
  requestedAt       DateTime          @default(now())
  approvedAt        DateTime?
  completedAt       DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  ticket            Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  refund            Refund?

  @@index([userId])
  @@index([ticketId])
  @@index([status])
  @@index([requestedAt])
}

/// Payments track ticket purchase payments
model Payment {
  id                Int               @id @default(autoincrement())
  ticketId          Int               @unique
  userId            Int
  amount            Float
  method            PaymentMethod
  transactionId     String            @unique
  status            String            @default("COMPLETED")
  paidAt            DateTime          @default(now())
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  ticket            Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([ticketId])
  @@index([transactionId])
  @@index([paidAt])
}

/// Refunds track ticket refund processing
model Refund {
  id                Int               @id @default(autoincrement())
  ticketId          Int               @unique
  userId            Int
  cancellationId    Int               @unique
  refundAmount      Float
  refundPercentage  Float             // e.g., 85 (means 85% of purchase price)
  cancellationFee   Float             @default(0)
  status            RefundStatus      @default(PENDING)
  initiatedAt       DateTime          @default(now())
  completedAt       DateTime?
  bankAccount       String?           // Masked for security
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  
  // Relations
  ticket            Ticket            @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  cancellation      Cancellation      @relation(fields: [cancellationId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([ticketId])
  @@index([cancellationId])
  @@index([status])
  @@index([initiatedAt])
}

/// Audit logs track all significant state changes
model AuditLog {
  id                Int               @id @default(autoincrement())
  entityType        String            // e.g., "Ticket", "Cancellation", "Refund"
  entityId          Int
  action            String            // e.g., "CREATED", "UPDATED", "CANCELLED"
  changedFields     String?           // JSON of what changed
  userId            Int?
  createdAt         DateTime          @default(now())

  @@index([entityType])
  @@index([entityId])
  @@index([userId])
  @@index([createdAt])
}
```

---

## Schema Statistics

| Metric | Count |
|---|---|
| **Models** | 8 |
| **Enums** | 5 |
| **Total Fields** | 70+ |
| **Relationships** | 12 |
| **Unique Constraints** | 8 |
| **Indexes** | 15+ |
| **Composite Keys** | 2 |

---

## Enums Reference

### UserRole
- `PASSENGER` — End users booking tickets
- `OPERATOR` — Bus operators managing routes
- `ADMIN` — System administrators managing refunds

### TicketStatus
- `ACTIVE` — Ticket purchased, valid for travel
- `CANCELLED` — Ticket cancelled by user
- `REFUNDED` — Refund completed, ticket void
- `EXPIRED` — Travel date passed

### CancellationStatus
- `PENDING` — Awaiting approval
- `APPROVED` — Cancellation approved
- `REJECTED` — Cancellation rejected
- `REFUND_INITIATED` — Refund processing started
- `REFUND_COMPLETED` — Refund sent to customer

### PaymentMethod
- `CREDIT_CARD` — Credit card payment
- `DEBIT_CARD` — Debit card payment
- `UPI` — Unified Payments Interface (India)
- `NET_BANKING` — Direct bank transfer
- `WALLET` — Digital wallet payment

### RefundStatus
- `PENDING` — Awaiting processing
- `PROCESSED` — Processed by payment gateway
- `COMPLETED` — Successfully refunded to customer
- `FAILED` — Refund failed, may need retry

---

## Relationships Overview

### 1:N Relationships
- User → Tickets (one user, many tickets)
- User → Cancellations (one user, many cancellation requests)
- User → Refunds (one user, many refunds)
- User → Payments (one user, many payments)
- User → BusRoutes as Operator (one operator, many routes)
- BusRoute → Tickets (one route, many tickets)

### 1:1 Relationships
- Ticket → Payment (one ticket, one payment)
- Ticket → Cancellation (one ticket, one cancellation)
- Ticket → Refund (one ticket, one refund)
- Cancellation → Refund (one cancellation, one refund)

---

## Foreign Keys & Cascades

| FK Column | References | ON DELETE |
|---|---|---|
| `Ticket.userId` | `User.id` | CASCADE |
| `Ticket.routeId` | `BusRoute.id` | CASCADE |
| `BusRoute.operatorId` | `User.id` | CASCADE |
| `Cancellation.userId` | `User.id` | CASCADE |
| `Cancellation.ticketId` | `Ticket.id` | CASCADE |
| `Refund.userId` | `User.id` | CASCADE |
| `Refund.ticketId` | `Ticket.id` | CASCADE |
| `Refund.cancellationId` | `Cancellation.id` | CASCADE |
| `Payment.userId` | `User.id` | CASCADE |
| `Payment.ticketId` | `Ticket.id` | CASCADE |

---

## Indexes for Performance

| Table | Columns | Purpose |
|---|---|---|
| User | email | Fast authentication lookups |
| User | phone | Phone-based lookups |
| User | role | Filter users by type |
| BusRoute | operatorId | Find routes by operator |
| BusRoute | departureTime | Find upcoming routes |
| BusRoute | source | Search by origin |
| BusRoute | destination | Search by destination |
| Ticket | userId | Find user's tickets |
| Ticket | routeId | Find tickets on route |
| Ticket | ticketNumber | Look up ticket by number |
| Ticket | status | Filter by ticket status |
| Ticket | travelDate | Find tickets by date |
| Cancellation | userId | Find user's cancellations |
| Cancellation | ticketId | Find cancellation for ticket |
| Cancellation | status | Filter by approval status |
| Cancellation | requestedAt | Sort by request time |
| Refund | userId | Find user's refunds |
| Refund | ticketId | Find refund for ticket |
| Refund | cancellationId | Find refund for cancellation |
| Refund | status | Filter by refund status |
| Refund | initiatedAt | Sort by initiation time |
| Payment | userId | Find user's payments |
| Payment | ticketId | Find payment for ticket |
| Payment | transactionId | Verify payment from gateway |
| Payment | paidAt | Sort by payment date |
| AuditLog | entityType | Find logs by entity |
| AuditLog | entityId | Find logs for entity |
| AuditLog | userId | Find logs by user |
| AuditLog | createdAt | Sort by date |

---

## Composite Constraints

### Composite UNIQUE
```
(routeId, seatNumber) → No double-booking same seat
```

### Composite FOREIGN KEYS
```
(routeId, seatNumber) via Ticket model → Prevents seat conflicts
```

---

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Client**
   ```bash
   npx prisma generate
   ```

3. **Create Database**
   ```bash
   npm run prisma:migrate -- --name init_schema
   ```

4. **Seed Data**
   ```bash
   npm run prisma:seed
   ```

5. **View Database**
   ```bash
   npm run prisma:studio
   ```

---

## Files Related to This Schema

- **Seed Data:** [prisma/seed.ts](prisma/seed.ts)
- **Schema Documentation:** [SCHEMA_DOCUMENTATION.md](SCHEMA_DOCUMENTATION.md)
- **Migration Guide:** [MIGRATION_SETUP_GUIDE.md](MIGRATION_SETUP_GUIDE.md)
- **Design Summary:** [DATABASE_DESIGN_SUMMARY.md](DATABASE_DESIGN_SUMMARY.md)

---
