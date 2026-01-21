# Entity-Relationship Diagram & Visual Schema

## Visual ER Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER TABLE                               │
├─────────────────────────────────────────────────────────────────────┤
│ PK  id (INT)                                                         │
│ UK  email (VARCHAR) - Unique                                        │
│ UK  phone (VARCHAR) - Unique                                        │
│     name (VARCHAR)                                                   │
│     password (VARCHAR)                                               │
│     role (ENUM) - PASSENGER | OPERATOR | ADMIN                     │
│     createdAt (TIMESTAMP)                                           │
│     updatedAt (TIMESTAMP)                                           │
│                                                                      │
│ Indexes: email, phone, role                                         │
└────────────────────────┬───────────────────────────────────────────┘
         │               │
         │ (1:N)         │ (1:N)
         │               └─────────────────────┐
         │                                     │
         │                    ┌────────────────────────────────────┐
         │                    │   BUSROUTE TABLE                   │
         │                    ├────────────────────────────────────┤
         │                    │ PK  id (INT)                       │
         │                    │ FK  operatorId → User.id           │
         │                    │     source (VARCHAR)               │
         │                    │     destination (VARCHAR)          │
         │                    │     departureTime (TIMESTAMP)      │
         │                    │     arrivalTime (TIMESTAMP)        │
         │                    │     totalSeats (INT)               │
         │                    │     availableSeats (INT)           │
         │                    │     basePrice (FLOAT)              │
         │                    │     createdAt (TIMESTAMP)          │
         │                    │     updatedAt (TIMESTAMP)          │
         │                    │                                    │
         │                    │ Indexes: operatorId, departureTime,│
         │                    │          source, destination       │
         │                    └─────────────────────┬──────────────┘
         │                                          │
         │                                          │ (1:N)
         │ (1:N)                                    │
         │                      ┌──────────────────────────────────┐
         │                      │    TICKET TABLE                  │
         │                      ├──────────────────────────────────┤
         │                      │ PK  id (INT)                     │
         │                      │ UK  ticketNumber (VARCHAR)       │
         │                      │ FK  userId → User.id             │
         │                      │ FK  routeId → BusRoute.id        │
         │                      │ UK* (routeId, seatNumber)        │
         │                      │     seatNumber (VARCHAR)         │
         │                      │     status (ENUM)                │
         │                      │     purchasePrice (FLOAT)        │
         │                      │     purchasedAt (TIMESTAMP)      │
         │                      │     travelDate (DATETIME)        │
         │                      │     createdAt (TIMESTAMP)        │
         │                      │     updatedAt (TIMESTAMP)        │
         │                      │                                  │
         │                      │ Indexes: userId, routeId,        │
         │                      │          ticketNumber, status,   │
         │                      │          travelDate              │
         │                      └────────┬──────┬────────┬─────────┘
         │                              │      │        │
         │                         (1:1) │      │        │ (1:1)
         │                              │      │        │
         │              ┌───────────────┴───┐  │     ┌──┴─────────────────┐
         │              │  PAYMENT TABLE    │  │     │   REFUND TABLE     │
         │              ├───────────────────┤  │     ├────────────────────┤
         │              │ PK id (INT)       │  │     │ PK  id (INT)       │
         │              │ FK ticketId→...   │  │     │ FK  ticketId→...   │
         │              │ FK userId→User.id │  │     │ FK  userId→User.id │
         │              │ UK transactionId  │  │     │ FK  cancellationId │
         │              │    amount (FLOAT) │  │     │     refundAmount   │
         │              │    method (ENUM)  │  │     │     refund%        │
         │              │    status (TEXT)  │  │     │     cancellationFee│
         │              │    paidAt (TS)    │  │     │     status (ENUM)  │
         │              │    createdAt (TS) │  │     │     initiatedAt    │
         │              │    updatedAt (TS) │  │     │     completedAt    │
         │              │                   │  │     │     bankAccount    │
         │              │ Indexes: userId,  │  │     │     createdAt      │
         │              │          ticketId │  │     │     updatedAt      │
         │              │          transId  │  │     │                    │
         │              │          paidAt   │  │     │ Indexes: userId,   │
         │              └───────────────────┘  │     │          status,   │
         │                                     │     │          initiatedAt
         │                                     │     └────────┬─────────────┘
         │                         ┌───────────┴──────┐      │
         │                         │ (1:1)            │      │ (1:1)
         │              ┌──────────────────────────────────┐ │
         │              │  CANCELLATION TABLE              │ │
         │              ├──────────────────────────────────┤ │
         │              │ PK  id (INT)                     │ │
         │              │ FK  ticketId → Ticket.id (UNQ)  ├─┘
         │              │ FK  userId → User.id             │
         │              │     cancellationReason (TEXT)    │
         │              │     status (ENUM)                │
         │              │     requestedAt (TIMESTAMP)      │
         │              │     approvedAt (TIMESTAMP)       │
         │              │     completedAt (TIMESTAMP)      │
         │              │     createdAt (TIMESTAMP)        │
         │              │     updatedAt (TIMESTAMP)        │
         │              │                                  │
         │              │ Indexes: userId, ticketId,       │
         │              │          status, requestedAt     │
         │              └──────────────────────────────────┘
         │
         │ (1:N)
         │
         └──────────────────────────────────────┐
                                                │
                         ┌──────────────────────┴───────────┐
                         │                                  │
            ┌────────────────────────┐      ┌──────────────────────┐
            │ AUDITLOG TABLE         │      │ CANCELLATIONPOLICY   │
            ├────────────────────────┤      │ TABLE                │
            │ PK  id (INT)           │      ├──────────────────────┤
            │     entityType (TEXT)  │      │ PK  id (INT)         │
            │     entityId (INT)     │      │     name (VARCHAR)   │
            │     action (TEXT)      │      │     daysBeforeDep.   │
            │     changedFields (TX) │      │     refundPercentage │
            │ FK  userId → User.id   │      │     cancellationFee  │
            │     createdAt (TS)     │      │     createdAt        │
            │                        │      │     updatedAt        │
            │ Indexes: entityType,   │      │                      │
            │          entityId,     │      │ Indexes:             │
            │          userId,       │      │   daysBeforeDep.     │
            │          createdAt     │      └──────────────────────┘
            └────────────────────────┘
