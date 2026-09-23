# 25 — Big Win Overlay: Particle Typography & Gold Dust FX (Obsidian & Gold)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-09 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Modernisierung von `src/components/casino/BigWinOverlay.tsx` durch `cursor-driven-particle-typography` (Canvas-Goldstaub-Physik) anstelle der 48 starren CSS-Divs, mit 60–120 FPS Federkraft und interaktiver Partikel-Verdrängung bei Berührung.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 70 %)

| #   | Subkategorie            | Niveau   | Befund & Beleg (Datei / Test)                                                                     | Bottleneck? | Action Item                                                                                    |
| --- | ----------------------- | -------- | ------------------------------------------------------------------------------------------------- | :---------: | ---------------------------------------------------------------------------------------------- |
| 01  | Visuelle Explosion      | Top 85 % | 48 starre CSS-Divs fallen linear herab (`BigWinOverlay.tsx:30`), wirkt wie billiges Web-Template. |    🔴 JA    | HTML5 Canvas Partikelfeld mit tausenden 24k Goldpartikeln.                                     |
| 02  | Interaktivität & Haptik | Top 90 % | Keinerlei Cursor-Reaktion oder physikalisches Feedback bei Berührung.                             |    🔴 JA    | `cursor-driven-particle-typography`: Partikel zerstäuben bei Hover/Touch und reformieren sich. |
| 03  | Ziffern-Animation       | Top 40 % | `AnimatedAmount` nutzt `useSpring` mit guter Grundfederung.                                       |    Nein     | Spring-Logik für Zahlenwert beibehalten und mit Canvas-Partikeln koppeln.                      |
| 04  | Sound & Haptik          | Top 20 % | `soundManager`-Verdrahtung für Win-Sounds ist solide und erprobt.                                 |    Nein     | Sound-Auslöser unangetastet lassen.                                                            |
| 05  | Memory & Lifecycle      | Top 35 % | Overlay mountet/unmountet sauber über `AnimatePresence`.                                          |    Nein     | Sauberen Canvas-Lifecycle (`cancelAnimationFrame`) garantieren.                                |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                        | Scope (Dateien)                                         | Status     | Zuständigkeit | Verifikation                                                      |
| ------ | ---------------------------------- | ------------------------------------------------------- | ---------- | :-----------: | ----------------------------------------------------------------- |
| **L0** | Baseline & Snapshot                | `src/components/casino/BigWinOverlay.tsx`               | 🔴 Geplant |      LLM      | Lint & Typecheck fehlerfrei                                       |
| **L1** | Canvas-Partikel-Engine             | `src/components/casino/fx/ParticleTypographyCanvas.tsx` | 🔴 Geplant |      LLM      | 60 FPS Partikelfeld mit Spring-Rückstellvektor isoliert getestet  |
| **L2** | Integration in `BigWinOverlay.tsx` | `src/components/casino/BigWinOverlay.tsx`               | 🔴 Geplant |      LLM      | Mega Win / Multiplier Darstellung mit Goldstaub                   |
| **L3** | Mobile Throttling & Perf-Guard     | `ParticleTypographyCanvas.tsx`                          | 🔴 Geplant |      LLM      | Partikelanzahl auf Mobile dynamisch skaliert (z. B. 600 vs. 2000) |
| **L4** | Verifikation & 5-Stufen-DoD        | Lokale Test-Suite                                       | 🔴 Geplant |      LLM      | Typecheck, Vitest, Lint & Build 100 % grün                        |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Ziel-Datei: [`src/components/casino/BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)
- Neue Komponente: `src/components/casino/fx/ParticleTypographyCanvas.tsx`
- Sound-Manager: [`src/lib/casino/sound-manager.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/sound-manager.ts)
- Z-Index Tokens: [`src/lib/design/tokens.generated.ts`](file:///v:/VibeCoding/Casino/src/lib/design/tokens.generated.ts)
- Screenshots: [`docs/frontend/screenshots/03_weakness_big_win_overlay.png`](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/03_weakness_big_win_overlay.png)
- Componentry-Referenz: [Particle Typography (`cursor-driven-particle-typography`)](https://componentry.dev/docs/components/cursor-driven-particle-typography)

### 3.2 Systemregeln & Invarianten

- **Design-System:** 24k Goldstaub (`#D4AF37`, `#F5D77F`, `#FFFFFF`), tiefe Obsidian-Vignette (`#0B0E14`).
- **Performance-Invariant:** Keine Garbage-Collection Spikes; Partikel-Arrays vorab allozieren (ArrayPool / Float32Array).
- **Zero-Wallet-Autorität:** Overlay ist ein reiner visueller Feedback-Kanal; Gewinnsummen werden ausschließlich vom Server-Payload übergeben.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderungen an den Gewinnberechnungen der Spiele.
- Keine Änderungen am Sound-System.
- Keine persistenten State-Mutationen im Store.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: `ParticleTypographyCanvas.tsx`

- **Ziel:** Erstellung der Canvas-Partikel-Engine mit physikalischer Verdrängung.
- **Schritte:**
  1. Offscreen-Canvas rendert den Zieltext (z. B. „MEGA WIN“ oder Währungsbetrag) in Gold-Typografie.
  2. Auslesen der Pixelkoordinaten via `getImageData` zur Bestimmung der Partikel-Zielpositionen.
  3. Partikel besitzen Trägheit, Reibung und elastische Rückholfedern.
  4. Maus- oder Touch-Events erzeugen ein radiales Abstoßungsfeld.
- **Abbruchkriterium:** FPS-Drops unter 55 FPS bei Interaktion.

### Meilenstein L2: Verdrahtung in `BigWinOverlay.tsx`

- **Ziel:** Entfernung der 48 starren CSS-Divs und Einbettung des Canvas-Partikelfelds.
- **Schritte:**
  1. Ersetzen der `STATIC_PARTICLES` durch `ParticleTypographyCanvas`.
  2. Kopplung der Partikelexplosion an das `isOpen`-Event.
  3. Automatische Entlastung bei Fenster-Schließung (`cleanup`).
- **Abbruchkriterium:** Overlay schließt nicht mehr per Klick/Escape.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)

1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm run test` — Alle Tests grün.
3. `npm run lint` — 0 Lint-Fehler.
4. `npm run build` — Production Build erfolgreich.
5. Screenshot-Prüfung des Overlays bei Auslösung.
