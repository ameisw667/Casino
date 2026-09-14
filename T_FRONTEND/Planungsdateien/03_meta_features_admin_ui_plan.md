# 03 — Meta-Features, Modals & Admin-UI (Modul 10): History-Virtualisierung & proportionale Admin-Entschuldung

> **Status:** 🟢 History- + Admin-Operations-Track Executed (2026-09-14) · 🔴 Admin-Moderation-Track (B1–B3) zurückgestellt — siehe Begründung Abschnitt 1 · **Stand:** 2026-09-13 (Plan) / 2026-09-14 (Ausführung) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Behebt die drei von Jan als Bottleneck benannten Sub-Subkategorien von Modul 10 (`T_FRONTEND/13_10_meta_features_subkategorien.md`) — #4 History/`HistoryTableStream` (Top 40 %, primärer Track, höchstes Gewicht 20), #8 Admin Operations (Top 20 %, leichter Track, Gewicht 10) und #9 Admin Moderation & Support (Top 25 %, leichter Track, Gewicht 8). Die übrigen 6 Sub-Punkte (#1, #2, #3, #5, #6, #7) sind bereits solide (Top 8–12 %) und werden **nicht** angefasst — siehe Abschnitt 0.4.
> **Money-Pfad:** Nein · **Security-Review:** Nein — alle drei Bereiche sind reine Anzeige-/Admin-Read-Komponenten (History-Anzeige, Admin-Simulation-Sandbox mit `Math.random()`, Admin-Read/Edit-Dashboards). Kein Berühren von `src/lib/casino/` (Wallet/RNG/Settlement) oder Auth-Logik. `src/app/admin/layout.tsx:1-13` erzwingt bereits serverseitig `isAdminEmail()` + Redirect/`forbidden()` für **alle** `admin/**`-Routen — dieses bestehende Invariant wird unverändert vorausgesetzt, nicht angefasst.

---

## 0 — Ausgangslage (verifiziert 2026-09-13)

### 0.1 — History-Track (primär, Gewicht 20 von 100 im Modul)

- `src/components/history/HistoryTableStream.tsx` ist mit **824 Zeilen** die größte Einzeldatei im gesamten `src/`-Baum (verifiziert per `wc -l`). Es ist **eine** Komponente, keine mehreren zusammenkopierten — der Zeilenumfang kommt aus:
  - Zeilen 1–14: Imports · 16–33: `HistoryRow`-Interface + Props · 35–48: `formatFullTime()` · 50–90: `getGameConfig()` · 92–128: `LoadMoreCTA`-Subkomponente (bereits ausgelagert im selben File).
  - Zeilen 130–191: `sessionGroups`-`useMemo` — reine Gruppierungslogik (Sessions nach >25-Minuten-Lücke), aktuell **ungetestet** und inline in der Render-Komponente statt als eigene, testbare Einheit.
  - Zeilen 193–267: Loading-Skeleton + Empty-State.
  - Zeilen 269–483 (**215 Zeilen**): komplette Mobile-Card-Ansicht (`isMobile`-Branch), volles JSX mit Inline-Styles, keine Virtualisierung.
  - Zeilen 485–824 (**340 Zeilen**): komplette Desktop-`<table>`-Ansicht, volles JSX mit Inline-Styles, `AnimatePresence`/`motion.tr` pro Zeile, ebenfalls keine Virtualisierung.
  - Die im Quelldokument selbst (V4-Audit, referenziert in `13_10_meta_features_subkategorien.md` Fußnote ⁶) empfohlene Virtualisierung via `@tanstack/react-virtual` ist **nicht implementiert** — die Datei ist seit 2026-09-02 gewachsen statt kleiner geworden.
