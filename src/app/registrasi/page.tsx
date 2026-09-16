import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { RegistrasiForm } from "@/components/forms/RegistrasiForm";

export const metadata: Metadata = {
  title: "Registrasi Calon Siswa | SMU",
  description: "Formulir pendaftaran calon siswa baru SMU",
};

export default function RegistrasiPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Registrasi Calon Siswa Baru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Lengkapi formulir di bawah ini untuk mendaftar sebagai calon siswa SMU.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <RegistrasiForm />
        </div>
      </div>
    </div>
  );
}
