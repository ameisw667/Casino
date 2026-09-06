# 15a — Referenz-Inventur R2 (Teil-Ausführung zu [15_skill_planung_design_system.md](15_skill_planung_design_system.md))

> **Status:** 🟡 Teil-Inventur (read-only) · **Stand:** 2026-09-06 · **Methode:** Grep/Read über `src/`, keine Code-Änderung
> **Provisorisch-Vermerk:** Alle Werte sind vor Jans laufendem Restyle (R1) erhoben — nach R1-Freeze sind die Flächen-/Farbwerte gegen die dann finale Seite zu verifizieren. Dateipfade gelten als stabil.

---

## 1 — Kernergebnis: Der „dunkelblaue Kasten" ist identifiziert

Der von Jan abgelehnte Ton ist **nicht** ein Fremdwert im Code, sondern der **Blau-Stich der bisherigen Obsidian-Familie**:

| Familie                                           | Charakteristisch                                                                          | Wo gebruikt                                               | Jans Urteil                                  |
| :------------------------------------------------ | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :------------------------------------------- |
| **Blau-Schwarz (bisheriger „Obsidian"-Standard)** | `#0B0E14` Seitenhintergrund, Flächen `rgba(24,24,32)`, `rgba(16,18,26)`, `rgba(20,22,28)` | /games, /history, /vault, /stats (Header/Panel-Gradients) | ❌ „dunkelblaue Kasten-Töne"                 |
| **Neutral-Schwarz (Leaderboard-Tabelle)**         | `#111111`, `#121212`, `#141414`, Border `#222222`/`#262626`, Text `#E5E5E5`/`#737373`     | /leaderboard (Podium, Weekly Banner, Tabelle)             | ✅ „der schwarze Ton" — gewünschter Standard |

**Belege (Zeilenfundstellen):** Leaderboard: `LeaderboardPodium.tsx:26-51` (`cardBg #121212/#141414`, `rankBadgeBg #262626`), `LeaderboardWeeklyBanner.tsx:96-97` (`#111111`, Border `#222222`). Blau-Schwarz-Flächen: `src/app/games/page.tsx:72` (`rgba(24,24,32,0.75)`-Gradient), `ElevatedGameCard.tsx:103` (`rgba(20,22,28,0.88)`), `HistoryTableStream.tsx:197` (`rgba(16,18,26,0.75)`), `vault-card.ts:13` (`rgba(24,24,32,0.7)`).

**Zusatzbefund — das Projekt hat den Anti-Pattern selbst schon benannt:** `src/app/testing/7.1/parts/StatusQuoSection.tsx:138` hält wörtlich fest: _„Bläuliches `#1e293b` entspricht nicht Obsidian-Dark (`#0b0e14`)"_ — die Slate-Diagnose existierte bereits, wurde aber nie als Projektstandard fixiert. (Historische Evidenz für die Drift-Diagnose in 15 §1a.)

**⚠️ Neuer offener Punkt (B5-Konflikt, an Jan):** `CLAUDE.md` (Design-Guardian) definiert Obsidian als `#0B0E14` — also genau den Blau-Stich, den Jan auf den 4 Seiten ablehnt. Zwei mögliche Lesarten: (a) nur die **Panel-Flächen** der 4 Seiten auf Leaderboard-Neutral-Schwarz umstellen (Scope wie geplant, R3), oder (b) die **Surface-Familie projektweit** von Blau-Schwarz auf Neutral-Schwarz umstellen (größerer Hebel, berührt CLAUDE.md-Regel → nur mit Jans Freigabe). Entscheidung steht offen — siehe §5.

---

## 2 — Positiv-Referenzen: Dateipfade + extrahierte Muster

### 2a — Game-Card + Play-Button (`src/app/games/_components/ElevatedGameCard.tsx`)

Der Button-Hover-Farbwechsel (Jans „sehr wichtig"-Standard), exakt aus dem Code:

| Attribut    | Ruhe-Zustand                                                                                   | Hover-Zustand                                                  |
| :---------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| Hintergrund | `linear-gradient(180deg, rgba(212,175,55,0.16), rgba(212,175,55,0.06))`                        | `linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)` (Vollgold) |
| Textfarbe   | `#F5E6A3`                                                                                      | `#0B0E14`                                                      |
| Border      | `rgba(212,175,55,0.35)`                                                                        | `rgba(212,175,55,0.85)`                                        |
| Schatten    | `inset 0 1px 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.4)`                             | `0 6px 20px rgba(212,175,55,0.45)`                             |
| Motion      | `whileHover scale 1.02`, `whileTap scale 0.96`, `transition 0.25s ease` (alle 4 Eigenschaften) | dito                                                           |

Card-Muster (dieselbe Datei): 3D-Tilt ±3,5° (`rotateX/rotateY`), Spring `stiffness 350, damping 25`, Hover `scale 1.02` + `y −4`, Radius 16 px, Fläche-Gradient `rgba(20,22,28,0.88) → rgba(10,12,16,0.96)` ⚠️ (blau-stichig — R3-Kandidat), `blur(16px)`, Gold-Border `0.22 → 0.55` bei Hover, Bild 16/10 mit Radius 14 px + Zoom `scale 1.05` (`cubic-bezier(0.33,1,0.68,1)`, 0,6 s), Glare `rgba(255,255,255,0.2)` radial, Hover-Overlay `blur(8px)`, Preview-Fallback `#09090b`, Badge Win `#10b981`/`rgba(16,185,129,0.15)`, HOT-Ping `#ff5a5a`, Monospace via `var(--font-mono)` für dynamische Zahlen, `loading: index <= 2 ? 'eager' : 'lazy'`, `sizes="(max-width: 768px) 50vw, 20vw"`, Mobile-Zweige durchgängig.

### 2b — /games-Seiten-Header (`src/app/games/page.tsx:61-137`)

Radius 16 px · Gold-Border `rgba(212,175,55,0.15)` · Fläche `rgba(24,24,32,0.75) → rgba(12,12,18,0.9)` ⚠️ · `blur(16px)` · Schatten `0 12px 32px rgba(0,0,0,0.45)` · Eyebrow-Badge `rgba(212,175,55,0.12)`/Border 0.25 · H1 900er/`-0.02em` · Filter-Pills Radius 20 px, aktiv Gold-Glow `0 0 16px rgba(212,175,55,0.22)`.

### 2c — Leaderboard-Standard (Jans Schwarz-Referenz)

`src/components/leaderboard/LeaderboardPodium.tsx` (cardBg `#121212`/`#141414`, rankBadge `#262626`/`#E5E5E5`, Gold `#D4AF37` für Rang 1) · `LeaderboardWeeklyBanner.tsx` (`#111111`, Border `#222222`, Sekundärtext `#737373`, Primärtext `#E5E5E5`) · Avatare: `src/lib/casino/player-avatar.ts` (+ Tests `__tests__/player-avatar.test.ts`), eingesetzt in `LeaderboardStreamTable.tsx`, `LeaderboardPodium.tsx`, `PersonalRankBar.tsx`.

### 2d — Royal Guide / Brand

Komponenten: `src/components/social/casino-guide/` (`GuideHeader.tsx`, `GuideThinkingSkeleton.tsx` u. a.). Sidebar-Bild + Royal-Logo: Asset-Dateien bei R2-Rest noch exakt zu benennen (Jans neue Assets — nach Restyle einpflegen).

---

## 3 — Negativ-Inventur: Blau-/Slate-Vorkommen im Produktionscode (R3-Zielobjekte)

| Fund                                                       | Ort                                                                                         | Art                                                       |
| :--------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :-------------------------------------------------------- |
| `rgba(30,41,59,0.8)` (slate-800) Badge-Hintergrund         | `components/casino/games/blackjack/CardHand.tsx:66`, `BlackjackSplitHandBox.tsx:75`         | Inline-Fläche                                             |
| `bg-blue-900/60`                                           | `components/casino/games/blackjack/CardHandV2.tsx:59`                                       | Tailwind-Klasse                                           |
| Slate-Familie `#1e293b`/`#0f172a`/`rgba(15,23,42)`         | ausschließlich `src/app/testing/**` (7.1–7.6, StatusQuoSection) — Sandbox, nicht Produktion | dokumentierte Selbstdiagnose                              |
| `radial-gradient #152238 → #0c1524` (blau-stichiger Tisch) | `components/casino/games/blackjack/BlackjackActions.tsx:58`                                 | ⚠️ Evtl. gewollt (Blackjack-Tisch-Look) — Jan entscheiden |
| Slate-Loading-Skeletons                                    | `components/casino/GameSkeleton.tsx` (`slate-700/800/900/950`)                              | Ladezustände auf allen Spielseiten                        |

**Offen nach R1:** Visuelle Zuordnung der konkret von Jan gemeinten Kästen auf /games, /history, /vault, /stats (die Seiten-Header sind blau-stichige Gradients, kein hartes `#1e293b`) — endgültig per Jans Sichtprüfung oder Screenshot-Vergleich gegen die /leaderboard-Tabelle.

---

## 4 — Bereits fixierbare Skill-Bausteine aus dieser Inventur

1. `anti-patterns.md` Eintrag präzisiert: „Dunkelblau" = (a) Slate-Familie (`#1e293b`, `rgba(30,41,59)`), (b) blau-stichige Flächen-Gradients (`rgba(24,24,32)`-Familie) **falls** Jan Neutral-Schwarz als Surface-Standard bestätigt — siehe offenen Punkt §5.
2. `positiv-referenzen.md`: Muster-Extraktion 2a–2c ist inhaltlich komplett (Button-Tabelle, Card-Attribute, Leaderboard-Werte) — muss nach R1 nur gegen finale Werte verifiziert werden.
3. `templates/ui-snippets.md`: Button-Snippet kann direkt aus 2a gebaut werden.

---

## 5 — Offene Punkte an Jan (vor R3 zu klären)

1. **Surface-Standard:** Nur die 4 Seiten auf Leaderboard-Schwarz (R3 wie geplant) — oder projektweite Umstellung der Flächen-Familie auf Neutral-Schwarz (wäre B5-Konflikt mit CLAUDE.md-`#0B0E14`, dann mit deiner Freigabe zu lösen)?
2. **Blackjack-Tisch:** Ist der blaue Radial-Gradient (`#152238`) bewusstes Spiel-Look (Thema „Casino-Tisch") oder auch zu ersetzen?
3. **Skeletons:** Sollen die Slate-Ladezustände (GameSkeleton) ebenfalls auf Gold/Obsidian-Schwarz umgestellt werden? (Niedrige Priorität, aber sichtbar beim Laden.)
4. **Royal-Assets:** Dateipfade der neuen Sidebar-Bilder/Logos nach Restyle nachliefern, damit 2d vollständig wird.