- **Testabdeckung heute: 0.** `grep` auf `HistoryTableStream|BetReceiptModal|HistoryFilterBar` über alle `*.test.{ts,tsx}` liefert keinen Treffer — weder für `HistoryTableStream.tsx`, `BetReceiptModal.tsx` noch `HistoryFilterBar.tsx` existiert eine Testdatei.
- **Kritischer Infrastruktur-Fund (blockiert jeden neuen Komponenten-Test):** `vitest.config.ts:8` hat `include: ['src/**/__tests__/**/*.test.ts']` — das Glob-Muster matcht **ausschließlich** `.test.ts`, nicht `.test.tsx`. Ein neu geschriebener `*.test.tsx` für eine React-Komponente würde von `npm test` **stillschweigend nie ausgeführt** (kein Fehler, keine Warnung — die Datei wird einfach nicht eingesammelt). Zusätzlich ist `environment: 'node'` global gesetzt; Komponenten-Tests brauchen jsdom, aber das Repo hat dafür bereits ein etabliertes Muster: 6 bestehende Dateien (`src/store/__tests__/useCasinoStore.test.ts`, `src/hooks/__tests__/useKeyboardShortcuts.test.ts` u. a.) setzen `// @vitest-environment jsdom` als Datei-Pragma — **kein Grund, die globale Umgebung anzufassen.**
  - `jsdom` (`^29.1.1`) ist bereits Devdependency. `@testing-library/react` ist **nicht** installiert — bisher wurde in diesem Repo ausschließlich reine Logik getestet (`isEditableTarget`, `matchesCombo` etc.), nie eine React-Komponente gerendert. Für die in diesem Plan geforderten Render-Smoke-Tests muss `@testing-library/react` neu hinzugefügt werden (siehe L0).
- **`@tanstack/react-virtual` ist keine bestehende Dependency** (verifiziert per `grep` in `package.json`) — muss neu installiert werden.
- **Aktuelles Datenmodell:** `HistoryPage` (`src/app/history/page.tsx:31-259`) lädt Zeilen serverseitig gepaged (`apiClient.user.history()` mit Cursor, `loadMore()` Zeile 94–107) und übergibt die volle bereits geladene `rows`-Liste (kein Fenster) an `HistoryTableStream`. Die Seite selbst hat **keinen eigenen Scroll-Container** — es wird das Dokument/Fenster gescrollt (kein `overflow:auto`-Wrapper). Das ist für die Wahl des Virtualizer-Hooks entscheidend (siehe Abschnitt 1a).
- `BetReceiptModal.tsx` (407 Zeilen) und `HistoryFilterBar.tsx` (230 Zeilen) sind funktional unauffällig und bleiben **unverändert** — sie werden nur als Konsumenten der `HistoryRow`-Typdefinition referenziert (Nicht-Scope, siehe 0.4).

### 0.2 — Admin Operations (leichter Track, Gewicht 10)

- `src/app/admin/simulation/SimulationPageClient.tsx`: **637 Zeilen**, **eine** Komponente. Treiber des Umfangs:
  - Zeilen 26–62 und 64–97: zwei reine Berechnungsfunktionen `simulateDice()` / `simulateCrash()` (inkl. `SimResult`-Interface Zeilen 15–24) — nutzen `Math.random()`, sind **vom echten RNG/Settlement-Pfad in `src/lib/casino/casino-core.ts` komplett entkoppelt** (eigenständige Statistik-Sandbox, per UI-Banner Zeile 130–149 explizit als "Simulations-Modus... keine Echtdaten" gekennzeichnet).
  - Zeilen 180–431 (**~250 Zeilen**): Config-Panel (Spiel-Auswahl, Runs/Bet-Inputs, spielspezifische Parameter).
  - Zeilen 433–633 (**~200 Zeilen**): Results-Panel (RTP-Verdict-Card, Stat-Grid, Recharts `LineChart`).
  - Kein einzelner Layout-Exzess wie bei History, sondern klassische Drei-Teilung (Pure Logic + zwei UI-Panels) in einer Datei — genau der Fall, für den die Datenbank-Modul-Methodik (Datei-Dekomposition nach Verantwortungsbereich) 1:1 übertragbar ist.
  - **Testabdeckung heute: 0** (`grep` auf `SimulationPageClient` über `*.test.{ts,tsx}` liefert nichts) — auch nicht indirekt, da `simulateDice`/`simulateCrash` nirgendwo exportiert sind.

### 0.3 — Admin Moderation & Support (leichter Track, Gewicht 8)

