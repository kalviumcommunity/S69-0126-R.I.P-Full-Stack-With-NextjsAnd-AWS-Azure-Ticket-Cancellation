import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import redis from "@/lib/redis";
import { sendOtpEmail } from "@/lib/email";
import { z } from "zod";

const sendOtpSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  console.log("=== SEND OTP REQUEST RECEIVED ===");
  try {
    const body = await request.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email, name } = result.data;

    // 1. Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists. Please login." },
        { status: 409 }
      );
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store in Redis (expires in 10 minutes)
    // Key format: otp:email
    await redis.set(`otp:${email}`, otp, "EX", 600);

    // 4. Send Email
    const emailSent = await sendOtpEmail({ email, otp, name });

    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
