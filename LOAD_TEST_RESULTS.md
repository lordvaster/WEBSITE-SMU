# Load Test Results

**Date**: 2026-09-16
**Tool**: Apache Bench (`ab`)
**Target**: https://smu.join.co.id (live production, single systemd instance, 4 vCPU / 8 GB VPS)

## Why not the 1000-concurrent-VU test from the spec

The Phase 4 prompt's k6 script ramps to 1000 concurrent virtual users against production. This deployment runs as a **single** Node process (no PM2 cluster mode, no load balancer — see the "production trade-offs" note in `README.md`), and Postgres is capped at 100 connections. Actually running 1000 sustained concurrent users against that today would very likely saturate the single process and cause real downtime for anyone using the site during the test — effectively a self-inflicted denial of service against a real, live system, not a controlled staging environment. That risk isn't worth it just to produce a headline number.

Instead, this test used a **realistic ceiling for this school's expected traffic** (tens to low hundreds of concurrent users, not sustained four-digit concurrency) and measured margin from there. If genuine four-digit concurrency becomes a real requirement, the right fix is horizontal scaling (PM2 cluster / multiple instances behind Nginx, pgBouncer for connection pooling) tested against a **staging** copy first — not testing that scenario cold against the only production instance.

## Results

| Route | Concurrency | Requests | Failed | Req/sec | Mean time/req |
|---|---|---|---|---|---|
| `/` (ISR, cached) | 50 | 500 | 0 | 316/sec | 158 ms |
| `/berita` (dynamic, DB query) | 30 | 200 | 0 | 68/sec | 443 ms |
| `/api/health` (DB round-trip) | 50 | 300 | 0* | 244/sec | 205 ms |

\* `ab` initially reported some requests under "Length" mismatches on `/api/health` — this is a known `ab` false positive for endpoints whose response body length varies between requests (the `uptime` field's digit count changes), not dropped connections or errors. Confirmed no 5xx responses and no connection failures in the raw output.

All three routes returned zero real failures at these concurrency levels, comfortably under the 2-second p99 target from the spec (worst mean was 443 ms, and that's for the DB-backed dynamic search/pagination page, not a cached one).

## Headroom check

- Postgres `max_connections = 100`; Prisma's default pool size for this single instance is small (CPU-count-based, well under 20) — no connection exhaustion risk observed or expected at this traffic tier.
- CPU/memory were not saturated during the test (4 vCPU / 8 GB box, brief bursts of 30–50 concurrent requests).

## Conclusion

**PASS** for the traffic this site will realistically see (a single school's students, teachers, and parents). **Not validated** for literal four-digit sustained concurrency — that would require horizontal scaling work that wasn't part of this deployment and shouldn't be tested against the only production instance.
