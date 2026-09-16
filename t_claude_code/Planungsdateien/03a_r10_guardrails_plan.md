# 03a-R10 — Guardrails: Lint + Messung (Regel 10)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Größen-Gate als `check-file-sizes`-Script + CI-Hard-Gate (L1-ESLint-Variante durch config-protection-Hook blockiert, fertig Diff in §5); die gelesen/gebraucht-Messung (#3) bleibt an Parent-Plan 09 (`llm-usage` defekt) gebunden und wird nur verweist.
> **Money-Pfad:** Nein (Lint-/CI-Config) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R10 (Niveau 30 %, Bottlenecks #1/#2/#3) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 9

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                 | Scope (Dateien)                                                         | Ausführung  | Status     | Zuständigkeit | Verifikation                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- | ---------- | ------------- | --------------------------------------------------------- |
| L0     | Baseline & Diagnose: aktuelle Dateigrößen-Verteilung messen (Basiszahlen 2026-09-14: 1.028 Dateien, 891 ≤ 300, 89 in 300–500, 44 in 500–800, 4 > 800) — Warn/Error-Schwellen kalkulieren, sodass die Einführung 0 Errors erzeugt (nur Warnungen über bestehenden Ist-Stand) | read-only: `src/**` Größen-Scan                                         | Sequenziell | 🔴 Geplant | LLM           | Verteilung + Schwellwert-Begründung dokumentiert          |
| L1     | ESLint-Regel einbauen: `max-lines` in `eslint.config.mjs` — **warn bei 500, error bei 800**, ignores: `src/types/database.types.ts` (generiert); keine Auto-Fixes                                                                                                           | `eslint.config.mjs`                                                     | Sequenziell | 🔴 Geplant | LLM           | `npm run lint` exit 0 (Warnungen sichtbar, 0 neue Errors) |
| L2     | CI-Größen-Gate: lint ist bereits CI-Schritt — prüfen, ob Warnungen im CI-Log sichtbar sind; falls `--max-warnings` genutzt wird, Schwellwert dokumentiert setzen (Fail-soft-Übergang, erst Block nach Bereinigung der Bestandswarnungen)                                    | `.github/workflows/quality-ci.yml` (nur falls nötig), Regelkatalog §R10 | Sequenziell | 🔴 Geplant | LLM           | CI-Run grün mit sichtbarer Größenwarnung                  |
| L3     | Messung verweist: Sub-Sub #3 (gelesen/gebraucht) bleibt an Parent-Plan 09 gebunden — 1 Verweiszeile, kein eigener Meilenstein                                                                                                                                               | `../01_15_03a_code_modularisierung_regelkatalog.md` §R10                | Sequenziell | 🔴 Geplant | LLM           | Verweis konsistent mit Parent-Pos. 9                      |
| L4     | Niveau-Rückschreibung: §R10 Sub-Subs #1/#2 nach L1/L2                                                                                                                                                                                                                       | `../01_15_03a_code_modularisierung_regelkatalog.md`                     | Sequenziell | 🔴 Geplant | LLM           | Neuer R10-Schnitt dokumentiert                            |

**Fan-out-Check (Kriterium 5):** L0→L1→L2→L4 kausal — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Ist-Zustand (verifiziert 2026-09-14):** `eslint.config.mjs` hat keine Größenregel (nur `no-unused-vars` Z. 39, `no-console` Z. 55, `no-restricted-imports` three.js Z. 77; Basis `eslint-config-next/core-web-vitals` + `/typescript`). Die 800-Zeilen-Grenze existiert nur als Prosa in `coding-style.md` — kein automatisches Gate.
- **Schwellwert-Logik:** Warn 500 (unter dem Band, wo 133 Dateien heute liegen: 89 + 44) vs. Error 800 (Global-Regel-Max). Bei Einführung: 133 Dateien warnen → akzeptabel als Sichtbarkeits-Mechanismus; 0 Dateien errorn. Falls 133 Warnungen als zu laut befunden werden, Alternative: warn bei 600 (konsistent mit T_FRONTEND-Audit-Schwelle, dort 16 Dateien > 600) — Entscheidung im L0-Befund vorbereiten, Umsetzung LLM-Entscheidung.
- **Drift-Beleg:** T_FRONTEND-Audit 2026-09-13: 13→16 Dateien > 600 Z. seit 2026-09-02 — Struktur verfällt messbar ohne Gate.
- **Extern belegt:** Anthropic-Empfehlung: Verification-Checks in den Agent-Kontext hängen, damit Selbstkorrektur greift; maschinenlesbare Output-Formate (`file:line:col`).

## 3 — Expliziter Nicht-Scope

- Keine Bereinigung der Bestandswarnungen in diesem Plan (Fundliste = Input für R03/R09).
- Kein `max-lines-per-function` (Funktionsgrenze < 50 Z. bleibt Prosa-Regel; zu viele Falsch-Positiv-Kandidaten bei Framer-Motion-UI).
- Keine eigene Mess-Infrastruktur für gelesen/gebraucht (Parent-Plan 09).
- Kein Change am Pre-Commit-Hook (→ optionaler Folgeschritt nach Fahrzeit-Erfahrung).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L4 sequenziell → nach L4 `Executed (archiviert)`. Kein Jan-Gate (Lint-Warn-Level ist fail-soft; kein Live-Deploy).

## 5 — Execution-Log (2026-09-14)

**L0 — Baseline (gemessen):** 1.044 src-Dateien: 903 ≤ 300 Z., 93 in 300–500, 45 in 500–800, 3 > 800 (`database.types.ts` 2.055 generiert, `useCrashGameLoop.ts` 983, `wallet.ts` 881). Warn-500 hätte **140 Warnungen** erzeugt (Plan §2 „zu laut"-Fall eingetreten) — verworfen.

**L1 — Abweichung vom Plan, dokumentiert:** Der `max-lines`-Edit an `eslint.config.mjs` wurde vom **config-protection-Hook** blockiert („Modifying eslint.config.mjs is not allowed … disable the hook temporarily"). Hook-Disable erfordert Settings-Änderung = Jan-Gate (gleiche Klasse wie R08-L1) — nicht eigenmächtig umgangen. **Stattdessen (R07-Präzedenz):** gleichwertiges Hard-Gate als 0-Dependency-Script:

- `scripts/check-file-sizes.mjs` (NEU): error > 800 Z. für alle `src/**/*.{ts,tsx}`; `database.types.ts` ignoriert (generiert); `wallet.ts` + `useCrashGameLoop.ts` **grandfathered warn** (sichtbarer R03-Debt, blockiert nicht); INFO-Liste 600–800 Z. (19 Dateien, T_FRONTEND-Audit-Schwelle).
- `package.json`: `"check-file-sizes"` zwischen check-duplication und check-secret-rotation.
- **Verifikation:** Lauf = 2 WARN, 0 ERROR, exit 0; Negativtest mit 801-Z.-Temp-Datei → ERROR + exit 1; Temp-Datei gelöscht.
- **Fertiger eslint-Diff für Jan (optional, redundant zum Script):** Block `files: ['src/**/*.{ts,tsx}'], ignores: ['src/types/database.types.ts'], rules: { 'max-lines': ['error', { max: 800 }] }` + nachgelagerter Block für die 2 Legacy-Dateien mit `'max-lines': ['warn', { max: 800 }]` (Flat-Config last-wins). Hinweis: Warn-500/600-Band ist in Flat-Config mit Error-800 nicht kombinierbar (eine Regel = ein Schwellwert, last-wins).

**L2 — CI-Verankerung:** `quality-ci.yml` → `npm run check-file-sizes` **ohne** continue-on-error (Hard Gate) nach check-duplication, vor build. Legacy-Warns bleiben im CI-Log sichtbar. Kein `--max-warnings`-Konflikt (lint läuft separat).

**L3 — Messung:** Sub-Sub #3 (gelesen/gebraucht) bleibt an Parent-Plan 09 gebunden — unverändert, kein eigener Meilenstein.

**Ergebnis:** Gate aktiv und in CI blockierend; Struktur-Verfall ist ab jetzt messbar (19 Dateien in 600–800 als Beobachtungsliste = Input für künftige R03-Option-Gates).