```

---

## Table Relationships Summary

### One-to-Many (1:N)
```
User          (1) ──── (*) Ticket
User          (1) ──── (*) Cancellation
User          (1) ──── (*) Refund
User          (1) ──── (*) Payment
User          (1) ──── (*) BusRoute (as Operator)
BusRoute      (1) ──── (*) Ticket
```

### One-to-One (1:1)
```
Ticket        (1) ──── (0..1) Payment
Ticket        (1) ──── (0..1) Cancellation
Ticket        (1) ──── (0..1) Refund
Cancellation  (1) ──── (0..1) Refund
```

---

## Key Constraints & Indexes

### Unique Constraints
```sql
-- No duplicate accounts
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT uk_users_phone UNIQUE (phone);

-- User-facing ticket identifier
ALTER TABLE tickets ADD CONSTRAINT uk_tickets_number UNIQUE (ticket_number);

-- No double-booking same seat
ALTER TABLE tickets ADD CONSTRAINT uk_tickets_seat 
  UNIQUE (route_id, seat_number);

-- Immutable transactions
ALTER TABLE payments ADD CONSTRAINT uk_payments_txn UNIQUE (transaction_id);

-- One cancellation per ticket
ALTER TABLE cancellations ADD CONSTRAINT uk_cancellations_ticket 
  UNIQUE (ticket_id);

-- One refund per cancellation
ALTER TABLE refunds ADD CONSTRAINT uk_refunds_cancellation 
  UNIQUE (cancellation_id);
```

### Indexes for Performance
```sql
-- User authentication & filtering
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Route search & discovery
CREATE INDEX idx_routes_operator ON bus_routes(operator_id);
CREATE INDEX idx_routes_departure ON bus_routes(departure_time);
CREATE INDEX idx_routes_source ON bus_routes(source);
CREATE INDEX idx_routes_destination ON bus_routes(destination);

-- Ticket lookups
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_route ON tickets(route_id);
CREATE INDEX idx_tickets_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_date ON tickets(travel_date);

-- Cancellation & refund queries
CREATE INDEX idx_cancellations_user ON cancellations(user_id);
CREATE INDEX idx_cancellations_ticket ON cancellations(ticket_id);
CREATE INDEX idx_cancellations_status ON cancellations(status);
CREATE INDEX idx_cancellations_requested ON cancellations(requested_at);

CREATE INDEX idx_refunds_user ON refunds(user_id);
CREATE INDEX idx_refunds_ticket ON refunds(ticket_id);
CREATE INDEX idx_refunds_cancellation ON refunds(cancellation_id);
CREATE INDEX idx_refunds_status ON refunds(status);
CREATE INDEX idx_refunds_initiated ON refunds(initiated_at);

-- Payment tracking
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_ticket ON payments(ticket_id);
CREATE INDEX idx_payments_txn ON payments(transaction_id);
CREATE INDEX idx_payments_date ON payments(paid_at);

-- Audit logging
CREATE INDEX idx_audit_entity ON audit_logs(entity_type);
CREATE INDEX idx_audit_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  User Login     │
│  (email/phone)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Search Routes      │
│  (source, dest,     │
│   departureTime)    │
└────────┬────────────┘
         │
         ▼
