/**
 * User Bookings Page
 *
 * Displays user-specific features:
 * - View their own bookings
 * - Cancel their own bookings
 */

"use client";

import { useState, useEffect } from "react";
import {
  Authenticated,
  UserSession,
  AdminOnly,
} from "@/components/rbac/RoleGuard";

interface Booking {
  id: number;
  userId: number;
  busRouteId: number;
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
  status: string;
  bookingDate: string;
}

export default function UserBookingsPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock session - in production, fetch from auth context
  useEffect(() => {
    // Simulating fetching session
    setSession({
      user: {
        id: 2,
        email: "user@example.com",
        role: "user",
        name: "Regular User",
      },
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        alert("Booking cancelled successfully");
        fetchBookings(); // Refresh bookings
      } else {
        alert(`Failed to cancel booking: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    }
  };

  return (
    <Authenticated
      session={session}
      fallback={
        <div className="p-8">
          <p>Please log in to view your bookings</p>
        </div>
      }
    >
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {/* User Info */}
        <div className="bg-green-100 border border-green-400 rounded p-4 mb-6">
          <p className="font-semibold">
            Welcome, {session?.user.name} ({session?.user.role})
          </p>
          <p className="text-sm text-gray-600">{session?.user.email}</p>
        </div>

        {/* User Bookings Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You don&apos;t have any bookings yet
              </p>
              <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                Browse Bus Routes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        Booking #{booking.id}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Passenger:</span>{" "}
                          {booking.passengerName}
                        </p>
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {booking.passengerPhone}
                        </p>
                        <p>
                          <span className="font-medium">Seat Number:</span>{" "}
                          {booking.seatNumber}
                        </p>
                        <p>
                          <span className="font-medium">Bus Route:</span> #
                          {booking.busRouteId}
                        </p>
                        <p>
                          <span className="font-medium">Booking Date:</span>{" "}
                          {new Date(booking.bookingDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium mb-2 inline-block ${
                          booking.status === "ACTIVE"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === "ACTIVE" && (
                        <div>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Admin-only section - shows only to admins */}
        <AdminOnly session={session}>
          <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <p className="font-semibold">Admin View</p>
            <p className="text-sm">
              You have admin privileges and can manage all bookings
            </p>
          </div>
        </AdminOnly>
      </div>
    </Authenticated>
  );
}
