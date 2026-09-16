import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, GraduationCap } from "lucide-react";
import { PublicPageShell } from "@/components/layouts/PublicPageShell";

export const metadata: Metadata = {
  title: "Kontak | SMU",
  description: "Informasi kontak SMU",
};

const cards = [
  {
    icon: MapPin,
    label: "Alamat",
    content: (
      <>
        Jl. Pendidikan Raya No. 123
        <br />
        Kecamatan Contoh, Kota Contoh
        <br />
        Jawa Barat 40123, Indonesia
      </>
    ),
  },
  {
    icon: Phone,
    label: "Telepon / WhatsApp",
    content: <>(021) 1234-5678</>,
  },
  {
    icon: Mail,
    label: "Email",
    content: <>admin@smu.join.co.id</>,
  },
  {
    icon: Clock,
    label: "Jam Operasional",
    content: (
      <>
        Senin&ndash;Jumat: 07.00&ndash;15.00 WIB
        <br />
        Sabtu&ndash;Minggu: Tutup
      </>
    ),
  },
];

export default function KontakPage() {
  return (
    <PublicPageShell>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Kontak Kami</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hubungi kami untuk informasi lebih lanjut mengenai SMU.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-primary-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <c.icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">{c.label}</p>
              <p className="mt-1 text-slate-900">{c.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Pendaftaran Siswa Baru</p>
            <p className="mt-1 text-slate-900">
              Kunjungi halaman{" "}
              <Link href="/registrasi" className="font-medium text-primary-600 hover:underline">
                Registrasi
              </Link>{" "}
              untuk mendaftar sebagai calon siswa.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          *Data kontak pada halaman ini masih berupa data contoh (dummy) dan perlu diganti dengan data resmi sekolah sebelum digunakan secara nyata.
        </p>
      </div>
    </PublicPageShell>
  );
}
