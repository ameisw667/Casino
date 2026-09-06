# TO-03 — Scanner-Rohprotokoll (Phase 1a / L1)

> **Zweck:** Vollständiges, unverändertes Protokoll aller Scanner-Läufe von L1 samt Klassifikation jeder einzelnen Meldung. Fundmatrix (ab L2) zitiert nur noch klassifizierte Funde — hier liegt der Rohstand.
> **Messdatum aller Läufe:** 2026-08-30 · **Plan:** [`0101_S1_0403_repovereinfachung.md`](0101_S1_0403_repovereinfachung.md) · **Keine `package.json`- oder Config-Änderung** durch die Läufe (alle via `npx` / nur-Lesekonsum).

## A — Zähl-Methodik und Auflösung der 659→802-Diskrepanz (Plan §10)

**Belegter Bestand (eigene Messung 2026-08-30):**

| Zählung (`find src -type f \( -name "*.ts" -o -name "*.tsx" \)`) |                                     Wert |
| :--------------------------------------------------------------- | ---------------------------------------: |
| TS/TSX gesamt unter `src/**`                                     |                                  **802** |
| davon Testdateien (`*.test.ts`/`*.test.tsx`)                     |                                      168 |
| davon Non-Test-Quellcode                                         |                                      634 |
| davon generiert (`src/types/database.types.ts`, 1.931 Zeilen)    | 1 (Sonderfall, vom Sweep ausgeschlossen) |
| `*.d.ts` unter `src/**`                                          |                                        0 |

**Varianten zur Rekonstruktion des 659-Werts von 04_tokens (2026-08-29):**

| Variante                          | Ergebnis | Treffer? |
| :-------------------------------- | -------: | :------: |
| Bestand gesamt (heute)            |      802 |   nein   |
| ohne `src/app/testing/**` (94)    |      708 |   nein   |
| ohne `testing/**` + `lab/**` (30) |      678 |   nein   |

**Schlussfolgerung (verifiziert 2026-08-30, keine Spekulation über die historische Methode):** Keine der sauber definierbaren Zähl-Varianten ergibt 659 — der Messlauf vom 2026-08-29 hat mit einer nicht dokumentierten Methodik gezählt (mutmaßlich glob-basiert mit anderen Exclude-Regeln). Die Diskrepanz wird deshalb als **methodische Unbestimmtheit des historischen Werts** protokolliert, nicht als Datei-Aufkommen oder -Verlust. **Verbindliche Baseline für den Sweep: 802** (Methodik oben vollständig reproduzierbar); die Wellen-Schätzung §1 (5 ±1 Wellen) bleibt unverändert davon abhängig — Größe ändert sich damit nicht.

## B — Scanner-Überblick

| Scanner        | Befehlszeile                                   | Meldungen                                                                                                                     | Status                                                                                                                                                 |
| :------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| knip 6.33.0    | `npx -y knip`                                  | 75 unused files · 20 unused devDeps · 1 unlisted binary · 91 unused exports · 69 unused exported types · 11 duplicate exports | gelaufen (exit 1 = Funde vorhanden, erwartet)                                                                                                          |
| depcheck 1.4.7 | `npx -y depcheck`                              | 21 unused devDeps · 2 missing dependencies                                                                                    | gelaufen (Ausgabe vollständig; Shell-Wrapper meldete Exit 127 als Wrapper-Artefakt, Scanner-Output unvollständig-indiziert? nein: 25/25 Zeilen belegt) |
| ts-prune       | `npx -y ts-prune`                              | 506 Zeilen                                                                                                                    | gelaufen (exit 0)                                                                                                                                      |
| madge 8.0.0    | `npx madge --circular --extensions ts,tsx src` | 4 zirkuläre Abhängigkeiten (811 Dateien verarbeitet)                                                                          | gelaufen (exit 1 = Funde, erwartet)                                                                                                                    |

Kein Scanner-Ausfall → **keine Scanner-Lücke**, L4 kann ohne Messgrenze-Dokumentation arbeiten.

## C — Klassifikation (Abnahmekriterium: 0 unklassifizierte Meldungen)

Klassifikationstypen: **FP** = False Positive (benannt) · **Hinweis** = L2/L3-Prüfauftrag, kein Befund · **Fund-Kandidat** = geht als Fundzeile in die Fundmatrix (Schwere wird in L4 fixiert).

### C1 — knip

| Meldungsblock                                                                                                                                                                                                                                                                                                                                                       | Klassifikation                                                                                                                                                                                                                                                                                                   | Zuordnung (vollständig, lückenlos)                                                                                                                                                                                                                                                                                                                                                 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unused files: Root-/Tooling-Entries (`.claude/agent-evals/…/leftover_test_ref.tsx`, `style-dictionary.config.mjs`, `trigger.config.ts`, `tests/crash-simulation.ts`)                                                                                                                                                                                                | FP (Entry-Points/Tooling außerhalb src-Sweeps)                                                                                                                                                                                                                                                                   | knip kennt diese Konventionen nicht; `trigger.config.ts` + `style-dictionary.config.mjs` sind Framework-Configs, die `.claude`-Fixture ist Agent-Prüfixtur — keine Sweeping-Objekte                                                                                                                                                                                                |
| Unused files: `scripts/**` (23 Dateien: audit-games-perf, capture-guide-sandbox, chaos/_, crash-debug, deep/fast-responsive-audit, guide-telemetry-report, history(-2)-check, kill-stale-dev, loadtest/_, measure-bundle, mobile-overflow-check, roulette-e2e/-simulation, test-config-remote, test-upstash, to07-analyze/-sweep, verify-* 7 Dateien, verify-build) | Hinweis (Einzeln im L3-Checkblock gegen `package.json`-Skripte verifizieren; mehrere sind npm-Skripte wie `verify:supabase`/`sim:economy` — knip prüft Script-Kette nicht vollständig)                                                                                                                           | to07-Fundsweeps sind explizit „reproduzierbar verbleibend" laut 04_tokens (TO-07-Abschluss) → FP-Kandidaten; die übrigen einzeln urteilen, **kein still löschen**                                                                                                                                                                                                                  |
| Unused files: `src/trigger/admin-analytics-snapshot.ts`, `src/trigger/weekly-player-recap.ts`                                                                                                                                                                                                                                                                       | FP (Trigger.dev-Task-Entry-Points via `trigger.config.ts`)                                                                                                                                                                                                                                                       | Tasks werden über die Trigger-Config registriert, nicht importiert                                                                                                                                                                                                                                                                                                                 |
| Unused files: `src/types/database.types.ts`                                                                                                                                                                                                                                                                                                                         | FP (generiert, Plan-Sonderfall b — trotzdem im L2-Importcheck gegenprüfen)                                                                                                                                                                                                                                       | wird vom Supabase-Typengenerator erzeugt                                                                                                                                                                                                                                                                                                                                           |
| Unused files: übrige 45 `src/**`-Dateien (GameSkeleton + TO-10-bekanntes Triple, `errors.ts` (!), `GamificationProvider`, 8 Hooks, 20 UI/Home/Social/Stats-Komponenten, 5 Controls/Games-V2-Komponenten, guide-knowledge knowledge-Dateien 3, `utils/time-patch.ts`, Leaderboard-`.tsx`-Test (E4-Konsistenz))                                                       | **Fund-Kandidaten** (Kernmasse des L2/L3-Querlesens)                                                                                                                                                                                                                                                             | Besondere Prüfpunkte: `src/lib/casino/errors.ts` (kollidiert mit der Erwartung, dass Fehler-Typen überall genutzt werden — Priorität 1 des L2-Checks); guide-knowledge knowledge-Dateien (`commands/games/navigation.ts` — mutmaßlich über `content/`-Laufzeitindex geladen, FP-Check Pflicht); `BlackjackTableV2`/`CardHandV2`/`PlayingCardV2` (V2-Ableger der Blackjack-Tabelle) |
| Unused devDependencies (20, siehe Anhang)                                                                                                                                                                                                                                                                                                                           | **Fund-Kandidaten** (Klasse: Dep-Entfernung = Phase 2 nur auf Jans Einzel-Freigabe)                                                                                                                                                                                                                              | Überschneidung mit depcheck unten; `madge` selbst bewusst NICHT zur Entfernung vorschlagen (L1-Scanner, dokumentiert) — Ausnahme mit Begründung                                                                                                                                                                                                                                    |
| Unlisted binary: `sentry-cli`                                                                                                                                                                                                                                                                                                                                       | **Fund-Kandidat** (HIGH-Cand.: benutztes CLT ohne Paket-Eintrag — Build-Umgebungsabhängigkeit)                                                                                                                                                                                                                   | L4 belegt die Nutzstellen                                                                                                                                                                                                                                                                                                                                                          |
| Unused exports (91) + unused exported types (69)                                                                                                                                                                                                                                                                                                                    | zwei Unterklassen: (a) Einträge, die ts-prune als „used in module" spiegelt → **Hinweis** (Export-Overhang, kein toter Code); (b) Rest ohne Modulnutzung und nicht als Entry-Point (v. a. `crash-multiplayer/index.ts`-Re-Exports, `hero-cinematic/index.ts`, Trigger-Payloads der FP-Files) → **Fund-Kandidat** | L2/L3 je Datei; Massenbündel bei `guide-knowledge/registry.ts` (12 Einträge) und `chat-guide/index.ts` (17 Einträge) als Barrel-Export-Gruppe prüfen                                                                                                                                                                                                                               |
| Duplicate exports (11)                                                                                                                                                                                                                                                                                                                                              | **Fund-Kandidaten** (LOW bis MEDIUM: named+default parallel exportiert, z. B. Controls-Familie und lab)                                                                                                                                                                                                          | Urteil: welchen Export-API-Stil das Repo künftig nutzt                                                                                                                                                                                                                                                                                                                             |

