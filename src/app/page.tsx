import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center p-0 overflow-hidden bg-[#0F172A]">
      {/* Background Glows */}
      <div className="absolute top-[-5%] left-[-5%] w-[70%] h-[40%] bg-rose-500/10 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[70%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />

      {/* --- BODY CONTENT --- */}
      <div className="relative z-10 max-w-5xl w-full text-center flex flex-col items-center pt-32 pb-24 px-4">
        
        {/* Protocol Badge */}
        <section className="space-y-6 mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-rose-200/70">
              System Active: Secure Node
            </span>
          </div>

          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-white tracking-tighter leading-none italic">
            R.I.P<span className="text-rose-500">.</span>
          </h1>
          
          <div className="space-y-4">
            <p className="text-xs md:text-2xl font-bold uppercase tracking-[0.5em] text-slate-500">
              Refund In <span className="text-white">Process</span>
            </p>
            <p className="text-slate-400 text-sm md:text-xl font-medium max-w-md md:max-w-2xl mx-auto leading-relaxed normal-case px-6 md:px-0">
              Automated liquidity recovery with <span className="text-rose-400">military-grade</span> precision.
            </p>
          </div>
        </section>

        {/* Action Button */}
        <div className="relative group mb-16 md:mb-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <Link
            href="/login"
            className="relative px-8 md:px-12 py-4 md:py-6 bg-slate-900 border border-slate-800 rounded-full flex items-center gap-4 transition-all hover:border-rose-500/50"
          >
            <span className="text-white text-sm md:text-xl font-black uppercase tracking-[0.2em]">
              Initialize Protocol
            </span>
            <div className="h-6 w-6 rounded-full bg-rose-600 flex items-center justify-center">
               <div className="h-2 w-2 bg-white rotate-45" />
            </div>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl px-2">
          <div className="bg-slate-800/20 border border-white/5 p-4 md:p-6 rounded-3xl backdrop-blur-sm text-left">
            <span className="font-black uppercase text-[8px] tracking-widest text-rose-400 block mb-1">Efficiency</span>
            <p className="text-white font-bold text-sm md:text-lg italic">99.9% Sync</p>
          </div>
          <div className="bg-slate-800/20 border border-white/5 p-4 md:p-6 rounded-3xl backdrop-blur-sm text-left">
            <span className="font-black uppercase text-[8px] tracking-widest text-blue-400 block mb-1">Security</span>
            <p className="text-white font-bold text-sm md:text-lg italic">AES-256</p>
          </div>
          <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-4 md:p-6 rounded-3xl backdrop-blur-sm text-center md:text-left">
            <span className="font-black uppercase text-[8px] tracking-widest text-emerald-400 block mb-1">Speed</span>
            <p className="text-white font-bold text-sm md:text-lg italic">Instant Payouts</p>
          </div>
        </div>
      </div>

      {/* --- REFINED DARK FOOTER (Deep Black) --- */}
      <footer className="relative z-20 w-full mt-auto bg-[#09090b] text-zinc-400 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Brand Column */}
            <div className="space-y-4">
              <h3 className="text-xl font-black italic tracking-tighter text-white">
                R.I.P<span className="text-rose-600">.</span>
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed max-w-[180px]">
                High-performance liquidity recovery systems. Built for the next generation of logistics.
              </p>
            </div>

            {/* Registry Column */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Registry</h4>
              <ul className="space-y-2 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <li><Link href="/docs" className="hover:text-rose-500 transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-rose-500 transition-colors">Node Network</Link></li>
                <li><Link href="/legal" className="hover:text-rose-500 transition-colors">Privacy Cipher</Link></li>
              </ul>
            </div>

            {/* Comm Column */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Communication</h4>
              <div className="space-y-2 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <p className="flex items-center gap-2 text-zinc-300"><span className="text-rose-600 font-bold">E/</span> support@rip.io</p>
                <p className="flex items-center gap-2 text-zinc-300"><span className="text-rose-600 font-bold">T/</span> +1 800 PROTOCOL</p>
              </div>
            </div>

            {/* Visual Status Widget */}
            <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[8px] font-black uppercase text-zinc-500 tracking-tighter">Global Uptime</span>
                <span className="text-[8px] font-mono font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded">99.9%</span>
              </div>
              <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-rose-600 rounded-full" />
              </div>
              <p className="mt-3 text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                Local Node: <span className="text-zinc-300">Anekal_SEC_04</span>
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[9px] font-black text-zinc-600 tracking-[0.4em] uppercase">
              © 2026 R.I.P Protocol Layer // All Rights Reserved
            </p>
            <div className="flex gap-6">
              {["𝕏", "◈", "⌘"].map((icon, i) => (
                <div key={i} className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm">
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Subtle Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20" />
    </main>
  );
}