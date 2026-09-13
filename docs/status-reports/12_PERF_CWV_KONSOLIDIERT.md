# 12 — Performance & Core Web Vitals

Niveau: **Top 15 % (Lab)** · Stand: **2026-09-12** · Mobile-LCP-Ziel technisch erreicht; L3-iPhone-15-Abnahme durch Jan bestätigt, RUM-Abnahme bleibt offen.

> Konsolidierter Status-Report zu Kategorie 12 (Prio 2). Er ersetzt **nicht** die Einzelmessungen —
> er ordnet sie chronologisch, trennt datierte von undatierten Messungen und benennt die offene
> Spannung zwischen Niveau-Einstufung und Mobile-LCP-Messung. Einzelnachweise:
> [11_PERF_MOBILE.md](./11_perf_mobile.md) (superseded) · [05 Mobile-Performance](../architecture/05_mobile_performance.md) ·
> [P44 RUM](../archive/05_p44_real_user_monitoring.md) · [Mobile-Perf V2](../archive/04_mobile_performance_v2.md)

## Scope

Lighthouse-Messungen, Bundle-Analyse, Breakpoint-/Overflow-Checks, Real-User-Monitoring (Feldmessung), tote Dependencies. **Nicht im Scope:** Server-Skalierung/Load Balancing (Vercel-/Supabase-managed), DB-Query-Performance (Kategorie 02).

## Messungs-Register (chronologisch, jede Messung mit Quelle)

| Datum                                      | Messung                                                                                                                                 | Ergebnis                                                                                                                                               | Quelle                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| vor 2026-08-18 (Datum in 00 nicht datiert) | Lighthouse Desktop, Production-Build                                                                                                    | `/` Perf 97 · A11y 82 · BestPractices 96 · SEO 92 · LCP 1,3 s · TBT 0 ms · CLS 0 · 834 KiB; `/games/dice` Perf 100, LCP 0,7 s, 620 KiB                 | Worldmap Abschnitt 4/5, Zeile 12                                            |
| vor 2026-08-18 (dito)                      | Lighthouse Mobile (Standard-Throttling)                                                                                                 | `/` Perf **56**, LCP **5,7 s** (Ziel < 2,5 s), TBT 1.120 ms, CLS 0 — **Ursache nie isoliert**                                                          | dito                                                                        |
| 2026-08-23                                 | Mobile-Perf V2: Layout-/Overlap-Fixes inkl. mobilem Menü-Fix                                                                            | 0 Page-Overflow @375/768/1280 px (`scripts/mobile-overflow-check.mjs`), Build grün, von Jan visuell abgenommen; archiviert                             | [04_MOBILE_PERFORMANCE_V2.md](../archive/04_mobile_performance_v2.md)       |
| 2026-08-23                                 | P44 Real User Monitoring: Consent-gebundene LCP/CLS/INP-Feldmessung via `web-vitals` 5.3.0 + `web_vital_measured`-Event (Zod-Allowlist) | Executed, lokal verifiziert; PostHog-Dashboard-Sichtprüfung durch Jan offen                                                                            | [05_P44_REAL_USER_MONITORING.md](../archive/05_p44_real_user_monitoring.md) |
| 2026-08-27                                 | Dependencies                                                                                                                            | `three`/`@react-three/fiber` (früher ~600 KB, 0 Imports) **nicht mehr in `package.json`** (seit Entfernung); `svix` entfernt; `web-vitals` 5.3.0 aktiv | `grep` in `package.json` (2026-08-27)                                       |
| 2026-08-27                                 | `.next/static/chunks` gesamt                                                                                                            | 4,3 MB (Vorwert: 3,0 MB — Arbeitsfortschritt, unversioniert)                                                                                           | `du -sh .next/static/chunks`                                                |
| 2026-09-12 | Kontrollierter Mobile-Lab-Lauf gegen frischen Production-Build: Pixel 5, 4× CPU, 4G, `PerformanceObserver`, je zwei Läufe ohne Interaktion | `/` finale LCP **1,824 s / 1,876 s**, `/games/dice` **2,068 s / 1,988 s**; beide <2,5 s; Crash-Request einmal (100.668 B), Felt einmal (24.742 B) | [05_MOBILE_PERFORMANCE.md](../architecture/05_MOBILE_PERFORMANCE.md) Teil 2 |

