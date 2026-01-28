// // app/login/page.tsx
// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Cookies from "js-cookie";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsLoading(true);
  
//   setTimeout(() => {
//     if (email === "admin@kalvium.com" && password === "12345") {
//       Cookies.set("role", "admin");
//       Cookies.set("token", "admin-token");
//       router.push("/admin"); // Redirect to Admin Oversight
//     } else if (email === "user@kalvium.com" && password === "12345") {
//       Cookies.set("role", "user");
//       Cookies.set("token", "user-token");
//       router.push("/dashboard"); // Redirect to User Status
//     } else {
//       setError("INVALID ACCESS CREDENTIALS");
//       setIsLoading(false);
//     }
//   }, 800);
// };

//   return (
//     <main className="relative flex items-center justify-center min-h-[90vh] bg-[#0F172A] overflow-hidden">
//       {/* Background Ambient Glow */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

//       <div className="relative z-10 w-full max-w-md p-10 md:p-12 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl">
//         <header className="mb-10 text-center">
//           <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">
//             SECURE<span className="text-rose-500 font-sans not-italic">_</span>
//           </h2>
//           <div className="inline-block px-4 py-1 rounded-full border border-rose-500/20 bg-rose-500/10">
//             <p className="text-rose-400 font-bold text-[10px] tracking-[0.3em] uppercase">
//               Identity Verification
//             </p>
//           </div>
//         </header>

//         <form onSubmit={handleLogin} className="space-y-6">
//           <div className="space-y-2">
//             <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
//               Network Identifier
//             </label>
//             <input
//               type="email"
//               className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white font-medium placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
//               placeholder="name@rip-portal.com"
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
//               Security Key
//             </label>
//             <input
//               type="password"
//               className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white font-medium placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
//               placeholder="••••••••"
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           {error && (
//             <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
//               <p className="text-red-500 text-xs font-bold text-center italic">{error}</p>
//             </div>
//           )}

//           <button 
//             disabled={isLoading}
//             className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
//           >
//             {isLoading ? "Verifying..." : "Verify & Entry"}
//           </button>
//         </form>

//         <footer className="mt-8 text-center">
//           <p className="text-slate-500 text-[10px] uppercase tracking-widest">
//             Protected by R.I.P. Encryption Suite
//           </p>
//         </footer>
//       </div>
//     </main>
//   );
// }

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false); // Toggle between Login and Signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For Signup
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle Google OAuth (Visual Simulation)
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      Cookies.set("role", "user");
      Cookies.set("token", "google-oauth-token");
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      if (isSignup) {
        // --- SIGNUP LOGIC ---
        const newUser = { email, password, name, role: "user" };
        const existingUsers = JSON.parse(localStorage.getItem("rip_users") || "[]");
        
        // Check if user exists
        if (existingUsers.find((u: any) => u.email === email)) {
          setError("USER_EXISTS: Identifier already registered");
          setIsLoading(false);
          return;
        }

        existingUsers.push(newUser);
        localStorage.setItem("rip_users", JSON.stringify(existingUsers));
        alert("Account Created! Please Sign In.");
        setIsSignup(false);
        setIsLoading(false);
      } else {
        // --- LOGIN LOGIC ---
        // 1. Check Hardcoded Admin
        if (email === "admin@kalvium.com" && password === "12345") {
          Cookies.set("role", "admin");
          Cookies.set("token", "admin-token");
          router.push("/admin");
        } 
        // 2. Check Mock "Database" (LocalStorage)
        else {
          const users = JSON.parse(localStorage.getItem("rip_users") || "[]");
          const foundUser = users.find((u: any) => u.email === email && u.password === password);

          if (foundUser) {
            Cookies.set("role", foundUser.role);
            Cookies.set("token", "secure-session-token");
            router.push("/dashboard");
          } else {
            setError("ACCESS_DENIED: Invalid Credentials");
          }
        }
        setIsLoading(false);
      }
      router.refresh();
    }, 800);
  };

  return (
    <main className="relative flex items-center justify-center min-h-[90vh] bg-[#0F172A] overflow-hidden p-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 md:p-12 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter">
            {isSignup ? "REGISTER" : "SECURE"}<span className="text-rose-500 font-sans not-italic">_</span>
          </h2>
          <p className="text-rose-400 font-bold text-[10px] tracking-[0.3em] uppercase">
            {isSignup ? "Create Protocol Identity" : "Identity Verification"}
          </p>
        </header>

        {/* Google Login Button */}
        {!isSignup && (
          <>
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all mb-6 active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
              Continue with Google
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-slate-700 flex-grow" />
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Or Protocol Key</span>
              <div className="h-px bg-slate-700 flex-grow" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
              <input
                type="text"
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-rose-500 transition-all"
                placeholder="Agent Name"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Network Identifier</label>
            <input
              type="email"
              className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-rose-500 transition-all"
              placeholder="name@rip-portal.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Security Key</label>
            <input
              type="password"
              className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-rose-500 transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-500 text-[10px] font-bold italic">{error}</p>
            </div>
          )}

          <button 
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
          >
            {isLoading ? "Verifying..." : isSignup ? "Initialize Account" : "Verify & Entry"}
          </button>
        </form>

        <footer className="mt-8 text-center space-y-4">
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-[10px] text-slate-400 hover:text-white transition-all uppercase font-black tracking-widest"
          >
            {isSignup ? "Already Registered? Sign In" : "New Agent? Create Profile"}
          </button>
          <p className="text-slate-600 text-[9px] uppercase tracking-widest block">
            Protected by R.I.P. Encryption Suite
          </p>
        </footer>
      </div>
    </main>
  );
}