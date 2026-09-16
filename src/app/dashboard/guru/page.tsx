import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getGuruByUserId, getGuruJadwal, getGuruKelas, getSiswaCountByKelas } from "@/lib/queries/guru";
import { Tabs } from "@/components/dashboard/Tabs";
import { JadwalWeekView } from "@/components/dashboard/JadwalWeekView";
import { GuruNilaiEditor } from "@/components/dashboard/GuruNilaiEditor";
import { GuruKelasTab } from "@/components/dashboard/GuruKelasTab";

export default async function GuruDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const guru = await getGuruByUserId(session.user.id);
  if (!guru) {
    return <p className="text-sm text-slate-400">Data guru tidak ditemukan.</p>;
  }

  const [jadwal, kelas] = await Promise.all([getGuruJadwal(guru.id), getGuruKelas(guru.id)]);
  const siswaCounts = await getSiswaCountByKelas(kelas.map((k) => k.id));
  const jumlahSiswa = Array.from(siswaCounts.values()).reduce((a, b) => a + b, 0);
  const kelasWithCount = kelas.map((k) => ({ ...k, jumlahSiswa: siswaCounts.get(k.id) ?? 0 }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Selamat datang, {guru.nama}!</h1>
      <p className="mt-1 text-sm text-slate-500">Mengajar {guru.mata_pelajaran.join(", ") || "-"}</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Kelas Diajar</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{kelas.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total Siswa</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{jumlahSiswa}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Jadwal Mengajar</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{jadwal.length}</p>
        </div>
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              key: "jadwal",
              label: "Jadwal Mengajar",
              content: <JadwalWeekView data={jadwal} secondaryLabel="kelas" />,
            },
            {
              key: "nilai",
              label: "Input Nilai",
              content: (
                <GuruNilaiEditor
                  kelasOptions={kelas.map((k) => ({ id: k.id, nama: k.nama }))}
                  mapelOptions={guru.mata_pelajaran}
                />
              ),
            },
            {
              key: "kelas",
              label: "Kelas Saya",
              content: <GuruKelasTab kelas={kelasWithCount} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