## Befunde

| ID  | Schwere | Befund                                                                                                                                                                                                                                             | Ort                                                                    | Belegt durch                               |
| --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| P-1 | RESOLVED (Lab) | **Mobile-LCP-Ziel technisch erreicht:** zwei kontrollierte Production-Läufe liegen für `/` bei 1,824 s / 1,876 s und für `/games/dice` bei 2,068 s / 1,988 s. L3-iPhone-15-Abnahme durch Jan ist bestätigt; RUM-Abnahme steht weiterhin aus. | [05_MOBILE_PERFORMANCE.md](../architecture/05_MOBILE_PERFORMANCE.md) Teil 2 | 2026-09-12 |
| P-2 | MEDIUM | Die Mobile-Lab-Lücke ist geschlossen; die Einstufung bleibt bis zum RUM-Nachweis ausdrücklich lab-basiert. | Worldmap Zeile 12 | diese Datei, Register oben |
| P-3 | MEDIUM  | Kein einziges konsolidiertes Dokument: Mobile-Perf-Wissen verteilt über ≥ 4 Dateien (11_PERF_MOBILE superseded, architecture/05, P44, V2-Archiv, aktiver Plan) — diese Datei schließt die Lücke erstmals                                           | —                                                                      | README-Vermerk „superseded"                |
| P-4 | LOW     | `scripts/mobile-overflow-check.mjs` existiert als wiederholbarer Check, aber kein dokumentierter CI-/regelmäßiger Ausführungsplan                                                                                                                  | `scripts/mobile-overflow-check.mjs`                                    | Datei existiert, Ergebnis nur im V2-Archiv |

## Nächste Schritte

| #   | Schritt                                                                                                            | Effekt auf Niveau                                                 | Aufwand                    |
| --- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------- |
| 1   | RUM-Feldwerte mit den neuen Lab-Werten abgleichen | vergleicht Lab-Nachweis mit Feldwerten | Niedrig (externe Abhängigkeit) |
| 2   | RUM-Daten nach erstem Sammelzeitraum auswerten (Feld-LCP vs. Lab-LCP) und hier ergänzen                            | Feld-Nachweis statt nur Lab                                       | Niedrig (wartet auf Daten) |
| 3   | `mobile-overflow-check.mjs` in einen regelmäßigen Prüfschritt (z. B. Pre-Deploy/CI) einbinden                      | verhindert Overflow-Regressionen                                  | Mittel                     |
| 4   | Diese Datei als einzigen Perf-Einstieg pflegen; 11_PERF_MOBILE als superseded markiert lassen (keine Doppelpflege) | Kriterium 5 (Cross-Referenzen)                                    | Erledigt mit Erstellung    |

## Definition of Done für die nächste Stufe (Top 10 %)

- Mobile LCP < 2,5 s lab-verifiziert (neue Lighthouse-Messung mit Datum) **oder** RUM-Feldwerte bestätigen Ziel-Einhaltung.
- Diese Datei enthält Messwerte ≤ 14 Tage für alle vier CWV-Achsen (Lab + Feld).
- Overflow-Check automatisiert eingebunden.

## Verifikationsbefehle

```bash
grep -E "svix|three|web-vitals" package.json   # nur web-vitals: 5.3.0 (2026-08-27)
du -sh .next/static/chunks                     # 4,3 MB (Build 2026-08-27)
node scripts/mobile-overflow-check.mjs         # Overflow-Check (letzte Ausführung: 2026-08-23, 0 Fälle)
```
