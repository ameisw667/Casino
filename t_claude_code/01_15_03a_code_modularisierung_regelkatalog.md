# 01.15.03a — Code-Modularisierung: Regelkatalog für LLM-Lesefootprint (Übersichts-/Marktdatendatei)

> **Status:** 🔵 Bewertung (Ebene 1 + Sub-Sub-Aufschlüsselung) · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Vollständiger Regelkatalog der Code-Modularisierung aus Token-Sicht — Ergänzung zu [`01_15_03_code_modularisierung_lesfootprint.md`](01_15_03_code_modularisierung_lesfootprint.md) (dort Messung der Ist-Struktur, hier die Regeln selbst).
>
> **Auslöser (Jan, 2026-09-14):** Bisheriges Wissen = „1.000-Zeilen-Datei in 4 kleinere Dateien aufteilen". Ziel: vollständiger Regelkatalog + Sub-Subkategorien je Regel (max. 10, bewertet) + 10 Execution-Ready-Planungsdateien.
>
> **Skala:** Niveau % (100 = Regel vollständig gelebt, 0 = verletzt). Regel-Niveau = rechnerischer Schnitt der Sub-Subkategorien. **Extern belegt** = Web-Research 2026-09-14 (Quellen am Ende).
>
> **Korrektur-Log 2026-09-14 (2. Fassung):** (1) `guide-knowledge/` hat **keine** index.ts-Fassade (Glob-Verifikation; nur `chat-guide/index.ts` existiert) — Erstfassung behauptete fälschlich beides. (2) Alle Regel-Niveaus wurden von Schätzwerten auf rechnerische Sub-Sub-Schnitte umgestellt (5 Werte verschoben: R1 80→65, R2 85→87, R4 65→52, R8 55→66, R9 45→52).

## Kernaussage

**Fakt:** „Große Datei → 4 kleine Dateien" ist nur Regel #1 von 10 — und die fehleranfälligste. **Casino-Schnitt über alle 10 Regeln (bottom-up aus 61 Sub-Subkategorien): Stand 2026-09-14 nach Execution aller 10 Pläne = 74 %** (Execution-Vorlauf: 62 %) — Struktur stark (R2 87 %, R5 88 %), größte Hebel gehoben: Fassade R4 (52→77 %), Duplikat-Tooling R7 (49→68 %), Tests R9 (52→83 %), Guardrails R10 (30→58 %). **Offen sind nur 2 Jan-Gates an Plänen (R3 WalletService/Crash-Loop-Optionen, R8 Read-Deny-Settings) + 1 Rollout-Evaluierung (R6)** — die schwergewichtigen Refactors (WalletService-Split, Crash-Loop-Extraktion) sind bewusst NICHT in dieser Runde: die Pläne liefern die Option-Matrizen, Jan entscheidet in separaten Implementation-Plänen. Rückfall-Schutz ist aktiv: `check-file-sizes` blockiert in CI ab jetzt jede neue > 800-Zeilen-Datei.

## Übersichtstabelle (Nr · Regel · Niveau · Übersicht · Planungsdatei · Execution)

