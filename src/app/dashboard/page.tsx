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
  seatSource?: string | null;
  seatDestination?: string | null;
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

interface NotificationState {
  isOpen: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function UserDashboard() {
  const { isSignedIn, user } = useUser();
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [myRequests, setMyRequests] = useState<RefundRequest[]>([]);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [cancelTicketId, setCancelTicketId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'success',
    message: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ isOpen: true, type, message });
    setTimeout(() => setNotification({ isOpen: false, type: 'success', message: '' }), 3000);
  };

  const confirmCancellation = async () => {
    if (!cancelTicketId) return;
    if (!cancelReason.trim()) {
      showNotification('error', 'Please provide a reason.');
      return;
    }

    setIsCancelling(true);
    try {
      const res = await fetch("/api/tickets/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: cancelTicketId, reason: cancelReason })
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const err = await res.json();
        const message = err?.error || "Failed to cancel ticket";

        if (typeof message === "string" && message.toLowerCase().includes("already exists")) {
          // Treat as success (cancellation already requested)
          setIsSuccess(true);
        } else {
          showNotification('error', "Failed to cancel: " + message);
          setIsCancelling(false);
        }
      }
    } catch (e) {
      showNotification('error', "Network error occurred");
      setIsCancelling(false);
    }
  };

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

  const getRouteLabel = (ticket: Ticket) => {
    const source = ticket.seatSource || ticket.route?.source;
    const destination = ticket.seatDestination || ticket.route?.destination;

    if (source && destination) return `${source} → ${destination}`;
    if (source) return `${source} → Destination`;
    if (destination) return `Origin → ${destination}`;
    return "Not Set";
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
      {/* Notification Toast */}
      {notification.isOpen && (
        <div className="fixed bottom-8 right-8 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`rounded-xl border px-6 py-4 shadow-2xl flex items-center gap-3 ${
            notification.type === 'success' 
              ? 'bg-emerald-900/30 border-emerald-500/50' 
              : 'bg-rose-900/30 border-rose-500/50'
          }`}>
            {notification.type === 'success' && (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            )}
            {notification.type === 'error' && (
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </div>
            )}
            <span className={`text-sm font-semibold ${
              notification.type === 'success' 
                ? 'text-emerald-300' 
                : 'text-rose-300'
            }`}>
              {notification.message}
            </span>
          </div>
        </div>
      )}
      {/* Cancellation Modal */}
      {cancelTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            {isSuccess ? (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                    Refund Initiated
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Your ticket has been cancelled successfully. A confirmation email has been sent to you.
                  </p>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-rose-500/10 p-6 border-b border-rose-500/20">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
                    Confirm <span className="text-rose-500">Cancellation</span>
                  </h3>
                  <p className="text-rose-400 text-[10px] uppercase tracking-widest mt-1 font-bold">
                    Action cannot be undone
                  </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div className="bg-rose-900/20 p-4 rounded-xl border border-rose-500/20">
                    <p className="text-rose-200 text-xs font-medium leading-relaxed">
                      Are you sure you want to cancel this ticket? Per the policy, only <span className="font-bold text-white">80% of the amount</span> will be refunded to your original payment method.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Reason for Cancellation
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Change of plans, found alternate route..."
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none transition-all h-24 resize-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                  <button
                    onClick={() => setCancelTicketId(null)}
                    disabled={isCancelling}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={confirmCancellation}
                    disabled={isCancelling}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-rose-900/20"
                  >
                    {isCancelling ? "Processing..." : "Confirm Refund"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Ticket #</p>
                      <p className="text-slate-200 font-mono font-bold">{ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Seat</p>
                      <p className="text-slate-200 font-bold">{ticket.seatNumber}</p>
                    </div>
                    <div className="md:col-span-1">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Route</p>
                      <p className="text-slate-200 font-medium text-xs truncate">
                        {getRouteLabel(ticket)}
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
                    <div className="text-right">
                      <button
                        onClick={() => {
                          setCancelTicketId(ticket.id);
                          setCancelReason("");
                        }}
                        className="bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-500 border border-rose-600/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
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
                        {getRouteLabel(ticket)}
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