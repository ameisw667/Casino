# 03a-R03 — Ein Verantwortungsbereich pro Modul (Regel 3)

> **Status:** Executed (archiviert) — L0–L4 ✅ · **Stand:** 2026-09-16 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Option-Gate-Vorbereitung für die 3 Mixed-Concern-Hotspots (Crash-Loop-Hook, Multiplayer-Duplikat, WalletService); keine Logik-Implementierung in diesem Plan.
> **Money-Pfad:** Ja (WalletService-Analyse read-only; späterer Refactor hätte Money-Pfad: Ja) · **Security-Review:** Pflicht (read-only Analyse)
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R3 (Niveau 62 %, Bottlenecks #1/#2/#5) · verknüpft mit [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) (Crash-Option-Matrix) und R01-L3 (Ref-Bündelungs-Skizze)
> **Gate-Abschluss (2026-09-16):** Jan hat die Optionswahl delegiert („das kannst du für mich entscheiden"). Ergebnis: **Gate 1 = W3**, **Gate 2 = X3** (beide ≥ Mindestbar 4,20, §2a/§2b 2. Fassung). Umsetzung erfolgt **nicht** in diesem Plan, sondern in separaten Implementation-Plänen. **Klartext-Erklärung für Jan (Einstieg, ohne Fachvokabular):** [`../01_15_03b_w3_x3_erklaerung.md`](../01_15_03b_w3_x3_erklaerung.md).

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                     | Scope (Dateien)                                                                                | Ausführung  | Status      | Zuständigkeit | Verifikation                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- | ----------- | ------------- | ---------------------------------------------------------------- |
| L0     | Baseline & Diagnose: die 3 Mixed-Concern-Hotspots mit Z-Bereichen und Trenn-Grenzen dokumentieren                                                                                                                                                                               | read-only: `useCrashGameLoop.ts`, `useCrashMultiplayerGameLoop.ts`, `src/lib/casino/wallet.ts` | Sequenziell | ✅ Erledigt | LLM           | Befundliste konsistent mit Regelkatalog §R3                      |
| L1     | Option-Gate-Vorlage `WalletService`: 2–3 Slicing-Optionen (z. B. A: Domänen-Module + Fassade `WalletService` bleibt API; B: nur Abschnittsmarker R01-L1 + Proxy-Delegation; C: bewusst Status quo) nach `xx_sop/01`-Schema (Lerneffekt/Aufwand/Risiko/Wartbarkeit + Pre-Mortem) | read-only: `wallet.ts`, `xx_docs/05_service_layer_context.md`                                  | Sequenziell | ✅ Erledigt | LLM           | Matrix nach `xx_sop/01`-Format, 3 Optionen ≥ 4,20                |
| L2     | Crash-Hotspots: Verweis-Konsolidierung — Plan-03-Optionen B/C/D + R01-L3 Ref-Bündelungs-Skizze zu einer Entscheidungsvorlage zusammenführen (keine Doppel-Analyse)                                                                                                              | diese Planungsdatei, [Plan 03](03_code_modularisierung_lesfootprint_plan.md)                   | Sequenziell | ✅ Erledigt | LLM           | 1 Vorlage, 0 Widersprüche zwischen Plan 03 und R01-L3            |
| L3     | Übergabe an Jan: beide Option-Gates (WalletService-Slicing, Crash-Extraktion) zur Entscheidung vorlegen — Entscheidung = Jan-Gate                                                                                                                                               | Chat-Übergabe                                                                                  | Sequenziell | ✅ Erledigt | Jan → LLM     | Jan hat 2026-09-16 delegiert; Wahl W3/X3 dokumentiert            |
| L4     | Niveau-Rückschreibung nach Jan-Entscheidung                                                                                                                                                                                                                                     | `../01_15_03a_code_modularisierung_regelkatalog.md`                                            | Sequenziell | ✅ Erledigt | LLM           | R3 bleibt 62 % (Code-Realität unverändert), §R3-Hebel präzisiert |

**Fan-out-Check (Kriterium 5):** L1 und L2 sind unabhängig lesbar, aber beide münden in dieselbe Jan-Übergabe (L3) und sind jeweils < 10 Min. — gebündelt sequenziell, **kein Fan-out** (Kriterium 6: < 45 Min. gesamt).

## 2 — Self-Contained Kontext-Koffer

- **Hotspot 1/2 (Crash-Loops):** 3-Sektions-Closure-Struktur in beiden Hooks (Physics/Draw/RAF), ~15+ shared Refs; Duplikat-Analyse + Optionen A–D inkl. Scores und Pre-Mortem stehen fertig in [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) — hier wird nur konsolidiert, nicht neu analysiert. Beide Dateien dokumentieren, dass verbatim erhaltene Dep-Arrays die Stable-Handle-Semantik sichern — jede Extraktion muss das respektieren.
- **Hotspot 3 (WalletService):** 1 Klasse Z. 77–880 (Messung 2026-09-16), ~26 statische Methoden über 7 Domänen (Domänen-Map Z. 78–86: Wallet & Settlement, Provably-Fair Seeds, Crash-Reconciliation & Multiplayer, Promo-Codes, Gamification, Social & Chat, Analytics). Klasse ist einzige Vertragsquelle der Geld-RPCs (Z. 16–20). Vorlage-Hilfsmodule existieren bereits (`db-retry`, `json-value`, `wallet-contract`, `daily-race` Z. 3–12).
- **Neuer Befund 2026-09-16 (Marker ≠ Domäne):** die 6 physischen Abschnittsmarker (Z. 159 Seeds-Verbrauch, 251 Crash-Reconciliation, 392 Promo, 539 Gamification, 598 Seeds-Verwaltung, 651 Social) decken die Domänen nicht 1:1 ab: `settleRound` (Z. 330) und `advanceBlackjackRound` (Z. 357) liegen im Crash-Block, `startRound` (Z. 188) und `getActiveRound` (Z. 229) im Seeds-Block, `getJackpotPool` (Z. 714), `getDailyRaceStandings` (Z. 729) und `emitBigWinNotifyEvent` (Z. 814) im Social-Block. Beide Optionen unter §2a schneiden deshalb an **Domänen**-Grenzen und verschieben die Marker mit — markertreues Schneiden würde Geld- und Nicht-Geld-Code im selben Modul lassen.
- **Money-Pfad-Regel:** Wallet-Refactor nur nach `xx_sop/05_database_supabase.md` + `xx_sop/06_service_layer_casino.md` Lektüre und `@migration-security-guard`-Review; atomic RPCs (Migration 007) dürfen nicht berührt werden.
- **Anti-Pattern-Beidseitigkeit:** Riesen-Datei UND file-per-function sind Anti-Patterns — Zielband 200–400 Z./Modul, 800 Z. hart (Global-Regel `coding-style.md`).

## 3 — Expliziter Nicht-Scope

- Keine Code-Implementierung der Slicing-Optionen (separate Umsetzungspläne nach Gate-Abschluss).
- Kein Touch der atomic RPCs / Migrationen.
- Kein Multiplayer-Refactor außerhalb der konsolidierten Vorlage (dieselbe Option-Wahl, am 2026-09-16 mit **X3** geschlossen).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L2 sequenziell → Jan-Gate L3 (Wahl delegiert 2026-09-16) → L4 Rückschreibung → `Executed (archiviert)`.

## 2a — L1-Ergebnis: Option-Gate-Matrix WalletService (2. Fassung 2026-09-16; Jans Vorgabe: 3 Optionen ≥ 4,20)

**Basis:** `WalletService` in `src/lib/casino/wallet.ts` (Z. 77–880, gemessen 2026-09-16): 26 statische Methoden, 7 Domänen. Atomic RPCs (Migration 007) bleiben in allen Optionen unberührt — geändert wird nur die TS-Schicht.

**Skala (verbindlich, damit die Scores nachrechenbar sind):**

| Kriterium (Gewicht)    | 5                                                   | 4                                                                    | 3                                      | 2                                 | 1                   |
| ---------------------- | --------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- | --------------------------------- | ------------------- |
| **Lerneffekt** (30 %)  | Neues, übertragbares Muster an kritischer Stelle    | Bekanntes Muster an kritischer Stelle präzise angewendet             | Bekanntes Muster angewendet            | Wiederholung ohne neue Erkenntnis | Kein Lerneffekt     |
| **Aufwand** (25 %)     | < 30 Min., rein mechanisch                          | ≤ halber Tag, mechanisch, kein Research                              | ~1 Tag inkl. Klärung                   | Mehrtägig                         | Wochen              |
| **Risiko** (25 %)      | Keine Verhaltensänderung möglich (Delegation/Tests) | Verhalten nur bei Fehler in der 1:1-Übertragung; durch Tests gedeckt | Verhalten berührt, Tests nur teilweise | Money-/Live-Pfad berührt          | Geldfluss gefährdet |
| **Wartbarkeit** (20 %) | Modul ≤ 300 Z., eine Verantwortung                  | Klare Grenze, Modul im Zielband                                      | Verbesserung, Grenze unscharf          | Kosmetisch                        | Keine Verbesserung  |

**Score** = 0,30·L + 0,25·A + 0,25·R + 0,20·W (2 Dezimalstellen). **Mindestbar 4,20.**

| Option                          | Skizze (Scope)                                                                                                                                                                                                                                                                           | Footprint-Gewinn                                                            | L (30 %) | A (25 %) | R (25 %) | W (20 %) |  Score   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | :------: | :------: | :------: | :------: | :------: |
| **W1 — Kleinster Eingriff**     | Nur die 2 kopplungsfreien Domänen **Social & Chat** (Z. 651–713) + **Seeds** (Z. 166, 598–650) in eigene Module; Geld-Kern unberührt, Marker bleiben                                                                                                                                     | 880 → ~735 Z.; ein Chat-Task liest 60 statt 880                             |   3.5    |   5.0    |   5.0    |   4.5    | **4,45** |
| **W2 — Vertrag zuerst**         | 7 Domain-Interfaces in `wallet-contract.ts`; `WalletService implements` sie (`import type`, zirkelfrei); Marker auf echte Domänen **korrigiert**; **kein File-Split**                                                                                                                    | kein Zeilen-Gewinn; Domänen-Grenzen maschinenlesbar + Marker wahrheitsgemäß |   4.5    |   4.5    |   5.0    |   4.5    | **4,63** |
| **W3 — Vollbewegung (gewählt)** | Alle 4 Nicht-Geld-Domänen (Social, Seeds, Gamification, Promo) in eigenen Modulen; **Schritt 0 = W2**; jeder Schritt reine 1:1-Delegation ohne Signaturänderung + `npm test` + Rollback-Punkt; **Promo zuletzt** nach Money-Prüfung; Money-Kern (Wallet/Settlement/Crash) bleibt ~350 Z. | 880 → ~350 Z. Money-Kern; Rest-Features je 60–150 Z.                        |   4.5    |   4.0    |   4.0    |   4.5    | **4,25** |

**Unter der Mindestbar (nur Fernziel, aus 1. Fassung — zum Vergleich):** A Voll-Split + Fassade **3,38** (4.5/2.5/2.0/4.5) · B Status quo + Marker **3,55** (2.0/4.5/4.5/3.5) · C Hybrid 1. Fassung **3,75** (4.0/3.5/3.5/4.0). _Hinweis: In der 1. Fassung war B mit 3,4 ausgewiesen — Rechenfehler, korrekt ist 3,55._

**Was sich gegenüber der 1. Fassung geändert hat (Score-Härtung, nicht Score-Kosmetik):**

1. **Risiko 3,5 → 4,0** (W3): jeder Schritt ist jetzt explizit reine 1:1-Delegation ohne Signaturänderung, durch die bestehenden Wallet-/Fail-closed-Tests gedeckt und per Rollback-Punkt umkehrbar — nicht mehr „der Split in einem Zug".
2. **Aufwand 3,5 → 4,0** (W3): W2 als Schritt 0 stellt Ziel-Modul und Interfaces vorab bereit; das anschließende Verschieben ist mechanisch ohne Klärungsbedarf.
3. **Marker-Befund** (neu): der Marker-ist-nicht-Domäne-Versatz wäre in der 1. Fassung stillschweigend zum Money-Pfad-Slice geworden — jetzt explizit als Schnitt-Constraint.

**Pre-Mortem W3 (Führungsoption):** _Szenario 1 — stiller Money-Pfad:_ `redeemPromoCode` schreibt Guthaben über RPC und verliert beim Umzug die Fail-closed-Behandlung. _Gegenmaßnahme:_ Promo erst nach expliziter Money-Prüfung (RPC-Aufrufe + Fehlerbehandlung Zeile für Zeile) verschieben, 1:1 inkl. `walletSnapshotSchema`-Parsen, danach `npm test` + Smoke-Check der betroffenen Route durch Jan. _Szenario 2 — Import-Zyklus:_ Gamification nutzt `wallet-contract`; bleibt Shared-Modul und wird ausschließlich per `import type` konsumiert → zirkelfrei. _Szenario 3 — Marker-Drift:_ Marker werden mit den Methoden verschoben, sonst zeigt der Marker auf fremden Code (genau der heutige Zustand).

**Pre-Mortem W2 (Schritt 0):** _Szenario:_ Interfaces driften von der Implementierung ab, weil niemand sie prüft. _Gegenmaßnahme:_ `implements` erzwingt die Prüfung zur Compile-Zeit (`npm run typecheck`), Interfaces beschreiben nur die bestehenden Signaturen (keine Wunsch-API).

**Entscheidung (2026-09-16, Jan-delegiert): W3.** Begründung: W3 enthält W2 als Schritt 0 und W1 als Teilschritte — die drei Optionen unterscheiden sich im **Scope des Einstiegs**, nicht im Ziel. W3 liefert den einzigen nennenswerten Lesefootprint-Gewinn (880 → ~350 Z. Money-Kern) und besteht ausschließlich aus Schritten, die selbst ≥ 4,20 erreichen. W2 allein wäre billiger, ändert aber keine Zeilenzahl; W1 allein ist ein Ausschnitt von W3.

**Umsetzungs-Vorbehalt:** eigener Implementation-Plan (nicht dieser), `xx_sop/05` + `xx_sop/06` vorab, `@migration-security-guard` beim Promo-Schritt. R3-Niveau bleibt bis dahin **62 %** (misst Code-Realität, nicht Vorlagen).

## 2b — L2-Ergebnis: Konsolidierte Entscheidungsvorlage (WalletService + Crash, 2026-09-16)

**Gate 1 — WalletService-Slicing:** Optionen W1/W2/W3 oben (§2a), alle ≥ 4,20 → **gewählt: W3**.

**Gate 2 — Crash-Loop-Duplikation (2. Fassung):** Basis 982 Z. (`crash/useCrashGameLoop.ts`) + 782 Z. (`crash-multiplayer/useCrashMultiplayerGameLoop.ts`), ~350–360 verifizierte Dup-Zeilen in 4 verbatim Blöcken (Particles, Explosion, Tail, DPR/Shake/Starfield) + gameLoop-Body (~125 Z., Divergenz nur in 2 kleinen Callbacks um `settleCrashedRound`). Skala und Gewichte wie §2a. Neues Modul liegt als Geschwister beider Feature-Ordner: `src/components/casino/games/crash-loop/` (Regel R2: kein Import quer in einen der beiden konkurrierenden Feature-Ordner).

| Option                                            | Skizze (Scope)                                                                                                                                                                                                                           | Footprint-Gewinn                                          | L (30 %) | A (25 %) | R (25 %) | W (20 %) |  Score   |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | :------: | :------: | :------: | :------: | :------: |
| **X1 — Reine Mathematik zuerst**                  | Particles-Physik, Tail-Geometrie, DPR/Shake-Mathematik als **pure Functions** (kein Canvas-Zugriff, kein Draw-Call) in `crash-loop/` + **erste Unit-Tests für Crash-Animationscode** (heute 0)                                           | ~100–130 Dup-Zeilen raus; Animationscode erstmals testbar |   4.5    |   4.5    |   5.0    |   4.5    | **4,63** |
| **X2 — Charakterisierende Tests zuerst**          | Verhalten der 4 Dup-Blöcke + gameLoop-Body mit jsdom/RAF-Fake festnageln, **kein Produktionscode berührt**; dient als Netz für X3                                                                                                        | 0 Zeilen sofort; Sicherheitsnetz für den Draw-Anteil      |   4.5    |   3.5    |   5.0    |   4.5    | **4,38** |
| **X3 — Utility-Modul + Pure Functions (gewählt)** | **Schritt 0 = X1**, dann die 4 Dup-Blöcke 1:1 mit Parametern in `crash-loop-shared.ts` (Tail-Nozzle MP 0,45 vs. Solo 0,35 als Parameter, kein Code-Umbau), **Dep-Arrays bleiben verbatim**, Visual-QC je Block (Design-Guardian-Stufe 6) | ~150–160 Zeilen raus; Modul-Grenze etabliert              |   3.5    |   4.5    |   4.5    |   4.5    | **4,20** |

**Unter der Mindestbar (nur Fernziel, aus 1. Fassung):** A Gemeinsamer Hook + Strategy-Injection **3,03** (4.5/2.0/1.5/4.0) · C Teil-Extraktion RUNNING-Tick **3,13** (3.5/3.0/2.5/3.5) · D B+C kombiniert **3,35** (3.5/3.5/2.5/4.0). B (Utility-Modul) = X3 und liegt mit 4,20 **exakt an der Bar**.

**Pre-Mortem X3 = übernommen aus [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md):** Tail-Parametrisierung falsch gesetzt → visuelle Divergenz (Gegenmaßnahme: Parameter statt Codeänderung, visueller Vergleich beider Crash-Seiten); MP-Mobile-Delay (Z. 771–774) bleibt bewusst im MP-Hook; `draw()` bleibt pro Modus divergent.

**Entscheidung (2026-09-16, Jan-delegiert): X3** mit X1 als Schritt 0. Begründung: X1 allein (4,63) ist der beste Score, entfernt aber nur den mathematischen Anteil der Duplikation; X3 hebt den kompletten Block und besteht aus zwei Schritten, die beide ≥ 4,20 liegen. X2 deckt als Netz gezielt den Draw-Anteil ab und ist der empfohlene Zusatzschritt, falls beim Visual-QC Unsicherheit entsteht.

**R01-L3-Abgleich:** die 3 Ref-Gruppen (DOM/Data/Mirror) sind bereits als Parameterobjekt-Slices strukturiert — weder X1 noch X3 noch X2 brauchen Ref-Bündelung. Einziger harter Constraint bleibt die Dep-Array-Stable-Handle-Semantik (`draw` `[status]`, `gameLoop` `[draw, settleCrashedRound, resetRiskVisuals]`).

**Widerspruch-Check L2:** Plan 03 („keine Test-Aufteilung, Bewahr") und R09 (Test-Split ausgeführt) widersprechen sich nicht — Plan 03 bewertete den Store-Test als Nicht-Bottleneck, R09 hebt die Größe via Split (kein Inhalts-Change). Plan-03-L2-Hotspot-Liste und R01-Domänen-Map sind konsistent; die Dateigrößen wurden am 2026-09-16 nachgemessen (wallet 880, Solo-Loop 982, MP-Loop 782, database.types 2054).

## 5 — Execution-Log

**2026-09-14:**

- **L0:** ✅ Hotspots dokumentiert mit Z-Bereichen (§2a/§2b + Regelkatalog §R3): Crash-Loop 3 Sektionen (Physics Z. 118–434, Draw Z. 435–831, RAF Z. 832–982), Multiplayer-Duplikat gleiche Struktur, WalletService 26 Methoden/7 Domänen.
- **L1:** ✅ Option-Gate-Matrix WalletService (1. Fassung) nach `xx_sop/01`-Schema mit Scores + Pre-Mortem; Empfehlung C (3,75).
- **L2:** ✅ Konsolidierte Vorlage (§2b) — Plan-03-Optionen + R01-Skizze zusammengeführt, 0 Widersprüche, 1 Vorlage für beide Gates.
- **L3:** 🟡 Übergabe an Jan; beide Gates entscheidungsbereit.

**2026-09-16 (2. Fassung nach Jan-Vorgabe „3 Optionen ≥ 4,20"):**

- **L1 neu:** Matrix auf 3 Optionen ≥ 4,20 umgebaut (W1 4,45 / W2 4,63 / W3 4,25) mit verbindlicher Skala-Tabelle, nachrechenbaren Scores und dokumentierter Härtung (Risiko/Aufwand/Präge-Begründung). Rechenfehler der 1. Fassung (B 3,4 → 3,55) korrigiert.
- **L2 neu:** Crash-Matrix ebenso umgebaut (X1 4,63 / X2 4,38 / X3 4,20); X3 als B+Gehärtet verankert, A/C/D als unter-Bar-Fernziel ausgewiesen; Modul-Ort `crash-loop/` festgelegt.
- **Neuer Befund:** Marker-≠-Domäne-Versatz in `wallet.ts` (6 Marker, 3 Fehlzuordnungen) — als Schnitt-Constraint in §2 aufgenommen; Schnitt erfolgt auf Domänen-Grenzen.
- **L3:** ✅ Jan hat die Wahl delegiert → **Gate 1 = W3**, **Gate 2 = X3**; Begründungen in §2a/§2b.
- **L4:** ✅ R3-Niveau bleibt **62 %** (Code unverändert; Niveau misst Realität). §R3-Hebel im Katalog auf W3/X3 präzisiert.
- **Nachmessung:** 880/982/782/2054 Zeilen, `crash/CLAUDE.md` 18 Zeilen — alle Zahlen dieser Datei auf diesem Stand.
