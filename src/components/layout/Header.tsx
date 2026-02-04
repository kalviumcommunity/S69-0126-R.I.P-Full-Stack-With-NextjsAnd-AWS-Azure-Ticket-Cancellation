"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Protected routes where user is logged in
  const protectedRoutes = ["/dashboard", "/admin", "/bookings", "/users"];
  const isLoggedIn = protectedRoutes.some(route => pathname.startsWith(route));

  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-semibold text-lg">MyApp</h1>
      <nav className="flex gap-4">
        {!isLoggedIn && <Link href="/">Home</Link>}
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/profile">Profile</Link>
      </nav>
    </header>
  );
}
