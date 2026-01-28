"use client";
import { useEffect, useState } from "react";

export default function AdminTerminal() {
  // 1. Initial State: Only 'Approved' and 'Declined' have dummy cards for design showcase
  const [requests, setRequests] = useState<any[]>([
    {
      id: "TK-1102-RIP",
      email: "legacy.admin@protocol.com",
      reason: "Previously approved transaction.",
      status: "approved",
      submittedAt: new Date().toISOString(),
    },
    {
      id: "TK-0043-RIP",
      email: "invalid.key@protocol.com",
      reason: "Security handshake failure.",
      status: "declined",
      submittedAt: new Date().toISOString(),
    }
  ]);

  // 2. Load LocalStorage Data (Your real form submissions)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("refund_requests") || "[]");
    
    if (saved.length > 0) {
      setRequests((prev) => {
        // Remove hardcoded items if they somehow clash with saved IDs
        const filteredPrev = prev.filter(
          (p) => !saved.some((s: any) => s.id === p.id)
        );
        return [...filteredPrev, ...saved];
      });
    }
  }, []);

  // 3. Logic to update ticket status (Moves cards between columns)
  const updateStatus = (id: string, newStatus: 'approved' | 'declined') => {
    setRequests((prev) => 
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
  };

  const pending = requests.filter((r) => r.status === "pending");
  const approved = requests.filter((r) => r.status === "approved");
  const declined = requests.filter((r) => r.status === "declined");

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
          
          {/* COLUMN 1: RECEIVED (Empty by default) */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-amber-500/30 pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-amber-500">Received Requests</h2>
              <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded font-mono">{pending.length}</span>
            </div>
            
            <div className="space-y-4">
              {pending.length === 0 ? (
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-10 text-center">
                  <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Awaiting Inbound Data...</p>
                </div>
              ) : (
                pending.map((req, index) => (
                  <div key={`${req.id}-${index}`} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl group hover:border-amber-500/50 transition-all shadow-lg">
                    <div className="flex justify-between mb-3">
                      <p className="text-white font-bold text-sm tracking-tight">{req.id}</p>
                      <p className="text-amber-500 text-[9px] font-mono uppercase animate-pulse">Pending</p>
                    </div>
                    <p className="text-slate-400 text-xs mb-1 font-medium">{req.email}</p>
                    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 italic">"{req.reason}"</p>
                    <div className="flex gap-2 mt-5">
                      <button 
                        onClick={() => updateStatus(req.id, 'approved')}
                        className="flex-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white text-[9px] font-black uppercase py-2 rounded-lg transition-all border border-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'declined')}
                        className="flex-1 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white text-[9px] font-black uppercase py-2 rounded-lg transition-all border border-rose-500/20"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* COLUMN 2: APPROVED */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-emerald-500/30 pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-emerald-500">Approved Protocols</h2>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-mono">{approved.length}</span>
            </div>
            <div className="space-y-4">
              {approved.map((req, index) => (
                <div key={`${req.id}-${index}`} className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <p className="text-white font-bold text-sm tracking-tight">{req.id}</p>
                    <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded">Verified</span>
                  </div>
                  <p className="text-slate-400 text-xs">{req.email}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMN 3: DECLINED */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b border-rose-500/30 pb-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-rose-500">Declined / Void</h2>
              <span className="bg-rose-500/10 text-rose-500 text-[10px] px-2 py-0.5 rounded font-mono">{declined.length}</span>
            </div>
            <div className="space-y-4">
              {declined.map((req, index) => (
                <div key={`${req.id}-${index}`} className="bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl opacity-60">
                  <p className="text-white/50 font-bold text-sm tracking-tight">{req.id}</p>
                  <p className="text-slate-600 text-[10px] uppercase font-bold mt-1 tracking-tighter">Handshake Voided</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}