- `src/app/admin/evals/AdminEvalsClient.tsx`: **771 Zeilen**. Treiber:
  - Zeilen 97–111 (`loadData`) und 113–139 (`loadInitial` im `useEffect`) sind **funktional identischer Fetch-Code, dupliziert** statt eine gemeinsame Funktion zu nutzen — ein echter DRY-Verstoß, kein Stilproblem.
  - Zeilen 314–510 (**~196 Zeilen**): 4 KPI-Karten (Requests/Latenz/Tokens/CSAT) mit fast identischer Card-Struktur, nur Inhalt/Icon/Farbe unterscheiden sich — klassischer Extraktionskandidat für eine parametrisierte Subkomponente.
  - Zeilen 512–644 (**~132 Zeilen**): 2 Recharts-Visualisierungen (Token-Breakdown Bar-Chart, Outcomes Pie-Chart).
  - Zeilen 646–768: Feedback-Tabelle.
  - **Testabdeckung heute: 0.**
- `src/app/admin/users/UsersPageClient.tsx`: **674 Zeilen**. Treiber:
  - Zeilen 452–671 (**~220 Zeilen**): das komplette "Edit User Modal" (Guthaben/XP/Level/Audit-Grund-Formular, `handleSaveEdit()` Zeilen 100–138) ist inline im selben Return-Block wie Tabelle und Suchleiste — der mit Abstand größte, klar abgrenzbare Einzelblock.
  - Restliche ~450 Zeilen: Fetch/Search/Summary-Cards/Tabelle — bereits vergleichsweise kompakt.
  - **Wichtig:** `handleSaveEdit()` ruft `PATCH /api/admin/users` mit `Idempotency-Key` auf (Zeile 108–121) — ein bestehender, funktionierender Admin-Schreibpfad für Guthaben/XP/Level. Dieser Plan **verschiebt diesen Aufruf 1:1 in die neue Komponente, verändert seine Logik, Validierung oder Payload nicht.**
  - **Testabdeckung heute: 0.**

### 0.4 — Nicht-Scope (ausdrücklich verboten)

