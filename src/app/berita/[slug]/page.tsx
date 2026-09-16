import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { BeritaCard } from "@/components/public/BeritaCard";
import { ShareButtons } from "@/components/public/ShareButtons";
import { db } from "@/lib/db";
import { htmlExcerpt, estimateReadingMinutes } from "@/lib/text";

export const revalidate = 3600;

async function getBerita(slug: string) {
  return db.berita.findFirst({ where: { slug, isPublished: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const berita = await getBerita(slug);
  if (!berita) return { title: "Berita tidak ditemukan | SMU" };

  const excerpt = htmlExcerpt(berita.konten, 160);
  return {
    title: `${berita.judul} | SMU`,
    description: excerpt,
    openGraph: {
      title: berita.judul,
      description: excerpt,
      images: [berita.gambar],
      type: "article",
      publishedTime: berita.publishedAt?.toISOString(),
    },
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const berita = await getBerita(slug);
  if (!berita) notFound();

  const related = await db.berita.findMany({
    where: { isPublished: true, slug: { not: slug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const readingMinutes = estimateReadingMinutes(berita.konten);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/berita" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Berita
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-900">{berita.judul}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
          <span>
            {berita.publishedAt
              ? new Date(berita.publishedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingMinutes} menit baca
          </span>
        </div>

        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-slate-100">
          <Image src={berita.gambar} alt={berita.judul} fill sizes="768px" className="object-cover" priority />
        </div>

        <div
          className="prose prose-slate mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: berita.konten }}
        />

        <div className="mt-8 border-t border-slate-200 pt-6">
          <ShareButtons title={berita.judul} />
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Berita Lainnya</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((b) => (
                <BeritaCard key={b.id} berita={b} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
