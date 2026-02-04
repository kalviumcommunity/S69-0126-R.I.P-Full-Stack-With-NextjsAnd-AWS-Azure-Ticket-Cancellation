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
import prisma from "@/lib/db";

/**
 * GET /api/admin/bookings/[id]
 * Get specific booking details (admin only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(
      user,
      "booking.read.all",
      `booking ${id}`
    );
    if (authError) return authError;

    const bookingId = parseInt(id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        seat: { include: { busRoute: true } }
      }
    });

    if (!ticket) {
      throw new NotFoundError("Booking not found");
    }

    logger.info(`Admin ${user?.email} viewed booking ${bookingId}`);

    return NextResponse.json(
      {
        success: true,
        data: { booking: ticket },
        message: "Booking details retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, `GET /api/admin/bookings/${id}`);
  }
}

/**
 * DELETE /api/admin/bookings/[id]
 * Cancel a booking (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(
      user,
      "booking.cancel.all",
      `booking ${id}`
    );
    if (authError) return authError;

    const bookingId = parseInt(id);
    const ticket = await prisma.ticket.findUnique({
      where: { id: bookingId }
    });

    if (!ticket) {
      throw new NotFoundError("Booking not found");
    }

    if (ticket.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: "Booking already cancelled",
          message: "This booking has already been cancelled",
        },
        { status: 400 }
      );
    }

    // Update ticket status
    const updated = await prisma.ticket.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        updatedAt: new Date()
      },
      include: {
        user: true,
        seat: { include: { busRoute: true } }
      }
    });

    logger.info(`Admin ${user?.email} cancelled booking ${bookingId}`, {
      bookingId,
      originalUserId: ticket.userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: { booking: updated },
        message: "Booking cancelled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, `DELETE /api/admin/bookings/${id}`);
  }
}
