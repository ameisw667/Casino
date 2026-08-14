# Neon Arcade Dashboard Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die isolierte Neon-Arcade-Testseite wird von einem fahlen, statischen Bento-Dashboard zu einer farbkräftigen, kontrastfesten Game Runway mit hochwertigen Roulette- und Blackjack-Tischszenen weiterentwickelt.

**Architecture:** Das bestehende Dashboard-Modell erhält reine Filter-/Resolve-Funktionen. Der Client-Container verwaltet Kategorie und aktives Spiel; die reine View rendert ein Spotlight plus Room Index. Alle visuellen Änderungen bleiben im bestehenden CSS Module und in code-nativen CSS-/SVG-Szenen ohne neue Abhängigkeiten.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, CSS Modules, Zustand, Lucide React, Vitest, In-App-Browser-QA.

**Spec:** `docs/superpowers/specs/2026-08-14-neon-arcade-dashboard-optimization-design.md`

## Global Constraints

- Nur `http://localhost:3015/testing/neon-arcade-dashboard` wird verändert; `/`, `ClientShell`, Backend, Wallet und Games bleiben unangetastet.
- Keine neuen npm-Pakete, externen Bildassets, Emojis als Hauptvisualisierung oder permanenten Neon-Glows.
- Die Top 8 aus der Spec werden vollständig umgesetzt; Punkte 9 und 10 bleiben bewusst zurückgestellt.
- Primäre Lime-Flächen erhalten dunklen Text; tatsächlicher Browserkontrast wird gegen Computed Styles gemessen.
- Desktop 1280×720, Tablet 1024×768 und Mobile 390×844 dürfen kein horizontales Overflow besitzen.
- Motion ist inhaltlich, langsam und unter `prefers-reduced-motion` vollständig abschaltbar.
- Dirty-Worktree-Änderungen außerhalb der genannten Dateien bleiben unangetastet; kein Commit.

---

### Task 1: Game-Filter und Active-Game-Auflösung testgetrieben absichern

**Files:**

- Modify: `src/components/home/neon-arcade-dashboard-model.ts`
- Modify: `src/components/home/__tests__/neon-arcade-dashboard-model.test.ts`

**Interfaces:**

- Produces: `filterDashboardGames(games, category): readonly DashboardGame[]`.
- Produces: `resolveDashboardGame(games, activeGameId): DashboardGame | null`.

- [x] **Step 1: Failing Tests schreiben**

Tests verwenden literale Erwartungen: `table` liefert `roulette` und `blackjack`; eine unbekannte aktive ID fällt auf `roulette` zurück; eine leere Liste liefert `null`.

- [x] **Step 2: RED ausführen**

Run: `npm run test -- src/components/home/__tests__/neon-arcade-dashboard-model.test.ts`

Expected: FAIL, weil beide Funktionen fehlen.

- [x] **Step 3: Minimale reine Funktionen implementieren**

Keine Mutation, kein Store-Zugriff und deterministischer Fallback auf Index 0.

- [x] **Step 4: GREEN ausführen**

Run: derselbe Test; Expected: PASS.

### Task 2: Game-Runway-Vertrag testgetrieben definieren

**Files:**

- Modify: `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`
- Modify: `src/components/home/NeonArcadeDashboard.tsx`
- Modify: `src/components/home/NeonArcadeDashboardView.tsx`

**Interfaces:**

- View consumes: `activeGameId: DashboardGame['id']` und `onGameSelect(id)`.
- Container keeps: `activeCategory` und `activeGameId`; Filterwechsel setzt beide atomar auf einen gültigen Zustand.

- [x] **Step 1: Failing View-Contracts schreiben**

Der echte SSR-Render muss `data-layout="game-runway"`, genau ein Spotlight, Room-Selectoren mit `aria-pressed`, eine aktive Roulette-Auswahl und deren echten `/games/roulette`-Link enthalten.

- [x] **Step 2: RED ausführen**

