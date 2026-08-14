# Neon Arcade Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unter `/testing/neon-arcade-dashboard` entsteht eine isolierte, classy-playful Neon-Arcade-Dashboard-Komponente mit echten Casino-Daten, relevanten Spielvisualisierungen und responsiver Shell. Die produktive Route `/` bleibt unverändert.

**Architecture:** Die neue Testseiten-Route rendert eine fokussierte Client-Komponente. Reine Game-Konfiguration und Kennzahlenableitung liegen in einem testbaren Modellmodul; die bereits bestehende `/testing/*`-Regel im `ClientShell` isoliert die Seite vom `MainLayout`. Styling und CSS-/SVG-Visualisierungen bleiben in einem CSS Module und benötigen keine neuen Assets oder Dependencies.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, CSS Modules, Zustand, Lucide React, Vitest, Browser-Regressionstests.

**Spec:** `docs/superpowers/specs/2026-08-14-neon-arcade-dashboard-design.md`

## Global Constraints

- Ausschließlich `/testing/neon-arcade-dashboard` erhält die neue Dashboard-Shell; alle produktiven Routen behalten ihren bisherigen Stand.
- Keine Inspiration aus dem bisherigen Root-Look; übernommen werden nur reale Datenbindungen und Route-Ziele.
- Keine Emojis oder generischen Iconflächen als Hauptvisuals; Game-Visuals sind CSS-/SVG-Diagramme.
- Palette: Ink/Petrol, Aubergine, gedämpftes Lime, Terrakotta, Soft Teal und warmes Off-White; keine permanenten Neon-Glows.
- Keine neue npm-Abhängigkeit, keine Backend-/Wallet-/Auth-Änderung und keine Modifikation bestehender Game-Regeln.
- Bestehende Nutzeränderungen im Dirty Worktree bleiben unangetastet; kein Commit aus diesem Plan.
- Desktop 1280×720, Tablet 1024×768 und Mobile 390×844 müssen ohne horizontales Overflow funktionieren.

---

### Task 1: Dashboard-Modell testgetrieben definieren

**Files:**

- Create: `src/components/home/__tests__/neon-arcade-dashboard-model.test.ts`
- Create: `src/components/home/neon-arcade-dashboard-model.ts`

**Interfaces:**

- Produces: `DASHBOARD_GAMES`, `deriveDashboardMetrics(bets)`, `formatDashboardMoney(value)`, `DashboardMetrics`, `DashboardGame`.

- [x] **Step 1: Failing Tests für Game-Konfiguration und Empty State schreiben**

```ts
import { DASHBOARD_GAMES, deriveDashboardMetrics } from '../neon-arcade-dashboard-model';

it('defines five unique games with real routes and visualizations', () => {
  expect(DASHBOARD_GAMES).toHaveLength(5);
  expect(new Set(DASHBOARD_GAMES.map((game) => game.id)).size).toBe(5);
  expect(DASHBOARD_GAMES.every((game) => game.path.startsWith('/games/'))).toBe(true);
  expect(new Set(DASHBOARD_GAMES.map((game) => game.visual)).size).toBe(5);
});

it('returns stable zero metrics for an empty floor', () => {
  expect(deriveDashboardMetrics([])).toMatchObject({
    totalWagered: 0,
    winRate: 0,
    bestMultiplier: 0,
    recentWins: [],
  });
});
```

- [x] **Step 2: RED ausführen**

Run: `npm test -- src/components/home/__tests__/neon-arcade-dashboard-model.test.ts`

Expected: FAIL, weil `neon-arcade-dashboard-model.ts` noch nicht existiert.

- [x] **Step 3: Modell mit fünf Games und robuster Aggregation implementieren**

Aggregation ignoriert nicht-finite Beträge, klemmt Prozente, sortiert nicht destruktiv und liefert sieben Activity-Bars.

- [x] **Step 4: GREEN ausführen**

Run: `npm test -- src/components/home/__tests__/neon-arcade-dashboard-model.test.ts`

Expected: PASS.

### Task 2: Testseiten-Isolation verifizieren

