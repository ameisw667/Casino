# 23 — IMG-05: Big-Win markantes Hauptmotiv (Universelles Casino-Siegel mit Multiplier-Badge)

> **Status:** Execution-Ready · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Ersetzung des flachen, rotierenden 2D-Lucide-Pokals in BigWinOverlay.tsx durch ein plastisches 3D-Obsidian-Gold-Siegel mit Pik-Ass-Relief und dynamischem DOM-Multiplier-Badge.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option B im Workflow-Jan Option-Gate vom 2026-09-05.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                 |   Status   | Nächster Schritt                                                                           | Zuständigkeit |
| :----: | :---------------------------------------------------------- | :--------: | :----------------------------------------------------------------------------------------- | :-----------: |
| **L0** | Asset-Bereitstellung: `seal-casino-royale-quantum-gold.png` | 🔴 Geplant | Generierung & Freistellung eines 3D-Obsidian-Medaillons mit Pik-Ass-Gravur (1024×1024 PNG) |      LLM      |
| **L1** | Dynamisches DOM-Multiplier-Badge                            | 🔴 Geplant | Implementierung des scharfen Zähler-Badges im Zentrum des Siegels (z. B. `25x`, `100x`)    |      LLM      |
| **L2** | Overlay-Integration in `BigWinOverlay.tsx`                  | 🔴 Geplant | Ersatz von `<Trophy rotateY />` durch das plastische Siegel mit Spring-Scale & 2.5D-Aura   |      LLM      |
| **L3** | Partikel- & Sound-Harmonisierung                            | 🔴 Geplant | Ausrichtung der 48 Goldpartikel auf das Medaillon und Synchronisation mit `soundManager`   |      LLM      |
| **L4** | Responsiv-Check (390 / 768 / 1440 px) & Typecheck           | 🔴 Geplant | Prüfung von `npm run typecheck`, kein Verzerren auf Mobile, Timer-Konformität (5,5 s)      |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Beseitigung des peinlichen „Papp-Effekts“ im emotionalsten Moment des Casinos: Das aktuelle Big-Win-Overlay dreht ein flaches 2D-Line-Icon (`<Trophy />`) um die eigene Achse, wodurch es hauchdünn und billig wirkt. Es wird durch ein monumentales 3D-Casino-Royale-Siegel aus poliertem Obsidian und warmem Champagner-Gold ersetzt, das den erzielten Multiplikator dynamisch und gestochen scharf inszeniert.

### 2.2 In Scope

- **1 neues Bild-Asset (`public/images/seal-casino-royale-quantum-gold.png`):**
  - Master 1024×1024 PNG mit Alphatransparenz, Web-komprimiert (unter 80 KB).
  - _Motiv:_ Wuchtiges, rundes Medaillon aus schwarzem poliertem Obsidian, schwere dreidimensionale Goldkanten (`#D4AF37`), feine gravierte Ornamente und das Casino-Royale-Pik-Ass als Wappenträger.
  - _Zentraler Badge-Slot:_ Aussparung im Zentrum für die dynamische Einbettung des Multiplikators.
- **Dynamische Multiplier-Badge (DOM/CSS):**
  - Scharfe, nicht-verpixelte Typografie (`font-mono`, Tabular Nums) für den exakten Multiplikator (`multiplier.toFixed(1)}x`).
  - Umrandet von einem dezent pulsierenden Gold-Ring.
- **Animation & Motion ([`BigWinOverlay.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/BigWinOverlay.tsx)):**
  - Entfernung der linearen `rotateY: [0, 360]`-Rotation.
  - Einführung eines gewichteten Spring-Erscheinens (`scale: [0.3, 1.05, 1]`) mit anschließendem sanften Schweben (`y: [-3, 3, -3]`) und einer atmenden radialen Gold-Aura.
  - Der automatische 5,5-Sekunden-Schließtimer und der manuelle Klick-Dismiss bleiben exakt erhalten.

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Keine Änderung an den Auslöseschwellen (`BIG_WIN_MULTIPLIER_THRESHOLD = 20`, `BIG_WIN_PAYOUT_THRESHOLD = 500` in [`src/lib/casino/big-win.ts`](file:///v:/VibeCoding/Casino/src/lib/casino/big-win.ts)).
- Keine Änderungen an der Gewinnausschüttung oder RPCs (Browser behält 0 % Finanzautorität).
- Kein schwerer WebGL-3D-Shader (2.5D-Staffelung mit Framer Motion garantiert flüssige 60 FPS auf allen Geräten).

---

## 3 — Technische Spezifikation

### 3.1 Siegel-Aufbau (Zentrierter Stack)

```tsx
<div
  style={{
    position: 'relative',
    width: isMobile ? '140px' : '180px',
    height: isMobile ? '140px' : '180px',
  }}
>
  {/* 3D-Obsidian-Gold Master-Siegel */}
  <Image
    src="/images/seal-casino-royale-quantum-gold.png"
    alt="Big Win Siegel"
    fill
    sizes="180px"
    style={{ objectFit: 'contain' }}
  />
  {/* Dynamischer Multiplier Badge im Siegel-Kern */}
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: 900,
        color: '#D4AF37',
        fontSize: isMobile ? '1.2rem' : '1.5rem',
      }}
    >
      {multiplier}x
    </span>
  </div>
</div>
```

---

## 4 — Meilensteine im Detail

### L0: Asset-Bereitstellung

- **Ziel:** Erstellung und Ablage von `public/images/seal-casino-royale-quantum-gold.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Glatte Alphakanten, zentriertes Pik-Ass-Relief, harmonische Lichtkanten im _Obsidian & Gold_-Stil.

### L1: Dynamisches Multiplier-Badge

- **Ziel:** Erstellung der Subkomponente für die zentrierte Multiplier-Badge.
- **Zuständigkeit:** LLM.
- **Kriterien:** Skaliert sauber bei 2- bis 5-stelligen Multiplikatoren (z. B. `20x` bis `10,000x`).

### L2: Overlay-Integration

- **Ziel:** Umbau von `BigWinOverlay.tsx`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Flacher `<Trophy />`-Vektor entfernt, Siegel mit Spring-Physik eingebaut.

### L3: Partikel- & Sound-Harmonisierung

- **Ziel:** Visuelle Balance und Audio-Timing.
- **Zuständigkeit:** LLM.
- **Kriterien:** Goldpartikel umrahmen das Siegel; `soundManager.play('bigWin')` wird sauber synchronisiert.

### L4: Verifikation & Abschluss

- **Ziel:** Responsiver Test und Build-Prüfung.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, kein Overflow auf Smartphones, Reduced-Motion respektiert.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reines Overlay-Komponenten-Upgrade; keine Wallet-/Spiellogik-Mutationen.
- [x] **LLM-Zuständigkeit:** Alle Schritte L0–L4 liegen vollständig beim LLM.
- [x] **Fail-Safe:** Vorhandenes Partikel- und Zählersystem fängt Render-Verzögerungen nahtlos ab.
- [x] **Verknüpfung:** Verlinkt in [`00_bildgenerierung_uebersicht_jan.md`](../../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-05`](../../T_IMAGE/02_bildgenerierung_top10_details.md#img-05).
