# 03a-R06 — Doku-Layer parallel zum Code (Regel 6)

> **Status:** Executed (2026-09-14; L0–L2 + L3 ✅; Rollout = 1-Woche-Evaluierung → Jan-Gate offen, siehe §R6 Mechanik; R6 75→81 %) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** 1 Pilot-Verzeichnis-Doku + Evaluierungs-Mechanik; kein Rollout auf weitere Ordner vor Jan-Entscheidung.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R6 (Niveau 75 %, Bottleneck #3: 0 Verzeichnis-Dokus unter src/**)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                        | Scope (Dateien)                                         | Ausführung  | Status     | Zuständigkeit | Verifikation                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- | ---------- | ------------- | -------------------------------------------------------------- |
| L0     | Baseline & Diagnose: welche lokalen Konventionen existieren nur implizit im Crash-Ordner (Ref-Gruppen, Dep-Array-Semantik, Styles-Datei-Muster, Component-Aufteilung) — Material für den Piloten sammeln                                           | read-only: `src/components/casino/games/crash/**`       | Sequenziell | 🔴 Geplant | LLM           | Materialliste mit Datei:Zeile-Belegen                          |
| L1     | Pilot anlegen: `src/components/casino/games/crash/CLAUDE.md`, human-written, **< 50 Zeilen**, nur Zeiger + Gotchas (Dep-Array-Stable-Handle-Regel, Ref-Gruppen, Duplikat-Ziehmutter Plan 03 §2a) — keine Systemdetails, keine Kopie aus `xx_docs/` | `src/components/casino/games/crash/CLAUDE.md` (neu)     | Sequenziell | 🔴 Geplant | LLM           | < 50 Zeilen; 0 Duplikat-Absätze zu xx_docs/10_games_context.md |
| L2     | Evaluierungs-Mechanik: 1 Absatz im Regelkatalog §R6 — nach 1 Woche Praxis prüfen (wurde die Pilot-Doku gelesen? Hat sie einen Task verkürzt?), danach Rollout-Entscheidung (weitere Spiel-Ordner) als Jan-Gate                                     | `../01_15_03a_code_modularisierung_regelkatalog.md` §R6 | Sequenziell | 🔴 Geplant | LLM           | Kriterienliste konsistent mit Parent-Pos. 9 (Messung)          |
| L3     | Niveau-Rückschreibung: §R6 Sub-Sub #3 nach Pilot                                                                                                                                                                                                   | `../01_15_03a_code_modularisierung_regelkatalog.md`     | Sequenziell | 🔴 Geplant | LLM           | Neuer R6-Schnitt dokumentiert                                  |

**Fan-out-Check (Kriterium 5):** L0→L1→L2→L3 kausal — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Lücke (verifiziert 2026-09-14):** 0 `CLAUDE.md`/`AGENTS.md`-Dateien unter `src/**` (Glob). Root-`CLAUDE.md` (On-Demand-Router) und `xx_docs/`+`xx_sop/` (Tiefe) sind Top-Niveau — die mittlere Schicht fehlt.
- **Extern belegt (Anthropic/Eth):** Tiered-Struktur Root (Pointer/Gotchas) → Verzeichnis (lokale Konventionen) → On-Demand (Tiefe); Verzeichnis-CLAUDE.md < 200 Zeilen, ideal < 50; **human-written** — LLM-generierte Doku senkt Task-Erfolg (−3 %) und treibt Kosten (+20 %).
- **Crash-Pilot-Begründung:** Ordner mit der höchsten Änderungs- und Lesefrequenz (2 Game-Loops, Duplikat-Thema) — größter möglicher Mess-Effekt für die Evaluierung.
- **Gotchas für den Piloten (bereits verifiziert):** Dep-Array-Stable-Handle-Semantik (beide Game-Loop-Dateien dokumentieren sie), Ref-Gruppen Z. 42/49/57, `crash-styles.ts`/`crash-helpers.ts`-Muster.

## 3 — Expliziter Nicht-Scope

- Kein Rollout auf weitere Ordner vor Evaluierung (Jan-Gate).
- Kein Edit an Root-`CLAUDE.md`/`AGENTS.md` (Editierverbot ohne Freigabe).
- Keine Kopie von SOP/xx_docs-Inhalten in die Verzeichnis-Doku (Deduplizierungs-Regel).
- Keine LLM-generierte Massendoku.

## 4 — Lebenszyklus

`Execution-Ready` → L0–L2 → nach 1 Woche Evaluierung → Jan-Gate (Rollout ja/nein) → L3 Rückschreibung → `Executed (archiviert)`.

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Material verifiziert mit Zeilenbelegen: Ordner-Inventar (9 Dateien, 2574 Z. gesamt; `useCrashGameLoop.ts` 982 Z., `crash-helpers.ts` 106 Z., `crash-styles.ts` 94 Z.), Dep-Array-Regel + Ref-Gruppen (beide Game-Loop-Dateien), Duplikat-Thema (`useCrashMultiplayerGameLoop.ts`).
- **L1:** ✅ Pilot angelegt: `src/components/casino/games/crash/CLAUDE.md` — **18 Zeilen** (< 50), 4 Gotchas (Dep-Array-Stable-Handle, Ref-Gruppen, Duplikat-Ziehmutter mit Plan-03-Verweis, Settlement-kein-Client-Berechnung), nur Zeiger auf `xx_docs/10` + `xx_sop/04`, 0 kopierte Systemdetails.
- **L2:** ✅ Evaluierungs-Mechanik in §R6 verankert: 3 Mess-Kriterien (gelesen? Task verkürzt? noch aktuell?) nach 1 Woche; Rollout = Jan-Gate, Threshold ≥ 2/3; Anti-Regel „keine Doku pro Doku" explizit.
- **L3:** ✅ Re-Rating §R6: #3 20→55 (Pilot lebt, Rollout offen). Neuer R6-Schnitt: **81 %** (vorher 75 %; (90+95+55+85+90+70)/6 = 80,8).
