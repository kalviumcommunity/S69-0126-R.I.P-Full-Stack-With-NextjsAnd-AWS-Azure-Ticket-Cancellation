import prisma from './src/lib/db';

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

    cancellations.forEach(c => {
        console.log(`Ticket: ${c.ticket.ticketNumber}`);
        console.log(`  Ticket Travel Date: ${c.ticket.travelDate}`);
        console.log(`  Route Departure Time: ${c.ticket.route.departureTime}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
