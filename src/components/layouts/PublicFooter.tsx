import Link from "next/link";
import { MessageCircle, Camera, Video, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";

const quickLinks = [
  { href: "/", label: "Beranda" },
  { href: "/jadwal", label: "Jadwal" },
  { href: "/berita", label: "Berita" },
  { href: "/galeri", label: "Galeri" },
];

const accountLinks = [
  { href: "/login", label: "Masuk" },
  { href: "/registrasi", label: "Pendaftaran Siswa Baru" },
  { href: "/kontak", label: "Kontak" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-slate-500">
              Sistem informasi akademik terpadu untuk siswa, guru, dan orang tua — jadwal,
              nilai, berita, dan pendaftaran calon siswa baru dalam satu tempat.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-primary-600 hover:shadow"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-primary-600 hover:shadow"
              >
                <Camera className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-primary-600 hover:shadow"
              >
                <Video className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tautan Cepat</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-primary-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Akun & Pendaftaran</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-primary-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Kontak</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
                <span>Jl. Pendidikan Raya No. 123, Kota Contoh, Jawa Barat</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary-600" />
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary-600" />
                <span>admin@smu.join.co.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} SMU. Seluruh hak cipta dilindungi.</p>
          <p>*Informasi kontak pada footer ini masih data contoh (dummy).</p>
        </div>
      </div>
    </footer>
  );
}