| Nr  | Regel                               |  Niveau  |                        Übersicht (Sub-Subs)                        | Planungsdatei                                                 |                       Execution                        |
| :-: | ----------------------------------- | :------: | :----------------------------------------------------------------: | ------------------------------------------------------------- | :----------------------------------------------------: |
|  1  | Natürliche Slicing-Grenzen          | **64 %** |     [§R1](#r1--regel-1--natürliche-slicing-grenzen-niveau-64)      | [Plan](Planungsdateien/03a_r01_slicing_grenzen_plan.md)       |          ✅ Executed (Rest-Hebel → R03-Gate)           |
|  2  | Feature-based statt layer-based     | **87 %** |   [§R2](#r2--regel-2--feature-based-statt-layer-based-niveau-87)   | [Plan](Planungsdateien/03a_r02_feature_organisation_plan.md)  |                  ✅ Executed (Bewahr)                  |
|  3  | Ein Verantwortungsbereich pro Modul | **62 %** | [§R3](#r3--regel-3--ein-verantwortungsbereich-pro-modul-niveau-62) | [Plan](Planungsdateien/03a_r03_single_responsibility_plan.md) |     🟡 Option-Matrizen fertig — **Jan-Gate offen**     |
|  4  | Fassade / index.ts öffentliche API  | **77 %** |   [§R4](#r4--regel-4--fassade-indexts-ffentliche-api-niveau-77)    | [Plan](Planungsdateien/03a_r04_fassade_index_plan.md)         |                      ✅ Executed                       |
|  5  | Typen & Schemas als Vertrag         | **88 %** |     [§R5](#r5--regel-5--typen--schemas-als-vertrag-niveau-88)      | [Plan](Planungsdateien/03a_r05_typen_vertraege_plan.md)       |                  ✅ Executed (Bewahr)                  |
|  6  | Doku-Layer parallel zum Code        | **81 %** |    [§R6](#r6--regel-6--doku-layer-parallel-zum-code-niveau-81)     | [Plan](Planungsdateien/03a_r06_doku_layer_plan.md)            |     ✅ Executed (Pilot; Rollout-Evaluierung offen)     |
|  7  | Duplikation vermeiden               | **68 %** |        [§R7](#r7--regel-7--duplikation-vermeiden-niveau-68)        | [Plan](Planungsdateien/03a_r07_duplikation_plan.md)           |      ✅ Executed (Tooling; Extraktion → R03-Gate)      |
|  8  | Generierten Code aus dem Lese-Pfad  | **74 %** | [§R8](#r8--regel-8--generierten-code-aus-dem-lese-pfad-niveau-74)  | [Plan](Planungsdateien/03a_r08_generierter_code_plan.md)      |       🟡 **Jan-Gate offen** (Read-Deny-Settings)       |
|  9  | Test-Dateien modularisieren         | **83 %** |     [§R9](#r9--regel-9--test-dateien-modularisieren-niveau-83)     | [Plan](Planungsdateien/03a_r09_test_modularisierung_plan.md)  |                ✅ Executed (archiviert)                |
| 10  | Guardrails: Lint + Messung          | **58 %** |     [§R10](#r10--regel-10--guardrails-lint--messung-niveau-58)     | [Plan](Planungsdateien/03a_r10_guardrails_plan.md)            | ✅ Executed (archiviert; ESLint-Diff optional bei Jan) |

**Schnitt: 742/10 = Niveau 74 %** (vor Execution: 62 %). Rest-Hebel-Ranking: R3 (62 %, Jan-Gate mit Option-Matrizen) → R1 (64 %, Rest-Hebel an R03) → R10 (58 %, #3 Messung an Parent-Plan 09) → R8 (74 %, Jan-Gate Settings) → R7 (68 %, Extraktion an R03) → R6 (81 %, Rollout) → R9 (83 %) → R4 (77 %) → R2/R5 (87–88 %, Bewahr).

---

## Offene Jan-Entscheidungen (Stand 2026-09-14, nach Execution aller 10 Pläne)

Alle Entscheidungspunkte dieser Runde an einer Stelle. Jede Zeile nennt die Datei mit dem vollständigen Entscheidungsmaterial (Optionen, Score, Pre-Mortem) — die Option-Matrizen selbst stehen in den verlinkten Abschnitten, nicht hier.

| # | Entscheidung | Entscheidungsmaterial (Datei §) | Optionen | Empfehlung | Wirkung bei Freigabe |
| :-: | --- | --- | --- | --- | --- |
| 1 | **WalletService aufteilen?** | [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2a (+ konsolidiert §2b, Gate 1) | A: 6 Domänen-Module + Fassade · B: Status quo + Marker · **C: nur Nicht-Geld-Domänen extrahieren** (Gamification, Social/Chat, Promo, Seeds) — Settlement-/Crash-Kern bleibt | **C** (Score 3.7) | Größter Niveau-Sprung im Katalog (R3 62 % ↑); Money-Pfad-Kern bleibt unberührt — Umsetzung in separatem Implementation-Plan |
| 2 | **Crash-Loop-Hook aufteilen?** | [`Planungsdateien/03a_r03_single_responsibility_plan.md`](Planungsdateien/03a_r03_single_responsibility_plan.md) §2b (Gate 2); Vollmatrix in [`Planungsdateien/03_code_modularisierung_lesfootprint_plan.md`](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md) §2a | B: `crash-loop-shared.ts` extrahieren · C: Folge-Schritt danach · D: weitergehend | **B** (Score 4.1) | ~350–360 verifizierte Dup-Zeilen zwischen `useCrashGameLoop.ts` (983) und `useCrashMultiplayerGameLoop.ts` (782) entfallen; entschärft zugleich R1-#5 und R7-#1 |
| 3 | **Read-Deny für generierten Code freigeben?** | [`Planungsdateien/03a_r08_generierter_code_plan.md`](Planungsdateien/03a_r08_generierter_code_plan.md) §5 | Freigabe: `.claude/settings.json` mit `{"permissions":{"deny":["Read(src/types/database.types.ts)"]}}` anlegen · Ablehnung: Status quo | **Freigabe** (Inhalt fertig zum Kopieren) | `database.types.ts` (2.055 Z., generiert) fällt aus dem Lese-Pfad; R8 74 % ↑. Mein Schreibversuch wurde vom Permission-Classifier abgelehnt — Settings wirken auf alle Sessions, daher dein Gate |
| 4 | **Verzeichnis-Doku ausrollen?** | [`Planungsdateien/03a_r06_doku_layer_plan.md`](Planungsdateien/03a_r06_doku_layer_plan.md) §1 (L2/L3) + §5 | Rollout auf weitere Spiel-Ordner · Pilot verlängern · Pilot zurücknehmen | **Nach 1-Woche-Pilot entscheiden** (Pilot: `src/components/casino/games/crash/CLAUDE.md`, 18 Z., seit 2026-09-14) | R6 81 % ↑; Schwelle ≥ 2/3 der 3 Mess-Kriterien ist in §R6 fixiert — Entscheidung am Ergebnis statt am Gefühl |
| 5 | **(Optional) `max-lines`-ESLint-Regel nachziehen?** | [`Planungsdateien/03a_r10_guardrails_plan.md`](Planungsdateien/03a_r10_guardrails_plan.md) §5 (Block zum Kopieren) | Einbauen (redundant zum aktiven Script-Gate) · Weglassen | **Weglassen oder beiläufig** — Enforcement läuft bereits als CI-Hard-Gate (`check-file-sizes`) | Nur Komfort: Warnung im Editor statt im CI-Log. Mein Edit wurde vom config-protection-Hook blockiert (Schutz für Linter-Configs); Umgehung nur über Settings-Änderung |
| 6 | **CLAUDE.md-Hotspot-Eintrag korrigieren?** | `CLAUDE.md` § Tool-Output-Ökonomie, Zeile 125 | Eintrag `useCasinoStore.test.ts (1.254)` streichen/ersetzen · belassen | **Streichen** (Datei existiert seit 03a-R09 nicht mehr) | CLAUDE.md ist für mich schreibgeschützt (Projektregel) — Freigabe im Chat nötig, dann ziehe ich die Hotspot-Liste auf den Stand 2026-09-14 nach |

**Nicht in dieser Liste (Abhängigkeit statt Jan-Gate):** R10-#3 (gelesen/gebraucht-Messung) hängt am Parent-Plan 09 (`llm-usage` liefert 0 Datenpunkte) — dort entschieden, hier nur gespiegelt.

---

<a id="r1--regel-1--natürliche-slicing-grenzen-niveau-64"></a>

## R1 — Regel 1: Natürliche Slicing-Grenzen (Niveau 64 %)

„4 × 250 Zeilen" ist der Anfängerfehler: geschnitten wird entlang logischer Grenzen (Domänen-Cluster, describe-Blöcke, Verantwortlichkeiten). **Extern belegt:** Claude Code selbst hält 64 % seiner ~1.900 Dateien < 200 Zeilen; Extraktion ab ~300 Zeilen.

|  #  | Sub-Subkategorie                                  | Niveau | Befund & Beleg                                                                                                                                                                        | Bottleneck? |
| :-: | ------------------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Domänen-Cluster statt gleicher Teile              |   75   | `wallet.ts` (865 Z.) hat erkennbare Cluster (Settlement/Crash/Seeds/Promo/Social/Gamification) — Slicing-Basis vorhanden, Aufteilung wäre nach Domänen, nicht nach Zeilenzahl möglich |    Nein     |
|  2  | Zielbänder eingehalten (200–400 typisch, 800 max) |   90   | 86,7 % der 1.028 TS-Dateien ≤ 300 Zeilen (Messung 2026-09-14)                                                                                                                         |    Nein     |
|  3  | ~300-Zeilen-Extraktionsschwelle gelebt            |   75   | 89 Dateien in 300–500, 44 in 500–800 — Grenze meist gezogen, einige Dateien drüber ohne Extraktion                                                                                    |    Nein     |
|  4  | Abschnittsmarkierung großer Dateien               |   40   | `wallet.ts` hat **keine** Abschnittskommentare (26 Methoden unmarkiert); `useCrashGameLoop.ts` dagegen markiert 3 Sektionen — inkonsistent                                            |    🔴 JA    |
|  5  | Shared-State-Bündelung vor Extraktion             |   45   | `useCrashGameLoop` teilt ~15+ Refs über 3 Closure-Sektionen — Extraktion erfordert Ref-Bundling, nie vorbereitet                                                                      |    🔴 JA    |
|  6  | Generiertes ausgenommen                           |   95   | `database.types.ts` (2.054 Z.) konsequent nie angefasst                                                                                                                               |    Nein     |
|  7  | Grenz-Entscheidung dokumentiert (Warum-Grenze)    |   30   | Keine Konvention, warum eine Grenze wo liegt; Grenzen sind implizit                                                                                                                   |    🔴 JA    |

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

|  #  | Sub-Subkategorie                      | Niveau | Befund & Beleg                                                                                                        | Bottleneck? |
| :-: | ------------------------------------- | :----: | --------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Mixed-Concern-Hook                    |   35   | `useCrashGameLoop.ts` (982 Z.): Particle-Physics (Z. 118–434) + Canvas-Draw (Z. 435–831) + RAF-Loop in **einem** Hook |    🔴 JA    |
|  2  | Multiplayer-Duplikat gleiche Struktur |   40   | `useCrashMultiplayerGameLoop.ts` (782 Z.) kopiert dieselbe 3-Sektions-Mischstruktur (Z. 120/239/616)                  |    🔴 JA    |
|  3  | UI-Komponenten-Slicing                |   85   | Crash in Stage/Sidebar/PixelCanvas/ControlSidebar getrennt                                                            |    Nein     |
|  4  | Page als Transport-Schicht            |   70   | `crash/page.tsx` (769 Z.) groß, aber UI-only (keine Settlement-Logik); Größe bleibt Lesefaktor                        |    Nein     |
|  5  | Service-Klassen-Kohäsion              |   50   | `WalletService`: 1 Klasse, ~26 statische Methoden über 6 Domänen (Money-Pfad)                                         |    🔴 JA    |
|  6  | File-per-function vermieden           |   90   | Keine 10–20-Zeilen-Fragmentdateien im Repo                                                                            |    Nein     |

**Bottlenecks:** #1, #2, #5 → Plan R03 (Umsetzung der Crash-Seite über Option-Gate in [Plan 03](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md)).

<a id="r4--regel-4--fassade-indexts-ffentliche-api-niveau-77"></a>

## R4 — Regel 4: Fassade / index.ts öffentliche API (Niveau 77 %)

Ordner + index.ts: Agent sieht öffentliche API in 1 Datei statt 5 Interna. **Stand 2026-09-14:** beide großen Service-Feature-Ordner haben Fassade (`chat-guide/index.ts`, `guide-knowledge/index.ts` — Letztere als reine Re-Export-Datei über der bestehenden `registry.ts`-Aggregation, 22 Zeilen, 6 Export-Statements).

**Fassaden-Konvention (03a-R04-L2):** Jeder neue Feature-Ordner unter `src/lib/casino/` bekommt beim Anlegen eine `index.ts`-Fassade, die (1) ausschließlich die öffentliche API re-exportiert — keine neuen Exporte, keine Umbenennung, (2) einen existierenden internen Aggregator (`registry.ts`-Muster) via `export *` nutzt statt alles zu duplizieren, (3) zusätzlich nur Vertragsmodule (Zod-Schemas/Typen) und Admin-Einstiegspunkte ergänzt, (4) max. ~6 Export-Statements / ~15 symbolische Exporte umfasst (Barrel-Bloat-Grenze), (5) additive bleibt: Tiefen-Importe bestehender Konsumierender werden nicht umgestellt, die Fassade ist optional nutzbar. Muster: `src/lib/casino/guide-knowledge/index.ts`.

|  #  | Sub-Subkategorie                    | Niveau | Befund & Beleg                                                                                                      | Bottleneck? |
| :-: | ----------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | index.ts-Fassaden vorhanden         |   85   | 2 von 2 großen Service-Feature-Ordnern (`chat-guide/`, `guide-knowledge/` seit 03a-R04)                             |    Nein     |
|  2  | Registry-Alternative                |   75   | `guide-knowledge/registry.ts` ist interner Aggregator und wird von der Fassade via `export *` genutzt statt ersetzt |    Nein     |
|  3  | Öffentliche API dokumentiert        |   75   | Service-Vertrag in `xx_docs/05_service_layer_context.md` + `CLAUDE.md` § Service Layer                              |    Nein     |
|  4  | Tiefen-Import-Grenze                |   55   | `wallet.ts` als Direktklasse — jeder Import zwingt 865-Zeilen-Read bei Vertragsfragen                               |    Nein     |
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

<a id="r6--regel-6--doku-layer-parallel-zum-code-niveau-81"></a>

## R6 — Regel 6: Doku-Layer parallel zum Code (Niveau 81 %)

Root-Kurz-Doku → Verzeichnis-Doku → On-Demand-Tiefe. **Extern belegt:** LLM-generierte Doku-Dateien senken Erfolgsquote (−3 %) und erhöhen Kosten (+20 %) — human-written halten.

**Evaluierungs-Mechanik Pilot (03a-R06-L2, 2026-09-14):** Pilot `src/components/casino/games/crash/CLAUDE.md` (18 Zeilen, nur Zeiger + Gotchas). Nach 1 Woche Praxis prüfen an 3 Kriterien: (1) Wurde die Datei in einem Crash-Task tatsächlich gelesen (Session-Beweis, nicht Behauptung)? (2) Hat sie einen Task verkürzt (z. B. Dep-Array-Regel ohne Neu-Analyse der Loops befolgt)? (3) Ist sie noch aktuell nach Code-Änderungen (Gotchas nicht stale)? Bewertung als Jan-Entscheidung: Rollout auf weitere Spiel-Ordner nur, wenn ≥ 2 der 3 Kriterien erfüllt — sonst Pilot verwerfen statt mittlere Doku-Schicht künstlich am Leben halten (Anti-Regel: keine Doku pro Doku).

|  #  | Sub-Subkategorie           | Niveau | Befund & Beleg                                                                                                        | Bottleneck? |
| :-: | -------------------------- | :----: | --------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Root-Kurz-Doku             |   90   | `CLAUDE.md` als On-Demand-Router, keine Systemdetails                                                                 |    Nein     |
|  2  | On-Demand-Tiefen-Doku      |   95   | 19 SOPs + `xx_docs/**` nur bei Bedarf (Top 10 % in [`01_7_context_management.md`](01_7_context_management.md) Pos. 7) |    Nein     |
|  3  | Verzeichnis-Ebene Doku     |   55   | Pilot angelegt (`crash/CLAUDE.md`, 18 Z., 2026-09-14); Rollout wartet auf 1-Woche-Evaluierung (Jan-Gate)              |    Nein     |
|  4  | Human-written-Disziplin    |   85   | SOPs gepflegt und von Hand gehalten                                                                                   |    Nein     |
|  5  | Doku-Deduplizierung        |   90   | Pflicht-Vorprüfungen mit Referenzzeilen statt Doppelpflege                                                            |    Nein     |
|  6  | Verweis-Kommentare im Code |   70   | `wallet.ts` Z. 16–20 verweist auf Vertragsquelle; `AGENTS.md`-Block-Muster vorhanden — aber kein durchgängiges Muster |    Nein     |

**Bottleneck:** #3 → Plan R06 — Pilot executed (2026-09-14), Rest wartet auf Evaluierung.

<a id="r7--regel-7--duplikation-vermeiden-niveau-68"></a>

## R7 — Regel 7: Duplikation vermeiden (Niveau 68 %)

Zwei parallele 800-Zeilen-Dateien = jede Änderung liest 1.600. Duplikation ist Lesefootprint auf Raten.

**Detection-Basis (03a-R07-L1, 2026-09-14):** `scripts/check-duplication.mjs` (0 Dependencies, Zeilen-Fenster-Heuristik ≥ 30 signifikante Zeilen über Dateien, Sandbox-Kopien `src/app/testing/**` ausgenommen) findet als Top-Fund das verifizierte Crash-Cluster: Game-Loop-Paar (3 Blöcke, größter 96 Z. verbatim), beide Pages, beide Sidebars, beide Stages — konsistent mit Plan-03-Analyse. Aktuell 35 Datei-Paare im Warn-Level; `npm run check-duplication` / CI-Schritt (`continue-on-error: true`, Fail-soft).

|  #  | Sub-Subkategorie                  | Niveau | Befund & Beleg                                                                                                                                                              | Bottleneck? |
| :-: | --------------------------------- | :----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------: |
|  1  | Crash-Loop-Duplikation            |   40   | ~350–360 verifizierte Duplikatzeilen (982 vs. 782); Option B vetted in [Plan 03 §2a](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md), wartet auf Jan-Freigabe |    🔴 JA    |
|  2  | Duplikat-Detection-Tooling        |   90   | `scripts/check-duplication.mjs` live, Echt-Test trifft Referenzfund (Crash-Cluster Top-Fund)                                                                                |    Nein     |
|  3  | Shared-Module-Kultur              |   70   | `crash-helpers.ts`, `dice/v2/`-Shared-Types zeigen das Muster; aber nur wo zufällig entstanden                                                                              |    Nein     |
|  4  | Parallel-Komponenten-Pflege       |   55   | 6 Crash-UI-Komponenten pro Spielvariante getrennt — jede Änderung 2×                                                                                                        |    Nein     |
|  5  | Duplikat-Wachstums-Gate           |   75   | CI-Schritt in `quality-ci.yml` (Warn-Level, `continue-on-error`) — Wachstum sichtbar, kein Block                                                                            |    Nein     |
|  6  | Bewusste Duplikation dokumentiert |   80   | Option-Gate-Matrix (Plan 03) begründet bewusste Duplikation explizit                                                                                                        |    Nein     |

**Bottlenecks:** #1 → Umsetzung hängt an Jan-Freigabe Plan 03 Option B (#2/#5 durch R07-Execution geschlossen 2026-09-14).

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

**Executed 2026-09-14:** Hard Gate `check-file-sizes` (error > 800 Z., 2 Legacy-Dateien grandfathered warn, 19 Dateien 600–800 als INFO-Beobachtungsliste) + CI-Verankerung **ohne** continue-on-error. ESLint-Variante durch config-protection-Hook blockiert — fertiger Diff wartet auf Jan (Plan R10 §5). Negativtest verifiziert (801-Z.-Datei → exit 1).

|  #  | Sub-Subkategorie             | Niveau | Befund & Beleg                                                                                                                                               | Bottleneck? |
| :-: | ---------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------: |
|  1  | max-lines-Lint-Regel         |   60   | Enforcement existiert gleichwertig als Script-Gate (`scripts/check-file-sizes.mjs`); eslint-`max-lines`-Diff fertig, aber an Jan-Gate gebunden (Hook-Schutz) |    Nein     |
|  2  | CI-Größen-Gate               |   95   | `quality-ci.yml` läuft `check-file-sizes` blockierend vor build; Negativtest exit 1 verifiziert                                                              |    Nein     |
|  3  | gelesen/gebraucht-Messung    |   10   | Nie gemessen; hängt an Parent-Position 9 (`llm-usage` liefert 0 Datenpunkte)                                                                                 |    🔴 JA    |
|  4  | Trend-Monitoring             |   70   | Gate misst jeden CI-Run; INFO-Liste (19 Dateien 600–800) = kontinuierlicher Drift-Beobachtungsposten statt Punkt-Audit                                       |    Nein     |
|  5  | Codierungs-Regeln im Kontext |   85   | `coding-style.md` (800-Max, <50-Zeilen-Funktionen) in jeder Session vorgeladen                                                                               |    Nein     |
|  6  | Pre-Commit-Verankerung       |   30   | Pre-Commit revalidiert Tests/Lint, kein Größen-Check                                                                                                         |    Nein     |

**Bottlenecks:** #3 → Parent-Plan 09/Messung (#1 ist funktional abgedeckt; ESLint-Diff optional bei Jan).

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
10. **Ohne Guardrail verfällt jede Struktur**: `max-lines`-Lint + gelesen/gebraucht-Messung.

## Hebel-Ranking (wo die nächste Stunde am meisten bringt — Stand nach Execution)

| Rang | Regel                       | Warum zuerst                                                                                                                                                                              |
| :--: | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1   | **R3 Verantwortlichkeiten** | Beide Option-Matrizen sind fertig (§2a/§2b des Plans) — eine Jan-Entscheidung (WalletService A/B/C, Empfehlung C; Crash B/C/D, Empfehlung B) startet den größten Niveau-Sprung im Katalog |
|  2   | **R8 Generierter Code**     | 1 Jan-Freigabe für `.claude/settings.json` (fertiger Inhalt in Plan §5) schließt den Read-Deny-Hebel                                                                                      |
|  3   | **R6 Doku-Layer**           | Rollout-Entscheidung nach 1-Woche-Pilot (Pilot läuft seit 2026-09-14, crash/)                                                                                                             |
|  4   | **R10 #3 Messung**          | Hängt an Parent-Plan 09 (`llm-usage`) — kein Eigenhebel dieses Katalogs                                                                                                                   |

## Externe Belege (Web-Research 2026-09-14)

- [Structure Your Codebase for AI Coding Agents — 7 Patterns](https://blog.appxlab.io/2026/03/28/structure-codebase-ai-coding-agents/) · [Context Engineering: 8 Codebase Patterns](https://blog.appxlab.io/2026/04/05/context-engineering-ai-coding-agents-2/)
- [Large Codebase Best Practices — abgeleitet aus Claude-Code-Quellcode](https://github.com/sneg55/agent-starter/blob/main/guides/large-codebase-best-practices.md) (64 %-< 200-Zeilen-Basis, ≤ 5-Dateien-Golden-Rule)
- [Best practices for Claude Code (offizielle Doku)](https://code.claude.com/docs/en/best-practices.md) · [Large Codebases (offizielle Doku)](https://code.claude.com/docs/en/large-codebases.md)
- [How Claude Code works in large codebases (Anthropic Blog)](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)
- [Context-Files-Management (freeCodeCamp)](https://www.freecodecamp.org/news/how-to-manage-context-files-in-your-codebase-and-get-better-agent-output/) — ETH-Befund: LLM-generierte Doku senkt Erfolg, human-written hebt ihn
- [Context Rot / Lost in the middle (zzet.org)](https://zzet.org/gortex/codebase-too-large-for-context-window/) — Performance-Degradation ab ~32K Coding-Tokens

## Verwandte Artefakte

- [`01_15_03_code_modularisierung_lesfootprint.md`](01_15_03_code_modularisierung_lesfootprint.md) — Ist-Messung (Top 23 %), gleiche Hotspots von der Mess-Seite
- [`Planungsdateien/03_code_modularisierung_lesfootprint_plan.md`](Planungsdateien/03_code_modularisierung_lesfootprint_plan.md) — Option-Gate-Matrix Crash-Duplikation (Option B empfohlen, wartet auf Jan)
- [`Planungsdateien/03a_r01…r10_*_plan.md`](Planungsdateien/) — 10 Execution-Ready-Pläne, je Regel einer
- [`../01_15_token_oekonomie_effizienz.md`](01_15_token_oekonomie_effizienz.md) — Parent-Position 3 (Gewichtung 10 %)
- [`xx_sop/06_service_layer_casino.md`](../xx_sop/06_service_layer_casino.md) — Pflicht-Lektüre vor Money-Pfad-Plänen (R01/R03/R04)
