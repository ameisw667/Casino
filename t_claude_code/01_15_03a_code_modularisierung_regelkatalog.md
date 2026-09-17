# 01.15.03a — Code-Modularisierung: Regelkatalog für LLM-Lesefootprint (Übersichts-/Marktdatendatei)

> **Status:** 🔵 Bewertung (Ebene 1 + Sub-Sub-Aufschlüsselung) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Vollständiger Regelkatalog der Code-Modularisierung aus Token-Sicht — Ergänzung zu [`01_15_03_code_modularisierung_lesfootprint.md`](01_15_03_code_modularisierung_lesfootprint.md) (dort Messung der Ist-Struktur, hier die Regeln selbst).
>
> **Auslöser (Jan, 2026-09-14):** Bisheriges Wissen = „1.000-Zeilen-Datei in 4 kleinere Dateien aufteilen". Ziel: vollständiger Regelkatalog + Sub-Subkategorien je Regel (max. 10, bewertet) + 10 Execution-Ready-Planungsdateien.
>
> **Skala:** Niveau % (100 = Regel vollständig gelebt, 0 = verletzt). Regel-Niveau = rechnerischer Schnitt der Sub-Subkategorien. **Extern belegt** = Web-Research 2026-09-14 (Quellen am Ende).
>
> **Korrektur-Log 2026-09-14 (2. Fassung):** (1) `guide-knowledge/` hat **keine** index.ts-Fassade (Glob-Verifikation; nur `chat-guide/index.ts` existiert) — Erstfassung behauptete fälschlich beides. (2) Alle Regel-Niveaus wurden von Schätzwerten auf rechnerische Sub-Sub-Schnitte umgestellt (5 Werte verschoben: R1 80→65, R2 85→87, R4 65→52, R8 55→66, R9 45→52).

## Kernaussage

**Fakt:** „Große Datei → 4 kleine Dateien" ist nur Regel #1 von 10 — und die fehleranfälligste. **Casino-Schnitt über alle 10 Regeln (bottom-up aus 61 Sub-Subkategorien): Stand 2026-09-16 nach Execution aller 10 Pläne = 74 %** (Execution-Vorlauf: 62 %) — Struktur stark (R2 87 %, R5 88 %), größte Hebel gehoben: Fassade R4 (52→77 %), Duplikat-Tooling R7 (49→68 %), Tests R9 (52→83 %), Guardrails R10 (30→58 %). **Gate-Stand 2026-09-16: alle Entscheidungen dieser Runde sind abgeschlossen** — R3 Optionswahl delegiert und entschieden (W3 4,25 / X3 4,20), R6 Rollout entschieden und 1 Ordner ausgerollt, R10 ESLint-Variante verworfen, CLAUDE.md-Hotspot-Liste korrigiert. **Offen bleibt genau 1 Punkt: R8** (Read-Deny-Freigabe, wirkt auf alle Sessions). Die schwergewichtigen Refactors (WalletService-Split, Crash-Loop-Extraktion) sind bewusst NICHT in dieser Runde — die Matrizen stehen, die Umsetzung läuft in separaten Implementation-Plänen. Rückfall-Schutz ist aktiv: `check-file-sizes` blockiert in CI ab jetzt jede neue > 800-Zeilen-Datei.

## Übersichtstabelle (Nr · Regel · Niveau · Übersicht · Planungsdatei · Execution)

