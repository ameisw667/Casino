# 12 — Performance & Core Web Vitals

Niveau: **Top 15 %** · Stand: **2026-08-27** (Konsolidierung; Lab-Messwerte aus den Einzelnachweisen, siehe Datums-Spalte) · Verifiziert mit: Dep-Prüfung `grep package.json` (2026-08-27), `.next/static/chunks`-Messung (2026-08-27), Lighthouse-/Overflow-Nachweisen der verlinkten Einzeldateien

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

## Befunde

| ID  | Schwere | Befund                                                                                                                                                                                                                                             | Ort                                                                    | Belegt durch                               |
| --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| P-1 | HIGH    | **Mobile-LCP-Lücke ungelöst und unisoliert:** Mobile `/` LCP 5,7 s gegen Ziel < 2,5 s, TBT 1.120 ms — Ursache laut Quellen „nicht weiter isoliert"; kein Follow-up-Messdatum seit Erstmessung. Die geplante Isolation ist Teil 2 des aktiven Plans | [05_mobile-performance.md](../archive/04_MOBILE_PERFORMANCE.md) Teil 2 | Worldmap Abschnitt 4/5, Zeile 12           |
| P-2 | MEDIUM  | Niveau „Top 15 %" basiert auf Desktop- und Bundle-Messungen, während die einzige Mobile-Feldmessung die CWV-Ziele klar verfehlt — die Einstufung ist damit nur mit dem Vorbehalt „Desktop-getrieben" haltbar                                       | Worldmap Zeile 12                                                      | diese Datei, Register oben                 |
| P-3 | MEDIUM  | Kein einziges konsolidiertes Dokument: Mobile-Perf-Wissen verteilt über ≥ 4 Dateien (11_PERF_MOBILE superseded, architecture/05, P44, V2-Archiv, aktiver Plan) — diese Datei schließt die Lücke erstmals                                           | —                                                                      | README-Vermerk „superseded"                |
| P-4 | LOW     | `scripts/mobile-overflow-check.mjs` existiert als wiederholbarer Check, aber kein dokumentierter CI-/regelmäßiger Ausführungsplan                                                                                                                  | `scripts/mobile-overflow-check.mjs`                                    | Datei existiert, Ergebnis nur im V2-Archiv |

## Nächste Schritte

| #   | Schritt                                                                                                            | Effekt auf Niveau                                                 | Aufwand                    |
| --- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------- |
| 1   | Teil 2 des aktiven Plans (Perf-Trace) ausführen: Mobile `/` LCP 5,7 s isolieren (Bild-/Font-/Hydration-Anteile)    | schließt die HIGH-Lücke, Voraussetzung für echte Top-15-%-Aussage | Hoch                       |
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
