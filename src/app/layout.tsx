"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Ensuring the component is mounted to avoid hydration mismatch
    setMounted(true);

    const token = Cookies.get("token");
    const userRole = Cookies.get("role");

    setIsLoggedIn(!!token);
    setRole(userRole || null);
  }, [pathname]); // Re-check when the user changes pages

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    window.location.href = "/";
  };

  return (
    <html lang="en">
      <body className="bg-[#0F172A] text-slate-200 antialiased selection:bg-rose-500/30 min-h-screen flex flex-col">
        {/* Modern Glassmorphism Navbar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-bold tracking-tighter text-white hover:opacity-80 transition-opacity">
              R.I.P<span className="text-rose-500">.</span>
            </Link>

            <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              <Link href="/" className="hover:text-rose-400 transition-colors">Home</Link>

              {mounted && isLoggedIn && (
                <>
                  {/* Show Admin Terminal only if role is admin */}
                  {role === "admin" ? (
                    <>
                      <Link href="/admin/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Admin Terminal
                      </Link>
                      <Link href="/admin/bookings" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        Bus Management
                      </Link>
                    </>
                  ) : (
                    <Link href="/dashboard" className="hover:text-rose-400 transition-colors">
                      Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!mounted ? (
              <div className="h-10 w-24 bg-slate-800 animate-pulse rounded-lg" />
            ) : !isLoggedIn ? (
              <Link
                href="/login"
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-rose-900/20"
              >
                SIGN IN
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                {/* Visual Role Indicator */}
                <span className={`text-[9px] font-black px-2 py-1 rounded border ${role === 'admin' ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
                  {role?.toUpperCase()}
                </span>

                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}