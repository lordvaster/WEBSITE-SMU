import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getSiswaByUserId, getSiswaJadwal, getSiswaNilai } from "@/lib/queries/siswa";
import { Tabs } from "@/components/dashboard/Tabs";
import { JadwalWeekView } from "@/components/dashboard/JadwalWeekView";
import { NilaiSummary } from "@/components/dashboard/NilaiSummary";
import { AnnouncementList } from "@/components/dashboard/AnnouncementList";

export default async function SiswaDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const siswa = await getSiswaByUserId(session.user.id);
  if (!siswa) {
    return <p className="text-sm text-slate-400">Data siswa tidak ditemukan.</p>;
  }

  const [jadwal, nilai] = await Promise.all([
    getSiswaJadwal(siswa.kelasId),
    getSiswaNilai(siswa.id),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Selamat datang, {siswa.nama}!</h1>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
        <span>
          Kelas: <span className="font-medium text-slate-700">{siswa.kelas.nama}</span>
        </span>
        <span>
          NISN: <span className="font-medium text-slate-700">{siswa.nisn}</span>
        </span>
        <span>
          Email: <span className="font-medium text-slate-700">{siswa.user.email}</span>
        </span>
      </div>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              key: "jadwal",
              label: "Jadwal Pelajaran",
              content: <JadwalWeekView data={jadwal} secondaryLabel="guru" />,
            },
            {
              key: "nilai",
              label: "Nilai",
              content: <NilaiSummary data={nilai} />,
            },
          ]}
        />
      </div>

      <div className="mt-6">
        <AnnouncementList />
      </div>
    </div>
  );
}