| Nr  | Regel                               |  Niveau  |                        Übersicht (Sub-Subs)                        | Planungsdatei                                                 |                                      Execution                                      |
| :-: | ----------------------------------- | :------: | :----------------------------------------------------------------: | ------------------------------------------------------------- | :---------------------------------------------------------------------------------: |
|  1  | Natürliche Slicing-Grenzen          | **64 %** |     [§R1](#r1--regel-1--natürliche-slicing-grenzen-niveau-64)      | [Plan](Planungsdateien/03a_r01_slicing_grenzen_plan.md)       |                         ✅ Executed (Rest-Hebel → R03-Gate)                         |
|  2  | Feature-based statt layer-based     | **87 %** |   [§R2](#r2--regel-2--feature-based-statt-layer-based-niveau-87)   | [Plan](Planungsdateien/03a_r02_feature_organisation_plan.md)  |                                ✅ Executed (Bewahr)                                 |
|  3  | Ein Verantwortungsbereich pro Modul | **62 %** | [§R3](#r3--regel-3--ein-verantwortungsbereich-pro-modul-niveau-62) | [Plan](Planungsdateien/03a_r03_single_responsibility_plan.md) | ✅ Executed (Gate geschlossen 2026-09-16: **W3/X3**; Umsetzung in separaten Plänen) |
|  4  | Fassade / index.ts öffentliche API  | **77 %** |   [§R4](#r4--regel-4--fassade-indexts-ffentliche-api-niveau-77)    | [Plan](Planungsdateien/03a_r04_fassade_index_plan.md)         |                                     ✅ Executed                                     |
|  5  | Typen & Schemas als Vertrag         | **88 %** |     [§R5](#r5--regel-5--typen--schemas-als-vertrag-niveau-88)      | [Plan](Planungsdateien/03a_r05_typen_vertraege_plan.md)       |                                ✅ Executed (Bewahr)                                 |
|  6  | Doku-Layer parallel zum Code        | **83 %** |    [§R6](#r6--regel-6--doku-layer-parallel-zum-code-niveau-83)     | [Plan](Planungsdateien/03a_r06_doku_layer_plan.md)            |                 ✅ Executed (archiviert; 2 Ordner + Rollout-Regel)                  |
|  7  | Duplikation vermeiden               | **68 %** |        [§R7](#r7--regel-7--duplikation-vermeiden-niveau-68)        | [Plan](Planungsdateien/03a_r07_duplikation_plan.md)           |                    ✅ Executed (Tooling; Extraktion → R03-Gate)                     |
|  8  | Generierten Code aus dem Lese-Pfad  | **74 %** | [§R8](#r8--regel-8--generierten-code-aus-dem-lese-pfad-niveau-74)  | [Plan](Planungsdateien/03a_r08_generierter_code_plan.md)      |                     🟡 **Jan-Gate offen** (Read-Deny-Settings)                      |
|  9  | Test-Dateien modularisieren         | **83 %** |     [§R9](#r9--regel-9--test-dateien-modularisieren-niveau-83)     | [Plan](Planungsdateien/03a_r09_test_modularisierung_plan.md)  |                              ✅ Executed (archiviert)                               |
| 10  | Guardrails: Lint + Messung          | **58 %** |     [§R10](#r10--regel-10--guardrails-lint--messung-niveau-58)     | [Plan](Planungsdateien/03a_r10_guardrails_plan.md)            |                 ✅ Executed (archiviert; ESLint-Variante verworfen)                 |

**Schnitt: 744/10 = Niveau 74 %** (74,4 gerundet; vor Execution: 62 %). Rest-Hebel-Ranking nach Gate-Abschluss (2026-09-16): R3 (62 %, Umsetzung entschieden = W3, größter Hebel) → R1 (64 %, Rest-Hebel an R03) → R10 (58 %, #3 Messung an Parent-Plan 09) → R7 (68 %, Extraktion an R03) → R8 (74 %, einziges offenes Gate) → R6 (83 %, Rollout-Regel greift) → R9 (83 %) → R4 (77 %) → R2/R5 (87–88 %, Bewahr).

---

## Jan-Entscheidungen dieser Runde (Stand 2026-09-16 — 5 von 6 abgeschlossen)

Alle Entscheidungspunkte an einer Stelle, jeweils mit dem Nutzen in einem Satz. Die vollständigen Option-Matrizen mit Skala, Pre-Mortem und Rechnung stehen in den verlinkten Abschnitten, nicht hier.

> **Zu den Punkten 1 und 2 (W3 / X3): Klartext-Erklärung als Einstieg** → [`01_15_03b_w3_x3_erklaerung.md`](01_15_03b_w3_x3_erklaerung.md) — erklärt ohne Fachvokabular, was die beiden Umbauten tun, in welcher Reihenfolge sie laufen, welche Sicherheitsnetze greifen und was der Vorteil ist (inkl. „was es **nicht** ist"). Diese Datei hier liefert die Zahlen, jene Datei den Einstieg.

> **Zählmetrik für alle Zeilenzahlen in dieser Datei (verbindlich, 2026-09-16):** „letzte Inhaltszeile" = deckungsgleich mit `wc -l` und mit den `Z. x–y`-Bereichen in §R3/§R5 — `wallet.ts` 880, `useCrashGameLoop.ts` 982, `useCrashMultiplayerGameLoop.ts` 782, `database.types.ts` 2.054. Das CI-Gate `npm run check-file-sizes` zählt intern **je Datei 1 mehr** (881 / 983 / 783 / 2.055), weil es `split('\n').length` nutzt und damit den Slot nach der abschließenden Newline mitzählt; wer gegen die CI-Ausgabe prüft, sieht also genau diese Differenz von 1. Maßgeblich für Dokumente bleibt die Zahl der letzten Inhaltszeile.

|  #  | Entscheidung                                     | Was es konkret bringt                                                                                                                                                                                                                                                                                                               | Entscheidungsmaterial                                                                                                                                                                      | Optionen (Score, Bar 4,20)                                                                   | Entscheidung 2026-09-16                                                                                                                                                                                                                                                                                             |
| :-: | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | **WalletService aufteilen?**                     | Der Money-Kern (`wallet.ts`, 880 Z., 26 Methoden in 7 Domänen) schrumpft auf ~350 Z.; ein Task „Chat-Nachricht anpassen" liest dann 60 Z. statt 880 — der Geld-/Settlement-Code wird dabei nicht angefasst.                                                                                                                         | [Klartext](01_15_03b_w3_x3_erklaerung.md) · [R03 §2a](Planungsdateien/03a_r03_single_responsibility_plan.md)                                                                               | **W3 4,25** · W1 4,45 · W2 4,63 — alle ≥ Bar (1. Fassung A/B/C: 3,38 / 3,55 / 3,75)          | **W3 gewählt** (Wahl delegiert): Vollbewegung der 4 Nicht-Geld-Domänen, **Schritt 0 = W2** (Domain-Interfaces), Promo zuletzt nach Money-Prüfung. Umsetzung in eigenem Plan ([03c W3](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md), Execution-Ready 2026-09-17, K4-Gate L5) + `@migration-security-guard` |
|  2  | **Crash-Loop-Hook aufteilen?**                   | ~350 Zeilen Code, die in beiden Crash-Loops doppelt stehen, leben künftig einmal in `crash-loop/`; eine Crash-Änderung liest ein Modul statt 1.764 Zeilen — und der Animationscode bekommt erstmals Tests.                                                                                                                          | [Klartext](01_15_03b_w3_x3_erklaerung.md) · [R03 §2b](Planungsdateien/03a_r03_single_responsibility_plan.md) + [Plan 03 §2a](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md) | **X3 4,20** · X1 4,63 · X2 4,38 — alle ≥ Bar (1. Fassung A/B/C/D: 3,03 / 4,05 / 3,13 / 3,35) | **X3 gewählt** (Wahl delegiert) mit **X1 als Schritt 0** (pure Mathematik + Unit-Tests), X2 optional als Netz vor dem Draw-Anteil. Umsetzung in eigenem Plan ([03b X3](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md), Execution-Ready 2026-09-17)                                                              |
|  3  | **Read-Deny für `database.types.ts` freigeben?** | Die Datei (2.054 Z.) ist reine Supabase-Ausgabe, die niemand editieren darf — ein versehentlicher Voll-Read kostet grob 25.000 Tokens. Mit Deny kann ich sie nicht mehr versehentlich öffnen; Typecheck, Lint und Tests laufen weiter (die Sperre trifft nur den Agent-Read, für den seltenen echten Bedarf hebst du sie kurz auf). | [R08 §5](Planungsdateien/03a_r08_generierter_code_plan.md)                                                                                                                                 | Freigabe / Ablehnung                                                                         | **OFFEN — der einzige verbleibende Punkt.** Fertig: `.claude/settings.json` mit `{"permissions":{"deny":["Read(src/types/database.types.ts)"]}}`. Mein Schreibversuch wurde vom Permission-Classifier abgelehnt, weil Settings auf alle Sessions wirken                                                             |
|  4  | **Verzeichnis-Doku ausrollen?**                  | Die Ordner-Doku (18–21 Z.) ersetzt bei Alltags-Tasks das Lesen zweier Game-Loops plus `xx_docs/10` und nennt genau die Fehlerquellen, die man sonst übersieht (Dep-Array-Semantik, Mobile-Delay).                                                                                                                                   | [R06 §5](Planungsdateien/03a_r06_doku_layer_plan.md)                                                                                                                                       | flächiger Rollout / 1 Ordner + Regel / zurücknehmen                                          | **Entschieden** (delegiert): **1 Ordner ausgerollt** (`crash-multiplayer/CLAUDE.md`, **21 Z.**, `wc -l`) + Regel fixiert — weiterer Ordner erst bei ≥ 5 Dateien **und** echter Konvention **und** bestandener 1-Woche-Evaluierung; Reihenfolge blackjack → roulette → slots → dice; `src/lib/casino/` ausgenommen   |
|  5  | **`max-lines`-ESLint-Regel nachziehen?**         | Nur eine Editor-Warnung — das CI-Gate (`check-file-sizes`) blockiert zu große Dateien bereits hart. Doppeltes Enforcement ohne Zusatznutzen.                                                                                                                                                                                        | [R10 §5](Planungsdateien/03a_r10_guardrails_plan.md)                                                                                                                                       | Einbauen / weglassen                                                                         | **Verworfen** (deine Entscheidung). Der fertige Diff bleibt als Nachschlage-Notiz in R10 §5 stehen, wird aber nicht eingebaut                                                                                                                                                                                       |
|  6  | **CLAUDE.md-Hotspot-Liste korrigieren?**         | Die Liste steuert, welche Dateien ich nur mit Begründung vollständig lese. Sie nannte eine gelöschte Testdatei (1.254 Z.) und veraltete Zahlen — ich hätte also nach falscher Regel geslict.                                                                                                                                        | `CLAUDE.md` Z. 125                                                                                                                                                                         | korrigieren / belassen                                                                       | **Korrigiert**: Eintrag zur gelöschten `useCasinoStore.test.ts` entfernt, Zahlen auf 2.054 / 982 / 880 / 782 nachgemessen (2026-09-16)                                                                                                                                                                              |

**Nicht in dieser Liste (Abhängigkeit statt Entscheidung):** R10-#3 (gelesen/gebraucht-Messung) hängt am Parent-Plan 09 (`llm-usage` liefert 0 Datenpunkte) — dort entschieden, hier nur gespiegelt.

---

<a id="r1--regel-1--natürliche-slicing-grenzen-niveau-64"></a>

## R1 — Regel 1: Natürliche Slicing-Grenzen (Niveau 64 %)

„4 × 250 Zeilen" ist der Anfängerfehler: geschnitten wird entlang logischer Grenzen (Domänen-Cluster, describe-Blöcke, Verantwortlichkeiten). **Extern belegt:** Claude Code selbst hält 64 % seiner ~1.900 Dateien < 200 Zeilen; Extraktion ab ~300 Zeilen.

|  #  | Sub-Subkategorie                                  | Niveau | Befund & Beleg                                                                                                                                                                                            | Bottleneck? |
| :-: | ------------------------------------------------- | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Domänen-Cluster statt gleicher Teile              |   75   | `wallet.ts` (880 Z., Messung 2026-09-16) hat erkennbare Cluster (Settlement/Crash/Seeds/Promo/Social/Gamification) — Slicing-Basis vorhanden, Aufteilung wäre nach Domänen, nicht nach Zeilenzahl möglich |    Nein     |
|  2  | Zielbänder eingehalten (200–400 typisch, 800 max) |   90   | 86,5 % der 1.044 TS/TSX-Dateien ≤ 300 Zeilen (Messung 2026-09-14, nach 03a-R09)                                                                                                                           |    Nein     |
|  3  | ~300-Zeilen-Extraktionsschwelle gelebt            |   75   | 89 Dateien in 300–500, 44 in 500–800 — Grenze meist gezogen, einige Dateien drüber ohne Extraktion                                                                                                        |    Nein     |
|  4  | Abschnittsmarkierung großer Dateien               |   40   | `wallet.ts` hat **keine** Abschnittskommentare (26 Methoden unmarkiert); `useCrashGameLoop.ts` dagegen markiert 3 Sektionen — inkonsistent                                                                |    🔴 JA    |
|  5  | Shared-State-Bündelung vor Extraktion             |   45   | `useCrashGameLoop` teilt ~15+ Refs über 3 Closure-Sektionen — Extraktion erfordert Ref-Bundling, nie vorbereitet                                                                                          |    🔴 JA    |
|  6  | Generiertes ausgenommen                           |   95   | `database.types.ts` (2.054 Z.) konsequent nie angefasst                                                                                                                                                   |    Nein     |
|  7  | Grenz-Entscheidung dokumentiert (Warum-Grenze)    |   30   | Keine Konvention, warum eine Grenze wo liegt; Grenzen sind implizit                                                                                                                                       |    🔴 JA    |

**Bottlenecks:** #4, #5, #7 → Plan R01.

**Grenz-Konvention (R01-L2, ausgeführt 2026-09-14):**

1. **Warum-Grenze:** Geschnitten wird entlang logischer Domänen (Settlement vs. Seeds vs. Promo …), nie nach Zeilenzahl — „4 × 250 Zeilen" ist der Anfängerfehler.
2. **Extraktionsschwelle:** Ein Verantwortungsbereich zieht in ein eigenes Modul ab ~300 Zeilen; Zielband 200–400 Z./Modul, 800 Z. hart (`coding-style.md`).
3. **Abschnittsmarker ab > 500 Zeilen:** `// ── Abschnitt: <Domäne> ──` + Domänen-Map am Datei-/Klassenkopf — LLM-Reads erkennen Cluster-Grenzen, ohne die Datei komplett zu lesen. Live-Muster: `src/lib/casino/wallet.ts` (7 Abschnittsmarker + Domänen-Map, Kommentar-only). Verankerung zusätzlich in `xx_sop/06_service_layer_casino.md` §2.

<a id="r2--regel-2--feature-based-statt-layer-based-niveau-87"></a>

## R2 — Regel 2: Feature-based statt layer-based (Niveau 87 %)

Zusammengehöriges in EINEN Ordner — Golden Rule: ein typischer Task liest ≤ 5 Dateien.

|  #  | Sub-Subkategorie                 | Niveau | Befund & Beleg                                                                                                                         | Bottleneck? |
| :-: | -------------------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Feature-Kohäsion Spiele          |   90   | `src/app/games/[game]/` + `src/components/casino/games/[game]/` isoliert je Spiel                                                      |    Nein     |
|  2  | Golden Rule ≤ 5 Dateien pro Task |   85   | Spiel-Task braucht typisch 2 Verzeichnisse (`crash/` mit Styles/Hook/Helpers/6 UI-Komponenten)                                         |    Nein     |
|  3  | Service-Layer-Feature-Ordner     |   85   | `guide-knowledge/` (13 Module), `chat-guide/` (index + 3 Module)                                                                       |    Nein     |
|  4  | Keine Layer-Streuung             |   85   | Styles/Hook/UI getrennt, aber innerhalb des Feature-Ordners (`crash-styles.ts`, `useCrashGameLoop.ts`, `CrashStage.tsx` nebeneinander) |    Nein     |
|  5  | Sandbox-Isolation                |   90   | `/v2`, `/testing` als bare Sandboxes außerhalb der Main-Shell                                                                          |    Nein     |
|  6  | Admin-Isolation                  |   90   | `src/app/admin/` eigenständig, `AdminLayout`-geschützt                                                                                 |    Nein     |
|  7  | Verwaiste Sandbox-Reste          |   65   | `AutoBetDrawerTestingClient.tsx` (793 Z., Top-5-Größe) liegt in Testing-Sandbox; Nutzung ungeklärt                                     |    Nein     |

**Bewahr-Projekt** — kein Bottleneck → Plan R02 (Bewahr + Rest-Klärung).

**Bewahr-Checkliste (R02-L1, ausgeführt 2026-09-14):** Neues Feature →

1. Page unter `src/app/games/[game]/`, UI unter `src/components/casino/games/[game]/` — ein Feature, ein Ordnerpaar.
2. Layer-Dateien (Styles `*-styles.ts`, Logik `*-helpers.ts`, Hook `use*.ts`) kolokiert im Feature-Ordner, nicht in globalen Layer-Ordnern.
3. Service-Logik nach `src/lib/casino/` (Feature-Unterordner + index.ts-Fassade, siehe R4).
4. Design-Vergleichs-Sandboxes nach `src/app/testing/<name>/` (Client + `parts/`-Muster) — getrennt von Produktion.
5. Golden Rule als Abnahme-Kriterium: ein typischer Task liest ≤ 5 Dateien.

<a id="r3--regel-3--ein-verantwortungsbereich-pro-modul-niveau-62"></a>

## R3 — Regel 3: Ein Verantwortungsbereich pro Modul (Niveau 62 %)

Keine Mischdateien (Physics+Draw+RAF in einem Hook) und kein file-per-function — beides kostet Agent-Zyklen.

|  #  | Sub-Subkategorie                      | Niveau | Befund & Beleg                                                                                                                         | Bottleneck? |
| :-: | ------------------------------------- | :----: | -------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Mixed-Concern-Hook                    |   35   | `useCrashGameLoop.ts` (982 Z.): Particle-Physics (Z. 118–434) + Canvas-Draw (Z. 435–831) + RAF-Loop in **einem** Hook                  |    🔴 JA    |
|  2  | Multiplayer-Duplikat gleiche Struktur |   40   | `crash-multiplayer/useCrashMultiplayerGameLoop.ts` (782 Z.) kopiert dieselbe 3-Sektions-Mischstruktur (Z. 120/239/616)                 |    🔴 JA    |
|  3  | UI-Komponenten-Slicing                |   85   | Crash in Stage/Sidebar/PixelCanvas/ControlSidebar getrennt                                                                             |    Nein     |
|  4  | Page als Transport-Schicht            |   70   | `crash/page.tsx` (769 Z.) groß, aber UI-only (keine Settlement-Logik); Größe bleibt Lesefaktor                                         |    Nein     |
|  5  | Service-Klassen-Kohäsion              |   50   | `WalletService`: 1 Klasse, ~26 statische Methoden über 7 Domänen (Money-Pfad); Marker ≠ Domäne (3 Fehlzuordnungen, Messung 2026-09-16) |    🔴 JA    |
|  6  | File-per-function vermieden           |   90   | Keine 10–20-Zeilen-Fragmentdateien im Repo                                                                                             |    Nein     |

**Bottlenecks:** #1, #2, #5 → Plan R03. **Gate geschlossen (2026-09-16):** WalletService **W3 4,25** (Vollbewegung der 4 Nicht-Geld-Domänen, Schritt 0 = W2 Domain-Interfaces) und Crash-Loop **X3 4,20** (Schritt 0 = X1 pure Mathematik; Crash-Strategie-Matrix in [Plan 03](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md)). Umsetzung in separaten Implementation-Plänen — deshalb bleibt das R3-Niveau bis dahin bei 62 % (es misst Code-Realität, nicht Vorlagen). **Klartext-Erklärung beider Umbauten:** [01_15_03b](01_15_03b_w3_x3_erklaerung.md).

<a id="r4--regel-4--fassade-indexts-ffentliche-api-niveau-77"></a>

## R4 — Regel 4: Fassade / index.ts öffentliche API (Niveau 77 %)

Ordner + index.ts: Agent sieht öffentliche API in 1 Datei statt 5 Interna. **Stand 2026-09-14:** beide großen Service-Feature-Ordner haben Fassade (`chat-guide/index.ts`, `guide-knowledge/index.ts` — Letztere als reine Re-Export-Datei über der bestehenden `registry.ts`-Aggregation, 22 Zeilen, 6 Export-Statements).

**Fassaden-Konvention (03a-R04-L2):** Jeder neue Feature-Ordner unter `src/lib/casino/` bekommt beim Anlegen eine `index.ts`-Fassade, die (1) ausschließlich die öffentliche API re-exportiert — keine neuen Exporte, keine Umbenennung, (2) einen existierenden internen Aggregator (`registry.ts`-Muster) via `export *` nutzt statt alles zu duplizieren, (3) zusätzlich nur Vertragsmodule (Zod-Schemas/Typen) und Admin-Einstiegspunkte ergänzt, (4) max. ~6 Export-Statements / ~15 symbolische Exporte umfasst (Barrel-Bloat-Grenze), (5) additive bleibt: Tiefen-Importe bestehender Konsumierender werden nicht umgestellt, die Fassade ist optional nutzbar. Muster: `src/lib/casino/guide-knowledge/index.ts`.

|  #  | Sub-Subkategorie                    | Niveau | Befund & Beleg                                                                                                      | Bottleneck? |
| :-: | ----------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | index.ts-Fassaden vorhanden         |   85   | 2 von 2 großen Service-Feature-Ordnern (`chat-guide/`, `guide-knowledge/` seit 03a-R04)                             |    Nein     |
|  2  | Registry-Alternative                |   75   | `guide-knowledge/registry.ts` ist interner Aggregator und wird von der Fassade via `export *` genutzt statt ersetzt |    Nein     |
|  3  | Öffentliche API dokumentiert        |   75   | Service-Vertrag in `xx_docs/05_service_layer_context.md` + `CLAUDE.md` § Service Layer                              |    Nein     |
|  4  | Tiefen-Import-Grenze                |   55   | `wallet.ts` als Direktklasse — jeder Import zwingt 880-Zeilen-Read bei Vertragsfragen (Messung 2026-09-16)          |    Nein     |
|  5  | Barrel-Bloat-Kontrolle              |   80   | Konvention fixiert ~15-Export-Grenze; neue Fassade: 6 Statements / 15 Symbole                                       |    Nein     |
|  6  | Fassaden-Konvention für neue Module |   90   | 5-Punkte-Regelsatz oben verankert (2026-09-14)                                                                      |    Nein     |

**Bottlenecks:** #1, #6 → Plan R04 — beide durch Execution geschlossen (2026-09-14).

<a id="r5--regel-5--typen--schemas-als-vertrag-niveau-88"></a>

## R5 — Regel 5: Typen & Schemas als Vertrag (Niveau 88 %)

Zod/TS-Verträge ersetzen Lese-Aufwand — der Agent muss Felder nicht aus Implementierungsdetails raten.

**Bewahr-Regel (03a-R05-L1):** Zod an allen Systemgrenzen bleibt Standard; `unknown` + schmalen Narrowing statt `any`; geteilte Verträge in Contract-Module auslagern (`wallet-contract.ts`-Muster) — Halten schlägt Umbauen.

**Any-Messung (2026-09-14, `src/**` exkl. `__tests__`/`database.types.ts`):** 2 echte `any`-Casts (`app/api/leaderboard/route.ts` Z. 101/138, `row.users as any`), 16 `as unknown as`-Escape-Valves (davon 9 legitime Browser-API-Narrowings in `voice-audio.ts`/`sound-manager.ts`/`DiceV2Audio.ts`), 142 `unknown`-Nutzungen. Any-Quote weit unter Schwellwert (50) → Aufraum-Option entfällt.

|  #  | Sub-Subkategorie               | Niveau | Befund & Beleg                                                                            | Bottleneck? |
| :-: | ------------------------------ | :----: | ----------------------------------------------------------------------------------------- | :---------: |
|  1  | Zod-Grenzen-Validierung        |   90   | API-Handler + `applyServerWalletSnapshot()` strikt (`walletSnapshotSchema`)               |    Nein     |
|  2  | Generierte DB-Typen importiert |   90   | `database.types.ts` als alleinige DB-Typ-Quelle                                           |    Nein     |
|  3  | Contract-Module ausgelagert    |   85   | `wallet-contract.ts`, `db-retry.ts`, `json-value.ts` aus `wallet.ts` extrahiert (Z. 3–12) |    Nein     |
|  4  | Schemas kolokiert mit Modul    |   80   | 3 modullokale Zod-Schemas in `wallet.ts` (Z. 21–40) statt zentrale Schema-Wüste           |    Nein     |
|  5  | Any-Freiheit verifiziert       |   95   | Gemessen 2026-09-14: 2 echte `any` (leaderboard route), 16 Halbtreffer, 142 `unknown`     |    Nein     |
|  6  | Explizite Rückgabetypen        |   85   | Service-Methoden typisiert, keine Inferenz-Glaskugel nötig                                |    Nein     |

**Bewahr-Niveau** → Plan R05 — Messung abgeschlossen (2026-09-14), Regel lebt.

<a id="r6--regel-6--doku-layer-parallel-zum-code-niveau-83"></a>

## R6 — Regel 6: Doku-Layer parallel zum Code (Niveau 83 %)

Root-Kurz-Doku → Verzeichnis-Doku → On-Demand-Tiefe. **Extern belegt:** LLM-generierte Doku-Dateien senken Erfolgsquote (−3 %) und erhöhen Kosten (+20 %) — human-written halten.

**Evaluierungs-Mechanik Pilot (03a-R06-L2, 2026-09-14):** Pilot `src/components/casino/games/crash/CLAUDE.md` (18 Zeilen, nur Zeiger + Gotchas). Nach 1 Woche Praxis prüfen an 3 Kriterien: (1) Wurde die Datei in einem Crash-Task tatsächlich gelesen (Session-Beweis, nicht Behauptung)? (2) Hat sie einen Task verkürzt (z. B. Dep-Array-Regel ohne Neu-Analyse der Loops befolgt)? (3) Ist sie noch aktuell nach Code-Änderungen (Gotchas nicht stale)? Rollout auf weitere Spiel-Ordner nur, wenn ≥ 2 der 3 Kriterien erfüllt — sonst Pilot verwerfen statt mittlere Doku-Schicht künstlich am Leben halten (Anti-Regel: keine Doku pro Doku).

**Rollout-Entscheid (2026-09-16, Jan hat die Wahl delegiert):** kein flächiger Rollout, sondern **genau 1 weiterer Ordner** — `src/components/casino/games/crash-multiplayer/CLAUDE.md` (29 Z.). Begründung: derselbe Gotcha-Satz wie der Pilot (Dep-Array-Semantik, Duplikat-Ziehmutter), und der Ordner wird durch den gewählten X3-Schnitt (R3 §2b / Plan 03 §2a) ohnehin gelesen — der Nutzen ist sofort belegbar statt spekulativ. Für alle weiteren Ordner gilt ab jetzt die fixierte Regel: **≥ 5 `.ts/.tsx`-Dateien UND mindestens eine nicht-selbstverständliche Konvention UND ein Vorgänger-Ordner mit ≥ 2/3 bestandenen Kriterien**; Reihenfolge nach Größe blackjack (23 Dateien) → roulette (17) → slots (15) → dice (12); `src/lib/casino/` bleibt ausgenommen (zuständig ist `xx_docs/05_service_layer_context.md`).

|  #  | Sub-Subkategorie           | Niveau | Befund & Beleg                                                                                                                                                                                                                     | Bottleneck? |
| :-: | -------------------------- | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Root-Kurz-Doku             |   90   | `CLAUDE.md` als On-Demand-Router, keine Systemdetails                                                                                                                                                                              |    Nein     |
|  2  | On-Demand-Tiefen-Doku      |   95   | 19 SOPs + `xx_docs/**` nur bei Bedarf (Top 10 % in [`01_7_context_management.md`](01_7_context_management.md) Pos. 7)                                                                                                              |    Nein     |
|  3  | Verzeichnis-Ebene Doku     |   65   | 2 Ordner dokumentiert (`crash/CLAUDE.md` 18 Z., `crash-multiplayer/CLAUDE.md` 29 Z., 2026-09-16); Rollout-Regel fixiert (≥ 5 Dateien + echte Konvention + bestandene Evaluierung, Reihenfolge blackjack → roulette → slots → dice) |    Nein     |
|  4  | Human-written-Disziplin    |   85   | SOPs gepflegt und von Hand gehalten                                                                                                                                                                                                |    Nein     |
|  5  | Doku-Deduplizierung        |   90   | Pflicht-Vorprüfungen mit Referenzzeilen statt Doppelpflege                                                                                                                                                                         |    Nein     |
|  6  | Verweis-Kommentare im Code |   70   | `wallet.ts` Z. 16–20 verweist auf Vertragsquelle; `AGENTS.md`-Block-Muster vorhanden — aber kein durchgängiges Muster                                                                                                              |    Nein     |

**Bottleneck:** #3 → Plan R06 — Rollout-Entscheid 2026-09-16 getroffen (1 weiterer Ordner ausgerollt + Regel); kein offener Punkt mehr. Re-Rating: #3 55 → **65** → R6-Schnitt **83 %** (vorher 81 %); Katalog-Schnitt bleibt bei 74 % (744/10 = 74,4 %).

<a id="r7--regel-7--duplikation-vermeiden-niveau-68"></a>

## R7 — Regel 7: Duplikation vermeiden (Niveau 68 %)

Zwei parallele 800-Zeilen-Dateien = jede Änderung liest 1.600. Duplikation ist Lesefootprint auf Raten.

**Detection-Basis (03a-R07-L1, 2026-09-14):** `scripts/check-duplication.mjs` (0 Dependencies, Zeilen-Fenster-Heuristik ≥ 30 signifikante Zeilen über Dateien, Sandbox-Kopien `src/app/testing/**` ausgenommen) findet als Top-Fund das verifizierte Crash-Cluster: Game-Loop-Paar (3 Blöcke, größter 96 Z. verbatim), beide Pages, beide Sidebars, beide Stages — konsistent mit Plan-03-Analyse. Aktuell 35 Datei-Paare im Warn-Level; `npm run check-duplication` / CI-Schritt (`continue-on-error: true`, Fail-soft).

|  #  | Sub-Subkategorie                  | Niveau | Befund & Beleg                                                                                                                                                                                                                                                               | Bottleneck? |
| :-: | --------------------------------- | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Crash-Loop-Duplikation            |   40   | ~350–360 verifizierte Duplikatzeilen (982 vs. 782); **Option 2026-09-16 entschieden: X3 (4,20)** — Utility-Modul in `crash-loop/`, Schritt 0 = X1 (4,63), Matrix in [Plan 03 §2a](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md), Umsetzung in separatem Plan |    🔴 JA    |
|  2  | Duplikat-Detection-Tooling        |   90   | `scripts/check-duplication.mjs` live, Echt-Test trifft Referenzfund (Crash-Cluster Top-Fund)                                                                                                                                                                                 |    Nein     |
|  3  | Shared-Module-Kultur              |   70   | `crash-helpers.ts`, `dice/v2/`-Shared-Types zeigen das Muster; aber nur wo zufällig entstanden                                                                                                                                                                               |    Nein     |
|  4  | Parallel-Komponenten-Pflege       |   55   | 6 Crash-UI-Komponenten pro Spielvariante getrennt — jede Änderung 2×                                                                                                                                                                                                         |    Nein     |
|  5  | Duplikat-Wachstums-Gate           |   75   | CI-Schritt in `quality-ci.yml` (Warn-Level, `continue-on-error`) — Wachstum sichtbar, kein Block                                                                                                                                                                             |    Nein     |
|  6  | Bewusste Duplikation dokumentiert |   80   | Option-Gate-Matrix (Plan 03) begründet bewusste Duplikation explizit                                                                                                                                                                                                         |    Nein     |

**Bottlenecks:** #1 → Gate geschlossen (2026-09-16: **X3 4,20**), die Extraktion selbst steht in einem separaten Implementation-Plan ([Klartext-Erklärung](01_15_03b_w3_x3_erklaerung.md) §4; #2/#5 durch R07-Execution geschlossen 2026-09-14).

<a id="r8--regel-8--generierten-code-aus-dem-lese-pfad-niveau-74"></a>

## R8 — Regel 8: Generierten Code aus dem Lese-Pfad (Niveau 74 %)

Generierten Code kennzeichnen, niemals refactoren, und aus dem Lese-Pfad nehmen.

**Wachstums-Kennzahl (03a-R08-L2):** `src/types/database.types.ts` = **2.054 Zeilen (Stand 2026-09-14)** — bei jedem Schema-Regenerations-Task aktualisieren.

|  #  | Sub-Subkategorie           | Niveau | Befund & Beleg                                                                                                                                                                                                           | Bottleneck? |
| :-: | -------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------: |
|  1  | Generierung gekennzeichnet |   85   | `database.types.ts` mit Supabase-Generator-Header                                                                                                                                                                        |    Nein     |
|  2  | Lese-Pfad-Abkoppelung      |   40   | Deny-Regel vorbereitet (`Read(src/types/database.types.ts)` in projekt-weitem `settings.json`), wartet auf Jan-Gate — Settings-Schreibversuch vom Permission-Classifier abgelehnt (Plan R08 §5 mit fertigem Dateiinhalt) |    Nein     |
|  3  | Nicht-Refactor-Disziplin   |   95   | Generierte Datei historisch nie handeditiert                                                                                                                                                                             |    Nein     |
|  4  | Regenerierbarkeits-Wissen  |   75   | `supabase gen types`-Workflow etabliert (Migrationsreihe 001–059)                                                                                                                                                        |    Nein     |
|  5  | Wachstum im Blick          |   75   | Größe-Kennzahl mit Datum dokumentiert (oben)                                                                                                                                                                             |    Nein     |

**Bottleneck:** #2 → Plan R08 — L1 wartet auf Jan-Gate (Settings-Freigabe).

<a id="r9--regel-9--test-dateien-modularisieren-niveau-83"></a>

## R9 — Regel 9: Test-Dateien modularisieren (Niveau 83 %)

Tests sind Code: 1.200-Zeilen-Test-Datei liest der Agent genauso komplett wie Produktions-Code.

**Executed 2026-09-14:** 1.254-Zeilen-`useCasinoStore.test.ts` in 5 thematische Dateien (78–394 Z.) + 2 Helper-Module aufgeteilt; 78 `it()`-Blöcke 1:1, Coverage unverändert 80,6 % lines (Plan R09 §5).

|  #  | Sub-Subkategorie         | Niveau | Befund & Beleg                                                                                                                                                     | Bottleneck? |
| :-: | ------------------------ | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------: |
|  1  | Test-Datei-Größe         |   90   | Größte Store-Test-Datei jetzt 394 Z. (process-game-result), alle < 400-Z.-Zielband; 1.254-Z.-Original gelöscht                                                     |    Nein     |
|  2  | Describe-Cluster-Grenzen |   90   | Cluster waren bereits thematisch klar und wurden 1:1 zu Dateien (snapshot-ui / process-game-result / achievements / fail-closed-session / config-delegation)       |    Nein     |
|  3  | Test-Helper-Extraktion   |   85   | `__tests__/helpers/store-fixture.ts` (Fixture-Factory, Setup/Teardown, getErrorSpy) + `helpers/mocks.ts` (vi.mock-Blöcke); 3 von 5 Dateien nutzen gemeinsame Mocks |    Nein     |
|  4  | Feature-Test-Spiegelung  |   80   | `__tests__/` pro Feature-Ordner vorhanden (z. B. `dice/v2/__tests__/`)                                                                                             |    Nein     |
|  5  | Fix-Task-Lesefootprint   |   80   | Store-Änderungs-Task liest nur noch das thematisch passende Test-Modul (max. 394 Z.) statt 1.254 Z. — −69 % Lesefootprint                                          |    Nein     |
|  6  | Fixture-Wiederverwendung |   70   | `makeSnapshot()`/`resultId()`/`setupTestEnv()` aus einem Helper statt kopierter Fixtures; Rest-Duplikation in fremden Feature-Tests bleibt                         |    Nein     |

**Bottlenecks:** keine 🔴 mehr — Regel gelebt; Rückfall-Schutz über R10 max-lines (greift auch für Test-Dateien).

<a id="r10--regel-10--guardrails-lint--messung-niveau-58"></a>

## R10 — Regel 10: Guardrails: Lint + Messung (Niveau 58 %)

Ohne Guardrail verfällt jede Struktur: `max-lines`-Lint-Regel + gelesen/gebraucht-Messung.

**Executed 2026-09-14:** Hard Gate `check-file-sizes` (error > 800 Z., 2 Legacy-Dateien grandfathered warn, 19 Dateien 600–800 als INFO-Beobachtungsliste) + CI-Verankerung **ohne** continue-on-error. Negativtest verifiziert (801-Z.-Datei → exit 1). **Nachtrag 2026-09-16:** Die ESLint-`max-lines`-Variante wurde von Jan **verworfen** — das Script-Gate erzwingt dasselbe hart, eine zweite Regel brächte nur die Warnung im Editor statt im CI-Log (Diff bleibt als Notiz in Plan R10 §5).

|  #  | Sub-Subkategorie             | Niveau | Befund & Beleg                                                                                                                                                                                    | Bottleneck? |
| :-: | ---------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | max-lines-Lint-Regel         |   60   | Enforcement existiert gleichwertig als Script-Gate (`scripts/check-file-sizes.mjs`, CI-blockierend); eslint-`max-lines`-Variante am 2026-09-16 **verworfen** (redundant, Diff als Notiz erhalten) |    Nein     |
|  2  | CI-Größen-Gate               |   95   | `quality-ci.yml` läuft `check-file-sizes` blockierend vor build; Negativtest exit 1 verifiziert                                                                                                   |    Nein     |
|  3  | gelesen/gebraucht-Messung    |   10   | Nie gemessen; hängt an Parent-Position 9 (`llm-usage` liefert 0 Datenpunkte)                                                                                                                      |    🔴 JA    |
|  4  | Trend-Monitoring             |   70   | Gate misst jeden CI-Run; INFO-Liste (19 Dateien 600–800) = kontinuierlicher Drift-Beobachtungsposten statt Punkt-Audit                                                                            |    Nein     |
|  5  | Codierungs-Regeln im Kontext |   85   | `coding-style.md` (800-Max, <50-Zeilen-Funktionen) in jeder Session vorgeladen                                                                                                                    |    Nein     |
|  6  | Pre-Commit-Verankerung       |   30   | Pre-Commit revalidiert Tests/Lint, kein Größen-Check                                                                                                                                              |    Nein     |

**Bottlenecks:** nur #3 → Parent-Plan 09/Messung. #1 ist funktional abgedeckt (Script-Gate statt Lint-Regel, ESLint-Variante 2026-09-16 verworfen).

---

## Regel-Bündel im Überblick (was Jan noch nicht kannte)

1. **Nicht in gleiche Teile schneiden, sondern entlang natürlicher Grenzen** — Domänen-Cluster, describe-Blöcke, Verantwortlichkeiten.
2. **Zusammengehöriges in EINEN Ordner** (Feature-based) — Agent versteht ein Feature aus einem Verzeichnis.
3. **Zwei Anti-Patterns vermeiden**: Riesen-Datei (> 800) **und** file-per-function.
4. **Fassade zuerst**: Ordner + index.ts — öffentliche API in 1 Datei statt 5 Interna.
5. **Typen statt Prosa**: Zod/TS-Verträge ersetzen Lese-Aufwand.
6. **Doku schichtet, Code nicht aufblähen**: Root → Verzeichnis → On-Demand.
7. **Duplikation ist Lesefootprint auf Raten**: zwei parallele 800-Zeilen-Dateien = jede Änderung liest 1.600.
8. **Generierten Code kennzeichnen + aus dem Lese-Pfad nehmen**, niemals refactoren.
9. **Tests sind Code**: 1.200-Zeilen-Test-Datei liest der Agent genauso komplett.
10. **Ohne Guardrail verfällt jede Struktur**: Größen-Gate (`check-file-sizes` in CI) + gelesen/gebraucht-Messung.

## Hebel-Ranking (wo die nächste Stunde am meisten bringt — Stand nach Execution)

| Rang | Regel                       | Warum zuerst                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :--: | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1   | **R3 Verantwortlichkeiten** | Gate geschlossen (2026-09-16): WalletService **W3 4,25** (Schritt 0 = W2), Crash-Loop **X3 4,20** (Schritt 0 = X1). Jetzt zählt nur noch die Umsetzung in separaten Implementation-Plänen — beide **Execution-Ready seit 2026-09-17**: [03b X3](Planungsdateien/03b_x3_crash_loop_schnitt_plan.md) (zuerst) · [03c W3](Planungsdateien/03c_w3_wallet_service_schnitt_plan.md) · Klartext: [01_15_03b](01_15_03b_w3_x3_erklaerung.md) — größter Niveau-Sprung im Katalog |
|  2   | **R8 Generierter Code**     | Einziger verbleibender offener Punkt: 1 Jan-Freigabe für `.claude/settings.json` (fertiger Inhalt in Plan §5) schließt den Read-Deny-Hebel                                                                                                                                                                                                                                                                                                                              |
|  3   | **R6 Doku-Layer**           | Erledigt (2026-09-16): 2. Ordner ausgerollt + Rollout-Regel fixiert; nächster Kandidat blackjack nach bestandener 1-Woche-Evaluierung — kein Jan-Gate mehr                                                                                                                                                                                                                                                                                                              |
|  4   | **R10 #3 Messung**          | Hängt an Parent-Plan 09 (`llm-usage`) — kein Eigenhebel dieses Katalogs                                                                                                                                                                                                                                                                                                                                                                                                 |

## Externe Belege (Web-Research 2026-09-14)

- [Structure Your Codebase for AI Coding Agents — 7 Patterns](https://blog.appxlab.io/2026/03/28/structure-codebase-ai-coding-agents/) · [Context Engineering: 8 Codebase Patterns](https://blog.appxlab.io/2026/04/05/context-engineering-ai-coding-agents-2/)
- [Large Codebase Best Practices — abgeleitet aus Claude-Code-Quellcode](https://github.com/sneg55/agent-starter/blob/main/guides/large-codebase-best-practices.md) (64 %-< 200-Zeilen-Basis, ≤ 5-Dateien-Golden-Rule)
- [Best practices for Claude Code (offizielle Doku)](https://code.claude.com/docs/en/best-practices.md) · [Large Codebases (offizielle Doku)](https://code.claude.com/docs/en/large-codebases.md)
- [How Claude Code works in large codebases (Anthropic Blog)](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)
- [Context-Files-Management (freeCodeCamp)](https://www.freecodecamp.org/news/how-to-manage-context-files-in-your-codebase-and-get-better-agent-output/) — ETH-Befund: LLM-generierte Doku senkt Erfolg, human-written hebt ihn
- [Context Rot / Lost in the middle (zzet.org)](https://zzet.org/gortex/codebase-too-large-for-context-window/) — Performance-Degradation ab ~32K Coding-Tokens

## Verwandte Artefakte

- [`01_15_03_code_modularisierung_lesfootprint.md`](01_15_03_code_modularisierung_lesfootprint.md) — Ist-Messung (Top 23 %), gleiche Hotspots von der Mess-Seite
- [`Planungsdateien/03_code_modularisierung_lesfootprint_plan.md`](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md) — Option-Gate-Matrix Crash-Duplikation (**X3 gewählt 2026-09-16**, Schritt 0 = X1)
- [`Planungsdateien/03a_r01…r10_*_plan.md`](Planungsdateien/) — 10 Execution-Ready-Pläne, je Regel einer
- [`../01_15_token_oekonomie_effizienz.md`](01_15_token_oekonomie_effizienz.md) — Parent-Position 3 (Gewichtung 10 %)
- [`xx_sop/06_service_layer_casino.md`](../xx_sop/06_service_layer_casino.md) — Pflicht-Lektüre vor Money-Pfad-Plänen (R01/R03/R04)
