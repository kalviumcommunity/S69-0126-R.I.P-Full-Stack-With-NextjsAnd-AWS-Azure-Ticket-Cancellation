import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/admin/seats
 * Allocate a seat to a user
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin token from cookies
        const token = request.cookies.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (error) {
            console.error("Token verification failed:", error);
            return NextResponse.json(
                { success: false, error: "Invalid token" },
                { status: 401 }
            );
        }

        // Check if user is admin
        if (decoded.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { seatId, userId } = body;

        if (!seatId || !userId) {
            return NextResponse.json(
                { success: false, error: "Seat ID and User ID are required" },
                { status: 400 }
            );
        }

        // Check if seat exists and is available
        const seat = await prisma.seat.findUnique({
            where: { id: seatId },
            include: {
                bus: true,
            },
        });

        if (!seat) {
            return NextResponse.json(
                { success: false, error: "Seat not found" },
                { status: 404 }
            );
        }

        if (seat.status !== "AVAILABLE") {
            return NextResponse.json(
                { success: false, error: `Seat is already ${seat.status.toLowerCase()}` },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // Allocate the seat
        const updatedSeat = await prisma.seat.update({
            where: { id: seatId },
            data: {
                status: "BOOKED",
                allocatedUserId: userId,
                allocatedAt: new Date(),
            },
            include: {
                bus: {
                    select: {
                        id: true,
                        busNumber: true,
                    },
                },
                allocatedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Seat allocated successfully",
                data: updatedSeat,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error allocating seat:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to allocate seat",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/seats
 * Deallocate a seat (release it)
 */
export async function PUT(request: NextRequest) {
    try {
        // Verify admin token from cookies
        const token = request.cookies.get("accessToken")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = await verifyToken(token);
        } catch (error) {
            console.error("Token verification failed:", error);
            return NextResponse.json(
                { success: false, error: "Invalid token" },
                { status: 401 }
            );
        }

        // Check if user is admin
        if (decoded.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Forbidden - Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { seatId } = body;

        if (!seatId) {
            return NextResponse.json(
                { success: false, error: "Seat ID is required" },
                { status: 400 }
            );
        }

        // Check if seat exists
        const seat = await prisma.seat.findUnique({
            where: { id: seatId },
        });

        if (!seat) {
            return NextResponse.json(
                { success: false, error: "Seat not found" },
                { status: 404 }
            );
        }

        if (seat.status === "AVAILABLE") {
            return NextResponse.json(
                { success: false, error: "Seat is already available" },
                { status: 400 }
            );
        }

        // Deallocate the seat
        const updatedSeat = await prisma.seat.update({
            where: { id: seatId },
            data: {
                status: "AVAILABLE",
                allocatedUserId: null,
                allocatedAt: null,
            },
            include: {
                bus: {
                    select: {
                        id: true,
                        busNumber: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Seat deallocated successfully",
                data: updatedSeat,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deallocating seat:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to deallocate seat",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
