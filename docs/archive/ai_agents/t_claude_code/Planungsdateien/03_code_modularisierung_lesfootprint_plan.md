# 03 — Code-Modularisierung für Lesefootprint (Subkategorie #3)

> **Status:** Executed (2026-09-14; Analyse-Teil vollumfänglich; **Option-Wahl am 2026-09-16 abgeschlossen — Gate 2 = X3**, Jan hat die Wahl delegiert; **X3 am 2026-09-18 ausgeführt** — [03b-Umsetzungsplan](03b_x3_crash_loop_schnitt_plan.md), Hooks 849/663 Z., Katalog R7 68→78 % / R3 62→72 %; offen bleibt nur W3) · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Analyse und Refactor-Vorbereitung der 2 Hotspots (Crash-Loop-Duplikation, >800-Zeilen-Kandidaten); keine Implementation von Game-Logik-Refactors ohne separate Option-Gate-Entscheidung, keine Mess-Infrastruktur (Plan 09).
> **Money-Pfad:** Nein (Analyse read-only; ein späterer `wallet.ts`-Refactor hätte Money-Pfad: Ja und ist bewusst aus diesem Plan ausgeschlossen) · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_03_code_modularisierung_lesfootprint.md`](../01_15_03_code_modularisierung_lesfootprint.md) (Schnitt Top 25 %, 2 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 3

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                     | Scope (Dateien)                                                                                                            | Ausführung  | Status                                                  | Zuständigkeit | Verifikation                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- | ------------- | ------------------------------------------------------------- |
| L0     | Duplikations-Analyse Crash vs. Crash-Multiplayer Game-Loop: gemeinsame Logik identifizieren, Extraktions-Optionen (shared hook / shared module) skizzieren — Bottleneck #3      | read-only: `src/components/casino/games/crash/useCrashGameLoop.ts`, `.../crash-multiplayer/useCrashMultiplayerGameLoop.ts` | Sequenziell | ✅ Umgesetzt                                            | LLM           | Analyse-Dokument mit ≥ 2 Optionen + Risiken, keine Code-Edits |
| L1     | Option-Gate-Vorlage für die L0-Optionen (Lerneffekt/Aufwand/Risiko/Wartbarkeit) vorbereiten und Jan zur Entscheidung vorlegen                                                   | diese Planungsdatei, Chat-Übergabe                                                                                         | Sequenziell | ✅ Erledigt — 2. Fassung: 3 Optionen ≥ 4,20; X3 gewählt | LLM           | Matrix nach `xx_sop/01`-Format, Pre-Mortem für Führungsoption |
| L2     | Bewahr-Protokoll: Hotspot-Datei-Liste (4× >800, Store-Test 1.254) + ≤300-Zeilen-Ziel als 2 Zeilen in den Output-Caps-Baustein von Plan 05 übernehmen — Bottleneck #4-Verbindung | `Planungsdateien/05_tool_output_oekonomie_plan.md`                                                                         | Sequenziell | ✅ Umgesetzt                                            | LLM           | Liste konsistent mit Messung 2026-09-16                       |
| L3     | Niveau-Rückschreibung: `01_15_03` + Parent-Position 3 neu bewerten (nach Option-Wahl bzw. bewusstem Verbleib)                                                                   | `t_claude_code/01_15*.md`                                                                                                  | Sequenziell | ✅ Umgesetzt                                            | LLM           | Schnitt-Update dokumentiert                                   |

**Fan-out-Check (Kriterium 5):** L0-L1 hängen zusammen (L1 braucht L0-Ergebnis), L2 hängt an Plan 05 — **kein Fan-out.** Kriterium 6: < 45 Min. gesamt, sequenziell.

## 2 — Self-Contained Kontext-Koffer

- **Messbasis (nachgemessen 2026-09-18, nach X3 + W3):** 1.044 TS/TSX-Dateien unter `src/` (X3 hat 10 Dateien ergänzt, W3 weitere 5; das CI-Gate zählt heute 1.071 inkl. Fremd-Zugänge); **1** > 800: `src/types/database.types.ts` (2.054, generiert — bewusst NICHT refactorbar). Die beiden echten Ausreißer sind behoben: `src/components/casino/games/crash/useCrashGameLoop.ts` (**849** nach X3, vorher 982) und `src/lib/casino/wallet.ts` (**569** nach W3, vorher 880; Money-Pfad, aus der Legacy-Warnliste von `check-file-sizes` entfernt). Der frühere vierte Ausreißer `src/store/__tests__/useCasinoStore.test.ts` (1.254, Zahlen der Erstrunde 2026-09-14) wurde durch **03a-R09 am 2026-09-14 aufgeteilt** (5 Module + 2 Helper, größtes Modul 394 Z.) und ist damit kein Hotspot mehr.
- **Duplikations-Kern (Bottleneck #3) — ✅ geschlossen am 2026-09-18:** `crash/useCrashGameLoop.ts` (**849**, vorher 982) vs. `crash-multiplayer/useCrashMultiplayerGameLoop.ts` (**663**, vorher 782). Ein Crash-Task liest statt ~1.764 Zeilen jetzt das gemeinsame `crash-loop/`-Modul plus den Rest des betroffenen Hooks (~1.512 Zeilen zusammen, davon der geteilte Teil nur einmal).
- **Money-Pfad-Hinweis:** Game-Loops berechnen keine Settlement-/Wallet-Werte (RNG/Settlement liegt im Service-Layer), aber Crash-Spiellogik ist heikel genug, dass jede Extraktion über das Option-Gate mit Risiko-Scoring laufen muss; `wallet.ts` selbst ist aus diesem Plan komplett ausgeschlossen.
- **Bottleneck #4 (gelesen/gebraucht nie gemessen)** ist abhängig von Plan 09 (Messung) — hier bewusst nur als Verweis, kein eigener Meilenstein.

## 3 — Expliziter Nicht-Scope

- Kein `wallet.ts`-Refactor (Money-Pfad) und kein `database.types.ts`-Refactor (generiert).
- Keine Implementation der Crash-Loop-Extraktion in diesem Plan — erst nach Option-Gate-Freigabe ein separater Umsetzungsplan.
- Keine Test-Datei-Aufteilung (Bewahr-Bewertung Top 30 %, kein Bottleneck; inhaltlich durch R09 überholt: Split gehoben, Bewertung bestätigt).

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (Gate: L1-Option-Wahl — **am 2026-09-16 abgeschlossen: X3, 4,20**) → `Execution-Ready` → `In Execution` → nach L3 `Executed (archiviert)`; die Umsetzung der gewählten Option läuft in einem separaten Implementation-Plan — **beide am 2026-09-18 ausgeführt**: [03b](03b_x3_crash_loop_schnitt_plan.md) (X3) und [03c](03c_w3_wallet_service_schnitt_plan.md) (W3, Money-Pfad); beide stehen auf `Executed` und bleiben als Nachweis im Planungsordner. Offen sind nur noch die Abnahmen durch Jan (Sichtprüfung der beiden Crash-Seiten, Klick-Check der Promo-Route).

## 2a — Option-Gate-Matrix (2. Fassung 2026-09-16; Vorlage nach `xx_sop/01`; Basis: L0-Analyse via casino-code-explorer, 2026-09-14)

**Skala, Gewichte (Lerneffekt 30 / Aufwand 25 / Risiko 25 / Wartbarkeit 20) und Mindestbar 4,20** sind verbindlich in [03a-R03 §2a](03a_r03_single_responsibility_plan.md) definiert und werden hier nicht dupliziert. Score = 0,30·L + 0,25·A + 0,25·R + 0,20·W.

**L0-Kernbefund (nachgemessen 2026-09-16):** 982 + 782 Zeilen Loops, ~350–360 Zeilen verifizierte Duplikation in 4 verbatim Blöcken (Particles, Explosion, Tail, DPR/Shake/Starfield). Größter Block: gameLoop-Body (~125 Zeilen, Crash-Resolution/`settleCrashedRound`-Timing als einzige echte Divergenz in 2 kleinen Callbacks). Beide Dateien dokumentieren explizit, dass verbatim erhaltene Dep-Arrays die Stable-Handle-Semantik sichern — jede Extraktions-Option muss das respektieren. Neues Modul: **`src/components/casino/games/crash-loop/`** (Geschwister beider Feature-Ordner; Regel R2 verbietet den Import quer in einen der beiden konkurrierenden Ordner).

| Option                                            | Skizze                                                                                                                                                                                         | Footprint-Gewinn                                                                                  | L (30 %) | A (25 %) | R (25 %) | W (20 %) |  Score   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | :------: | :------: | :------: | :------: | :------: |
| **X1 — Reine Mathematik zuerst**                  | Particles-Physik, Tail-Geometrie, DPR/Shake-Mathematik als pure Functions (kein Canvas-Zugriff, kein Draw-Call) in `crash-loop/` + erste Unit-Tests für Crash-Animationscode (heute 0)         | ~100–130 Dup-Zeilen raus; Animationscode erstmals testbar, keine Optik-Änderung möglich           |   4.5    |   4.5    |   5.0    |   4.5    | **4,63** |
| **X2 — Charakterisierende Tests zuerst**          | Verhalten der 4 Dup-Blöcke + gameLoop-Body mit jsdom/RAF-Fake festnageln; kein Produktionscode berührt                                                                                         | 0 Zeilen sofort; Sicherheitsnetz für den Draw-Anteil von X3                                       |   4.5    |   3.5    |   5.0    |   4.5    | **4,38** |
| **X3 — Utility-Modul + Pure Functions (gewählt)** | Schritt 0 = X1, dann die 4 Dup-Blöcke 1:1 mit Parametern in `crash-loop-shared.ts` (Tail-Nozzle MP 0,45 vs. Solo 0,35 als Parameter, kein Code-Umbau), Dep-Arrays verbatim, Visual-QC je Block | ~150–160 Zeilen raus; Modul-Grenze etabliert, Hooks lesen sich auf ihre Modus-Spezifika reduziert |   3.5    |   4.5    |   4.5    |   4.5    | **4,20** |

**Unter der Mindestbar (nur Fernziel, 1. Fassung zum Vergleich):** A — Gemeinsamer Hook mit Strategy-Injection **3,03** (4.5/2.0/1.5/4.0) · C — Teil-Extraktion des RUNNING-Ticks **3,13** (3.5/3.0/2.5/3.5) · D — B+C kombiniert **3,35** (3.5/3.5/2.5/4.0). _In der 1. Fassung war A mit 3,1 ausgewiesen — Rechenfehler, korrekt ist 3,03._

**Pre-Mortem Führungsoption (X3):** Scheiterszenario = Tail-Parametrisierung (Nozzle-Variante MP 0,45 vs. Solo 0,35) wird falsch parametrisiert und Visual-Divergenz entsteht. Gegenmaßnahme: Extraktion 1:1 mit Parameter statt Codeänderung, Visual-QC je Block (Design-Guardian-Stufe 6). Zweites Szenario: RAF-Bootstrap-Utility versteckt das Mobile-Delay (MP Z. 771–774) — bleibt bewusst im MP-Hook. Drittes: `draw()` divergiert pro Modus und wird versehentlich mitvereinheitlicht — `draw()` bleibt pro Hook.

**Pre-Mortem X1 (Schritt 0):** Scheiterszenario = eine „pure" Funktion greift doch auf Canvas/DOM zu und ist dann nicht testbar. Gegenmaßnahme: Signatur-Audit vor dem Verschieben (nur Zahlen/Arrays rein, nur Zahlen/Arrays raus); alles, was `ctx` braucht, bleibt im Hook.

**Score-Logik:** X1 führt wegen Risiko 5,0 (keine Verhaltensänderung möglich, erstmals Tests für diesen Code). X3 liegt exakt an der Bar: Aufwand und Risiko sind niedriger bewertet als bei einem Strategy-Umbau, aber höher als bei X1, weil hier Canvas-Draw-Code bewegt wird (Optik-Divergenz möglich, daher Visual-QC). X2 kostet echten Harness-Aufwand und bringt sofort keinen Footprint-Gewinn — es ist das Sicherheitsnetz, kein Zielpfad.

**Entscheidung (2026-09-16, Jan-delegiert): X3** mit X1 als Schritt 0 (und X2 als empfohlenem Zusatz-Netz vor dem Draw-Anteil). Begründung: X1 allein entfernt nur den mathematischen Anteil der Duplikation; X3 hebt den kompletten Block und besteht ausschließlich aus Schritten ≥ 4,20. Umsetzung in einem separaten Implementation-Plan — **Klartext-Erklärung für Jan:** [`../01_15_03b_w3_x3_erklaerung.md`](../01_15_03b_w3_x3_erklaerung.md) §4.

## 5 — Execution-Log

**2026-09-14:**

- **L0:** Duplikations-Analyse via `casino-code-explorer` (46.6k Subagent-Tokens, read-only, 2 Dateien gescoped). Ergebnis: ~350–360 Dup-Zeilen, 4 Blöcke verbatim, gameLoop-Body ~125 Zeilen größter Block; Modus-Spezifika (Status-Union, draw()-Visuals, History-Keys, Mobile-Delay) nicht extrahierbar.
- **L1:** Option-Gate-Matrix oben (§2a, 1. Fassung, Optionen A–D) mit Scores, Pre-Mortem für Führungsoption B und LLM-Empfehlung.
- **L2:** Cross-Check erledigt: die Hotspot-Datei-Liste ist bereits 1:1 im Kontext-Koffer von Plan 05 §2 enthalten — keine Doppelpflege nötig, Verweis hergestellt.

**2026-09-16 (2. Fassung nach Jan-Vorgabe „3 Optionen ≥ 4,20"):**

- **L1 neu:** Matrix auf X1/X2/X3 umgebaut (4,63 / 4,38 / 4,20) mit Referenz auf die Skala-Definition in R03 §2a; A/C/D als unter-Bar-Fernziel ausgewiesen; Rechenfehler der 1. Fassung (A 3,1 → 3,03) korrigiert.
- **Modul-Ort entschieden:** `src/components/casino/games/crash-loop/` als Geschwister beider Feature-Ordner (R2-konform, kein Quer-Import).
- **Nachmessung:** Solo-Loop 982 Z., MP-Loop 782 Z. (Pfad `crash-multiplayer/`), wallet.ts 880 Z., database.types 2054 Z. — Kontext-Koffer auf diesen Stand gezogen (Store-Test-Eintrag als durch R09 überholt markiert).
- **L3:** ✅ Gate 2 = **X3** (mit X1 als Schritt 0) dokumentiert; Umsetzung im separaten Implementation-Plan, nicht hier.

**2026-09-18 (X3 umgesetzt — Nachweis im Implementation-Plan):**

- **Ergebnis (aus [03b](03b_x3_crash_loop_schnitt_plan.md), gemessen per `wc -l`):** `crash/useCrashGameLoop.ts` **982 → 849** Z., `crash-multiplayer/useCrashMultiplayerGameLoop.ts` **782 → 663** Z.; 332 Zeilen entfernt, 80 Zeilen Hüllen/Importe zurück (netto −252). Neu: `src/components/casino/games/crash-loop/` mit 5 Modulen + Fassade und **71 Tests** (37 pure, 34 Charakterisierung) — dieser Code hatte vorher **0** Tests. Suite 1942 → **2013 Tests grün**.
- **Plan-Korrektur bei der Umsetzung:** Der Tail-Block unterscheidet sich in **zwei** Punkten (Spreizung 0,35/0,45 **und** Herkunfts-Strategie Dual-Düse vs. Einzelpunkt), nicht nur in der Nozzle-Konstante — gelöst über einen Herkunfts-Resolver; die Matrix-Annahme „nur Parameter" war an dieser Stelle zu grob. Details §2 des 03b-Plans.
- **Wirkung auf diesen Plan:** Position 3 dieser Subkategorie ist damit von der Entscheidung zur Tat geworden (§2a-Matrix bleibt als Entscheidungsnachweis stehen).

**2026-09-18 (W3 ebenfalls umgesetzt — Nachweis im Implementation-Plan):**

- **Ergebnis (aus [03c](03c_w3_wallet_service_schnitt_plan.md), gemessen per `wc -l`):** `src/lib/casino/wallet.ts` **880 → 569** Z. (Geld-Kern: 12 echte Verfahren + 14 Delegationen); `wallet-contract.ts` **271 Z.** (7 Domänen-Verträge); neu `wallet-social.ts` 41 · `wallet-seeds.ts` 87 · `wallet-gamification.ts` 134 · `wallet-promo.ts` 148 Z.; **+37 Tests**, Suite 2013 → **2050 grün**. Damit ist **kein echter >800-Ausreißer** mehr offen — nur der generierte `database.types.ts` (R8-Read-Deny, Jan-Gate).
- **Abgrenzung:** `wallet.ts` war in diesem Plan (03) ausdrücklich **Nicht-Scope** (Money-Pfad) — die Umsetzung lief deshalb im eigenen Plan 03c mit `@security-reviewer`-PASS, nicht hier. Der Nicht-Scope-Vermerk in §3 bleibt als damalige Grenzziehung stehen.
- **Ordnerdoku-Warnung:** die beiden Ordner-`CLAUDE.md` (`crash/`, `crash-multiplayer/`) nennen noch die **alten** Zeilennummern des jeweiligen Hooks; Aktualisierung nur mit Jan-Freigabe (exakte alte→neue Nummern im 03b-Log).
