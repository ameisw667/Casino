# Proposal: Interactive Text Repel

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/text-repel](https://componentry.dev/docs/components/text-repel)  
> **Kategorie:** Interactive Badges / Tactile Micro-Interactions / Liquid Cursor Physics  
> **Technologie:** Cursor Proximity Vector Physics + Spring Repulsion + Fluid Typography  
> **Bewertung:** ⭐⭐ Bestätigt („sehr gut“)

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **R1** | **VIP Club & Vault: Rang-Slogan & Status-Badge** | `http://localhost:3015/vault` | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)<br>VIP-Profil-Header (`VibeCoder_Royale`, `PLATINUM LVL 35`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_1_vip_badge.png)<br>![VIP Badge](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_1_vip_badge.png) | **Haptisches Luxus-Gefühl beim Berühren des VIP-Status:** Wenn der High Roller mit der Maus über seinen Nutzernamen und das Platinum-Abzeichen streicht, weichen die goldenen Buchstaben magnetisch dem Cursor aus wie flüssiges Quecksilber und federn elastisch zurück. |
| **R2** | **Provably Fair: Kryptografischer Verification-Badge** | `http://localhost:3015/testing/fe-28-provably-fair` (sowie alle Spielmodals) | [`src/components/casino/ProvablyFairModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairModal.tsx)<br>Kryptografische Headerzeile (`CRYPTOGRAPHIC PCB ENGINE · 256-BIT · DETERMINISTIC`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_2_provably_fair.png)<br>![Provably Fair](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_2_provably_fair.png) | **Lebendige kryptografische Integrität:** Mathematische Zusicherungen wirken oft steril. Durch die haptische Repel-Reaktion auf Cursor-Nähe fühlt sich der SHA-256-Schutzschild wie ein interaktives Kraftfeld an. |
| **R3** | **Spielekatalog & Live-Ticker: Section Header** | `http://localhost:3015/games` | [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)<br>Header-Leiste `GAME CATALOG` mit angebundenem Live-Gewinn-Ticker | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_3_catalog_header.png)<br>![Catalog Header](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_3_catalog_header.png) | **Taktile Entdecker-Lust:** Beim Überfliegen der Spielekatalog-Kopfzeile stoßen die Zeichen leicht ab. Bringt sofortige Dynamik in die statische Navigationsleiste, ohne die Lesbarkeit im Ruhezustand zu beeinträchtigen. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Vektor-Distanz-Berechnung:** Mausabstand wird über `Math.hypot(dx, dy)` in einem lokalen Radius von $80\text{ px}$ berechnet. Außerhalb des Radius bleibt der Berechnungsaufwand exakt $0$.
- **Spring Physics:** Framer Motion oder Lightweight Canvas-Interpolator (`stiffness: 400, damping: 25`) stellt sicher, dass die Typografie sofort und ohne Trägheitsverzögerung in den Ruhezustand schnappt.
- **Barrierefreiheit / Reduced Motion:** Bei aktivierter `prefers-reduced-motion`-Option wird der Repel-Effekt deaktiviert; Text verbleibt absolut statisch.

---

## 3 — Next-Level Potenziale & Zukunftserweiterungen

1. **Fluid Viscosity & Elastic Surface Tension:** Zeichen werden durch ein unsichtbares Federnetzwerk miteinander gekoppelt, sodass Nachbarbuchstaben wie bei einer flüssigen Oberfläche (Quecksilber/Gold-Gelee) geschmeidig mitgezogen werden.
2. **Haptic Magnetic Plucking:** Beim Verlassen des Cursors schwingt die Typografie wie eine gezupfte Gitarrensaite mikroskopisch aus, bevor sie in absoluter Ruhe verharrt.
3. **VIP-Rang-Farb-Morphing:** Im Vault morpht die Abstoßungskraft zusätzlich die Textfarbe der Zeichen je nach Cursor-Distanz entlang des Spektrums des jeweiligen VIP-Ranges (z. B. Gold zu Platinum-Glanz).

