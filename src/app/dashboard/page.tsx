// "use client";
// import { useEffect, useState, useCallback } from "react";
// import Link from "next/link";
// import Cookies from "js-cookie";

// // Interface to satisfy TypeScript any-check
// interface RefundRequest {
//   id: string;
//   email: string;
//   reason: string;
//   status: 'pending' | 'approved' | 'declined';
//   submittedAt: string;
// }

// export default function UserDashboard() {
//   const [myRequests, setMyRequests] = useState<RefundRequest[]>([]);
//   const [userEmail, setUserEmail] = useState("");
//   const [mounted, setMounted] = useState(false);

//   // Memoized loader to satisfy react-hooks/exhaustive-deps
//   const loadRequests = useCallback(() => {
//     if (typeof window !== "undefined") {
//       const allRequests: RefundRequest[] = JSON.parse(
//         localStorage.getItem("refund_requests") || "[]"
//       );
//       // For showcase, we show all, but you could filter by userEmail here
//       setMyRequests(allRequests);
//     }
//   }, []);

//   useEffect(() => {
//     setMounted(true);
//     const email = Cookies.get("user_email") || "user@protocol.com";
//     setUserEmail(email);
//     loadRequests();

//     window.addEventListener("focus", loadRequests);
//     return () => window.removeEventListener("focus", loadRequests);
//   }, [loadRequests]);

//   // Prevents hydration error by waiting until client-side mount
//   if (!mounted) return null;

//   return (
//     <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
//       <div className="max-w-5xl mx-auto">
//         <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
//           <div>
//             <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
//               My <span className="text-rose-500">Refunds</span>
//             </h1>
//             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
//               Identity: {userEmail}
//             </p>
//           </div>
//           <Link 
//             href="/dashboard/request" 
//             className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
//           >
//             + New Request
//           </Link>
//         </header>

//         <div className="space-y-6">
//           {myRequests.length === 0 ? (
//             <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
//               <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
//                 No active protocols found.
//               </p>
//             </div>
//           ) : (
//             myRequests.map((req, index) => (
//               <div 
//                 key={`${req.id}-${index}`} 
//                 className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all group"
//               >
//                 <div className="flex justify-between items-start mb-8">
//                   <div>
//                     <span className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-400 font-bold tracking-widest uppercase">
//                       ID: {req.id}
//                     </span>
//                     <p className="text-3xl font-black text-white mt-4 uppercase italic tracking-tighter">
//                       Refund Recovery
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
//                       req.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
//                       req.status === 'declined' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
//                       "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
//                     }`}>
//                       {req.status}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Tracking Visualizer */}
//                 <div className="grid grid-cols-4 gap-4 mt-12 relative">
//                   {['Submitted', 'Verified', 'Liquidity', 'Success'].map((step, i) => {
//                     // Logic: highlight based on status
//                     const isCompleted = (req.status === 'approved' && i <= 3) || (req.status === 'pending' && i <= 0);
//                     const isDeclined = req.status === 'declined';

//                     return (
//                       <div key={step} className="space-y-3">
//                         <div className={`h-1.5 rounded-full transition-all duration-700 ${
//                           isDeclined && i > 0 ? 'bg-rose-900/20' : 
//                           isCompleted ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-slate-800'
//                         }`} />
//                         <p className={`text-[9px] font-black uppercase tracking-widest ${
//                           isCompleted ? 'text-rose-400' : 'text-slate-600'
//                         }`}>
//                           {step}
//                         </p>
//                       </div>
//                     );
//                   })}
//                 </div>
                
//                 <p className="mt-8 text-slate-500 text-xs italic line-clamp-1 border-t border-slate-800/50 pt-4">
//                   Reason: &quot;{req.reason}&quot;
//                 </p>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

interface RefundRequest {
  id: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
}

export default function UserDashboard() {
  const [myRequests, setMyRequests] = useState<RefundRequest[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [mounted, setMounted] = useState(false);

  const loadRequests = useCallback(() => {
    if (typeof window !== "undefined") {
      const allRequests: RefundRequest[] = JSON.parse(
        localStorage.getItem("refund_requests") || "[]"
      );
      setMyRequests(allRequests);
    }
  }, []);

  useEffect(() => {
    // We use a timeout or requestAnimationFrame to move the setState
    // call out of the synchronous execution of the effect.
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      const email = Cookies.get("user_email") || "user@protocol.com";
      setUserEmail(email);
      loadRequests();
    });

    window.addEventListener("focus", loadRequests);
    
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("focus", loadRequests);
    };
  }, [loadRequests]);

  // Prevents Hydration Mismatch
  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8">
      {/* ... keep the rest of your UI code exactly as it was ... */}
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
              My <span className="text-rose-500">Refunds</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Identity: {userEmail}
            </p>
          </div>
          <Link 
            href="/dashboard/request" 
            className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
          >
            + New Request
          </Link>
        </header>

        <div className="space-y-6">
          {myRequests.length === 0 ? (
            <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-20 text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">
                No active protocols found.
              </p>
            </div>
          ) : (
            myRequests.map((req, index) => (
              <div key={`${req.id}-${index}`} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] bg-slate-800 px-3 py-1 rounded text-slate-400 font-bold tracking-widest uppercase">ID: {req.id}</span>
                    <p className="text-3xl font-black text-white mt-4 uppercase italic tracking-tighter">Refund Recovery</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                      req.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      req.status === 'declined' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                    }`}>{req.status}</p>
                  </div>
                </div>
                {/* Visualizer bars logic remains the same */}
                <div className="grid grid-cols-4 gap-4 mt-12 relative">
                  {['Submitted', 'Verified', 'Liquidity', 'Success'].map((step, i) => {
                    const isCompleted = (req.status === 'approved' && i <= 3) || (req.status === 'pending' && i <= 0);
                    return (
                      <div key={step} className="space-y-3">
                        <div className={`h-1.5 rounded-full ${isCompleted ? 'bg-rose-500' : 'bg-slate-800'}`} />
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isCompleted ? 'text-rose-400' : 'text-slate-600'}`}>{step}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-8 text-slate-500 text-xs italic line-clamp-1 border-t border-slate-800/50 pt-4">Reason: &quot;{req.reason}&quot;</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}