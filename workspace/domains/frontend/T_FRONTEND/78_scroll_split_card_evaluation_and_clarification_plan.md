# 78 — Scroll Split Card (Evaluation & Klärungsplan)

> **Status:** 🟡 OFFEN / ZUR PRÜFUNG & EVALUIERUNG DURCH JAN  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/scroll-split-card](https://componentry.dev/docs/components/scroll-split-card)  
> **Kern-Technologie:** Multi-Panel Split Mechanics + Scroll-Linked Masking + 3D Door Openings  
> **Zweck:** Präzise technische & visuelle Aufklärung, warum und wie Karten beim Scrollen aufspalten

---

## 1 — Was ist eine „Scroll Split Card“ genau? (Konzept-Erklärung)

Auf statischen Screenshots sieht man nur eine geschlossene Kachel. Der eigentliche Effekt der **Scroll Split Card** ist jedoch eine **mechanische Tresor-Öffnung (Vault Door Opening / Split-Foil)**:

```
[ PHASE 1: VORHER (GESCHLOSSEN) ]          [ PHASE 2: SCROLL-EFFEKT (SPLIT) ]         [ PHASE 3: NACHHER (OFFEN) ]
┌───────────────────────────────┐          ┌───────┐             ┌───────┐          ┌───────┐             ┌───────┐
│       GOLDENE VERSCHLUSS-     │   ──►    │ LINKE │   ENTHÜLLTER│ RECHTE│   ──►    │ LINKE │  GEHEIMER   │ RECHTE│
│         PLAKETTE / SIEGEL     │ (Scroll) │ TÜRE  │   TRETSOR-  │ TÜRE  │ (Fertig) │ FLÜGEL│ VIP-CONTENT │ FLÜGEL│
│    (z. B. "CODE: VIPPRO")     │          │ ◄───  │    INHALT   │  ───► │          │       │  FREIGELEGT │       │
└───────────────────────────────┘          └───────┘             └───────┘          └───────┘             └───────┘
```

1. **Phase 1 (Normalzustand):** Die Kachel wirkt wie eine massive, versiegelte Gold- oder Platinplatte.
2. **Phase 2 (Beim Scrollen):** Die Oberfläche teilt sich entlang einer vertikalen oder horizontalen Trennlinie in zwei Hälften (wie Schiebetüren eines Schweizer Banktresors), die nach links und rechts weggleiten.
3. **Phase 3 (Enthüllung):** Im freigelegten Innenraum wird ein exklusiver Inhalt sichtbar (z. B. ein Kopier-Button für den Bonus-Code, eine Concierge-Nummer oder ein Preisgeld-Scheck).

---

## 2 — Nachjustierte Screenshots mit vollem Kontext

Die vorherigen Screenshots waren zu stark beschnitten. Hier sind die korrigierten Vollansichten:

### Option A: Lobby Promo-Code Tresor (`CODE: VIPPRO`)

- **URL:** `http://localhost:3015/` (Hero-Bereich)
- **Vollansicht:** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_1_promo_hero_fixed.png)  
  ![Promo Box Vollansicht](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_1_promo_hero_fixed.png)
- **Was sich spaltet:** Die Plakette `CODE: VIPPRO` spaltet sich beim Vorbeiscrollen nach außen auf und gibt den glänzenden Button `BONUS JETZT AKTIVIEREN` frei.

---

### Option B: High-Roller Vault Concierge-Tresor

- **URL:** `http://localhost:3015/vault` (Kopf-Bereich)
- **Vollansicht:** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_2_vault_activation_fixed.png)  
  ![Vault Header Vollansicht](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_2_vault_activation_fixed.png)
- **Was sich spaltet:** Der Header-Bereich rechts neben dem Avatar öffnet sich wie ein Wertfach und offenbart den geheimen Salon-Privé Telegram-Concierge-Zugang.

---

### Option C: Leaderboard Turnier-Preispool

- **URL:** `http://localhost:3015/leaderboard` (Turnier-Status)
- **Vollansicht:** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_3_leaderboard_pot_fixed.png)  
  ![Leaderboard Pot Vollansicht](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_split_3_leaderboard_pot_fixed.png)
- **Was sich spaltet:** Der Balken `Progressiver Jackpot $1,085.64` spaltet sich in der Mitte und klappt die exakte Aufteilung der Gewinne auf (z. B. 50% Platz 1, 30% Platz 2, 20% Platz 3).

---

## 3 — Entscheidungsvorlage für Jan

Da dieser Effekt stark vom persönlichen Geschmack abhängt, ist dieser Plan **bewusst auf Status OFFEN gesetzt**:

- **Möglichkeit 1:** Wir setzen Option A (Lobby Promo-Code Tresor) um, da eine sich öffnende Tresor-Tür perfekt zum Thema Bonus passt.
- **Möglichkeit 2:** Wir verwerfen die Scroll Split Card komplett, falls dir der Effekt für ein cleanes Luxus-Casino zu verspielt oder unruhig erscheint.

_Keine Code-Execution erfolgt für diesen Plan, bevor Jan seine Entscheidung mitgeteilt hat._
