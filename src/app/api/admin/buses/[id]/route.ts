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
    if (token === "secure-session" || token === "admin-token") {
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

    let { busNumber, totalSeats } = await request.json();

    if (!busNumber || !totalSeats) {
      return NextResponse.json(
        { success: false, error: "Bus number and total seats are required" },
        { status: 400 }
      );
    }

    // Normalize: remove dashes and spaces, uppercase
    const rawBusNumber = busNumber.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Extract parts for validation and formatting
    const letters = rawBusNumber.replace(/[^A-Z]/g, "");
    const numbers = rawBusNumber.replace(/[^0-9]/g, "");

    // Validation: 2 letters initial, 3-4 total letters, 6 numbers total
    if (letters.length < 3 || letters.length > 4 || numbers.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          error: "Bus number format invalid. Desired: XX-YY-ZZ-AAAA (e.g. KL-12-AB-1234)",
        },
        { status: 400 }
      );
    }

    // Format as: XX-YY-AA-YYYY (or XX-YY-A-YYYY)
    // First 2 letters
    // First 2 numbers
    // Remaining letters (1 or 2)
    // Remaining 4 numbers
    busNumber = `${letters.slice(0, 2)}-${numbers.slice(0, 2)}-${letters.slice(2)}-${numbers.slice(2)}`;

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
    if (token === "secure-session" || token === "admin-token") {
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
