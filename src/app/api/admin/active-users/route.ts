import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/active-users
 * Fetch all users with their tickets and seat allocations
 */
export async function GET(request: NextRequest) {
    try {
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
                    select: {
                        id: true,
                        ticketNumber: true,
                        seatNumber: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

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
                    users,
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
