# 27 — Icon-Konsolidierung `Sparkles` (AI/Guide + Bonus)

> **Status:** In Execution (L0 erledigt, L1–L4 offen) · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Sparkles` (35 Render-Stellen, §18.3 Zeile 1). Keine anderen 18.3-Icons, keine Wallet-/Settlement-Logik.
> **Kontext:** `Sparkles` überlagert aktuell 5 Bedeutungen im selben Glyph (AI/Guide, Bonus, Sektions-Deko, Slots-Spielicon, Sonstiges) — Kernbefund §1/§18.3 der Icon-Inventur. Gewählt: **Option C** (Icon-Familie, 2 Assets) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine UI-/Asset-Präsentation, keine `src/lib/casino/`-, Wallet- oder Auth-Berührung)
> **Freigabe-Basis:** Option C im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.28/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                       | Scope (Dateien)                                                                                                                                                 |          Status          | Zuständigkeit | Verifikation                                                                                                                                                                                                                                                                       |
| :----- | :------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Asset-Generierung (Batch, 2 Motive)               | `public/images/2026-09-06_icon-ai-guide-quantum-gold_v001.png`, `public/images/2026-09-06_icon-promo-bonus-quantum-gold_v001.png`, `public/images/CHANGELOG.md` | 🟢 Erledigt (2026-09-06) |      LLM      | Beide PNGs vorhanden (1,4 MB / 1,8 MB — Größe entspricht dem Pipeline-Standard, die ursprüngliche „< 100 KB"-Annahme war falsch, siehe alle Bestandsassets in `public/images/CHANGELOG.md`), Alphakanal per `sharp`-Check verifiziert transparent (Eck-Alpha 0, Zentrum-Alpha 253) |
| L1     | AI/Guide-Integration (6 Stellen)                  | `GuideTriggerButton.tsx`, `DiceCenterStage.tsx`, `CrashStage.tsx`, `CrashTutorial.tsx`, `SlotsCenterStage.tsx`, `BlackjackLeftSidebar.tsx`                      |        🔴 Geplant        |      LLM      | `npm run typecheck` grün, kein `Sparkles`-Import mehr in diesen 6 Dateien                                                                                                                                                                                                          |
| L2     | Bonus/Promo-Integration (3 Stellen)               | `JackpotPulseCard.tsx`, `InteractiveArcadeGrid.tsx`, `VipPersonalRecords.tsx`, `LiveHighrollerTickerBar.tsx` (Jackpot-Zeile)                                    |        🔴 Geplant        |      LLM      | `npm run typecheck` grün, neues Asset an allen 4 Stellen sichtbar eingebunden                                                                                                                                                                                                      |
| L3     | Reassignment Rest-Stellen (nicht AI, nicht Bonus) | `HistoryTableStream.tsx:69`, `BetReceiptModal.tsx:386`                                                                                                          |        🔴 Geplant        |      LLM      | Kein verbliebener `Sparkles`-Import außerhalb `/testing`                                                                                                                                                                                                                           |
| L4     | Verifikation & Doku-Update                        | `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md`, `public/images/CHANGELOG.md`                                                                                          |        🔴 Geplant        |      LLM      | 5-Stufen-DoD grün (§4), §18.3-Zeile aktualisiert                                                                                                                                                                                                                                   |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen (aus §18.3-Inventur, `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md`)

| Ziel-Asset                          | Bedeutung                          | Stellen                                                                                                                                                                                                                                      |
| :---------------------------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon-ai-guide-quantum-gold.png`    | AI / Royale Guide                  | `GuideTriggerButton.tsx:54` (globaler Floating-Button, jede MainLayout-Seite), `DiceCenterStage.tsx:223`, `CrashStage.tsx:133`, `CrashTutorial.tsx:52`, `SlotsCenterStage.tsx:351`, `BlackjackLeftSidebar.tsx:108` (Idle-/Co-Pilot-Hinweise) |
| `icon-promo-bonus-quantum-gold.png` | Bonus / Jackpot / Glücks-Highlight | `JackpotPulseCard.tsx:138` („JACKPOT KNACKEN"), `InteractiveArcadeGrid.tsx:203` (Grid-Header „INTERAKTIVE SPIELHALLE"), `VipPersonalRecords.tsx:42` (Glücks-Index), `LiveHighrollerTickerBar.tsx:97-103` (Ticker-Zeilentyp „jackpot")        |
| Reassignment (kein neues Asset)     | Spiel-Icon Slots                   | `HistoryTableStream.tsx:69` → `Cherry` (Lucide) — konsistent zu den 4 Schwester-Icons derselben Datei (`Rocket`=Crash, `Dices`=Dice, `RotateCcw`=Roulette, `Gamepad2`=Blackjack)                                                             |
| Reassignment (kein neues Asset)     | Prüfcode-Copy                      | `BetReceiptModal.tsx:386` → `Copy` (bereits Standard-Icon für Copy-Aktionen im selben Modal, `:327,381`)                                                                                                                                     |
| Out of Scope                        | Sandbox-Masse                      | `/testing`-Heroes (§16 der Inventur — bewusst nicht auditiert, siehe Nicht-Scope)                                                                                                                                                            |

### 2.2 Systemregeln & Invarianten

- **Design-Tokens** (`.claude/skills/casino-design-system-craft/references/design-laws.md`): Obsidian `#0B0E14`, Gold `#D4AF37`/`#FFD700`-Gradient, Radien 8–20 px, Glow `0 0 16–20px rgba(212,175,55,0.22–0.45)` bei aktiv.
- **Anti-Pattern A2** (`.claude/skills/casino-design-system-craft/references/anti-patterns.md`): „Icons nur mit bewusst gesetzter Größe, Strichstärke und Farbe — oder gar kein Icon."
- **Master-Prompt-Template („Obsidian & Gold Icon Kit"):** Beide Assets teilen Material-/Licht-/Kamera-Rezeptur analog `23_big_win_siegel_plan.md` (poliertes Obsidian + Champagner-Gold-Kanten), Format 1024×1024, Qualität `medium` (Sweet Spot lt. `09_model_pricing_reference.md`), transparenter Hintergrund. Nur der Subjekt-Slot unterscheidet sich: `icon-ai-guide` = stilisierter Kompass-/Diamant-Kern (kein generisches Stern-Funkeln), `icon-promo-bonus` = Funken-/Münzregen-Motiv.
- **Batch-Generierung:** Beide Assets in einem Batch-Call (50 % Rabatt, `09_model_pricing_reference.md` §1.1), gemeinsam mit den übrigen Assets aus [28](28_zap_icon_konsolidierung_plan.md)–[32](32_shieldcheck_icon_konsolidierung_plan.md), sofern zeitgleich in Ausführung.
- **Bild-Integration:** `next/image` mit festen `width`/`height` (Format des Lucide-Icons an der jeweiligen Stelle 1:1 in px übernehmen, z. B. `GuideTriggerButton.tsx:54` aktuell 16px → `<Image width={16} height={16} />`), `alt`-Text sprechend setzen.
- **CHANGELOG-Pflicht:** Jedes neue Asset erhält einen Eintrag in `public/images/CHANGELOG.md` (Muster der bestehenden Einträge übernehmen).

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an `/testing`-Sandbox-Icons (Sparkles-Masse dort bleibt unangetastet, siehe §16 der Inventur).
- Keine Änderung an Wallet-, Bet- oder Settlement-Logik in den betroffenen Dateien — ausschließlich der Icon-Import/-Render wird ersetzt.
- Keine Änderung an `GuideTriggerButton.tsx`-Positionierung, Klick-Handler oder Animation außer dem Austausch des Icon-Elements selbst.
- Kein Anfassen der übrigen 5 §18.3-Cluster (Zap, Trophy, Crown, Star, ShieldCheck) — eigene Pläne [28](28_zap_icon_konsolidierung_plan.md)–[32](32_shieldcheck_icon_konsolidierung_plan.md).
- Keine Änderung an `public/images/CHANGELOG.md`-Einträgen anderer Assets.

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung

- **Ziel:** 2 freigestellte PNG-Assets gemäß Master-Template (§2.2) in `public/images/` ablegen.
- **Schritte:** 1. Prompt-Paar aus dem Master-Template ableiten (Subjekt-Slots wie in §2.2 beschrieben). 2. Batch-Generierung über `gpt-image-2`, `quality: medium`, `1024×1024`. 3. Freistellung/Kompression (< 100 KB je Datei, Alphakanal). 4. Ablage unter den in §1 genannten Dateinamen + Eintrag in `public/images/CHANGELOG.md`.
- **Erwartetes Verhalten:** Beide Motive sind stilistisch identisch zueinander (gleiches Material/Licht) und zu `23_big_win_siegel_plan.md`, aber inhaltlich klar unterscheidbar (AI-Kern vs. Bonus-Funken).
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen pro Asset kein zufriedenstellendes Ergebnis → Stopp, Rückfrage an Jan mit den generierten Zwischenständen statt endlos weiter zu iterieren.

### L1 — AI/Guide-Integration

- **Ziel:** Alle 6 AI/Guide-Stellen (§2.1) rendern `icon-ai-guide-quantum-gold.png` statt `<Sparkles />`.
- **Schritte:** Je Datei den `Sparkles`-Import aus `lucide-react` entfernen (falls dort sonst ungenutzt), `next/image`-Import ergänzen, Render-Stelle 1:1 in bisheriger Größe/Position ersetzen.
- **Erwartetes Verhalten:** Visuell identische Platzierung/Größe wie zuvor, nur neues Bildmotiv statt Lucide-Linie.
- **Abbruchkriterium:** Falls eine der 6 Stellen das Icon animiert (`whileHover`, Spring), Animation auf das `<Image>`-Element migrieren statt zu entfernen — bei Unsicherheit über die Animationssemantik Stopp + Rückfrage statt Animation stillschweigend zu verwerfen.

### L2 — Bonus/Promo-Integration

- **Ziel:** Alle 4 Bonus/Promo-Stellen (§2.1) rendern `icon-promo-bonus-quantum-gold.png`.
- **Schritte:** Wie L1, zusätzlich in `LiveHighrollerTickerBar.tsx:97-103` nur den `jackpot`-Zeilentyp umstellen (die anderen Zeilentypen `whale`/`vip`/`hot` bleiben unverändert, da sie zu anderen §18.3-Clustern gehören).
- **Erwartetes Verhalten:** Bonus-Kontexte visuell konsistent, AI-Kontexte bleiben klar unterscheidbar.
- **Abbruchkriterium:** Falls `LiveHighrollerTickerBar.tsx` den Zeilentyp nicht eindeutig als Prop/Diskriminator führt, Stopp + Rückfrage statt eine Heuristik zu raten.

### L3 — Reassignment Rest-Stellen

- **Ziel:** `HistoryTableStream.tsx:69` → `Cherry`, `BetReceiptModal.tsx:386` → `Copy`, kein `Sparkles`-Import mehr außerhalb `/testing`.
- **Schritte:** Lucide-Import austauschen, Größe/Farbe der Nachbar-Icons in derselben Datei 1:1 übernehmen (kein neuer Stil erfinden).
- **Erwartetes Verhalten:** Slots-Zeile in der History sieht wie die anderen 4 Spiel-Icon-Zeilen aus (gleiche Größe/Farbe); Prüfcode-Copy-Button sieht wie die anderen Copy-Buttons im selben Modal aus.
- **Abbruchkriterium:** Keins vorgesehen — reiner 1:1-Icon-Tausch ohne Ambiguität.

### L4 — Verifikation & Abschluss

- **Ziel:** Alle 5 DoD-Stufen grün, Doku aktuell.
- **Schritte:** 1. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. 2. `git diff` auf unbeabsichtigte Dateien prüfen. 3. `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md` §18.3-Zeile `Sparkles` von „Ja"-Referenz auf „umgesetzt, siehe CHANGELOG" ergänzen (Format wie bestehende Zeilen).
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen in bestehenden Tests (insb. `MainSidebar.test.ts`, das auf Icon-Abwesenheit in der Sidebar prüft — hier nicht betroffen, aber als Referenzmuster für Icon-bezogene Tests relevant).
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss; Root Cause beheben, nicht Test/Lint umgehen.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` — 0 Fehler.
2. **Tests:** `npm test` — grün, insbesondere keine neuen Snapshot-/Render-Fehler in den 9 betroffenen Komponenten.
3. **Lint:** `npm run lint` — 0 Errors.
4. **Build:** `npm run build` — erfolgreich.
5. **Git Diff:** Nur die in §1 gelisteten Dateien + die 2 neuen PNGs + `CHANGELOG.md` + die §18.3-Zeile geändert; keine Fremdänderungen.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Nach grünem DoD (§4) zeigt das LLM Jan die 2 generierten Assets sowie mindestens 2 Screenshots (Guide-Button global, JackpotPulseCard) zur visuellen Freigabe — **kein LLM-Selbsturteil über „sieht gut aus"**, ausschließlich Jans Endabnahme entscheidet über den Übergang zu `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

**Kriterien:** Lerneffekt 30 % · Aufwand 25 % · Risiko 25 % · Wartbarkeit 20 %.

| Option          | Konzept                                                                  |  Score   |
| :-------------- | :----------------------------------------------------------------------- | :------: |
| A               | 1 Reskin für alle 35 Stellen, Bedeutung unverändert                      |   3.55   |
| B               | 1 Leit-Icon AI/Guide + 29 Stellen auf bestehende Lucide-Icons reassigned |   4.03   |
| **C (gewählt)** | 2 Assets im Batch: `ai.guide` (6 Stellen) + `promo.bonus` (4 Stellen)    | **4.28** |

1. Durchlauf ergab C = 4.18 (< 4.2-Gate); nach Schärfung der Batch-Aufwandsbegründung (2. Asset = reines Subjekt-Slot-Delta im selben Call) → 4.28. Tie-Break ggü. B (Risiko 4.0 = 4.0) unentschieden → Score entscheidet. Jan-Freigabe: **Option C**, 2026-09-06.
