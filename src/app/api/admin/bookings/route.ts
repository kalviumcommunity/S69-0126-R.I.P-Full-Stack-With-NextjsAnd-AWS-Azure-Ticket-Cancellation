import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
import { handleError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
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
        seat: { include: { busRoute: true } }
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
        status: { not: "cancelled" }
      }
    });

    if (existingTicket) {
      throw new ValidationError("Seat is already booked");
    }

    // Create ticket in Prisma database
    const ticketNumber = `TK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
    
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId: data.userId,
        routeId: data.busRouteId,
        seatNumber: data.seatNumber.toString(),
        status: "active",
        purchasePrice: 0,
        travelDate: new Date(),
      },
      include: {
        user: true,
        seat: { include: { busRoute: true } }
      }
    });

    logger.info(`Admin ${user?.email} created booking`, {
      ticketId: ticket.id,
      userId: data.userId,
      busRouteId: data.busRouteId,
      ticketNumber,
    });

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
