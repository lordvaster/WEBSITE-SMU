import type { Metadata } from "next";
import { PublicPageShell } from "@/components/layouts/PublicPageShell";
import { PublicGaleriView } from "@/components/public/PublicGaleriView";
import { db } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Galeri | SMU",
  description: "Galeri foto dan video kegiatan SMU",
};

export default async function GaleriPage() {
  const items = await db.galeri.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Galeri</h1>
        <p className="mt-1 text-sm text-slate-500">Dokumentasi foto dan video kegiatan sekolah</p>

        <div className="mt-6">
          <PublicGaleriView items={items} />
        </div>
      </div>
    </PublicPageShell>
  );
}
