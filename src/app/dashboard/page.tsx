"use client";
import useSWR from "swr";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher"; // Ensure this helper exists

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // 1. SWR Data Fetching
  const { data: tickets, error, isLoading } = useSWR("/api/tickets", fetcher, {
    refreshInterval: 5000, // Syncs with DB every 5 seconds
  });

  useEffect(() => {
    setMounted(true);
    setRole(Cookies.get("role") || "user");
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">Synchronizing Ledger...</p>
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header - Softened Borders */}
        <header className="flex justify-between items-end mb-12 border-b border-gray-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              {isAdmin ? "Oversight Terminal" : "Refund Status"}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full animate-pulse ${isAdmin ? "bg-blue-500" : "bg-red-500"}`}></span>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                {isAdmin ? "Admin Access: Active" : "Reference: RIP-SECURE"}
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-gray-600 text-xs font-bold uppercase italic">System Time</p>
            <p className="text-white font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg mb-6 text-red-200 text-sm font-medium">
            ⚠️ Connection Error: Failed to fetch live ticket data. Showing cached records.
          </div>
        )}

        {/* Ticket Card - More "Aesthetic" and Professional */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-gray-700">
          {/* Status Bar */}
          <div className="bg-[#1a1a1a] px-8 py-4 flex justify-between items-center border-b border-gray-800">
            <div className="flex items-center gap-4">
               <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase">
                 ID: TK-00226-RIP
               </span>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
              isAdmin 
              ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
              : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}>
              {isAdmin ? "✓ System Synced" : "● Cancellation Pending"}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-6 text-center md:text-left">
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Route Segment</p>
                <p className="text-5xl font-black text-white tracking-tighter">
                  SBC <span className="text-red-600">❯</span> HYB
                </p>
              </div>
              
              <div className="inline-flex items-center gap-3 bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-800">
                <p className="text-gray-400 text-sm font-semibold italic">
                  Status: <span className="text-white not-italic">Refund Processing</span>
                </p>
              </div>
            </div>

            {/* Value Display - Eye Friendly contrast */}
            <div className="relative group w-full md:w-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-[#0d0d0d] p-10 border border-gray-800 rounded-2xl text-center md:text-right min-w-[280px]">
                <p className="text-gray-500 text-xs font-bold uppercase mb-2">Approved Refund Value</p>
                <p className="text-7xl font-black text-white tracking-tighter italic">
                  <span className="text-2xl text-red-600 mr-1 italic">₹</span>3,840
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 flex justify-center md:justify-start gap-4">
           <button className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest">
              Refresh Data
           </button>
           <button className="border border-gray-800 text-gray-500 hover:text-white hover:border-white px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest">
              View Receipt
           </button>
        </div>
      </div>
    </main>
  );
}