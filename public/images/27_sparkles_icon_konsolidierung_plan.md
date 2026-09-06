# 27 — Icon-Konsolidierung `Sparkles`: Kontext + Option-Gate (Start-Cluster aus §18.3)

> **Status:** Optionen offen — Jan-Entscheidung ausstehend (kein Code-Change, keine Bildgenerierung) · **Stand:** 2026-09-06 · **Owner:** LLM (Jan am Gate) · **Scope:** Nur `Sparkles` (35 Render-Stellen, siehe [`worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md#183-befund-b`](../../worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md)). `Zap`, `Trophy`, `Crown`, `Star`, `ShieldCheck` (18.3, weitere Zeilen) und alle 18.2/18.4-Cluster folgen erst nach diesem Muster.
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-/Asset-Präsentation)

---

## 1 — Ausgangslage (Ist-Zustand, aus der Inventur übernommen)

`Sparkles` ist mit 35 Render-Stellen das am zweithäufigsten überladene Icon der Seite (nach `ShieldCheck`, 37) und trägt laut Analyse (§1) mit am stärksten zum „kinderhaft"-Eindruck bei. Fünf unterschiedliche Bedeutungen laufen aktuell durch dasselbe Glyph:

| Bedeutung                                             | Beispiel-Stellen                                                                                                                                                                                                                                      |
| :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI / Royale Guide                                     | `GuideTriggerButton.tsx:54` (Floating-Button, auf **jeder** MainLayout-Seite sichtbar), `DiceCenterStage.tsx:223`, `CrashStage.tsx:133`, `CrashTutorial.tsx:52`, `SlotsCenterStage.tsx:351`, `BlackjackLeftSidebar.tsx:108` (Idle-/Co-Pilot-Hinweise) |
| Bonus / Jackpot-CTA                                   | `JackpotPulseCard.tsx:138` („JACKPOT KNACKEN")                                                                                                                                                                                                        |
| Dekorativer Sektions-Header                           | `InteractiveArcadeGrid.tsx:203` („INTERAKTIVE SPIELHALLE")                                                                                                                                                                                            |
| Spiel-Icon (Slots)                                    | `HistoryTableStream.tsx:69`                                                                                                                                                                                                                           |
| Sonstige (Glücks-Index, Prüfcode-Copy, Ticker-Zeilen) | `VipPersonalRecords.tsx:42`, `BetReceiptModal.tsx:386`, `LiveHighrollerTickerBar.tsx:97-103`                                                                                                                                                          |
| Sandbox-Masse (out of scope)                          | `/testing`-Heroes (§16)                                                                                                                                                                                                                               |

**Kernproblem:** „KI" ist von „Bonus" visuell nicht mehr unterscheidbar — genau die Meaning-Creep-Diagnose aus §18.3. Der sichtbarste Einzelfall ist `GuideTriggerButton.tsx:54`, weil er global auf jeder Seite gerendert wird.

---

## 2 — Eingeholter Kontext (Marke, Pipeline, Anti-Pattern)

- **Design-Tokens (verbindlich, `references/design-laws.md` bzw. `xx_sop/04_design_system_ui.md`):** Obsidian `#0B0E14`, Gold `#D4AF37` (Akzent/Flächen) bzw. `#FFD700 → #D4AF37`-Gradient (Vollgold-CTAs), Win-Smaragd `#10b981`, Radien 8–20 px (Buttons/Pills), Glow `0 0 16–20px rgba(212,175,55,0.22–0.45)` bei aktiv.
- **Bestätigtes Anti-Pattern (`casino-design-system-craft/references/anti-patterns.md`, A2):** „Unmodifizierte Standard-Icons ❌ — kinderhaft aussehende Default-Icons (Lucide ungestylt übernommen)". Regel: „Icons nur mit bewusst gesetzter Größe, Strichstärke und Farbe — oder gar kein Icon." Diese Datei hier ist explizit die „parallele Konversation", auf die A2 verweist.
- **Bild-Pipeline (bereits produktiv, 5× genutzt für IMG-01–05):** Standardmodell `gpt-image-2` (aktuell Elo-Rang 1 aller Bildmodelle, siehe `09_model_pricing_reference.md`), Sweet-Spot-Qualität `medium`. Ein 1024×1024-Icon-Asset kostet bei `medium` ≈ **$0,032**, bei `high` ≈ **$0,125** — Kosten sind für ein Einzel-Icon vernachlässigbar, kein Entscheidungskriterium.
- **Vorlage für den Ablauf, falls ein neues Asset entsteht:** `23_big_win_siegel_plan.md` (Meilenstein-Struktur L0–L4, Freigabe-Vermerk „Option X im Workflow-Jan Option-Gate vom …").

---

## 3 — Option-Gate (nach `xx_sop/01_workflow_jan_option_gate.md`)

**Kriterien-Gewichtung:** Lerneffekt 30 % · Aufwand/Komplexität 25 % · Risiko 25 % · Wartbarkeit 20 % (Standard-Gewichtung, kein Money-Pfad betroffen → keine Anhebung auf 40 % Risiko).

| Option | Konzept & Architektur                                                                                                                                                                                                                                                                        | Trade-off-Kontext (wann beste Wahl?)                                                                                                                                                  | Aufwand                                                                                       | Score (gewichtet) |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- | :---------------- |
| **A**  | Reine Semantik-Neuzuordnung: `Sparkles` bleibt exklusiv für AI/Guide (6 Stellen unverändert im Look), die übrigen 29 Stellen wandern auf bereits im Projekt vorhandene Lucide-Icons (Bonus → `Gift`, Slots-Icon → `Cherry`/`Disc3`, Grid-Header → entfernt gem. A2). **0 neue Bild-Assets.** | Bester Griff, wenn dieser Sprint reine Aufräum-Disziplin ist und die Bild-Pipeline für andere Assets (IMG-01–05) Vorrang behalten soll.                                               | ~15 Dateien, ~29 Prop-/Import-Swaps, 0 Assets                                                 | **3.73 / 5**      |
| **B**  | Ein neues, markentreues Custom-Icon (via `gpt-image-2`, Obsidian & Gold) ersetzt exklusiv die 6 AI/Guide-Stellen (v. a. `GuideTriggerButton.tsx:54`); die 29 Nicht-AI-Stellen wandern wie in A auf bestehende Lucide-Icons.                                                                  | Bester Griff, wenn das Ziel dieser Runde explizit ist, ein selbst erstelltes, nicht-generisches Bild an der sichtbarsten Sparkles-Stelle zu erproben — bevor der Rest des Sets folgt. | Wie A + 1 neues PNG-Asset (~$0,03–0,05, 1–2 Prompt-Iterationen)                               | **3.90 / 5**      |
| **C**  | Zentrales Icon-Primitive (§18.5, `src/components/ui/icon.tsx`) zuerst bauen; alle 35 Sparkles-Stellen sofort auf benannte Tokens (`ai.guide`, `promo.bonus`, `badge.new`, `game.slots-icon`, …) migrieren, Glyph/Bild wird zentral pro Token gepflegt.                                       | Bester Griff, wenn jetzt schon in Architektur investiert werden soll, um P2–P5 (§18.6) danach mechanisch statt manuell abzuarbeiten.                                                  | Neue Komponente + Migration aller 35 Stellen in einem Zug, vor jedem sichtbaren Bild-Ergebnis | **3.20 / 5**      |

### 3.1 Scoring-Details (1–5, mit Beleg)

| Kriterium (Gewicht)        |                                        A                                         |                                                                      B                                                                       |                                                                    C                                                                    |
| :------------------------- | :------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------: |
| Lerneffekt (30 %)          |             2.5 — reine Umverteilung, keine neue Pipeline-Anwendung              | 4.5 — durchläuft den vollen Bild-Workflow (Prompt → `gpt-image-2` → Freistellung → Einbindung) an einem konkreten, global sichtbaren Element |         4.0 — sauberes Architektur-Pattern (Token-Registry), aber ohne sofort sichtbares Ergebnis für das „kinderhaft"-Problem          |
| Aufwand/Komplexität (25 %) |                       5.0 — 0 neue Assets, kleinster Diff                        |                                              3.0 — 1 Asset + dieselben 29 Umverteilungen wie A                                               |                                    1.5 — größter Aufwand: neue Komponente + 35 Stellen in einem Zug                                     |
| Risiko (25 %)              |                4.5 — keine neue Abhängigkeit, reine Anzeige-Swaps                |          4.0 — Pipeline bereits 5× produktiv genutzt (IMG-01–05), Kosten <$0,05; einziges Risiko ist Bildqualität/Iterationsbedarf           | 2.5 — größter Blast-Radius (alle 35 Stellen gleichzeitig angefasst), Overengineering-Risiko, ohne dass 18.2–18.4 schon entschieden sind |
| Wartbarkeit (20 %)         | 3.0 — löst Überladung, AI-Icon bleibt aber optisch unverändertes Standard-Lucide |         4.0 — AI-Marke wird eindeutig (1 Bild statt 1 Icon), deckt sich exakt mit dem §18.3-Vorschlag „Sparkles = AI/Guide exklusiv"         |                   5.0 — genau das in §18.5 beschriebene Ziel; jede künftige Cluster-Migration wird danach mechanisch                    |

### 3.2 Tie-Break & Gegenprobe

- **Top-2-Abstand:** B (3.90) − A (3.73) = 0.17 ≤ 0.3 → **Tie-Break-Regel greift**, entscheidet zwingend Risiko. A hat den besseren Risiko-Wert (4.5 vs. 4.0) → **mechanisch führt A.**
- **Aber — Pre-Mortem für A (Führungsoption laut Tie-Break):** _Scheitert Option A in 6 Monaten, woran läge es am wahrscheinlichsten?_ Daran, dass das AI/Guide-Icon am sichtbarsten Punkt der ganzen App (`GuideTriggerButton.tsx:54`, auf jeder Seite gerendert) ein generisches Lucide-Sternchen bleibt — Jans ursprüngliches „kinderhaft"-Problem bleibt an der auffälligsten Stelle ungelöst, und ein Nachfolge-Auftrag für genau das Custom-Icon aus Option B wird ohnehin fällig, dann aber mit doppeltem Umbauaufwand am selben Button.
- **Gegenprobe B:** B führt, wenn Jans Priorität für diese Runde tatsächlich „erstes sichtbares Ergebnis gegen den kinderhaften Eindruck" ist — was seiner Aufgabenstellung („Icons selber erstellen… damit es nicht so kinderhaft ausschaut wie aktuell") entspricht.
- **Gegenprobe C:** C führt, wenn die Priorität stattdessen „Infrastruktur für alle 5 verbleibenden §18.3-Cluster (Zap, Trophy, Crown, Star, ShieldCheck) gleichzeitig vorbereiten" ist, nicht Sparkles isoliert zu lösen.

### 3.3 Einschätzung

Mechanisch (Score + Tie-Break-Regel) führt **A**. Da Jans expliziter Auftrag für diese Runde aber genau das ist, was A an der wichtigsten Stelle nicht liefert — ein selbst erstelltes, nicht-generisches Bild statt eines Standard-Lucide-Icons für den AI/Guide-Kontext —, ist die Einschätzung: **B ist trotz Tie-Break die inhaltlich passendere Wahl**; das Pre-Mortem von A beschreibt effektiv, warum A nur ein Zwischenschritt vor B wäre. C bleibt für später vorgemerkt (§18.6 P4/P5), sobald mehrere Cluster gleichzeitig migriert werden sollen.

---

## 4 — Stopp (verbindlich nach Option-Gate-SOP)

Keine Bildgenerierung, kein Code-Edit vor Jans expliziter Wahl **„Option A"**, **„Option B"** oder **„Option C"**. Nach Freigabe wird dieser Plan auf `Execution-Ready` gehoben (Meilenstein-Struktur analog `23_big_win_siegel_plan.md`, L0 Asset/Umverteilung → L1 Integration → L2 Verifikation) und die Zeile `Sparkles` in [`worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md` §18.3](../../worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md) entsprechend aktualisiert.
