// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    let role = "";

    // Hardcoded Credential Check
    if (email === "admin@kalvium.com" && password === "12345") {
      role = "admin";
    } else if (email === "user@kalvium.com" && password === "12345") {
      role = "user";
    }

    // Simulate a brief "System Check" delay for UX
    setTimeout(() => {
      if (role) {
        Cookies.set("token", "secure-session", { expires: 1 });
        Cookies.set("role", role, { expires: 1 });
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("ACCESS_DENIED: Invalid Credentials");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <main className="relative flex items-center justify-center min-h-[90vh] bg-[#0F172A] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-10 md:p-12 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl">
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">
            SECURE<span className="text-rose-500 font-sans not-italic">_</span>
          </h2>
          <div className="inline-block px-4 py-1 rounded-full border border-rose-500/20 bg-rose-500/10">
            <p className="text-rose-400 font-bold text-[10px] tracking-[0.3em] uppercase">
              Identity Verification
            </p>
          </div>
        </header>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
              Network Identifier
            </label>
            <input
              type="email"
              className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white font-medium placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              placeholder="name@rip-portal.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
              Security Key
            </label>
            <input
              type="password"
              className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white font-medium placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>
            </div>
          )}

          <button 
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
          >
            {isLoading ? "Verifying..." : "Verify & Entry"}
          </button>
        </form>

        <footer className="mt-8 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest">
            Protected by R.I.P. Encryption Suite
          </p>
        </footer>
      </div>
    </main>
  );
}