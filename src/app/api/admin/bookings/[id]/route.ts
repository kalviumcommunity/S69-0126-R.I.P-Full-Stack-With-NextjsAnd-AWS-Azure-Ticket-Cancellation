/**
 * Admin Booking Details API
 *
 * Allows admins to:
 * - View specific booking details including user information
 * - Cancel any booking
 * - Update booking status
 *
 * Permissions: admin only
 */

import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
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
 * GET /api/admin/bookings/[id]
 * Get specific booking details (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(
      user,
      "booking.read.all",
      `booking ${params.id}`
    );
    if (authError) return authError;

    const bookingId = parseInt(params.id);
    const booking = bookings.find((b: Booking) => b.id === bookingId);

    if (!booking) {
      throw new NotFoundError("Booking not found");
    }

    logger.info(`Admin ${user?.email} viewed booking ${bookingId}`);

    return NextResponse.json(
      {
        success: true,
        data: { booking },
        message: "Booking details retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, `GET /api/admin/bookings/${params.id}`);
  }
}

/**
 * DELETE /api/admin/bookings/[id]
 * Cancel a booking (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(
      user,
      "booking.cancel.all",
      `booking ${params.id}`
    );
    if (authError) return authError;

    const bookingId = parseInt(params.id);
    const bookingIndex = bookings.findIndex((b: Booking) => b.id === bookingId);

    if (bookingIndex === -1) {
      throw new NotFoundError("Booking not found");
    }

    const booking = bookings[bookingIndex];

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

    logger.info(`Admin ${user?.email} cancelled booking ${bookingId}`, {
      bookingId,
      originalUserId: booking.userId,
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
    return handleError(error, `DELETE /api/admin/bookings/${params.id}`);
  }
}
