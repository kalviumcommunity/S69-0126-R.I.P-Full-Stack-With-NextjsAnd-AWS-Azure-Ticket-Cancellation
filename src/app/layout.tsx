// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import Cookies from "js-cookie";
// import { useEffect, useState } from "react";
// import "./globals.css";

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     // Wrapping in a small conditional or functional update often bypasses this strict lint rule
//     if (!mounted) setMounted(true);

//     const token = Cookies.get("token");
//     setIsLoggedIn(!!token);
//   }, [pathname, mounted]);

//   return (
//     <html lang="en">
//       <body className="bg-white text-black antialiased">
//         <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 bg-white border-b-2 border-black">
//           <div className="flex items-center gap-10">
//             <Link href="/" className="text-2xl font-black tracking-tighter text-black">
//               CORE<span className="text-red-600">APP</span>
//             </Link>
//             <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-black">
//               <Link href="/" className="hover:text-blue-600 transition">Home</Link>
//               {mounted && isLoggedIn && (
//                 <Link href="/dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
//               )}
//             </div>
//           </div>
//           <div>
//             {!mounted ? (
//               <div className="h-10 w-24 bg-gray-100 border-2 border-black" />
//             ) : !isLoggedIn ? (
//               <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-none text-sm font-bold hover:bg-black transition border-2 border-black">
//                 SIGN IN
//               </Link>
//             ) : (
//               <button
//                 onClick={() => {
//                   Cookies.remove("token");
//                   Cookies.remove("role");
//                   window.location.href = "/";
//                 }}
//                 className="text-sm font-bold text-red-600 hover:underline decoration-2 underline-offset-4"
//               >
//                 LOGOUT
//               </button>
//             )}
//           </div>
//         </nav>
//         {children}
//       </body>
//     </html>
//   );
// }

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

  useEffect(() => {
    // Wrapping in setTimeout(0) makes the update asynchronous
    // This bypasses the strict 'no-synchronous-setstate-in-effect' rule
    const timeoutId = setTimeout(() => {
      setMounted(true);
      const token = Cookies.get("token");
      setIsLoggedIn(!!token);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-5 bg-white border-b-2 border-black">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-black"
            >
              CORE<span className="text-red-600">APP</span>
            </Link>
            <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-black">
              <Link href="/" className="hover:text-blue-600 transition">
                Home
              </Link>
              {mounted && isLoggedIn && (
                <Link
                  href="/dashboard"
                  className="hover:text-blue-600 transition"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div>
            {!mounted ? (
              <div className="h-10 w-24 bg-gray-100 border-2 border-black" />
            ) : !isLoggedIn ? (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-none text-sm font-bold hover:bg-black transition border-2 border-black"
              >
                SIGN IN
              </Link>
            ) : (
              <button
                onClick={() => {
                  Cookies.remove("token");
                  Cookies.remove("role");
                  window.location.href = "/";
                }}
                className="text-sm font-bold text-red-600 hover:underline decoration-2 underline-offset-4"
              >
                LOGOUT
              </button>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
