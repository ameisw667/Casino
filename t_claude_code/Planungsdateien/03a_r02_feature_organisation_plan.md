# 03a-R02 — Feature-based Organisation (Regel 2)

> **Status:** Executed (2026-09-14; L0–L3 ✅; L2-Entscheidung entfällt — Befund zeigt lebende Sandbox, kein Verwaist-Rest) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Bewahr-Protokoll + Rest-Klärung Sandbox; kein Umbau der Feature-Ordner-Struktur.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R2 (Niveau 87 %, kein 🔴-Bottleneck)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                         | Scope (Dateien)                                               | Ausführung  | Status     | Zuständigkeit | Verifikation                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------------------- |
| L0     | Baseline & Diagnose: Feature-Ordner-Verzeichnis bestätigen (games/[game], components/casino/games/[game], admin, guide-knowledge, chat-guide, dice/v2) + Abweichungen listen                                                                        | read-only: `src/**`                                           | Sequenziell | 🔴 Geplant | LLM           | Verzeichnisliste ohne unerwartete Layer-Ordner                      |
| L1     | Bewahr-Checkliste: 5-Zeilen-Regelsatz im Regelkatalog §R2 („neues Feature → Ordner unter src/components/casino/games/[game]/ + page unter src/app/games/[game]/; Layer-Dateien (Styles/Hook) im Feature-Ordner kolokiert; Sandbox bleibt getrennt") | `../01_15_03a_code_modularisierung_regelkatalog.md` §R2       | Sequenziell | 🔴 Geplant | LLM           | Checkliste konsistent mit `CLAUDE.md` § Games (kein CLAUDE.md-Edit) |
| L2     | Sandbox-Rest-Klärung: `AutoBetDrawerTestingClient.tsx` (793 Z.) auf Nutzungsreferenzen prüfen (Import-Graph, Route-Zuordnung); Befund als Option an Jan (behalten/entfernen)                                                                        | read-only: `src/app/testing/7.5/`, `src/components/casino/**` | Sequenziell | 🔴 Geplant | LLM           | Report mit Referenzliste; Entscheidung = Jan-Gate                   |
| L3     | Niveau-Rückschreibung: §R2 Sub-Sub #7 nach L2-Befund                                                                                                                                                                                                | `../01_15_03a_code_modularisierung_regelkatalog.md`           | Sequenziell | 🔴 Geplant | LLM           | Neuer R2-Schnitt dokumentiert                                       |

**Fan-out-Check (Kriterium 5):** Alle Meilensteine hängen kausal (L2→L3), Gesamtaufwand < 45 Min. — **kein Fan-out.**

## 2 — Self-Contained Kontext-Koffer

- **Vorbild-Strukturen (verifiziert 2026-09-14):** `src/components/casino/games/crash/` (Styles `crash-styles.ts`, Logik `crash-helpers.ts`, Hook `useCrashGameLoop.ts`, 6 UI-Komponenten), `src/components/casino/games/dice/v2/` (eigene Types, Audio, Komponenten, `__tests__/`), `src/lib/casino/guide-knowledge/` (13 Module), `src/lib/casino/chat-guide/` (index + 3 Module).
- **Golden Rule extern belegt:** „Kann ein Agent den vollen Kontext eines Features laden, ohne > 5 Dateien zu lesen?" — im Repo für Spiel-Tasks erfüllt (~2 Verzeichnisse).
- **Sandbox-Rest:** `src/app/testing/7.5/AutoBetDrawerTestingClient.tsx` ist 793 Z. und Top-5-größte Datei; `/testing`/`/v2` sind bewusste bare Sandboxes (siehe `CLAUDE.md` § Layout Shell) — Größe ist nur relevant, wenn der Sandbox-Code noch gelebt wird.

## 3 — Expliziter Nicht-Scope

- Kein Umbau/Umzug bestehender Feature-Ordner (additiv-Regel).
- Kein Löschen von Sandbox-Code (nur Befund + Jan-Option).
- Keine Verzeichnis-Doku (→ R06), keine Fassaden (→ R04).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L3 sequenziell → nach L3 `Executed (archiviert)`. Jan-Gate nur bei L2-Entscheidung (behalten/entfernen).

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Feature-Ordner-Verzeichnis bestätigt: `src/app/games/[game]/` + `src/components/casino/games/[game]/` (5 Spiele), `src/lib/casino/` Feature-Ordner (guide-knowledge, chat-guide, daily-race, guide-knowledge/content), `src/app/admin/`, Sandbox-Systematik `src/app/testing/` (25+ Ordner mit einheitlichem Client+`parts/`-Muster). Keine Layer-Ordner (keine globalen styles/hooks/components-Wurzel) gefunden.
- **L1:** ✅ 5-Punkte-Bewahr-Checkliste im Regelkatalog §R2 eingetragen (konsistent mit `CLAUDE.md` § Games/Service Layer — kein CLAUDE.md-Edit).
- **L2:** ✅ Rest-Klärung: `AutoBetDrawerTestingClient.tsx` (793 Z.) wird ausschließlich von `src/app/testing/7.5/page.tsx` importiert und folgt demselben Sandbox-Muster wie 7.1–7.6/fe-04–fe-50 (Design-Vergleichs-Sandboxes). **Befund: lebende Sandbox, kein verwaister Rest** — Jan-Gate (löschen/behalten) entfällt. Größe bleibt als reiner Lesefaktor, kein Handlungsbedarf in diesem Plan.
- **L3:** ✅ Re-Rating §R2: #7 65→85 (Verwaist-Verdacht entkräftet; einheitliches Sandbox-Muster verifiziert). Neuer R2-Schnitt: **88 %** (vorher 87 %; (90+85+85+85+90+90+85)/7 = 87,9).
