# Neon Arcade Complete Lobby — Implementation Plan

> **Execution:** Der Nutzer hat die direkte Durchführung ausdrücklich freigegeben. Wegen bereits vorhandener unversionierter Neon-Arcade-Arbeit und des laufenden Localhost-Kontexts wird kontrolliert im aktuellen Workspace gearbeitet; kein Commit, Merge oder Push.

**Goal:** Deep Verdigris umsetzen und die Neon-Arcade-Seite zu einer vollständigen, ehrlichen, responsiven Casino-Lobby ausbauen.

**Architecture:** Eine reine Lobby-Modellschicht erzeugt serverseitige Snapshot-Daten und clientseitige Reward-/Countdown-Ableitungen. Eine öffentliche API liefert den Snapshot. Der bestehende Container bindet Store, API und UI-State; ein neues Präsentationsmodul rendert Jackpot, Trust, Tournament und Rewards. Die kanonische Route und der Test-Alias teilen dieselbe Lobby-Komponente.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, CSS Modules, Zustand, Lucide React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-14-neon-arcade-complete-lobby-design.md`

## Global Constraints

- Keine Änderung an `/`, Wallet, Game Rules, Datenbank oder bestehenden Produktions-Lobby-Komponenten.
- Keine neue npm-Abhängigkeit und keine externen Bild-/Avatar-Assets.
- Keine zufälligen oder im Browser animierten Geldwerte; keine erfundenen Leader.
- Deep-Verdigris-Tokens exakt aus der Spec; Lime nur für Aktionen, Auswahl und Fortschritt.
- Der aktuelle Dirty Worktree außerhalb der genannten Dateien bleibt unangetastet; kein Commit.
- `/neon-arcade` und der vorhandene Test-Alias bleiben direkt erreichbar und standalone.

---

### Task 1: Lobby-Datenverträge testgetrieben absichern

**Files:**

- Create: `src/components/home/neon-arcade-lobby-model.ts`
- Create: `src/components/home/__tests__/neon-arcade-lobby-model.test.ts`

- [ ] Failing Tests für deterministischen Snapshot, UTC-Turniergrenzen, Countdown-Clamping und VIP-Fortschritt schreiben.
- [ ] RED ausführen.
- [ ] Minimale Typen und reine Funktionen implementieren.
- [ ] GREEN ausführen.

### Task 2: Öffentlichen Snapshot und kanonisches Routing einführen

**Files:**

- Create: `src/app/api/neon-arcade/lobby/route.ts`
- Create: `src/app/neon-arcade/page.tsx`
- Modify: `src/app/testing/neon-arcade-dashboard/page.tsx`
- Modify: `src/components/layout/shell-routing.ts`
- Modify: `src/components/layout/ClientShell.tsx`
- Modify: `src/proxy.ts`
- Modify: zugehörige Routing-/Security-Tests

- [ ] Tests für standalone `/neon-arcade`, öffentlichen Page-/API-Pfad und Alias-Vertrag schreiben; RED ausführen.
- [ ] API mit `Cache-Control: no-store`, kanonische Metadata und `noindex`-Alias implementieren.
- [ ] ClientShell auf den zentralen Shell-Resolver umstellen, ohne andere Routen zu verändern.
- [ ] Routing-Tests grün ausführen.

### Task 3: Vollständige Lobby-Module testgetrieben definieren

**Files:**

- Create: `src/components/home/NeonArcadeLobbySections.tsx`
- Create: `src/components/home/NeonArcadeLobbySections.module.css`
- Create: `src/components/home/__tests__/neon-arcade-lobby-sections.test.ts`
- Modify: `src/components/home/NeonArcadeDashboardView.tsx`
- Modify: `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

- [ ] Render-Verträge für Jackpot, vier Proof Metrics, Tournament, Preisleiter, Reward Rail und Loading-/Unavailable-Zustände schreiben; RED ausführen.
- [ ] Casino-native Ledger-/Board-/Rail-Struktur mit semantischen Überschriften und Links implementieren.
- [ ] Neue Kapitel nach Game Floor und vor Session Insights integrieren; Indizes auf 01–05 fortführen.
- [ ] Render-Tests grün ausführen.

### Task 4: Store/API-Logik und Drawer-Fokus integrieren

**Files:**