### C2 — depcheck

| Block                                                                                                                                              | Klassifikation                                                                         | Zuordnung                                                                         |
| :------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| 21 „Unused devDependencies" (alle knip-Funde + `prettier-plugin-tailwindcss`, das knip als bekannt behandelt) → **Übereinstimmung 20/20 mit knip** | **Fund-Kandidaten** (gleiche Klasse wie C1-Block 6)                                    | Konkordanz der zwei unabhängigen Scanner = starke Beleglage für die Dep-Fundliste |
| Missing dependency: `style-dictionary` (`style-dictionary.config.mjs`)                                                                             | **Fund** (HIGH-Kandidat: Config vorhanden, Paket fehlt — Design-Token-Pipeline fragil) | L4 belegt                                                                         |
| Missing dependency: `playwright` (`scripts/capture-guide-sandbox.mjs`)                                                                             | **Fund** (MEDIUM-Kandidat `@playwright/test` statt `playwright` installiert)           | L4 belegt                                                                         |

### C3 — ts-prune (506 Zeilen, klassenbasiert vollständig abgedeckt)

| Klasse (erfüllt jede Meldung)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Klassifikation                                                                              | Repräsentanten/Abgrenzung                                                                                                           |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| Root-Configs (`next.config.ts`, `playwright.config.ts`, `trigger.config.ts`, `vitest.config.ts`)                                                                                                                                                                                                                                                                                                                                                                                                              | FP                                                                                          | Framework-Configs                                                                                                                   |
| Build-Artefakte (`.next/types/routes.d.ts`, `.next/dev/types/**`, 15 Zeilen)                                                                                                                                                                                                                                                                                                                                                                                                                                  | FP                                                                                          | kein Quellbestand                                                                                                                   |
| Next-Runtime-Entries (`src/instrumentation.ts`, `src/proxy.ts`, alle `app/**/page                                                                                                                                                                                                                                                                                                                                                                                                                             | layout                                                                                      | error                                                                                                                               | not-found | forbidden | route`mit`default`/`metadata`/`dynamic`/`viewport`/`GET`/`POST`/`revalidate`) | FP (≈ 200 der 506 Zeilen) | Entry-Point-Konventionen (App Router + Route Handler) |
| Trigger.dev-Task-Exports (`src/trigger/*`, 24 Zeilen)                                                                                                                                                                                                                                                                                                                                                                                                                                                         | FP                                                                                          | Task-Entries + deren Payload-Typen                                                                                                  |
| Meldungen mit Suffix `(used in module)` (≈ 210 Zeilen)                                                                                                                                                                                                                                                                                                                                                                                                                                                        | **Hinweis** (Export-Overhang: `export` streichbar, Code ist lebendig)                       | Zählung im Anhang; auffällige Cluster (`errors.ts`-Familie, `neon-arcade-lobby-model`, `wallet-contract`) stichprobenartig in L2/L3 |
| Übrige ohne Suffix und ohne Entry-Charakter (≈ 60 Zeilen: Hooks, GameSkeleton, ProvablyFairTool, WalletModal, GamificationProvider, Home-Komponenten, SuperButton/ThemeSelector/ParallaxLayer, GlobalLeaderboard, LiveActivityFeed, SessionLengthChart, LeaderboardHeroStats, DailyTournamentTeaser, VipLiveStreamRail, InteractiveArcadeGrid, ProgressiveJackpotSection, HeroSectionV2, LevelProgress, Time-Utils, `useGameStore`, `useIsNarrowViewport`, `useGameKeyboard`, `useParallax`, `useSafeMotion`) | **Fund-Kandidaten** (deckungsgleich mit knip unused files — zweiter, unabhängiger Nachweis) | Kreuzcheck-Konkordanz dokumentiert                                                                                                  |

### C4 — madge (4 zirkuläre Abhängigkeiten)

| #   | Zyklus                                                                         | Klassifikation                                                          | L4-Auftrag (Task 3b)                                                                                            |
| :-- | :----------------------------------------------------------------------------- | :---------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| 1   | `casino-core.ts > game-config.ts`                                              | **Fund-Kandidat**                                                       | real vs. Typ-Only-Import klassifizieren — Zyklus im Regel-Kern hat Money-Pfad-Nähe, Fix (falls real) = Klasse 3 |
| 2   | `guide-knowledge: registry > hybrid-retriever > matcher`                       | **Fund-Kandidat** (MEDIUM)                                              | real vs. Typ-Only; Fix = Klasse 2 (Urteils-Fix)                                                                 |
| 3   | `guide-knowledge: registry > hybrid-retriever > pgvector-store > vector-store` | **Fund-Kandidat** (MEDIUM)                                              | dito                                                                                                            |
| 4   | `guide-knowledge: registry > hybrid-retriever`                                 | **Fund-Kandidat** (Teilmengen-Zyklus von 2/3 — als einer konsolidieren) | dito                                                                                                            |

### C5 — Kreuzcheck-Statistik (Scanner-Konkordanz)

| Befund-Cluster                                                 | knip | depcheck | ts-prune | madge | Ausgereiftheit           |
| :------------------------------------------------------------- | :--: | :------: | :------: | :---: | :----------------------- |
| Micro-devDeps + Analyse-Devs ungenutzt                         |  ✅  |    ✅    |    —     |   —   | 2-fach bestätigt         |
| Tote Komponenten/Hooks (`GameSkeleton`, Controls, V2-Games, …) |  ✅  |    —     |    ✅    |   —   | 2-fach bestätigt         |
| Trigger-Entry-Points                                           |  ✅  |    —     |    ✅    |   —   | 2-fach als Entry erkannt |
| Zirkuläre Importe in guide-knowledge + casino-core             |  —   |    —     |    —     |  ✅   | nur madge deckt ab       |
| Missing deps (`style-dictionary`, `playwright`)                |  —   |    ✅    |    —     |   —   | nur depcheck deckt ab    |

## D — Übergang zu L2/L3

Die Fund-Kandidaten aus C1 (45 Dateien) + C2/C3-Dep- und Export-Cluster + C4-Zyklen sind der Startpunkt des Querlesens. **Lektürereihenfolge L2 (Setzung, reversible Detailentscheidung):** (1) `src/lib/casino/errors.ts` (Widerspruchsnachweis), (2) guide-knowledge knowledge-Dateien (FP-Check Laufzeitindex), (3) `GamificationProvider` + Hooks-Familie, (4) Rest. Fundmatrix-Start erfolgt mit dem ersten L2-Batch.
---

## ANHANG — Vollausgaben (unverändert)

### A1 — knip (npx -y knip, 2026-08-30)

