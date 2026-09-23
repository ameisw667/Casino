# 04 — Homepage Hero Relaunch: Cinematic Quantum Warp Stage (Option A)

> **Status:** Executed (archiviert) · **Stand:** 2026-09-13 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Umbau der Startseiten-Hero-Bühne (`/`) auf Option A (Cinematic Quantum Warp Stage) — Entfernung der "Live High Roller feat." Cinema-Kapsel, Verdopplung des GSAP ScrollTracks auf 200vh, Implementierung des synchronen 3D-Elements (Quantum Genesis Key / VIP Multiplier Orbit) oben links, nahtloser Morph-Curtain in Sektion 2.
> **Money-Pfad:** Nein · **Security-Review:** Nein — reiner Frontend-Motion- und Präsentations-Layer ohne Wallet-, Auth- oder DB-RNG-Mutationen.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                    | Scope (Dateien)                                                               | Ausführung  |      Status      | Zuständigkeit | Verifikation                                                            |
| :----- | :--------------------------------------------- | :---------------------------------------------------------------------------- | :---------- | :--------------: | :-----------: | :---------------------------------------------------------------------- |
| **L0** | **Bereinigung & Entschlackung**                | `HeroScrollyStage.tsx`, `HeroCenterCinema.tsx`                                | Sequenziell | 🟢 Abgeschlossen |      LLM      | Center-Cinema rückstandslos entfernt, kein 3er-Bento-Gefühl mehr        |
| **L1** | **Synchrones 3D-Element (Oben Links)**         | `HeroQuantumOrbit.tsx`, `HeroHeadlineColumn.tsx`                              | Sequenziell | 🟢 Abgeschlossen |      LLM      | Orbiting Quantum Key mit GSAP/Framer-Parallaxe gerendert                |
| **L2** | **200vh Warp-Scrollytelling & 3D Flythrough**  | `HeroScrollyStage.tsx`, `HeroScrollyPortalVisual.tsx`, `HeroMorphCurtain.tsx` | Sequenziell | 🟢 Abgeschlossen |      LLM      | GSAP ScrollTrigger auf 200vh erweitert, Multi-Phase Scale/Rotation/Blur |
| **L3** | **Responsive & Layout-Stabilität**             | `HeroScrollyStage.tsx`, `BentoLobbyHome.tsx`                                  | Sequenziell | 🟢 Abgeschlossen |      LLM      | Mobile-First Unpinning, 0 Overflow-Bugs auf 320px–1920px                |
| **L4** | **5-Stufen-DoD & Automatisierte Tests**        | `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`              | Sequenziell | 🟢 Abgeschlossen |      LLM      | 100 % grün, 0 Errors/Warnings                                           |
| **L5** | **Visuelle 5%-Scrolly-Verifikation (0–100 %)** | `scripts/capture-5pct-steps.mjs`, Playwright                                  | Sequenziell | 🟢 Abgeschlossen |      LLM      | 21 frische Screenshots im 5%-Raster, visuelle Analyse                   |
