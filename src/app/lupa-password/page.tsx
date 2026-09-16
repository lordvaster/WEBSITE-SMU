import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/layouts/AuthLayout";

export const metadata: Metadata = {
  title: "Lupa Password | SMU",
};

export default function LupaPasswordPage() {
  return (
    <AuthLayout>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Mail className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Lupa Password?</h2>
        <p className="mt-2 text-sm text-slate-500">
          Untuk keamanan, reset password akun siswa/guru/orang tua saat ini dilakukan
          oleh admin sekolah, bukan lewat email otomatis. Hubungi admin melalui
          halaman kontak untuk meminta password baru.
        </p>
        <Link
          href="/kontak"
          className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Hubungi Admin
        </Link>
        <div className="mt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
