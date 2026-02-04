// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Cookies from "js-cookie";
// import { useEffect, useState } from "react";
// import { ClerkProvider, useUser, useClerk } from "@clerk/nextjs";
// import { Menu, X, ShieldCheck, LogOut, LayoutDashboard, Terminal, Activity, Home as HomeIcon } from "lucide-react"; 
// import "./globals.css";

// function LayoutContent({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [role, setRole] = useState<string | null>(null);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const { user, isLoaded: clerkLoaded } = useUser();
//   const { signOut } = useClerk();

//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [pathname]);

//   useEffect(() => {
//     setMounted(true);
//     const userRole = Cookies.get("role");
//     setIsLoggedIn(!!userRole || !!user);
//     setRole(userRole || (user ? "user" : null));
//   }, [pathname, user, clerkLoaded]);

//   const handleLogout = async () => {
//     try {
//       await fetch("/api/auth/logout", { method: "POST" });
//       Cookies.remove("role");
//       setIsLoggedIn(false);
//       setRole(null);
//       if (user) {
//         await signOut({ redirectUrl: '/' });
//       } else {
//         window.location.href = "/";
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//       window.location.href = "/";
//     }
//   };

//   const NavLinks = () => (
//     <div className="flex flex-col md:flex-row gap-1 md:gap-8">
//       {mounted && !isLoggedIn && (
//         <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 hover:text-rose-500 transition-all group">
//           <HomeIcon size={14} className="text-slate-500 group-hover:text-rose-500" />
//           <span>Home</span>
//         </Link>
//       )}
//       {mounted && isLoggedIn && (
//         <>
//           {role === "admin" ? (
//             <>
//               <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all">
//                 <Terminal size={14} />
//                 <span>Admin Terminal</span>
//               </Link>
//               <Link href="/admin/bookings" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all">
//                 <Activity size={14} />
//                 <span>Bus Management</span>
//               </Link>
//             </>
//           ) : (
//             <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-all">
//               <LayoutDashboard size={14} />
//               <span>User Dashboard</span>
//             </Link>
//           )}
//         </>
//       )}
//     </div>
//   );

//   return (
//     <html lang="en">
//       <body className="bg-[#0F172A] text-slate-200 antialiased selection:bg-rose-500/30 min-h-screen flex flex-col">
//         {/* --- PROFESSIONAL INTEGRATED HEADER --- */}
//         <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex h-16 items-center justify-between">
              
//               {/* Brand Section */}
//               <div className="flex items-center gap-12">
//                 <Link href="/" className="flex items-center gap-2 group">
//                   <span className="text-2xl font-black italic tracking-tighter text-white transition-transform group-hover:scale-105">
//                     R.I.P<span className="text-rose-500">.</span>
//                   </span>
//                 </Link>

//                 {/* Desktop Nav Links */}
//                 <nav className="hidden md:block">
//                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
//                     <NavLinks />
//                   </div>
//                 </nav>
//               </div>

//               {/* Right Side Actions */}
//               <div className="flex items-center gap-4">
//                 <div className="hidden md:flex items-center gap-6">
//                   {!mounted ? (
//                     <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
//                   ) : !isLoggedIn ? (
//                     <Link 
//                       href="/login" 
//                       className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-white text-[10px] font-black text-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-white/5 active:scale-95"
//                     >
//                       Sign Up
//                     </Link>
//                   ) : (
//                     <div className="flex items-center gap-4 border-l border-white/10 pl-6">
//                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-[9px] font-black tracking-widest ${role === 'admin' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}>
//                         <ShieldCheck size={12} />
//                         {role?.toUpperCase()}
//                       </div>
//                       <button 
//                         onClick={handleLogout} 
//                         className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
//                         title="Logout Terminal"
//                       >
//                         <LogOut size={18} />
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Mobile Menu Button */}
//                 <button 
//                   className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
//                   onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 >
//                   {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Mobile Dropdown Overlay */}
//           {isMobileMenuOpen && (
//             <div className="md:hidden border-t border-white/5 bg-[#0F172A] p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
//               <div className="text-[11px] font-black uppercase tracking-[0.2em]">
//                 <NavLinks />
//               </div>
//               <div className="pt-4 border-t border-white/5">
//                 {!isLoggedIn ? (
//                   <Link href="/login" className="flex w-full items-center justify-center py-3 bg-rose-600 rounded-xl text-white font-black uppercase text-xs tracking-widest">
//                     Sign Up
//                   </Link>
//                 ) : (
//                   <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-slate-400 font-black uppercase text-xs tracking-widest hover:text-rose-500 transition-colors">
//                     <LogOut size={14} /> Log Out
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </header>

