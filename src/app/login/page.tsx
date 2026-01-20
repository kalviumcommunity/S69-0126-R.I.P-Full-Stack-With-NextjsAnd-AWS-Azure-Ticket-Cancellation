// app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let role = "";

    // Hardcoded Credential Check
    if (email === "admin@kalvium.com" && password === "12345") {
      role = "admin";
    } else if (email === "user@kalvium.com" && password === "12345") {
      role = "user";
    }

    if (role) {
      Cookies.set("token", "secure-session", { expires: 1 });
      Cookies.set("role", role, { expires: 1 });
      router.push("/dashboard");
      router.refresh();
    } else {
      setError("ACCESS DENIED: Invalid Credentials");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-[80vh] bg-white">
      <div className="w-full max-w-md p-12 border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white">
        <h2 className="text-5xl font-black text-black mb-1 uppercase italic tracking-tighter">
          SECURE
        </h2>
        <p className="text-black font-black mb-10 text-xs tracking-widest border-b-4 border-red-600 pb-2 inline-block">
          TICKET RECOVERY PORTAL
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-black mb-2">
              Identifier (Email)
            </label>
            <input
              type="email"
              className="w-full p-4 bg-white border-4 border-black text-black font-black focus:bg-black focus:text-white outline-none transition"
              placeholder="name@portal.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-black mb-2">
              Security Key
            </label>
            <input
              type="password"
              className="w-full p-4 bg-white border-4 border-black text-black font-black focus:bg-black focus:text-white outline-none transition"
              placeholder="•••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 font-black italic">{error}</p>}
          <button className="w-full bg-black text-white py-5 font-black uppercase text-xl hover:bg-red-600 transition border-4 border-black active:translate-y-1">
            VERIFY & ENTRY
          </button>
        </form>
      </div>
    </main>
  );
}
