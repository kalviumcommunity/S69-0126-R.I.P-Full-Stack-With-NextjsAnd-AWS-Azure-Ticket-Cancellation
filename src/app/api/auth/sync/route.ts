import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/sync
 * Sync Clerk user to local database
 */
export async function POST(_request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (user) {
            return NextResponse.json({
                success: true,
                message: "User already synced",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            });
        }

        // Fetch user details from Clerk
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json(
                { success: false, error: "No email found for user" },
                { status: 400 }
            );
        }

        // Check if user exists by email (legacy support)
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUserByEmail) {
            // Link Clerk ID to existing user
            user = await prisma.user.update({
                where: { id: existingUserByEmail.id },
                data: { clerkId: userId },
            });
            logger.info(`[Auth Sync] Linked Clerk ID to existing user: ${email}`);
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: email,
                    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
                    phone: clerkUser.phoneNumbers[0]?.phoneNumber || "",
                    role: "PASSENGER",
                },
            });
            logger.info(`[Auth Sync] Created new user from Clerk: ${email}`);
        }

        return NextResponse.json({
            success: true,
            message: "User synced successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        logger.error("[Auth Sync] Error syncing user", { error });
        return NextResponse.json(
            {
                success: false,
                error: "Failed to sync user",
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
