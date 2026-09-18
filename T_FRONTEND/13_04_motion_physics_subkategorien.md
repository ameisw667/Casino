# 13_04 — Motion & Spring-Physik: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 04 (Gewicht 10, Niveau Top 8 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Spring-Profil-Standardisierung (`motion-tokens.ts`) | **20** | Top 8 % | 4 benannte Profile (`snappy`, `smoothModal`, `bouncyCelebration`, `gentleHover`) zentral definiert und referenziert |
| 2 | 3D Tilt-Glare Engine (`useTiltGlare.ts`) | **20** | Top 10 % | Pointer-Tracking läuft vollständig über `MotionValue`/`useSpring`, kein `useState` für Zeigerposition gefunden |
| 3 | Reduced-Motion-Handling (`useSafeMotion`, `useReducedMotion`) | **20** | Top 12 % | A11y-Guard vorhanden und in `useTiltGlare` verdrahtet (`isFrozen`), keine repoweite Stichprobe auf fehlende Guards in Einzelkomponenten durchgeführt |
| 4 | Canvas-rAF Mobile-Drosselung (`LobbyAmbientBackground.tsx`) | **20** | Top 8 % | `requestAnimationFrame`-Schleife auf < 1024px vollständig deaktiviert, laut Doku 60 FPS stabil |
| 5 | Partikelsysteme (`ParticleBurst.tsx`, Memory-Pooling) | **20** | Top 20 % | Vom Dokument selbst als Pitfall 2 benannt: Memory-Leak-Risiko bei unaufgeräumten Partikel-Arrays, 2,5s-Cleanup als Lösung beschrieben, nicht unabhängig verifiziert |