//         <main className="flex-grow">
//           {children}
//         </main>
//       </body>
//     </html>
//   );
// }

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ClerkProvider>
//       <LayoutContent>{children}</LayoutContent>
//     </ClerkProvider>
//   );
// }

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState, useRef } from "react";
import { ClerkProvider, useUser, useClerk } from "@clerk/nextjs";
import { Menu, X, ShieldCheck, LogOut, LayoutDashboard, Terminal, Activity, Home as HomeIcon } from "lucide-react"; 
import "./globals.css";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null); // Ref to track the header area
  const { user, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerk();

  // 1. Close on Route Change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // 2. Auto-close when clicking anywhere outside the header
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setMounted(true);
    const userRole = Cookies.get("role");
    setIsLoggedIn(!!userRole || !!user);
    setRole(userRole || (user ? "user" : null));
  }, [pathname, user, clerkLoaded]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      Cookies.remove("role");
      setIsLoggedIn(false);
      setRole(null);
      if (user) await signOut({ redirectUrl: '/' });
      else window.location.href = "/";
    } catch (error) {
      window.location.href = "/";
    }
  };

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row gap-1 md:gap-8">
      {mounted && !isLoggedIn && (
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 hover:text-rose-500 transition-all group">
          <HomeIcon size={14} className="text-slate-500 group-hover:text-rose-500" />
          <span>Home</span>
        </Link>
      )}
      {mounted && isLoggedIn && (
        <>
          {role === "admin" ? (
            <>
              <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500/10 text-blue-400 transition-all">
                <Terminal size={14} />
                <span>Admin Terminal</span>
              </Link>
              <Link href="/admin/bookings" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all">
                <Activity size={14} />
                <span>Bus Management</span>
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-all">
              <LayoutDashboard size={14} />
              <span>User Dashboard</span>
            </Link>
          )}
        </>
      )}
    </div>
  );

  return (
    <html lang="en">
      <body className="bg-[#0F172A] text-slate-200 antialiased selection:bg-rose-500/30 min-h-screen flex flex-col">
        
        {/* HEADER with Ref and MouseLeave for Auto-Close */}
        <header 
          ref={headerRef}
          onMouseLeave={() => setIsMobileMenuOpen(false)} // Auto-close on Desktop when mouse leaves
          className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              
              <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-2 group">
                  <span className="text-2xl font-black italic tracking-tighter text-white transition-transform group-hover:scale-105">
                    R.I.P<span className="text-rose-500">.</span>
                  </span>
                </Link>

                <nav className="hidden md:block">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    <NavLinks />
                  </div>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-6">
                  {!mounted ? (
                    <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
                  ) : !isLoggedIn ? (
                    <Link href="/login" className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-white text-[10px] font-black text-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-white/5 active:scale-95">
                      Sign Up
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-[9px] font-black tracking-widest ${role === 'admin' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'}`}>
                        <ShieldCheck size={12} />
                        {role?.toUpperCase()}
                      </div>
                      <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                        <LogOut size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 bg-[#0F172A] p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="text-[11px] font-black uppercase tracking-[0.2em]">
                <NavLinks />
              </div>
              <div className="pt-4 border-t border-white/5">
                {!isLoggedIn ? (
                  <Link href="/login" className="flex w-full items-center justify-center py-3 bg-rose-600 rounded-xl text-white font-black uppercase text-xs tracking-widest">
                    Sign Up
                  </Link>
                ) : (
                  <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 py-3 bg-white/5 rounded-xl text-slate-400 font-black uppercase text-xs tracking-widest hover:text-rose-500 transition-colors">
                    <LogOut size={14} /> Log Out
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <LayoutContent>{children}</LayoutContent>
    </ClerkProvider>
  );
}