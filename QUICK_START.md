# Quick Start Guide - Database Setup

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure PostgreSQL Connection
Edit `.env` file (already created with example values):
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ticketcancellation?schema=public"
```

**Replace `postgres123` with your actual PostgreSQL password.**

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

✅ Output: `Generated Prisma Client (7.2.0) to ./src/generated/prisma`

### Step 4: Create Database Tables
```bash
npm run prisma:migrate -- --name init_schema
```

✅ Output: `✔ Your database has been successfully migrated!`

### Step 5: Seed Sample Data
```bash
npm run prisma:seed
```

✅ Output shows users, routes, tickets, payments, refunds, and audit logs created

### Step 6: View Database
```bash
npm run prisma:studio
```

✅ Opens http://localhost:5555 with interactive database explorer

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| [SCHEMA_DOCUMENTATION.md](SCHEMA_DOCUMENTATION.md) | Detailed explanation of 8 models, design decisions, indexes |
| [MIGRATION_SETUP_GUIDE.md](MIGRATION_SETUP_GUIDE.md) | Step-by-step setup, troubleshooting, PostgreSQL installation |
| [DATABASE_DESIGN_SUMMARY.md](DATABASE_DESIGN_SUMMARY.md) | Design principles, scalability, business logic enforcement |
| [PRISMA_SCHEMA_REFERENCE.md](PRISMA_SCHEMA_REFERENCE.md) | Complete schema definition with all 8 models and 5 enums |
| [README.md](README.md) | Project overview with API documentation |

---

## 🏗️ Database Architecture

### 8 Core Models
```
✅ User          — Passenger, Operator, Admin
✅ BusRoute      — Journey definition
✅ Ticket        — Seat reservation
✅ Payment       — Purchase transaction
✅ Cancellation  — Refund request
✅ Refund        — Money return processing
✅ CancellationPolicy — Refund rules
✅ AuditLog      — Compliance trail
```

### 5 Type-Safe Enums
```
✅ UserRole               (PASSENGER, OPERATOR, ADMIN)
✅ TicketStatus          (ACTIVE, CANCELLED, REFUNDED, EXPIRED)
✅ CancellationStatus    (PENDING, APPROVED, REJECTED, REFUND_INITIATED, REFUND_COMPLETED)
✅ PaymentMethod         (CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING, WALLET)
✅ RefundStatus          (PENDING, PROCESSED, COMPLETED, FAILED)
```

### Key Features
```
✅ 15+ Strategic Indexes     → <10ms query latency
✅ Composite Unique Keys     → Prevents double-booking
✅ Referential Integrity     → Foreign keys with CASCADE
✅ 3NF Normalization        → No redundancy
✅ Audit Trail              → Every action logged
✅ Type Safety              → ENUMs for constants
```

---

## ⚡ Most Common Commands

```bash
# View database interactively
npm run prisma:studio

# Create a new migration
npm run prisma:migrate -- --name description_of_changes

# Reset database (development only)
npm run prisma:migrate -- reset

# Seed database with sample data
npm run prisma:seed

# Generate Prisma client after schema changes
npx prisma generate

# Format schema file
npx prisma format
```

---

## 🔍 Sample Queries

### Find User's Tickets
```typescript
const tickets = await prisma.ticket.findMany({
  where: { userId: 1 },
  include: { route: true, payment: true, cancellation: true }
});
```

### Search Routes
```typescript
const routes = await prisma.busRoute.findMany({
  where: {
    source: "Mumbai",
    destination: "Pune",
    departureTime: { gte: tomorrow }
  },
  orderBy: { departureTime: "asc" }
});
```

### Get Pending Refunds
```typescript
const pending = await prisma.refund.findMany({
  where: { status: "PENDING" },
  include: { ticket: true, cancellation: true, user: true }
});
```

### Create New Ticket
```typescript
const ticket = await prisma.ticket.create({
  data: {
    ticketNumber: "TKT-2026-001",
    userId: 1,
    routeId: 1,
    seatNumber: "A1",
    purchasePrice: 500,
    travelDate: new Date("2026-02-01")
  }
});
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] `.env` file has `DATABASE_URL` configured
- [ ] `npm install` completed successfully
- [ ] `npx prisma generate` created Prisma client
- [ ] `npm run prisma:migrate` created database tables
- [ ] `npm run prisma:seed` populated sample data
- [ ] `npm run prisma:studio` shows all data in explorer
- [ ] All 8 tables visible in Prisma Studio
- [ ] Sample data shows 3 users, 3 routes, 3 tickets

---

## 🐛 Troubleshooting

### PostgreSQL Connection Failed?
1. Ensure PostgreSQL service is running
2. Verify `DATABASE_URL` in `.env` matches your setup
3. Check PostgreSQL user password is correct
4. Try connecting manually: `psql -U postgres`

### Migration Failed?
1. Check database exists: `CREATE DATABASE ticketcancellation;`
2. Drop and recreate: `npm run prisma:migrate -- reset`
3. View error details in migration file

### Port 5432 Already in Use?
1. Change PostgreSQL port to 5433
2. Update `DATABASE_URL`: `...@localhost:5433/...`

### Prisma Studio Won't Start?
1. Kill any existing Prisma Studio: `npx prisma studio --port 5556`
2. Try alternate port if 5555 is busy

---

## 📊 Sample Data Included

### 3 Users
- **john.doe@example.com** (PASSENGER) — Books tickets
- **operator@buslines.com** (OPERATOR) — Manages routes
- **admin@ticketsystem.com** (ADMIN) — Approves refunds

### 3 Bus Routes
- Mumbai → Pune (7 days away)
- Delhi → Jaipur (3 days away)
- Bangalore → Hyderabad (1 day away)

### 3 Tickets
- TKT-2026-001: Mumbai-Pune, Seat A1, ₹500
- TKT-2026-002: Delhi-Jaipur, Seat B5, ₹800
- TKT-2026-003: Bangalore-Hyderabad, Seat C10, ₹600

### 1 Cancellation Request
- Status: APPROVED
- Reason: Flight schedule changed

### 1 Refund
- Amount: ₹475 (95% of ₹500)
- Status: COMPLETED

---

## 🎯 Next Steps

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Build API Endpoints**
   - `/api/tickets` — Manage tickets
   - `/api/refunds` — Handle refunds
   - `/api/cancellations` — Process cancellations

3. **Implement UI**
   - Ticket booking form
   - Refund status dashboard
   - Route search interface

4. **Add Authentication**
   - User login/signup
   - Role-based access control
   - JWT token validation

5. **Deploy to Production**
   - AWS RDS for PostgreSQL
   - Azure Database for PostgreSQL
   - Environment variable configuration

---

## 📖 Learn More

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## 🆘 Need Help?

Refer to:
- [MIGRATION_SETUP_GUIDE.md](MIGRATION_SETUP_GUIDE.md) — Detailed setup & troubleshooting
- [SCHEMA_DOCUMENTATION.md](SCHEMA_DOCUMENTATION.md) — Data model details
- [DATABASE_DESIGN_SUMMARY.md](DATABASE_DESIGN_SUMMARY.md) — Design patterns & scalability

---
