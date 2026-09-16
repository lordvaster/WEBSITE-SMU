import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";

const navItems = [{ label: "Dashboard", href: "/dashboard/orang-tua" }];

export default async function OrangTuaLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "orang_tua") {
    redirect("/login");
  }

  return (
    <DashboardShell navItems={navItems} role={session.user.role} userEmail={session.user.email ?? ""}>
      {children}
    </DashboardShell>
  );
}
