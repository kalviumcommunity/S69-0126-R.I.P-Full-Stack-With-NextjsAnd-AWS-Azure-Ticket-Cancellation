/**
 * Admin Bookings API
 *
 * Allows admins to:
 * - View all bookings across all users
 * - View booking details including user information
 * - Create bookings for users
 * - Cancel any booking
 *
 * Permissions: admin only
 */

import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
import { handleError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Import and re-export shared bookings array
import { bookings } from "../../bookings/route";
export { bookings };

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
  createdBy?: number;
}

// Validation schema for creating booking
const createBookingSchema = z.object({
  userId: z.number().int().positive("User ID is required"),
  busRouteId: z.number().int().positive("Bus route ID is required"),
  seatNumber: z.number().int().positive("Seat number is required"),
  passengerName: z.string().min(1, "Passenger name is required"),
  passengerPhone: z.string().min(10, "Valid phone number is required"),
});

let nextBookingId = 1;

/**
 * GET /api/admin/bookings
 * Get all bookings (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const user = extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(
      user,
      "booking.read.all",
      "all bookings"
    );
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const busRouteId = searchParams.get("busRouteId");

    let filteredBookings = bookings;

    // Filter by user if specified
    if (userId) {
      filteredBookings = filteredBookings.filter(
        (b: Booking) => b.userId === parseInt(userId)
      );
    }

    // Filter by bus route if specified
    if (busRouteId) {
      filteredBookings = filteredBookings.filter(
        (b: Booking) => b.busRouteId === parseInt(busRouteId)
      );
    }

    logger.info(`Admin ${user?.email} fetched bookings`, {
      total: filteredBookings.length,
      filters: { userId, busRouteId },
    });

    return NextResponse.json(
      {
        success: true,
        data: { bookings: filteredBookings, total: filteredBookings.length },
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
    const user = extractAndVerifyToken(req);

    // Check admin permission
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
      id: nextBookingId++,
      ...data,
      status: "ACTIVE",
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id,
    };

    bookings.push(newBooking);

    logger.info(`Admin ${user?.email} created booking ${newBooking.id}`, {
      bookingId: newBooking.id,
      userId: newBooking.userId,
      busRouteId: newBooking.busRouteId,
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
        "POST /api/admin/bookings"
      );
    }
    return handleError(error, "POST /api/admin/bookings");
  }
}
