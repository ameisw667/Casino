# 74 — Interactive Text Repel (3-Touchpoint Execution Plan)

> **Status:** 🔴 Revidiert & Vollständig Zurückgenommen (Nutzerentscheidung: Revertiert auf sauberen Status Quo vor Hervorhebung) · **Niveau:** Archiviert  
> **Offizielle Componentry-Spezifikation:** [componentry.dev/docs/components/text-repel](https://componentry.dev/docs/components/text-repel)  
> **Kern-Technologie:** Cursor Proximity Vector Physics + Spring Repulsion + Liquid Typography Distortion  
> **Scope:** Drei separierte Touchpoints (R1: VIP Vault Rang & Slogan Badge, R2: Provably Fair Verification Shield, R3: Games Catalog Section Header) — _Alle 3 Touchpoints wurden nach User-Feedback auf den ursprünglichen Zustand zurückgestellt._

---

## 1 — Executive Summary & Status Quo Bewertung

Statische Badges und Slogans wirken auf Luxusplattformen oft wie unbewegliche Etiketten. Durch **Interactive Text Repel** reagieren die einzelnen Buchstaben eines Badges oder Headers wie ein magnetisches Kraftfeld oder flüssiges Quecksilber auf die Nähe des Mauszeigers: Buchstaben weichen dem Cursor in einem physikalischen Abstoßungsvektor elastisch aus und schnappen mit sanfter Dämpfung an ihren Ursprungsort zurück, sobald der Cursor weiterwandert.

### Status Quo Bottleneck-Matrix

| Touchpoint                   | Aktueller Zustand                           | Defizit / Bottleneck                                      | Ziel-Architektur (Text Repel)                                                       |
| :--------------------------- | :------------------------------------------ | :-------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| **R1: VIP Vault Badge**      | Statische Plakette (`PLATINUM LVL 35`)      | Fühlt sich an wie ein Standard-Badge ohne haptischen Wert | Buchstaben weichen bei Cursor-Überflug magnetisch zurück wie flüssiges Platin/Gold  |
| **R2: Provably Fair Shield** | Graue Textzeile mit Server-/Client-Seed     | Mathematischer Schutzschild wirkt statisch und steril     | Siegel reagiert bei Berührung mit fühlbarem Kraftfeld-Effekt                        |
| **R3: Catalog Header**       | Reine Navigations-Headline (`GAME CATALOG`) | Header ist passiv und lädt nicht zum Entdecken ein        | Zeichen weichen dezent aus, was dem Katalog eine lebendige, moderne Textur verleiht |

---

## 2 — Touchpoint R1: VIP Vault Rang- & Slogan-Badge

### 2.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/vault`
- **Betroffene Datei:** [`src/app/vault/page.tsx`](file:///v:/VibeCoding/Casino/src/app/vault/page.tsx) bzw. VIP-Profil-Header
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_1_vip_badge.png)  
  ![VIP Badge Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_1_vip_badge.png)

### 2.2 Technische Architektur & Komponenten-Aufbau

1. **Magnetisches Platin-Kraftfeld:**
   - Radius: $r = 65\text{ px}$. Maximale Auslenkung pro Buchstabe auf $14\text{ px}$ limitiert, um die Lesbarkeit des VIP-Status immer zu gewährleisten.
   - Spring-Parameter: `stiffness = 380, damping = 24`.
2. **Goldener Glanz-Sheen bei Berührung:**
   - Während ein Buchstabe ausgelenkt wird, verstärkt sich seine Kanten-Luminanz (`text-shadow: 0 0 8px rgba(212, 175, 55, 0.6)`).
3. **Platin-Typografie:**
   - Hochwertiger `monospace`-Schnitt mit dezentem Letterspacing (`0.12em`).

### 2.3 Code-Blueprint

```tsx
export interface TextRepelBadgeProps {
  text: string;
  rankColor?: string;
  maxDisplacement?: number;
  radius?: number;
}
```

---

## 3 — Touchpoint R2: Provably Fair Kryptografie-Verification-Badge

### 3.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/testing/fe-28-provably-fair` (sowie alle Spielmodals)
- **Betroffene Datei:** [`src/components/casino/ProvablyFairModal.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/ProvablyFairModal.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_2_provably_fair.png)  
  ![Provably Fair Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_2_provably_fair.png)

### 3.2 Technische Architektur & Komponenten-Aufbau

1. **Kryptografische Kraftfeld-Simulation:**
   - Textzeile: `CRYPTOGRAPHIC PCB ENGINE · 256-BIT · DETERMINISTIC`.
   - Cursor erzeugt eine unsichtbare "Schockwelle", die die Buchstaben auseinanderdrückt, als würde man ein magnetisches Siegel berühren.
2. **Audit-Sicherheit:**
   - Reiner UI-Effekt; die darunterliegenden Hashes (Server-Seed, Client-Seed, Nonce) bleiben als kopierbare Standard-Felder unbeeinflusst.

---

## 4 — Touchpoint R3: Games Catalog Section Header

### 4.1 Spezifikation & Ziel-Umgebung

- **Vollständige URL:** `http://localhost:3015/games`
- **Betroffene Datei:** [`src/app/games/page.tsx`](file:///v:/VibeCoding/Casino/src/app/games/page.tsx)
- **Visueller Beweis (Status Quo):** [Screenshot ansehen](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_3_catalog_header.png)  
  ![Catalog Header Status Quo](file:///v:/VibeCoding/Casino/docs/frontend/screenshots/prop_repel_3_catalog_header.png)

### 4.2 Technische Architektur & Komponenten-Aufbau

1. **Dezente Luxus-Welle:**
   - Große Headline `GAME CATALOG`.
   - Buchstaben reagieren mit sanfter horizontaler und vertikaler Welle ($8\text{ px}$ Auslenkung, `stiffness = 260, damping = 30`).
2. **Koppelung an den Live-Gewinn-Ticker:**
   - Unter der Headline fließt der Live-Ticker unbeeinflusst weiter; harmonischer Kontrast zwischen statischem Rhythmus und interaktiver Headline.

---

## 5 — Haute Horlogerie 10-Punkte Qualitätskatalog

1. **Lesbarkeits-Garantie (Legibility First):** Auslenkung wird per Vektor-Begrenzung (`Math.min(dist, maxDisplacement)`) so limitiert, dass Worte nie unlesbar werden.
2. **Zero Invalidation of Bounding Boxes:** Zeichen nutzen CSS `transform: translate3d(...)`, wodurch das umgebende Box-Model stabil bei $0\text{ px}$ Reflow bleibt.
3. **Hardware-Beschleunigung:** Alle animierten Glyphen besitzen `will-change: transform`.
4. **Mobile Deaktivierung:** Touchscreens besitzen keinen Hover-Cursor; auf Mobilgeräten bleibt der Text starr, wodurch 0 CPU-Zyklen verschwendet werden.
5. **Reduced Motion:** Vollständige Deaktivierung bei `prefers-reduced-motion: reduce`.
6. **Bounds-Culling:** Berechnungen starten erst, wenn sich die Maus innerhalb der `BoundingClientRect` der Komponente $+ 80\text{ px}$ Puffer befindet.
7. **Keine Layout-Zerstörung bei Zoom:** Skaliert fehlerfrei bei $125\%$, $150\%$ und $200\%$ Browser-Zoom.
8. **Sub-Pixel-Anti-Aliasing:** Scharfe Glyphenränder ohne Weichzeichnungs-Artefakte während der Transformation.
9. **Kompakte Bundle-Größe:** Minimaler mathematischer Vektor-Hook (< 2 KB unkomprimiert).
10. **TDD-Verifikation:** Test-Coverage für Vektorabstoßung, Randfälle bei $0$-Distanz und Unmount-Sicherheit.

---

## 6 — Konkrete 5-Phasen-Execution-Roadmap

- [ ] **Phase 1: Text Repel Core Hook & Wrapper:** Erstellung von `src/components/casino/typography/InteractiveTextRepel.tsx`.
- [ ] **Phase 2: Touchpoint R1 Integration:** Veredelung des VIP-Vault-Badges (`src/app/vault/page.tsx`).
- [ ] **Phase 3: Touchpoint R2 Integration:** Veredelung des Provably-Fair-Siegels (`src/components/casino/ProvablyFairModal.tsx`).
- [ ] **Phase 4: Touchpoint R3 Integration:** Einbindung in die `GAME CATALOG` Headline (`src/app/games/page.tsx`).
- [ ] **Phase 5: 5-Stufen-DoD & Audit:**
  - `npm run typecheck` (0 Fehler)
  - `npm test` (100% grün)
  - `npm run lint` (0 Fehler)
  - Playwright Screenshot-Verifikation der interaktiven Repel-Zustände
