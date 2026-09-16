import Link from "next/link";
import { db } from "@/lib/db";

export async function AnnouncementList() {
  const berita = await db.berita.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, judul: true, slug: true, publishedAt: true },
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 print:hidden">
      <h2 className="text-sm font-semibold text-slate-700">Pengumuman Terbaru</h2>
      <div className="mt-3 space-y-2">
        {berita.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada pengumuman terbaru.</p>
        ) : (
          berita.map((b) => (
            <Link
              key={b.id}
              href={`/berita/${b.slug}`}
              className="block rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <span className="font-medium">{b.judul}</span>
              <span className="ml-2 text-xs text-slate-400">
                {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("id-ID") : ""}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
