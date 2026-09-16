import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [siswaCount, guruCount, kelasCount, jadwalCount] = await Promise.all([
    db.siswa.count(),
    db.guru.count(),
    db.kelas.count(),
    db.jadwal.count(),
  ]);

  const stats = [
    { label: "Total Siswa", value: siswaCount, href: "/admin/siswa" },
    { label: "Total Guru", value: guruCount, href: "/admin/guru" },
    { label: "Total Kelas", value: kelasCount, href: "/admin/jadwal" },
    { label: "Jadwal Pelajaran", value: jadwalCount, href: "/admin/jadwal" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Selamat datang, Admin!</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ringkasan data sekolah saat ini.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Tautan Cepat</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/admin/siswa" className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
            Kelola Siswa
          </Link>
          <Link href="/admin/guru" className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
            Kelola Guru
          </Link>
          <Link href="/admin/jadwal" className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
            Kelola Jadwal
          </Link>
        </div>
      </div>
    </div>
  );
}
