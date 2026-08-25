# SOP: Design System & UI (Design-Guardian)

> **Zweck:** Verbindliche Gestaltungsrichtlinien, Farbcodes, Animationsparameter, Z-Index-Architektur und UI-Komponenten-Standards für alle Frontend- und UI-Entwicklungen im Casino.
> **Frontend-Revamp-Workflow:** [`xx_sop/10_workflow_frontend_revamp.md`](10_workflow_frontend_revamp.md).
> **Layout-Shell-Kontext:** [`xx_docs/09_layout_shell_context.md`](../xx_docs/09_layout_shell_context.md).
> **Qualitätsmaßstab:** [`xx_sop/12_workflow_dokument_qualitaet.md`](12_workflow_dokument_qualitaet.md).

---

## 1 — Visuelle Identität (Obsidian & Gold Premium)

* **Design-Philosophie:** „Obsidian & Gold (Premium)“ — Exklusive VIP-Casino-Ästhetik mit tiefschwarzen Oberflächen, edlem Glasmorphismus und präzisen Gold-Akzenten.
* **Farb-Palette:**

| Token / Rolle | Farbcode / Tailwind | Verwendung |
| :--- | :--- | :--- |
| **Canvas / Hintergrund** | `#0B0E14` / `#05070A` | Globaler App-Hintergrund, Spielflächen, tiefe Ebenen (kein reines Grau). |
| **Gold Primär (Gold-Gradients)** | `#D4AF37` / `#F59E0B` | Primäre Buttons, VIP-Badges, Jackpot-Highlights, Gewinnumrandungen. |
| **Erfolg / Gewinn (Emerald)** | `#10B981` / `#059669` | Positive Multiplikatoren, Cashout-Buttons, Guthaben-Zuwachs. |
| **Verlust / Fehler (Ruby Red)** | `#EF4444` / `#DC2626` | Crash-Ereignis, Verlust-Feedback, Fehler-Toasts, Input-Validierungsfehler. |
| **Kanten & Borders** | `rgba(255,255,255,0.1)` / `border-amber-500/20` | Subtile Glassmorphism-Kanten für Karten, Container und Modals. |

---

## 2 — Glassmorphism & Oberflächen-Standard

Mandatorisch für alle Modals, Navigationsleisten, Dropdowns und Card-Container:

```css
/* Standard Glassmorphism Container */
background: rgba(11, 14, 20, 0.75);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

---

## 3 — Typografie & Zahlen-Rendering

* **Standard-UI / Fließtext:** Moderner Sans-Serif Font (Inter / System-UI).
* **Dynamische Zähler & Ticker:** **Mandatorisch Monospace (`font-mono` / `tabular-nums`)**.
  * Gilt für: Kontostand (`Balance`), Multiplikatoren (Crash/Slots), Quoten (Roulette), Leaderboard-Punkte und Countdown-Timer.
  * **Warum?** Verhindert Breiten-Springen (Layout Jitter / Layout Shifts) während schneller Zahlen-Animationen.

---

## 4 — Motion & Animations-Physik (Framer Motion 12)

Alle interaktiven Elemente müssen über standardisierte Spring-Physik animiert werden:

```tsx
// Standard Spring-Konfiguration
export const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  bounce: 0.4,
};

// Standard Button-Interaktion
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.95 }}
  transition={springTransition}
>
  Place Bet
</motion.button>
```

* **Wiederverwendbare Primitives:**
  * `src/components/ui/VibeMotion.tsx`: Universeller Wrapper für Fade/Slide-Transitions.
  * `src/components/ui/Magnetic.tsx`: Magnetischer Cursor-Follower für primäre CTAs.
  * `src/components/casino/BigWinOverlay.tsx`: Vollbild-Gewinnanimation für Multiplikatoren $\ge 20\times$.

---

## 5 — Z-Index-Hierarchie (Real-Code Spezifikation)

Im Codebase existieren historisch bedingt Inline-Styles und Tailwind-Layer. Folgende Zonen sind verbindlich einzuhalten:

| Zone | Z-Index-Bereich | Komponenten & Real-Implementierung im Repo |
| :--- | :---: | :--- |
| **0. Background & Canvas** | `0 – 5` | Hintergrund-Canvas, Three.js-Szenen, Spielfeld-Texturen (`zIndex: 1-5`) |
| **1. Game Stage & Controls** | `10 – 35` | BetModeTabs (`10`), CardHand (`index+1`), DiceCenterStage (`25-30`), RouletteWheel (`35`) |
| **2. Layout & Navigation** | `40 – 50` | `MainHeader`, `MainSidebar`, MobileNav, Filter-Leisten (`z-40` bis `z-50`) |
| **3. Standard Modals** | `1000 – 2000` | `SettingsModal` (`1000`), `ProvablyFairModal` (`1000`), `CrashTutorial` (`2000`) |
| **4. Priority Modals** | `5000` | `WalletModal` (`5000`), `PlayerProfileModal` (`5000`), `RankBenefitsModal` (`5000`) |
| **5. Global Big Win Overlay**| `9999` | `BigWinOverlay` (`zIndex: 9999` via Fixed Fullscreen) |
| **6. Global Loading & Splash**| `99999`| `LoadingOverlay` (`zIndex: 99999` Route-Transition-Blocker) |

---

## 6 — Gewinn-Feedback & Trigger-Stufen

Jedes Spielergebnis erfordert stufenweises multisensorisches Feedback:

| Multiplikator | Feedback-Stufe | Visuelle Effekte | Audio-Trigger |
| :--- | :--- | :--- | :--- |
| **$< 1\times$** (Verlust) | Subtle Shake | Rote Akzentlinie (`border-red-500/40`), dezenter Alpha-Drop | Subtiler Loss-Sound |
| **$1.01\times – 4.99\times$** (Basis) | Smaragd-Glow | Grüner Puls-Effekt (`#10B981`), Win-Text Pop | Standard Win Sound |
| **$5.0\times – 19.99\times$** (Medium) | Gold Explosion | Partikel-Effekt, animierter Zahlen-Ticker | Medium Win Chime |
| **$\ge 20.0\times$** (Big Win) | **BigWinOverlay** | **Vollbild-Backdrop (`zIndex: 9999`), Confetti-Shower, Zähler-Rollup** | Epische Fanfare & Haptik |

