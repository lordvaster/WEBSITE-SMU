import type { Metadata } from "next";
import Link from "next/link";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { BeritaCard } from "@/components/public/BeritaCard";
import { db } from "@/lib/db";
import { htmlExcerpt } from "@/lib/text";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Berita & Artikel | SMU",
  description: "Berita dan artikel terbaru dari SMU",
};

const PAGE_SIZE = 10;

export default async function BeritaListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageParam, search } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where = {
    isPublished: true,
    ...(search ? { judul: { contains: search, mode: "insensitive" as const } } : {}),
  };

  const [items, total] = await Promise.all([
    db.berita.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.berita.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Berita & Artikel</h1>
        <p className="mt-1 text-sm text-slate-500">Informasi dan kegiatan terbaru dari SMU</p>

        <form className="mt-6 max-w-sm">
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari judul berita..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </form>

        {items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-400">Belum ada berita.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((b) => (
              <BeritaCard
                key={b.id}
                berita={{ ...b, excerpt: htmlExcerpt(b.konten) }}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/berita?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  p === page ? "bg-blue-500 text-white" : "border border-slate-300 text-slate-600 hover:bg-white"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
