# 13_08 — Performance & Core Web Vitals: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 08 (Gewicht 10, Niveau Top 14 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Desktop Core Web Vitals (LCP/CLS/INP) | **20** | Top 3 % | Lighthouse-verifiziert (`worldmap` Zeile 12): LCP 1,3s, CLS 0,00, INP 18ms, Performance-Score 97 |
| 2 | Mobile Core Web Vitals (LCP/TBT) | **30** | Top 45 % | Größte reale Lücke der Säule: historisch LCP 5,7s/TBT 1.120ms (Lighthouse, Standard-Throttling), Ursache laut Doku „nicht weiter isoliert"; kein frischer Mobile-Lighthouse-Lauf heute |
| 3 | Bundle-Splitting / Dynamic Imports | **20** | Top 12 % | Slots-Engine, Provably-Fair-Modal, Settings/MFA-Modal und Recharts konsequent per `next/dynamic` ausgelagert |
| 4 | Font-Preloading (`next/font`) | **10** | Top 5 % | `Geist`/`Fira Code` buildzeit-gebündelt, 0 Requests an Google-Server laut Doku |
| 5 | Bild-Optimierung (`sizes`/`priority`) | **10** | Top 15 % | Responsive `sizes`-Attribute im Arcade-Grid vorhanden, keine repoweite Stichprobe auf fehlende `sizes`-Attribute durchgeführt |
| 6 | Bundle-Gesamtgröße & tote Dependencies | **10** | Top 40 % | `worldmap` Zeile 12: 3,0 MB `.next/static/chunks` gesamt; `@react-three/fiber`/`three` (~600 KB) mit 0 Code-Treffern bestätigt tot, aber nicht entfernt |
