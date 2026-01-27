/**
 * User Booking Details API
 *
 * Allows users to:
 * - View their own booking details
 * - Cancel their own bookings
 *
 * Permissions: authenticated users (own bookings only)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  extractAndVerifyToken,
  requirePermission,
  requireOwnership,
} from "@/lib/rbac";
import { handleError, NotFoundError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { bookings } from "../route";

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

/**
 * GET /api/bookings/[id]
 * Get specific booking details (own bookings only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractAndVerifyToken(req);

    // Check authentication
    const authError = requirePermission(
      user,
      "booking.read.own",
      `booking ${params.id}`
    );
    if (authError) return authError;

    const bookingId = parseInt(params.id);
    const booking = bookings.find((b: Booking) => b.id === bookingId);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    // Check ownership (users can only view their own bookings)
    const ownershipError = requireOwnership(
      user,
      booking.userId,
      `booking ${params.id}`
    );
    if (ownershipError) return ownershipError;

    logger.info(`User ${user?.email} viewed their booking ${bookingId}`);

    return NextResponse.json(
      {
        success: true,
        data: { booking },
        message: "Booking details retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, `GET /api/bookings/${params.id}`);
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel own booking
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractAndVerifyToken(req);

    // Check authentication
    const authError = requirePermission(
      user,
      "booking.cancel.own",
      `booking ${params.id}`
    );
    if (authError) return authError;

    const bookingId = parseInt(params.id);
    const bookingIndex = bookings.findIndex((b: Booking) => b.id === bookingId);

    if (bookingIndex === -1) {
      throw new NotFoundError("Booking not found");
    }

    const booking = bookings[bookingIndex];

    // Check ownership (users can only cancel their own bookings)
    const ownershipError = requireOwnership(
      user,
      booking.userId,
      `booking ${params.id}`
    );
    if (ownershipError) return ownershipError;

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Booking already cancelled",
          message: "This booking has already been cancelled",
        },
        { status: 400 }
      );
    }

    // Update booking status
    bookings[bookingIndex] = {
      ...booking,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancelledBy: user?.id,
      updatedAt: new Date().toISOString(),
    };

    logger.info(`User ${user?.email} cancelled their booking ${bookingId}`, {
      bookingId,
    });

    return NextResponse.json(
      {
        success: true,
        data: { booking: bookings[bookingIndex] },
        message: "Booking cancelled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, `DELETE /api/bookings/${params.id}`);
  }
}
