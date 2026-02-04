import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Check if user is authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = await verifyToken(accessToken);
    
    return NextResponse.json(
      {
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid token" },
      { status: 401 }
    );
  }
}
