"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Users,
  CalendarDays,
  ClipboardList,
  Newspaper,
  Images,
  Settings,
  LayoutDashboard,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Siswa", href: "/admin/siswa", icon: GraduationCap },
  { label: "Guru", href: "/admin/guru", icon: Users },
  { label: "Jadwal", href: "/admin/jadwal", icon: CalendarDays },
  { label: "Nilai", href: "/admin/nilai", icon: ClipboardList },
  { label: "Registrasi", href: "/admin/registrasi", icon: UserPlus },
  { label: "Berita", href: "/admin/berita", icon: Newspaper },
  { label: "Galeri", href: "/admin/galeri", icon: Images },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              active ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-3 py-6 md:block">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
          S
        </span>
        <span className="text-base font-semibold text-slate-900">SMU Admin</span>
      </div>
      <SidebarNav />
    </aside>
  );
}
