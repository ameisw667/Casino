# 29 — Icon-Konsolidierung `Trophy` (Icon-Familie: Win / Turnier / Record)

> **Status:** In Execution (L0 erledigt, L1–L4 offen) · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Trophy` (22 Render-Stellen, §18.3 Zeile 3). Keine anderen 18.3-Icons.
> **Kontext:** `Trophy` deckt 7 echte Kontexte ab — laut Inventur der stärkste einzelne „kinderhaft"-Treiber. Gewählt: **Option C** (Icon-Familie, 3 Assets) aus dem Option-Gate vom 2026-09-06 (§6) — exakt der in §18.3 selbst formulierte Vorschlag.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Freigabe-Basis:** Option C im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.30/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                          | Scope (Dateien)                                                                                                                                                                                                  |          Status          | Zuständigkeit | Verifikation                                                                                                        |
| :----- | :------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------: | :-----------: | :------------------------------------------------------------------------------------------------------------------ |
| L0     | Asset-Generierung (Batch, 3 Motive)                                  | `public/images/2026-09-06_icon-trophy-win-quantum-gold_v001.png`, `2026-09-06_icon-trophy-tournament-quantum-gold_v001.png`, `2026-09-06_icon-trophy-record-quantum-gold_v001.png`, `public/images/CHANGELOG.md` | 🟢 Erledigt (2026-09-06) |      LLM      | Alle 3 PNGs vorhanden (1,4–1,5 MB, Pipeline-Standardgröße), Alphakanal je per `sharp`-Check verifiziert transparent |
| L1     | Win-Integration (3 Stellen)                                          | `ToastContainer.tsx`, `ProgressiveJackpotSection.tsx`, `LiveActivityFeedV2.tsx`                                                                                                                                  |        🔴 Geplant        |      LLM      | `npm run typecheck` grün                                                                                            |
| L2     | Turnier-Integration (1 Stelle)                                       | `DailyTournamentTeaser.tsx`                                                                                                                                                                                      |        🔴 Geplant        |      LLM      | `npm run typecheck` grün                                                                                            |
| L3     | Record/Rang-Integration (3 Stellen) + Achievements-Header-Entfernung | `VipPersonalRecords.tsx`, `MobileNav.tsx`, `FavoriteGameCard.tsx`, `VaultAchievements.tsx`                                                                                                                       |        🔴 Geplant        |      LLM      | Kein `Trophy`-Import mehr in diesen 4 Dateien                                                                       |
| L4     | Verifikation & Doku-Update                                           | `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md`, `public/images/CHANGELOG.md`                                                                                                                                           |        🔴 Geplant        |      LLM      | 5-Stufen-DoD grün, §18.3-Zeile aktualisiert                                                                         |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Ziel-Asset                                     | Kontexte                                                   | Stellen                                                                                                                                                                                                               |
| :--------------------------------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon-trophy-win-quantum-gold.png`             | Win-Toast, Jackpot-Section-Header, Feed-High-Roller-Payout | `ToastContainer.tsx:51-68`, `ProgressiveJackpotSection.tsx:89`, `LiveActivityFeedV2.tsx:248,375`                                                                                                                      |
| `icon-trophy-tournament-quantum-gold.png`      | Daily-Tournament-Header                                    | `DailyTournamentTeaser.tsx:77`                                                                                                                                                                                        |
| `icon-trophy-record-quantum-gold.png`          | Stats-Records, Leaderboard-Mobile-Nav, Favorite-Game-Donut | `VipPersonalRecords.tsx:19`, `MobileNav.tsx:19`, `FavoriteGameCard.tsx:97`                                                                                                                                            |
| Entfernen (Semantik existiert bereits als PNG) | Achievements-Sektions-Header + Modal-Header                | `VaultAchievements.tsx:158,228` — die 9 3D-PNG-Achievement-Kacheln (`achievements-config.ts:60-168`) tragen die Trophy-Semantik bereits, das zusätzliche Lucide-`Trophy` im Header ist redundant (§18.4-Doppelbefund) |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- Drei Subjekt-Slots, stilistisch identisch (gleiches Material/Licht), inhaltlich unterscheidbar: `trophy-win` = klassischer Pokal-Kern (Gewinn-Moment), `trophy-tournament` = Pokal mit Lorbeer-/Rang-Kranz (Wettbewerb), `trophy-record` = Pokal mit Stern-/Medaillen-Detail (persönlicher Bestwert).
- `MobileNav.tsx:19` hat aktuell **keinen verifizierten Crop** (§17 Punkt 4 der Inventur, „Nav-Button nicht ansprechbar") — vor der Integration den Ist-Zustand am echten Mobile-Viewport (390px) gegenprüfen, nicht blind vom Desktop-Icon übernehmen.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Änderung an den 9 3D-PNG-Achievement-Kacheln selbst (`achievements-config.ts`) — nur das redundante Lucide-`Trophy` im Sektions-/Modal-Header entfällt.
- Keine Änderung an Turnier-/Leaderboard-Berechnungslogik — ausschließlich Icon-Austausch.
- Keine Zusammenlegung von `trophy-tournament` in `trophy-win` (wäre Option B) — Jan hat explizit C gewählt.
- Kein Anfassen der übrigen 5 §18.3-Cluster.

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung

- **Ziel:** 3 freigestellte PNGs gemäß Master-Template.
- **Schritte:** 3 Prompts aus dem Master-Template (Subjekt-Slots §2.2) im selben Batch-Call wie [27](27_sparkles_icon_konsolidierung_plan.md), [28](28_zap_icon_konsolidierung_plan.md), [30](30_crown_icon_konsolidierung_plan.md)–[32](32_shieldcheck_icon_konsolidierung_plan.md) generieren → Freistellung → Ablage + CHANGELOG-Einträge.
- **Erwartetes Verhalten:** 3 klar unterscheidbare, aber stilistisch zusammengehörige Pokal-Varianten.
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen pro Asset kein zufriedenstellendes Ergebnis → Stopp, Rückfrage.

### L1 — Win-Integration

- **Ziel:** `ToastContainer.tsx`, `ProgressiveJackpotSection.tsx`, `LiveActivityFeedV2.tsx` zeigen `icon-trophy-win`.
- **Schritte:** Lucide-Import ersetzen, Größe 1:1 übernehmen (Toast 20px, Jackpot-Header 14px, Feed-Payout-Spalte kontextgleich).
- **Erwartetes Verhalten:** Win-Momente visuell konsistent über Toast/Jackpot/Feed.
- **Abbruchkriterium:** Keins.

### L2 — Turnier-Integration

- **Ziel:** `DailyTournamentTeaser.tsx:77` zeigt `icon-trophy-tournament`.
- **Schritte:** Wie L1.
- **Erwartetes Verhalten:** Turnier-Header visuell von Win-Toast unterscheidbar.
- **Abbruchkriterium:** Keins.

### L3 — Record/Rang-Integration + Achievements-Header-Entfernung

- **Ziel:** `VipPersonalRecords.tsx`, `MobileNav.tsx`, `FavoriteGameCard.tsx` zeigen `icon-trophy-record`; `VaultAchievements.tsx:158,228` verliert das redundante Lucide-`Trophy`.
- **Schritte:** Reskin an den 3 Record-Stellen; in `VaultAchievements.tsx` das `Trophy`-Element im Header entfernen (Text-Label „ACHIEVEMENTS" bleibt bestehen, die 9 3D-PNG-Kacheln bleiben unverändert).
- **Erwartetes Verhalten:** Record-Kontexte einheitlich, Achievements-Header verliert die doppelte Trophy-Semantik.
- **Abbruchkriterium:** `MobileNav.tsx:19` zuerst am 390px-Viewport visuell verifizieren (§2.2) — bei Abweichung vom angenommenen Ist-Zustand Stopp + Rückfrage statt zu raten.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, Doku aktuell.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, §18.3-Zeile `Trophy` aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen (insb. `MobileNav`-bezogene Tests, falls vorhanden).
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien + 3 neue PNGs + `CHANGELOG.md` + §18.3-Zeile.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots aller 3 Kontext-Gruppen (Win-Toast, Turnier-Header, Vault-Records/Mobile-Nav) inkl. 390px-Mobile-Ansicht zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                 |  Score   |
| :-------------- | :---------------------------------------------------------------------- | :------: |
| A               | 1 Reskin für alle 22 Stellen                                            |   3.50   |
| B               | 1 Leit-Icon „Win" + Turnier mitgemappt + Record-Reassignment            |   3.86   |
| **C (gewählt)** | 3 Assets im Batch: `trophy-win` / `trophy-tournament` / `trophy-record` | **4.30** |

Kein Tie-Break nötig (Abstand C–B = 0.44 > 0.3). Jan-Freigabe: **Option C**, 2026-09-06.
