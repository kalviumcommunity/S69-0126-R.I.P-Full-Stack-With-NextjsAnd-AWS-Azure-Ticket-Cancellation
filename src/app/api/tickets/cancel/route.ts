import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendCancellationEmail } from "@/lib/email";
import { z } from "zod";

const cancelSchema = z.object({
    ticketId: z.number(),
    reason: z.string().min(3),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { ticketId, reason } = cancelSchema.parse(body);

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                user: true,
                route: true,
            },
        });

        if (!ticket) {
            return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
        }

        // Verify ownership
        if (ticket.userId !== session.user.id && session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (ticket.status !== "ACTIVE") {
            return NextResponse.json({ error: "Ticket is not active" }, { status: 400 });
        }

        // Check if cancellation already exists
        const existingCancellation = await prisma.cancellation.findUnique({
            where: { ticketId: ticketId }
        });

        if (existingCancellation) {
            // Idempotent behavior: ensure ticket is cancelled and seat deallocated
            await prisma.$transaction(async (tx) => {
                if (ticket.status !== "CANCELLED") {
                    await tx.ticket.update({
                        where: { id: ticketId },
                        data: { status: "CANCELLED" },
                    });
                }

                const seat = await tx.seat.findFirst({
                    where: {
                        allocatedUserId: ticket.userId,
                        seatNumber: ticket.seatNumber,
                        status: "BOOKED"
                    }
                });

                if (seat) {
                    await tx.seat.update({
                        where: { id: seat.id },
                        data: {
                            status: "AVAILABLE",
                            allocatedUserId: null,
                            allocatedAt: null,
                            passengerGender: null,
                            source: null,
                            destination: null
                        }
                    });
                }
            });

            return NextResponse.json({
                success: true,
                message: "Cancellation request already exists for this ticket",
                status: existingCancellation.status
            }, { status: 200 });
        }

        // Perform Cancellation Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update Ticket Status to CANCELLED immediately
            await tx.ticket.update({
                where: { id: ticketId },
                data: { status: "CANCELLED" },
            });

            // 2. Get Seat information to capture source/destination for historical record
            let seatSource = null;
            let seatDestination = null;
            
            const seat = await tx.seat.findFirst({
                where: {
                    allocatedUserId: ticket.userId,
                    seatNumber: ticket.seatNumber,
                    status: "BOOKED"
                }
            });

            if (seat) {
                seatSource = seat.source;
                seatDestination = seat.destination;
            }

            // 3. Create Cancellation Record for refund approval with source/destination preserved
            const cancellationData: any = {
                ticketId: ticketId,
                userId: session.user.id,
                cancellationReason: reason,
                status: "PENDING", // Refund Pending
            };
            
            if (seatSource) cancellationData.source = seatSource;
            if (seatDestination) cancellationData.destination = seatDestination;
            
            await tx.cancellation.create({ data: cancellationData });

            // 4. Deallocate Seat (clear source/destination since it's now available)
            if (seat) {
                await tx.seat.update({
                    where: { id: seat.id },
                    data: {
                        status: "AVAILABLE",
                        allocatedUserId: null,
                        allocatedAt: null,
                        passengerGender: null,
                        source: null,
                        destination: null
                    }
                });
            }
        });

        // 4. Send Email (Non-blocking)
        sendCancellationEmail({
            email: session.user.email,
            name: session.user.name,
            ticketNumber: ticket.ticketNumber,
            refundAmount: ticket.purchasePrice,
        }).catch(console.error);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Cancellation error:", error);
        return NextResponse.json({ error: "Failed to cancel ticket" }, { status: 500 });
    }
}
