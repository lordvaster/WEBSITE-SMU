import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";

const navItems = [
  { label: "Ringkasan", href: "/dashboard/guru" },
  { label: "Jadwal Mengajar", href: "/dashboard/guru/jadwal" },
  { label: "Input Nilai", href: "/dashboard/guru/nilai" },
];

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "guru") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} role={session.user.role} userEmail={session.user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
