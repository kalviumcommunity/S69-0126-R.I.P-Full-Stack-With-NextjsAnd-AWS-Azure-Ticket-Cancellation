"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

interface Ticket {
  id: number;
  ticketNumber: string;
  seatNumber: string;
  status: string;
  purchasePrice: number;
  travelDate: string;
  latestDepartureTime?: string;
  route?: {
    source: string;
    destination: string;
    departureTime?: string;
  };
}

interface RefundRequest {
  id: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
}

import { useUser } from "@clerk/nextjs";

export default function UserDashboard() {
  const { isSignedIn, user } = useUser();
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [myRequests, setMyRequests] = useState<RefundRequest[]>([]);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const getTicketDate = useCallback((ticket: Ticket) => {
    return ticket.latestDepartureTime || ticket.route?.departureTime || ticket.travelDate;
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const suffix = ["th", "st", "nd", "rd"];
    const v = day % 100;
    const ord = suffix[(v - 20) % 10] || suffix[v] || suffix[0];

    return `${day}${ord} ${month} ${year}`;
  };

  // Sync user with local DB if logged in via Clerk but no local session
  useEffect(() => {
    const checkAndSyncUser = async () => {
      const localUserId = Cookies.get("user_id");

      if (isSignedIn && !localUserId && !isSyncing) {
        setIsSyncing(true);
        try {
          console.log("Syncing user with local database...");
          const res = await fetch("/api/auth/sync", {
            method: "POST",
          });

          if (res.ok) {
            console.log("Sync successful, reloading...");
            window.location.reload();
          } else {
            console.error("Sync failed");
          }
        } catch (err) {
          console.error("Error syncing user:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (mounted && isSignedIn) {
      checkAndSyncUser();
    }
  }, [isSignedIn, mounted, isSyncing]);

  const loadTickets = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const tickets = data.data.tickets || [];

        // Separate active and past tickets
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const active = tickets.filter((t: Ticket) => {
          const tDate = new Date(getTicketDate(t));
          return t.status === 'ACTIVE' && tDate >= now;
        });

        const past = tickets.filter((t: Ticket) => {
          const tDate = new Date(getTicketDate(t));
          return t.status !== 'ACTIVE' || tDate < now;
        });

        setActiveTickets(active);
        setPastTickets(past);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  }, [userId, getTicketDate]);

  const loadRequests = useCallback(() => {
    if (typeof window !== "undefined") {
      const allRequests: RefundRequest[] = JSON.parse(
        localStorage.getItem("refund_requests") || "[]"
      );
      setMyRequests(allRequests);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    // Get user ID from cookies or localStorage
    const id = parseInt(Cookies.get("user_id") || "0");
    setUserId(id);

    loadRequests();
    window.addEventListener("focus", loadRequests);
    return () => window.removeEventListener("focus", loadRequests);
  }, [loadRequests]);

  useEffect(() => {
    if (userId) {
      loadTickets();
    }
  }, [userId, loadTickets]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Active Tickets Section */}
        <section className="border-b border-slate-800 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              My <span className="text-emerald-500">Active Tickets</span>
            </h2>
          </div>

          {activeTickets.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-12 text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                No active tickets found.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Ticket #</p>
                      <p className="text-slate-200 font-mono font-bold">{ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Seat</p>
                      <p className="text-slate-200 font-bold">{ticket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Route</p>
                      <p className="text-slate-200 font-medium">
                        {ticket.route ? `${ticket.route.source} → ${ticket.route.destination}` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Date</p>
                      <p className="text-slate-200 font-medium">{formatDate(getTicketDate(ticket))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</p>
                      <span className="inline-block bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded text-[10px] font-bold">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Tickets Section */}
        <section className="border-b border-slate-800 pb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              <span className="text-slate-500">Past</span> Tickets
            </h2>
          </div>

          {pastTickets.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-12 text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                No past tickets found.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pastTickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-900/20 border border-slate-800/50 rounded-xl p-6 opacity-75 hover:opacity-100 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Ticket #</p>
                      <p className="text-slate-300 font-mono font-bold">{ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Seat</p>
                      <p className="text-slate-300 font-bold">{ticket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Route</p>
                      <p className="text-slate-300 font-medium">
                        {ticket.route ? `${ticket.route.source} → ${ticket.route.destination}` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Date</p>
                      <p className="text-slate-300 font-medium">{formatDate(getTicketDate(ticket))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status</p>
                      <span className="inline-block bg-slate-700/30 text-slate-400 px-3 py-1 rounded text-[10px] font-bold">
                        COMPLETED
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Refunds Section */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              My <span className="text-rose-500">Refunds</span>
            </h2>
            <Link
              href="/dashboard/request"
              className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              + New Request
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-12 text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                No refund requests found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req, index) => (
                <div key={`${req.id}-${index}`} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 hover:border-rose-500/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-400 font-bold tracking-widest uppercase inline-block mb-3">
                        ID: {req.id}
                      </p>
                      <p className="text-xl font-black text-white uppercase italic tracking-tighter">
                        Refund Recovery
                      </p>
                      <p className="text-slate-500 text-xs mt-2">Reason: {req.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${req.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        req.status === 'declined' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                        }`}>
                        {req.status}
                      </p>
                      <p className="text-slate-500 text-[9px] mt-2">{new Date(req.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}