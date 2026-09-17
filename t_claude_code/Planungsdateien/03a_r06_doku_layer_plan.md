# 03a-R06 — Doku-Layer parallel zum Code (Regel 6)

> **Status:** Executed (archiviert) — L0–L3 ✅ · **Stand:** 2026-09-16 · **Owner:** LLM · **Scope:** Verzeichnis-Doku (Pilot + 1 ausgerollter Ordner) + Rollout-Regel; kein flächiger Rollout ohne gemessenen Nutzen.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R6 (Niveau 81 %, Bottleneck #3: 0 Verzeichnis-Dokus unter src/**)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                        | Scope (Dateien)                                         | Ausführung  | Status      | Zuständigkeit | Verifikation                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- | ----------- | ------------- | -------------------------------------------------------------- |
| L0     | Baseline & Diagnose: welche lokalen Konventionen existieren nur implizit im Crash-Ordner (Ref-Gruppen, Dep-Array-Semantik, Styles-Datei-Muster, Component-Aufteilung) — Material für den Piloten sammeln                                           | read-only: `src/components/casino/games/crash/**`       | Sequenziell | ✅ Erledigt | LLM           | Materialliste mit Datei:Zeile-Belegen                          |
| L1     | Pilot anlegen: `src/components/casino/games/crash/CLAUDE.md`, human-written, **< 50 Zeilen**, nur Zeiger + Gotchas (Dep-Array-Stable-Handle-Regel, Ref-Gruppen, Duplikat-Ziehmutter Plan 03 §2a) — keine Systemdetails, keine Kopie aus `xx_docs/` | `src/components/casino/games/crash/CLAUDE.md` (neu)     | Sequenziell | ✅ Erledigt | LLM           | < 50 Zeilen; 0 Duplikat-Absätze zu xx_docs/10_games_context.md |
| L2     | Evaluierungs-Mechanik: 1 Absatz im Regelkatalog §R6 — nach 1 Woche Praxis prüfen (wurde die Pilot-Doku gelesen? Hat sie einen Task verkürzt?), danach Rollout-Entscheidung (weitere Spiel-Ordner)                                                  | `../01_15_03a_code_modularisierung_regelkatalog.md` §R6 | Sequenziell | ✅ Erledigt | LLM           | Kriterienliste konsistent mit Parent-Pos. 9 (Messung)          |
| L3     | Niveau-Rückschreibung: §R6 Sub-Sub #3 nach Pilot + Rollout-Entscheid                                                                                                                                                                               | `../01_15_03a_code_modularisierung_regelkatalog.md`     | Sequenziell | ✅ Erledigt | LLM           | Neuer R6-Schnitt dokumentiert                                  |
| L4     | (neu, 2026-09-16) Rollout-Entscheid + Regel: 1 weiterer Ordner (`crash-multiplayer/`) ausgerollt, Regel für die übrigen Ordner fixiert                                                                                                             | `.../crash-multiplayer/CLAUDE.md` (neu), dieser Plan §5 | Sequenziell | ✅ Erledigt | LLM           | < 50 Zeilen, nur Zeiger + verifizierte Gotchas                 |

**Fan-out-Check (Kriterium 5):** L0→L1→L2→L3 kausal — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt.

## 2 — Self-Contained Kontext-Koffer

- **Lücke (verifiziert 2026-09-14):** 0 `CLAUDE.md`/`AGENTS.md`-Dateien unter `src/**` (Glob). Root-`CLAUDE.md` (On-Demand-Router) und `xx_docs/`+`xx_sop/` (Tiefe) sind Top-Niveau — die mittlere Schicht fehlte.
- **Extern belegt (Anthropic/Eth):** Tiered-Struktur Root (Pointer/Gotchas) → Verzeichnis (lokale Konventionen) → On-Demand (Tiefe); Verzeichnis-CLAUDE.md < 200 Zeilen, ideal < 50; **human-written** — LLM-generierte Doku senkt Task-Erfolg (−3 %) und treibt Kosten (+20 %).
- **Crash-Pilot-Begründung:** Ordner mit der höchsten Änderungs- und Lesefrequenz (2 Game-Loops, Duplikat-Thema) — größter möglicher Mess-Effekt für die Evaluierung.
- **Gotchas für den Piloten (bereits verifiziert):** Dep-Array-Stable-Handle-Semantik (beide Game-Loop-Dateien dokumentieren sie), Ref-Gruppen Z. 42/49/57, `crash-styles.ts`/`crash-helpers.ts`-Muster.
- **Ordner-Größen (gemessen 2026-09-16, `.ts/.tsx`):** blackjack 23 Dateien/4.659 Z. · roulette 17/2.962 · slots 15/2.714 · dice 12/2.878 · crash-multiplayer 12/2.304 · crash 10/2.596 · `src/lib/casino/` 169/21.987 (ausgenommen, s. §5).

## 3 — Expliziter Nicht-Scope

- Kein flächiger Rollout: pro weiterem Ordner gilt die Regel in §5 (Schwelle + 1-Woche-Evaluierung), nicht „alle Spielordner auf einmal".
- Keine Verzeichnis-Doku für `src/lib/casino/` (169 Dateien, 21.987 Z.): eine Ordner-Doku müsste dort unscharf werden und würde `xx_docs/05_service_layer_context.md` duplizieren — die Service-Layer-Vertragsdocs sind der zuständige Ort.
- Kein Edit an Root-`CLAUDE.md`/`AGENTS.md` (Editierverbot ohne Freigabe).
- Keine Kopie von SOP/xx_docs-Inhalten in die Verzeichnis-Doku (Deduplizierungs-Regel).
- Keine LLM-generierte Massendoku.

## 4 — Lebenszyklus

`Execution-Ready` → L0–L2 → Rollout-Entscheid (2026-09-16, Jan delegiert) → L3/L4 Rückschreibung → `Executed (archiviert)`. Weitere Ordner folgen der Regel in §5 ohne erneutes Jan-Gate (Entscheidung ist delegiert und die Regel ist die Entscheidung).

## 5 — Execution-Log

**2026-09-14:**

- **L0:** ✅ Material verifiziert mit Zeilenbelegen: Ordner-Inventar (9 Dateien, 2574 Z. gesamt; `useCrashGameLoop.ts` 982 Z., `crash-helpers.ts` 106 Z., `crash-styles.ts` 94 Z.), Dep-Array-Regel + Ref-Gruppen (beide Game-Loop-Dateien), Duplikat-Thema (`useCrashMultiplayerGameLoop.ts`).
- **L1:** ✅ Pilot angelegt: `src/components/casino/games/crash/CLAUDE.md` — **18 Zeilen** (< 50), 4 Gotchas (Dep-Array-Stable-Handle, Ref-Gruppen, Duplikat-Ziehmutter mit Plan-03-Verweis, Settlement-kein-Client-Berechnung), nur Zeiger auf `xx_docs/10` + `xx_sop/04`, 0 kopierte Systemdetails.
- **L2:** ✅ Evaluierungs-Mechanik in §R6 verankert: 3 Mess-Kriterien (gelesen? Task verkürzt? noch aktuell?) nach 1 Woche; Threshold ≥ 2/3; Anti-Regel „keine Doku pro Doku" explizit.
- **L3:** ✅ Re-Rating §R6: #3 20→55 (Pilot lebt, Rollout offen). Neuer R6-Schnitt: **81 %** (vorher 75 %; (90+95+55+85+90+70)/6 = 80,8).

**2026-09-16 — Rollout-Entscheid (Jan hat delegiert: „das kannst du für mich entscheiden, was da bestmöglich ist"):**

- **Entscheidung:** _kein flächiger Rollout, aber genau 1 weiterer Ordner jetzt_ → `src/components/casino/games/crash-multiplayer/CLAUDE.md` (**21 Zeilen**, `wc -l`). Begründung: der Ordner hat dieselben Gotchas wie der Pilot (Dep-Array-Semantik, Duplikat-Ziehmutter) und wird durch den gewählten X3-Schnitt (Plan 03 §2a, `crash-loop/`) ohnehin gelesen — der Nutzen ist sofort belegbar statt spekulativ. Alle anderen Ordner haben keine vergleichbare Konvention, die ohne die Doku verloren gehen würde.
- **Regel für die übrigen Ordner (fixiert, keine erneute Rückfrage):** Rollout erst, wenn der Ordner **≥ 5 `.ts/.tsx`-Dateien hat UND mindestens eine nicht-selbstverständliche Konvention besitzt** UND ein vorheriger Ordner die 3 Mess-Kriterien (gelesen? Task verkürzt? noch aktuell?) mit ≥ 2/3 bestanden hat. Reihenfolge nach Dateigröße: **blackjack → roulette → slots → dice**. `src/lib/casino/` bleibt ausgenommen (§3).
- **Anti-Regel bleibt scharf:** keine Ordner-Doku, die nur Dateinamen wiederholt; jede neue Datei muss eine Fehlerquelle benennen, die ohne sie übersehen würde.
- **Verifikation:** 21 Zeilen (< 50); alle Gotchas gegengeprüft (Z. 32, 611, 761, 771–778, 781), `index.ts`-Fassade und `__tests__/crash-multiplayer-styles.test.ts` per Glob gegen den Ordner bestätigt (12 `.ts/.tsx`); bewusst nur 5 Datei-Rollen genannt — die 6 trivialen UI-Komponenten stehen in `index.ts` (Anti-Regel „keine Dateinamen-Wiederholung"); 0 kopierte Systemdetails, nur Zeiger.
