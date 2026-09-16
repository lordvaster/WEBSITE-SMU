import type { Metadata } from "next";
import { PublicPageShell } from "@/components/layouts/PublicPageShell";
import { JadwalTable } from "@/components/JadwalTable";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Jadwal Pelajaran | SMU",
};

export default async function JadwalPage() {
  const [kelasList, guruList] = await Promise.all([
    db.kelas.findMany({ select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
    db.guru.findMany({ select: { id: true, nama: true }, orderBy: { nama: "asc" } }),
  ]);

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Jadwal Pelajaran</h1>
        <p className="mt-1 text-sm text-slate-500">
          Jadwal pelajaran seluruh kelas, dapat difilter berdasarkan kelas, guru, dan hari.
        </p>

        <div className="mt-6">
          <JadwalTable kelasOptions={kelasList} guruOptions={guruList} />
        </div>
      </div>
    </PublicPageShell>
  );
}
