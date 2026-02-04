import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const cancellations = await prisma.cancellation.findMany({
        include: {
            ticket: {
                include: {
                    route: true
                }
            }
        }
    });

    console.log(`Found ${cancellations.length} cancellations`);

    for (const c of cancellations) {
        console.log(`\n--- Ticket: ${c.ticket.ticketNumber} ---`);
        console.log(`Route ID: ${c.ticket.routeId}`);

        // 1. Check if we can find ANY ticket on this route that has a seat allocation
        const neighborTicket = await prisma.ticket.findFirst({
            where: {
                routeId: c.ticket.routeId,
                NOT: {
                    id: c.ticket.id // Exclude self
                }
            }
        });

        if (neighborTicket) {
            console.log(`Found neighbor ticket: ${neighborTicket.ticketNumber}, User: ${neighborTicket.userId}, Seat: ${neighborTicket.seatNumber}`);

            // Try to find the bus for this neighbor
            const seat = await prisma.seat.findFirst({
                where: {
                    seatNumber: neighborTicket.seatNumber,
                    allocatedUserId: neighborTicket.userId
                },
                include: { bus: true }
            });

            if (seat?.bus) {
                console.log(`SUCCESS: Inferring Bus ${seat.bus.busNumber} from neighbor.`);
            } else {
                console.log("Neighbor ticket also has no active seat allocation.");
            }
        } else {
            console.log("No other tickets found on this route.");

            // Extended check: Is there ANY seat allocated for this route's timestamps or something?
            // Since Seat doesn't link to route, we are limited.
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
