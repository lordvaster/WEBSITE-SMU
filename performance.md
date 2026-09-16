# Performance

## Database

- Indexes on every hot query path: `User.email`, `Siswa.nisn`, `Siswa.kelasId`, `Siswa.orang_tua_email`, `Guru.nip`, `Jadwal.kelasId`/`guruId`/`hari`, `Nilai.siswaId`/`guruId` (+ unique `[siswaId, mapel, semester]`), `Berita(isPublished, publishedAt)`, `Registrasi.email`/`status`. See `prisma/schema.prisma`.
- All list queries use `skip`/`take` pagination (never load a full table). Cross-tenant lookups (guru's students, orang tua's children) use a single `groupBy`/`findMany` instead of one query per row — see `getSiswaCountByKelas()` in `src/lib/queries/guru.ts`.
- Redis caching (`src/lib/cache.ts`) wraps the jadwal list (`JADWAL_CACHE_KEY`, invalidated on every admin jadwal write). It no-ops safely if `REDIS_URL` is unset or unreachable. Berita/galeri were *not* also wrapped in Redis — they're already covered by Next.js ISR (`revalidate = 3600`), and double-caching the same data in two layers isn't worth the invalidation complexity for a data set that changes a few times a week.

## Images & fonts

- Every content image already goes through `next/image` (verified: no raw `<img>` tags in `src/`), so resizing, `srcset`, and lazy-loading are automatic.
- Fonts load via `next/font` where used, which self-hosts and inlines `font-display: swap` by default.

## Code splitting

Verified directly in the production build rather than assumed: `xlsx`, TipTap/ProseMirror, and Recharts each compile into their own separate chunk, and none of them appear in the homepage's script tags (`curl https://smu.join.co.id/ | grep _next/static/chunks`). Next.js's per-route App Router bundling already achieves this automatically — no manual `dynamic()` imports were needed to keep admin-only libraries out of the public bundle.

**Homepage First Load JS**: ~641 KB raw / ~192 KB gzipped across all script tags. Reasonable for a Next.js 16 + React 19 app; not chased further since it's already well under what would threaten the <2s target on a normal connection.

## Caching headers

- Public pages: ISR (`export const revalidate = 3600`) on `/`, `/galeri`, `/berita`, `/berita/[slug]` — confirmed live via `x-nextjs-cache: HIT` and `Cache-Control: s-maxage=3600, stale-while-revalidate=...` response headers.
- Static assets under `/_next/static/*` are immutable and long-cached by Next.js itself.
- Security headers (CSP, HSTS, etc.) are set once in `next.config.mjs` rather than duplicated in Nginx.

## Load test results

See `LOAD_TEST_RESULTS.md`.

## What was deliberately not done

- **`@next/bundle-analyzer`**: skipped adding the extra dependency and `ANALYZE=true` tooling because the bundle question (are heavy admin libs leaking into public pages?) was answered directly by inspecting the real build output and the homepage's actual script tags — that's a more reliable answer than a treemap for a codebase this size, and adds no maintenance surface.
- **Service worker / offline support**: not implemented — this is a low-traffic school site with no offline use case in the spec; adding one would be speculative complexity.
- **Sentry / APM**: skipped — needs a Sentry account and DSN the operator hasn't provided. The app already logs errors server-side (`console.error` in `handleApiError`) and systemd captures them in the journal (`journalctl -u smu-website`). Can be added later if a DSN is supplied.