Run: `npm run test -- src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

Expected: FAIL wegen fehlender Props/Runway-Struktur.

- [x] **Step 3: Container-State und View-Struktur implementieren**

Grid entfernen; Spotlight-Article, Room-Index-Buttons und robusten Empty State hinzufügen. Bestehende Filter-, Drawer- und Balance-Verträge beibehalten.

- [x] **Step 4: GREEN ausführen**

Run: beide Dashboard-Testdateien; Expected: PASS.

### Task 3: European Table und Private Table V2 umsetzen

**Files:**

- Modify: `src/components/home/NeonArcadeDashboardView.tsx`
- Modify: `src/components/home/NeonArcadeDashboard.module.css`
- Modify: `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

**Interfaces:**

- Roulette marker: `data-game-visual="roulette-table-v2"`.
- Blackjack marker: `data-game-visual="blackjack-table-v2"`.

- [x] **Step 1: Failing Render-Tests für beide Table-Szenen schreiben**

Roulette muss „European single zero“ und „Inside bets“ rendern; Blackjack muss „Dealer“, „Player“ und den sichtbaren Score `21` rendern.

- [x] **Step 2: RED ausführen**

Expected: FAIL, weil die V2-Marker und Tischlabels fehlen.

- [x] **Step 3: Roulette-Szene implementieren**

Großes Top-down-Wheel, Ballbahn, Zero-Segment und Betting-Layout; keine externe Grafik.

- [x] **Step 4: Blackjack-Szene implementieren**

Halbrundes Felt, Dealer-Zone, verdeckte Karte, Player-Hand, Chipstack und Tischkante; keine schwebende Dreikarten-Komposition.

- [x] **Step 5: GREEN ausführen**

Run: View-Test; Expected: PASS.

### Task 4: Colourway, Typografie, Material und Control-Kontrast erneuern

**Files:**

- Modify: `src/components/home/NeonArcadeDashboard.module.css`

**Interfaces:**

- Tokens exakt aus der Spec.
- Scoped Control-Selektoren innerhalb `.dashboard` verhindern globale Link-Farbüberschreibung.

- [x] **Step 1: Tokens und Flächenhierarchie umstellen**
- [x] **Step 2: Active Nav, Sign-in, Primary CTA, Filter und Runway-CTA kontrastfest stylen**
- [x] **Step 3: Hero kompakter und farblich gerichteter gestalten**
- [x] **Step 4: Uniforme Card-Radien/Borders durch Runway-, Felt- und Hairline-Material ersetzen**
- [x] **Step 5: Browser-Computed-Style-Kontrast messen**

Expected minimum: Active Nav/Sign-in/Primary/Filter ≥ 7:1; sekundäre Actions ≥ 4.5:1.

### Task 5: Motion und responsive Verhalten ergänzen

**Files:**

- Modify: `src/components/home/NeonArcadeDashboard.module.css`

- [x] **Step 1: Spotlight-Entry, Chart-Draw, Wheel-Drift, Ball-Orbit und Card-Deal implementieren**
- [x] **Step 2: Hover-/Focus-Zustände ohne Glow ergänzen**
- [x] **Step 3: Mobile Room Index als horizontalen Scroll-Snap-Strip umsetzen**
- [x] **Step 4: `prefers-reduced-motion` für alle neuen Animationen und Transforms erweitern**

### Task 6: Execution-Self-Review und technische Gates

**Files:**

- Verify/modify as needed: Dashboard-View, Container und CSS Module.

- [x] **Step 1: Desktop 1280×720 prüfen**

Gate: Game Floor beginnt im ersten Viewport; Runway ohne tote Fläche; beide Table-Szenen klar erkennbar.

- [x] **Step 2: Tablet 1024×768 prüfen**

Gate: Spotlight/Index bleiben lesbar, keine abgeschnittenen Controls, kein Overflow.

- [x] **Step 3: Mobile 390×844 prüfen**

Gate: einspaltige Bühne, horizontaler Room Strip, vollständige Tischszenen, `scrollWidth <= clientWidth`.

