# 30 — Icon-Konsolidierung `Crown` (Icon-Familie: VIP / Jackpot)

> **Status:** Executed (2026-09-08, L0–L3; Jan-Gate §5 steht noch aus) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Crown` (14 Render-Stellen, §18.3 Zeile 4). Keine anderen 18.3-Icons.
> **Kontext:** `Crown` trägt zwei Bedeutungsgruppen (VIP, Jackpot/Sonstige). Gewählt: **Option C** (Icon-Familie, 2 eigenständige Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Korrektur 2026-09-06:** Das `CrownEmblem`-Auth-Duplikat (§18.4 Zeile 1) wird **nicht** mehr hier behandelt — Jan hat für 18.4.1 Option D gewählt (Wiederverwertung von `seal-casino-royale-quantum-gold.png` statt `crown-vip`). Eigener Plan: [`18_4_1_crownemblem_auth_brand_reuse_plan.md`](../../T_FRONTEND/18_4_1_crownemblem_auth_brand_reuse_plan.md). Die ursprüngliche L3 „CrownEmblem-Retirement" entfällt hier ersatzlos.
> **Money-Pfad:** Nein · **Security-Review:** Nein (Auth-Seiten sind betroffen, aber ausschließlich als Icon-Austausch — keine Änderung an Auth-Logik/Session-Handling)
> **Freigabe-Basis:** Option C im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.22/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                     | Scope (Dateien)                                                                                                      |   Status   | Zuständigkeit | Verifikation                                               |
| :----- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :--------: | :-----------: | :--------------------------------------------------------- |
| L0     | Asset-Generierung (Batch, 2 Motive)             | `public/images/2026-09-06_icon-crown-vip-quantum-gold_v001.png`, `2026-09-06_icon-crown-jackpot-quantum-gold_v001.png`, `public/images/CHANGELOG.md` | 🟢 Erledigt (2026-09-06) |      LLM      | Beide PNGs vorhanden (1,8 MB je Datei, Pipeline-Standardgröße), Alphakanal per `sharp`-Check verifiziert transparent, Motive auf den ersten Blick unterscheidbar (geschlossene Diamant-Krone vs. offene Flammen-Krone) |
| L1     | VIP-Integration (3 Stellen)                     | `VaultVipProgression.tsx`, `VaultTierShowcase.tsx`, `VipProgressTeaser.tsx`                                          | 🟢 Erledigt (2026-09-08) |      LLM      | `npm run typecheck` grün                                   |
| L2     | Jackpot/Sonstige-Integration (4 Stellen)        | `JackpotPulseCard.tsx`, `GuideMessageList.tsx`, `VipLiveStreamRail.tsx`, `DailyTournamentTeaser.tsx`                 | 🟢 Erledigt (2026-09-08) |      LLM      | `npm run typecheck` grün                                   |
| L3     | Verifikation & Doku-Update                      | `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.3), `public/images/CHANGELOG.md`                               | 🟢 Erledigt (2026-09-08) |      LLM      | 5-Stufen-DoD grün, Zeile aktualisiert               |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Ziel-Asset                                               | Kontexte                                                                                                                          | Stellen                                                                                                                                                                                   |
| :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon-crown-vip-quantum-gold.png`                        | VIP-Progression-Header, Tier-Showcase-Detail, „EXKLUSIVER VIP CLUB"-Header | `VaultVipProgression.tsx:36`, `VaultTierShowcase.tsx:243`, `VipProgressTeaser.tsx:99` |
| `icon-crown-jackpot-quantum-gold.png`                    | Jackpot-Hero-Badge, Guide-Quick-Action, Highroller-Ticker (Zeilentyp „whale"), Podiums-„PLATZ 1"                                  | `JackpotPulseCard.tsx:31`, `GuideMessageList.tsx` (Quick-Action „Crown"), `VipLiveStreamRail.tsx:315`, `DailyTournamentTeaser.tsx:187`                                                    |
| Toter Export (nur dokumentiert, kein Reassignment nötig) | `Medal`-Icon in `GlobalLeaderboard.tsx` — nirgends importiert (§16-Befund)                                                        | Keine Aktion in diesem Plan; separate Entscheidung „löschen statt ersetzen" bleibt offen, siehe Nicht-Scope                                                                               |

### 2.1.1 Scope-Korrekturen & Neubefunde (Execution 2026-09-08)

- **`GuideMessageList.tsx` → `crown-vip` statt `crown-jackpot`:** Die Quick-Action mit dem Crown-Icon öffnet `open_rank_benefits` (Rank-/VIP-Benefits-Modal). Semantisch ist das ein VIP-Status-Kontext, kein Gewinn-Moment → migriert gegen `icon-crown-vip-quantum-gold_v001.png` (14px). Abweichung von der §2.1-Zuordnung bewusst dokumentiert statt stillschweigend korrigiert.
- **Neubefunde außerhalb des Plans (migriert, gleiche Crown-Semantik):** `LiveHighrollerTickerBar.tsx` (Zeilentyp „whale", 14px → crown-jackpot), `HighrollerWinDetailModal.tsx` („whale"-Badge, 18px → crown-jackpot), `LevelProgress.tsx` (Level ≥ 100, 20px → crown-vip), `GameShowcaseCard.tsx` (Blackjack-Sim-Overlay, 18px → crown-jackpot), `BentoStripCells.tsx` (Podium rank 1, 14px → crown-jackpot, absolute Positionierung erhalten), `GuideSidebar.tsx` (`VIP`-Eintrag in `ITEM_ICONS` als Wrapper-Komponente → crown-vip 12px).
- **Dead-Render-Pfad:** `GlobalLeaderboard.tsx:118` (Platz-1-Crown) ist Teil der niemals gerenderten Default-Export-Komponente (§16-Befund, identisch zur Trophy-Präzedenz in [29](29_trophy_icon_konsolidierung_plan.md)) — trotzdem migriert (crown-jackpot 18px) und hier dokumentiert.
- **Out of Scope (unverändert):** `/v2`-Sandbox (`V2PromoCard`, `V2Hero`), `/testing`-Sandbox, Admin-Bereich sowie Slots-PNG-Symbol-Slots (`{PNG_SYMBOL}`-Platzhalter), die zufällig `crown` als Token tragen.

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- Zwei Subjekt-Slots: `crown-vip` = geschlossene, edle Krone mit Diamant-Spitze (Status/Zugehörigkeit), `crown-jackpot` = offene, strahlende Krone mit Funken-Aura (Gewinn-Moment) — bewusst unterscheidbar von `crown-vip`, damit die ursprüngliche §18.3-Konfusion nicht in neuer Form (zwei ähnliche Kronen) zurückkehrt.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Kein Löschen von `Medal`/`GlobalLeaderboard.tsx` in diesem Plan — das ist eine separate Entscheidung (§16-Dead-Export-Befund), hier nur dokumentiert.
- Keine Konsolidierung von `AuthBrandMarks.tsx` und `reset-password/page.tsx` in eine gemeinsame Komponente — nur der SVG-Inhalt wird 1:1 an beiden Stellen ausgetauscht, kein Refactoring der Duplikat-Struktur selbst (wäre ein separater, größerer Schnitt).
- Keine Änderung an Auth-Flow, Session-Handling oder Passwort-Reset-Logik in den betroffenen Dateien.
- Keine Wiederverwertung des `promo.bonus`-Assets aus [27](27_sparkles_icon_konsolidierung_plan.md) für Jackpot-Kontexte — Jan hat explizit Option C (eigenständiges Jackpot-Asset) gewählt, nicht Option B (Reuse).
- Kein Anfassen der übrigen 5 §18.3-Cluster.
- Kein Anfassen von `AuthBrandMarks.tsx` oder `reset-password/page.tsx` — das `CrownEmblem`-Duplikat ist ausschließlich Scope von [`18_4_1_crownemblem_auth_brand_reuse_plan.md`](../../T_FRONTEND/18_4_1_crownemblem_auth_brand_reuse_plan.md).

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung

- **Ziel:** 2 freigestellte, klar unterscheidbare PNGs gemäß Master-Template.
- **Schritte:** 2 Prompts (Subjekt-Slots §2.2) im selben Batch-Call wie [27](27_sparkles_icon_konsolidierung_plan.md)–[29](29_trophy_icon_konsolidierung_plan.md), [31](31_star_icon_konsolidierung_plan.md)–[32](32_shieldcheck_icon_konsolidierung_plan.md) → Freistellung → Ablage + CHANGELOG-Einträge.
- **Erwartetes Verhalten:** VIP- und Jackpot-Krone sind auf den ersten Blick unterscheidbar (nicht nur bei genauem Hinsehen).
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen pro Asset kein zufriedenstellendes, klar unterscheidbares Ergebnis → Stopp, Rückfrage.

### L1 — VIP-Integration

- **Ziel:** `VaultVipProgression.tsx`, `VaultTierShowcase.tsx`, `VipProgressTeaser.tsx` zeigen `icon-crown-vip`.
- **Schritte:** Lucide-Import ersetzen, Größe 1:1 (16px/18px je Stelle) übernehmen.
- **Erwartetes Verhalten:** VIP-Kontexte visuell konsistent und von Jackpot unterscheidbar.
- **Abbruchkriterium:** Keins.

### L2 — Jackpot/Sonstige-Integration

- **Ziel:** `JackpotPulseCard.tsx`, `GuideMessageList.tsx`, `VipLiveStreamRail.tsx`, `DailyTournamentTeaser.tsx` zeigen `icon-crown-jackpot`.
- **Schritte:** Wie L1. In `VipLiveStreamRail.tsx` nur den Zeilentyp „whale" umstellen (andere Typen gehören zu anderen Clustern).
- **Erwartetes Verhalten:** Jackpot-/Highroller-Kontexte visuell konsistent.
- **Abbruchkriterium:** Falls `VipLiveStreamRail.tsx` den Zeilentyp nicht eindeutig als Prop führt, Stopp + Rückfrage statt Heuristik zu raten.

### L3 — Verifikation & Abschluss

- **Ziel:** DoD grün, Doku aktuell (§18.3).
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, §18.3-Zeile `Crown` aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Vault-/Jackpot-/Guide-Seiten.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien + 2 neue PNGs + `CHANGELOG.md` + §18.3-Zeile.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots VIP-Progression und Jackpot-Hero zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                 |  Score   |
| :-------------- | :---------------------------------------------------------------------- | :------: |
| A               | 1 Reskin für alle 14 Stellen                                            |   3.62   |
| B               | Leit-Icon VIP + Jackpot-Reuse aus Sparkles-Cluster                      |   4.26   |
| **C (gewählt)** | 2 eigenständige Assets: `crown-vip` + `crown-jackpot` | **4.22** |

Tie-Break B vs. C (Abstand 0.04 ≤ 0.3) hätte mechanisch B favorisiert (Risiko 4.2 > 3.9); Jan hat sich bewusst für **Option C** entschieden (eigenständige Jackpot-Bildsprache statt Wiederverwertung), 2026-09-06.

---

## 7 — Visuelle Nachprüfung (2026-09-06)

> **Status:** 🟢 Geprüft, kein Revisionsbedarf.
> **Ergebnis:** Sichtprüfung gegen die reale Ziel-Einsatzgröße (14–18px, VIP-/Jackpot-Kontexte) bestätigt beide Assets als bereits stark und klar unterscheidbar (geschlossene Diamant-Krone vs. offene Flammen-Krone) — kein Prompt-Änderungsvorschlag für dieses Icon-Paar.
