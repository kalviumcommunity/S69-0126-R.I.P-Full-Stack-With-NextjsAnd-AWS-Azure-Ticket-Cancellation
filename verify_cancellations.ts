import prisma from './src/lib/db';

async function main() {
    const cancellations = await prisma.cancellation.findMany({
        include: {
            ticket: true,
            user: true
        }
    });
    console.log("Cancellations found:", JSON.stringify(cancellations, null, 2));

    const users = await prisma.user.findMany();
    console.log("Users:", JSON.stringify(users, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
