"use client";
import { useEffect, useState } from "react";

interface RefundRequest {
  id: string; // Ticket Number
  originalId: number; // Database ID for Cancellation
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
}

export default function AdminTerminal() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/refunds");
      if (res.ok) {
        const data = await res.json();
        console.log("Admin Fetched Data:", data); // DEBUG LOG
        setRequests(data);
      } else {
        console.error("Fetch failed:", res.status);
      }
    } catch (err) {
      console.error("Failed to load refunds", err);
    }
  };

  useEffect(() => {
    loadData();
    // Poll every 30 seconds for live monitoring
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (cancellationId: number, newStatus: 'approved' | 'declined') => {
    try {
      // Optimistic update
      setRequests((prev) =>
        prev.map((req) => (req.originalId === cancellationId ? { ...req, status: newStatus } : req))
      );

      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationId, status: newStatus })
      });

      if (!res.ok) {
        // Revert on failure (or just reload)
        alert("Failed to update status");
        loadData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      loadData();
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const declined = requests.filter((r) => r.status === "declined"); // declined = rejected in DB, mapped in API

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
              Oversight <span className="text-rose-500">Terminal</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
              System Protocol: Live Monitoring
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="text-[9px] border border-rose-500/30 text-rose-500 px-3 py-1 rounded hover:bg-rose-500 hover:text-white transition-all font-bold uppercase tracking-widest"
            >
              Reset Ledger
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMN 1 */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-amber-500/30 pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">Received</h2>
              <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded font-mono">{pending.length}</span>
            </div>
            <div className="space-y-4">
              {pending.map((req, index) => (
                <div key={`${req.id}-${index}`} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                  <p className="text-white font-bold text-sm">{req.id}</p>
                  <p className="text-slate-400 text-xs mb-1">{req.email}</p>
                  {/* FIXED QUOTES BELOW */}
                  <p className="text-slate-500 text-[10px] italic">&quot;{req.reason}&quot;</p>
                  <div className="flex gap-2 mt-5">
                    <button onClick={() => updateStatus(req.originalId, 'approved')} className="flex-1 bg-emerald-600/10 text-emerald-500 text-[9px] font-black py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">APPROVE</button>
                    <button onClick={() => updateStatus(req.originalId, 'declined')} className="flex-1 bg-rose-600/10 text-rose-500 text-[9px] font-black py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-all">DECLINE</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Column 2 & 3 follow same pattern with unique keys */}
          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase text-emerald-500 border-b border-emerald-500/30 pb-4">Approved</h2>
            {approved.map((req, index) => (
              <div key={`${req.id}-app-${index}`} className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
                <p className="text-white font-bold text-sm">{req.id}</p>
                <p className="text-slate-400 text-xs">{req.email}</p>
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <h2 className="text-xs font-black uppercase text-rose-500 border-b border-rose-500/30 pb-4">Declined</h2>
            {declined.map((req, index) => (
              <div key={`${req.id}-dec-${index}`} className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl">
                <p className="text-white/50 font-bold text-sm">{req.id}</p>
                <p className="text-slate-600 text-[10px] uppercase font-bold">Ticket Misuse</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}