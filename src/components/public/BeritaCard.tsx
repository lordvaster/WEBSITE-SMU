import Image from "next/image";
import Link from "next/link";

export type BeritaCardData = {
  slug: string;
  judul: string;
  gambar: string;
  publishedAt: Date | string | null;
  excerpt?: string;
};

export function BeritaCard({ berita }: { berita: BeritaCardData }) {
  return (
    <Link
      href={`/berita/${berita.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <Image
          src={berita.gambar}
          alt={berita.judul}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-400">
          {berita.publishedAt
            ? new Date(berita.publishedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : ""}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900 group-hover:text-primary-600">
          {berita.judul}
        </h3>
        {berita.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{berita.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
