# Proposal: 3D Orbit Card Stack

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/orbit-card-stack](https://componentry.dev/docs/components/orbit-card-stack)  
> **Kategorie:** 3D Cards / Spatial Navigation / Luxury Tier Showcase  
> **Technologie:** CSS 3D Transforms + Framer Motion Spring Orchestration  
> **Bewertung:** ⭐⭐⭐ Absoluter Favorit

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **O1** | **VIP Vault: Tier-Progression & Pass-Orbit** | `http://localhost:3015/vault` | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)<br>VIP-Progression-Bereich (`VIP PROGRESSION · BRONZE to DIAMOND`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_1_vault_tiers.png)<br>![Vault Tiers](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_1_vault_tiers.png) | **Vom flachen Fortschrittsbalken zum plastischen 3D-Kartenfächer:** Die 5 VIP-Karten (Bronze, Silber, Gold, Platin, Diamant) rotieren in einem elliptischen 3D-Orbit. Der aktive Pass schwebt im Zentrum im Goldglanz, während höhere Tiers mit gravierten Schlössern im Hintergrund kreisen. |
| **O2** | **Leaderboard: Top-3-Champions Podium-Orbit** | `http://localhost:3015/leaderboard` | [`src/app/leaderboard/page.tsx`](file:///v:/VibeCoding/Casino/src/app/leaderboard/page.tsx)<br>Top-3-Podiumsplätze (`Platz 1 Champion`, `Platz 2`, `Platz 3`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_2_leaderboard_podium.png)<br>![Leaderboard Podium](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_2_leaderboard_podium.png) | **Dynamische Champion-Bühne:** Die 3 Spitzenreiter rotieren wie auf einem rotierenden Luxus-Podest im Salon Privé. Platz 1 dominiert den Vordergrund mit dynamischem Gold-Lichtkegel, Platz 2 und 3 flankieren die Szene im 3D-Winkel. |
| **O3** | **VIP Perk & Tier-Benefits Modal** | `http://localhost:3015/testing/fe-26-vip-tiers` (sowie globales VIP-Modal) | [`src/components/casino/RankBenefitsModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/RankBenefitsModal.tsx)<br>Karten-Stapel der Stufen-Privilegien | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_3_vip_modal.png)<br>![VIP Modal](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_orbit_3_vip_modal.png) | **Interaktives Durchblättern exklusiver Privilegien:** Spieler können die einzelnen Tier-Pässe (Rakeback-Prozente, VIP-Host, Auszahlungslimits) mit Mausrad oder Swipe rotieren lassen. Jede Karte besitzt fühlbare Tiefe und metallischen Schliff. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **GPU 3D-Transformation:** Nutzung von `transformStyle: 'preserve-3d'` und hardwarebeschleunigten `rotateY`/`translateZ`-Werten für konstante 60 FPS.
- **Interaktiver Drag & Autoplay:** Sanfte Hintergrund-Rotation mit pausierendem Fokus bei Hover oder Touch-Interaktion.
- **Mobile Optimierung:** Auf Mobilgeräten automatische Verringerung des Orbit-Radius und z-Distance-Clamping, um Viewport-Überhänge auszuschließen.
