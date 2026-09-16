import type { Metadata } from "next";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";

export const metadata: Metadata = {
  title: "Kontak | SMU",
  description: "Informasi kontak SMU",
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Kontak Kami</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hubungi kami untuk informasi lebih lanjut mengenai SMU.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Alamat</p>
            <p className="mt-1 text-slate-900">
              Jl. Pendidikan Raya No. 123
              <br />
              Kecamatan Contoh, Kota Contoh
              <br />
              Jawa Barat 40123, Indonesia
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Telepon / WhatsApp</p>
            <p className="mt-1 text-slate-900">(021) 1234-5678</p>
            <p className="mt-3 text-sm font-medium text-slate-500">Email</p>
            <p className="mt-1 text-slate-900">admin@smu.join.co.id</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Jam Operasional</p>
            <p className="mt-1 text-slate-900">
              Senin&ndash;Jumat: 07.00&ndash;15.00 WIB
              <br />
              Sabtu&ndash;Minggu: Tutup
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-medium text-slate-500">Pendaftaran Siswa Baru</p>
            <p className="mt-1 text-slate-900">
              Kunjungi halaman{" "}
              <a href="/registrasi" className="text-blue-500 hover:underline">
                Registrasi
              </a>{" "}
              untuk mendaftar sebagai calon siswa.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          *Data kontak pada halaman ini masih berupa data contoh (dummy) dan perlu diganti dengan data resmi sekolah sebelum digunakan secara nyata.
        </p>
      </div>
    </div>
  );
}