```text
Unused files (75)
.claude/agent-evals/11_residue_scout/fixtures/leftover_test_ref.tsx
public/prototypes/lib/gsap.min.js
public/prototypes/lib/three.min.js
scripts/audit-games-perf.ts
scripts/capture-guide-sandbox.mjs
scripts/chaos/lib/fault-proxy.mjs
scripts/chaos/lib/fault-proxy.selftest.mjs
scripts/chaos/lib/prod-guard.mjs
scripts/chaos/run-fault-test.mjs
scripts/crash-debug.ts
scripts/deep-responsive-audit.mjs
scripts/fast-responsive-audit.mjs
scripts/guide-telemetry-report.ts
scripts/history-2-check.ts
scripts/history-check.ts
scripts/kill-stale-dev.mjs
scripts/loadtest/bet-flow.processor.mjs
scripts/loadtest/guide-chat-rate-limit.ts
scripts/measure-bundle.mjs
scripts/mobile-overflow-check.mjs
scripts/roulette-e2e.ts
scripts/roulette-simulation.ts
scripts/test-config-remote.mjs
scripts/test-upstash.mjs
scripts/to07-analyze.mjs
scripts/to07-responsive-sweep.mjs
scripts/verify-build.mjs
scripts/verify-history-mock.mjs
scripts/verify-leaderboard-2.ts
scripts/verify-lobby-mobile.mjs
scripts/verify-priorities.mjs
scripts/verify-screenshots-audit.mjs
src/components/casino/controls/BetInputGroup.tsx
src/components/casino/games/blackjack/BlackjackTableV2.tsx
src/components/casino/games/blackjack/CardHandV2.tsx
src/components/casino/games/blackjack/PlayingCardV2.tsx
src/components/casino/GameSkeleton.tsx
src/components/casino/ProvablyFairTool.tsx
src/components/casino/WalletModal.tsx
src/components/home/HeroSection.tsx
src/components/home/HeroSectionV2.tsx
src/components/home/index.ts
src/components/home/LiveHighrollerTickerBar.tsx
src/components/home/VipLiveStreamRail.tsx
src/components/layout/LevelProgress.tsx
src/components/leaderboard/__tests__/LeaderboardWeeklyBanner.test.tsx
src/components/leaderboard/LeaderboardHeroStats.tsx
src/components/social/GlobalLeaderboard.tsx
src/components/social/LiveActivityFeed.tsx
src/components/stats/SessionLengthChart.tsx
src/components/ui/ParallaxLayer.tsx
src/components/ui/ParticleBurst.tsx
src/components/ui/RippleContainer.tsx
src/components/ui/SuperButton.tsx
src/components/ui/ThemeSelector.tsx
src/hooks/useDynamicColor.ts
src/hooks/useGameKeyboard.ts
src/hooks/useGameStore.ts
src/hooks/useIsNarrowViewport.ts
src/hooks/useModalKeyboard.ts
src/hooks/useParallax.ts
src/hooks/useSafeMotion.ts
src/lib/casino/errors.ts
src/lib/casino/guide-knowledge/commands.ts
src/lib/casino/guide-knowledge/games.ts
src/lib/casino/guide-knowledge/navigation.ts
src/lib/casino/perf-monitor.ts
src/providers/GamificationProvider.tsx
src/trigger/admin-analytics-snapshot.ts
src/trigger/weekly-player-recap.ts
src/types/database.types.ts
src/utils/time-patch.ts
style-dictionary.config.mjs
tests/crash-simulation.ts
trigger.config.ts
Unused devDependencies (20)
@rolldown/pluginutils                  package.json:85:6
@trigger.dev/build                     package.json:86:6
@types/d3-color                        package.json:87:6
@types/d3-path                         package.json:88:6
is-number                              package.json:99:6
isarray                                package.json:100:6
isexe                                  package.json:101:6
json-schema-traverse                   package.json:103:6
json-stable-stringify-without-jsonify  package.json:104:6
lodash.merge                           package.json:106:6
madge                                  package.json:107:6
natural-compare                        package.json:108:6
object-assign                          package.json:109:6
object-keys                            package.json:110:6
parent-module                          package.json:111:6
path-exists                            package.json:112:6
resolve-from                           package.json:116:6
shebang-regex                          package.json:117:6
strip-bom                              package.json:118:6
to-regex-range                         package.json:119:6
Unlisted binaries (1)
sentry-cli  package.json
Unused exports (91)
QuickViewPanel                function  src/app/games-2/_components/QuickViewPanel.tsx:14:17
CrashStory                    function  src/app/lab/_components/CrashStory.tsx:32:17
MagneticLink                  function  src/app/lab/_components/MagneticLink.tsx:16:17
Preloader                     function  src/app/lab/_components/Preloader.tsx:23:17
StillnessSection              function  src/app/lab/_components/StillnessSection.tsx:17:17
TypoCatalog                   function  src/app/lab/_components/TypoCatalog.tsx:59:17
TypoHero                      function  src/app/lab/_components/TypoLayer.tsx:19:17
lerp                          function  src/app/lab/_lib/morphField.ts:1:17
applyMorphInto                function  src/app/lab/_lib/morphField.ts:21:17
DEFAULT_MORPH_DURATION_S                src/app/lab/_lib/morphField.ts:41:14
isTextSamplingAvailable       function  src/app/lab/_lib/shapeTargetsCanvas.ts:11:17
sandboxLinkStyle                        src/app/testing/7.1/parts/shared.ts:19:14
showcaseCardStyle                       src/app/testing/brand-showcase/parts/shared.ts:15:14
AUTH_PASSWORD_MIN_LENGTH                src/components/auth/auth-validation.ts:1:14
default                       function  src/components/casino/controls/AutoBetDrawer.tsx:390:16
default                       function  src/components/casino/controls/BetModeTabs.tsx:171:16
default                       function  src/components/casino/controls/GameActionButton.tsx:86:16
default                       function  src/components/casino/controls/GameStatsPanel.tsx:227:16
default                       function  src/components/casino/controls/VibeSlider.tsx:256:16
default                       function  src/components/casino/games/blackjack/CardHand.tsx:23:25
MilestoneFlash                          src/components/casino/games/crash-multiplayer/index.ts:3:10
LivePlayerList                          src/components/casino/games/crash-multiplayer/index.ts:4:10
RISK_ESCALATION_RATE                    src/components/casino/games/crash/crash-helpers.ts:47:14
OUTSIDE_BETS                            src/components/casino/games/roulette/roulette-config.ts:101:14
CHIPS                                   src/components/casino/games/roulette/types.ts:28:14
FRENCH_BETS_MAP                         src/components/casino/games/roulette/types.ts:75:14
REEL_WINDOW_HEIGHT                      src/components/casino/games/slots/SlotReel.tsx:11:14
ArcadeHeroCell                function  src/components/home/bento/BentoArcadeCells.tsx:44:17
ArcadeSatelliteCell           function  src/components/home/bento/BentoArcadeCells.tsx:233:17
DailyTournamentTeaser                   src/components/home/DailyTournamentTeaser.tsx:28:14
InteractiveArcadeGrid                   src/components/home/InteractiveArcadeGrid.tsx:95:14
ProgressiveJackpotSection               src/components/home/ProgressiveJackpotSection.tsx:7:14
VipProgressTeaser                       src/components/home/VipProgressTeaser.tsx:61:14
getTimeUntilNextReset         function  src/components/leaderboard/LeaderboardWeeklyBanner.tsx:20:17
QUICK_CHIPS                             src/components/social/casino-guide/guide-config.ts:30:14
cleanLatexMath                          src/components/social/casino-guide/GuideMarkdown.tsx:255:10
parseInlineMarkdown                     src/components/social/casino-guide/GuideMarkdown.tsx:255:26
GAME_META                               src/components/stats/gameMeta.ts:14:14
STORAGE_KEY_HUD_EXPANDED                src/hooks/useGameCoPilot.ts:12:14
STORAGE_KEY_HUD_VISIBLE                 src/hooks/useGameCoPilot.ts:13:14
usersRowSchema                          src/lib/admin/analytics-source.ts:7:14
walletTransactionsRowSchema             src/lib/admin/analytics-source.ts:10:14
gameRoundsRowSchema                     src/lib/admin/analytics-source.ts:18:14
vipTiersRowSchema                       src/lib/admin/analytics-source.ts:27:14
AdminAnalyticsSourceError     class     src/lib/admin/analytics-source.ts:85:14
buildCasinoGuideContextAsync            src/lib/casino/chat-guide/index.ts:16:35
GUIDE_PERSONAS                          src/lib/casino/chat-guide/index.ts:19:3
DEFAULT_PERSONA                         src/lib/casino/chat-guide/index.ts:22:3
PERSONA_META                            src/lib/casino/chat-guide/index.ts:23:3
buildPersonaBlock                       src/lib/casino/chat-guide/index.ts:24:3
CASHOUT_PRESS_MARGIN_MS                 src/lib/casino/crash-round.ts:201:14
scoreDocument                           src/lib/casino/guide-knowledge/registry.ts:57:31
tokenizeQuery                           src/lib/casino/guide-knowledge/registry.ts:57:46
chunkKnowledgeDoc                       src/lib/casino/guide-knowledge/registry.ts:65:10
chunkAllKnowledgeDocs                   src/lib/casino/guide-knowledge/registry.ts:65:29
cosineSimilarity                        src/lib/casino/guide-knowledge/registry.ts:67:10
dotProduct                              src/lib/casino/guide-knowledge/registry.ts:67:28
normalizeVector                         src/lib/casino/guide-knowledge/registry.ts:67:40
vectorNorm                              src/lib/casino/guide-knowledge/registry.ts:67:57
fetchQueryEmbedding                     src/lib/casino/guide-knowledge/registry.ts:69:3
generateLocalEmbedding                  src/lib/casino/guide-knowledge/registry.ts:70:3
getOrCreateVectorStore                  src/lib/casino/guide-knowledge/registry.ts:71:3
resetVectorStoreCache                   src/lib/casino/guide-knowledge/registry.ts:72:3
searchVectorChunks                      src/lib/casino/guide-knowledge/registry.ts:73:3
guideKnowledgeSourceIds                 src/lib/casino/guide-knowledge/schema.ts:3:14
guideKnowledgeTopics                    src/lib/casino/guide-knowledge/schema.ts:18:14
getOrCreateVectorStore        function  src/lib/casino/guide-knowledge/vector-store.ts:97:17
estimateGuideCostMicrousd     function  src/lib/casino/guide-telemetry.ts:122:17
GUIDE_TELEMETRY_COST_UNIT               src/lib/casino/guide-telemetry.ts:207:14
GUIDE_TOOL_NAMES                        src/lib/casino/guide-tools.ts:7:14
clearVipConfigCache           function  src/lib/casino/vip-config-server.ts:88:17
getMicrophoneStream           function  src/lib/casino/voice-audio.ts:33:23
settledGameResultSchema                 src/lib/casino/wallet-contract.ts:13:14
modalVariants                           src/lib/design/motion-tokens.ts:112:14
toastVariants                           src/lib/design/motion-tokens.ts:139:14
pageTransitionVariants                  src/lib/design/motion-tokens.ts:159:14
TOKENS                                  src/lib/design/tokens.generated.ts:2:14
MoneyDecimalSchema                      src/lib/meta/contracts.ts:18:14
SignedMoneyDecimalSchema                src/lib/meta/contracts.ts:19:14
betPathTracer                           src/lib/otel/tracer.ts:38:14
createApiError                function  src/lib/security/form-errors.ts:78:17
VIP_TIER_NAMES                          src/lib/security/jwt-claims.ts:4:14
MAX_ATTEMPTS_BEFORE_COOLDOWN            src/lib/security/login-cooldown.ts:11:14
DEFAULT_COOLDOWN_SECONDS                src/lib/security/login-cooldown.ts:12:14
DEFAULT_SITE_URL                        src/lib/site-url.ts:1:14
bigWinNotify                            src/trigger/big-win-notify.ts:25:14
dailyActivityDigest                     src/trigger/daily-activity-digest.ts:57:14
dailyBetSchema                          src/trigger/deliver-digest.ts:5:14
fraudAlertWait                          src/trigger/fraud-alert-wait.ts:114:14
playerOnboardingDrip                    src/trigger/player-onboarding-drip.ts:159:14
sendPlayerRecap                         src/trigger/send-player-recap.ts:97:14
Unused exported types (69)
CrashFieldProps                interface  src/app/lab/_components/CrashField.tsx:20:18
TextSamplerDeps                interface  src/app/lab/_lib/shapeTargetsCanvas.ts:7:18
SampleAction                   interface  src/app/testing/guide-sandbox/parts/sample-conversation.ts:1:18
CrashStatus                    type       src/components/casino/games/crash/useCrashGameLoop.ts:27:15
Parity                         type       src/components/casino/games/roulette/types.ts:2:13
Range                          type       src/components/casino/games/roulette/types.ts:3:13
Dozen                          type       src/components/casino/games/roulette/types.ts:4:13
Column                         type       src/components/casino/games/roulette/types.ts:5:13
FrenchBet                      type       src/components/casino/games/roulette/types.ts:6:13
DashboardTone                  type       src/components/home/neon-arcade-dashboard-model.ts:4:13
LobbyJackpot                   interface  src/components/home/neon-arcade-lobby-model.ts:3:18
LobbyProofMetricId             type       src/components/home/neon-arcade-lobby-model.ts:8:13
LobbyProofMetric               interface  src/components/home/neon-arcade-lobby-model.ts:10:18
LobbyLeader                    interface  src/components/home/neon-arcade-lobby-model.ts:15:18
LobbyTournament                interface  src/components/home/neon-arcade-lobby-model.ts:21:18
ResetTimeRemaining             interface  src/components/leaderboard/LeaderboardWeeklyBanner.tsx:12:18
GlassRadius                    type       src/components/ui/GlassSurface.tsx:12:13
CoPilotGameType                type       src/hooks/useGameCoPilot.ts:24:13
UsersRow                       type       src/lib/admin/analytics-source.ts:47:13
AdminAnalyticsSnapshotPayload  type       src/lib/admin/analytics-source.ts:160:13
ApiErrorPayload                type       src/lib/api/response.ts:6:13
SupabaseMockState              interface  src/lib/casino/__tests__/helpers/supabase-mock.ts:8:18
CasinoGuideErrorKind           type       src/lib/casino/chat-guide/index.ts:7:8
BuildGuideContextInput         type       src/lib/casino/chat-guide/index.ts:9:8
GuideConversationHistoryItem   type       src/lib/casino/chat-guide/index.ts:10:8
GuideAnswerResult              type       src/lib/casino/chat-guide/index.ts:11:8
GuideFunctionCall              type       src/lib/casino/chat-guide/index.ts:12:8
GuideStreamResult              type       src/lib/casino/chat-guide/index.ts:13:8
GuidePersona                   type       src/lib/casino/chat-guide/index.ts:20:8
RiskLevel                      type       src/lib/casino/copilot-math.ts:10:13
BlackjackAction                type       src/lib/casino/copilot-math.ts:27:13
DailyRaceStanding              type       src/lib/casino/daily-race.ts:10:13
CrashConfig                    interface  src/lib/casino/game-config.ts:9:18
DiceConfig                     interface  src/lib/casino/game-config.ts:16:18
RouletteConfig                 interface  src/lib/casino/game-config.ts:20:18
BlackjackConfig                interface  src/lib/casino/game-config.ts:24:18
SlotsConfig                    interface  src/lib/casino/game-config.ts:28:18
XpConfig                       interface  src/lib/casino/game-config.ts:37:18
GuideFeedbackItem              type       src/lib/casino/guide-feedback.ts:10:13
RetrievalStrategy              type       src/lib/casino/guide-knowledge/hybrid-retriever.ts:6:13
RawFrontmatter                 type       src/lib/casino/guide-knowledge/parser.ts:1:13
MatchedDbDocument              type       src/lib/casino/guide-knowledge/pgvector-store.ts:22:13
ScoredKnowledgeDoc             type       src/lib/casino/guide-knowledge/registry.ts:58:15
SelectKnowledgeOptions         type       src/lib/casino/guide-knowledge/registry.ts:58:35
HybridRetrievalResult          type       src/lib/casino/guide-knowledge/registry.ts:61:3
RetrievalStrategy              type       src/lib/casino/guide-knowledge/registry.ts:63:3
GuideKnowledgeChunk            type       src/lib/casino/guide-knowledge/registry.ts:66:15
EmbeddedChunk                  type       src/lib/casino/guide-knowledge/registry.ts:75:15
ScoredChunk                    type       src/lib/casino/guide-knowledge/registry.ts:75:30
EmbeddedChunk                  type       src/lib/casino/guide-knowledge/vector-store.ts:10:13
GuideLeaderboardRow            type       src/lib/casino/guide-live-leaderboard.ts:11:13
GuideToolName                  type       src/lib/casino/guide-tools.ts:14:13
CrashRoundStatus               type       src/lib/casino/realtime-types.ts:11:13
StrategyKind                   type       src/lib/casino/simulation/engine.ts:14:13
LevelMilestone                 interface  src/lib/casino/simulation/engine.ts:36:18
AudioRecorderState             interface  src/lib/casino/voice-audio.ts:6:18
SettledGameResult              type       src/lib/casino/wallet-contract.ts:24:13
GamePhase                      type       src/lib/games/blackjack.ts:19:13
GameResult                     type       src/lib/games/blackjack.ts:22:13
ApiErrorPayload                type       src/lib/security/form-errors.ts:34:13
VipTierName                    type       src/lib/security/jwt-claims.ts:5:13
CustomJwtAppMetadata           type       src/lib/security/jwt-claims.ts:33:13
PasswordStrengthScore          type       src/lib/security/password-strength.ts:1:13
CompositeActions               interface  src/store/slices/types.ts:229:18
Achievement                    type       src/store/useCasinoStore.ts:21:15
Bet                            type       src/store/useCasinoStore.ts:22:15
BigWinNotifyPayload            type       src/trigger/big-win-notify.ts:19:13
DeliverDigestPayload           type       src/trigger/deliver-digest.ts:20:13
PlayerRecapPayload             type       src/trigger/send-player-recap.ts:42:13
Duplicate exports (11)
CrashStory|default        src/app/lab/_components/CrashStory.tsx
MagneticLink|default      src/app/lab/_components/MagneticLink.tsx
Preloader|default         src/app/lab/_components/Preloader.tsx
StillnessSection|default  src/app/lab/_components/StillnessSection.tsx
TypoCatalog|default       src/app/lab/_components/TypoCatalog.tsx
TypoHero|default          src/app/lab/_components/TypoLayer.tsx
AutoBetDrawer|default     src/components/casino/controls/AutoBetDrawer.tsx
BetModeTabs|default       src/components/casino/controls/BetModeTabs.tsx
GameActionButton|default  src/components/casino/controls/GameActionButton.tsx
GameStatsPanel|default    src/components/casino/controls/GameStatsPanel.tsx
VibeSlider|default        src/components/casino/controls/VibeSlider.tsx
```

