import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * PUT /api/admin/buses/[id]
 * Edit bus details (busNumber, totalSeats)
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Check both token types
    let token = request.cookies.get("token")?.value;
    if (!token) {
      token = request.cookies.get("accessToken")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For simple token, check role cookie
    if (token === "secure-session") {
      const role = request.cookies.get("role")?.value;
      if (!role || role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      // For JWT tokens, verify
      const payload = await verifyToken(token);
      if (!payload || payload.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }

    const { busNumber, totalSeats } = await request.json();

    if (!busNumber || !totalSeats) {
      return NextResponse.json(
        { success: false, error: "Bus number and total seats are required" },
        { status: 400 }
      );
    }

    // Validate bus number: must start with 2 letters, then 1-2 digits, then 1-2 letters, then 3-5 digits
    const busNumberRegex = /^[a-zA-Z]{2}\d{1,2}[a-zA-Z]{1,2}\d{3,5}$/;
    if (!busNumberRegex.test(busNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: "Bus number format invalid. Example: KL14AB1245 or KL2A1245",
        },
        { status: 400 }
      );
    }

    const bus = await prisma.bus.update({
      where: { id: parseInt(params.id) },
      data: {
        busNumber,
        totalSeats,
      },
      include: {
        seats: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bus updated successfully",
        data: bus,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating bus:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Bus not found" },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Bus number already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update bus" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/buses/[id]
 * Delete a bus and its seats
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Check both token types
    let token = request.cookies.get("token")?.value;
    if (!token) {
      token = request.cookies.get("accessToken")?.value;
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For simple token, check role cookie
    if (token === "secure-session") {
      const role = request.cookies.get("role")?.value;
      if (!role || role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      // For JWT tokens, verify
      const payload = await verifyToken(token);
      if (!payload || payload.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Access denied" },
          { status: 403 }
        );
      }
    }

    // Check if bus has booked seats
    const busWithSeats = await prisma.bus.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        seats: {
          where: {
            status: "BOOKED",
          },
        },
      },
    });

    if (!busWithSeats) {
      return NextResponse.json(
        { success: false, error: "Bus not found" },
        { status: 404 }
      );
    }

    if (busWithSeats.seats.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete bus with ${busWithSeats.seats.length} booked seat(s)`,
        },
        { status: 400 }
      );
    }

    // Delete bus (cascades to seats)
    await prisma.bus.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bus deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting bus:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Bus not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete bus" },
      { status: 500 }
    );
  }
}
