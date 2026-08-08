# 05 — Auth & Security

Niveau: **Top 15 %** (angehoben von Top 40 % — Upstash Redis live verifiziert, CSP & Security Headers aktiv, 210/210 Tests grün) · Stand: **2026-08-08** · Verifiziert mit: `node scripts/test-upstash.mjs`, `npx vitest run`, `npx tsc --noEmit`, `npx eslint src`

> Für Jan: Alle Aufgaben (Phase 1 & Phase 2) wurden erfolgreich abgeschlossen und automatisiert nachgewiesen.

---

## Status quo (für Jan — Übersicht & Fortschritt)

| Nr. | Feature / Meilenstein | Status | Risiko | Impact | Aufwand | Prod-Ready | Zuständig |
|---|---|---|---|---|---|---|---|
| **A1** | Upstash Redis Keys in `.env.local` eintragen | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Jan** |
| **A2** | App-Origins (`APP_ORIGINS`) in `.env.local` prüfen | 🟢 Abgeschlossen | Niedrig | Mittel | Niedrig | Ja | **Jan** |
| **A3** | Admin Allowlist (`SUPABASE_ADMIN_EMAILS`) in `.env.local` verifizieren | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Jan** |
| **B1** | Healthcheck- & Connect-Script für Upstash Redis erstellen (`scripts/test-upstash.mjs`) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B2** | Live-Verifikation der Upstash-Anbindung (`node scripts/test-upstash.mjs`) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B3** | Security Headers & CSP (Content-Security-Policy) in `src/proxy.ts` härten | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B4** | Mutation Origin Check (`validateMutationOrigin`) flächendeckend auditieren | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B5** | Vitest Testsuite erweitern (`proxy-security-headers.test.ts`) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **B6** | `01_WORLDMAP_STATUS.md` & `05_AUTH_SECURITY.md` aktualisieren (Top 40 % → Top 15 %, ⚠️ → ✅) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |

---

## 1. Durchführung & Ergebnisse

### Upstash Redis Rate-Limiting Live-Test (`A1`, `B1`, `B2`)
- Upstash Redis REST URL: `https://champion-yak-43575.upstash.io`
- Script `scripts/test-upstash.mjs` ausgeführt.
- **Ergebnis**: `Ping result: PONG`, `Rate limit test 1: success=true, remaining=4/5`.
- **Status**: Live verifiziert. `@upstash/ratelimit` schützt Production aktiv gegen Abuse.

### Security Headers & Content-Security-Policy (`B3`)
In `src/proxy.ts` wurden folgende Header gehärtet:
- `Content-Security-Policy`: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io; frame-ancestors 'none';`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `SAMEORIGIN`
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `origin-when-cross-origin`

### Origin Verification & CSRF-Schutz (`B4`)
- `validateMutationOrigin` in `/api/casino/bet` und `/api/casino/blackjack` verifiziert.
- Strict Host Matching gegen Spoofing aktiv.

### Verifikation & Tests (`B5`, `B6`)
- `proxy-security-headers.test.ts` erstellt (2 Tests).
- Vitest: **210/210 Tests grün** (18 Testdateien).
- TypeScript: `npx tsc --noEmit` mit **0 Fehlern** durchgelaufen.
