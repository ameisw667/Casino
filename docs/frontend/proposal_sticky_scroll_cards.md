# Proposal: Sticky Scroll Cards

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/sticky-scroll-cards](https://componentry.dev/docs/components/sticky-scroll-cards)  
> **Kategorie:** Spatial Navigation / Guided Storytelling / Layered Stacks  
> **Technologie:** Scroll-Linked Dynamic Scaling + Stacking Elevation + Opacity Blur  
> **Bewertung:** ⭐⭐⭐ Absoluter Favorit

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **S1** | **VIP Onboarding & Feature-Tour Guide** | `http://localhost:3015/` (sowie Onboarding Flow) | [`src/components/casino/onboarding/StickyScrollTour.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/onboarding/StickyScrollTour.tsx)<br>4-Schritte-Tour (Willkommens-Paket, Spiele, Provably Fair, VIP Rakeback) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_1_onboarding.png)<br>![Onboarding Tour](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_1_onboarding.png) | **Haptisches Blättern durch exklusive Club-Karten:** Statt eines einfachen Dialogs schieben sich die 4 Einführungskarten beim Scrollen wie schwere Luxus-Dokumente übereinander. Vorherige Karten treten mit subtilem Blur und Verkleinerung in den Hintergrund. |
| **S2** | **Provably Fair: Mathematische 3-Schritte-Erklärung** | `http://localhost:3015/testing/fe-28-provably-fair` (sowie alle Spielmodals) | [`src/components/casino/ProvablyFairModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairModal.tsx)<br>Verifikations-Erklärung (1. Server Seed ➜ 2. Client Seed ➜ 3. SHA-256 HMAC) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_2_provably_fair.png)<br>![Provably Fair](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_2_provably_fair.png) | **Transparenz mit architektonischer Tiefe:** Jeder Schritt des kryptografischen Beweises rastet als feste Karte ein, während die nächste Karte von unten heraufgleitet. Macht komplexe Mathematik visuell greifbar und vertrauenerweckend. |
| **S3** | **VIP Club Archive & Tier Bookshelf** | `http://localhost:3015/vault` | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)<br>Royal Club Archive (`VIP Tier Bookshelf & Benefits Magazine`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_3_vault_magazine.png)<br>![Vault Magazine](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_sticky_3_vault_magazine.png) | **Mayfair Club Magazin-Gefühl:** Die Magazine der VIP-Stufen stapeln sich beim vertikalen Scrollen wie hochwertige Jahrbücher auf einem polierten Obsidian-Tisch. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Scroll-Synchronisation:** Framer Motion `useScroll` gekoppelt an den lokalen Container (`targetRef`), kein unkontrollierter Window-Scroll-Jank.
- **Skalierungs-Formel:** Progressive Skalierung (`scale = 1 - (index - activeIndex) * 0.04`) und Blur (`filter: blur(...)`) sorgen für filmische Tiefenschärfe.
- **Tastatur- & Touch-Navigation:** Volle Unterstützung von Pfeiltasten und Touch-Swipes.
