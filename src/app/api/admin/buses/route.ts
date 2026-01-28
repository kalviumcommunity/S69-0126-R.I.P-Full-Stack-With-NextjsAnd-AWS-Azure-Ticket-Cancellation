import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken, TokenPayload } from "@/lib/auth";

/**
 * GET /api/admin/buses
 * Fetch all buses
 */
export async function GET(request: NextRequest) {
  try {
    const buses = await prisma.bus.findMany({
      include: {
        seats: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: buses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching buses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch buses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/buses
 * Create a new bus with seat layout (2 left, 3 right, ~40 total seats)
 */
export async function POST(request: NextRequest) {
  try {
    console.log("=== BUS CREATION REQUEST ===");

    // Verify admin token from cookies - check both token types
    let token = request.cookies.get("token")?.value;
    if (!token) {
      token = request.cookies.get("accessToken")?.value;
    }

    console.log("Token from cookies:", token ? "Present" : "Missing");

    if (!token) {
      console.log("ERROR: No token provided");
      return NextResponse.json(
        { success: false, error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // For simple token from login page, just check role cookie
    if (token === "secure-session") {
      const role = request.cookies.get("role")?.value;

      if (!role || role !== "admin") {
        console.log("ERROR: User role is not admin:", role);
        return NextResponse.json(
          { success: false, error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }

      console.log("Simple token verified. Role:", role);
    } else {
      // For JWT tokens, verify with jose
      let decoded: TokenPayload;
      try {
        decoded = await verifyToken(token);
        console.log("Token verified. User:", decoded.email, "Role:", decoded.role);
      } catch (error) {
        console.error("Token verification failed:", error);
        return NextResponse.json(
          { success: false, error: "Invalid token" },
          { status: 401 }
        );
      }

      // Check if user is admin
      if (decoded.role !== "admin") {
        console.log("ERROR: User role is not admin:", decoded.role);
        return NextResponse.json(
          { success: false, error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    let {
      busNumber,
      totalSeats = 40,
      leftSeatsPerRow = 2,
      rightSeatsPerRow = 3,
    } = body;

    console.log("Bus creation request:", { busNumber, totalSeats, leftSeatsPerRow, rightSeatsPerRow });

    if (!busNumber) {
      return NextResponse.json(
        { success: false, error: "Bus number is required" },
        { status: 400 }
      );
    }

    // Format bus number: convert to uppercase and ensure XX-YY-AA(A)-YYYY format
    // Where XX = exactly 2 letters, YY = 2 numbers, AA = 1-2 letters, YYYY = exactly 4 numbers
    busNumber = busNumber.toUpperCase().replace(/\s+/g, "");

    // Extract letters and numbers separately
    const letters = busNumber.replace(/[^A-Z]/g, "");
    const numbers = busNumber.replace(/[^0-9]/g, "");

    // Must have exactly 2 letters first, then 1-2 more letters (3-4 total) and exactly 6 numbers
    if (letters.length < 3 || letters.length > 4 || numbers.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Bus number format: 2 letters-2 numbers-1to2 letters-4 numbers (e.g., AB-12-C-3456 or AB-12-CD-3456)" },
        { status: 400 }
      );
    }

    // Format as XX-YY-AA-YYYY or XX-YY-A-YYYY
    // Take first 2 letters, first 2 numbers, remaining letters (1-2), last 4 numbers
    busNumber = `${letters.slice(0, 2)}-${numbers.slice(0, 2)}-${letters.slice(2)}-${numbers.slice(2, 6)}`;

    // Calculate total rows
    const totalRows = Math.ceil(totalSeats / (leftSeatsPerRow + rightSeatsPerRow));

    // Create bus
    const bus = await prisma.bus.create({
      data: {
        busNumber,
        totalSeats,
        leftSeatsPerRow,
        rightSeatsPerRow,
        totalRows,
      },
    });

    console.log("Bus created:", busNumber, "with ID:", bus.id);

    // Create seats for the bus
    const seatsToCreate = [];
    let seatCount = 0;

    for (let row = 1; row <= totalRows && seatCount < totalSeats; row++) {
      // Left side seats
      for (let seat = 1; seat <= leftSeatsPerRow && seatCount < totalSeats; seat++) {
        seatsToCreate.push({
          busId: bus.id,
          seatNumber: `${row}L`,
          row,
          position: "LEFT" as const,
          status: "AVAILABLE" as const,
        });
        seatCount++;
      }

      // Right side seats
      for (let seat = 1; seat <= rightSeatsPerRow && seatCount < totalSeats; seat++) {
        seatsToCreate.push({
          busId: bus.id,
          seatNumber: `${row}R`,
          row,
          position: "RIGHT" as const,
          status: "AVAILABLE" as const,
        });
        seatCount++;
      }
    }

    await prisma.seat.createMany({
      data: seatsToCreate,
      skipDuplicates: true,
    });

    console.log("Seats created successfully for bus:", busNumber);

    const busWithSeats = await prisma.bus.findUnique({
      where: { id: bus.id },
      include: { seats: true },
    });

    console.log("Bus created successfully:", busNumber, "with", totalSeats, "seats");

    return NextResponse.json(
      {
        success: true,
        message: `Bus created with ${totalSeats} seats`,
        data: busWithSeats,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ERROR creating bus:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bus",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
