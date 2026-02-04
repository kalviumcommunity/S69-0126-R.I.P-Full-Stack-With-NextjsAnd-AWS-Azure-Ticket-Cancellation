import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { busId, newTravelDate } = await request.json();

    if (!busId || !newTravelDate) {
      return NextResponse.json(
        { error: "Bus ID and travel date are required" },
        { status: 400 }
      );
    }

    // Verify bus exists
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
      include: { seats: true },
    });

    if (!bus) {
      return NextResponse.json(
        { error: "Bus not found" },
        { status: 404 }
      );
    }

    console.log("Updating bus travel date for bus:", busId, "to:", newTravelDate);

    // Find the bus route associated with this bus (via operator/seats)
    // Get admin user for operator
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    }) || await prisma.user.findFirst();

    if (!admin) {
      return NextResponse.json(
        { error: "No admin user found" },
        { status: 500 }
      );
    }

    const departureDate = new Date(newTravelDate);
    const arrivalDate = new Date(departureDate.getTime() + 3600000); // 1 hour later

    // Find or create a route with the new travel date
    // Use bus number in source field to uniquely identify this bus's route
    const routeIdentifier = `BUS-${bus.busNumber}`;
    const existingRoute = await prisma.busRoute.findFirst({
      where: {
        source: routeIdentifier,
        operatorId: admin.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingRoute) {
      // Update the existing route with new travel date
      const updatedRoute = await prisma.busRoute.update({
        where: { id: existingRoute.id },
        data: {
          departureTime: departureDate,
          arrivalTime: arrivalDate,
        },
      });

      console.log("Updated existing route:", updatedRoute.id);
    } else {
      // Create new route if not found
      const newRoute = await prisma.busRoute.create({
        data: {
          operatorId: admin.id,
          source: routeIdentifier, // Use bus number as unique identifier
          destination: "Destination",
          departureTime: departureDate,
          arrivalTime: arrivalDate,
          totalSeats: bus.totalSeats,
          availableSeats: bus.totalSeats,
          basePrice: 500,
        },
      });

      console.log("Created new route:", newRoute.id);
    }

    // Reset bus status to ACTIVE (so it moves back to live services)
    await prisma.bus.update({
      where: { id: busId },
      data: { status: "ACTIVE" },
    });

    // Cancel all tickets associated with this bus (regardless of route)
    // We do this by looking up allocated seats before deallocating them
    const allocatedSeats = await prisma.seat.findMany({
      where: {
        busId: busId,
        status: "BOOKED",
        allocatedUserId: { not: null }
      }
    });

    for (const seat of allocatedSeats) {
      if (seat.allocatedUserId) {
        // Find active ticket for this user and seat
        await prisma.ticket.updateMany({
          where: {
            userId: seat.allocatedUserId,
            seatNumber: seat.seatNumber,
            status: "ACTIVE"
          },
          data: { status: "CANCELLED" }
        });
      }
    }
    console.log(`Cancelled tickets for ${allocatedSeats.length} allocated seats`);

    // Deallocate all seats (reset to AVAILABLE)
    await prisma.seat.updateMany({
      where: { busId: busId },
      data: {
        status: "AVAILABLE",
        allocatedUserId: null,
        passengerGender: null,
        source: null,
        destination: null,
        allocatedAt: null,
      },
    });

    // Also cancel tickets on the specific route if it was found (cleanup)
    if (existingRoute) {
      await prisma.ticket.updateMany({
        where: { routeId: existingRoute.id, status: "ACTIVE" },
        data: { status: "CANCELLED" }
      });
      console.log("Cancelled all remaining tickets for route:", existingRoute.id);
    }

    console.log("Reset bus status to ACTIVE and deallocated all seats");

    // Return updated bus
    const updatedBus = await prisma.bus.findUnique({
      where: { id: busId },
      include: { seats: true },
    });

    return NextResponse.json(
      {
        data: updatedBus,
        message: "Bus travel date updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating bus travel date:", error);
    return NextResponse.json(
      { error: "Failed to update bus travel date" },
      { status: 500 }
    );
  }
}
