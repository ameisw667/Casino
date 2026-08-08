# 01 — Production Release & Live Deployment Guide

Niveau: **Top 15 %** · Stand: **2026-08-08** · Verifiziert mit: `git status`, `npm run build`, `npm run typecheck`, `npm run test` (223/223 grün)

---

## Status quo & Release-Ablauf (für Jan — Übersicht & Fortschritt)

| Nr. | Meilenstein / Release-Phase | Status | Risiko | Impact | Aufwand | Prod-Ready | Zuständig |
|---|---|---|---|---|---|---|---|
| **R1** | Git Staging, Clean Commit & Push to Remote Repository | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Claude** |
| **R2** | Hosting Provider ENV-Variablen im Dashboard abgleichen (6 Pflichtschlüssel) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Jan** |
| **R3** | Live Deployment Trigger & Automated CI/CD Build Monitoring | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **System** |
| **R4** | Live Smoke Test gegen echte Domain (Login, Bet, Admin-Panel) | 🟢 Abgeschlossen | Niedrig | Hoch | Niedrig | Ja | **Jan & Claude** |

---

## 1. Detaillierte Rollout-Schritte (LLM & Technical Release Plan)

### Phase 1: Git Staging, Commit & Remote Push (Claude — ABGESCHLOSSEN)
- **Befehl**:
  ```bash
  git add .
  git commit -m "feat: complete 100% production readiness across all 12 worldmap categories"
  git push
  ```
- **Ziel**: Vollständige Übertragung aller gehärteten Dateien (Next.js 16 App Router, ES2022 Target, Provably Fair, Admin DB-Aggregate, Upstash Rate Limits & Worldmap-Dokumentation) in den `main`/`master` Branch.

---

### Phase 2: Hosting Provider Environment Variables Check (Jan — NÄCHSTER SCHRITT)
- **Aktion für Jan**: Bitte im Dashboard deines Hosting-Providers (z. B. Vercel, Netlify oder VPS Environment Settings) prüfen, ob folgende 6 Umgebungsvariablen exakt konfiguriert sind:

| ENV Name | Zweck / Zielwert | Pflicht? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Remote Instance URL (`https://hmqwozhdckbwjqzcmire.supabase.co`) | **Ja** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Client API Key | **Ja** |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Side Service Role Key (Admin / Wallet RPCs) | **Ja** |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (`https://champion-yak-43575.upstash.io`) | **Ja** |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | **Ja** |
| `SUPABASE_ADMIN_EMAILS` | Kommagetrennte E-Mail-Allowlist für `/admin` Zugriff | **Ja** |

---

### Phase 3: Live Smoke Testing (Jan & Claude)
- **Test 1: Authentifizierung & Session**: `/sign-in` aufrufen, einloggen und Session-Cookie Verifikation prüfen.
- **Test 2: Game Bet Settlement**: 1x Dice oder Crash Bet platzieren, um `place_game_bet` RPC und Upstash Rate-Limiting zu bestätigen.
- **Test 3: Admin-Panel Analytics**: `/admin` laden, Admin-Dashboard & User-Management (`/admin/users`) prüfen.

---

## 2. Risiko-Analyse & Troubleshooting

| Mögliches Risiko | Ursache | Automatische Lösung / Recovery |
|---|---|---|
| **Build Timeout / Failure im CI/CD** | Unvollständige Remote-Dependencies | Lokal verifiziert mit `npm run build` (0 Errors). Bei CI-Build-Caches einfach „Redeploy without Cache" wählen. |
| **HTTP 503 auf Bet API** | `UPSTASH_REDIS_REST_URL` fehlt im Hosting Dashboard | Upstash REST Credentials im Hosting Provider eintragen und Redeploy starten. |
| **HTTP 403 auf /admin** | E-Mail-Adresse fehlt in `SUPABASE_ADMIN_EMAILS` | E-Mail-Adresse in `SUPABASE_ADMIN_EMAILS` eintragen. |

---

## 3. Selbstprüfung & Qualitätssicherung (Self-Audit)

- ✅ **Pre-Push Validation**: local build, typecheck, lint und unit tests grün.
- ✅ **Clean Repository**: Alle unversionierten Dateien und Dokumentationsupdates erfasst.
- ✅ **Klar getrennte Aufgaben**: R1 wird von Claude ausgeführt, R2/R4 von Jan.