- Modify: `src/components/home/NeonArcadeDashboard.tsx`
- Modify: `src/components/home/NeonArcadeDashboardView.tsx`
- Modify: `src/components/home/__tests__/neon-arcade-dashboard-view.test.ts`

- [ ] Lobby-Fetch mit `loading/ready/unavailable`, VIP-Config-Load und Reward-Ableitung anbinden.
- [ ] Countdown nach Mount aktualisieren und sauber aufräumen.
- [ ] Drawer-Fokusfalle und Fokus-Rückgabe ergänzen, ohne Desktop-Navigation zu beeinflussen.
- [ ] Unit-/Render-Tests grün ausführen.

### Task 5: Deep Verdigris und responsive Materialität umsetzen

**Files:**

- Modify: `src/components/home/NeonArcadeDashboard.module.css`
- Modify: `src/components/home/NeonArcadeLobbySections.module.css`
- Modify: `tests/neon-arcade-dashboard-colorway.spec.ts`

- [ ] Verbindliche Tokens und Hero-Fläche auf Deep Verdigris umstellen.
- [ ] Lime auf aktive/primäre Zustände begrenzen; Jackpot=Saffron, Trust=Teal, Tournament=Terracotta, VIP=Aubergine semantisch einsetzen.
- [ ] 4→2→1 Responsive-Raster und Reduced-Motion-Abschaltung implementieren.
- [ ] Browser-Tests für Tokens, Struktur, Interaktion, Fokus, Kontrast und Overflow ausbauen.

### Task 6: Drei-Perspektiven-Execution-Review und Korrektur

**Files:**

- Verify/modify: alle Neon-Arcade-Dateien dieses Plans.

- [ ] Product/Player: Informationsreihenfolge, klare CTAs, täglicher Rückkehrgrund und ehrliche Datenzustände prüfen.
- [ ] Creative: Akzentdisziplin, kein Glow, keine uniformen Bento-Karten, erwachsene Typo-/Materialhierarchie prüfen.
- [ ] Engineering/Trust: API-/Timer-/Fallback-/Fokus-/Hydration-/Routing-Verträge prüfen.
- [ ] Critical/Important Findings korrigieren und gezielt re-verifizieren.

### Task 7: Vollständige Verifikation und Dokumentation

**Files:**

- Modify: diese Plan-Datei
- Modify: `docs/superpowers/specs/2026-08-14-neon-arcade-complete-lobby-design.md`
- Modify: `worldmap/02_FRONTEND_REDESIGN.md`

- [ ] Gezielte Tests, ESLint, TypeScript und Production Build ausführen.
- [ ] Browser-QA bei 1280×720, 1024×768 und 390×844; Konsole, Overflow, Interaktionen und Reduced Motion prüfen.
- [ ] Finalen Code-Review durchführen und Findings beheben/reviewen.
- [ ] Worldmap um Entscheidung, Architektur, URLs, Stakeholder-Review, Risiken und tatsächliche Gates ergänzen.
- [ ] Requirement-by-Requirement Completion Audit durchführen und erst danach abschließen.

## Plan-Self-Review

| Prüfung         | Ergebnis                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Spec-Coverage   | Colourway, alle gewünschten Lobby-Module, Datenlogik, Routing, Accessibility, Responsive und Dokumentation sind Tasks zugeordnet |
| Schnittstellen  | Modell → API/Container → View ist explizit; VIP-Tiers bleiben einzige Reward-Quelle                                              |
| Risiko-Coverage | Zufallswerte, Fake-Leader, Hydration, API-Ausfall, Fokus, Shell-Doppelung und Mobile-Overflow besitzen Tests/Gegenmaßnahmen      |
| Sequenz         | Reine Verträge zuerst, dann Routing/API, View, Integration, Visuals, Review und Abschluss                                        |
| Scope           | Keine Root-Lobby-/Wallet-/Game-Rule-Änderung; Alias bleibt erhalten                                                              |
| Ausführbarkeit  | Jeder Task nennt Dateien, RED/GREEN oder konkrete Gates; keine offenen Entscheidungen                                            |

**Ruling:** Umsetzung im aktuellen Workspace statt neuem Worktree — die Zielkomponenten sind bereits unversioniert im laufenden Checkout und müssen am bestehenden `localhost:3015` sichtbar bleiben. Kosten bei Fehlentscheidung: geringere Branch-Isolation; kompensiert durch enge Dateigrenzen, kein Commit und abschließenden Diff-/Status-Audit.
