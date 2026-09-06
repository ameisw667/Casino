# Sidebar Text-First Design

> Status: Execution-Ready · Freigegeben von Jan am 2026-09-06 · Revert-freundlicher K3-Shell-Umbau.

## Ziel

Die sieben generischen Navigationssymbole von Lobby bis Settings werden entfernt. Die Sidebar bleibt in der Obsidian-und-Gold-Sprache schnell erfassbar: Text ist der primäre Anker, die aktive Route erhält Goldfarbe, eine linke Goldlinie, einen zurückhaltenden Verlauf und `aria-current="page"`.

## Festgelegte Lösung

- Keine neuen Bildgenerierungen und keine OpenAI-API-Aufrufe für Navigation.
- Logo, Royale-Guide-Motiv und das Secure-&-Fair-Motiv bleiben vorhandene, semantisch sinnvolle Bilder.
- Desktop-Sidebar ist dauerhaft 240 px breit. Der frühere 80-px-Klappzustand und sein Chevron werden entfernt, weil Textnavigation dort keine verständliche, gleichwertige Darstellung hätte.
- Der Mobile-Drawer bleibt 280 px breit und zeigt dieselben Textzeilen mit mindestens 44 px Zielhöhe.
- Settings behält sein Popover-Verhalten; nur die ungenutzte Logik zum Aufklappen der Desktop-Sidebar entfällt.

## Betroffene Grenzen

- `src/components/layout/MainLayout.tsx`: liefert die sieben Label/Route-Einträge und Shell-Zustand.
- `src/components/layout/MainSidebar.tsx`: rendert Navigation, aktive Zustände und Drawer.
- Kein Wallet-, Auth-, API-, Store- oder Modal-Verhalten wird verändert.

## Abnahme

1. Jede der sieben Routen ist als Text sichtbar und klickbar.
2. Keine generischen SVG-/Bild-Icons befinden sich in den sieben Navigationszeilen.
3. Logo, Royale Guide und Secure & Fair bleiben erhalten.
4. Die aktive Route bleibt über Gold, Linie, Verlauf, Gewicht und `aria-current` unterscheidbar.
5. Mobil keine horizontale Überbreite; Desktop keine leeren, eingeklappten Navigationszeilen.
6. Rücknahme ist auf die genannten Sidebar-Dateien plus Test und Planungsstatus begrenzt.

## Verifikation

- Regressionstest für textbasierte Navigation und den fehlenden Desktop-Klappbutton.
- Typecheck, gezielter Lint, Projekt-Lint, Production-Build und dateibezogener Diff-Audit.
- Sichtprüfung auf `http://localhost:3015/` bei Mobil- und Desktop-Breite.
