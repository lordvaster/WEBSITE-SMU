import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";

const navItems = [
  { label: "Ringkasan", href: "/dashboard/siswa" },
  { label: "Jadwal Saya", href: "/dashboard/siswa/jadwal" },
  { label: "Nilai Saya", href: "/dashboard/siswa/nilai" },
];

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "siswa") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} role={session.user.role} userEmail={session.user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
