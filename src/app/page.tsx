import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, LineChart, Newspaper, Sparkles, Quote } from "lucide-react";
import { PublicPageShell } from "@/components/layouts/PublicPageShell";
import { BeritaCard } from "@/components/public/BeritaCard";
import { db } from "@/lib/db";
import { htmlExcerpt } from "@/lib/text";

export const revalidate = 3600;

const features = [
  {
    icon: CalendarDays,
    title: "Jadwal Terpusat",
    desc: "Lihat jadwal pelajaran seluruh kelas kapan saja, dari perangkat apa saja, tanpa perlu login.",
  },
  {
    icon: LineChart,
    title: "Nilai Real-time",
    desc: "Siswa dan orang tua memantau perkembangan nilai per semester lengkap dengan grafik tren, bukan cuma angka.",
  },
  {
    icon: Newspaper,
    title: "Informasi Terkini",
    desc: "Berita kegiatan dan galeri prestasi sekolah selalu diperbarui, bisa dibagikan langsung ke media sosial.",
  },
];

const stats = [
  { value: "1.200+", label: "Siswa Aktif" },
  { value: "80+", label: "Tenaga Pengajar" },
  { value: "99.5%", label: "Uptime Sistem" },
];

const testimonials = [
  {
    quote:
      "Sekarang saya bisa pantau nilai dan jadwal anak saya kapan saja tanpa harus datang ke sekolah.",
    name: "Orang Tua Siswa",
    role: "Wali Kelas 11 IPA",
  },
  {
    quote:
      "Input nilai jadi jauh lebih cepat, apalagi dengan fitur impor Excel untuk satu kelas sekaligus.",
    name: "Guru Mata Pelajaran",
    role: "Guru Matematika",
  },
];

export default async function Home() {
  const beritaTerbaru = await db.berita.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
  const [featured, ...restBerita] = beritaTerbaru;

  return (
    <PublicPageShell>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.12),transparent_40%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-24 text-center sm:py-28">
          <span className="animate-fade-in-up inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Penerimaan Siswa Baru Dibuka
          </span>
          <h1 className="animate-fade-in-up animate-delay-100 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Solusi Terpadu untuk Semua Kebutuhan Akademik
          </h1>
          <p className="animate-fade-in-up animate-delay-200 max-w-2xl text-lg text-primary-50/90">
            Website resmi SMU untuk siswa, guru, dan orang tua — jadwal, nilai, berita,
            dan pendaftaran calon siswa baru dalam satu tempat.
          </p>
          <div className="animate-fade-in-up animate-delay-300 flex flex-wrap justify-center gap-3">
            <Link
              href="/registrasi"
              className="group flex min-h-[48px] items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-900/20 transition hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-xl"
            >
              Daftar Sekarang
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/jadwal"
              className="flex min-h-[48px] items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <CalendarDays className="h-4 w-4" />
              Lihat Jadwal
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-primary-700 sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">*Angka bersifat ilustratif (data contoh).</p>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Kenapa memilih platform ini?</h2>
            <p className="mt-2 text-slate-500">
              Semua kebutuhan akademik sekolah, dari jadwal sampai nilai, tersedia dalam satu sistem.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Dipercaya oleh Warga Sekolah
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <Quote className="h-6 w-6 text-primary-300" />
                <p className="mt-3 text-slate-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">*Testimoni bersifat contoh (dummy) untuk keperluan demo.</p>
        </div>
      </section>

      {/* Berita */}
      {beritaTerbaru.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Berita Terbaru</h2>
                <p className="mt-1 text-slate-500">Kegiatan dan pencapaian terbaru dari sekolah.</p>
              </div>
              <Link
                href="/berita"
                className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary-600 hover:underline sm:flex"
              >
                Lihat semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {featured && (
                <Link
                  href={`/berita/${featured.slug}`}
                  className="group relative col-span-1 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg lg:col-span-2 lg:flex-row"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 lg:aspect-auto lg:w-1/2">
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <Image
                      src={featured.gambar}
                      alt={featured.judul}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <span className="w-fit rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-600">
                      Berita Utama
                    </span>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-primary-600">
                      {featured.judul}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {htmlExcerpt(featured.konten)}
                    </p>
                    <span className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary-600">
                      Baca selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )}

              <div className="grid grid-cols-1 gap-6">
                {restBerita.map((b) => (
                  <BeritaCard key={b.id} berita={{ ...b, excerpt: htmlExcerpt(b.konten) }} />
                ))}
              </div>
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/berita" className="text-sm font-medium text-primary-600 hover:underline">
                Lihat semua berita →
              </Link>
            </div>
          </div>
        </section>
      )}
    </PublicPageShell>
  );
}
