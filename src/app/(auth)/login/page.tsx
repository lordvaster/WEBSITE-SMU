import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, dashboardPathForRole } from "@/lib/auth";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Login | SMU",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(dashboardPathForRole(session.user.role));
  }

  return (
    <AuthLayout>
      <h2 className="mb-6 text-lg font-semibold text-slate-900">
        Masuk ke akun Anda
      </h2>
      <LoginForm />
    </AuthLayout>
  );
}
