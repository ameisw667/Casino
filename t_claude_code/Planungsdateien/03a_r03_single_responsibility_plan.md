# 03a-R03 — Ein Verantwortungsbereich pro Modul (Regel 3)

> **Status:** In Execution — L0–L2 + L4-teilweise ✅ (2026-09-14); **L3 wartet auf Jan-Gate** (beide Option-Matrizen Entscheidungsbereit in §2a/§2b) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Option-Gate-Vorbereitung für die 3 Mixed-Concern-Hotspots (Crash-Loop-Hook, Multiplayer-Duplikat, WalletService); keine Logik-Implementierung in diesem Plan.
> **Money-Pfad:** Ja (WalletService-Analyse read-only; späterer Refactor hätte Money-Pfad: Ja) · **Security-Review:** Pflicht (read-only Analyse)
> **Bewertungs-Basis:** [`../01_15_03a_code_modularisierung_regelkatalog.md`](../01_15_03a_code_modularisierung_regelkatalog.md) §R3 (Niveau 62 %, Bottlenecks #1/#2/#5) · verknüpft mit [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) (Crash-Option-Matrix) und R01-L3 (Ref-Bündelungs-Skizze)

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                     | Scope (Dateien)                                                                                | Ausführung  | Status     | Zuständigkeit | Verifikation                                          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | ----------------------------------------------------- |
| L0     | Baseline & Diagnose: die 3 Mixed-Concern-Hotspots mit Z-Bereichen und Trenn-Grenzen dokumentieren                                                                                                                                                                               | read-only: `useCrashGameLoop.ts`, `useCrashMultiplayerGameLoop.ts`, `src/lib/casino/wallet.ts` | Sequenziell | 🔴 Geplant | LLM           | Befundliste konsistent mit Regelkatalog §R3           |
| L1     | Option-Gate-Vorlage `WalletService`: 2–3 Slicing-Optionen (z. B. A: Domänen-Module + Fassade `WalletService` bleibt API; B: nur Abschnittsmarker R01-L1 + Proxy-Delegation; C: bewusst Status quo) nach `xx_sop/01`-Schema (Lerneffekt/Aufwand/Risiko/Wartbarkeit + Pre-Mortem) | read-only: `wallet.ts`, `xx_docs/05_service_layer_context.md`                                  | Sequenziell | 🔴 Geplant | LLM           | Matrix nach `xx_sop/01`-Format                        |
| L2     | Crash-Hotspots: Verweis-Konsolidierung — Plan-03-Optionen B/C/D + R01-L3 Ref-Bündelungs-Skizze zu einer Entscheidungsvorlage zusammenführen (keine Doppel-Analyse)                                                                                                              | diese Planungsdatei, [Plan 03](03_code_modularisierung_lesfootprint_plan.md)                   | Sequenziell | 🔴 Geplant | LLM           | 1 Vorlage, 0 Widersprüche zwischen Plan 03 und R01-L3 |
| L3     | Übergabe an Jan: beide Option-Gates (WalletService-Slicing, Crash-Extraktion) zur Entscheidung vorlegen — Entscheidung = Jan-Gate                                                                                                                                               | Chat-Übergabe                                                                                  | Sequenziell | 🔴 Geplant | Jan           | Option-Wahl dokumentiert                              |
| L4     | Niveau-Rückschreibung nach Jan-Entscheidung                                                                                                                                                                                                                                     | `../01_15_03a_code_modularisierung_regelkatalog.md`                                            | Sequenziell | 🔴 Geplant | LLM           | Neuer R3-Schnitt dokumentiert                         |

**Fan-out-Check (Kriterium 5):** L1 und L2 sind unabhängig lesbar, aber beide münden in dieselbe Jan-Übergabe (L3) und sind jeweils < 10 Min. — gebündelt sequenziell, **kein Fan-out** (Kriterium 6: < 45 Min. gesamt).

## 2 — Self-Contained Kontext-Koffer

- **Hotspot 1/2 (Crash-Loops):** 3-Sektions-Closure-Struktur in beiden Hooks (Physics/Draw/RAF), ~15+ shared Refs; Duplikat-Analyse + Optionen A–D inkl. Scores und Pre-Mortem stehen fertig in [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) — hier wird nur konsolidiert, nicht neu analysiert. Beide Dateien dokumentieren, dass verbatim erhaltene Dep-Arrays die Stable-Handle-Semantik sichern — jede Extraktion muss das respektieren.
- **Hotspot 3 (WalletService):** 1 Klasse Z. 77–865, ~26 statische Methoden über 6 Domänen (Settlement Z. 78–346, Crash-Reconciliation Z. 241/825/842, Seeds Z. 156/585/601/619, Promo Z. 381/468, Social/Chat Z. 637/676, Gamification Z. 527–799). Klasse ist einzige Vertragsquelle der Geld-RPCs (Z. 16–20). Vorlage-Hilfsmodule existieren bereits (`db-retry`, `json-value`, `wallet-contract`, `daily-race` Z. 3–12).
- **Money-Pfad-Regel:** Wallet-Refactor nur nach `xx_sop/05_database_supabase.md` + `xx_sop/06_service_layer_casino.md` Lektüre und `@migration-security-guard`-Review; atomic RPCs (Migration 007) dürfen nicht berührt werden.
- **Anti-Pattern-Beidseitigkeit:** Riesen-Datei UND file-per-function sind Anti-Patterns — Zielband 200–400 Z./Modul, 800 Z. hart (Global-Regel `coding-style.md`).

## 3 — Expliziter Nicht-Scope

- Keine Code-Implementierung der Slicing-Optionen (separate Umsetzungspläne nach Jan-Entscheidung).
- Kein Touch der atomic RPCs / Migrationen.
- Kein Multiplayer-Refactor außerhalb der konsolidierten Vorlage (hängt an derselben Option-Wahl).

## 4 — Lebenszyklus

`Execution-Ready` → L0–L2 sequenziell → **Jan-Gate L3 (Option-Wahl)** → L4 Rückschreibung → `Executed (archiviert)`.

## 2a — L1-Ergebnis: Option-Gate-Matrix WalletService (2026-09-14, nach `xx_sop/01`)

**Basis:** `WalletService` (Z. 77–865 + 7 Abschnittsmarker aus R01-L1): 26 statische Methoden über 6 Domänen; Klasse ist einzige Vertragsquelle der Geld-RPCs (Kommentar Z. 16–20). Atomic RPCs (Migration 007) bleiben unberührt — alle Optionen ändern nur die TS-Schicht.

| Option                   | Skizze                                                                                                                                                                                                                                            | Lesefootprint-Gewinn                                       | Lerneffekt (30 %) | Aufwand (25 %) | Risiko (25 %) | Wartbarkeit (20 %) | Score |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------- | -------------- | ------------- | ------------------ | ----- |
| A — Voll-Split + Fassade | 6 Domänen-Module (`wallet-settlement.ts`, `wallet-seeds.ts`, `wallet-crash.ts`, `wallet-promo.ts`, `wallet-gamification.ts`, `wallet-social.ts`) + index.ts, das die WalletService-API bündelt                                                    | Agent liest je Task 150–250 Z. statt 865                   | 4.5               | 2.5            | 2.0           | 4.5                | 3.4   |
| B — Status quo + Marker  | Nur die R01-Abschnittsmarker, kein Split                                                                                                                                                                                                          | Marker machen Cluster auffindbar, Voll-Read bleibt         | 2.0               | 4.5            | 4.5           | 3.5                | 3.4   |
| C — Hybrid (empfohlen)   | Nur die **nicht-Geld-Domänen** extrahieren: Gamification, Social/Chat, Promo, Seeds in eigene Module (jeweils eigene RPC-Quelle, keine Settlement-Logik); `WalletService` behält Wallet/Settlement + Crash-Kern als schmalen Money-Kern (~350 Z.) | Agent liest Money-Pfad 350 Z., Rest-Features je 100–200 Z. | 4.0               | 3.5            | 3.5           | 4.0                | 3.7   |

**Pre-Mortem Führungsoption C:** Scheiterszenario = eine der extrahierten Methoden war stillschweigend doch Money-Pfad (z. B. `redeemPromoCode` schreibt Guthaben über RPC) und verliert die Fail-closed-Fehlerbehandlung beim Umzug. Gegenmaßnahme: 1:1-Methodenumzug inkl. Fehlerbehandlung + `walletSnapshotSchema`-Parsen, danach `npm test` (Wallet-Tests + Fail-closed-Tests) und manuelles Smoke-Check der 4 betroffenen Routen durch Jan. Zweitens: Import-Zyklen riskiert, wenn Gamification `wallet-contract` nutzt — `wallet-contract.ts` bleibt Shared-Modul, zirkelfrei.

**Score-Logik:** C gewinnt nicht über den Lerneffekt, sondern über Risiko/Aufwand-Balance: die Geld-Domäne (Settlement + Crash) bleibt unangetastet, während 4 Domänen mit geringerem Blast-Radius real getrennt werden. A wäre der größere Lerneffekt, aber ein Voll-Split der Vertragsquelle (26 Methoden) in einem Zug ist für den Money-Pfad zu groß. B verliert den Lerneffekt (Marker sind bereits durch R01 erledigt).

**LLM-Empfehlung:** C. Entscheidung = Jan-Gate.

## 2b — L2-Ergebnis: Konsolidierte Entscheidungsvorlage (WalletService + Crash, 2026-09-14)

**Gate 1 — WalletService-Slicing:** Optionen A/B/C oben (§2a), Empfehlung C.

**Gate 2 — Crash-Loop-Duplikation:** übernommen aus [Plan 03 §2a](03_code_modularisierung_lesfootprint_plan.md) (Optionen A–D mit Scores; Empfehlung B = `crash-loop-shared.ts` Utility-Modul, Score 4.1), ergänzt um die R01-L3-Ref-Bündelungs-Skizze (Plan 03a-R01 §2a): die 3 Ref-Gruppen (DOM/Data/Mirror) sind bereits als Parameterobjekt-Slices strukturiert — auch die Optionen C/D (RUNNING-Tick-Extraktion) brauchen **kein Ref-Bundling**; der einzige harte Constraint bleibt die Dep-Array-Stable-Handle-Semantik (`draw` `[status]`, `gameLoop` `[draw, settleCrashedRound, resetRiskVisuals]`).

**Widerspruch-Check L2:** Plan 03 („keine Test-Aufteilung, Bewahr") und R09 (Test-Split ausgeführt) widersprechen sich nicht — Plan 03 bewertete den Store-Test als Nicht-Bottleneck, R09 hebt die Größe via Split (kein Inhalts-Change). Plan-03-L2-Hotspot-Liste und R01-Domänen-Map sind konsistent (4× >800 inkl. wallet.ts).

## 5 — Execution-Log (2026-09-14)

- **L0:** ✅ Hotspots dokumentiert mit Z-Bereichen (§2a/§2b + Regelkatalog §R3): Crash-Loop 3 Sektionen (Physics Z. 118–434, Draw Z. 435–831, RAF Z. 832–982), Multiplayer-Duplikat gleiche Struktur, WalletService 26 Methoden/6 Domänen.
- **L1:** ✅ Option-Gate-Matrix WalletService (§2a) nach `xx_sop/01`-Schema mit Scores + Pre-Mortem; Empfehlung C.
- **L2:** ✅ Konsolidierte Vorlage (§2b) — Plan-03-Optionen + R01-Skizze zusammengeführt, 0 Widersprüche, 1 Vorlage für beide Gates.
- **L3:** 🔴 **Wartet auf Jan** — beide Gates (WalletService A/B/C, Crash B/C/D) sind in §2a/§2b Entscheidungsbereit; Übergabe im Abschlussbericht.
- **L4:** 🟡 Teilausgeführt — R3-Sub-Subs bleiben bewusst unverändert (Niveau misst Code-Realität, nicht Vorlagen; Re-Rate erst nach Umsetzung der Jan-Entscheidung in separaten Umsetzungsplänen). R03-Schnitt bleibt **62 %**.
