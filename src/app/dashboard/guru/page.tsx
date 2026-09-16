import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function GuruDashboardPage() {
  const session = await getServerSession(authOptions);

  const guru = await db.guru.findUnique({
    where: { userId: session?.user.id },
    include: {
      jadwal: { include: { kelas: true }, orderBy: { hari: "asc" } },
      kelas_wali: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Selamat datang, {guru?.nama ?? "Guru"}!
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Mengajar {guru?.mata_pelajaran.join(", ") || "-"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Kelas Diajar</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {new Set(guru?.jadwal.map((j) => j.kelasId)).size ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Jadwal Minggu Ini</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {guru?.jadwal.length ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Jadwal Mengajar</h2>
        <div className="mt-3 space-y-2">
          {guru?.jadwal.length ? (
            guru.jadwal.map((j) => (
              <div key={j.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span>
                  {j.hari}, {j.jam_mulai}–{j.jam_selesai} · {j.mapel}
                </span>
                <span className="text-slate-500">{j.kelas.nama}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Belum ada jadwal.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/dashboard/guru/nilai"
          className="inline-block rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          Input Nilai Siswa
        </Link>
      </div>
    </div>
  );
}
