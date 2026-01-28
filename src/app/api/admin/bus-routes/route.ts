/**
 * Admin Bus Routes API
 *
 * Allows admins to:
 * - Create new bus routes
 * - View all bus routes
 * - Update existing bus routes
 * - Delete bus routes
 *
 * Permissions: admin only
 */

import { NextRequest, NextResponse } from "next/server";
import { extractAndVerifyToken, requirePermission } from "@/lib/rbac";
import { handleError, ValidationError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Validation schema for creating bus route
const createBusRouteSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  departureTime: z.string().datetime("Invalid departure time format"),
  arrivalTime: z.string().datetime("Invalid arrival time format"),
  totalSeats: z.number().int().positive("Total seats must be positive"),
  basePrice: z.number().positive("Base price must be positive"),
});

interface BusRoute {
  id: number;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  basePrice: number;
  operatorId?: number;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for demonstration
const busRoutes: BusRoute[] = [];
let nextBusId = 1;

/**
 * GET /api/admin/bus-routes
 * Get all bus routes (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    const user = extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(user, "bus.read", "bus routes");
    if (authError) return authError;

    logger.info(`Admin ${user?.email} fetched all bus routes`);

    return NextResponse.json(
      {
        success: true,
        data: { busRoutes, total: busRoutes.length },
        message: "Bus routes retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "GET /api/admin/bus-routes");
  }
}

/**
 * POST /api/admin/bus-routes
 * Create a new bus route (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = extractAndVerifyToken(req);

    // Check admin permission
    const authError = requirePermission(user, "bus.create", "bus routes");
    if (authError) return authError;

    const body = await req.json();
    const data = createBusRouteSchema.parse(body);

    // Validate times
    const departure = new Date(data.departureTime);
    const arrival = new Date(data.arrivalTime);

    if (arrival <= departure) {
      throw new ValidationError("Arrival time must be after departure time");
    }

    const newRoute = {
      id: nextBusId++,
      ...data,
      availableSeats: data.totalSeats,
      operatorId: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    busRoutes.push(newRoute);

    logger.info(`Admin ${user?.email} created bus route ${newRoute.id}`, {
      routeId: newRoute.id,
      source: newRoute.source,
      destination: newRoute.destination,
    });

    return NextResponse.json(
      {
        success: true,
        data: { busRoute: newRoute },
        message: "Bus route created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleError(
        new ValidationError(error.issues.map((e) => e.message).join(", ")),
        "POST /api/admin/bus-routes"
      );
    }
    return handleError(error, "POST /api/admin/bus-routes");
  }
}
