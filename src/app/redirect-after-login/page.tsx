import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, dashboardPathForRole } from "@/lib/auth";

export default async function RedirectAfterLogin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  redirect(dashboardPathForRole(session.user.role));
}
