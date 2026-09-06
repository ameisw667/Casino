# 30 — Icon-Konsolidierung `Crown` (Icon-Familie: VIP / Jackpot + Auth-Retirement)

> **Status:** Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich `Crown` (14 Render-Stellen, §18.3 Zeile 4) plus das damit verknüpfte `CrownEmblem`-Duplikat (§18.4). Keine anderen 18.3-Icons.
> **Kontext:** `Crown` trägt zwei Bedeutungsgruppen (VIP, Jackpot/Sonstige) und überschneidet sich mit dem 2× duplizierten `CrownEmblem`-Inline-SVG in Auth. Gewählt: **Option C** (Icon-Familie, 2 eigenständige Assets, kein Cross-Cluster-Reuse aus Sparkles) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (Auth-Seiten sind betroffen, aber ausschließlich als Icon-Austausch — keine Änderung an Auth-Logik/Session-Handling)
> **Freigabe-Basis:** Option C im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.22/5, §6). Marken-/Pipeline-Kontext siehe [`27_sparkles_icon_konsolidierung_plan.md#22`](27_sparkles_icon_konsolidierung_plan.md).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                     | Scope (Dateien)                                                                                                      |   Status   | Zuständigkeit | Verifikation                                               |
| :----- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :--------: | :-----------: | :--------------------------------------------------------- |
| L0     | Asset-Generierung (Batch, 2 Motive)             | `public/images/icon-crown-vip-quantum-gold.png`, `icon-crown-jackpot-quantum-gold.png`, `public/images/CHANGELOG.md` | 🔴 Geplant |      LLM      | Beide PNGs vorhanden, Alphakanal sauber, < 100 KB je Datei |
| L1     | VIP-Integration (3 Stellen)                     | `VaultVipProgression.tsx`, `VaultTierShowcase.tsx`, `VipProgressTeaser.tsx`                                          | 🔴 Geplant |      LLM      | `npm run typecheck` grün                                   |
| L2     | Jackpot/Sonstige-Integration (4 Stellen)        | `JackpotPulseCard.tsx`, `GuideMessageList.tsx`, `VipLiveStreamRail.tsx`, `DailyTournamentTeaser.tsx`                 | 🔴 Geplant |      LLM      | `npm run typecheck` grün                                   |
| L3     | `CrownEmblem`-Retirement (Auth, §18.4-Duplikat) | `AuthBrandMarks.tsx`, `reset-password/page.tsx`                                                                      | 🔴 Geplant |      LLM      | Kein `CrownEmblem`-Inline-SVG mehr in beiden Dateien       |
| L4     | Verifikation & Doku-Update                      | `worldmap/ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.3 + §18.4), `public/images/CHANGELOG.md`                               | 🔴 Geplant |      LLM      | 5-Stufen-DoD grün, beide Zeilen aktualisiert               |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen

| Ziel-Asset                                               | Kontexte                                                                                                                          | Stellen                                                                                                                                                                                   |
| :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `icon-crown-vip-quantum-gold.png`                        | VIP-Progression-Header, Tier-Showcase-Detail, „EXKLUSIVER VIP CLUB"-Header, **+ Auth-Brand-Badge (Retirement von `CrownEmblem`)** | `VaultVipProgression.tsx:36`, `VaultTierShowcase.tsx:243`, `VipProgressTeaser.tsx:99`, `AuthBrandMarks.tsx:33-71` (gerendert in `AuthCardHeader.tsx:25`), `reset-password/page.tsx:14-52` |
| `icon-crown-jackpot-quantum-gold.png`                    | Jackpot-Hero-Badge, Guide-Quick-Action, Highroller-Ticker (Zeilentyp „whale"), Podiums-„PLATZ 1"                                  | `JackpotPulseCard.tsx:31`, `GuideMessageList.tsx` (Quick-Action „Crown"), `VipLiveStreamRail.tsx:315`, `DailyTournamentTeaser.tsx:187`                                                    |
| Toter Export (nur dokumentiert, kein Reassignment nötig) | `Medal`-Icon in `GlobalLeaderboard.tsx` — nirgends importiert (§16-Befund)                                                        | Keine Aktion in diesem Plan; separate Entscheidung „löschen statt ersetzen" bleibt offen, siehe Nicht-Scope                                                                               |

### 2.2 Systemregeln & Invarianten

- Design-Tokens, Anti-Pattern A2, Master-Prompt-Template, Batch-Vorgabe: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](27_sparkles_icon_konsolidierung_plan.md).
- Zwei Subjekt-Slots: `crown-vip` = geschlossene, edle Krone mit Diamant-Spitze (Status/Zugehörigkeit), `crown-jackpot` = offene, strahlende Krone mit Funken-Aura (Gewinn-Moment) — bewusst unterscheidbar von `crown-vip`, damit die ursprüngliche §18.3-Konfusion nicht in neuer Form (zwei ähnliche Kronen) zurückkehrt.
- `CrownEmblem` (`AuthBrandMarks.tsx:33-71`) ist aktuell ein 34×34-Inline-SVG mit Gold-Gradient + 3 Akzent-Kreisen, gerendert in einem 64×64-Badge mit Glow (`AuthCardHeader.tsx:25`). Das neue `crown-vip`-Asset ersetzt das Inline-SVG **innerhalb** dieses bestehenden 64×64-Badge-Containers — Glow/Container bleiben unverändert, nur der SVG-Inhalt wird durch `<Image>` ersetzt.
- `reset-password/page.tsx:14-52` enthält ein **identisches Duplikat** von `AuthBrandMarks.tsx` — beide Stellen müssen synchron auf `crown-vip` umgestellt werden, sonst bleibt das Duplikat als Icon-Inkonsistenz bestehen (nur als anderes Asset).

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Kein Löschen von `Medal`/`GlobalLeaderboard.tsx` in diesem Plan — das ist eine separate Entscheidung (§16-Dead-Export-Befund), hier nur dokumentiert.
- Keine Konsolidierung von `AuthBrandMarks.tsx` und `reset-password/page.tsx` in eine gemeinsame Komponente — nur der SVG-Inhalt wird 1:1 an beiden Stellen ausgetauscht, kein Refactoring der Duplikat-Struktur selbst (wäre ein separater, größerer Schnitt).
- Keine Änderung an Auth-Flow, Session-Handling oder Passwort-Reset-Logik in den betroffenen Dateien.
- Keine Wiederverwertung des `promo.bonus`-Assets aus [27](27_sparkles_icon_konsolidierung_plan.md) für Jackpot-Kontexte — Jan hat explizit Option C (eigenständiges Jackpot-Asset) gewählt, nicht Option B (Reuse).
- Kein Anfassen der übrigen 5 §18.3-Cluster.

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

### L3 — `CrownEmblem`-Retirement

- **Ziel:** Beide Auth-Stellen (`AuthBrandMarks.tsx`, `reset-password/page.tsx`) zeigen `icon-crown-vip` statt des Inline-SVGs.
- **Schritte:** Inline-SVG-Definition entfernen, `<Image>` innerhalb des bestehenden 64×64-Glow-Containers einsetzen (§2.2), an **beiden** Dateien synchron.
- **Erwartetes Verhalten:** Sign-in/Sign-up/Reset-Password zeigen dieselbe Krone wie VIP-Kontexte im restlichen Produkt — Auth wirkt wie Teil derselben Marke statt eigenes Emblem.
- **Abbruchkriterium:** Falls der Glow-Effekt (`box-shadow`/`filter`) am Container hängt statt am SVG selbst, Glow unverändert lassen und nur den SVG-Inhalt tauschen — bei Unsicherheit Stopp + Rückfrage statt den Glow versehentlich zu entfernen.

### L4 — Verifikation & Abschluss

- **Ziel:** DoD grün, Doku aktuell (§18.3 UND §18.4).
- **Schritte:** `npm run typecheck && npm run lint && npm test && npm run build`, `git diff`-Review, §18.3-Zeile `Crown` **und** §18.4-Zeile `CrownEmblem` aktualisieren.
- **Erwartetes Verhalten:** Grüner Build, keine Auth-Test-Regressionen.
- **Abbruchkriterium:** Jeder rote DoD-Punkt stoppt den Abschluss.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. Typecheck: `npm run typecheck` — 0 Fehler.
2. Tests: `npm test` — grün, insbesondere Auth-nahe Tests (Sign-in/Sign-up/Reset-Password rendern weiterhin fehlerfrei).
3. Lint: `npm run lint` — 0 Errors.
4. Build: `npm run build` — erfolgreich.
5. Git Diff: Nur die in §1 gelisteten Dateien + 2 neue PNGs + `CHANGELOG.md` + §18.3-/§18.4-Zeilen.

---

## 5 — Visuelle Endabnahme (Jan-Gate)

Screenshots VIP-Progression, Jackpot-Hero, Sign-in **und** Reset-Password (Duplikat-Stelle) zur Freigabe vorlegen. Kein LLM-Selbsturteil — Jans Endabnahme entscheidet über `Executed`.

---

## 6 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option          | Konzept                                                                 |  Score   |
| :-------------- | :---------------------------------------------------------------------- | :------: |
| A               | 1 Reskin für alle 14 Stellen                                            |   3.62   |
| B               | Leit-Icon VIP + Jackpot-Reuse aus Sparkles-Cluster                      |   4.26   |
| **C (gewählt)** | 2 eigenständige Assets: `crown-vip` + `crown-jackpot` + Auth-Retirement | **4.22** |

Tie-Break B vs. C (Abstand 0.04 ≤ 0.3) hätte mechanisch B favorisiert (Risiko 4.2 > 3.9); Jan hat sich bewusst für **Option C** entschieden (eigenständige Jackpot-Bildsprache statt Wiederverwertung), 2026-09-06.
