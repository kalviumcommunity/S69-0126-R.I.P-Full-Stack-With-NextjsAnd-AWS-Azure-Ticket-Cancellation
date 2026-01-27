/**
 * User Bookings API
 *
 * Allows users to:
 * - View their own bookings
 * - Create new bookings
 * - Cancel their own bookings
 *
 * Permissions: authenticated users
 */

import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
import { handleError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Booking interface
interface Booking {
  id: number;
  userId: number;
  busRouteId: number;
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
  status: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  cancelledBy?: number;
}

// Shared bookings array (in production, this would be in a database)
export const bookings: Booking[] = [];

// Validation schema for creating booking
const createBookingSchema = z.object({
  busRouteId: z.number().int().positive("Bus route ID is required"),
  seatNumber: z.number().int().positive("Seat number is required"),
  passengerName: z.string().min(1, "Passenger name is required"),
  passengerPhone: z.string().min(10, "Valid phone number is required"),
});

/**
 * GET /api/bookings
 * Get user's own bookings
 */
export async function GET(req: NextRequest) {
  try {
    const user = extractAndVerifyToken(req);

    // Check authentication
    const authError = requirePermission(
      user,
      "booking.read.own",
      "own bookings"
    );
    if (authError) return authError;

    // Filter bookings for the current user
    const userBookings = bookings.filter((b: Booking) => b.userId === user?.id);

    logger.info(`User ${user?.email} fetched their bookings`, {
      total: userBookings.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: { bookings: userBookings, total: userBookings.length },
        message: "Your bookings retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "GET /api/bookings");
  }
}

/**
 * POST /api/bookings
 * Create a new booking for the authenticated user
 */
export async function POST(req: NextRequest) {
  try {
    const user = extractAndVerifyToken(req);

    // Check authentication
    const authError = requirePermission(user, "booking.create", "bookings");
    if (authError) return authError;

    const body = await req.json();
    const data = createBookingSchema.parse(body);

    // Check if seat is already booked
    const existingBooking = bookings.find(
      (b: Booking) =>
        b.busRouteId === data.busRouteId &&
        b.seatNumber === data.seatNumber &&
        b.status === "ACTIVE"
    );

    if (existingBooking) {
      throw new ValidationError("Seat is already booked");
    }

    const newBooking = {
      id: bookings.length + 1,
      userId: user!.id,
      ...data,
      status: "ACTIVE",
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.push(newBooking);

    logger.info(`User ${user?.email} created booking ${newBooking.id}`, {
      bookingId: newBooking.id,
      busRouteId: newBooking.busRouteId,
      seatNumber: newBooking.seatNumber,
    });

    return NextResponse.json(
      {
        success: true,
        data: { booking: newBooking },
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(
        new ValidationError(error.issues.map((e) => e.message).join(", ")),
        "POST /api/bookings"
      );
    }
    return handleError(error, "POST /api/bookings");
  }
}
