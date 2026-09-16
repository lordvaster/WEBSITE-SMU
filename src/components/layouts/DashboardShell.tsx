"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string };

const roleLabel: Record<string, string> = {
  admin: "Admin",
  guru: "Guru",
  siswa: "Siswa",
  orang_tua: "Orang Tua",
};

export function DashboardShell({
  children,
  navItems,
  role,
  userEmail,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  role: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-blue-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-lg font-semibold text-slate-900">SMU</span>
          <span className="hidden rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 sm:inline">
            {roleLabel[role] ?? role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{userEmail}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-6 md:block">
          {sidebarContent}
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-10 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)}>
            <aside
              className="h-full w-60 bg-white px-3 py-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </aside>
          </div>
        )}

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