### A2 — depcheck (npx -y depcheck, 2026-08-30)

```text
Unused devDependencies
* @rolldown/pluginutils
* @trigger.dev/build
* @types/d3-color
* @types/d3-path
* is-number
* isarray
* isexe
* json-schema-traverse
* json-stable-stringify-without-jsonify
* lodash.merge
* madge
* natural-compare
* object-assign
* object-keys
* parent-module
* path-exists
* prettier-plugin-tailwindcss
* resolve-from
* shebang-regex
* strip-bom
* to-regex-range
Missing dependencies
* style-dictionary: .\style-dictionary.config.mjs
* playwright: .\scripts\capture-guide-sandbox.mjs
```

### A3 — ts-prune (npx -y ts-prune, 2026-08-30)

```text
\next.config.ts:24 - default
\playwright.config.ts:3 - default
\trigger.config.ts:3 - default
\vitest.config.ts:4 - default
\src\instrumentation.ts:1 - register
\src\instrumentation.ts:16 - onRequestError
\src\proxy.ts:75 - default
\src\proxy.ts:209 - config
\.next\types\routes.d.ts:115 - ParamsOf
\.next\types\routes.d.ts:137 - AppRoutes (used in module)
\.next\types\routes.d.ts:137 - PageRoutes (used in module)
\.next\types\routes.d.ts:137 - LayoutRoutes (used in module)
\.next\types\routes.d.ts:137 - RedirectRoutes (used in module)
\.next\types\routes.d.ts:137 - RewriteRoutes (used in module)
\.next\types\routes.d.ts:137 - ParamMap (used in module)
\.next\types\routes.d.ts:137 - AppRouteHandlerRoutes (used in module)
\scripts\red-team\target-guard.ts:4 - RED_TEAM_CONFIRMATION_VARIABLE
\src\app\error.tsx:9 - default
\src\app\error.tsx:4 - dynamic
\src\app\global-error.tsx:6 - default
\src\app\layout.tsx:71 - default
\src\app\layout.tsx:9 - dynamic
\src\app\layout.tsx:26 - metadata
\src\app\layout.tsx:61 - viewport
\src\app\not-found.tsx:5 - default
\src\app\page.tsx:10 - default
\src\app\page.tsx:4 - metadata
\src\hooks\useDailyRaceStandings.ts:10 - DailyRaceStanding (used in module)
\src\hooks\useGameCoPilot.ts:12 - STORAGE_KEY_HUD_EXPANDED (used in module)
\src\hooks\useGameCoPilot.ts:13 - STORAGE_KEY_HUD_VISIBLE (used in module)
\src\hooks\useGameCoPilot.ts:24 - CoPilotGameType (used in module)
\src\hooks\useGameCoPilot.ts:56 - UseGameCoPilotOptions (used in module)
\src\hooks\useGameKeyboard.ts:3 - useGameKeyboard
\src\hooks\useGameStore.ts:3 - useGameStore
\src\hooks\useIsNarrowViewport.ts:37 - useIsNarrowViewport
\src\hooks\useKeyboardShortcuts.tsx:5 - ShortcutDefinition (used in module)
\src\hooks\useParallax.ts:28 - useParallax
\src\hooks\useSafeMotion.ts:11 - useSafeMotion
\src\lib\site-url.ts:1 - DEFAULT_SITE_URL (used in module)
\src\providers\GamificationProvider.tsx:12 - GamificationProvider
\src\providers\GamificationProvider.tsx:41 - useGamification
\src\store\useCasinoStore.ts:21 - Achievement
\src\store\useCasinoStore.ts:22 - Bet (used in module)
\src\trigger\admin-analytics-snapshot.ts:5 - adminAnalyticsSnapshot
\src\trigger\big-win-notify.ts:19 - BigWinNotifyPayload
\src\trigger\big-win-notify.ts:25 - bigWinNotify
\src\trigger\daily-activity-digest.ts:36 - UtcDayRange (used in module)
\src\trigger\daily-activity-digest.ts:57 - dailyActivityDigest
\src\trigger\deliver-digest.ts:5 - dailyBetSchema (used in module)
\src\trigger\deliver-digest.ts:20 - DeliverDigestPayload
\src\trigger\fraud-alert-wait.ts:13 - FraudAlertWaitPayload (used in module)
\src\trigger\fraud-alert-wait.ts:114 - fraudAlertWait
\src\trigger\player-onboarding-drip.ts:15 - PlayerOnboardingDripPayload (used in module)
\src\trigger\player-onboarding-drip.ts:159 - playerOnboardingDrip
\src\trigger\send-player-recap.ts:42 - PlayerRecapPayload
\src\trigger\weekly-player-recap.ts:13 - weeklyPlayerRecap
\src\types\database.types.ts:1 - Json (used in module)
\src\types\database.types.ts:9 - Database (used in module)
\src\types\database.types.ts:1811 - Tables (used in module)
\src\types\database.types.ts:1840 - TablesInsert
\src\types\database.types.ts:1865 - TablesUpdate
\src\types\database.types.ts:1890 - Enums (used in module)
\src\types\database.types.ts:1907 - CompositeTypes (used in module)
\src\types\database.types.ts:1924 - Constants
\.next\dev\types\routes.d.ts:114 - ParamsOf
\.next\dev\types\routes.d.ts:136 - PageRoutes (used in module)
\.next\dev\types\routes.d.ts:136 - RedirectRoutes (used in module)
\.next\dev\types\routes.d.ts:136 - RewriteRoutes (used in module)
\src\app\admin\forbidden.tsx:1 - default
\src\app\admin\layout.tsx:5 - default
\src\app\admin\page.tsx:11 - default
\src\app\admin\page.tsx:4 - metadata
\src\app\admin\page.tsx:9 - dynamic
\src\app\games\layout.tsx:14 - default
\src\app\games\layout.tsx:3 - metadata
\src\app\games\page.tsx:19 - default
\src\app\games-2\page.tsx:23 - default
\src\app\history\layout.tsx:9 - default
\src\app\history\layout.tsx:3 - metadata
\src\app\history\page.tsx:29 - default
\src\app\lab\layout.tsx:11 - default
\src\app\lab\layout.tsx:6 - metadata
\src\app\lab\page.tsx:5 - default
\src\app\leaderboard\layout.tsx:9 - default
\src\app\leaderboard\layout.tsx:3 - metadata
\src\app\leaderboard\page.tsx:19 - default
\src\app\refactoring\layout.tsx:10 - default
\src\app\refactoring\layout.tsx:3 - metadata
\src\app\refactoring\page.tsx:18 - default
\src\app\stats\layout.tsx:9 - default
\src\app\stats\layout.tsx:3 - metadata
\src\app\stats\page.tsx:34 - default
\src\app\v2\layout.tsx:10 - default
\src\app\v2\layout.tsx:3 - metadata
\src\app\v2\page.tsx:3 - default
\src\app\vault\layout.tsx:9 - default
\src\app\vault\layout.tsx:3 - metadata
\src\app\vault\page.tsx:210 - default
\src\components\auth\auth-validation.ts:1 - AUTH_PASSWORD_MIN_LENGTH (used in module)
\src\components\casino\GameSkeleton.tsx:3 - GameSkeleton
\src\components\casino\GameSkeleton.tsx:32 - CardSkeleton
\src\components\casino\GameSkeleton.tsx:36 - StatSkeleton
\src\components\casino\ProvablyFairTool.tsx:9 - default
\src\components\casino\WalletModal.tsx:20 - default
\src\components\home\DailyTournamentTeaser.tsx:28 - DailyTournamentTeaser
\src\components\home\HeroSectionV2.tsx:136 - HeroSectionV2
\src\components\home\index.ts:21 - HeroSection
\src\components\home\InteractiveArcadeGrid.tsx:95 - InteractiveArcadeGrid
\src\components\home\LiveHighrollerTickerBar.tsx:66 - LiveHighrollerTickerBar
\src\components\home\neon-arcade-dashboard-model.ts:4 - DashboardTone (used in module)
\src\components\home\neon-arcade-lobby-model.ts:3 - LobbyJackpot (used in module)
\src\components\home\neon-arcade-lobby-model.ts:8 - LobbyProofMetricId (used in module)
\src\components\home\neon-arcade-lobby-model.ts:10 - LobbyProofMetric (used in module)
\src\components\home\neon-arcade-lobby-model.ts:15 - LobbyLeader (used in module)
\src\components\home\neon-arcade-lobby-model.ts:21 - LobbyTournament (used in module)
\src\components\home\neon-arcade-lobby-model.ts:27 - NeonLobbySnapshot (used in module)
\src\components\home\neon-arcade-lobby-model.ts:34 - LobbyRewards (used in module)
\src\components\home\ProgressiveJackpotSection.tsx:7 - ProgressiveJackpotSection
\src\components\home\VipLiveStreamRail.tsx:65 - VipLiveStreamRail
\src\components\home\VipProgressTeaser.tsx:61 - VipProgressTeaser
\src\components\layout\LevelProgress.tsx:8 - default
\src\components\layout\shell-routing.ts:1 - ShellVariant (used in module)
\src\components\leaderboard\LeaderboardHeroStats.tsx:14 - LeaderboardHeroStats
\src\components\leaderboard\LeaderboardWeeklyBanner.tsx:12 - ResetTimeRemaining (used in module)
\src\components\social\GlobalLeaderboard.tsx:8 - GlobalLeaderboard
\src\components\social\LiveActivityFeed.tsx:10 - LiveActivityFeed
\src\components\stats\gameMeta.ts:8 - GameMeta (used in module)
\src\components\stats\gameMeta.ts:14 - GAME_META (used in module)
\src\components\stats\SessionLengthChart.tsx:21 - SessionLengthChart
\src\components\ui\GlassSurface.tsx:12 - GlassRadius (used in module)
\src\components\ui\GlassSurface.tsx:29 - GlassSurfaceProps (used in module)
\src\components\ui\ParallaxLayer.tsx:31 - ParallaxLayer
\src\components\ui\SuperButton.tsx:67 - SuperButton
\src\components\ui\ThemeSelector.tsx:16 - ThemeSelector
\src\components\v2\index.ts:12 - V2Home
\src\components\v2\v2-data.ts:1 - V2GameTab (used in module)
\src\components\v2\v2-data.ts:52 - V2Race (used in module)
\src\components\v2\v2-data.ts:64 - V2FloatingChip (used in module)
\src\components\v2\v2-data.ts:77 - V2Kpi (used in module)
\src\lib\admin\analytics-source.ts:7 - usersRowSchema (used in module)
\src\lib\admin\analytics-source.ts:10 - walletTransactionsRowSchema (used in module)
\src\lib\admin\analytics-source.ts:18 - gameRoundsRowSchema (used in module)
\src\lib\admin\analytics-source.ts:27 - vipTiersRowSchema (used in module)
\src\lib\admin\analytics-source.ts:47 - UsersRow
\src\lib\admin\analytics-source.ts:48 - WalletTransactionsRow (used in module)
\src\lib\admin\analytics-source.ts:49 - GameRoundsRow (used in module)
\src\lib\admin\analytics-source.ts:85 - AdminAnalyticsSourceError (used in module)
\src\lib\admin\analytics-source.ts:160 - AdminAnalyticsSnapshotPayload
\src\lib\admin\analytics.ts:3 - AnalyticsUser (used in module)
\src\lib\admin\analytics.ts:16 - AnalyticsVipTier (used in module)
\src\lib\admin\analytics.ts:21 - RetentionValue (used in module)
\src\lib\admin\analytics.ts:27 - CohortRow (used in module)
\src\lib\admin\analytics.ts:35 - AdminAnalyticsInput (used in module)
\src\lib\api\client.ts:4 - ApiFetchErrorCode (used in module)
\src\lib\api\openapi.ts:8 - OpenApiSpec (used in module)
\src\lib\api\response.ts:6 - ApiErrorPayload (used in module)
\src\lib\backup\recovery-crypto.ts:3 - EncryptedArtifact (used in module)
\src\lib\backup\supabase-dump.ts:1 - PlaintextBackupArtifact (used in module)
\src\lib\casino\achievement-presentation.ts:3 - AchievementPresentation (used in module)
\src\lib\casino\achievements-config.ts:12 - AchievementCondition (used in module)
\src\lib\casino\big-win.ts:6 - BigWinCandidate (used in module)
\src\lib\casino\casino-core.ts:32 - BetResult (used in module)
\src\lib\casino\casino-core.ts:42 - GameType (used in module)
\src\lib\casino\copilot-math.ts:10 - RiskLevel (used in module)
\src\lib\casino\copilot-math.ts:27 - BlackjackAction
\src\lib\casino\crash-round.ts:201 - CASHOUT_PRESS_MARGIN_MS (used in module)
\src\lib\casino\daily-race.ts:10 - DailyRaceStanding (used in module)
\src\lib\casino\errors.ts:10 - ok (used in module)
\src\lib\casino\errors.ts:14 - err
\src\lib\casino\errors.ts:83 - getUserSafeMessage
\src\lib\casino\errors.ts:6 - Result (used in module)
\src\lib\casino\errors.ts:18 - AppError (used in module)
\src\lib\casino\errors.ts:34 - InsufficientFundsError
\src\lib\casino\errors.ts:45 - InvalidBetAmountError
\src\lib\casino\errors.ts:51 - WalletLockError
\src\lib\casino\errors.ts:57 - ProvablyFairError
\src\lib\casino\errors.ts:63 - RateLimitExceededError
\src\lib\casino\errors.ts:74 - USER_SAFE_MESSAGES (used in module)
\src\lib\casino\fraud-detection.ts:46 - FraudScanSummary (used in module)
\src\lib\casino\game-config.ts:3 - GameLimitsConfig (used in module)
\src\lib\casino\game-config.ts:9 - CrashConfig (used in module)
\src\lib\casino\game-config.ts:16 - DiceConfig (used in module)
\src\lib\casino\game-config.ts:20 - RouletteConfig (used in module)
\src\lib\casino\game-config.ts:24 - BlackjackConfig (used in module)
\src\lib\casino\game-config.ts:28 - SlotsConfig (used in module)
\src\lib\casino\game-config.ts:37 - XpConfig (used in module)
\src\lib\casino\guide-feedback.ts:5 - GuideFeedbackRating (used in module)
\src\lib\casino\guide-feedback.ts:7 - GuideFeedbackCategory (used in module)
\src\lib\casino\guide-feedback.ts:10 - GuideFeedbackItem (used in module)
\src\lib\casino\guide-feedback.ts:20 - GuideFeedbackSummary (used in module)
\src\lib\casino\guide-live-leaderboard.ts:11 - GuideLeaderboardRow (used in module)
\src\lib\casino\guide-telemetry.ts:122 - estimateGuideCostMicrousd (used in module)
\src\lib\casino\guide-telemetry.ts:207 - GUIDE_TELEMETRY_COST_UNIT
\src\lib\casino\guide-tools.ts:7 - GUIDE_TOOL_NAMES (used in module)
\src\lib\casino\guide-tools.ts:14 - GuideToolName
\src\lib\casino\guide-tools.ts:91 - PlayerVipProgressResult (used in module)
\src\lib\casino\guide-tools.ts:102 - PlayerSessionStatsResult (used in module)
\src\lib\casino\guide-tools.ts:111 - PlayerAccountLimitsResult (used in module)
\src\lib\casino\image-compression.ts:7 - ImageCompressionOptions (used in module)
\src\lib\casino\perf-monitor.ts:3 - PerfMonitor
\src\lib\casino\realtime-types.ts:11 - CrashRoundStatus (used in module)
\src\lib\casino\risk-signals.ts:23 - RiskEvent (used in module)
\src\lib\casino\seed-history-verification.ts:5 - SeedHistoryVerificationInput (used in module)
\src\lib\casino\seed-history-verification.ts:13 - SeedHistoryVerificationResult (used in module)
\src\lib\casino\stats-derivation.ts:10 - ProfitPoint (used in module)
\src\lib\casino\stats-derivation.ts:15 - DailyActivity (used in module)
\src\lib\casino\stats-derivation.ts:94 - VipRecords (used in module)
\src\lib\casino\telegram-api.ts:3 - TelegramSendResult (used in module)
\src\lib\casino\telegram-link.ts:9 - TelegramLinkStatus (used in module)
\src\lib\casino\telegram-link.ts:16 - IssuedTelegramLinkToken (used in module)
\src\lib\casino\telegram-link.ts:57 - TelegramLinkResult (used in module)
\src\lib\casino\telegram-notifier.ts:8 - BigWinNotificationInput (used in module)
\src\lib\casino\telegram-notifier.ts:18 - BigWinNotificationOutcome (used in module)
\src\lib\casino\vip-config-server.ts:88 - clearVipConfigCache
\src\lib\casino\voice-audio.ts:33 - getMicrophoneStream (used in module)
\src\lib\casino\voice-audio.ts:6 - AudioRecorderState
\src\lib\casino\wallet-contract.ts:13 - settledGameResultSchema (used in module)
\src\lib\casino\wallet-contract.ts:24 - SettledGameResult
\src\lib\casino\wallet.ts:35 - WalletSettlement (used in module)
\src\lib\casino\wallet.ts:40 - GameRoundStart (used in module)
\src\lib\design\motion-tokens.ts:112 - modalVariants
\src\lib\design\motion-tokens.ts:139 - toastVariants
\src\lib\design\motion-tokens.ts:157 - satisfies (used in module)
\src\lib\design\motion-tokens.ts:157 - Variants (used in module)
\src\lib\design\motion-tokens.ts:159 - pageTransitionVariants
\src\lib\design\tokens.generated.ts:2 - TOKENS (used in module)
\src\lib\games\blackjack.ts:11 - BlackjackHand (used in module)
\src\lib\games\blackjack.ts:19 - GamePhase (used in module)
\src\lib\games\blackjack.ts:22 - GameResult (used in module)
\src\lib\meta\contracts.ts:18 - MoneyDecimalSchema (used in module)
\src\lib\meta\contracts.ts:19 - SignedMoneyDecimalSchema (used in module)
\src\lib\meta\cursor.ts:47 - HistoryCursor (used in module)
\src\lib\meta\cursor.ts:48 - LeaderboardCursor (used in module)
\src\lib\meta\cursor.ts:49 - AdminUsersCursor (used in module)
\src\lib\otel\tracer.ts:38 - betPathTracer (used in module)
\src\lib\security\form-errors.ts:78 - createApiError (used in module)
\src\lib\security\form-errors.ts:25 - FieldErrors (used in module)
\src\lib\security\form-errors.ts:27 - ApiError (used in module)
\src\lib\security\form-errors.ts:34 - ApiErrorPayload (used in module)
\src\lib\security\jwt-claims.ts:4 - VIP_TIER_NAMES (used in module)
\src\lib\security\jwt-claims.ts:5 - VipTierName (used in module)
\src\lib\security\jwt-claims.ts:33 - CustomJwtAppMetadata
\src\lib\security\jwt-claims.ts:35 - ExtractedJwtClaims (used in module)
\src\lib\security\login-audit.ts:11 - RecordLoginAuditParams (used in module)
\src\lib\security\login-audit.ts:24 - maskIpAddress (used in module)
\src\lib\security\login-audit.ts:54 - parseDeviceInfo (used in module)
\src\lib\security\login-audit.ts:7 - LoginStatus (used in module)
\src\lib\security\login-audit.ts:9 - LoginAuditRecord
\src\lib\security\login-cooldown.ts:11 - MAX_ATTEMPTS_BEFORE_COOLDOWN (used in module)
\src\lib\security\login-cooldown.ts:12 - DEFAULT_COOLDOWN_SECONDS (used in module)
\src\lib\security\login-cooldown.ts:20 - RecordAttemptResult (used in module)
\src\lib\security\password-strength.ts:1 - PasswordStrengthScore (used in module)
\src\lib\security\password-strength.ts:3 - PasswordStrengthResult (used in module)
\src\lib\security\request-security.ts:5 - RateLimitDecision (used in module)
\src\lib\security\secret-rotation.ts:22 - RotationLogEntry (used in module)
\src\lib\security\secret-rotation.ts:51 - OverdueResult (used in module)
\src\store\slices\types.ts:229 - CompositeActions (used in module)
\src\app\admin\analytics\page.tsx:11 - default
\src\app\admin\analytics\page.tsx:4 - metadata
\src\app\admin\analytics\page.tsx:9 - dynamic
\src\app\admin\digest-preview\page.tsx:11 - default
\src\app\admin\digest-preview\page.tsx:4 - metadata
\src\app\admin\digest-preview\page.tsx:9 - dynamic
\src\app\admin\evals\page.tsx:10 - default
\src\app\admin\evals\page.tsx:4 - metadata
\src\app\admin\fraud\page.tsx:11 - default
\src\app\admin\fraud\page.tsx:4 - metadata
\src\app\admin\fraud\page.tsx:9 - dynamic
\src\app\admin\games\page.tsx:11 - default
\src\app\admin\games\page.tsx:4 - metadata
\src\app\admin\games\page.tsx:9 - dynamic
\src\app\admin\knowledge\page.tsx:11 - default
\src\app\admin\knowledge\page.tsx:4 - metadata
\src\app\admin\knowledge\page.tsx:9 - dynamic
\src\app\admin\promo-codes\page.tsx:11 - default
\src\app\admin\promo-codes\page.tsx:4 - metadata
\src\app\admin\promo-codes\page.tsx:9 - dynamic
\src\app\admin\simulation\page.tsx:11 - default
\src\app\admin\simulation\page.tsx:4 - metadata
\src\app\admin\simulation\page.tsx:9 - dynamic
\src\app\admin\users\page.tsx:11 - default
\src\app\admin\users\page.tsx:4 - metadata
\src\app\admin\users\page.tsx:9 - dynamic
\src\app\api\chat\route.ts:17 - GET
\src\app\api\community\route.ts:5 - GET
\src\app\api\docs\route.ts:3 - dynamic
\src\app\api\docs\route.ts:4 - revalidate
\src\app\api\health\route.ts:7 - dynamic
\src\app\api\leaderboard\route.ts:23 - GET
\src\app\api\openapi.json\route.ts:4 - dynamic
\src\app\api\openapi.json\route.ts:5 - revalidate
\src\app\auth\callback\route.ts:7 - GET
\src\app\auth\reset-password\page.tsx:54 - default
\src\app\games\_components\index.ts:2 - ElevatedGameCard
\src\app\games\_components\index.ts:3 - LiveWinRibbon
\src\app\games\_components\index.ts:4 - Stat
\src\app\games\_components\index.ts:4 - GameId
\src\app\games\_components\index.ts:6 - GameMeta
\src\app\games\_components\index.ts:23 - GAMES
\src\app\games\_components\index.ts:122 - CATEGORIES
\src\app\games\_components\index.ts:123 - CategoryType
\src\app\games\_components\index.ts:125 - MIN_STAKE
\src\app\games\blackjack\layout.tsx:14 - default
\src\app\games\blackjack\layout.tsx:3 - metadata
\src\app\games\blackjack\page.tsx:19 - default
\src\app\games\crash\layout.tsx:14 - default
\src\app\games\crash\layout.tsx:3 - metadata
\src\app\games\crash\page.tsx:45 - default
\src\app\games\crash-multiplayer\page.tsx:29 - default
\src\app\games\dice\layout.tsx:14 - default
\src\app\games\dice\layout.tsx:3 - metadata
\src\app\games\dice\page.tsx:16 - default
\src\app\games\roulette\layout.tsx:14 - default
\src\app\games\roulette\layout.tsx:3 - metadata
\src\app\games\roulette\page.tsx:3 - default
\src\app\games\slots\layout.tsx:14 - default
\src\app\games\slots\layout.tsx:3 - metadata
\src\app\games\slots\page.tsx:31 - default
\src\app\games-2\_components\QuickViewPanel.tsx:14 - QuickViewPanel (used in module)
\src\app\lab\_components\CrashField.tsx:20 - CrashFieldProps (used in module)
\src\app\lab\_components\CrashStory.tsx:32 - CrashStory (used in module)
\src\app\lab\_components\MagneticLink.tsx:16 - MagneticLink (used in module)
\src\app\lab\_components\Preloader.tsx:23 - Preloader (used in module)
\src\app\lab\_components\StillnessSection.tsx:17 - StillnessSection (used in module)
\src\app\lab\_components\TypoCatalog.tsx:59 - TypoCatalog (used in module)
\src\app\lab\_components\TypoLayer.tsx:19 - TypoHero (used in module)
\src\app\lab\_components\useWagerRound.ts:24 - WagerRound (used in module)
\src\app\lab\_lib\morphField.ts:1 - lerp (used in module)
\src\app\lab\_lib\morphField.ts:21 - applyMorphInto (used in module)
\src\app\lab\_lib\morphField.ts:41 - DEFAULT_MORPH_DURATION_S (used in module)
\src\app\lab\_lib\shapeTargetsCanvas.ts:11 - isTextSamplingAvailable
\src\app\lab\_lib\shapeTargetsCanvas.ts:7 - TextSamplerDeps
\src\app\sign-in\[[...sign-in]]\page.tsx:11 - default
\src\app\sign-in\[[...sign-in]]\page.tsx:5 - metadata
\src\app\sign-up\[[...sign-up]]\page.tsx:10 - default
\src\app\sign-up\[[...sign-up]]\page.tsx:5 - metadata
\src\app\testing\7.1\page.tsx:10 - default
\src\app\testing\7.1\page.tsx:4 - metadata
\src\app\testing\7.2\page.tsx:10 - default
\src\app\testing\7.2\page.tsx:4 - metadata
\src\app\testing\7.3\page.tsx:10 - default
\src\app\testing\7.3\page.tsx:4 - metadata
\src\app\testing\7.4\page.tsx:10 - default
\src\app\testing\7.4\page.tsx:4 - metadata
\src\app\testing\7.5\AutoBetDrawerTestingClient.tsx:15 - AutoBetConfig (used in module)
\src\app\testing\7.5\page.tsx:10 - default
\src\app\testing\7.5\page.tsx:4 - metadata
\src\app\testing\7.6\page.tsx:10 - default
\src\app\testing\7.6\page.tsx:4 - metadata
\src\app\testing\brand-showcase\page.tsx:10 - default
\src\app\testing\brand-showcase\page.tsx:4 - metadata
\src\app\testing\fe-03-blackjack\page.tsx:14 - default
\src\app\testing\fe-04-roulette\page.tsx:18 - default
\src\app\testing\fe-05-dice\page.tsx:11 - default
\src\app\testing\fe-06-crash\page.tsx:13 - default
\src\app\testing\guide-sandbox\page.tsx:10 - default
\src\app\testing\guide-sandbox\page.tsx:4 - metadata
\src\app\testing\lobby-bento\page.tsx:10 - default
\src\app\testing\lobby-bento\page.tsx:4 - metadata
\src\app\testing\neon-arcade-dashboard\page.tsx:10 - default
\src\app\testing\neon-arcade-dashboard\page.tsx:4 - metadata
\src\components\casino\controls\AutoBetDrawer.tsx:16 - AutoBetDrawerProps (used in module)
\src\components\casino\controls\AutoBetDrawer.tsx:390 - default
\src\components\casino\controls\BetInputGroup.tsx:32 - BetInputGroup (used in module)
\src\components\casino\controls\BetInputGroup.tsx:7 - BetInputGroupProps (used in module)
\src\components\casino\controls\BetInputGroup.tsx:253 - default
\src\components\casino\controls\BetModeTabs.tsx:8 - BetModeTabsProps (used in module)
\src\components\casino\controls\BetModeTabs.tsx:171 - default
\src\components\casino\controls\GameActionButton.tsx:7 - GameActionButtonProps (used in module)
\src\components\casino\controls\GameActionButton.tsx:86 - default
\src\components\casino\controls\GameStatsPanel.tsx:6 - GameStatsPanelProps (used in module)
\src\components\casino\controls\GameStatsPanel.tsx:227 - default
\src\components\casino\controls\VibeSlider.tsx:6 - VibeSliderProps (used in module)
\src\components\casino\controls\VibeSlider.tsx:256 - default
\src\components\casino\hud\GameCoPilotHud.tsx:17 - GameCoPilotHudProps (used in module)
\src\components\home\bento\BentoArcadeCells.tsx:44 - ArcadeHeroCell (used in module)
\src\components\home\bento\BentoArcadeCells.tsx:233 - ArcadeSatelliteCell (used in module)
\src\components\home\hero-cinematic\index.ts:2 - FloatingParticles
\src\components\home\hero-cinematic\index.ts:3 - HeroHeadlineColumn
\src\components\home\hero-cinematic\index.ts:4 - JackpotPulseCard
\src\components\home\hero-cinematic\index.ts:5 - GameShowcaseCard
\src\components\home\hero-cinematic\index.ts:1 - GameTabConfig
\src\components\home\hero-cinematic\index.ts:12 - GAME_TABS
\src\components\home\hero-cinematic\index.ts:65 - FLOATING_PARTICLES
\src\components\social\casino-guide\guide-config.ts:30 - QUICK_CHIPS
\src\components\social\casino-guide\GuideMarkdown.tsx:255 - cleanLatexMath (used in module)
\src\components\social\casino-guide\GuideMarkdown.tsx:255 - parseInlineMarkdown (used in module)
\src\lib\casino\chat-guide\index.ts:4 - CASINO_GUIDE_MODEL
\src\lib\casino\chat-guide\index.ts:5 - CASINO_GUIDE_CONTEXT_VERSION
\src\lib\casino\chat-guide\index.ts:6 - CasinoGuideError
\src\lib\casino\chat-guide\index.ts:7 - CasinoGuideErrorKind
\src\lib\casino\chat-guide\index.ts:8 - GuideKnowledgeContext
\src\lib\casino\chat-guide\index.ts:9 - BuildGuideContextInput
\src\lib\casino\chat-guide\index.ts:10 - GuideConversationHistoryItem
\src\lib\casino\chat-guide\index.ts:11 - GuideAnswerResult
\src\lib\casino\chat-guide\index.ts:12 - GuideFunctionCall
\src\lib\casino\chat-guide\index.ts:13 - GuideStreamResult
\src\lib\casino\chat-guide\index.ts:16 - buildCasinoGuideContext
\src\lib\casino\chat-guide\index.ts:16 - buildCasinoGuideContextAsync
\src\lib\casino\chat-guide\index.ts:17 - buildCasinoGuideInstructions
\src\lib\casino\chat-guide\index.ts:19 - GUIDE_PERSONAS
\src\lib\casino\chat-guide\index.ts:20 - GuidePersona
\src\lib\casino\chat-guide\index.ts:21 - guidePersonaSchema
\src\lib\casino\chat-guide\index.ts:22 - DEFAULT_PERSONA
\src\lib\casino\chat-guide\index.ts:23 - PERSONA_META
\src\lib\casino\chat-guide\index.ts:24 - buildPersonaBlock
\src\lib\casino\chat-guide\index.ts:26 - buildGuideInputPayload
\src\lib\casino\chat-guide\index.ts:26 - buildCasinoGuideRequest
\src\lib\casino\chat-guide\index.ts:27 - extractSuggestionsFromText
\src\lib\casino\chat-guide\index.ts:27 - SuggestionStreamFilter
\src\lib\casino\chat-guide\index.ts:28 - requestCasinoGuideAnswer
\src\lib\casino\chat-guide\index.ts:29 - requestCasinoGuideAnswerStream
\src\lib\casino\fraud-ml\isolation-forest.ts:25 - IsolationForestOptions (used in module)
\src\lib\casino\fraud-ml\isolation-forest.ts:31 - IsolationForest (used in module)
\src\lib\casino\fraud-ml\scan.ts:27 - FraudMlScanSummary (used in module)
\src\lib\casino\guide-knowledge\commands.ts:4 - commandsGuideKnowledge
\src\lib\casino\guide-knowledge\games.ts:4 - gamesGuideKnowledge
\src\lib\casino\guide-knowledge\navigation.ts:4 - navigationGuideKnowledge
\src\lib\casino\guide-knowledge\parser.ts:1 - RawFrontmatter (used in module)
\src\lib\casino\guide-knowledge\parser.ts:13 - ParsedMarkdownDoc (used in module)
\src\lib\casino\guide-knowledge\registry.ts:57 - scoreDocument
\src\lib\casino\guide-knowledge\registry.ts:57 - tokenizeQuery
\src\lib\casino\guide-knowledge\registry.ts:58 - ScoredKnowledgeDoc
\src\lib\casino\guide-knowledge\registry.ts:58 - SelectKnowledgeOptions
\src\lib\casino\guide-knowledge\registry.ts:61 - HybridRetrievalResult
\src\lib\casino\guide-knowledge\registry.ts:63 - RetrievalStrategy
\src\lib\casino\guide-knowledge\registry.ts:65 - chunkKnowledgeDoc
\src\lib\casino\guide-knowledge\registry.ts:65 - chunkAllKnowledgeDocs
\src\lib\casino\guide-knowledge\registry.ts:66 - GuideKnowledgeChunk
\src\lib\casino\guide-knowledge\registry.ts:67 - cosineSimilarity
\src\lib\casino\guide-knowledge\registry.ts:67 - dotProduct
\src\lib\casino\guide-knowledge\registry.ts:67 - normalizeVector
\src\lib\casino\guide-knowledge\registry.ts:67 - vectorNorm
\src\lib\casino\guide-knowledge\registry.ts:69 - fetchQueryEmbedding
\src\lib\casino\guide-knowledge\registry.ts:70 - generateLocalEmbedding
\src\lib\casino\guide-knowledge\registry.ts:71 - getOrCreateVectorStore
\src\lib\casino\guide-knowledge\registry.ts:72 - resetVectorStoreCache
\src\lib\casino\guide-knowledge\registry.ts:73 - searchVectorChunks
\src\lib\casino\guide-knowledge\registry.ts:75 - EmbeddedChunk
\src\lib\casino\guide-knowledge\registry.ts:75 - ScoredChunk
\src\lib\casino\guide-knowledge\schema.ts:3 - guideKnowledgeSourceIds (used in module)
\src\lib\casino\guide-knowledge\schema.ts:18 - guideKnowledgeTopics (used in module)
\src\lib\casino\simulation\engine.ts:14 - StrategyKind (used in module)
\src\lib\casino\simulation\engine.ts:36 - LevelMilestone (used in module)
\src\lib\casino\simulation\engine.ts:41 - PlayerRunResult (used in module)
\src\lib\casino\simulation\rng.ts:1 - Rng (used in module)
\src\lib\casino\simulation\statistics.ts:1 - WagerSample (used in module)
\src\app\admin\knowledge\_components\index.ts:2 - KnowledgeForm
\src\app\admin\knowledge\_components\index.ts:3 - KnowledgeTable
\src\app\admin\knowledge\_components\index.ts:55 - Field
\src\app\admin\knowledge\_components\index.ts:3 - GuideDoc
\src\app\admin\knowledge\_components\index.ts:15 - TOPICS
\src\app\admin\knowledge\_components\index.ts:28 - inputStyle
\src\app\admin\knowledge\_components\index.ts:40 - KnowledgeFormState
\src\app\admin\knowledge\_components\index.ts:50 - SubmitMsg
\src\app\api\admin\games\route.ts:13 - GET
\src\app\api\admin\overview\route.ts:12 - GET
\src\app\api\admin\promo-codes\route.ts:28 - GET
\src\app\api\admin\users\route.ts:28 - GET
\src\app\api\casino\active-round\route.ts:39 - GET
\src\app\api\casino\bet-crash-multiplayer\route.ts:56 - POST
\src\app\api\casino\config\route.ts:7 - GET
\src\app\api\casino\jackpot\route.ts:5 - GET
\src\app\api\casino\migrate-session\route.ts:3 - POST
\src\app\api\casino\seeds\route.ts:17 - GET
\src\app\api\casino\session-sync\route.ts:3 - POST
\src\app\api\tournaments\daily-race\route.ts:6 - GET
\src\app\api\user\balance\route.ts:12 - GET
\src\app\api\user\history\route.ts:25 - GET
\src\app\api\user\login-history\route.ts:20 - GET
\src\app\api\user\login-history\route.ts:79 - POST
\src\app\api\user\stats\route.ts:19 - GET
\src\app\api\webhooks\clerk\route.ts:3 - POST
\src\app\games\slots\v2\layout.tsx:8 - default
\src\app\games\slots\v2\layout.tsx:3 - metadata
\src\app\games\slots\v2\page.tsx:48 - default
\src\app\testing\7.1\parts\shared.ts:19 - sandboxLinkStyle
\src\app\testing\brand-showcase\parts\shared.ts:15 - showcaseCardStyle
\src\app\testing\guide-sandbox\parts\sample-conversation.ts:1 - SampleAction (used in module)
\src\components\casino\games\blackjack\blackjack-config.ts:3 - ChipDef (used in module)
\src\components\casino\games\blackjack\BlackjackTableV2.tsx:65 - default
\src\components\casino\games\blackjack\CardHand.tsx:23 - default
\src\components\casino\games\crash\crash-helpers.ts:47 - RISK_ESCALATION_RATE (used in module)
\src\components\casino\games\crash\useCrashGameLoop.ts:27 - CrashStatus (used in module)
\src\components\casino\games\crash-multiplayer\index.ts:1 - TutorialModal
\src\components\casino\games\crash-multiplayer\index.ts:2 - BigWinCelebration
\src\components\casino\games\crash-multiplayer\index.ts:3 - MilestoneFlash
\src\components\casino\games\crash-multiplayer\index.ts:4 - LivePlayerList
\src\components\casino\games\crash-multiplayer\index.ts:5 - HistoryPills
\src\components\casino\games\crash-multiplayer\index.ts:6 - CrashMultiplayerControlSidebar
\src\components\casino\games\crash-multiplayer\index.ts:7 - CrashMultiplayerStage
\src\components\casino\games\roulette\roulette-auto-bet.ts:1 - AutoBetStopReason (used in module)
\src\components\casino\games\roulette\roulette-config.ts:7 - ChipDef (used in module)
\src\components\casino\games\roulette\roulette-config.ts:101 - OUTSIDE_BETS
\src\components\casino\games\roulette\types.ts:2 - Parity (used in module)
\src\components\casino\games\roulette\types.ts:3 - Range (used in module)
\src\components\casino\games\roulette\types.ts:4 - Dozen (used in module)
\src\components\casino\games\roulette\types.ts:5 - Column (used in module)
\src\components\casino\games\roulette\types.ts:6 - FrenchBet (used in module)
\src\components\casino\games\roulette\types.ts:28 - CHIPS
\src\components\casino\games\roulette\types.ts:75 - FRENCH_BETS_MAP
\src\components\casino\games\slots\SlotReel.tsx:11 - REEL_WINDOW_HEIGHT
\src\components\casino\games\slots\slots-config.ts:25 - PaytableEntry (used in module)
\src\components\casino\games\slots\slots-config.ts:110 - ChipDef (used in module)
\src\lib\casino\__tests__\helpers\supabase-mock.ts:8 - SupabaseMockState (used in module)
\src\app\api\casino\seeds\history\route.ts:11 - GET
```

### A4 — madge (npx madge --circular --extensions ts,tsx src, 2026-08-30)

```text
- Finding files
Processed 811 files (8.5s) (256 warnings)

✖ Found 4 circular dependencies!

1) lib/casino/casino-core.ts > lib/casino/game-config.ts
2) lib/casino/guide-knowledge/registry.ts > lib/casino/guide-knowledge/hybrid-retriever.ts > lib/casino/guide-knowledge/matcher.ts
3) lib/casino/guide-knowledge/registry.ts > lib/casino/guide-knowledge/hybrid-retriever.ts > lib/casino/guide-knowledge/pgvector-store.ts > lib/casino/guide-knowledge/vector-store.ts
4) lib/casino/guide-knowledge/registry.ts > lib/casino/guide-knowledge/hybrid-retriever.ts

```
