import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function OrangTuaDashboardPage() {
  const session = await getServerSession(authOptions);

  const anak = await db.siswa.findMany({
    where: { orang_tua_email: session?.user.email ?? "" },
    include: {
      kelas: { include: { jadwal: { include: { guru: true } } } },
      nilai: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Selamat datang, Orang Tua!</h1>
      <p className="mt-1 text-sm text-slate-500">
        Memantau {anak.length} anak terdaftar
      </p>

      {anak.length === 0 && (
        <p className="mt-6 text-sm text-slate-400">
          Belum ada data anak yang terhubung dengan akun ini.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {anak.map((siswa) => (
          <div key={siswa.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              {siswa.nama} · {siswa.kelas.nama}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Jadwal Pelajaran</h3>
                <div className="mt-2 space-y-2">
                  {siswa.kelas.jadwal.length ? (
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

              <div>
                <h3 className="text-sm font-semibold text-slate-700">Nilai</h3>
                <div className="mt-2 space-y-2">
                  {siswa.nilai.length ? (
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
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Pengumuman</h2>
        <p className="mt-2 text-sm text-slate-400">Belum ada pengumuman terbaru.</p>
      </div>
    </div>
  );
}
