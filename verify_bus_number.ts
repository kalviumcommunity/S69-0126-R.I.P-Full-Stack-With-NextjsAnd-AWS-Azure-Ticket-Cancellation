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
        let busNumber = "";
        console.log(`\nChecking Ticket: ${c.ticket.ticketNumber}`);
        console.log(`Route Source: ${c.ticket.route.source}`);
        console.log(`Seat Number: ${c.ticket.seatNumber}`);
        console.log(`User ID: ${c.userId}`);

        // 1. Try to get bus number from route source
        if (c.ticket.route.source.startsWith("BUS-")) {
            busNumber = c.ticket.route.source.replace("BUS-", "");
            console.log(`Found via Route Source: ${busNumber}`);
        }

        // 2. If not found, look up via Seat allocation
        if (!busNumber) {
            console.log("Looking up via Seat...");
            const seat = await prisma.seat.findFirst({
                where: {
                    seatNumber: c.ticket.seatNumber,
                    allocatedUserId: c.userId
                },
                include: { bus: true }
            });

            if (seat) {
                console.log(`Seat found. Bus ID: ${seat.busId}`);
                if (seat.bus) {
                    busNumber = seat.bus.busNumber;
                    console.log(`Found via Seat: ${busNumber}`);
                } else {
                    console.log("Seat has no bus relation loaded?");
                }
            } else {
                console.log("Seat NOT found matching seatNumber + userId");
                // Try matching just seatNumber + route (if possible?) 
                // The seat doesn't have routeId, but it has busId. 
                // Maybe the user is no longer allocated?
            }
        }

        console.log(`Final Bus Number: ${busNumber || "N/A"}`);
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
