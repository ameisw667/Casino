# 31 — Icon-Konsolidierung `Star` (Icon-Familie: Rating / Level, Konfetti ausgenommen)

> **Status:** Executed (2026-09-08, L0–L4; §7-Regenerierungs-Gate + Jan-Gate §5 stehen noch aus) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Star` an den 8 statischen Stellen (§18.3 Zeile 5). Das BigWin-Konfetti (`BigWinOverlay.tsx:203-209,304-311`) ist explizit **out of scope** (siehe Nicht-Scope).
> **Kontext:** `Star` deckt Level-Badge, Spiel-Rating und Tier-Meilenstein ab — inhaltlich verwandt, aber Rating (Produkturteil) und Level/Rang (persönlicher Fortschritt) sollen sichtbar unterscheidbar bleiben. Gewählt: **Option C** (Icon-Familie, 2 Assets, Konfetti ausgenommen) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Freigabe-Basis:** Option C im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.33/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                      | Scope (Dateien)                                                                                                     |   Status   | Zuständigkeit | Verifikation                                                                                                                  |
| :----- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :--------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------- |
| L0     | Asset-Generierung (Batch, 2 Motive)              | `public/images/2026-09-06_icon-star-rating-quantum-gold_v001.png`, `2026-09-06_icon-star-level-quantum-gold_v001.png`, `public/images/CHANGELOG.md` | 🟢 Erledigt (2026-09-06) |      LLM      | Beide PNGs vorhanden (1,4–1,5 MB, Pipeline-Standardgröße), Alphakanal per `sharp`-Check verifiziert transparent, Motive unterscheidbar (facettierter Stern vs. Stern auf Sockel) |
| L1     | Rating-Integration (1 Stelle)                    | `ElevatedGameCard.tsx`                                                                                              | 🟢 Erledigt (2026-09-08) |      LLM      | `npm run typecheck` grün                                                                                                      |
| L2     | Level-Integration (2 Stellen)                    | `MainHeader.tsx`, `VaultVipProgression.tsx`                                                                         | 🟢 Erledigt (2026-09-08) |      LLM      | `npm run typecheck` grün                                                                                                      |
| L3     | Explizite Scope-Grenze dokumentieren (kein Code) | `BigWinOverlay.tsx` (nur Kommentar/Notiz, keine funktionale Änderung)                                               | 🟢 Erledigt (2026-09-08, via §2.1.1) |      LLM      | Kein `Star`-Import in `MainHeader.tsx`/`ElevatedGameCard.tsx`/`VaultVipProgression.tsx` mehr; `BigWinOverlay.tsx` unverändert |
| L4     | Verifikation & Doku-Update                       | `T_FRONTEND/ALLE_ICONS_BUTTONS_ANALYSE.md`, `public/images/CHANGELOG.md`                                              | 🟢 Erledigt (2026-09-08) |      LLM      | 5-Stufen-DoD grün, §18.3-Zeile aktualisiert                                                                                   |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Ziel-Asset                          | Kontexte                                                                                  | Stellen                                                                        |
| :---------------------------------- | :---------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `icon-star-rating-quantum-gold.png` | Spiel-Rating (5-Sterne-Pattern)                                                           | `ElevatedGameCard.tsx:393`                                                     |
| `icon-star-level-quantum-gold.png`  | Level-Badge (Header, global sichtbar), Tier-Meilenstein (Vault, bereits Tier-farbcodiert) | `MainHeader.tsx:77`, `VaultVipProgression.tsx:97`                              |
| **Out of Scope**                    | BigWin-Konfetti (5 animierte Stars, Spring-Physik)                                        | `BigWinOverlay.tsx:203-209,304-311` — bleibt unverändertes CSS/Vektor-Partikel |

### 2.1.1 Scope-Korrekturen & Neubefunde (Execution 2026-09-08)

- **Korrektur zur Plan-Prämisse:** `ElevatedGameCard.tsx` rendert **kein** 5-Sterne-Pattern, sondern einen **einzelnen Stern + numerisches Rating** (`game.rating`, Mono-Font). Teil-Stern-Logik existiert nicht — das L1-Abbruchkriterium (CSS-Clipping) ist nicht relevant. Zeile ist zudem auf `:381` gedriftet (Plan sagte `:393`).
- **Neubefund `MainHeader.tsx:95` (live):** mobiler Level-Star neben `LVL {level}` (`hsl(var(--primary))`) — gleicher Level-Kontext wie `:77`, migiert gegen `star-level`.
- **Neubefunde live (Level-/Rank-Kontexte → `star-level`):** `VaultTierShowcase.tsx:27` (Header „VIP TIERS & BENEFITS", 16px), `LevelProgress.tsx:60` (Level-Badge < 50, 20px, `currentColor`), `PlayerProfileModal.tsx:228` („{RANK} PERKS"-Header, 14px, `currentColor`), `RankBenefitsModal.tsx:127` (Wasserzeichen-Stern 80/120px, `opacity 0.05`).
- **Neubefunde live (Rating-Kontexte → `star-rating`):** `HeroHeadlineColumn.tsx:293` (5×9px-Reihe im Trustpilot-Badge des Live-Hero), `HeroSpotlight.tsx:270` + `BentoTile.tsx:274` (`/games-2`-Motion-Lab, Rating + Zahl).
- **Bewusste Nicht-Migration (dokumentiert statt stillschweigend):** `HeroSection.tsx:233` + `HeroSectionV2.tsx:470` (Dead-Render-Pfade, nur via `index.ts` exportiert) verwenden grüne Trustpilot-Brand-Sterne (`#00b67a`). Ein Tausch gegen das Gold-Asset würde die Trustpilot-Bildsprache verfälschen — die Glyphen bleiben, die Lücke ist Absicht.
- **Technik-Notiz:** Alle Stellen mit dynamischer Farbe (schwarz auf Gold-Badge, Tier-Farben, `hsl(var(--primary))`, `currentColor`) sind als `<span>` mit CSS-`mask` (PNG als Maske, `backgroundColor` als Farbe) umgesetzt — das erhält die komplette Farbcodierungs-Logik 1:1 (L2-Abbruchkriterium nicht ausgelöst). Gold-auf-Dunkel-Stellen nutzen reguläres `next/image`.
- **Out of Scope unverändert:** BigWin-Konfetti, `/v2` (`V2Hero`), Canvas-Partikel-Typen (`Star` in crash/crash-multiplayer), Slot-Symbol-Kommentare.

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- Zwei Subjekt-Slots: `star-rating` = klassischer 5-Zacken-Stern mit Facetten-Schliff (Produktbewertung), `star-level` = Stern mit Rang-Ring/Sockel (Fortschritt/Status) — bewusst unterscheidbar, da beide Kontexte auf verschiedenen Seiten ohne direkten Vergleich erscheinen (Pre-Mortem, §6).
- `VaultVipProgression.tsx:97` verwendet den Star aktuell bereits Tier-farbcodiert (`Tier-Farbe` statt festem Gold) — diese Farbcodierung bleibt erhalten, nur das Basis-Icon wird getauscht (Bild statt Lucide-Linie, Farbe weiterhin per CSS-Filter/Overlay steuerbar oder als Duotone-Variante im Asset selbst, je nachdem was technisch sauberer ist — bei Unsicherheit siehe Abbruchkriterium L2).
- `MainHeader.tsx:77` ist global auf jeder MainLayout-Seite sichtbar (IconBadge-Hintergrund, `IconBadge.tsx:13-30`) — Icon-Größe 12px exakt beibehalten.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- **Kein Antasten von `BigWinOverlay.tsx:203-209,304-311`** — weder Icon-Ersatz noch Animations-Änderung. Der Ausschluss ist der zentrale Wartbarkeits-/Risiko-Hebel dieser Option (§6) und darf nicht stillschweigend erweitert werden.
- Keine Änderung an der Tier-Farbcodierungs-Logik in `VaultVipProgression.tsx` — nur das Basis-Icon wird getauscht.
- Keine Änderung an der Rating-Berechnung in `ElevatedGameCard.tsx` — nur der Render der Sterne.
- Kein Anfassen der übrigen 5 §18.3-Cluster.

