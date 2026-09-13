# Proposal: Scroll Split Card

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/scroll-split-card](https://componentry.dev/docs/components/scroll-split-card)  
> **Kategorie:** 3D Cards / Multi-Panel Reveals / Vault Mechanics  
> **Technologie:** 3-Panel Split & Flip + Scroll-Driven Masking + Gold Foil Accents  
> **Bewertung:** ⭐⭐⭐ Absoluter Favorit („exzellent“)

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **C1** | **Lobby Hero: VIP Promo-Code & Willkommens-Tresor** | `http://localhost:3015/` | [`src/components/home/`](file:///v:/VibeCoding/Casino/src/components/home/) bzw. Hero Promo-Box<br>`CODE: VIPPRO · 100% BONUS +$500` | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_1_promo_hero.png)<br>![Promo Hero](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_1_promo_hero.png) | **Spektakuläre Tresor-Öffnung:** Beim Herunterscrollen teilt sich die goldene Versiegelung der Promo-Karte in zwei gegenläufige Platten auf, die nach außen schwenken. Im Inneren leuchtet der aktivierte Bonus-Gutschein mit Kopier-Button auf. |
| **C2** | **Vault: High-Roller Status-Aktivierung** | `http://localhost:3015/vault` | [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx)<br>Rechte Status-Plakette (`VERIFIED · DEIN RANG: PLATINUM`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_2_vault_activation.png)<br>![Vault Activation](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_2_vault_activation.png) | **Diskrete Salon-Privé-Freischaltung:** Die schwere Platin-Frontplatte spaltet sich horizontal und enthüllt den diskreten Status-Schlüssel sowie den direkten Concierge-Call-Button. |
| **C3** | **Leaderboard: Jackpot- & Preispool-Tresor** | `http://localhost:3015/leaderboard` | [`src/app/leaderboard/page.tsx`](file:///v:/VibeCoding/Casino/src/app/leaderboard/page.tsx)<br>Turnier-Header (`Progressiver Jackpot $1,085.64 · Gesamter Einsatz $59,804`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_3_leaderboard_pot.png)<br>![Leaderboard Pot](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_3_leaderboard_pot.png) | **Aufklappender Preis-Safe:** Die Preispool-Leiste öffnet sich wie ein Tresorfach und visualisiert die genaue Aufteilung des Geldes auf die Podiumsplätze 1 bis 10. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **Panel-Splitting Mechanik:** 2 oder 3 getrennte `motion.div`-Segmente mit gegenläufigen `rotateY` (z. B. $-45^\circ$ links, $+45^\circ$ rechts) und `translateX`-Vektoren.
- **Scroll-Verzahnung:** Reibungsloser Übergang über Framer Motion `useScroll`, der sich direkt an den Scroll-Fortschritt des Nutzers bindet.
- **Materialität:** Subtiler Brushed-Metal-Gradient auf den Split-Kanten vermittelt den Eindruck von massivem Messing oder Platin.
