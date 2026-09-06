# Sidebar Text-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die globale Casino-Sidebar zeigt Lobby bis Settings als ruhige, dauerhafte Textnavigation ohne generische Icons.

**Architecture:** `MainLayout` liefert ausschließlich Label, Route und optionalen Klick-Handler. `MainSidebar` rendert diese Einträge als Textbuttons in einer ständig lesbaren Desktop-Sidebar sowie dem vorhandenen Mobile-Drawer. Vorhandene Marken- und Guide-Bilder bleiben außerhalb der generischen Navigation unverändert.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion, Vitest, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-06-sidebar-text-first-design.md`

## Global Constraints

- Keine neue Bildgenerierung, kein Zugriff auf den OpenAI-API-Key und keine Asset-Dateien.
- Obsidian & Gold beibehalten; die aktive Route bleibt über Gold `#D4AF37`, Linie und Verlauf unterscheidbar.
- Nur globale Sidebar/Shell-Dateien und ihre Test-/Planungsartefakte verändern.
- Desktop immer 240 px; Mobile-Drawer 280 px und Navigationseinträge mindestens 44 px hoch.
- Keine Wallet-, Auth-, API-, Store- oder Modal-Logik verändern.

---

### Task 1: Textnavigation gegen Regression absichern

**Files:**

- Create: `src/components/layout/__tests__/MainSidebar.test.ts`
- Modify: `src/components/layout/MainSidebar.tsx:244-285`

**Interfaces:**

- Consumes: `MainSidebar` mit sieben `MenuItem`-Einträgen und den bestehenden Setter-Props.
- Produces: `data-sidebar-nav-item` an jedem generischen Navigationsbutton und `aria-current="page"` an der aktiven Route.

- [ ] **Step 1: Write the failing test**

```ts
it('renders all primary navigation entries as text-only buttons', () => {
  const markup = renderSidebar('/games');
  const items = markup.match(/<button[^>]*data-sidebar-nav-item[^>]*>[\s\S]*?<\/button>/g) ?? [];

  expect(items).toHaveLength(7);
  expect(items.every((item) => !item.includes('<svg'))).toBe(true);
  expect(markup).toContain('aria-current="page"');
  expect(markup).not.toContain('Collapse sidebar');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/layout/__tests__/MainSidebar.test.ts`

Expected: FAIL, weil die bestehende Navigation kein `data-sidebar-nav-item` besitzt, SVG-Icons rendert und den Klappbutton enthält.

- [ ] **Step 3: Write the minimal implementation**

```tsx
<button
  data-sidebar-nav-item
  aria-current={active ? 'page' : undefined}
  style={{ minHeight: '44px', fontWeight: active ? 700 : 600 }}
>
  <span>{item.label}</span>
</button>
```

