import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // Clean existing data (optional - comment out for production)
  console.log("🧹 Cleaning existing data...");
  await prisma.auditLog.deleteMany({});
  await prisma.refund.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.cancellation.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.busRoute.deleteMany({});
  await prisma.cancellationPolicy.deleteMany({});
  await prisma.user.deleteMany({});

  // ===== Create Users =====
  console.log("👤 Creating users...");
  const passengerUser = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      name: "John Doe",
      phone: "+91-9876543210",
      password: "hashed_password_123", // In production, hash this properly
      role: "PASSENGER",
    },
  });

  const operatorUser = await prisma.user.create({
    data: {
      email: "operator@buslines.com",
      name: "Bus Lines Operator",
      phone: "+91-8765432109",
      password: "hashed_operator_pwd",
      role: "OPERATOR",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@ticketsystem.com",
      name: "System Admin",
      phone: "+91-7654321098",
      password: "hashed_admin_pwd",
      role: "ADMIN",
    },
  });

  console.log(
    "✅ Users created:",
    passengerUser.id,
    operatorUser.id,
    adminUser.id
  );

  // ===== Create Cancellation Policies =====
  console.log("📋 Creating cancellation policies...");
  const policy7days = await prisma.cancellationPolicy.create({
    data: {
      name: "7 Days Before Departure",
      daysBeforeDeparture: 7,
      refundPercentage: 95,
      cancellationFee: 0,
    },
  });

  const policy3days = await prisma.cancellationPolicy.create({
    data: {
      name: "3 Days Before Departure",
      daysBeforeDeparture: 3,
      refundPercentage: 85,
      cancellationFee: 50,
    },
  });

  const policy1day = await prisma.cancellationPolicy.create({
    data: {
      name: "1 Day Before Departure",
      daysBeforeDeparture: 1,
      refundPercentage: 70,
      cancellationFee: 100,
    },
  });

  console.log("✅ Policies created");

  // ===== Create Bus Routes =====
  console.log("🚌 Creating bus routes...");
  const now = new Date();

  const route1 = await prisma.busRoute.create({
    data: {
      operatorId: operatorUser.id,
      source: "Mumbai",
      destination: "Pune",
      departureTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      arrivalTime: new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
      ), // +3 hours
      totalSeats: 45,
      availableSeats: 42,
      basePrice: 500,
    },
  });

  const route2 = await prisma.busRoute.create({
    data: {
      operatorId: operatorUser.id,
      source: "Delhi",
      destination: "Jaipur",
      departureTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      arrivalTime: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
      ), // +4 hours
      totalSeats: 50,
      availableSeats: 48,
      basePrice: 800,
    },
  });

  const route3 = await prisma.busRoute.create({
    data: {
      operatorId: operatorUser.id,
      source: "Bangalore",
      destination: "Hyderabad",
      departureTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      arrivalTime: new Date(
        now.getTime() + 1 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000
      ), // +5 hours
      totalSeats: 40,
      availableSeats: 38,
      basePrice: 600,
    },
  });

  console.log("✅ Routes created:", route1.id, route2.id, route3.id);

  // ===== Create Tickets =====
  console.log("🎫 Creating tickets...");
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: "TKT-2026-001",
      userId: passengerUser.id,
      routeId: route1.id,
      seatNumber: "A1",
      status: "ACTIVE",
      purchasePrice: 500,
      travelDate: route1.departureTime,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: "TKT-2026-002",
      userId: passengerUser.id,
      routeId: route2.id,
      seatNumber: "B5",
      status: "ACTIVE",
      purchasePrice: 800,
      travelDate: route2.departureTime,
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: "TKT-2026-003",
      userId: passengerUser.id,
      routeId: route3.id,
      seatNumber: "C10",
      status: "ACTIVE",
      purchasePrice: 600,
      travelDate: route3.departureTime,
    },
  });

  console.log("✅ Tickets created:", ticket1.id, ticket2.id, ticket3.id);

  // ===== Create Payments =====
  console.log("💳 Creating payments...");
  await prisma.payment.create({
    data: {
      ticketId: ticket1.id,
      userId: passengerUser.id,
      amount: 500,
      method: "CREDIT_CARD",
      transactionId: "TXN-001-ABC123",
      status: "COMPLETED",
    },
  });

  await prisma.payment.create({
    data: {
      ticketId: ticket2.id,
      userId: passengerUser.id,
      amount: 800,
      method: "UPI",
      transactionId: "TXN-002-XYZ789",
      status: "COMPLETED",
    },
  });

  await prisma.payment.create({
    data: {
      ticketId: ticket3.id,
      userId: passengerUser.id,
      amount: 600,
      method: "NET_BANKING",
      transactionId: "TXN-003-PQR456",
      status: "COMPLETED",
    },
  });

  console.log("✅ Payments created");

  // ===== Create Cancellation Request =====
  console.log("❌ Creating cancellation request...");
  const cancellation = await prisma.cancellation.create({
    data: {
      ticketId: ticket1.id,
      userId: passengerUser.id,
      cancellationReason: "Flight schedule changed, unable to travel",
      status: "APPROVED",
      requestedAt: new Date(),
      approvedAt: new Date(),
    },
  });

  console.log("✅ Cancellation created:", cancellation.id);

  // ===== Create Refund =====
  console.log("💰 Creating refund...");
  const refund = await prisma.refund.create({
    data: {
      ticketId: ticket1.id,
      userId: passengerUser.id,
      cancellationId: cancellation.id,
      refundAmount: 475, // 95% of 500
      refundPercentage: 95,
      cancellationFee: 25,
      status: "COMPLETED",
      initiatedAt: new Date(),
      completedAt: new Date(),
      bankAccount: "****1234",
    },
  });

  console.log("✅ Refund created:", refund.id);

  // ===== Create Audit Logs =====
  console.log("📝 Creating audit logs...");
  await prisma.auditLog.create({
    data: {
      entityType: "Ticket",
      entityId: ticket1.id,
      action: "CREATED",
      changedFields: JSON.stringify({ status: "ACTIVE" }),
      userId: passengerUser.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Cancellation",
      entityId: cancellation.id,
      action: "APPROVED",
      changedFields: JSON.stringify({ status: "APPROVED" }),
      userId: adminUser.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Refund",
      entityId: refund.id,
      action: "COMPLETED",
      changedFields: JSON.stringify({ status: "COMPLETED" }),
      userId: adminUser.id,
    },
  });

  console.log("✅ Audit logs created");

  console.log("\n✨ Database seeding completed successfully!");
  console.log(`
📊 Summary:
   - Users: 3 (1 passenger, 1 operator, 1 admin)
   - Routes: 3
   - Tickets: 3
   - Payments: 3
   - Cancellation: 1
   - Refund: 1
   - Audit Logs: 3
   - Policies: 3
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
