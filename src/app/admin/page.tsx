"use client";
import { useEffect, useState } from "react";

interface RefundRequest {
  id: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
}

export default function AdminTerminal() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);

  useEffect(() => {
    const loadData = () => {
      const savedRaw = localStorage.getItem("refund_requests");
      const saved: RefundRequest[] = savedRaw ? JSON.parse(savedRaw) : [];
      
      const dummyData: RefundRequest[] = [
        {
          id: "TK-1102-RIP",
          email: "legacy.admin@protocol.com",
          reason: "Previously approved transaction.",
          status: "approved" as const,
          submittedAt: new Date().toISOString(),
        },
        {
          id: "TK-0043-RIP",
          email: "invalid.key@protocol.com",
          reason: "Security handshake failure.",
          status: "declined" as const,
          submittedAt: new Date().toISOString(),
        }
      ];

      const filteredSaved = saved.filter(s => !dummyData.some(d => d.id === s.id));
      setRequests([...dummyData, ...filteredSaved]);
    };

    loadData();
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

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
                    <button onClick={() => updateStatus(req.id, 'approved')} className="flex-1 bg-emerald-600/10 text-emerald-500 text-[9px] font-black py-2 rounded-lg">APPROVE</button>
                    <button onClick={() => updateStatus(req.id, 'declined')} className="flex-1 bg-rose-600/10 text-rose-500 text-[9px] font-black py-2 rounded-lg">DECLINE</button>
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
                 <p className="text-slate-600 text-[10px] uppercase font-bold">Handshake Voided</p>
               </div>
             ))}
          </section>
        </div>
      </div>
    </main>
  );
}