import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SiswaDashboardPage() {
  const session = await getServerSession(authOptions);

  const siswa = await db.siswa.findUnique({
    where: { userId: session?.user.id },
    include: {
      kelas: { include: { jadwal: { include: { guru: true } } } },
      nilai: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Selamat datang, {siswa?.nama ?? "Siswa"}!
      </h1>
      <p className="mt-1 text-sm text-slate-500">Kelas {siswa?.kelas.nama ?? "-"}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-700">Jadwal Pelajaran</h2>
          <div className="mt-3 space-y-2">
            {siswa?.kelas.jadwal.length ? (
              siswa.kelas.jadwal.map((j) => (
                <div key={j.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>
                    {j.hari}, {j.jam_mulai}–{j.jam_selesai} · {j.mapel}
                  </span>
                  <span className="text-slate-500">{j.guru.nama}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Belum ada jadwal.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-700">Nilai Saya</h2>
          <div className="mt-3 space-y-2">
            {siswa?.nilai.length ? (
              siswa.nilai.map((n) => (
                <div key={n.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>
                    {n.mapel} (Semester {n.semester})
                  </span>
                  <span className="font-medium text-slate-700">
                    {n.nilai_akhir ?? n.nilai_harian}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Belum ada nilai.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Pengumuman</h2>
        <p className="mt-2 text-sm text-slate-400">Belum ada pengumuman terbaru.</p>
      </div>
    </div>
  );
}