┌──────────────────────┐
│  Book Ticket         │
│  1. Create Ticket    │
│  2. Create Payment   │
│  3. Update Route     │
│     availableSeats   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Request Cancellation│
│  1. Create Cancellation
│  2. Set status:      │
│     PENDING          │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Admin Approves      │
│  1. Update status:   │
│     APPROVED         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Calculate Refund    │
│  1. Query Policy     │
│  2. Apply % & fee    │
│  3. Create Refund    │
│  4. Update Ticket    │
│     status:REFUNDED  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Process Refund      │
│  1. Call payment     │
│     gateway          │
│  2. Update status:   │
│     COMPLETED        │
│  3. Log in AuditLog  │
└──────────────────────┘
```

---

## Query Path Examples

### "Show my tickets"
```
User (email) 
  ↓ [index: email]
User.id 
  ↓ [index: Ticket.userId]
Tickets 
  ↓ [include]
BusRoute, Payment, Cancellation
```
**Performance:** O(1) with userId index

### "Find available buses tomorrow"
```
BusRoute
  ↓ [index: source, destination, departureTime]
Filter routes
  ↓ [include]
Tickets (where status = ACTIVE)
  ↓ [count]
Calculate availableSeats
```
**Performance:** O(1) with composite index

### "Approve pending refunds"
```
Cancellation (status = PENDING)
  ↓ [index: status, requestedAt]
Get records
  ↓ [for each]
Create Refund
  ↓ [include]
Calculate amount from Policy
  ↓ [index: daysBeforeDeparture]
Update Ticket status
```
**Performance:** O(n) where n = pending count, optimized with status index

---

## Enum Values Reference

### UserRole
- ✅ `PASSENGER` — Buys tickets, requests cancellations
- ✅ `OPERATOR` — Creates routes, manages schedules
- ✅ `ADMIN` — Approves refunds, manages policies

### TicketStatus
- ✅ `ACTIVE` — Ticket valid for travel
- ✅ `CANCELLED` — Cancelled by user
- ✅ `REFUNDED` — Refund completed
- ✅ `EXPIRED` — Travel date passed

### CancellationStatus
- ✅ `PENDING` — Awaiting approval
- ✅ `APPROVED` — Approved by admin
- ✅ `REJECTED` — Rejected by admin
- ✅ `REFUND_INITIATED` — Refund processing started
- ✅ `REFUND_COMPLETED` — Refund sent to customer

### PaymentMethod
- ✅ `CREDIT_CARD` — Credit card transaction
- ✅ `DEBIT_CARD` — Debit card transaction
- ✅ `UPI` — India UPI payment
- ✅ `NET_BANKING` — Direct bank transfer
- ✅ `WALLET` — Digital wallet

### RefundStatus
- ✅ `PENDING` — Awaiting processing
- ✅ `PROCESSED` — Processed by gateway
- ✅ `COMPLETED` — Successfully refunded
- ✅ `FAILED` — Refund failed

---

## Migration SQL (Auto-Generated)

When you run `npm run prisma:migrate`, Prisma generates SQL like:

```sql
-- CreateTable users
CREATE TABLE "users" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'PASSENGER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_email_key" UNIQUE ("email"),
  CONSTRAINT "users_phone_key" UNIQUE ("phone")
);

-- CreateTable bus_routes
CREATE TABLE "bus_routes" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "operatorId" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "departureTime" TIMESTAMP(3) NOT NULL,
  "arrivalTime" TIMESTAMP(3) NOT NULL,
  "totalSeats" INTEGER NOT NULL,
  "availableSeats" INTEGER NOT NULL,
  "basePrice" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bus_routes_operatorId_fkey" 
    FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- [Additional tables created similarly...]

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "users_role_idx" ON "users"("role");
-- [Additional indexes...]
```

---

## Scalability Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ Primary │  │ Read    │  │ Read    │                 │
│  │  Write  │──│ Replica │  │ Replica │                 │
│  └────┬────┘  └────┬────┘  └────┬────┘                 │
│       │            │            │                       │
│  ┌────┴───────────┴───────────┘                        │
│  │ Connection Pool (Prisma)                            │
│  └────┬────────────────────────────────────────┘       │
└───────┼────────────────────────────────────────────────┘
        │
        │ Read/Write Queries
        │
┌───────┴───────────────────────────────────────────────┐
│              Application Layer                        │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ API      │  │ API      │  │ API      │           │
│  │ Tickets  │  │ Refunds  │  │ Users    │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                       │
└───────┬───────────────────────────────────────────────┘
        │
        │ Optional Caching Layer
        │
┌───────▼──────────────────────────────────────────────┐
│  Redis Cache                                         │
│  - Routes (30 min TTL)                              │
│  - Policies (24 hr TTL)                             │
│  - User sessions                                     │
└────────────────────────────────────────────────────┘
```

---
