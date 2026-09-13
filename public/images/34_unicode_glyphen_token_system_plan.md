# 34 — Unicode-Glyphen: Typografie-Token-System + 2 Icon-Assets

> **Status:** Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich die 7 Unicode-Glyphen aus §18.4 Zeile 4 (`½ 2× ∞ ✓ × ♦ ⚡`). Kein Antasten der Werte/Logik dahinter (Quick-Bet-Beträge, Multiplikator-Berechnung, Kartenfarben).
> **Kontext:** 7 Glyphen laufen heute uneinheitlich als roher Unicode-Text durch 3 Spiele-Sidebars + Blackjack-Karten. Gewählt: **Option D** (zentrales Typografie-Token-System für alle 7 + zusätzlich 2 neue `gpt-image-2`-Icons für die beiden statischen, nicht-wertabhängigen Glyphen `✓`/`⚡`) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine Präsentationsschicht; Kartenwerte, Multiplikator-Berechnung und Cashout-Logik bleiben unverändert, siehe Nicht-Scope)
> **Freigabe-Basis:** Option D im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.34/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Asset-Generierung (2 Motive) | `public/images/icon-glyph-cashout-quantum-gold.png`, `icon-glyph-cardcounting-quantum-gold.png`, `public/images/CHANGELOG.md` | 🔴 Geplant | LLM | Beide PNGs vorhanden, Alphakanal transparent |
| L1 | Glyph-Token-System aufbauen | `src/lib/design-tokens/glyph-tokens.ts` (neu) | 🔴 Geplant | LLM | `npm run typecheck` grün, 7 benannte Tokens exportiert |
| L2 | Integration der 2 neuen Icons | `CrashControlSidebar.tsx` (`✓ SECURED`), `CrashStage.tsx` (Cashout-Pill), `CardCountingPanel.tsx:191` | 🔴 Geplant | LLM | `npm run typecheck` grün, Icons ersetzen die bisherigen Unicode-Zeichen an diesen Stellen |
| L3 | Migration der 5 Text-Glyphen auf Tokens | `DiceControlSidebar.tsx`, `CrashControlSidebar.tsx`, `CrashStage.tsx`, `MilestoneFlash.tsx`, `PlayingCardV2.tsx`, `PlayingCard.tsx`, `BlackjackCard3D.tsx` | 🔴 Geplant | LLM | `npm run typecheck` grün, alle 5 Glyphen nutzen die neuen Tokens statt Inline-Styles |
| L4 | Verifikation & Doku-Update | `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.4 Zeile 4) | 🔴 Geplant | LLM | 5-Stufen-DoD grün, Zeile aktualisiert |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Glyph | Behandlung | Stellen |
| :--- | :--- | :--- |
| `✓` (Cashout-Bestätigung) | Neues Icon `icon-glyph-cashout` | `CrashControlSidebar.tsx:526` (Button „✓ SECURED $… @ …x"), `CrashStage.tsx:274` (Stage-Pill) |
| `⚡` (Card-Counting-Badge) | Neues Icon `icon-glyph-cardcounting` | `CardCountingPanel.tsx:191` |
| `½` / `2×` (Quick-Bet-Chips, statische Button-Labels) | Token (kein Bild — Label-Text, keine Live-Werte) | `DiceControlSidebar.tsx:256-271`, `CrashControlSidebar.tsx:272-287` |
| `∞` (Auto-Config-Label „0 = ∞") | Token (kein Bild) | `DiceControlSidebar.tsx:355,373` |
| `×` (Milestone-Popup, dynamischer Multiplikator-Wert) | Token (kein Bild — echter Live-Wert, kann nicht vorgerendert werden) | `CrashStage.tsx:300`, `MilestoneFlash.tsx:26` |
| `♦` (Kartenfarbe, Kern-Gameplay-Rendering) | Token (kein Bild — gehört zum Karten-Rendering, nicht zur Icon-Konsolidierung) | `PlayingCardV2.tsx:30`, `PlayingCard.tsx:23`, `BlackjackCard3D.tsx:20` |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- Subjekt-Slots: `icon-glyph-cashout` = Haken-Symbol mit Facetten-Schliff (kompakter als das ShieldCheck-Motiv aus [32](32_shieldcheck_icon_konsolidierung_plan.md), da hier keine Sicherheits-, sondern eine Bestätigungs-Semantik gilt), `icon-glyph-cardcounting` = stilisiertes Blitz-Symbol, bewusst unterscheidbar vom `hud.sidebar-badge`-Motiv aus [28](28_zap_icon_konsolidierung_plan.md), um keine neue Zap/Card-Counting-Verwechslung zu erzeugen.
- **Token-Struktur (`glyph-tokens.ts`):** je Glyph `{ display: 'text' | 'image', value: string, fontWeight?, fontSize?, color? }` — die 5 Text-Glyphen bekommen `display: 'text'` mit konsistenter Typografie, die 2 Icon-Glyphen `display: 'image'` mit Asset-Pfad.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an Quick-Bet-Beträgen, Auto-Config-Grenzwerten, Multiplikator-Berechnung oder Cashout-Logik — ausschließlich die Darstellungsschicht.
- Keine Änderung am Kartenrendering, an Kartenwerten oder anderen Kartenfarben (`♥ ♣ ♠`) — nur `♦` bekommt ein Typografie-Token für konsistente Größe/Farbe, keine visuelle Neugestaltung der Karten.
- Keine Bildgenerierung für `½`, `2×`, `∞`, `×`-Milestone oder `♦` — bewusst als Text-Tokens belassen (§2.1-Begründung).
- Kein Anfassen der übrigen 18.4-Punkte (1–3 — eigene Pläne).

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung
- **Ziel:** 2 freigestellte PNGs gemäß Master-Template.
- **Schritte:** 2 Prompts (Subjekt-Slots §2.2) → `gpt-image-2`, `medium`, `1024×1024` → Freistellung → Ablage + CHANGELOG-Einträge. Kann im selben Batch-Call wie [33](33_roulette_rad_hub_cap_plan.md) L2 laufen, sofern zeitgleich in Ausführung.
- **Erwartetes Verhalten:** Beide Motive klar von den bisherigen `Zap`/`ShieldCheck`-Familien unterscheidbar (§2.2).
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen pro Asset kein zufriedenstellendes Ergebnis → Stopp, Rückfrage.

### L1 — Glyph-Token-System
- **Ziel:** `src/lib/design-tokens/glyph-tokens.ts` mit 7 benannten Tokens (`glyph.half`, `glyph.double`, `glyph.infinity`, `glyph.checkmark`, `glyph.multiplier`, `glyph.diamond`, `glyph.spark`).
- **Schritte:** Konstanten-Objekt analog dem Muster aus `style-preset.ts` (Kategorie-Presets) definieren.
- **Erwartetes Verhalten:** Einmal definiert, überall importierbar statt roher Inline-Unicode-Strings.
- **Abbruchkriterium:** Keins.

### L2 — Integration der 2 neuen Icons
- **Ziel:** `✓` und `⚡` durch die neuen Bild-Assets ersetzt.
- **Schritte:** Lucide-/Unicode-Ersatz durch `next/image`, Größe 1:1 aus dem bisherigen Text-Kontext ableiten (z. B. `font-size` der Umgebung als Referenzgröße).
- **Erwartetes Verhalten:** Cashout-Bestätigung und Card-Counting-Badge wirken hochwertiger, Funktion (Anzeige-Trigger) unverändert.
- **Abbruchkriterium:** Falls `✓`/`⚡` Teil eines dynamisch zusammengesetzten Strings sind (z. B. `✓ SECURED $${amount} @ ${mult}x`), Icon nur für das Symbol selbst einsetzen, Rest bleibt Text — bei struktureller Unklarheit Stopp + Rückfrage.

### L3 — Migration der 5 Text-Glyphen
- **Ziel:** `½`, `2×`, `∞`, `×`-Milestone und `♦` nutzen die Tokens aus L1 statt Inline-Styles.
- **Schritte:** Bestehende Inline-`style`/Klassen durch Token-Referenzen ersetzen, visuelle Erscheinung (Größe/Farbe) dabei unverändert lassen (reine Konsolidierung, keine Redesign).
- **Erwartetes Verhalten:** Keine sichtbare Änderung, aber zentrale Pflegbarkeit — eine künftige Typografie-Anpassung braucht nur noch 1 Änderungsstelle.
- **Abbruchkriterium:** Jede sichtbare optische Abweichung vom Ist-Zustand → Token-Werte korrigieren, nicht als „Verbesserung" stehen lassen (Scope ist Konsolidierung, kein Redesign).

### L4 — Verifikation & Abschluss
- **Ziel:** DoD grün, §18.4-Zeile 4 aktualisiert.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, Zeile aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Dice/Crash/Blackjack-Seiten.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün, insbesondere Dice/Crash/Blackjack-Rendertests unverändert.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien + 2 neue PNGs + `CHANGELOG.md` + §18.4-Zeile.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots Cashout-Bestätigung (Crash), Card-Counting-Panel und mindestens 1 Quick-Bet-Chip (zur Kontrolle, dass die Text-Migration in L3 keine optische Abweichung erzeugt hat) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| A | Alles als Text belassen | 3.48 |
| B | Nur `✓`/`⚡` als neue Icons | 3.81 |
| C | Nur Typografie-Token-System, kein neues Bild | 4.05 |
| **D (gewählt)** | Typografie-Token-System für alle 7 + zusätzlich neue Icons für `✓`/`⚡` | **4.34** |

Tie-Break D vs. C (Abstand 0,29 ≤ 0,3) hätte mechanisch C favorisiert (Risiko 4,5 > 4,3); Jan hat sich bewusst für **Option D** entschieden (echter visueller Mehrwert an unstrittig sicheren Stellen), 2026-09-06.
