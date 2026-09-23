# 13_02 — Design-Tokens & CSS: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 02 (Gewicht 15, Niveau Top 10 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie                                                | Gewichtung |  Niveau  | Kurzbefund                                                                                                                              |
| :-: | :-------------------------------------------------------------- | :--------: | :------: | :-------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Farb-Token-Konsistenz (CSS-Variablen vs. Hardcoded Hex)         |   **25**   | Top 12 % | Vom Dokument selbst als Pitfall 1 benannt: `bg-[#D4AF37]`-Hardcoding bricht Theme-Switching — kein automatisiertes Lint-Verbot gefunden |
|  2  | UI-Primitives (`GlassSurface.tsx`, `SuperButton.tsx`)           |   **20**   | Top 8 %  | Single-Source-of-Truth für Glasmorphismus, Radius-Skala und Elevation-Schatten sauber typisiert                                         |
|  3  | Konzentrische Radien-Formel ($R_{out}=R_{in}+P$)                |   **15**   | Top 20 % | Nur als Formel/Konvention dokumentiert, keine automatisierte Prüfung (Lint-Regel oder Test) gefunden, die Verstöße erkennt              |
|  4  | Tabular-Nums-Pflicht bei Zahlenwerten                           |   **20**   | Top 15 % | Mandatorisch dokumentiert (`font-mono tabular-nums`), Durchsetzung erfolgt nur über Konvention/Code-Review, kein Lint-Gate              |
|  5  | `globals.css` Health (59 KB, historische Keyframes)             |   **10**   | Top 30 % | Vom V4-Audit selbst als offener Restpunkt benannt: alte Keyframe-Animationen noch nicht in Tailwind-Plugins ausgelagert                 |
|  6  | Style-Dictionary Token-Pipeline (`style-dictionary.config.mjs`) |   **10**   | Top 15 % | 1 frischer ESLint-Fund: `import/no-anonymous-default-export` — Objekt sollte vor Export einer Variable zugewiesen werden                |
