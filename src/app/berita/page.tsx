import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Search } from "lucide-react";
import { PublicPageShell } from "@/components/layouts/PublicPageShell";
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
    <PublicPageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Berita & Artikel</h1>
        <p className="mt-1 text-sm text-slate-500">Informasi dan kegiatan terbaru dari SMU</p>

        <form className="relative mt-6 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari judul berita..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </form>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Newspaper className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">
              {search ? `Tidak ada berita yang cocok dengan "${search}"` : "Belum ada berita."}
            </p>
            {search && (
              <Link href="/berita" className="mt-2 text-sm font-medium text-primary-600 hover:underline">
                Reset pencarian
              </Link>
            )}
          </div>
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
                  p === page ? "bg-primary-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-white"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPageShell>
  );
}
