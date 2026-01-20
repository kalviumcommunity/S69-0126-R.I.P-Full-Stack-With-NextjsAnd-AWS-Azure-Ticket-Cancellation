// "use client";
// import Cookies from "js-cookie";
// import { useEffect, useState } from "react";

// export default function Dashboard() {
//   const [role, setRole] = useState<string | null>(null);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     // functional update to avoid the "synchronous" lint error
//     setMounted((prev) => (prev === false ? true : prev));

//     const userRole = Cookies.get("role") || "user";
//     setRole(userRole);
//   }, []);

//   if (!mounted || !role) {
//     return (
//       <div className="bg-black min-h-screen flex items-center justify-center">
//         <p className="text-white font-black animate-pulse uppercase tracking-widest">Initialising Secure Stream...</p>
//       </div>
//     );
//   }

//   const isAdmin = role === "admin";

//   return (
//     <main className="min-h-screen bg-black p-6 md:p-12">
//       <div className="max-w-5xl mx-auto">
//         <header className={`flex justify-between items-center mb-10 border-b-4 pb-6 ${isAdmin ? "border-blue-600" : "border-red-600"}`}>
//           <div>
//             <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
//               {isAdmin ? "MASTER_VIEW" : "USER_TICKET"}
//             </h1>
//             <p className={`font-black uppercase text-xs tracking-[0.4em] ${isAdmin ? "text-blue-500" : "text-red-600"}`}>
//               {isAdmin ? "Global Recovery Oversight" : "Single Entry Tracking"}
//             </p>
//           </div>
//         </header>

//         <div className="border-[6px] border-white bg-black shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)]">
//           <div className="bg-white p-6 flex flex-col md:flex-row justify-between items-center border-b-[6px] border-black">
//             <div className="text-black">
//               <span className="text-xs font-black uppercase opacity-50 block leading-none">Record Reference</span>
//               <h2 className="text-3xl font-black uppercase tracking-tighter italic">TK-00226-RIP</h2>
//             </div>
//             <div className={`mt-4 md:mt-0 px-6 py-2 border-4 border-black font-black uppercase italic ${isAdmin ? "bg-blue-600 text-white" : "bg-red-600 text-white animate-pulse"}`}>
//               {isAdmin ? "SYSTEM_SYNCED" : "CANCELLATION_PENDING"}
//             </div>
//           </div>
//           <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-white">
//              {/* Journey Details */}
//              <div className="space-y-4">
//                 <p className="text-4xl font-black">SBC ❯❯❯ HYB</p>
//                 <p className="text-gray-400 font-bold uppercase">Refund Status: Processing</p>
//              </div>
//              {/* Refund Value */}
//              <div className="bg-white p-6 border-4 border-red-600 shadow-[8px_8px_0px_0px_red]">
//                 <p className="text-black text-xs font-black uppercase">Refund Value</p>
//                 <p className="text-6xl font-black text-black">₹3,840</p>
//              </div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

"use client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Asynchronous wrapper to satisfy strict ESLint rules
    const timeoutId = setTimeout(() => {
      setMounted(true);
      const userRole = Cookies.get("role") || "user";
      setRole(userRole);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!mounted || !role) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <p className="text-white font-black animate-pulse uppercase tracking-widest">
          Initialising Secure Stream...
        </p>
      </div>
    );
  }

  const isAdmin = role === "admin";

  return (
    <main className="min-h-screen bg-black p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header
          className={`flex justify-between items-center mb-10 border-b-4 pb-6 ${isAdmin ? "border-blue-600" : "border-red-600"}`}
        >
          <div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
              {isAdmin ? "MASTER_VIEW" : "USER_TICKET"}
            </h1>
            <p
              className={`font-black uppercase text-xs tracking-[0.4em] ${isAdmin ? "text-blue-500" : "text-red-600"}`}
            >
              {isAdmin ? "Global Recovery Oversight" : "Single Entry Tracking"}
            </p>
          </div>
        </header>

        <div className="border-[6px] border-white bg-black shadow-[20px_20px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="bg-white p-6 flex flex-col md:flex-row justify-between items-center border-b-[6px] border-black text-black">
            <div className="text-black">
              <span className="text-xs font-black uppercase opacity-50 block leading-none">
                Record Reference
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                TK-00226-RIP
              </h2>
            </div>
            <div
              className={`mt-4 md:mt-0 px-6 py-2 border-4 border-black font-black uppercase italic ${isAdmin ? "bg-blue-600 text-white" : "bg-red-600 text-white"}`}
            >
              {isAdmin ? "SYSTEM_SYNCED" : "CANCELLATION_PENDING"}
            </div>
          </div>
          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <p className="text-white text-4xl font-black">SBC ❯❯❯ HYB</p>
              <p className="text-gray-400 font-bold uppercase">
                Refund Status: Processing
              </p>
            </div>
            <div className="bg-white p-8 border-4 border-red-600 shadow-[8px_8px_0px_0px_red]">
              <p className="text-black text-xs font-black uppercase">
                Refund Value
              </p>
              <p className="text-6xl font-black text-black italic">₹3,840</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
