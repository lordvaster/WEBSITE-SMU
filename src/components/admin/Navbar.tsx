"use client";

import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, Menu, Search, X } from "lucide-react";
import { Sidebar, SidebarNav } from "@/components/admin/Sidebar";

export function AdminNavbar({ userEmail }: { userEmail: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-1 items-center gap-3">
          <button
            className="rounded-md p-2 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Cari data..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notifikasi"
          >
            <Bell className="h-5 w-5" />
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  {userEmail.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate sm:inline">{userEmail}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-30 min-w-[180px] rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
              >
                <div className="px-3 py-2 text-xs text-slate-400">Admin</div>
                <DropdownMenu.Item
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="h-full w-64 bg-white px-3 py-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="text-base font-semibold text-slate-900">SMU Admin</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Tutup menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

export { Sidebar };
