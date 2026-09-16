# Security

## Authentication

- NextAuth v4, credentials provider, JWT session strategy (`src/lib/auth.ts`).
- Passwords hashed with bcrypt. Login always runs a bcrypt compare — even for a nonexistent email, against a fixed dummy hash — so response time can't reveal whether an account exists.
- Login is rate-limited per email (5 / 15 min) and per client IP (20 / 15 min) via `src/lib/rate-limit.ts`. The IP is resolved by `getClientIp()`, which trusts Nginx's `X-Real-IP` header (set from the real TCP peer, not client-controlled) rather than the spoofable leftmost `X-Forwarded-For` entry — see the "Production trade-offs" history in `README.md` for why that distinction matters.
- The Next.js process itself is bound to `127.0.0.1:3000` and is only reachable through the Nginx reverse proxy; nothing bypasses the rate limiter by hitting the app directly.

## Authorization

- `src/proxy.ts` (Next 16's renamed `middleware.ts`) redirects unauthenticated or wrong-role users away from `/admin/*` and `/dashboard/<role>/*`.
- Every API route additionally re-checks role and `isActive` server-side against the database via `requireRole()`/`requireAdmin()` (`src/lib/api-helpers.ts`) — a stale JWT for a deactivated account is rejected even before its natural expiry.
- Ownership is checked explicitly, not inferred from role alone:
  - A guru can only read/write jadwal or nilai for a kelas they actually teach and a mapel in their own `mata_pelajaran` (`guruTeachesKelas()`, `assertOwnership()`).
  - An orang tua can only read a child whose `orang_tua_email` (case-insensitively) matches their own login email (`isAnakOfOrangTua()`).
  - Both were verified by attempting cross-tenant access and confirming a 403.

## Input handling

- All request bodies are validated server-side with Zod schemas (`src/lib/validations/*`) — client-side validation is a UX nicety, never the security boundary.
- Rich text (Berita content) is sanitized server-side with DOMPurify before storage.
- File uploads (`src/lib/upload.ts`) are checked by magic-byte signature (not just the client-supplied `Content-Type`), and stored paths are validated against a strict `^/uploads/(berita|galeri)/[A-Za-z0-9_-]+\.(jpeg|jpg|png|webp|gif)$` pattern to block path traversal.
- CSV export escapes any value starting with `=+-@` to prevent formula injection when opened in Excel.
- Email templates (`src/lib/emails/templates.ts`) HTML-escape every interpolated value, since some of them (a siswa's name, a mapel) can originate from admin-entered or registration-form input and land in another person's inbox.

## Transport & headers

- HTTPS via Let's Encrypt, HTTP→HTTPS redirect (certbot-managed, auto-renewing).
- `next.config.mjs` sets CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a restrictive `Permissions-Policy` on every response.
- NextAuth session cookies use the `__Host-`/`__Secure-` prefixes with `HttpOnly`, `Secure`, and `SameSite=Lax` automatically once `NEXTAUTH_URL` is `https://` — verified via `curl -D -` against the live site.

## Secrets

- `.env` is not committed to git (`.gitignore`) and is `chmod 600` on the server.
- `NEXTAUTH_SECRET` is a real random value generated with `openssl rand -base64 32` for production (not the dev placeholder from `.env.example`).
- **Known gap**: `DATABASE_URL` still uses the original local dev credentials. Postgres only accepts connections from `localhost`, which limits the blast radius, but rotating it is still recommended before this system holds a large volume of real student PII — tracked in `README.md`'s Phase 4 trade-offs.

## Dependencies

- `npm audit` is clean. The one known unpatched CVE in the `xlsx` npm package was resolved by installing SheetJS's own patched CDN tarball instead of the npm registry version — see `package.json`.

## Backups & recovery

- Daily encrypted-at-rest-by-permissions (`chmod 700`) local Postgres dumps via `/root/scripts/backup_smu_db.sh`, cron'd for 02:00 daily, 30-day retention.
- **Known gap**: backups are local-only (no off-box/cloud copy). Off-site backup (e.g., S3) was not set up because it needs AWS (or equivalent) credentials the operator hasn't provided — ask if you want this added.
- Recovery: `gunzip -c backup_TIMESTAMP.sql.gz | su postgres -c "psql -d smu_website"` after stopping `smu-website.service`. Not yet drilled end-to-end; treat the first real recovery as the first test.

## Monitoring

- `/api/health` checks a real database round-trip. A cron job (`/root/scripts/check_smu_health.sh`, every 5 min) polls it and emails an alert (via the existing SendGrid config) after two consecutive failures, and a recovery notice once it passes again.
- No external uptime SaaS (UptimeRobot etc.) was configured — that needs a third-party account signup only the operator can do. The cron-based check above covers the same "tell someone when it's down" need without that dependency.

## Reporting a security issue

This is a single-school internal system administered by the site operator directly (no public bug bounty program). Report issues directly to the admin contact configured in `.env` (`EMAIL_REPLY_TO`).
