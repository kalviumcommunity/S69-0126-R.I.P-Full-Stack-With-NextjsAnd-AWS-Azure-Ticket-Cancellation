import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                clerkId: true,
                role: true,
                createdAt: true,
            }
        });

        console.log('\n=== USER COUNT ===');
        console.log(`Total users: ${users.length}`);
        console.log('\n=== USER DETAILS ===');
        users.forEach(user => {
            console.log(`ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, ClerkId: ${user.clerkId || 'N/A'}, Role: ${user.role}`);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
