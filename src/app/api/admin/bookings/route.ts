import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
import { handleError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { sendAdminBookingEmail } from "@/lib/email";
import { z } from "zod";
import prisma from "@/lib/db";

// Validation schema for creating booking
const createBookingSchema = z.object({
  userId: z.number().int().positive("User ID is required"),
  busRouteId: z.number().int().positive("Bus route ID is required"),
  seatNumber: z.number().int().positive("Seat number is required"),
  passengerName: z.string().min(1, "Passenger name is required"),
  passengerPhone: z.string().min(10, "Valid phone number is required"),
});

/**
 * GET /api/admin/bookings
 * Get all bookings (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(
      user,
      "booking.read.all",
      "all bookings"
    );
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const routeId = searchParams.get("busRouteId");

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (routeId) where.routeId = parseInt(routeId);

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: true,
        route: true
      }
    });

    logger.info(`Admin ${user?.email} fetched bookings`, {
      total: tickets.length,
      filters: { userId, routeId },
    });

    return NextResponse.json(
      {
        success: true,
        data: { bookings: tickets, total: tickets.length },
        message: "Bookings retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "GET /api/admin/bookings");
  }
}

/**
 * POST /api/admin/bookings
 * Create a new booking (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(user, "booking.create", "bookings");
    if (authError) return authError;

    const body = await req.json();
    const data = createBookingSchema.parse(body);

    // Check if seat is already booked
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        routeId: data.busRouteId,
        seatNumber: data.seatNumber.toString(),
        status: { not: "CANCELLED" }
      }
    });

    if (existingTicket) {
      throw new ValidationError("Seat is already booked");
    }

    // Fetch route details to set correct travel date
    const route = await prisma.busRoute.findUnique({
      where: { id: data.busRouteId }
    });

    if (!route) {
      throw new ValidationError("Invalid bus route");
    }

    // Create ticket in Prisma database
    const ticketNumber = `TK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId: data.userId,
        routeId: data.busRouteId,
        seatNumber: data.seatNumber.toString(),
        status: "ACTIVE",
        purchasePrice: 0,
        travelDate: route.departureTime,
      },
      include: {
        user: true,
        route: true
      }
    });

    logger.info(`Admin ${user?.email} created booking`, {
      ticketId: ticket.id,
      userId: data.userId,
      busRouteId: data.busRouteId,
      ticketNumber,
    });

    // Send confirmation email
    if (ticket.user.email) {
      let busNum = "Standard Service";
      // Attempt to extract bus number from source if it follows the pattern "BUS-XXXX"
      if (ticket.route.source && ticket.route.source.startsWith("BUS-")) {
        busNum = ticket.route.source.replace("BUS-", "");
      }

      try {
        await sendAdminBookingEmail({
          email: ticket.user.email,
          name: data.passengerName || ticket.user.name,
          ticketNumber: ticket.ticketNumber,
          source: ticket.route.source,
          destination: ticket.route.destination,
          travelDate: ticket.travelDate,
          busNumber: busNum,
          seatNumber: ticket.seatNumber
        });
        logger.info(`Email sent to ${ticket.user.email}`);
      } catch (emailErr) {
        logger.error("Failed to send admin booking email", { error: emailErr });
        // Don't fail the request if email fails, but log it
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { booking: ticket },
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(
        new ValidationError(error.issues.map((e) => e.message).join(", ")),
        "POST /api/admin/bookings"
      );
    }
    return handleError(error, "POST /api/admin/bookings");
  }
}
