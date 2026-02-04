import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST() {
    try {
        const { userId: clerkId } = await auth();
        const user = await currentUser();

        if (!clerkId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            return NextResponse.json({ error: "No email found" }, { status: 400 });
        }

        // Check if user exists
        let dbUser = await prisma.user.findUnique({
            where: { clerkId },
        });

        // If not, try finding by email (in case they signed up via email before)
        if (!dbUser) {
            dbUser = await prisma.user.findUnique({
                where: { email },
            });

            if (dbUser) {
                // Link clerkId to existing email user
                dbUser = await prisma.user.update({
                    where: { id: dbUser.id },
                    data: { clerkId },
                });
            }
        }

        // If still no user, create one
        if (!dbUser) {
            const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
            dbUser = await prisma.user.create({
                data: {
                    clerkId,
                    email,
                    name,
                    role: "PASSENGER", // Default role
                    provider: "google",
                },
            });
        }

        const frontendRole = dbUser.role === "ADMIN" ? "admin" : "user";

        // Generate JWT token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const token = await new SignJWT({
            id: dbUser.id,
            email: dbUser.email,
            role: frontendRole,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(secret);

        // Set cookies
        const cookieStore = await cookies();

        // Set 'token' for middleware (used by admin/api routes)
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 24 hours
        });

        // Set 'user_id' for legacy frontend logic
        cookieStore.set("user_id", dbUser.id.toString(), {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        // Set 'user_email' for frontend display
        cookieStore.set("user_email", dbUser.email, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        // Set 'role' for frontend routing checks
        cookieStore.set("role", frontendRole, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });


        return NextResponse.json({
            success: true,
            user: {
                id: dbUser.id,
                email: dbUser.email,
                role: frontendRole,
            },
        });
    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
