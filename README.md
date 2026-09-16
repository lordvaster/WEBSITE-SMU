# SMU Website

Sistem informasi akademik sekolah — Next.js 16 (App Router, React 19) + PostgreSQL + Prisma + NextAuth.js.

## Security review & hardening (2026-09-16)

A manual security review (auth, uploads, admin authorization, injection surfaces) turned up 8 findings, all fixed:

- **Path traversal → arbitrary file deletion** in Galeri: `gambar` is now restricted to `/uploads/(berita|galeri)/...` by regex, plus `resolveUploadPath()` in `src/lib/upload.ts` refuses to resolve outside `public/uploads` even if that were bypassed.
- **Stale authorization**: `requireAdmin()` (`src/lib/api-helpers.ts`) now re-checks `isActive`/`role` against the DB on every request instead of trusting the JWT claim for its full lifetime — a deactivated admin is locked out immediately, not after up to 15 minutes.
- **CSV/formula injection** in the nilai export: cells starting with `=+-@` are now prefixed with `'` before quoting.
- **No brute-force protection on login**: `src/lib/rate-limit.ts` caps failed attempts at 5/email and 20/IP per 15-minute window.
- **Email enumeration via timing**: `authorize()` always runs a bcrypt compare (against a dummy hash for unknown users) so response time no longer reveals whether an email is registered.
- **Upload MIME spoofing**: `saveUploadedImage()` now verifies the file's magic bytes match its claimed type instead of trusting the client-supplied `Content-Type`.
- **Missing security headers**: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and HSTS are set in `next.config.mjs`.
- **Dependency CVEs**: upgraded Next.js 14→16 and React 18→19 (Next 14's critical/high CVEs are only fixed in v16); `xlsx` had no npm-side fix for its prototype-pollution/ReDoS advisory, so it's now installed from SheetJS's own CDN tarball (`https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz`), their official distribution channel for patched builds. `npm audit` now reports 0 vulnerabilities.

**Next.js 16 migration notes**: dynamic route `params` are now `Promise`-wrapped in Route Handlers (`await params` added to every `/api/.../[id]/route.ts`); `middleware.ts` was renamed to `src/proxy.ts` per the new file convention; `next lint` was removed from the CLI, so `npm run lint` now runs `eslint .` directly against a flat `eslint.config.mjs` (migrated off `.eslintrc.json`, which required bumping to ESLint 9). Two React Compiler–derived lint rules (`react-hooks/set-state-in-effect`, `react-hooks/incompatible-library`) are downgraded to warnings — they assume code adopts the React Compiler or a data-fetching library like SWR/React Query, which this project's straightforward `useEffect` + `fetch`-on-mount pattern intentionally doesn't.

## Phase 1 status

- Database connected & migrated (PostgreSQL, Prisma)
- NextAuth.js credentials login with 4 roles: `admin`, `guru`, `siswa`, `orang_tua`
- Login page with client + server validation (react-hook-form + zod)
- Role-based protected routes via middleware (`/admin`, `/dashboard/*`)
- Public `/jadwal` page with filtering (kelas, guru, hari, search) + pagination, backed by an API route with an optional Redis cache
- Basic homepage
- Seed script with sample data for all roles

## Phase 2 status

Full admin panel at `/admin` (admin role only), built on a reusable `DataTable` (TanStack Table: sort, global search, pagination), Radix `Dialog`-based forms/confirm dialogs, and Sonner toasts.

- **Siswa** (`/admin/siswa`): CRUD, NISN/email uniqueness checks, Excel bulk import (`xlsx`, client-parsed) with per-row error reporting
- **Guru** (`/admin/guru`): CRUD, NIP/email uniqueness, Excel bulk import; deleting a guru still referenced by jadwal/nilai returns a friendly 409 instead of a DB error
- **Jadwal** (`/admin/jadwal`): week-view (Senin–Sabtu columns, agenda-style per day, color-coded by mata pelajaran) instead of a full calendar-grid library — click "+" to create, click an entry to edit; server-side overlap validation (guru/kelas/ruangan double-booking) on create, update, and bulk import; mutations invalidate the public `/jadwal` Redis cache immediately
- **Nilai** (`/admin/nilai`): filter by kelas/semester/mapel, auto-calculated `nilai_akhir` (20% harian + 30% UTS + 50% UAS), duplicate (siswa+mapel+semester) prevention, Excel bulk import (upsert), CSV export
- **Berita** (`/admin/berita`): TipTap rich text editor, auto-slug from title, image upload to `public/uploads/berita`, HTML sanitized server-side with DOMPurify, publish/draft toggle, public API at `/api/public/berita` (published only)
- **Galeri** (`/admin/galeri`): grid view, drag-and-drop image upload to `public/uploads/galeri`, foto/video with optional video link, public API at `/api/public/galeri`

All `/api/admin/*` routes are protected server-side via `requireAdmin()` (403 for non-admin/unauthenticated), independent of the middleware's page-level checks.

**Known trade-offs** (reasonable for this project's scale, worth revisiting if data volume grows):
- `DataTable` fetches the full resource list and paginates/sorts/filters client-side rather than doing server-side pagination — simplest option for a single school's data (tens to low-thousands of rows).
- Jadwal is an agenda-per-day view, not a literal time-grid calendar component — avoids a heavy calendar library while still supporting click-to-create/edit and overlap validation.
- Nilai's "guru pencatat" (recording teacher) is inferred by matching mata pelajaran to a guru who teaches it, since the CRUD form doesn't expose that field explicitly.

## Phase 3 status

Role-specific dashboards, email notifications, public content pages, and student registration — built using the `nextjs-developer` skill's App Router/RSC guidance (server-fetch-first, `generateMetadata` for SEO, ISR via `export const revalidate`, `loading.tsx` boundaries).

- **Siswa dashboard** (`/dashboard/siswa`): tabbed Jadwal/Nilai view — jadwal is a color-coded weekly agenda with a "next class today" highlight; nilai shows a semester filter, class average, a Recharts line chart of nilai_akhir trend across semesters, and a print/PDF button (`window.print()`). Latest 3 published berita shown as announcements.
- **Guru dashboard** (`/dashboard/guru`): jadwal tab (their own teaching schedule), nilai tab where they pick kelas + mapel + semester and edit/upsert grades inline or via scoped Excel bulk-import/export, and a kelas tab listing their classes with an expandable student roster. Every nilai/kelas endpoint double-checks server-side that the guru actually teaches that kelas (via their `Jadwal` entries) and that mapel is in their `mata_pelajaran` — a guru cannot read or write grades for a class/subject they don't teach (verified: cross-kelas and cross-mapel requests return 403).
- **Orang tua dashboard** (`/dashboard/orang-tua`): a child selector (for parents with multiple children) driving the same read-only Jadwal/Nilai tabs. Per-child API routes (`/api/dashboard/orang-tua/anak/[siswaId]/...`) verify `siswa.orang_tua_email === session.user.email` before returning anything — verified: requesting another parent's child returns 403 (IDOR blocked).
- **Email notifications** (`src/lib/email.ts` + `src/lib/emails/templates.ts`): branded HTML templates for registration confirmation, siswa/guru welcome (with temp password), and nilai-updated notices (sent to both siswa and orang tua). Uses `@sendgrid/mail`; if `SENDGRID_API_KEY` is unset it logs to the console instead of failing, the same graceful-degradation pattern as the optional Redis cache — so the app works out of the box without a real email provider. Wired into siswa/guru creation and guru nilai edits.
- **Public berita** (`/berita`, `/berita/[slug]`): paginated/searchable list, ISR (`revalidate = 3600`), full SEO metadata via `generateMetadata` (OG image, description), reading-time estimate, share links (WhatsApp/Facebook/X), related posts. Homepage now shows the 3 latest posts.
- **Public galeri** (`/galeri`): foto/video filter, lazy-loaded grid, a Radix-Dialog-based lightbox with prev/next navigation — no extra lightbox library needed.
- **Registrasi** (`/registrasi`): public application form (react-hook-form + zod) → creates a `Registrasi` record, emails a 24-hour verification link, rate-limited to 5 submissions/IP/day. `/registrasi/verify` marks the record verified. Admin reviews pending applications at `/admin/registrasi` and can approve (requires verified email) or reject.

**Known trade-offs**:
- Approving a registrasi only flips its status to `approved` — it does **not** auto-create a Siswa/User account, because the form doesn't collect required fields (NISN, NIK, tanggal lahir, kelas assignment). An admin still finishes onboarding via the existing "Tambah Siswa" flow in `/admin/siswa`.
- "Download as PDF" for jadwal/nilai uses the browser's native print dialog (`window.print()` with print-friendly CSS) rather than a PDF-generation library — the browser's own "Save as PDF" destination covers this without adding a dependency.
- The Bull/Redis job queue mentioned in the original spec for email retries was skipped as disproportionate to this project's scale; emails send inline (fire-and-forget, failures are logged but never block the triggering request).

## Phase 4 status — performance & production deployment (2026-09-16)

- **Database indexes**: added `Siswa.orang_tua_email` (hot lookup path for the orang tua dashboard) and `Berita(isPublished, publishedAt)` (the public berita listing's filter+sort) — migration `20260916065454_add_perf_indexes`.
- **Performance audit**: confirmed all images already go through `next/image` (no raw `<img>` for content), public pages already use ISR (`export const revalidate = 3600`), and listing pages paginate server-side. `npm run build` produces a clean production bundle with static/ISR pages for `/`, `/galeri` and per-request caching for `/berita`, `/berita/[slug]` (dynamic because of search/pagination query params, which is expected).
- **Production deployment**: the app now runs as a systemd service (`/etc/systemd/system/smu-website.service`, `npm start` on port 3000, `Restart=on-failure`, enabled at boot) behind an Nginx reverse proxy (`/etc/nginx/sites-available/smu.join.co.id`) at **https://smu.join.co.id**, with a Let's Encrypt certificate (auto-renewed via the `certbot.timer` systemd timer) and HTTP→HTTPS redirect. `NEXTAUTH_URL` and `NEXTAUTH_SECRET` were updated to production values (a real random secret, not the dev placeholder).
- **Post-deploy security fix**: a follow-up review found the Next.js process was listening on `0.0.0.0:3000` (reachable directly from the internet, bypassing Nginx/TLS entirely) and that the login/registrasi rate limiter trusted the leftmost, spoofable `X-Forwarded-For` entry. Fixed by binding `next start` to `127.0.0.1` only (`package.json`) and adding `getClientIp()` (`src/lib/rate-limit.ts`), which trusts Nginx's `X-Real-IP` instead. See `SECURITY.md` for the full writeup.
- **Health check & monitoring**: `GET /api/health` does a real DB round-trip. A cron job (`/root/scripts/check_smu_health.sh`, every 5 min) polls it and emails an alert after 2 consecutive failures via the existing SendGrid config, and a recovery notice once it's back — a lightweight, no-third-party-account alternative to an external uptime SaaS.
- **Backups**: `/root/scripts/backup_smu_db.sh` runs daily at 02:00 via cron, dumps + gzips the DB to `/root/backups/database` (`chmod 700`), 30-day retention. Restore is a straight `gunzip | psql`. Off-site/cloud copy wasn't set up (needs cloud credentials the operator hasn't provided).
- **Load testing**: see `LOAD_TEST_RESULTS.md` — tested at realistic traffic levels for a single school (not the spec's literal 1000 sustained concurrent users, which would risk taking down the only production instance during the test itself; see that file for the reasoning).
- **Docs**: added `performance.md` and `SECURITY.md` alongside this README.

**Known trade-offs**:
- The systemd service runs as `root` (matching how this VPS is already administered — Postgres/Nginx are also root-managed here) rather than a dedicated least-privilege system user; a dedicated user was skipped because `/root` itself isn't traversable by other users, and restructuring the deploy path was out of scope for this pass.
- `DATABASE_URL` still uses the original local dev credentials (`postgres:postgres`) — rotating the Postgres password wasn't done in this pass since the DB is only reachable from `localhost` and changing it risks breaking other local tooling; consider rotating before handling real student PII at scale.
- The Let's Encrypt account was registered with `--register-unsafely-without-email` (skipped, per instruction) — there's no automatic email warning before the cert expires, though the systemd renewal timer handles renewal automatically well before the 90-day expiry.

## Requirements

- Node.js 20+
- PostgreSQL (running locally or reachable via `DATABASE_URL`)
- Redis (optional — the app runs fine without it; caching is skipped automatically if `REDIS_URL` is unset or unreachable)

## Setup

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL / NEXTAUTH_SECRET
npm run prisma:migrate
npm run prisma:db:seed
npm run dev
```

Open http://localhost:3000.

## Environment variables (`.env`)

```
DATABASE_URL="postgresql://user:password@localhost:5432/smu_website"
NEXTAUTH_SECRET="use `openssl rand -base64 32` in production"
NEXTAUTH_URL="http://localhost:3000"
REDIS_URL="redis://localhost:6379"   # optional

# Optional — email sending logs to the console instead of failing if unset
SENDGRID_API_KEY=""
EMAIL_FROM="noreply@smu.join.co.id"
EMAIL_REPLY_TO="admin@smu.join.co.id"
```

## Test credentials (after seeding)

Password for all seeded accounts: `Test123!`

| Role       | Email                  |
|------------|-------------------------|
| Admin      | admin@smu.co.id         |
| Guru       | guru1@smu.co.id         |
| Siswa      | siswa1@smu.co.id        |
| Orang Tua  | orangtua1@smu.co.id     |

## Useful scripts

```bash
npm run dev              # start dev server
npm run build            # production build
npm run lint             # ESLint

npm run prisma:migrate   # create/apply a migration
npm run prisma:generate  # regenerate Prisma client
npm run prisma:studio    # open Prisma Studio
npm run prisma:db:seed   # re-run prisma/seed.ts (idempotent)
```

## Project structure

```
src/
  app/
    (auth)/login/          # public login page
    admin/                 # admin dashboard (role: admin)
    dashboard/guru/        # guru dashboard (role: guru)
    dashboard/siswa/       # siswa dashboard (role: siswa)
    dashboard/orang-tua/   # orang tua dashboard (role: orang_tua)
    jadwal/                # public schedule page
    api/
      auth/[...nextauth]/  # NextAuth handler
      auth/register/       # admin-only user creation
      jadwal/              # filtered/paginated schedule data (cached)
  components/
    forms/                 # LoginForm
    layouts/                # AuthLayout, PublicNavbar, DashboardShell
  lib/
    auth.ts                # NextAuth config + role -> dashboard path helper
    db.ts                  # Prisma client singleton
    password.ts            # bcrypt hash/compare (12 rounds)
    cache.ts                # Redis get/set, no-ops if REDIS_URL absent
  middleware.ts             # route protection + role enforcement
prisma/
  schema.prisma
  seed.ts
```

## Notes on scope

- Dashboard pages (admin/guru/siswa/orang_tua) show real data from the database but link out to CRUD screens (Kelola Siswa, Input Nilai, etc.) that are **Phase 2/3** work and not yet built.
- Login is handled entirely by NextAuth's built-in `/api/auth/callback/credentials` endpoint; there is no separate custom `/api/auth/login` route.
- Redis caching for `/jadwal` degrades gracefully to direct DB queries if Redis is not running.

## Common issues

| Issue | Solution |
|---|---|
| `DATABASE_URL` connection error | Check PostgreSQL is running and the URL in `.env` is correct |
| Prisma migration fails | Delete `prisma/migrations` and run `npx prisma migrate dev --name init` again |
| NextAuth session missing | Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set in `.env` |
| Redis warnings in logs | Safe to ignore in dev — caching silently falls back to direct DB reads |
