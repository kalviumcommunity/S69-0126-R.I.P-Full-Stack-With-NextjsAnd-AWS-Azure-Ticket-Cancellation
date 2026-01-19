import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const userRole = request.headers.get("x-user-role");
    const userEmail = request.headers.get("x-user-email");

    logger.info('Admin dashboard accessed', { email: userEmail, role: userRole });
    
    return NextResponse.json({
      success: true,
      message: "Welcome Admin! You have full access to admin resources.",
      data: {
        role: userRole,
        email: userEmail,
        permissions: [
          "view_all_users",
          "manage_roles",
          "view_analytics",
          "configure_system",
        ],
      },
    });
  } catch (error) {
    return handleError(error, 'GET /api/admin');
  }
}
