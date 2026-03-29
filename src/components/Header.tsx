"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/live", label: "Live" },
  ];

  async function handleStartTest() {
    setStarting(true);
    try {
      await fetch("/api/start-test", { method: "POST" });
      router.push("/live");
    } catch (err) {
      console.error("Failed to start test:", err);
    } finally {
      setStarting(false);
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200/15 shadow-sm">
      <div className="flex items-center gap-12">
        <Link href="/">
          <span className="text-2xl font-bold tracking-tighter text-slate-800">
            Banshee
          </span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center h-full">
          {navItems.map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "font-headline text-sm font-bold tracking-tight text-slate-900 border-b-2 border-slate-800 pb-1"
                    : "font-headline text-sm font-medium tracking-tight text-slate-500 hover:text-slate-800 transition-colors"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleStartTest}
          disabled={starting}
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-lg text-sm font-semibold tracking-tight shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {starting ? "Starting..." : "Start Test"}
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs font-bold">
          U
        </div>
      </div>
    </header>
  );
}
