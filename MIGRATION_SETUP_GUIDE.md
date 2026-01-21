# Database Migration & Setup Guide

## Prerequisites

### Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer and follow setup wizard
3. Note the password for `postgres` user
4. Ensure PostgreSQL service is running (Services app)

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

---

## Create Database

### Connect to PostgreSQL

**Windows (Command Prompt):**
```bash
psql -U postgres
```

**macOS/Linux:**
```bash
psql -U postgres
```

### Create Database

```sql
CREATE DATABASE ticketcancellation;
\c ticketcancellation
```

---

## Environment Configuration

### Update .env File

Verify that `.env` contains:
```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ticketcancellation?schema=public"
```

**Important:** Replace `postgres123` with your actual PostgreSQL password.

---

## Run Migrations

### Initialize Prisma Migrations

```bash
npm run prisma:migrate -- --name init_schema
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "ticketcancellation" at "localhost:5432"

✔ Migration `20250121_init_schema` created successfully
✔ Database reset. The following migration(s) have been applied:

migrations/
  └─ 20250121_init_schema/
    └─ migration.sql

Your database has been successfully migrated!
```

### Verify Tables Created

```bash
npm run prisma:studio
```

This opens **http://localhost:5555** showing all created tables:
- ✅ users
- ✅ bus_routes
- ✅ tickets
- ✅ cancellation_policies
- ✅ cancellations
- ✅ payments
- ✅ refunds
- ✅ audit_logs

---

## Seed Database

### Run Seed Script

```bash
npm run prisma:seed
```

**Expected Output:**
```
🌱 Starting database seeding...
🧹 Cleaning existing data...
👤 Creating users...
✅ Users created: 1, 2, 3
📋 Creating cancellation policies...
✅ Policies created
🚌 Creating bus routes...
✅ Routes created: 1, 2, 3
🎫 Creating tickets...
✅ Tickets created: 1, 2, 3
💳 Creating payments...
✅ Payments created
❌ Creating cancellation request...
✅ Cancellation created: 1
💰 Creating refund...
✅ Refund created: 1
📝 Creating audit logs...
✅ Audit logs created

✨ Database seeding completed successfully!
📊 Summary:
   - Users: 3 (1 passenger, 1 operator, 1 admin)
   - Routes: 3
   - Tickets: 3
   - Payments: 3
   - Cancellations: 1
   - Refunds: 1
   - Audit Logs: 3
   - Policies: 3
```

---

## Verify Seeded Data

### Open Prisma Studio

```bash
npm run prisma:studio
```

### Check Data in Each Table

**1. Users Table**
```
ID | Email                    | Name              | Role
1  | john.doe@example.com     | John Doe          | PASSENGER
2  | operator@buslines.com    | Bus Lines Operator| OPERATOR
3  | admin@ticketsystem.com   | System Admin      | ADMIN
```

**2. Bus Routes Table**
```
ID | Source    | Destination | Departure Time | Available Seats
1  | Mumbai    | Pune        | 7 days from now| 42 / 45
2  | Delhi     | Jaipur      | 3 days from now| 48 / 50
3  | Bangalore | Hyderabad   | 1 day from now | 38 / 40
```

**3. Tickets Table**
```
ID | TicketNumber | User ID | Route ID | Seat | Status | Price
1  | TKT-2026-001 | 1       | 1        | A1   | ACTIVE | 500
2  | TKT-2026-002 | 1       | 2        | B5   | ACTIVE | 800
3  | TKT-2026-003 | 1       | 3        | C10  | ACTIVE | 600
```

**4. Payments Table**
```
ID | Ticket ID | User ID | Amount | Method       | Transaction ID
1  | 1         | 1       | 500    | CREDIT_CARD  | TXN-001-ABC123
2  | 2         | 1       | 800    | UPI          | TXN-002-XYZ789
3  | 3         | 1       | 600    | NET_BANKING  | TXN-003-PQR456
```

**5. Cancellation Requests Table**
```
ID | Ticket ID | User ID | Status   | Reason
1  | 1         | 1       | APPROVED | Flight schedule changed
```

**6. Refunds Table**
```
ID | Ticket ID | User ID | Refund Amount | Refund % | Status    | Completed At
1  | 1         | 1       | 475          | 95       | COMPLETED | [Date]
```

---

## Troubleshooting

### Error: Connection Refused

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
1. Ensure PostgreSQL service is running
   - Windows: Check Services app for "postgresql-x64-15"
   - macOS: `brew services list`
   - Linux: `sudo service postgresql status`
2. Verify DATABASE_URL is correct in `.env`

---

### Error: Database Does Not Exist

**Problem:** `Error: database "ticketcancellation" does not exist`

**Solution:**
1. Connect to PostgreSQL as admin:
   ```bash
   psql -U postgres
   ```
2. Create database:
   ```sql
   CREATE DATABASE ticketcancellation;
   \q
   ```

---

### Error: Authentication Failed

**Problem:** `Error: FATAL: password authentication failed for user "postgres"`

**Solution:**
1. Update DATABASE_URL with correct password
2. Reset PostgreSQL password:
   ```bash
   # Windows (as Administrator)
   psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword';"
   
   # Update .env
   DATABASE_URL="postgresql://postgres:newpassword@localhost:5432/ticketcancellation"
   ```

---

## Working with the Database

### View Database in Prisma Studio

```bash
npm run prisma:migrate -- --name init_schema
```

Opens interactive database explorer:
- View all tables
- Add/edit/delete records
- Export data to JSON
- See relationships visualized

### Run Queries from Code

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Find all tickets for a user
const userTickets = await prisma.ticket.findMany({
  where: { userId: 1 },
  include: { route: true, payment: true }
});

// Find pending refunds
const pendingRefunds = await prisma.refund.findMany({
  where: { status: "PENDING" }
});

// Create new ticket
const newTicket = await prisma.ticket.create({
  data: {
    ticketNumber: "TKT-2026-004",
    userId: 1,
    routeId: 1,
    seatNumber: "A2",
    purchasePrice: 500,
    travelDate: new Date()
  }
});
```

---

## Reset Database (Development)

### Clear All Data & Re-migrate

```bash
npm run prisma:migrate -- reset
npm run prisma:seed
```

---

## Schema Versioning

### View Migration History

```bash
ls prisma/migrations/
```

Shows all applied migrations with timestamps:
```
├── migration_lock.toml
├── 20250121_init_schema/
│   └── migration.sql
└── ...
```

### Create New Migration

```bash
npm run prisma:migrate -- --name add_new_field
```

---

## Performance Monitoring

### Check Index Usage

```sql
-- Connect to PostgreSQL
psql -U postgres -d ticketcancellation

-- List all indexes
SELECT * FROM pg_indexes WHERE tablename != 'pg_catalog';

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## Backup & Restore

### Backup Database

```bash
# Windows/macOS/Linux
pg_dump -U postgres ticketcancellation > backup.sql
```

### Restore Database

```bash
psql -U postgres ticketcancellation < backup.sql
```

---

## Next Steps

1. ✅ Create database and run migrations
2. ✅ Seed with sample data
3. ✅ Verify in Prisma Studio
4. 📝 Implement API endpoints (`/api/tickets`, `/api/refunds`, etc.)
5. 🔐 Add authentication & authorization
6. 📊 Build frontend UI for ticket booking & refunds
7. 🚀 Deploy to AWS/Azure

---
