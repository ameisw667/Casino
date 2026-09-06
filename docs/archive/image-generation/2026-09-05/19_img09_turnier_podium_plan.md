# 19 — IMG-09: Aktuelles Turnier-Podium aufwerten (3D-Turnierpokal & 2.5D-Podeste)

> **Status:** Umgesetzt (lokal verifiziert) · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Visuelle Veredelung des Bento TournamentPodiumStrip auf der Startseite (`/`) durch ein 3D-Turnierpokal-Asset im Titelblock und metallisch gestaffelte 2.5D-Obsidian-Plinthen (Gold / Silber / Bronze) für die Plätze 1, 2 und 3.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05. Typecheck, 1.528 Tests, Lint, Build und scoped Diff-Check erfolgreich.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                        |    Status    | Nächster Schritt                                                                                       | Zuständigkeit |
| :----: | :------------------------------------------------- | :----------: | :----------------------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Asset-Bereitstellung: `trophy-tournament-gold.png` | 🟢 Umgesetzt | Asset liegt lokal vor und wird via `next/image` ausgeliefert                                           |      LLM      |
| **L1** | Titelblock-Veredelung in `BentoStripCells.tsx`     | 🟢 Umgesetzt | Trophäe mit 48/32-px-Responsivgröße neben dem Turniertext integriert                                   |      LLM      |
| **L2** | 2.5D-Podest-Staffelung (Gold / Silber / Bronze)    | 🟢 Umgesetzt | Gold-, Silber- und Bronze-Plinthen mit differenzierten Verläufen, Kanten und Schatten                  |      LLM      |
| **L3** | Leerstufen-Harmonisierung & Avatar-Vorbereitung    | 🟢 Umgesetzt | Obsidian-Leerstufen bleiben sauber und sind für den lokalen IMG-06-Resolver vorbereitet                |      LLM      |
| **L4** | Responsiv-Check (390 / 768 / 1440 px) & Typecheck  | 🟢 Umgesetzt | Typecheck, 1.528 Tests, Lint, Build und scoped Diff-Check erfolgreich; Sichtprüfung folgt im Gesamt-QA |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Beseitigung des starken visuellen Qualitätsgefälles auf der Startseite (`/`): Während der direkt darunterliegende VIP-Strip mit plastischen 3D-Medaillons glänzt, wirkt das tägliche 10.000 $ Turnier bisher wie ein flacher Wireframe. Das Podium wird in ein dreidimensionales Siegerpodest mit Gold-Trophäe und metallisch differenzierten Sockeln verwandelt.

### 2.2 In Scope

- **1 neues Bild-Asset (`public/images/trophy-tournament-gold.png`):**
  - Master 1024×1024 PNG mit Alphatransparenz, Web-optimiert (unter 80 KB).
  - _Motiv:_ Majestätischer Casino-Royale-Turnierpokal aus poliertem Gold mit dunklem Obsidian-Sockel und feinen Lichtreflexionen.
