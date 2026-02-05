"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Ticket {
  id: number;
  ticketNumber: string;
  seatNumber: string;
  status: string;
  travelDate: string;
  latestDepartureTime?: string;
  seatSource?: string | null;
  seatDestination?: string | null;
  route?: {
    source: string;
    destination: string;
    departureTime: string;
  };
}

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string | null;
  createdAt: string;
  tickets: Ticket[];
}

export default function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [viewerRole, setViewerRole] = useState<string | null>(null);

  useEffect(() => {
    const loadViewer = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.user?.role) {
            setViewerRole(data.user.role);
          }
        }
      } catch (err) {
        console.error("Error loading viewer:", err);
      }
    };

    const loadUser = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/users/${resolvedParams.id}`, { credentials: "include" });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", response.status, errorData);
          throw new Error(errorData.message || `Failed to fetch user (${response.status})`);
        }

        const data = await response.json();
        console.log("User data fetched:", data.data);
        console.log("Tickets:", data.data.tickets);
        setUser(data.data);
        setPhone(data.data.phone || "");
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    loadViewer();
  }, [params]);

  const handleSavePhone = async () => {
    setSavingPhone(true);
    setEditError("");
    setEditSuccess("");

    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone || null }),
      });

      if (!response.ok) {
        throw new Error("Failed to update phone");
      }

      const data = await response.json();
      setUser(data.data);
      setEditSuccess("Phone number updated successfully!");
      setEditing(false);
      setTimeout(() => setEditSuccess(""), 3000);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update phone");
    } finally {
      setSavingPhone(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[90vh] bg-[#0F172A] p-6 md:p-12 flex flex-col items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-[90vh] bg-[#0F172A] p-6 md:p-12 flex flex-col items-center justify-center">
        <p className="text-red-400">User not found</p>
      </main>
    );
  }

  const isViewerAdmin = viewerRole === "ADMIN" || viewerRole === "admin";
  const isProfileAdmin = user.role === "ADMIN" || user.role === "admin";

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const getTicketDate = (ticket: Ticket) => {
    return ticket.latestDepartureTime || ticket.route?.departureTime || ticket.travelDate;
  };

  const activeTickets = user.tickets.filter(ticket => {
    const dateStr = getTicketDate(ticket);
    const date = new Date(dateStr);
    const isValidDate = !isNaN(date.getTime());

    if (ticket.status === 'ACTIVE') {
      // If date is invalid, we still show it as active (fallback)
      // If date is valid, it must be today or future
      return !isValidDate || date >= now;
    }
    return false;
  });

  const pastTickets = user.tickets.filter(ticket => {
    const dateStr = getTicketDate(ticket);
    const date = new Date(dateStr);
    const isValidDate = !isNaN(date.getTime());

    if (ticket.status === 'ACTIVE') {
      // Active tickets are only "past" if valid date AND date < now
      return isValidDate && date < now;
    }
    // All non-active tickets (CANCELLED, etc.) are past
    return true;
  });

  const getRouteLabel = (ticket: Ticket) => {
    const source = ticket.seatSource || ticket.route?.source;
    const destination = ticket.seatDestination || ticket.route?.destination;

    if (source && destination) return `${source} → ${destination}`;
    if (source) return `${source} → Destination`;
    if (destination) return `Origin → ${destination}`;
    return "Not Set";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date Pending";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date Pending";

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const suffix = ["th", "st", "nd", "rd"];
    const v = day % 100;
    const ord = suffix[(v - 20) % 10] || suffix[v] || suffix[0];

    return `${day}${ord} ${month} ${year}`;
  };

  return (
    <main className="min-h-[90vh] bg-[#0F172A] p-6 md:p-12 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          <Link href={isViewerAdmin ? "/admin/bookings" : "/dashboard"} className="hover:text-rose-500 transition-colors">
            {isViewerAdmin ? "Admin Bookings" : "Dashboard"}
          </Link>
          <span>/</span>
          <span className="text-slate-300">{user.name}</span>
        </nav>

        {/* Profile Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] overflow-hidden shadow-2xl">

          {/* Top Banner Accent */}
          <div className={`h-32 w-full bg-linear-to-r ${isProfileAdmin ? 'from-blue-600 to-indigo-900' : 'from-rose-600 to-orange-900'} opacity-50`} />

          <div className="px-8 pb-10 -mt-16 relative">
            {/* Avatar */}
            <div className="h-32 w-32 bg-slate-900 border-4 border-[#0F172A] rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-xl mb-6">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">
                  {user.name}
                </h1>
                <p className="text-rose-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {isProfileAdmin ? "Administrator" : "Passenger"}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all border border-rose-500"
                >
                  {editing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-700/50 w-full my-8" />

            {/* Success/Error Messages */}
            {editSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 mb-6">
                <p className="text-emerald-300 text-sm font-semibold text-center">{editSuccess}</p>
              </div>
            )}
            {editError && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 mb-6">
                <p className="text-red-300 text-sm font-semibold text-center">{editError}</p>
              </div>
            )}

            {/* Stats/Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Email Address</p>
                <p className="text-slate-200 font-medium break-all">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Account Status</p>
                <p className="text-emerald-400 font-medium italic">Verified & Active</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Phone Number</p>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white outline-none focus:border-rose-500"
                    />
                    <button
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      {savingPhone ? "..." : "Save"}
                    </button>
                  </div>
                ) : (
                  <p className="text-slate-200 font-medium">{phone || "Not provided"}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Member Since</p>
                <p className="text-slate-200 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Tickets Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">
            Active <span className="text-rose-500">Tickets</span>
          </h2>

          {activeTickets.length > 0 ? (
            <div className="space-y-4">
              {activeTickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Ticket #</p>
                      <p className="text-slate-200 font-mono font-bold">{ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Date</p>
                      <p className="text-slate-200 font-bold">
                        {formatDate(getTicketDate(ticket))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Seat</p>
                      <p className="text-slate-200 font-bold">{ticket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</p>
                      <p className="font-bold text-sm text-emerald-400">
                        {ticket.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Route</p>
                      <p className="text-slate-200 font-medium">
                        {getRouteLabel(ticket)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium">No active tickets</p>
            </div>
          )}
        </div>

        {/* Past Tickets Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">
            Past <span className="text-slate-500">Tickets</span>
          </h2>

          {pastTickets.length > 0 ? (
            <div className="space-y-4">
              {pastTickets.map((ticket) => {
                const ticketDate = new Date(getTicketDate(ticket));
                const isExpired = ticket.status === 'ACTIVE' && ticketDate < now;
                const isCancelled = ticket.status === 'CANCELLED' || ticket.status === 'REFUNDED';

                return (
                  <div key={ticket.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Ticket #</p>
                        <p className="text-slate-200 font-mono font-bold">{ticket.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Date</p>
                        <p className="text-slate-200 font-bold">
                          {formatDate(getTicketDate(ticket))}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</p>
                        <p className={`font-bold text-sm ${isCancelled ? 'text-yellow-400' : isExpired ? 'text-slate-400' : 'text-emerald-400'}`}>
                          {isExpired ? 'EXPIRED' : ticket.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Route</p>
                        <p className="text-slate-200 font-medium">
                          {ticket.route && ticket.route.source && ticket.route.destination
                            ? `${ticket.route.source} → ${ticket.route.destination}`
                            : ticket.route
                              ? `${ticket.route.source || "N/A"} → ${ticket.route.destination || "N/A"}`
                              : "Not Set"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 font-medium">No past tickets</p>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <p className="text-center text-slate-600 text-[10px] uppercase tracking-[0.3em]">
          End-to-End Encrypted Profile Access
        </p>
      </div>
    </main>
  );
}