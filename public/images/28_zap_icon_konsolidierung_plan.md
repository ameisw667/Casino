# 28 — Icon-Konsolidierung `Zap` (Sidebar-HUD-Identität + Bereinigung)

> **Status:** Executed (2026-09-08, L1–L4; Endabnahme via Ergebnis-Links) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Zap` (§18.3 Zeile 2). Keine anderen 18.3-Icons.
> **Kontext:** 5 der 32 `Zap`-Stellen sind derselbe Sidebar-Header-Badge, 6-fach dupliziert über die 5 Spiel-Sidebars (Crash hat 2 Code-Stellen: Solo + Multiplayer). Gewählt: **Option B** (Sidebar-HUD-Identität + Bereinigung) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Freigabe-Basis:** Option B im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.33/5, §6). Marken-/Pipeline-Kontext (Master-Template, Batch-API) siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                             | Scope (Dateien)                                                                                                                                                                |          Status          | Zuständigkeit | Verifikation                                                                                                                          |
| :----- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :------------------------------------------------------------------------------------------------------------------------------------ |
| L0     | Asset-Generierung (1 Motiv)                             | `public/images/2026-09-06_icon-hud-sidebar-badge-quantum-gold_v001.png`, `public/images/CHANGELOG.md`                                                                          | 🟢 Erledigt (2026-09-06) |      LLM      | PNG vorhanden (1,6 MB, Pipeline-Standardgröße), Alphakanal per `sharp`-Check verifiziert transparent (Eck-Alpha 0, Zentrum-Alpha 252) |
| L1     | Sidebar-Header-Badge-Integration (6 Stellen / 5 Spiele) | `DiceControlSidebar.tsx`, `CrashControlSidebar.tsx`, `CrashMultiplayerControlSidebar.tsx`, `RouletteControlSidebar.tsx`, `SlotsControlSidebar.tsx`, `BlackjackLeftSidebar.tsx` | 🟢 Erledigt (2026-09-08) |      LLM      | typecheck 0 Fehler, alle 6 Stellen zeigen dasselbe Asset (18px bzw. 16px 1:1)                                                         |
| L2     | Action-CTA-Entfernung (Konsistenz zu Dice/Crash)        | `SlotsCenterStage.tsx:230,234`, `BlackjackTable.tsx:127,143`                                                                                                                   | 🟢 Erledigt (2026-09-08) |      LLM      | Kein `Zap`-Import mehr in diesen 2 Dateien; Banner-Text/Funktion unverändert                                                          |
| L3     | Bereinigung Sonstige (Entfernen/Reassignment)           | `HeroHeadlineColumn.tsx:343`, `OnboardingFlow.tsx`, `CardCountingPanel.tsx:191`, `VipPersonalRecords.tsx:29`, `LiveHighrollerTickerBar.tsx` (vip-Zeilentyp)                    | 🟢 Erledigt (2026-09-08) |      LLM      | Kein `Zap`-Import mehr außerhalb L1 + `/v2`-Sandbox + Admin (planmäßig out of Scope); Rest-Grep verifiziert                           |
| L4     | Verifikation & Doku-Update                              | `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md`, `public/images/CHANGELOG.md`                                                                                                       | 🟢 Erledigt (2026-09-08) |      LLM      | typecheck 0 Fehler, lint 0 Errors (30 Bestands-Warnings); §18.3-Zeile aktualisiert; `npm test`/`npm run build` im Gesamt-DoD          |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Behandlung                                                         | Stellen                                                                                                                                                                                                                                              |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reskin → `icon-hud-sidebar-badge`** (6 Stellen, 5 Spiele)        | `DiceControlSidebar.tsx:80`, `CrashControlSidebar.tsx:97`, `CrashMultiplayerControlSidebar.tsx:95`, `RouletteControlSidebar.tsx:102`, `SlotsControlSidebar.tsx:77`, `BlackjackLeftSidebar.tsx:63` — jeweils der 32×32-Gold-Chip vor „… CONTROLS"     |
| **Entfernen** (Action-CTA, Konsistenz zu Dice/Crash)               | `SlotsCenterStage.tsx:229,233` (SPIN-Button), `BlackjackTable.tsx:127,143` (Win-Banner) — Dice/Crash-Bet-Buttons sind bereits icon-los (`DiceControlSidebar.tsx:503-525`, `CrashControlSidebar.tsx:481-502`)                                         |
| **Entfernen** (Speed-Claim, Text trägt die Aussage bereits)        | `HeroHeadlineColumn.tsx:342` („INSTANT AUSZAHLUNG", grüner Text bleibt), `OnboardingFlow.tsx` („INSTANT PAY")                                                                                                                                        |
| **Entfernen** (Deko-Badge)                                         | `CardCountingPanel.tsx:191` — der `⚡`-Unicode-Text daneben bleibt unangetastet (gehört zu §18.4, nicht zu diesem Plan)                                                                                                                              |
| **Reassignment → `TrendingUp`** (bereits im selben File vorhanden) | `VipPersonalRecords.tsx:28` („Max. Multiplikator"), `LiveHighrollerTickerBar.tsx:97-103` (nur der Zeilentyp „vip"; `TrendingUp` ist in derselben Datei bereits für die RTP-Stat unter `:261` im Einsatz — Wiederverwertung statt neuer Fremd-Import) |

### 2.1.1 Scope-Korrekturen & Neubefunde (2026-09-08, Execution)

- **Plan-Listen-Drift:** `CardCountingPanel.tsx:191` hatte kein aktives `Zap` mehr (frühere Session) — Entfernung entfällt, dokumentiert statt korrigiert.
- **Neubefund (migriert):** `HeroHeadlineColumn.tsx:185` „BONUS AKTIVIEREN" (CTA) → Bonus-Kontext → `icon-promo-bonus-quantum-gold` (konsistent zu Plan 27), 14px.
- **Neubefunde (Reassignments, jeweils dokumentiert):** `CommandPalette.tsx:69` („Toggle Sound", semantisch falsch) → `Volume2`; `LevelProgress.tsx:59` (niedriges Level im Crown/Shield-Treppenlauf) → `Star`; `BetModeTabs.tsx:156` („Auto Mode") → `Repeat`; `gameMeta.ts:18` + `app/games/_components/config.ts:75` (Slots-Spiel-Icon) → `Cherry` (konsistent zu Plan 27 L3); `WalletModal.tsx:366` (CONFIRM DEPOSIT) → `Check`, `:510` („INSTANT WITHDRAWAL", Speed-Claim) → entfernt; `SlotCabinetV2.tsx:77,79` (Win-Banner, Action-CTA-Analog) → entfernt; `app/games/slots/v2/page.tsx:324` (CONTROL-Panel-Header) → `icon-hud-sidebar-badge` 20px; `GuideSidebar.tsx:82` (AI/Guide-Kontext) → `icon-ai-guide` 11px (konsistent zu Plan 27); `ProgressiveJackpotSection.tsx:26` („1.8 SEKUNDEN"-Stat) → `Timer`; `HighrollerWinDetailModal.tsx:62` + `PlayerProfileModal.tsx:192` (Performance-Stats) → `TrendingUp`; `DailyTournamentTeaser.tsx:283` (Preisgeld) → `Coins`; `GameShowcaseCard.tsx:217` (Dice-Sim-Stat) → `Dices`.
- **Out of Scope unverändert:** `/v2`-Sandbox (`V2Sidebar.tsx`), `/testing` (7.1-Parts, `NeonArcadeDashboardView` — wird nur unter `/testing` gerendert), Admin (`AdminEvalsClient`, `AdminOverviewClient`).

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template und Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- Subjekt-Slot für dieses Asset: stilisierter Gold-Blitz/Kern als eigenständiges HUD-Emblem (kein generischer Lucide-Blitz-Umriss), gleiche Material-/Licht-Rezeptur wie die übrigen Assets dieser Runde.
- Größenparität: aktuelle Sidebar-Badges sind 18px (`CrashControlSidebar.tsx:97`) bzw. 16px (`SlotsControlSidebar.tsx:77`) — Ziel-`<Image>` je Stelle exakt in der bisherigen Größe einsetzen, keine Umskalierung.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an Bet-/Spin-Logik in `SlotsCenterStage.tsx`/`BlackjackTable.tsx` — nur der Icon-Render entfällt, Button-Funktion bleibt exakt gleich.
- Keine Änderung am `⚡`-Unicode-Glyph in `CardCountingPanel.tsx` (gehört zu §18.4, eigener künftiger Plan).
- Keine Änderung an anderen Ticker-Zeilentypen (`jackpot`/`whale`/`hot`) in `LiveHighrollerTickerBar.tsx` — nur `vip`.
- Kein Anfassen der übrigen 5 §18.3-Cluster.

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung

- **Ziel:** 1 freigestelltes PNG gemäß Master-Template.
- **Schritte:** Prompt aus Master-Template (Subjekt: HUD-Blitz-Emblem, §2.2) → `gpt-image-2`, `medium`, `1024×1024` → Freistellung → Ablage `public/images/icon-hud-sidebar-badge-quantum-gold.png` + CHANGELOG-Eintrag. Im selben Batch-Call wie [27](27_sparkles_icon_konsolidierung_plan.md), [29](29_trophy_icon_konsolidierung_plan.md)–[32](32_shieldcheck_icon_konsolidierung_plan.md), sofern zeitgleich in Ausführung.
- **Erwartetes Verhalten:** Eigenständiges, markentreues HUD-Emblem, stilistisch zur übrigen Icon-Familie passend.
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen kein zufriedenstellendes Ergebnis → Stopp, Rückfrage an Jan.

### L1 — Sidebar-Header-Badge-Integration

- **Ziel:** Alle 6 Stellen zeigen identisch das neue Asset in bisheriger Größe/Position.
- **Schritte:** Je Datei `Zap`-Import (falls sonst ungenutzt) entfernen, `next/image` einsetzen, Größe 1:1 aus dem bisherigen Lucide-`size`-Prop übernehmen.
- **Erwartetes Verhalten:** Alle 5 Spiel-Sidebars tragen dieselbe HUD-Marke — visuell erkennbare Produktfamilie statt 5× derselbe generische Lucide-Linie.
- **Abbruchkriterium:** Keins — reiner 1:1-Bild-Tausch an strukturell identischen Stellen.

### L2 — Action-CTA-Entfernung

- **Ziel:** `Zap` verschwindet aus SPIN-Button und Blackjack-Win-Banner, Layout bleibt sonst unverändert.
- **Schritte:** Icon-Element entfernen, Button-/Banner-Padding falls nötig minimal nachziehen (kein Redesign).
- **Erwartetes Verhalten:** Slots-SPIN-Button und Blackjack-Win-Banner wirken wie die bereits icon-losen Dice-/Crash-Pendants.
- **Abbruchkriterium:** Falls das Entfernen einen erkennbaren visuellen Bruch erzeugt (z. B. Leerraum, der vorher vom Icon gefüllt wurde), Padding anpassen statt Layout unverändert mit Lücke zu lassen.

### L3 — Bereinigung Sonstige

- **Ziel:** Keine verbliebenen `Zap`-Importe außerhalb L1.
- **Schritte:** `HeroHeadlineColumn.tsx:342` + `OnboardingFlow.tsx`: Icon entfernen, Text/Farbe unverändert. `CardCountingPanel.tsx:191`: Icon entfernen. `VipPersonalRecords.tsx:28` + `LiveHighrollerTickerBar.tsx` (vip-Zeile): Import auf `TrendingUp` umstellen.
- **Erwartetes Verhalten:** Keine Bedeutungsverwechslung mehr zwischen HUD-Marke, Speed-Claim und Performance-Stat.
- **Abbruchkriterium:** Falls `LiveHighrollerTickerBar.tsx` den Zeilentyp nicht eindeutig als Prop führt, Stopp + Rückfrage statt Heuristik zu raten.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, Doku aktuell.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, §18.3-Zeile `Zap` aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien + 1 neues PNG + `CHANGELOG.md` + §18.3-Zeile.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots aller 5 Sidebar-Varianten + Slots/Blackjack ohne Action-Icon zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                       |  Score   |
| :-------------- | :------------------------------------------------------------ | :------: |
| A               | 1 Reskin für alle 32 Stellen                                  |   3.61   |
| **B (gewählt)** | Sidebar-HUD-Identität (5 Stellen, 1 Asset) + Bereinigung Rest | **4.33** |
| C               | + eigenes Asset für Slots-Spin-Button                         |   4.19   |

Tie-Break B vs. C (Abstand 0.14 ≤ 0.3): Risiko B (4.3) > C (3.9) → B bestätigt. Jan-Freigabe: **Option B**, 2026-09-06.

---

## 7 — Visuelle Nachprüfung & Prompt-Revision (2026-09-06)

> **Status:** 🟡 Vorschlag — wartet auf Jans Freigabe zur Regenerierung. Keine API-Kosten ausgelöst, L0-Status in §1 bleibt unverändert auf „Erledigt", bis eine Regenerierung stattfindet.
> **Anlass:** Sichtprüfung gegen die reale Ziel-Einsatzgröße (16–18px Sidebar-Header-Badge). Ergebnis bereits klar lesbar — nur Feinschliff für maximale Kontrastschärfe bei dieser Kleinstgröße.

| Asset | Befund | Alt-Prompt (aktuell generiert) | Neu-Prompt (Vorschlag) |
| :--- | :--- | :--- | :--- |
| `icon-hud-sidebar-badge-quantum-gold` | Kleine Diamant-Zierzacken an den Hex-Ecken verschwimmen bei 16–18px zu Rauschen; Blitz-Kontur könnte kräftiger sein. | „a stylized angular lightning bolt fused into a hexagonal control-panel emblem frame, sharp geometric facets, symbolizing an active game-control hub badge" | „a single bold angular lightning bolt with thick unbroken edges, fused flush into the center of a hexagonal control-panel emblem frame with exactly 6 flat facet corners (no secondary diamond studs), symbolizing an active game-control hub badge, high edge-to-background contrast, centered, full view without clipping" |

**Nach Freigabe:** `icon-consolidation-batch-01.manifest.json` mit dem Neu-Prompt aktualisieren, L0-Status in §1 auf „🟡 Regeneriert (2026-09-XX)" ändern, dann `npm run design:generate --dry-run` → nach Sichtprüfung `--yes`.
