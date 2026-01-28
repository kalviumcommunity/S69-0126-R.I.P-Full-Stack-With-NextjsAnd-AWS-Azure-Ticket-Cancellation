/**
 * Public Bus Routes API
 *
 * Allows all authenticated users to:
 * - View available bus routes
 * - Search bus routes by source/destination
 *
 * Permissions: authenticated users
 */

import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
import { handleError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";

interface BusRoute {
  id: number;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
}

// Import the bus routes from admin API
// In production, this would come from a database
const busRoutes: BusRoute[] = [];

/**
 * GET /api/bus-routes
 * Get all available bus routes (authenticated users)
 */
export async function GET(req: NextRequest) {
  try {
    const user = extractAndVerifyToken(req);

    // Check authentication
    const authError = requirePermission(user, "bus.read", "bus routes");
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source");
    const destination = searchParams.get("destination");

    let filteredRoutes = busRoutes;

    // Filter by source if specified
    if (source) {
      filteredRoutes = filteredRoutes.filter((r) =>
        r.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    // Filter by destination if specified
    if (destination) {
      filteredRoutes = filteredRoutes.filter((r) =>
        r.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    logger.info(`User ${user?.email} searched bus routes`, {
      total: filteredRoutes.length,
      filters: { source, destination },
    });

    return NextResponse.json(
      {
        success: true,
        data: { busRoutes: filteredRoutes, total: filteredRoutes.length },
        message: "Bus routes retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "GET /api/bus-routes");
  }
}

// Export busRoutes for use in other modules
export { busRoutes };
