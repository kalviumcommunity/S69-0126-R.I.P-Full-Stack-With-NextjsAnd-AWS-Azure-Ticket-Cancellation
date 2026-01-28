/**
 * Admin Dashboard Page
 *
 * Displays admin-specific features:
 * - View all bookings
 * - Add bus routes
 * - Manage user bookings
 */

"use client";

import { useState, useEffect } from "react";
import { AdminOnly, UserSession } from "@/components/rbac/RoleGuard";

interface Booking {
  id: number;
  userId: number;
  busRouteId: number;
  seatNumber: number;
  passengerName: string;
  passengerPhone: string;
  status: string;
  bookingDate?: string;
}

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

export default function AdminDashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock session - in production, fetch from auth context
  useEffect(() => {
    // Simulating fetching session
    setSession({
      user: {
        id: 1,
        email: "admin@example.com",
        role: "admin",
        name: "Admin User",
      },
    });
  }, []);

  useEffect(() => {
    if (session) {
      fetchBookings();
      fetchBusRoutes();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/admin/bookings", {
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

  const fetchBusRoutes = async () => {
    try {
      const response = await fetch("/api/admin/bus-routes", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setBusRoutes(data.data.busRoutes);
      }
    } catch (error) {
      console.error("Failed to fetch bus routes:", error);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
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
    <AdminOnly session={session} fallback={<p>Access denied. Admin only.</p>}>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Admin Info */}
        <div className="bg-blue-100 border border-blue-400 rounded p-4 mb-6">
          <p className="font-semibold">
            Welcome, {session?.user.name} ({session?.user.role})
          </p>
          <p className="text-sm text-gray-600">{session?.user.email}</p>
        </div>

        {/* All Bookings Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">All Bookings</h2>
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-500">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Booking ID</th>
                    <th className="px-4 py-2 border">User ID</th>
                    <th className="px-4 py-2 border">Bus Route</th>
                    <th className="px-4 py-2 border">Seat</th>
                    <th className="px-4 py-2 border">Passenger</th>
                    <th className="px-4 py-2 border">Status</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{booking.id}</td>
                      <td className="px-4 py-2 border">{booking.userId}</td>
                      <td className="px-4 py-2 border">{booking.busRouteId}</td>
                      <td className="px-4 py-2 border">{booking.seatNumber}</td>
                      <td className="px-4 py-2 border">
                        {booking.passengerName}
                        <br />
                        <span className="text-sm text-gray-600">
                          {booking.passengerPhone}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            booking.status === "ACTIVE"
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border">
                        {booking.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bus Routes Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Bus Routes</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4">
            Add New Bus Route
          </button>
          {busRoutes.length === 0 ? (
            <p className="text-gray-500">No bus routes found</p>
          ) : (
            <div className="grid gap-4">
              {busRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-white border border-gray-300 rounded p-4"
                >
                  <h3 className="font-semibold text-lg">
                    {route.source} → {route.destination}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Departure: {new Date(route.departureTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Available Seats: {route.availableSeats}/{route.totalSeats}
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: ${route.basePrice}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminOnly>
  );
}
