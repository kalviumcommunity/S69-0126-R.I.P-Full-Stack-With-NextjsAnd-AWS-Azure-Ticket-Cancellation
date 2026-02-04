import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/admin/seats
 * Allocate a seat to a user
 */
export async function POST(request: NextRequest) {
    try {
        // Check both token types
        let token = request.cookies.get("token")?.value;
        if (!token) {
            token = request.cookies.get("accessToken")?.value;
        }

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        // For simple token, check role cookie
        if (token === "secure-session" || token === "admin-token") {
            const role = request.cookies.get("role")?.value;
            if (!role || role !== "admin") {
                return NextResponse.json(
                    { success: false, error: "Forbidden - Admin access required" },
                    { status: 403 }
                );
            }
        } else {
            // For JWT tokens, verify
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
        }

        const body = await request.json();
        const { seatId, userId, source, destination, gender } = body;

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
                source: source || "Not Specified",
                destination: destination || "Not Specified",
                passengerGender: gender || "Not Specified",
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

        // Also create a Ticket record for this booking
        let ticket = null;
        try {
            // Correctly find the route for THIS bus
            // The system uses source = "BUS-" + busNumber convention
            const busIdentifier = `BUS-${seat.bus.busNumber}`;

            let route = await prisma.busRoute.findFirst({
                where: {
                    source: busIdentifier
                },
                orderBy: { createdAt: 'desc' }
            });

            // If no route exists for this bus, create one properly linked to it
            if (!route) {
                // Find any admin user to be the operator
                const admin = await prisma.user.findFirst({
                    where: { role: "ADMIN" }
                }) || await prisma.user.findFirst();

                const departureDate = new Date();
                const arrivalDate = new Date(departureDate.getTime() + 3600000);

                route = await prisma.busRoute.create({
                    data: {
                        operatorId: admin?.id || userId,
                        source: busIdentifier,
                        destination: destination || "Destination",
                        departureTime: departureDate,
                        arrivalTime: arrivalDate,
                        totalSeats: seat.bus.totalSeats || 40,
                        availableSeats: seat.bus.totalSeats || 40,
                        basePrice: 500,
                    },
                });
            }

            // Check if a ticket already exists for this seat on this route (idempotency/cleanup)
            const existingTicket = await prisma.ticket.findUnique({
                where: {
                    routeId_seatNumber: {
                        routeId: route.id,
                        seatNumber: seat.seatNumber
                    }
                }
            });

            if (existingTicket) {
                // If reusing a ticket, clear any prior cancellation state and issue a new ticket number
                const existingCancellation = await prisma.cancellation.findUnique({
                    where: { ticketId: existingTicket.id }
                });

                if (existingCancellation) {
                    await prisma.cancellation.delete({
                        where: { ticketId: existingTicket.id }
                    });
                }

                ticket = await prisma.ticket.update({
                    where: { id: existingTicket.id },
                    data: {
                        ticketNumber: `TK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                        userId: userId,
                        status: "ACTIVE",
                        purchasePrice: route.basePrice || 500,
                        travelDate: route.departureTime,
                        updatedAt: new Date()
                    }
                });
            } else {
                ticket = await prisma.ticket.create({
                    data: {
                        ticketNumber: `TK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
                        userId: userId,
                        routeId: route.id,
                        seatNumber: seat.seatNumber,
                        status: "ACTIVE",
                        purchasePrice: route.basePrice || 500,
                        travelDate: route.departureTime,
                    },
                });
            }

            console.log("Ticket created/updated successfully:", ticket.ticketNumber);

        } catch (ticketError) {
            console.error("Error creating ticket:", ticketError);
            // We log but don't fail the seat update, to keep UI consistent
            // But this is critical for the User Profile to see the ticket
        }

        return NextResponse.json(
            {
                success: true,
                message: "Seat allocated successfully",
                data: updatedSeat,
                ticket: ticket,
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
        // Check both token types
        let token = request.cookies.get("token")?.value;
        if (!token) {
            token = request.cookies.get("accessToken")?.value;
        }

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Unauthorized - No token provided" },
                { status: 401 }
            );
        }

        // For simple token, check role cookie
        if (token === "secure-session" || token === "admin-token") {
            const role = request.cookies.get("role")?.value;
            if (!role || role !== "admin") {
                return NextResponse.json(
                    { success: false, error: "Forbidden - Admin access required" },
                    { status: 403 }
                );
            }
        } else {
            // For JWT tokens, verify
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

        // Delete associated ticket if it exists
        if (seat.allocatedUserId) {
            await prisma.ticket.deleteMany({
                where: {
                    userId: seat.allocatedUserId,
                    seatNumber: seat.seatNumber,
                },
            });
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
