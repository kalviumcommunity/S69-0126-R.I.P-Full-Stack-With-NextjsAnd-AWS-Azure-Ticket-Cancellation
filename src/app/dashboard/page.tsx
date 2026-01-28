"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function UserDashboard() {
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Get current user's identity (Assuming you stored email in cookies or just use 'user' for demo)
    const email = Cookies.get("user_email") || "user@protocol.com"; 
    setUserEmail(email);

    // 2. Load requests from the shared ledger
    const loadRequests = () => {
      const allRequests = JSON.parse(localStorage.getItem("refund_requests") || "[]");
      // For this demo, we show all, but in real apps, we filter by email
      setMyRequests(allRequests);
    };

    loadRequests();
    window.addEventListener("focus", loadRequests);
    return () => window.removeEventListener("focus", loadRequests);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white">
              MY <span className="text-rose-500">REFUNDS</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Identity: {userEmail}
            </p>
          </div>
          <Link href="/dashboard/request" className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
            + New Request
          </Link>
        </header>

        <div className="space-y-6">
          {myRequests.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No active protocols found.</p>
            </div>
          ) : (
            myRequests.map((req, index) => (
              <div key={`${req.id}-${index}`} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-400 font-bold tracking-widest uppercase">ID: {req.id}</span>
                    <p className="text-3xl font-black text-white mt-4 uppercase">Refund Recovery</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                      req.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      req.status === 'declined' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                    }`}>
                      {req.status}
                    </p>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="grid grid-cols-4 gap-4 mt-12">
                  {['Submitted', 'Verified', 'Liquidity', 'Success'].map((step, i) => {
                    // Logic to highlight progress based on status
                    const isCompleted = (req.status === 'approved' && i <= 3) || (req.status === 'pending' && i <= 0);
                    const isDeclined = req.status === 'declined';

                    return (
                      <div key={step} className="space-y-3">
                        <div className={`h-1.5 rounded-full transition-all duration-1000 ${
                          isDeclined && i > 0 ? 'bg-rose-900/20' : 
                          isCompleted ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 'bg-slate-800'
                        }`} />
                        <p className={`text-[9px] font-black uppercase tracking-tighter ${
                          isCompleted ? 'text-rose-400' : 'text-slate-600'
                        }`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}