---

## 3 — Detaillierte Meilensteine

### L0 — Asset-Generierung

- **Ziel:** 2 freigestellte, klar unterscheidbare PNGs gemäß Master-Template.
- **Schritte:** 2 Prompts (Subjekt-Slots §2.2) im selben Batch-Call wie [27](27_sparkles_icon_konsolidierung_plan.md)–[30](30_crown_icon_konsolidierung_plan.md), [32](32_shieldcheck_icon_konsolidierung_plan.md) → Freistellung → Ablage + CHANGELOG-Einträge.
- **Erwartetes Verhalten:** Rating- und Level-Stern sind unterscheidbar, aber erkennbar aus derselben Icon-Familie.
- **Abbruchkriterium:** Nach 2 Prompt-Iterationen pro Asset kein zufriedenstellendes, klar unterscheidbares Ergebnis → Stopp, Rückfrage.

### L1 — Rating-Integration

- **Ziel:** `ElevatedGameCard.tsx:393` zeigt `icon-star-rating` im 5-Sterne-Pattern (voll/leer-Zustände beachten, falls das Rating Teil-Sterne unterstützt).
- **Schritte:** Lucide-Import ersetzen, prüfen ob aktuell Halb-Stern-Logik existiert (`½`-Glyphen-Cluster aus §18.2 ist ein separates Thema, hier nur die Ganzzahl-Sterne des Ratings selbst).
- **Erwartetes Verhalten:** Rating-Reihe visuell hochwertiger, Funktion unverändert.
- **Abbruchkriterium:** Falls das Rating Teil-Sterne (z. B. 4,5/5) über CSS-Clipping des Lucide-Icons rendert, diese Technik für das neue Bild-Asset nachbilden (z. B. `clip-path` auf das `<Image>`) statt die Teil-Darstellung ersatzlos zu vereinfachen — bei technischer Unsicherheit Stopp + Rückfrage.