- **Titelblock-Integration ([`BentoStripCells.tsx`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoStripCells.tsx#L68-L96)):**
  - Platzierung des Pokals (48×48 px Desktop, 32×32 px Mobil) links neben dem Textblock `$10,000 Daily Race / Tägliches Turnier`.
- **2.5D-Podest-Hierarchie ([`PodiumColumn`](file:///v:/VibeCoding/Casino/src/components/home/bento/BentoStripCells.tsx#L145-L240)):**
  - **Platz 1 (Mitte - Champion):** Erhöhter Obsidian-Block mit warmem Goldrand (`#D4AF37`), zarter Gold-Aura (`box-shadow: 0 0 35px rgba(212,175,55,0.2)`) und dominanterer Krone.
  - **Platz 2 (Links - Silber):** Gestaffelter Sockel mit kühler Silberkante (`#C0C0C0`) und dezentem Schimmer.
  - **Platz 3 (Rechts - Bronze):** Kompakterer Sockel mit warmer Bronze-/Kupferkante (`#CD7F32`).
- **Harmonische Leerstufen:**
  - Ist noch kein Spieler platziert (_"Noch offen"_), zeigen die Ringe keine leeren grauen Kreise mehr, sondern ein edles, abgedunkeltes Obsidian-Siegel mit Platzierungs-Insigne.

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Keine Änderungen an der Turnierlogik, den Quoten oder den Preisgeldern ($5.000, $3.000, $2.000 in [`DailyTournamentTeaser.tsx`](file:///v:/VibeCoding/Casino/src/components/home/DailyTournamentTeaser.tsx)).
- Keine Änderungen am Hook [`useDailyRaceStandings.ts`](file:///v:/VibeCoding/Casino/src/hooks/useDailyRaceStandings.ts).
- Kein schwerer WebGL-3D-Canvas (reine 2.5D-Layering- und CSS-Plinthen-Technik für 60 FPS auf allen Mobilgeräten).

---

## 3 — Technische Spezifikation

### 3.1 Styling-Hierarchie der Podestplätze

```css
/* Platz 1: Champion */
background: linear-gradient(180deg, rgba(212, 175, 55, 0.12) 0%, rgba(11, 14, 20, 0.95) 100%);
border: 1px solid rgba(212, 175, 55, 0.45);
box-shadow:
  0 12px 36px rgba(0, 0, 0, 0.8),
  0 0 25px rgba(212, 175, 55, 0.15);
transform: translateY(-8px); /* Erhöhte optische Bühnenposition */

/* Platz 2: Silber */
background: linear-gradient(180deg, rgba(192, 192, 192, 0.08) 0%, rgba(11, 14, 20, 0.95) 100%);
border: 1px solid rgba(192, 192, 192, 0.25);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);

/* Platz 3: Bronze */
background: linear-gradient(180deg, rgba(205, 127, 50, 0.08) 0%, rgba(11, 14, 20, 0.95) 100%);
border: 1px solid rgba(205, 127, 50, 0.25);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
```

---

## 4 — Meilensteine im Detail

### L0: Asset-Bereitstellung

- **Ziel:** Erstellung und Ablage von `public/images/trophy-tournament-gold.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Glatte Konturen, transparenter Hintergrund, perfekter Kontrast auf `#0B0E14`.

### L1: Titelblock-Veredelung

- **Ziel:** Integration des Pokals in `TournamentPodiumStrip`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Bild lädt via `next/image`, bricht auf Mobilgeräten sauber um und überdeckt keine Texte.

### L2: 2.5D-Podest-Staffelung

- **Ziel:** Umbau von `PodiumColumn` mit metallisch abgestuften Plinthen.
- **Zuständigkeit:** LLM.
- **Kriterien:** Platz 1 hebt sich als klarer Champion ab; Ränge 2 und 3 sind in Silber und Bronze unverwechselbar.

### L3: Leerstufen & Avatar-Vorbereitung

- **Ziel:** Attraktives Styling für den unbesetzten Zustand (_"Noch offen"_).
- **Zuständigkeit:** LLM.
- **Kriterien:** Keine nackten grauen Ränder mehr; nahtlose Vorbereitung für den Einbau des IMG-06-Resolvers.

### L4: Verifikation & Abschluss

- **Ziel:** Responsive Abnahme und Build-Freigabe.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, kein Overflow auf 390 px (iPhone-Breite).

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reines visuelles Komponenten-Upgrade in `BentoStripCells.tsx`; keine Logik-Mutationen.
- [x] **LLM-Zuständigkeit:** Alle Meilensteine L0–L4 liegen vollständig beim LLM.
- [x] **Kein Performance-Drop:** 2.5D-CSS statt WebGL erhält 100 % der Lade- und Renderperformance.
- [x] **Verknüpfung:** Verlinkt in [`00_bildgenerierung_uebersicht_jan.md`](../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-09`](../T_IMAGE/02_bildgenerierung_top10_details.md#img-09).