---

## 7 — Verifikation & UI-Audit-Befehle

```powershell
# 1. Responsive & Breakpoint-Audit skriptbasiert prüfen
node scripts/fast-responsive-audit.mjs

# 2. TypeScript-Typen von Komponenten verifizieren
npm run typecheck

# 3. Linter auf CSS- & JSX-Konformität prüfen
npm run lint
```

---

## 8 — Risiko- & Freigabeklassifizierung (K-Level)

| UI-Aktion | K-Level | Freigabe-Voraussetzung |
| :--- | :---: | :--- |
| **Farb- & Typo-Anpassungen (CSS/Tokens)** | **K1** | Frei im Rahmen von Design-Aufgaben. |
| **Komponenten-Refactoring & Animationen** | **K2** | Lokale Sichtprüfung auf Mobile & Desktop erforderlich. |
| **Z-Index- & Shell-Umbauten (`MainLayout.tsx`)** | **K3** | Standard-Review erforderlich (Gefahr von Overlay-Blockaden). |
| **Entfernung von Kern-Modals (Wallet/Profile)** | **K4** | **Explizite Jan-Freigabe zwingend erforderlich.** |

---

## 9 — Didaktischer Mehrwert & Lerneffekt für Jan

1. **Warum strikte Z-Index-Zonen?**
   In modernen Single-Page-Apps führt willkürliche Z-Index-Vergabe (`z-[999]`) zu Bugs, bei denen Modals hinter Dropdowns verschwinden oder Toasts unklickbar werden. Feste Zonen (1000 für Content-Modals, 5000 für Profile, 9999 für Fullscreen-Overlays) lösen Layering-Probleme strukturell.
2. **Warum Spring-Physik statt linearer CSS-Transitions?**
   Lineare Animationen wirken künstlich. Springs mit `bounce: 0.4` simulieren reale Masse und Trägheit, was das haptische VIP-Casino-Gefühl maßgeblich verstärkt.
3. **Warum `tabular-nums` bei Geldbeträgen?**
   Proportionale Schriftarten ändern bei der Ziffer „1“ die Zeichenbreite gegenüber „8“. Bei schnellen Zahlen-Rollups flattert das gesamte UI-Layout. `tabular-nums` sorgt für feste Ziffernbreiten ohne Springen.

---

## 10 — Bekannte offene Probleme & Ist-Diskrepanzen

> **Stand:** 2026-08-23 · Wird bei Behebung aktualisiert.

- **1. Inkonsistente Z-Index-Notation im Repo:**
  Einige Komponenten nutzen Tailwind (`z-10`, `z-50`), andere Inline-Styles (`zIndex: 5000`, `zIndex: 9999`). Eine vollständige Migration auf Tailwind-Tokens `z-modal`, `z-priority`, `z-overlay` steht noch aus.
- **2. Historische Diskrepanz in Altdokumenten:**
  Alte Dokumente nannten `z-20/50/100/999`, was zu Verwirrung führte. Diese SOP stellt die kanonische Wahrheit anhand der tatsächlichen Codebasis dar.

---

## 11 — Verwandte Artefakte

| Bedarf | Datei |
| :--- | :--- |
| **Frontend Revamp Workflow** | [`xx_sop/10_workflow_frontend_revamp.md`](10_workflow_frontend_revamp.md) |
| **Layout Shell Kontext** | [`xx_docs/09_layout_shell_context.md`](../xx_docs/09_layout_shell_context.md) |
| **Dokument-Qualitäts-Rubrik** | [`xx_sop/12_workflow_dokument_qualitaet.md`](12_workflow_dokument_qualitaet.md) |