### L2 — Level-Integration

- **Ziel:** `MainHeader.tsx:77` und `VaultVipProgression.tsx:97` zeigen `icon-star-level`.
- **Schritte:** Reskin, Tier-Farbcodierung in `VaultVipProgression.tsx` erhalten (§2.2).
- **Erwartetes Verhalten:** Level/Rang-Kontexte visuell konsistent und von Rating unterscheidbar.
- **Abbruchkriterium:** Falls die Tier-Farbcodierung nicht sauber auf ein Bild-Asset übertragbar ist (z. B. weil sie aktuell `fill`-Farbe eines SVG-Pfads nutzt), Stopp + Rückfrage statt Farbcodierung ersatzlos zu entfernen.

### L3 — Scope-Grenze dokumentieren

- **Ziel:** Sichtbar machen, dass `BigWinOverlay.tsx` bewusst ausgenommen ist (keine funktionale Änderung, nur Nachvollziehbarkeit).
- **Schritte:** Keine Code-Änderung an `BigWinOverlay.tsx`. In der §18.3-Zeile (L4) explizit vermerken: „Konfetti bewusst ausgenommen, siehe [31] §2.1".
- **Erwartetes Verhalten:** Zukünftige Bearbeiter verstehen, dass die Lücke Absicht ist, kein vergessener Rest.
- **Abbruchkriterium:** Keins.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, Doku aktuell.
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, §18.3-Zeile `Star` aktualisieren (inkl. Scope-Hinweis aus L3).
- **Erwartetes Verhalten:** Grüner Build, keine Regressionen an Header/Vault/Games-Seiten.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün.
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien (L3 ohne Code-Diff) + 2 neue PNGs + `CHANGELOG.md` + §18.3-Zeile.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots Header-Level-Badge, `/games`-Rating und Vault-Tier-Meilenstein zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                      |  Score   |
| :-------------- | :----------------------------------------------------------- | :------: |
| A               | 1 Reskin für alle 13 Stellen inkl. BigWin-Konfetti           |   3.63   |
| B               | 1 Leit-Icon Rating/Level (8 Stellen), Konfetti ausgenommen   |   4.38   |
| **C (gewählt)** | 2 Assets: `star-rating` + `star-level`, Konfetti ausgenommen | **4.33** |

Tie-Break B vs. C (Abstand 0.05 ≤ 0.3) hätte mechanisch B bestätigt (Risiko 4.6 > 4.4); Jan hat sich bewusst für **Option C** entschieden (Rating von Rang visuell unterscheidbar), 2026-09-06.

---

## 7 — Visuelle Nachprüfung & Prompt-Revision (2026-09-06)

> **Status:** 🟡 Vorschlag — wartet auf Jans Freigabe zur Regenerierung. Keine API-Kosten ausgelöst, L0-Status in §1 bleibt unverändert auf „Erledigt", bis eine Regenerierung stattfindet.
> **Anlass:** Sichtprüfung gegen die reale Ziel-Einsatzgröße (`star-rating` erscheint 5× in einer 8–9px-Reihe, `star-level` als 12px-Header-Badge global sichtbar) — beide aktuellen Ergebnisse zu detailreich für diese Kleinstgrößen.

| Asset | Befund | Alt-Prompt (aktuell generiert) | Neu-Prompt (Vorschlag) |
| :--- | :--- | :--- | :--- |
| `icon-star-rating-quantum-gold` | Stark facettiert (viele interne Schnittlinien) — verschwimmt bei 8–9px in einer 5er-Reihe zu diffusem Glitzerfleck statt klarer Sternform. | „a single faceted five-pointed star with sharp gem-cut diamond facets, symbolizing a product quality rating, jewel-like precision" | „a single five-pointed star with a bold thick gold outline and only 3-4 large flat facet planes (no fine internal facet lines), symbolizing a product quality rating, high-contrast simple silhouette optimized for repeating in a small row" |
| `icon-star-level-quantum-gold` | Sockel ist detailliert marmoriert/gestuft — wird bei der global sichtbaren 12px-Header-Größe (`MainHeader.tsx:77`) zu Matsch, wodurch das Unterscheidungsmerkmal zu `star-rating` verloren geht. | „a single five-pointed star mounted upright on a small circular pedestal ring base, symbolizing rank progression and level status" | „a single five-pointed star with a bold thick gold outline mounted flush onto one simple thick gold ring base, no stepped pedestal, no marbled texture, symbolizing rank progression and level status, high-contrast silhouette clearly showing star-plus-ring shape even at very small scale" |

**Nach Freigabe:** `icon-consolidation-batch-02.manifest.json` mit den Neu-Prompts aktualisieren, L0-Status in §1 auf „🟡 Regeneriert (2026-09-XX)" ändern, dann `npm run design:generate --dry-run` → nach Sichtprüfung `--yes`.