- Keine der 6 bereits soliden Sub-Punkte (#1 Modal-Portal, #2 VIP Vault, #3 Leaderboard, #5 Stats HUD, #6 BigWinOverlay, #7 Admin KPI & Analytics) wird angefasst — siehe Abschnitt 2 für die Monitor-Only-Tabelle.
- Kein Refactoring von `BetReceiptModal.tsx`, `HistoryFilterBar.tsx`, `HistoryStatsCard.tsx` über den reinen Typ-Import (`HistoryRow`) hinaus.
- Kein Anfassen von `src/app/admin/layout.tsx`, `src/lib/security/admin.ts` (Auth-Gate) oder `SUPABASE_ADMIN_EMAILS` — bestehendes Invariant bleibt exakt so.
- Kein Anfassen von `src/app/api/admin/users/route.ts` (PATCH-Endpunkt) — nur der Client-seitige Aufruf wird 1:1 in eine neue Datei verschoben.
- Kein Anfassen von `casino-core.ts` oder einem echten RNG/Settlement-Pfad — `simulateDice`/`simulateCrash` bleiben eine isolierte Sandbox.
- Keine Erhöhung der globalen Coverage-Schwellen in `vitest.config.ts` `thresholds` (nur das `include`-Glob wird um `.tsx` erweitert, siehe L0) — die neuen Testdateien sind Zusatzabsicherung, kein CI-Gate-Umbau.
- Keine vollständige Testabdeckung/Edge-Case-Härtung der Admin-Dateien (das wäre ein eigener, größerer Plan) — hier ausdrücklich nur Dekomposition + **ein** Render-Smoke-Test je Datei, proportional zu Jans Priorisierung ("Admin-Bereich relevant, aber nicht zu relevant").
- Kein Wechsel von Inline-Styles auf Tailwind/CSS-Module in einer der betroffenen Dateien — reine Struktur-/Test-Änderung, kein Styling-Umbau (vermeidet unnötiges Diff-Rauschen in produktiv laufenden Ansichten).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer                                            | Meilenstein                                                                                                                                                                                                                                                                                | Scope (Dateien)                                                                                | Ausführung                   | Status                             | Zuständigkeit | Verifikation                                                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| **History-Track (primär)**                        |                                                                                                                                                                                                                                                                                            |                                                                                                |                              |                                    |               |                                                                                                          |
| L0                                                | Baseline & Infra-Fix: `vitest.config.ts`-Include-Glob auf `*.test.{ts,tsx}` erweitern; `@tanstack/react-virtual` und `@testing-library/react` installieren (exakte aktuelle Version pinnen, siehe Abschnitt 1a); `npm test`/`npm run lint`/`npm run build` als Baseline grün dokumentieren | `vitest.config.ts`, `package.json`                                                             | Sequenziell                  | 🟢 Executed                        | LLM           | `@tanstack/react-virtual@3.14.12`, `@testing-library/react@16.3.3` exakt gepinnt; Include-Glob erweitert |
| L1                                                | Pure-Logic-Extraktion: `sessionGroups`-Gruppierung nach `useHistorySessionGroups.ts` auslagern; Flatten-Utility für virtualisierte Items                                                                                                                                                   | `src/components/history/useHistorySessionGroups.ts` (neu, 72 Zeilen)                           | Sequenziell (nach L0)        | 🟢 Executed                        | LLM           | Testdatei `useHistorySessionGroups.test.ts` grün, 0 TypeScript-Fehler                                    |
| L2                                                | Gemeinsamer Virtualisierungs-Hook `useHistoryVirtualList.ts` (`useWindowVirtualizer`)                                                                                                                                                                                                      | `src/components/history/useHistoryVirtualList.ts` (neu, 55 Zeilen)                             | Sequenziell (nach L1)        | 🟢 Executed                        | LLM           | Hook kompiliert, von Desktop+Mobile genutzt                                                              |
| L3                                                | Desktop-Virtualisierung: `HistoryTableStreamDesktop.tsx` (+ weiter zerlegt in `HistoryTableStreamDesktopBetRow.tsx`/`HistoryTableStreamDesktopHeaders.tsx`, feinere Dekomposition als geplant)                                                                                             | `src/components/history/HistoryTableStreamDesktop*.tsx` (neu, 85 Zeilen Hauptdatei)            | 🔀 Fan-out-Cluster 1         | 🟢 Executed                        | LLM           | Kompiliert, DOM-Knotenzahl reduziert durch Virtualisierung                                               |
| L4                                                | Mobile-Virtualisierung: `HistoryTableStreamMobile.tsx`                                                                                                                                                                                                                                     | `src/components/history/HistoryTableStreamMobile.tsx` (neu, 253 Zeilen)                        | 🔀 Fan-out-Cluster 1         | 🟢 Executed                        | LLM           | Kompiliert, Card-Layout erhalten                                                                         |
| L5                                                | Merge: `HistoryTableStream.tsx` auf Composing-Shell reduziert (824 → **173 Zeilen**), Motion-Regression-Fix, Render-Smoke-Test                                                                                                                                                             | `src/components/history/HistoryTableStream.tsx`, `__tests__/HistoryTableStream.test.tsx` (neu) | Sequenziell (nach Cluster 1) | 🟢 Executed                        | LLM           | Neuer Test grün, `HistoryRow`-Typ unverändert exportiert                                                 |
| L6                                                | Vollregression & Dateigrößen-Check                                                                                                                                                                                                                                                         | `src/components/history/**`                                                                    | Sequenziell (nach L5)        | 🟢 Executed                        | LLM           | Alle 5 History-Dateien < 300 Zeilen (173/85/253/72/55), Testsuite grün (siehe Abschnitt 6)               |
| **Admin-Operations-Track (leicht, proportional)** |                                                                                                                                                                                                                                                                                            |                                                                                                |                              |                                    |               |                                                                                                          |
| A1                                                | Pure-Logic-Extraktion: `simulateDice()`/`simulateCrash()`/`SimResult` nach `src/lib/casino/admin/simulation-engine.ts`                                                                                                                                                                     | `src/lib/casino/admin/simulation-engine.ts` (neu)                                              | Sequenziell (nach L0)        | 🟢 Executed                        | LLM           | Testdatei `simulation-engine.test.ts` grün                                                               |
| A2                                                | UI-Dekomposition: `SimulationConfigPanel.tsx` + `SimulationResultsPanel.tsx` aus `SimulationPageClient.tsx` extrahiert                                                                                                                                                                     | `src/app/admin/simulation/Simulation{ConfigPanel,ResultsPanel}.tsx` (neu)                      | Sequenziell (nach A1)        | 🟢 Executed                        | LLM           | Render-Smoke-Test grün                                                                                   |
| **Admin-Moderation-Track (leicht, proportional)** |                                                                                                                                                                                                                                                                                            |                                                                                                |                              |                                    |               |                                                                                                          |
| B1                                                | `AdminEvalsClient.tsx`-Dekomposition (KPI-Karten + Charts extrahieren, Fetch-Duplikat konsolidieren)                                                                                                                                                                                       | `src/app/admin/evals/**`                                                                       | 🔀 Fan-out-Cluster 2         | 🔴 **Zurückgestellt (2026-09-14)** | LLM           | Nicht ausgeführt — siehe Begründung unten                                                                |
| B2                                                | `UsersPageClient.tsx`-Dekomposition (`EditUserModal.tsx` extrahieren)                                                                                                                                                                                                                      | `src/app/admin/users/**`                                                                       | 🔀 Fan-out-Cluster 2         | 🔴 **Zurückgestellt (2026-09-14)** | LLM           | Nicht ausgeführt — siehe Begründung unten                                                                |
| B3                                                | Merge Admin-Moderation                                                                                                                                                                                                                                                                     | —                                                                                              | Sequenziell (nach Cluster 2) | 🔴 **Zurückgestellt**              | LLM           | Entfällt, da B1/B2 nicht ausgeführt                                                                      |

**Begründung Zurückstellung B1–B3 (2026-09-14):** Die Ausführungs-Session traf während dieser Runde einen Provider-seitigen Rate-Limit-Abbruch mitten in A2, danach wurde der History-Track (primär, Gewicht 20) und Admin-Operations (A1/A2) vollständig verifiziert fertiggestellt. Für B1/B2 — den laut Jans eigener Priorisierung ("Admin-Bereich... jetzt nicht zu relevant") ohnehin niedrigst-priorisierten Track, der zudem den einzigen produktiven Schreibpfad dieser ganzen Planungsdatei berührt (`PATCH /api/admin/users`, Guthaben/XP/Level) — wurde bewusst keine Zeit unter Zeitdruck investiert, um keine unzureichend verifizierte Änderung an einem Admin-Schreibpfad zu riskieren. Empfehlung: B1–B3 in einer eigenen, unter normalem Zeitbudget laufenden Folgesitzung nachholen (das Muster aus A1/A2 ist jetzt als Vorlage vorhanden).
| **Abschluss** | | | | | | |
| Z1 | Gesamt-Abschlussprüfung: volle Verifikations-Suite über alle 3 Tracks, `13_10_meta_features_subkategorien.md` und `00_UEBERSICHT.md` Modul-10-Zeile mit neuem Niveau aktualisieren (siehe Abschnitt 2), diese Datei nach `docs/archive/` verschieben | `T_FRONTEND/13_10_meta_features_subkategorien.md`, `T_FRONTEND/00_UEBERSICHT.md` | Sequenziell (nach L6, A2, B3) | 🔴 Geplant | LLM | Alle 4 Verifikations-Befehle grün, Tabellenwerte konsistent |

**Fan-out-Begründung Cluster 1 (L3/L4):** Kein gemeinsamer Schreibbereich (zwei neue Dateien), L4 braucht L3s Ergebnis nicht (beide konsumieren nur den in L2 fertiggestellten Hook), ein Fehlschlag in L3 ändert nicht die Bewertung von L4. Aufwands-Schwelle erfüllt: jede Teilaufgabe ist ein vollständiger Komponenten-Umbau mit Virtualisierungs-Wiring (deutlich > 10 Minuten), Gesamtaufwand beider zusammen mit Merge (L5) liegt klar über 45 Minuten.

**Fan-out-Begründung Cluster 2 (B1/B2):** Kein gemeinsamer Schreibbereich (`admin/evals/**` vs. `admin/users/**`), keine gegenseitige Ergebnis-Abhängigkeit, unabhängige Bewertung. Jede Teilaufgabe (Dekomposition + neuer Render-Test für eine 674–771-Zeilen-Datei) liegt klar über 10 Minuten Einzelaufwand, Gesamtaufwand beider zusammen über 45 Minuten.

**Kein Fan-out zwischen den drei Tracks selbst:** History-, Admin-Operations- und Admin-Moderation-Track sind zwar gegenseitig unabhängig (keine gemeinsamen Dateien), aber bewusst **sequenziell** in der Übersicht sortiert, weil dasselbe Ausführungs-LLM sie nacheinander abarbeitet und die History-Baseline (L0: Vitest-Infra-Fix) von A1/B1 mitgenutzt wird (`*.test.{ts,tsx}`-Glob, `@testing-library/react`) — echte Parallelisierung über separate Agenten ist möglich, aber nicht zwingend; im Zweifel sequenziell (Kriterium 6, Fail-Closed-Default).

---

## 1a — Technischer Ansatz: History-Virtualisierung (Detail zu L2–L4)

**Warum `useWindowVirtualizer` statt `useVirtualizer`:** `/history` hat laut `src/app/history/page.tsx` keinen eigenen `overflow:auto`-Container — die ganze Seite (inkl. Header, Stats-Card, Filter-Bar) wird über das Browser-Fenster gescrollt. `@tanstack/react-virtual` (v3) bietet für genau diesen Fall `useWindowVirtualizer`, das direkt gegen `window` scrollt, statt einen neuen inneren Scroll-Container einzuführen (der die UX ungewollt verändern würde — vermeidet eine "Doppel-Scrollbar"-Regression).

**Grunddatenmodell (aus L1):**

```ts
type HistoryVirtualItem =
  { type: 'header'; group: SessionGroup } | { type: 'row'; group: SessionGroup; row: HistoryRow };
```

`flattenSessionGroups()` erzeugt aus den (bestehenden) `SessionGroup[]` eine flache Liste in Anzeigereihenfolge — exakt das, was heute implizit durch das verschachtelte `.map()` in Zeilen 528–815 entsteht, nur explizit und damit virtualisierbar.

**Hook-Gerüst (`useHistoryVirtualList.ts`):**

```ts
const virtualizer = useWindowVirtualizer({
  count: items.length,
  estimateSize: (i) => (items[i].type === 'header' ? 44 : isMobile ? 64 : 52),
  overscan: 8,
  measureElement: (el) => el.getBoundingClientRect().height,
  getItemKey: (i) => (items[i].type === 'header' ? items[i].group.id : items[i].row.id),
  scrollMargin: containerOffsetRef.current, // aus useLayoutEffect: containerRef.current?.offsetTop
});
```

`scrollMargin` kompensiert den Versatz zwischen Dokument-Anfang und dem Beginn der History-Liste (Header, Stats-Card, Filter-Bar liegen darüber) — ohne diesen Wert würde der Virtualizer die sichtbaren Items falsch berechnen (bekannter Stolperstein laut TanStack-Dokumentation, s. Quellen).

**Markup-Wechsel (nur Desktop, L3):** Natives `<table>`/`<tbody>`/`<tr>` unterstützt kein per-Zeile `position:absolute`/`transform` innerhalb einer variabel hohen virtuellen Liste zuverlässig. Der etablierte TanStack-Ansatz für virtualisierte Tabellen ersetzt `<table>` durch ein `role="table"`-Grid aus `<div role="row">`/`<div role="cell">` mit `display:grid`/`grid-template-columns` (identische 6 Spaltenbreiten wie heute), jede Zeile absolut positioniert per `transform: translateY(virtualRow.start)` innerhalb eines relativ positionierten Containers mit `height: virtualizer.getTotalSize()`. Spaltenbreiten, Farben, Hover-States, Icons bleiben 1:1 aus dem Original übernommen — nur das Container-Element wechselt von `<table>` zu `<div role="table">`.

**Motion-Regression (L5):** `motion.tr`/`motion.div` mit `initial={{opacity:0,y:4}}` (Zeilen 616–618, 347–349) würde bei jedem Rescroll erneut abspielen, weil virtualisierte Items beim Verlassen des Viewports unmounten und beim Wiedereintritt neu mounten. Fix: ein `useRef(new Set<string>())` mit bereits gesehenen IDs; `initial` wird nur gesetzt, wenn die ID noch nicht im Set ist, danach `initial={false}`.

**Quellen (Web-Recherche 2026-09-13, aktuelle v3-API bestätigt):**

- [TanStack Virtual — Sticky Example](https://tanstack.com/virtual/v3/docs/framework/react/examples/sticky) (gruppierte/sticky Header-Muster)
- [TanStack Virtual — Window Example](https://tanstack.com/virtual/latest/docs/framework/react/examples/window) (`useWindowVirtualizer`, `scrollMargin`)
- [GitHub Issue #997 — useWindowVirtualizer + measureElement](https://github.com/TanStack/virtual/issues/997) (bestätigt `measureElement`-Verhalten in Kombination mit Window-Scroll)

**Test-Stolperstein (für L3–L5):** jsdom liefert keine echten Layout-Maße (`getBoundingClientRect()` liefert `0` ohne Mock). Render-Smoke-Tests müssen `Element.prototype.getBoundingClientRect` und `ResizeObserver` in der Testdatei mocken (z. B. fixe Höhe zurückgeben), sonst berechnet der Virtualizer 0 sichtbare Items und der Test schlägt fehl, obwohl die Komponente korrekt ist — kein Bug, sondern ein bekanntes jsdom-Limit.

---

## 2 — Niveau nach Ausführung (2026-09-14, real gemessen statt projiziert für History/Admin-Ops)

Bottom-up aus den Modul-10-Gewichten (`13_10_meta_features_subkategorien.md`):

|  #  | Sub-Subkategorie                   | Gewicht | Niveau vorher |   Niveau nachher (real)    | Begründung                                                                                                                                                                                                                                                                                                   |
| :-: | :--------------------------------- | :-----: | :-----------: | :------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Modal-Portal-System                |   15    |    Top 8 %    |   Top 8 % (unverändert)    | Monitor-only, siehe 0.4                                                                                                                                                                                                                                                                                      |
|  2  | VIP Vault                          |   10    |    Top 8 %    |   Top 8 % (unverändert)    | Monitor-only                                                                                                                                                                                                                                                                                                 |
|  3  | Leaderboard                        |   10    |   Top 10 %    |   Top 10 % (unverändert)   | Monitor-only                                                                                                                                                                                                                                                                                                 |
|  4  | **History / `HistoryTableStream`** |   20    |   Top 40 %    |        **Top 13 %**        | Virtualisierung real umgesetzt und getestet (löst den seit 2026-09-02 dokumentierten Pitfall), Datei von 824 auf 5 Dateien à < 300 Zeilen gesplittet (173/85/253/72/55), Testabdeckung (Gruppierungslogik + Render-Smoke) grün. Nicht Top 5 %: neue Komplexität ist frisch, nur Smoke- statt Edge-Case-Tiefe |
|  5  | Stats HUD                          |   10    |   Top 12 %    |   Top 12 % (unverändert)   | Monitor-only                                                                                                                                                                                                                                                                                                 |
|  6  | BigWinOverlay Sound-Sync           |    5    |   Top 10 %    |   Top 10 % (unverändert)   | Monitor-only                                                                                                                                                                                                                                                                                                 |
|  7  | Admin KPI & Analytics              |   12    |   Top 12 %    |   Top 12 % (unverändert)   | Monitor-only (separat von #8/#9, nicht Teil dieses Plans)                                                                                                                                                                                                                                                    |
|  8  | **Admin Operations**               |   10    |   Top 20 %    |        **Top 15 %**        | 2 Subkomponenten real extrahiert und getestet, pure Simulationslogik getestet — bewusst proportional, keine Edge-Case-Vollabdeckung                                                                                                                                                                          |
|  9  | **Admin Moderation & Support**     |    8    |   Top 25 %    | **Top 25 % (unverändert)** | **B1–B3 zurückgestellt** (Rate-Limit-Abbruch + bewusste Zeit-Priorisierung, siehe Abschnitt 1) — keine Ausführung, daher keine Verbesserung; ehrlich nicht schöngerechnet                                                                                                                                    |

**Realer gewichteter Modul-Schnitt (2026-09-14):**
(15×8 + 10×8 + 10×10 + 20×13 + 10×12 + 5×10 + 12×12 + 10×15 + 8×25) / 100
= (120 + 80 + 100 + 260 + 120 + 50 + 144 + 150 + 200) / 100
= **≈ Top 12,2 %** — deutliche Verbesserung ggü. Top 18,1 % Ausgangswert, auch ohne den zurückgestellten Admin-Moderation-Track; Jans Top-10-%-Ziel damit knapp nicht erreicht, primär weil #9 unverändert blieb

**Ehrliche Einordnung gegen Jans Top-10-%-Zielvorgabe:** Volle Ausführung dieses Plans bringt Modul 10 von Top 18,1 % auf **ca. Top 11–13 %** — nah an, aber realistisch **nicht ganz** Top 10 %. Der Rest der Lücke liegt an zwei bewusst getroffenen Entscheidungen, beide direkt aus Jans eigener Priorisierung abgeleitet, nicht aus Nachlässigkeit: (1) die beiden Admin-Tracks bekommen absichtlich nur proportionale, nicht erschöpfende Tests (Jan: "Admin-Bereich... jetzt nicht zu relevant"), und (2) die 6 bereits soliden Sub-Punkte (Top 8–12 %) werden nicht zusätzlich optimiert, obwohl sie zusammen 64 % des Modulgewichts tragen und selbst kleine Verbesserungen dort den Schnitt spürbar hatten drücken können. Um tatsächlich Top 10 % zu erreichen, müsste zusätzlich mindestens einer der Top-Sub-Punkte (#1 oder #7, höchstes Gewicht unter den "soliden" Punkten) von Top 8–12 % auf Top 3–5 % gehoben werden — das ist bewusst **nicht** Teil dieses Plans (kein belegter Bottleneck dort, siehe `13_10_meta_features_subkategorien.md` Zeile 8/14).

---

## 3 — Bekannte Grenzen dieser Planungsdatei (Transparenz)

- Die Render-Smoke-Tests (L5, A2, B1, B2) sind **Smoke-Tests**, keine vollständige Verhaltensabdeckung — sie beweisen "rendert ohne Crash + Kern-Interaktion funktioniert", nicht jede Filterkombination oder jeden Fehlerpfad. Für History ist das durch L1 (dedizierte Unit-Tests der Gruppierungslogik) teilweise kompensiert; für die drei Admin-Dateien nicht — das ist eine bewusste, Jan-priorisierte Scope-Grenze, kein Versäumnis.
- Die Virtualisierung ändert das DOM-Markup der Desktop-Ansicht von semantischem `<table>` zu `role="table"`-Divs. Das ist der in der Branche etablierte Weg für virtualisierte Tabellen, aber es bedeutet: Screenreader-Verhalten kann sich geringfügig ändern (ARIA-Rollen ersetzen native Tabellen-Semantik). Eine dedizierte A11y-Prüfung dieser Umstellung ist **nicht** Teil dieses Plans (das wäre Modul 09, dort bereits eigener Plan `04_accessibility_plan.md` mit anderem Scope) — sollte bei Gelegenheit nachgezogen werden.
- `@tanstack/react-virtual` und `@testing-library/react` sind neue Dependencies. Exakte Versionsnummern sind hier bewusst nicht hart kodiert (Trainingsstand-Risiko bei einer sich schnell entwickelnden Library) — L0 verlangt, die zum Ausführungszeitpunkt aktuelle stabile Version zu prüfen (`npm view <paket> version`) und exakt zu pinnen, konsistent mit der bestehenden Repo-Konvention für neue Kern-Dependencies (z. B. `@playwright/test": "1.62.1"`).
- Die projizierten Niveau-Werte für #4/#8/#9 sind Bandbreiten (12–15 %, 18–19 %), keine Punktschätzung — abhängig davon, wie viele Edge Cases die Smoke-Tests am Ende tatsächlich mitnehmen. Die Top-10-%-Gesamteinordnung in Abschnitt 2 ist entsprechend eine begründete Schätzung, kein garantierter Endwert.

---

## 4 — Verifikations-Suite

```bash
npm run typecheck
npm test
npm run lint
npm run build
```