Entferne das `icon`-Feld aus `MenuItem` und die sieben Lucide-Elemente. Setze die Desktop-Animation fest auf `width: 240`, entferne Chevron und Klappzustands-Props; belasse die Marken-, Guide- und Trust-Bilder unverändert.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/layout/__tests__/MainSidebar.test.ts`

Expected: PASS mit einem Testfall, sieben Textbuttons, keiner SVG in diesen Buttons und aktivem `aria-current`.

### Task 2: Shell-Vertrag bereinigen und Planungsstatus aktualisieren

**Files:**

- Modify: `src/components/layout/MainLayout.tsx:14,46-47,177-184,306-325,364-375`
- Modify: `T_IMAGE/00_bildgenerierung_uebersicht_jan.md` (Zeile UI-03)

**Interfaces:**

- Consumes: Den vereinfachten `MainSidebar`-Props-Vertrag ohne `sidebarOpen`, `showExpandedSidebar` und `setSidebarOpen`.
- Produces: Einen stabilen Textnavigation-Shellpfad und UI-03 mit Status „Direkt umgesetzt“.

- [ ] **Step 1: Extend the failing test for desktop readability**

```ts
expect(markup).toContain('width:240px');
expect(markup).not.toContain('Expand sidebar');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/layout/__tests__/MainSidebar.test.ts`

Expected: FAIL, weil der bestehende Desktopmodus zwischen 240 px und 80 px wechselt.

- [ ] **Step 3: Write the minimal shell implementation**

```tsx
const menuItems: MenuItem[] = [
  { label: 'Lobby', path: '/' },
  { label: 'Games', path: '/games' },
  { label: 'My Bets', path: '/history' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Vault', path: '/vault' },
  { label: 'Stats', path: '/stats' },
  { label: 'Settings', path: '#', onClick: () => setShowSettings((prev) => !prev) },
];
```

Entferne den nicht mehr benötigten Desktop-Klappzustand aus `MainLayout`. Aktualisiere UI-03 in der getrennten „Nächste Schritte“-Tabelle auf „Direkt umgesetzt“ und setze als Folgeschritt die Jan-Sichtprüfung auf `/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/layout/__tests__/MainSidebar.test.ts`

Expected: PASS mit dauerhafter 240-px-Desktopnavigation.

### Task 3: Sicht- und Qualitätsabnahme

**Files:**

- Verify only: `src/components/layout/MainSidebar.tsx`, `src/components/layout/MainLayout.tsx`, `T_IMAGE/00_bildgenerierung_uebersicht_jan.md`

**Interfaces:**

- Consumes: Fertige Textnavigation aus Task 1 und 2.
- Produces: Nachweis der lokalen Abnahme sowie klar benannte, begrenzte Änderungen.

- [ ] **Step 1: Run focused quality checks**

Run: `npm test -- src/components/layout/__tests__/MainSidebar.test.ts`; `npm run typecheck`; `npm run lint -- src/components/layout/MainLayout.tsx src/components/layout/MainSidebar.tsx src/components/layout/__tests__/MainSidebar.test.ts`

Expected: alle drei Befehle ohne Fehler.

- [ ] **Step 2: Run project checks**

Run: `npm test`; `npm run lint`; `npm run build`

Expected: Projektprüfungen ohne neue Fehler; falls die bestehende vollständige Suite keinen Abschlussbericht liefert, Ergebnis transparent dokumentieren und die fokussierte Suite als belastbaren Nachweis ausweisen.

- [ ] **Step 3: Inspect the live UI**

Open: `http://localhost:3015/`

Expected: Desktop zeigt durchgehend sichtbare Textnavigation und Goldzustand; Mobile zeigt einen 280-px-Drawer ohne horizontales Overflow. Logo, Guide-Illustration und Secure-&-Fair-Bild bleiben sichtbar.

- [ ] **Step 4: Audit only the scoped diff**

Run: `git diff --check -- src/components/layout/MainLayout.tsx src/components/layout/MainSidebar.tsx T_IMAGE/00_bildgenerierung_uebersicht_jan.md`; `git status --short -- src/components/layout/MainLayout.tsx src/components/layout/MainSidebar.tsx src/components/layout/__tests__/MainSidebar.test.ts T_IMAGE/00_bildgenerierung_uebersicht_jan.md`

Expected: keine Whitespace-Fehler; ausschließlich die vier geplanten Arbeitsdateien im Scope.

---

## Ausführungsprotokoll — 2026-09-06

- [x] Textnavigation testgetrieben umgesetzt: der Regressionstest war vor der Änderung rot und ist danach grün.
- [x] Shell-Vertrag auf Label, Route und optionalen Klick-Handler reduziert; die Desktopbreite ist fest 240 px, der Mobile-Drawer 280 px.
- [x] UI-03 in `T_IMAGE/00_bildgenerierung_uebersicht_jan.md` auf „Direkt umgesetzt“ gesetzt.
- [x] Gezielter Vitest und gezielter ESLint-Lauf sind erfolgreich.
- [x] Desktop-Lobby auf `http://localhost:3015/` visuell geprüft: sieben Textzeilen, Gold-Aktivzustand sowie Marken-/Guide-Motive sichtbar.
- [!] Der globale Typecheck ist durch vorhandene, nicht zur Sidebar gehörende Fehler im parallelen Arbeitsstand blockiert, darunter fehlende `MainHeader`-Props aus einem bestehenden `MainLayout`-Diff. Diese Änderung hat keine dieser Stellen berührt.
- [!] Die In-App-Browser-Vorschau hat beim erneuten Mobile-Abruf `ERR_CONNECTION_REFUSED` geliefert, obwohl Port 3015 erreichbar ist. Die Mobile-Abnahme bleibt daher beim nächsten lokalen Aufruf durch Jan offen; Code und Regressionstest sichern den 280-px-Drawer und 44-px-Navigationseinträge ab.
