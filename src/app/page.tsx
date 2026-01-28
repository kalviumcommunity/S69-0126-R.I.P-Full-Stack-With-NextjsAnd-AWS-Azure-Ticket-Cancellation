// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 overflow-hidden bg-[#0F172A]">
      {/* Dynamic Background Glows for a "Soft" feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-5xl w-full text-center space-y-12">
        {/* Main Branding Section */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
              Protocol v2.0 Secured
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none italic">
            R.I.P<span className="text-rose-500">.</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.4em] text-slate-400">
            Refund In <span className="text-white">Process</span>
          </p>

          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed normal-case">
            The professional-grade ecosystem for automated ticket cancellation. 
            Experience <span className="text-rose-400">lightning-fast</span> liquidity recovery with military-grade security.
          </p>
        </section>

        {/* Action Buttons with soft transitions */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Link
            href="/login"
            className="group relative px-10 py-5 bg-rose-600 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-rose-900/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            <span className="relative text-white text-xl font-bold uppercase tracking-widest">
              Track My Refund
            </span>
          </Link>
          
          <Link
            href="/login"
            className="px-10 py-5 bg-slate-800/50 backdrop-blur-md border border-slate-700 text-slate-200 rounded-2xl text-xl font-bold uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95"
          >
            Admin Access
          </Link>
        </div>

        {/* Trust/Metric Bar - "Soft" glass cards */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
          {[
            { label: "Efficiency", value: "99.9% Sync Rate", color: "text-rose-400" },
            { label: "Security", value: "AES-256 Encrypted", color: "text-blue-400" },
            { label: "Speed", value: "Instant Payouts", color: "text-emerald-400" }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-2xl backdrop-blur-sm text-left">
              <span className={`font-black uppercase text-[10px] tracking-widest ${item.color} block mb-1`}>
                {item.label}
              </span>
              <p className="text-white font-bold text-lg tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}