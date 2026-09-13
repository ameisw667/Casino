# Proposal: Case Study Flip Stack

> **Offizielle Componentry-Dokumentation:** [componentry.dev/docs/components/case-study-flip-stack](https://componentry.dev/docs/components/case-study-flip-stack)  
> **Kategorie:** 3D Cards / Storytelling / Two-Sided Interactive Proof  
> **Technologie:** Scroll-Driven 3D Card Edge Flipping + Backside Data Reveal  
> **Bewertung:** ⭐⭐⭐ Absoluter Favorit („exzellent“)

---

## 1 — Drei konkrete Integrationsvorschläge

| # | Vorschlag / Feature | Vollständige Ziel-URL | Betroffene Datei & Sektion | Vorschau-Screenshot (Nur Ziel-Sektion) | UX-Impact & Luxury Rationale |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **F1** | **Footer: Sicherheits- & Auszahlungs-Audits** | `http://localhost:3015/` (sowie globaler Footer) | [`src/components/layout/Footer.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/Footer.tsx)<br>Sicherheits- & Lizenz-Bereich (`100% RESERVE AUDIT`, `CRYPTOGRAPHIC RNG`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_1_security_audits.png)<br>![Security Audits](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_1_security_audits.png) | **Vorderseite Versprechen, Rückseite Beweis:** Die Audit-Karten flippen beim Klick oder Scrollen um $180^\circ$ um ihre Kante. Die Rückseite offenbart den genauen Audit-Hash, Prüfbericht-Datum und Zertifikats-IDs von iTech Labs. |
| **F2** | **Vault: Club-Dokumente & Benefits Magazine** | `http://localhost:3015/vault` | [`src/components/casino/vault/VipBookshelfShowcase.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/vault/VipBookshelfShowcase.tsx)<br>Bookshelf-Magazin-Karten | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_2_vault_bookshelf.png)<br>![Vault Bookshelf](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_2_vault_bookshelf.png) | **Echtes Buchdeckel-Umschlagen:** Magazin-Kacheln flippen dreidimensional auf und zeigen die detaillierte Tabelle mit Cashback-Fristen, Telegram-Concierge-Telefonnummern und Limit-Erweiterungen. |
| **F3** | **Blackjack: Regelwerk & Strategie-Heatmap** | `http://localhost:3015/games/blackjack` | [`src/app/games/blackjack/BlackjackClient.tsx`](file:///v:/VibeCoding/Casino/src/app/games/blackjack/BlackjackClient.tsx)<br>Rechtes Info-Panel (`RULES & PAYOUTS` / `BASIC STRATEGY`) | [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_3_blackjack_strategy.png)<br>![Blackjack Strategy](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_flip_3_blackjack_strategy.png) | **Kompakte Doppelnutzung ohne Tab-Klicken:** Die Regelkarte flippt bei Berührung elegant um und zeigt die mathematisch perfekte Basic Strategy Heatmap für die aktuelle Spielerhand. |

---

## 2 — Technische Machbarkeits- & Performance-Bewertung

- **3D Transform mit Perspective:** `perspective: 1200px`, `transformStyle: 'preserve-3d'` und `backfaceVisibility: 'hidden'`.
- **Rotations-Präzision:** Spring-Physik (`stiffness: 280, damping: 22`) verhindert holpriges Umschlagen; Kanten wirken massiv wie geschliffenes Acrylglas.
- **Hardware-Entlastung:** Rückseiten-Inhalte werden erst im gerenderten DOM sichtbar, wenn die Rotation $> 90^\circ$ überschreitet.