**Files:**

- Verify unchanged: `src/components/layout/ClientShell.tsx`

**Interface:** Die bestehende Regel `pathname === '/testing' || pathname.startsWith('/testing/')` rendert die neue Route standalone.

- [x] **Step 1: Bestehende `/testing/*`-Standalone-Regel prüfen**
- [x] **Step 2: Produktionsroute `/` und `ClientShell` unverändert lassen**
- [x] **Step 3: Build-Manifest auf `/testing/neon-arcade-dashboard` prüfen**

### Task 3: Dashboard-View-Verhalten zuerst festlegen

**Files:**

- Create: `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`
- Create: `src/components/home/NeonArcadeDashboard.tsx`
- Create: `src/components/home/NeonArcadeDashboardView.tsx`
- Create: `src/components/home/NeonArcadeDashboard.module.css`
- Create: `src/app/testing/neon-arcade-dashboard/page.tsx`

**Interfaces:**

- Consumes: `DASHBOARD_GAMES`, `deriveDashboardMetrics`, Zustand Casino Store, `useSupabaseSession`.
- Produces: stateful Container plus rein renderbare View mit `data-dashboard="neon-arcade"`.

- [x] **Step 1: Failing Render-Contract schreiben**

Der Test rendert `NeonArcadeDashboardView` mit `react-dom/server` zu echtem HTML und prüft H1-Messaging, semantische Navigation, Dashboard-Marker, Game-Routen, Balance-/Rank-Werte sowie den geöffneten/geschlossenen Drawer-State. Responsive CSS, `prefers-reduced-motion` und `:focus-visible` bleiben Browser- bzw. CSSOM-Gates.

- [x] **Step 2: RED ausführen**

Run: `npm test -- src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

Expected: FAIL, weil `NeonArcadeDashboardView.tsx` noch nicht existiert.

- [x] **Step 3: Dashboard-Komponente implementieren**

Der Container übernimmt Store-Bindings, Testseiten-Lifecycle, Filter-/Drawer-/Balance-State. Die View implementiert Sidebar, Topbar, Hero/Floor Pulse, fünf Game-Visuals, Session Metrics, Live Floor und Community Run ausschließlich aus Props.

- [x] **Step 4: CSS Module implementieren**

Das Modul definiert isolierte Tokens, Grid-Shell, Materialkanten, Crash-SVG, Roulette-Wheel, Card-Fan, Dice-Distribution, Slot-Reels, Activity-Bars, Responsive Breakpoints und Reduced-Motion-Regeln.

- [x] **Step 5: isolierten Testseiten-Entry erstellen**

Die Testseite erhält eigene Metadata; `src/app/page.tsx` und `HomeClientV2` bleiben unverändert.

- [x] **Step 6: GREEN ausführen**

Run: `npm test -- src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

Expected: PASS.

### Task 4: Gezielte Code-Verifikation

**Files:**

- Verify: alle in Tasks 1–3 erstellten/geänderten Dateien.

- [x] **Step 1: Relevante Tests gemeinsam ausführen**

Run: `npm test -- src/components/home/__tests__/neon-arcade-dashboard-model.test.ts src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

- [x] **Step 2: Gezieltes ESLint ausführen**

Run: `npx eslint src/app/testing/neon-arcade-dashboard/page.tsx src/components/home/NeonArcadeDashboard.tsx src/components/home/NeonArcadeDashboardView.tsx src/components/home/neon-arcade-dashboard-model.ts src/components/home/__tests__/neon-arcade-dashboard-model.test.ts src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

- [x] **Step 3: TypeScript und Build ausführen**

Run: `npx tsc --noEmit --incremental false`

Run: `npm run build`

### Task 5: Visuelle Desktop-/Tablet-/Mobile-Verifikation

**Files:**

- Modify if required: `src/components/home/NeonArcadeDashboard.tsx`
- Modify if required: `src/components/home/NeonArcadeDashboard.module.css`

- [x] **Step 1: Desktop 1280×720 prüfen**

