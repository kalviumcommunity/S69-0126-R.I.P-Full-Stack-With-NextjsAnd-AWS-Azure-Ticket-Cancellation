
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserTickets() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'preetham.praveen.s69@kalvium.community' },
            include: {
                tickets: {
                    include: {
                        route: true
                    }
                }
            }
        });

        if (!user) {
            console.log("User not found");
            return;
        }

        console.log("User found:", user.email);
        console.log("Ticket Count:", user.tickets.length);
        user.tickets.forEach(t => {
            console.log(`Ticket ${t.ticketNumber}: Status=${t.status}, TravelDate="${t.travelDate}", RouteID=${t.routeId}, RouteDep=${t.route?.departureTime}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserTickets();
