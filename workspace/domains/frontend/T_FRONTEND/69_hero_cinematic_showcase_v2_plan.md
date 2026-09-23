# 69 — Hero Cinematic Showcase V2 Plan (Option A: Sovereign VIP Orbit & Kinetic Gold Stage)

> **Zweck:** Vollständige Neuerstellung der V2-Komponente für den First Fold / Hero der Casino Royale Lobby unter Verwendung der freigegebenen Componentry-Elemente.
> **Kanonische Vorgabe:** Nutzer-Freigabe von Option A aus dem Workflow-Jan Option-Gate.
> **Design-System:** „Obsidian & Gold (Premium)“ (`#0B0E14`, `#D4AF37`, Framer Motion 3D).

---

## 1. Architektur der V2-Komponente

Die neue V2-Komponente `HeroCinematicShowcaseV2.tsx` wird in `src/components/home/hero-cinematic/` isoliert aufgebaut und über eine dedizierte Vorschau-Route bzw. Toggle bereitgestellt (z. B. auf `/v2` oder `/testing/hero-v2`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ HERO CINEMATIC SHOWCASE V2 (1560px Golden Ratio Container)                             │
│                                                                                        │
│  [LINKE SPALTE: TYPOGRAFIE & INTERAKTIVES H1]                                         │
│  • Cursor-Driven Particle Typography + Text Repel                                      │
│    "CASINO ROYALE" & "NEXT LEVEL VIP CASINO" mit physikalischer Pointer-Repulsion      │
│    und feinen goldenen Dispersion-Partikeln.                                           │
│  • Kinetic Subheadline mit gestaffeltem Blur-Fokus.                                    │
│  • Trust Badges (100% Provably Fair, Instant Payouts).                                │
│                                                                                        │
│  [ZENTRUM: SCROLL SPLIT CARD (BONUS-TRESER)]                                          │
│  • 3-Panel Split Card ("VIPPRO" Code + $500 Bonus + Instant Rakeback)                 │
│  • Interaktive Klapp-Mechanik mit taktiler Spring-Physik.                             │
│                                                                                        │
│  [RECHTE SPALTE: ORBIT CARD STACK (SALON PRIVÉ VIP PASSES)]                           │
│  • Dreidimensional rotierender VIP-Kartenfächer:                                       │
│    1. Gold Sovereign Pass                                                             │
│    2. Platinum High Roller                                                            │
│    3. Obsidian Royal (Salon Privé)                                                    │
│  • 8-Wege-Glanzkanten (Directional Hover Sheen)                                        │
│  • Interaktives Rotieren/Swappen per Klick oder Drag im 3D-Raum.                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detaillierte Komponenten & Componentry-Integration

1. **`HeroCinematicShowcaseV2.tsx`:**
   - Haupt-Container der V2-Hero-Sektion.
   - Bindet `TextRepelHeadline`, `ScrollSplitBonusCard` und `OrbitCardStack` ein.
2. **`TextRepelHeadline.tsx` / `ParticleTypography.tsx`:**
   - Text Repel mit Pointer-Radius (`dx`, `dy` Federn) und Goldstaub-Canvas.
3. **`ScrollSplitBonusCard.tsx`:**
   - 3-Panel Split-Card nach dem Componentry Schema mit Gold-Shader und Klick-zu-Kopieren.
4. **`OrbitCardStack.tsx`:**
   - 3D Transform mit `rotateY`, `translateZ`, `scale` und Z-Index Shuffle beim Durchblättern der 3 VIP-Pässe.
5. **Vorschau-Integration:**
   - `/v2` Page oder `/testing/hero-v2` zur isolierten visuellen Prüfung und Verifikation.

---

## 3. DoD Verifikationsplan

1. `npm run typecheck` (0 Fehler)
2. `npm run lint` (0 Fehler)
3. `npm test` (100% bestanden)
4. `npm run build` (Exit Code 0)
5. Playwright Screenshot-Audit der V2-Komponente (`docs/frontend/screenshots/69_verified_hero_cinematic_showcase_v2.png`).
