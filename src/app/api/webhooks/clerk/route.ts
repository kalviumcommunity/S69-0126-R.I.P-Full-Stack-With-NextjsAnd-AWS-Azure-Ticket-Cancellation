import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Get the Clerk webhook secret from environment variables
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error(
            "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env"
        );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- no svix headers", {
            status: 400,
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", {
            status: 400,
        });
    }

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
        const { id, email_addresses, first_name, last_name, phone_numbers } =
            evt.data;

        // Get primary email
        const primaryEmail = email_addresses.find(
            (email) => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
            return new Response("No primary email found", { status: 400 });
        }

        // Get primary phone (optional)
        const primaryPhone = phone_numbers?.find(
            (phone) => phone.id === evt.data.primary_phone_number_id
        );

        // Construct full name
        const fullName = `${first_name || ""} ${last_name || ""}`.trim() || "User";

        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { clerkId: id },
            });

            if (existingUser) {
                // Update existing user
                await prisma.user.update({
                    where: { clerkId: id },
                    data: {
                        email: primaryEmail.email_address,
                        name: fullName,
                        phone: primaryPhone?.phone_number || null,
                    },
                });
            } else {
                // Create new user
                await prisma.user.create({
                    data: {
                        clerkId: id,
                        email: primaryEmail.email_address,
                        name: fullName,
                        phone: primaryPhone?.phone_number || null,
                        password: null, // OAuth users don't have passwords
                        provider: "google",
                        role: "PASSENGER",
                    },
                });
            }

            return NextResponse.json({
                success: true,
                message: "User synced to database",
            });
        } catch (error) {
            console.error("Error syncing user to database:", error);
            return new Response("Error syncing user", { status: 500 });
        }
    }

    return new Response("Webhook received", { status: 200 });
}
