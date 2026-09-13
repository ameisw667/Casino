# 13_01 — Layout, Shell & Navigation: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 01 (Gewicht 15, Niveau Top 12 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Tri-State Shell-Routing (`ClientShell.tsx`) | **25** | Top 10 % | 5 Sandbox-Pfade (`/v2`, `/testing`, `/lab`, `/games-2`, `/refactoring`) als String-Vergleiche statt Config-Array — funktional, aber jede neue Sandbox erfordert manuelle Ergänzung |
| 2 | Z-Index-Zonen-System (8 Zonen, `z-0`–`z-99999`) | **15** | Top 15 % | Zonen dokumentiert und laut `xx_sop/04_design_system_ui.md` Abschnitt 10 teils noch als Inline-Style/Klassen-Mischung statt einheitlicher Token-Quelle |
| 3 | MainLayout / MainHeader / MainSidebar / Lobby-Grid | **20** | Top 18 % | 5 Dateien > 600 Zeilen konzentriert hier (`NeonArcadeDashboardView.tsx` 746, `WheelCarousel.tsx` 686, `LobbyScrollChoreography.tsx` 620, `InteractiveArcadeGrid.tsx` 609, `HeroSectionV2.tsx` 573) — größte Datei-Ballung der ganzen Säule |
| 4 | Mobile Nav & Viewport (`100dvh`, `MobileNav.tsx`) | **15** | Top 10 % | `min-h-[100dvh]`-Fix gegen iOS-Safari-Sprung dokumentiert und im Code verifiziert (`ClientShell.tsx`) |
| 5 | Modal-Orchestrierung (`MainLayoutModals.tsx`) | **15** | Top 8 % | Vollständig aus `MainLayout.tsx` entkoppelt, ein ESLint-Fund: ungenutzter Import `ProvablyFairModal` in `MainLayoutModals.tsx` |
| 6 | Sandbox-Isolation (`/v2`, `/testing`, `/lab`, `/games-2`, `/refactoring`) | **10** | Top 25 % | 5 parallele, isolierte Test-Routen ohne dokumentiertes Aufräum-Datum — wachsende technische Schuld, kein akutes Risiko |
