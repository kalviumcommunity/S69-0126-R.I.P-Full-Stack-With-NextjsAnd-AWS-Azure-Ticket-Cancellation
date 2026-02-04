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
import { SignInButton } from "@clerk/nextjs";

// Helper component for password requirements
const Requirement = ({ label, met }: { label: string; met: boolean }) => (
  <div className={`flex items-center gap-2 ${met ? "text-emerald-400" : "text-slate-500"}`}>
    <div className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold ${met ? "bg-emerald-500 text-black" : "bg-slate-700 border border-slate-600"}`}>
      {met && "✓"}
    </div>
    <span>{label}</span>
  </div>
);

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();



  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      if (isSignup) {
        if (step === 1) {
          // Validate password before sending OTP
          const p = password;
          if (p.length < 8 || !/[A-Z]/.test(p) || !/[a-z]/.test(p) || !/[0-9]/.test(p) || !/[^A-Za-z0-9]/.test(p)) {
            setError("Password validation failed. Please check requirements.");
            setIsLoading(false);
            return;
          }

          // Step 1: Send OTP
          const response = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
          });

          let data;
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch (err) {
            console.error("Failed to parse response:", text);
            setError("Server returned an error (HTML). Check console.");
            setIsLoading(false);
            return;
          }

          if (!response.ok) {
            setError(data.error || "Failed to send OTP");
            setIsLoading(false);
            return;
          }

          setStep(2);
          setSuccessMessage("OTP sent to your email!");
          setIsLoading(false);
          return;
        }

        // Step 2: Verify OTP and Signup
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            name,
            otp,
            ...(phone && { age: parseInt(phone) })
          }),
        });

        let data;
        const responseText = await response.text();

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          setError("Server error: Invalid response.");
          setIsLoading(false);
          return;
        }

        if (response.ok) {
          setSuccessMessage("✓ Account created successfully! Redirecting to login...");
          setTimeout(() => {
            setIsSignup(false);
            setStep(1);
            setOtp("");
            setEmail("");
            setPassword("");
            setName("");
            setPhone("");
            setSuccessMessage("");
          }, 2000);
        } else {
          if (data.fieldErrors && typeof data.fieldErrors === 'object' && Object.keys(data.fieldErrors).length > 0) {
            const firstError = Object.values(data.fieldErrors)[0];
            setError(firstError as string || data.error || "Signup failed");
          } else {
            setError(data.error || "Signup failed");
          }
        }
      } else {
        // Call login API
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const responseText = await response.text();
        let data;
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          setError("Server error: Invalid response");
          setIsLoading(false);
          return;
        }

        if (response.ok) {
          router.push(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
          router.refresh();
        } else {
          setError(data.error || "Login failed");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

        {/* Google Login Button - Show in BOTH login and register modes */}
        {/* Google Login Button - Show in BOTH login and register modes */}
        <SignInButton
          mode="modal"
          forceRedirectUrl="/dashboard"
          signUpForceRedirectUrl="/dashboard"
        >
          <button
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all mb-6 active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>
        </SignInButton>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-slate-700 flex-grow" />
          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Or Protocol Key</span>
          <div className="h-px bg-slate-700 flex-grow" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && step === 2 ? (
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">
                Verification Code
              </label>
              <input
                type="text"
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-rose-500 transition-all text-center tracking-[0.5em] font-mono text-xl"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <p className="text-center text-[10px] text-slate-400">Sent to {email}</p>
            </div>
          ) : (
            <>
              {isSignup && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white outline-none focus:border-rose-500 transition-all"
                    placeholder="Agent Name"
                    value={name}
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
                  value={email}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Password Strength Checklist - Only for Signup */}
              {isSignup && password && (
                <div className="bg-slate-900/50 rounded-lg p-3 text-[10px] space-y-1 border border-slate-700/50 ml-1">
                  <p className="font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password Requirements</p>
                  <Requirement label="At least 8 characters" met={password.length >= 8} />
                  <Requirement label="One uppercase letter" met={/[A-Z]/.test(password)} />
                  <Requirement label="One lowercase letter" met={/[a-z]/.test(password)} />
                  <Requirement label="One number" met={/[0-9]/.test(password)} />
                  <Requirement label="One special character" met={/[^A-Za-z0-9]/.test(password)} />
                </div>
              )}
            </>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center">
              <p className="text-emerald-300 text-sm font-semibold">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-500 text-[10px] font-bold italic">{error}</p>
            </div>
          )}

          <button
            disabled={isLoading || (isSignup && (() => {
              if (!password) return false; // Allow empty initially (HTML required catches it)
              return password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password);
            })())}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white py-4 rounded-2xl font-bold uppercase text-sm tracking-[0.2em] transition-all shadow-lg shadow-rose-900/20 active:scale-[0.98]"
          >
            {isLoading ? "Processing..." : isSignup ? (step === 2 ? "Verify & Create Account" : "Send Verification Code") : "Verify & Entry"}
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
      <div id="clerk-captcha" />
    </main>
  );
}