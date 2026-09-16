import Link from "next/link";
import { PublicNavbar } from "@/components/layouts/PublicNavbar";
import { BeritaCard } from "@/components/public/BeritaCard";
import { db } from "@/lib/db";
import { htmlExcerpt } from "@/lib/text";

export const revalidate = 3600;

const features = [
  {
    title: "Jadwal Terpusat",
    desc: "Lihat jadwal pelajaran seluruh kelas kapan saja, tanpa perlu login.",
  },
  {
    title: "Nilai Real-time",
    desc: "Siswa dan orang tua dapat memantau perkembangan nilai secara langsung.",
  },
  {
    title: "Informasi Terkini",
    desc: "Berita dan galeri prestasi sekolah selalu diperbarui.",
  },
];

export default async function Home() {
  const beritaTerbaru = await db.berita.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
        <span className="rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-600">
          Penerimaan Siswa Baru Dibuka
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Sistem Informasi Akademik <br className="hidden sm:block" /> Sekolah Menengah Umum
        </h1>
        <p className="max-w-2xl text-lg text-slate-500">
          Website resmi SMU untuk siswa, guru, dan orang tua — jadwal, nilai, berita,
          dan pendaftaran calon siswa baru dalam satu tempat.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/registrasi"
            className="rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/jadwal"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Lihat Jadwal
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {beritaTerbaru.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Berita Terbaru</h2>
            <Link href="/berita" className="text-sm font-medium text-blue-500 hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {beritaTerbaru.map((b) => (
              <BeritaCard key={b.id} berita={{ ...b, excerpt: htmlExcerpt(b.konten) }} />
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} SMU. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
