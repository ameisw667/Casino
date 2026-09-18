# 05 — Homepage Hero: Awwwards-Editorial Multiplier Sequence & 3D Portal Roll (Phase 3)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-13 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Awwwards-Editorial Veredelung der Hero-Bühne (`/`) — Restlose Entfernung von `HeroQuantumOrbit`, Vergrößerung des 3D-Portals auf 480px ohne "PROVABLY FAIR"-Badge, spektakulärer 3D-Achsen-Roll (`rotateY: 180°`, scale, Lichtkorona), synchrone Awwwards-Editorial Multiplikator-Sequenz links zur Füllung des Vakuums bei 30%–70% Scroll.
> **Money-Pfad:** Nein · **Security-Review:** Nein — reiner Motion- & Visual-Layer.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                            | Scope (Dateien)                                                                              | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                                  |
| :----- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------- | :---------- | :--------------: | :-----------: | :---------------------------------------------------------------------------- |
| **L0** | **Bereinigung & Badge-Entfernung**                     | `HeroQuantumOrbit.tsx`, `HeroScrollyDesktopPortalVisual.tsx`                                 | Sequenziell | 🟢 Abgeschlossen |      LLM      | Orbit gelöscht, störendes Badge restlos entfernt                              |
| **L1** | **Monumentale Vergrößerung (0% Scroll)**               | `HeroScrollyDesktopPortalVisual.tsx`, `HeroScrollyStage.tsx`                                 | Sequenziell | 🟢 Abgeschlossen |      LLM      | Portal-Basisdurchmesser auf 480px angehoben, plastischer Raum                 |
| **L2** | **Awwwards-Editorial Multiplikator-Storyline (Links)** | `src/components/home/hero-scrolly/HeroMultiplierEditorial.tsx` [NEW], `HeroScrollyStage.tsx` | Sequenziell | 🟢 Abgeschlossen |      LLM      | Typografische High-Roller Stelen (500x, 0.00s, 99.4%) steigen bei 30%–70% auf |
| **L3** | **Spektakulärer 3D-Achsen-Roll & Z-Drift (Rechts)**    | `HeroScrollyStage.tsx`, `HeroScrollyDesktopPortalVisual.tsx`                                 | Sequenziell | 🟢 Abgeschlossen |      LLM      | GSAP ScrollTrigger steuert `rotateY: 180°`, 3D-Roll und Korona-Flare          |
| **L4** | **5-Stufen-DoD (Typecheck, Test, Build, Lint, Audit)** | `npm run typecheck`, `npm test`, `npm run build`, `scripts/fast-responsive-audit.mjs`        | Sequenziell | 🟢 Abgeschlossen |      LLM      | 100% grün (235 Testdateien, Build OK, 0 Issues auf `/`)                       |
| **L5** | **Visuelle 10%-Sequenz (0% bis 100%)**                 | `scripts/capture-10pct-steps.mjs` [NEW], Playwright                                          | Sequenziell | 🟢 Abgeschlossen |      LLM      | 11 gestochen scharfe Screenshots (0%–100%) validiert                          |
