import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/active-users
 * Fetch all users with their tickets and seat allocations
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        console.log("Fetching active users...");
        // Verify admin token from cookies - check both token types
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

        // For simple token from login page, just check role cookie
        // "admin-token" is used specifically for the hardcoded admin login
        if (token === "secure-session" || token === "admin-token") {
            const role = request.cookies.get("role")?.value;

            if (!role || role !== "admin") {
                return NextResponse.json(
                    { success: false, error: "Forbidden - Admin access required" },
                    { status: 403 }
                );
            }
        } else {
            // For JWT tokens, verify with jose
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

        // Fetch all users with their tickets
        const users = await prisma.user.findMany({
            include: {
                tickets: {
                    include: {
                        route: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Apply smart date logic to fetch latest bus schedule for tickets
        const usersWithSmartDates = await Promise.all(users.map(async (user) => {
            // DEBUG: Log tickets for usopp
            if (user.email === "usopp@gmail.com") {
                console.log(`[DEBUG] Found user usopp with ${user.tickets.length} tickets`);
                user.tickets.forEach(t => {
                    console.log(`[DEBUG] Ticket ${t.id}: Status=${t.status}, TravelDate=${t.travelDate}, RouteDate=${t.route?.departureTime}`);
                });
            }

            const ticketsWithLatestDates = await Promise.all(user.tickets.map(async (ticket) => {
                let latestDepartureTime = ticket.route?.departureTime;
                let busNumber = null;

                // 1. Try to get bus number from route source
                if (ticket.route?.source?.startsWith("BUS-")) {
                    busNumber = ticket.route.source.replace("BUS-", "");
                }

                // 2. If not found, look up via Seat allocation
                if (!busNumber) {
                    const seat = await prisma.seat.findFirst({
                        where: {
                            allocatedUserId: user.id,
                            seatNumber: ticket.seatNumber
                        },
                        include: { bus: true }
                    });

                    if (seat?.bus) {
                        busNumber = seat.bus.busNumber;
                    }
                }

                // 3. If we have a bus number, find its latest scheduled route
                if (busNumber) {
                    const busIdentifier = `BUS-${busNumber}`;
                    const latestRoute = await prisma.busRoute.findFirst({
                        where: { source: busIdentifier },
                        orderBy: { createdAt: 'desc' },
                    });

                    if (latestRoute) {
                        latestDepartureTime = latestRoute.departureTime;
                    }
                }

                return {
                    ...ticket,
                    latestDepartureTime
                };
            }));

            return {
                ...user,
                tickets: ticketsWithLatestDates
            };
        }));

        // Fetch all seat allocations with bus and user information
        const seatAllocations = await prisma.seat.findMany({
            where: {
                status: "BOOKED",
                allocatedUserId: {
                    not: null,
                },
            },
            include: {
                bus: {
                    select: {
                        id: true,
                        busNumber: true,
                    },
                },
            },
            orderBy: {
                allocatedAt: "desc",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    users: usersWithSmartDates,
                    seatAllocations,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching active users:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch active users",
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
