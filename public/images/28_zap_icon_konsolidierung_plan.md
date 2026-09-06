# 28 — Icon-Konsolidierung `Zap` (Sidebar-HUD-Identität + Bereinigung)

> **Status:** In Execution (L0 erledigt, L1–L4 offen) · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Zap` (32 Render-Stellen, §18.3 Zeile 2). Keine anderen 18.3-Icons.
> **Kontext:** 5 der 32 `Zap`-Stellen sind derselbe Sidebar-Header-Badge, 6-fach dupliziert über die 5 Spiel-Sidebars (Crash hat 2 Code-Stellen: Solo + Multiplayer). Gewählt: **Option B** (Sidebar-HUD-Identität + Bereinigung) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Freigabe-Basis:** Option B im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.33/5, §6). Marken-/Pipeline-Kontext (Master-Template, Batch-API) siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                             | Scope (Dateien)                                                                                                                                                                |          Status          | Zuständigkeit | Verifikation                                                                                                                          |
| :----- | :------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :------------------------------------------------------------------------------------------------------------------------------------ |
| L0     | Asset-Generierung (1 Motiv)                             | `public/images/2026-09-06_icon-hud-sidebar-badge-quantum-gold_v001.png`, `public/images/CHANGELOG.md`                                                                          | 🟢 Erledigt (2026-09-06) |      LLM      | PNG vorhanden (1,6 MB, Pipeline-Standardgröße), Alphakanal per `sharp`-Check verifiziert transparent (Eck-Alpha 0, Zentrum-Alpha 252) |
| L1     | Sidebar-Header-Badge-Integration (6 Stellen / 5 Spiele) | `DiceControlSidebar.tsx`, `CrashControlSidebar.tsx`, `CrashMultiplayerControlSidebar.tsx`, `RouletteControlSidebar.tsx`, `SlotsControlSidebar.tsx`, `BlackjackLeftSidebar.tsx` |        🔴 Geplant        |      LLM      | `npm run typecheck` grün, alle 6 Stellen zeigen dasselbe Asset                                                                        |
| L2     | Action-CTA-Entfernung (Konsistenz zu Dice/Crash)        | `SlotsCenterStage.tsx:229,233`, `BlackjackTable.tsx:127,143`                                                                                                                   |        🔴 Geplant        |      LLM      | Kein `Zap`-Import mehr in diesen 2 Dateien                                                                                            |
| L3     | Bereinigung Sonstige (Entfernen/Reassignment)           | `HeroHeadlineColumn.tsx:342`, `OnboardingFlow.tsx`, `CardCountingPanel.tsx:191`, `VipPersonalRecords.tsx:28`, `LiveHighrollerTickerBar.tsx` (vip-Zeilentyp)                    |        🔴 Geplant        |      LLM      | Kein `Zap`-Import mehr außerhalb L1-Stellen                                                                                           |
| L4     | Verifikation & Doku-Update                              | `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md`, `public/images/CHANGELOG.md`                                                                                                         |        🔴 Geplant        |      LLM      | 5-Stufen-DoD grün, §18.3-Zeile aktualisiert                                                                                           |

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