Erwartet: eigene Sidebar/Topbar, ein H1, sichtbarer Floor Pulse, Beginn des Game Floors im ersten Viewport, kein altes Gold-/Foto-Hero-Design.

- [x] **Step 2: Tablet 1024×768 prüfen**

Erwartet: kompakte Shell ohne abgeschnittene Header-Chips und ohne horizontales Overflow.

- [x] **Step 3: Mobile 390×844 prüfen**

Erwartet: Sidebar als geschlossener Drawer, Menu-Button sichtbar, einspaltige Hero-/Card-Struktur, CTA und Balance sichtbar, `scrollWidth <= innerWidth`.

- [x] **Step 4: Interaktionen prüfen**

Filter „Featured/Fast rounds/Table/All“, Balance-Visibility, Mobile-Drawer öffnen/schließen und direkte Game-Links werden semantisch getestet. Browser-Konsole bleibt ohne Error/Warning.

- [x] **Step 5: Gefundene visuelle Fehler korrigieren und die betroffene Prüfung wiederholen**

### Task 6: Dokumentation und Completion Audit

**Files:**

- Modify: `docs/superpowers/plans/2026-08-14-neon-arcade-dashboard.md`
- Modify: `docs/superpowers/specs/2026-08-14-neon-arcade-dashboard-design.md`
- Modify: `worldmap/02_FRONTEND_REDESIGN.md`

- [x] **Step 1: Plan-Checkboxen und Abweichungen mit tatsächlichen Ergebnissen aktualisieren**
- [x] **Step 2: Worldmap um Designentscheidung, Dateien, Tests und direkte URL ergänzen**
- [x] **Step 3: Requirement-by-Requirement-Audit gegen die Benutzeranforderung durchführen**
- [x] **Step 4: `git diff --check` für alle angefassten Dateien ausführen**

## Execution Result

- Isolierte URL: `http://localhost:3015/testing/neon-arcade-dashboard`.
- Produktionsschutz: `src/app/page.tsx` und `src/components/layout/ClientShell.tsx` ohne Diff.
- TDD: RED wegen fehlender View belegt; anschließend 3 Testdateien / 23 Tests grün.
- Technik: gezieltes ESLint, `npx tsc --noEmit --incremental false` und `npm run build` bestanden.
- Browser: 1280×720, 1024×768 und 390×844 ohne horizontales Overflow; Filter, Drawer, Escape und Balance-Maske geprüft; keine Console-Errors/-Warnings.
- Kontrast-Stichprobe: Warm Ink/Canvas 16.49:1, Muted/Surface 6.69:1, CTA-Text/Lime 10.99:1, Terrakotta/Surface 4.95:1.
- Execution-Self-Review: Der mobile Account-Block wurde nach visueller Prüfung vom Next.js-Entwicklungsindikator weggerückt und erneut verifiziert.

## Plan-Self-Review

- **Spec coverage:** Testseiten-Isolation, Store-Daten, Messaging, Visualisierungen, Colorway, drei Stakeholder, Mobile, Accessibility, Tests und Dokumentation sind jeweils einem Task zugeordnet.
- **Ergänzte Lücke:** Der geklärte Scope nutzt die vorhandene `/testing/*`-Isolation und verändert deshalb weder Root-Route noch produktiven Shell-Code.
- **Ergänzte Lücke:** Store-Rehydration und API-Initialisierung sind ausdrücklich Teil der Test-Komponente, weil das `MainLayout` auf Testseiten nicht zuständig ist.
- **Korrigierter Testansatz:** Ein früher geplanter Source-/Style-Grep wurde verworfen. Die View wird als echtes React-HTML gerendert; CSS und Responsive bleiben Browser-/CSSOM-Gates.
- **Type consistency:** Game-Kategorien, Visualtypen und Metrikfelder werden einmal im Modell definiert und von Tests sowie Komponente importiert.
- **Placeholder scan:** Keine TBD-/TODO-/„später implementieren“-Formulierungen oder offenen Entscheidungen vorhanden.
- **Scope:** Der Plan verändert keine fremden Routen, Backendlogik oder bestehenden Game-Komponenten.
