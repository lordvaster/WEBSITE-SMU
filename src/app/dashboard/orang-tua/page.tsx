import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getAnakByOrangTuaEmail } from "@/lib/queries/orangtua";
import { getSiswaJadwal, getSiswaNilai } from "@/lib/queries/siswa";
import { OrangTuaChildView } from "@/components/dashboard/OrangTuaChildView";
import { AnnouncementList } from "@/components/dashboard/AnnouncementList";

export default async function OrangTuaDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const anak = await getAnakByOrangTuaEmail(session.user.email ?? "");

  const children = await Promise.all(
    anak.map(async (siswa) => {
      const [jadwal, nilai] = await Promise.all([
        getSiswaJadwal(siswa.kelasId),
        getSiswaNilai(siswa.id),
      ]);
      return { siswa, jadwal, nilai };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Selamat datang, Orang Tua!</h1>
      <p className="mt-1 text-sm text-slate-500">Memantau {children.length} anak terdaftar</p>

      <div className="mt-6">
        <OrangTuaChildView data={children} />
      </div>

      <div className="mt-6">
        <AnnouncementList />
      </div>
    </div>
  );
}
