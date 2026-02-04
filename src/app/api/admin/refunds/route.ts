import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        console.log("Admin API Session:", session);

        if (!session || session.user.role !== "admin") {
            // console.log("Admin API Unauthorized. Role:", session?.user?.role);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // First, try a simple query without includes to test if table exists
        let cancellations;
        try {
            cancellations = await prisma.cancellation.findMany({
                orderBy: { requestedAt: "desc" },
            });
            console.log(`Found ${cancellations.length} cancellations (basic query)`);
        } catch (basicError) {
            console.error("Basic cancellation query failed:", basicError);
            // If table doesn't exist, return empty array
            return NextResponse.json({
                success: true,
                data: {
                    requests: []
                }
            });
        }

        // Now try with includes
        cancellations = await prisma.cancellation.findMany({
            include: {
                user: true,
                ticket: {
                    include: {
                        route: true // Fetch route details
                    }
                },
            },
            orderBy: { requestedAt: "desc" },
        });

        const requests = await Promise.all(cancellations.map(async (c: any) => {
            let travelDate = c.ticket.route.departureTime.toISOString();
            let busNumber = "";
            let source = c.source || "Not available";  // Use source from Cancellation record first
            let destination = c.destination || "Not available";  // Use destination from Cancellation record first

            console.log(`\n=== Processing ticket ${c.ticket.ticketNumber} ===`);
            console.log(`Cancellation source: ${c.source}, destination: ${c.destination}`);
            console.log(`Route source: ${c.ticket.route.source}`);
            console.log(`Ticket seatNumber: ${c.ticket.seatNumber}`);

            // Step 1: Get bus number from route source (BUS-XXXX format)
            if (c.ticket.route.source.startsWith("BUS-")) {
                busNumber = c.ticket.route.source.replace("BUS-", "");
                console.log(`Extracted busNumber: ${busNumber}`);
            }

            // Step 2: If we still don't have source/destination, try to get from latest route for the bus
            if ((source === "Not available" || destination === "Not available") && busNumber) {
                const latestRoute = await prisma.busRoute.findFirst({
                    where: { source: `BUS-${busNumber}` },
                    orderBy: { createdAt: 'desc' },
                });

                if (latestRoute) {
                    console.log(`Found latest route with destination: ${latestRoute.destination}`);
                    travelDate = latestRoute.departureTime.toISOString();
                    // Use route destination if available (source field has BUS- format)
                    if (destination === "Not available") {
                        destination = latestRoute.destination;
                    }
                }
            }

            console.log(`Final result - source: ${source}, destination: ${destination}\n`);

            return {
                id: c.ticket.ticketNumber,
                email: c.user.email,
                reason: c.cancellationReason,
                status: c.status === 'REJECTED' ? 'declined' : c.status.toLowerCase(),
                submittedAt: c.requestedAt.toISOString(),
                originalId: c.id,
                source: source,
                destination: destination,
                travelDate: travelDate,
                busNumber: busNumber || "N/A",
            };
        }));

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching admin refunds:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { cancellationId, status } = body;

        if (!cancellationId || !['approved', 'declined'].includes(status)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const dbStatus = status === 'approved' ? 'APPROVED' : 'REJECTED';

        const updated = await prisma.cancellation.update({
            where: { id: cancellationId },
            data: {
                status: dbStatus,
                approvedAt: status === 'approved' ? new Date() : null,
            },
            include: {
                user: true,
                ticket: true
            }
        });

        // Send Email Notification
        if (updated.user?.email) {
            const { sendCancellationEmail, sendRefundApprovedEmail, sendRefundDeclinedEmail } = await import("@/lib/email");

            if (status === "approved") {
                await sendRefundApprovedEmail({
                    email: updated.user.email,
                    name: updated.user.name,
                    ticketNumber: updated.ticket.ticketNumber,
                    refundAmount: updated.ticket.purchasePrice
                });
                console.log(`Refund approved email sent to ${updated.user.email}`);
            } else if (status === "declined") {
                await sendRefundDeclinedEmail({
                    email: updated.user.email,
                    name: updated.user.name,
                    ticketNumber: updated.ticket.ticketNumber,
                    reason: body.adminComment || "Ticket Misuse"
                });
                console.log(`Refund declined email sent to ${updated.user.email}`);
            } else {
                await sendCancellationEmail({
                    email: updated.user.email,
                    name: updated.user.name,
                    ticketNumber: updated.ticket.ticketNumber,
                    refundAmount: updated.ticket.purchasePrice
                });
                console.log(`Cancellation email sent to ${updated.user.email}`);
            }
        }

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error("Error updating refund status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await prisma.cancellation.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting refund request:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