- [x] **Step 4: Interaktionen und Reduced Motion prüfen**

Filter, Room-Auswahl, Drawer, Escape, Balance-Maske; CSSOM zeigt deaktivierte Animationen unter Reduce.

- [x] **Step 5: Technische Gates ausführen**

Run: gezielte Vitest-Dateien, gezieltes ESLint, `npx tsc --noEmit --incremental false`, `npm run build`.

### Task 7: Dokumentation und Completion Audit

**Files:**

- Modify: `docs/superpowers/plans/2026-08-14-neon-arcade-dashboard-optimization.md`
- Modify: `docs/superpowers/specs/2026-08-14-neon-arcade-dashboard-optimization-design.md`
- Modify: `worldmap/02_FRONTEND_REDESIGN.md`

- [x] **Step 1: Checkboxen, tatsächliche Abweichungen und Messwerte eintragen**
- [x] **Step 2: Worldmap um Pass 2, Top-8-Matrix und direkte URL ergänzen**
- [x] **Step 3: Requirement-by-Requirement-Audit gegen Nutzerkritik, Spec und Plan durchführen**
- [x] **Step 4: Produktionsschutz und Whitespace prüfen**

## Plan-Self-Review

- **Spec coverage:** Alle zehn Hebel sind bewertet; jede Top-8-Entscheidung ist Tasks 1–6 zugeordnet.
- **Kritikabdeckung:** European Table, Private Table, Bento-Starre, Control-Kontrast, fahle Farben und statische Wirkung besitzen jeweils ein konkretes Gate.
- **Type consistency:** `DashboardGame['id']`, `filterDashboardGames` und `resolveDashboardGame` werden identisch in Modell, Container, View und Tests verwendet.
- **Risk coverage:** CSS-Kaskade, ungültige Active IDs, Mobile-Overflow, Motion, Store-Nullwerte und Dev-Indicator sind mit Gegenmaßnahmen verknüpft.
- **No placeholders:** Keine TBD-/TODO-Anweisungen oder unbestimmten „später“-Schritte.
- **Scope:** Keine Änderung an Root, ClientShell, Casino-APIs, Wallet oder Spielregeln.
- **Next-level Ergänzung:** Computed-Style-Kontrast und Reduced-Motion-CSSOM sind explizite Browser-Gates statt rein visueller Behauptungen.

## Execution Result (2026-08-14)

| Gate             | Tatsächliches Ergebnis                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| TDD              | RED mit vier erwarteten Contract-Fehlern; final 2 Dateien / 12 Tests grün                                                                 |
| Runway           | Ein aktives Spotlight plus Room Index; Kategorie- und Raumwechsel halten immer eine gültige aktive Game-ID                                |
| European Table   | Vollständige Top-down-Szene mit Wheel, Ballbahn, Zero-Segment, Innen- und Außenwetten                                                     |
| Private Table    | Vollständige Felt-Szene mit Dealer-/Player-Zonen, Händen, Scores und Chipstack; im Self-Review entdeckte Label-Überlagerung behoben       |
| Kontrast         | Active Nav 12,66:1; Sign-in 12,68:1; Primary CTA 12,68:1; aktiver Filter 12,70:1                                                          |
| Responsive       | 1280×720, 1024×768 und 390×844 ohne horizontalen Seitenüberlauf; nativer Scrollbalken des Room Strip visuell ausgeblendet                 |
| Motion           | Spotlight, Chart, Roulette und Deal-Motion aktiv; CSSOM bestätigt Animation-Off und Transition-Off unter `prefers-reduced-motion: reduce` |
| Browser          | Filter, Room-Auswahl und Mobile Drawer geprüft; keine Console-Errors oder -Warnings                                                       |
| Technische Gates | Gezieltes ESLint bestanden, `npm run typecheck` bestanden, `npm run build` bestanden und Test-Route im Build-Manifest enthalten           |
| Abweichung       | Das geplante TSC-Kommando wurde über das äquivalente Projekt-Script `npm run typecheck` ausgeführt                                        |
