# SOP: Motion & UI Polish Standards (Top 1 % Weltklasse)

> **Zweck:** Verbindliche Design-Engineering- und Animationsrichtlinien zur Eliminierung von Layout-Jitter, optischer Asymmetrie, ruckelnden State-Transitions und unzugänglicher Bewegungsphysik im gesamten Casino.
> **Design System Hub:** [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md).
> **Tokens & Springs:** [`src/lib/design/motion-tokens.ts`](../src/lib/design/motion-tokens.ts).
> **A11y Hook:** `src/hooks/useSafeMotion.ts`.
> **Qualitätsmaßstab:** [`xx_sop/12_workflow_dokument_qualitaet.md`](./12_workflow_dokument_qualitaet.md).

---

## 1 — Konzentrische Radien (Concentric Radius Architecture)

Für optisch harmonisch verschachtelte Oberflächen (z. B. Cards mit inneren Buttons, Badges oder Input-Feldern) gilt die optische Kohärenzformel:

$$\text{Radius}_{\text{außen}} = \text{Radius}_{\text{innen}} + \text{Padding}$$

```
┌────────────────────────────────────────────────────────┐  ▲
│  Container (Radius: 20px / rounded-2xl)               │  │
│    ┌──────────────────────────────────────────────┐    │  │ Padding = 12px
│    │ Inner Button / Chip (Radius: 8px / rounded-lg)│    │  │
│    └──────────────────────────────────────────────┘    │  │
└────────────────────────────────────────────────────────┘  ▼
```

- **Mathematischer Hintergrund:** Besitzen Container und inneres Element denselben Corner-Radius (z. B. beide `rounded-lg`), wirkt der Zwischenraum in den Ecken optisch gequetscht und unprofessionell.
- **Sonderfall großes Padding:** Wenn das Padding $> 24\text{px}$ beträgt, werden Schichten optisch als getrennte Ebenen wahrgenommen; hier greift das Standard-Token `rounded-2xl` (`16px`) ohne künstliche Addition.

---

## 2 — Optische Ausrichtung & Hit-Area-Garantie

### Optische Zentrierung vs. Geometrische Mitte

- **Das Dreiecks- & Pfeil-Problem:** Play-Dreiecke, Chevron-Pfeile und asymmetrische Icons (`lucide-react`) haben ihren visuellen Schwerpunkt nicht im geometrischen Zentrum des SVG-Viewports.
- **Regel:** Bei Play-Buttons und Richtungspfeilen immer einen Ausgleichs-Offset setzen:
  ```tsx
  // Play-Icon in kreisförmigem Button
  <button className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/20">
    <Play className="h-5 w-5 translate-x-[1.5px] fill-amber-400 text-amber-400" />
  </button>
  ```

### Hit-Area-Garantie ($44 \times 44\text{px}$)

- Jedes klickbare Steuerelement (Mute-Toggle, Tooltip-Trigger, Jeton-Chip, Pagination-Pfeil) muss eine interaktive Mindestfläche von **$44 \times 44\text{px}$** aufweisen (WCAG 2.2 AAA Target Size).
- Wenn das sichtbare Icon nur $16 \times 16\text{px}$ groß ist, wird die Hit-Area via Pseudo-Element oder unsichtbarem Padding erweitert:
  ```tsx
  <button className="relative p-2 text-zinc-400 before:absolute before:inset-[-6px] before:content-[''] hover:text-white">
    <Volume2 className="h-4 w-4" />
  </button>
  ```

---

## 3 — Typografie & Zahlen-Stabilität (Tabular Numbers)

### Ziffern-Jitter-Prävention

- **Das Problem:** Proportionale Schriften reservieren für die Ziffer `1` weniger Pixelbreite als für `8`. Bei hochzählenden Geldbeträgen, Multiplikatoren (Crash) oder Countdowns führt das zu permanentem Layout-Flattern (Layout Shifts).
- **Mandatorische Regel:** Alle dynamischen Zahlen im gesamten Projekt erzwingen feste Ziffernbreiten:
  ```tsx
  // Mandatorisch für alle Beträge, Quoten und Timer
  <span className="font-mono font-semibold tracking-tight text-amber-400 tabular-nums">
    ${balance.toFixed(2)}
  </span>
  ```

### Überschriften- & Fließtext-Umbruch

- **Headings / Modal-Titel:** `text-wrap: balance` (verhindert unschöne einzelne Waisenkinder-Wörter in der zweiten Zeile).
- **Kurzbeschreibungen / Toasts:** `text-wrap: pretty` (optimiert den Zeilenfall typografisch).
- **Kein Text-Wrap auf Monospace-Code oder Tabellendaten.**

---

## 4 — Motion Physics & Framer Motion 12 Standards

Alle UI-Animationen nutzen die vorkonfigurierten Federn und Tokens aus [`src/lib/design/motion-tokens.ts`](../src/lib/design/motion-tokens.ts):

### Die 5 Goldenen Motion-Regeln

1. **Der `AnimatePresence`-Vertrag:**
   - Jedes bedingt gerenderte Element (`{isOpen && <Modal />}`) muss unmittelbar in `<AnimatePresence>` liegen.
   - Das direkte Kindelement benötigt **zwingend einen stabilen `key`** (z. B. `key="modal-panel"`).
   - Wer `initial` und `animate` definiert, muss **immer** ein `exit`-Prop mitliefern (sonst drohen Ghost-DOM-Leaks).
2. **Page-Transitions (`mode="wait"`):**
   - Beim Wechsel zwischen Spiel- und Dashboard-Routen erzwingt `AnimatePresence mode="wait"`, dass die ausgehende Route fertig animiert ist, bevor die neue einfährt.
3. **Stagger-Disziplin ($0.05\text{s} - 0.10\text{s}$):**
   - Listen und Grids staffeln Kindelemente mit `staggerChildren: 0.06` (in `staggerVariants.container`).
4. **Verbot von `transition: all`:**
   - Niemals pauschal `transition: all` in CSS oder Framer Motion deklarieren (verursacht Composite-Thread-Stottern).
   - Immer explizite Properties angeben: `transition-property: transform, opacity, background-color`.
5. **Barrierefreiheit (Reduced Motion):**
   - Über den Hook `src/hooks/useSafeMotion.ts` schalten Nutzer mit `prefers-reduced-motion` automatisch auf schlichte Fade-Transitions um.

### Code-Beispiel: Standard-Button-Feedback

```tsx
import { motion } from 'framer-motion';
import { springs, motionTokens } from '@/lib/design/motion-tokens';

<motion.button
  whileHover={{ scale: motionTokens.scale.pop }}
  whileTap={{ scale: motionTokens.scale.press }}
  transition={springs.snappy}
  className="rounded-xl bg-amber-500 px-4 py-2 font-semibold text-black shadow-lg shadow-amber-500/20"
>
  Place Bet
</motion.button>;
```

---

## 5 — Vorher-/Nachher-Review-Tabelle

Bei jedem UI-Polish-Review werden die Änderungen strukturiert dokumentiert:

| Prinzip               | Vorher (Anti-Pattern)                                                  | Nachher (Weltklasse-Standard)                                         |
| :-------------------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| **Concentric Radius** | Container `rounded-xl` (`12px`), Child `rounded-xl` (`12px`) bei `p-4` | Container `rounded-2xl` (`20px`), Child `rounded-md` (`8px`)          |
| **Tabular Numbers**   | `font-sans` auf Kontostand (Layout zappelt beim Bet-Gewinn)            | `font-mono tabular-nums` (feste Ziffernbreite, 0 Layout Shift)        |
| **Transition Scope**  | `transition: all 0.2s ease`                                            | `transition-property: transform, opacity; transition-duration: 150ms` |
| **Exit Animation**    | Komponente poppt bei Unmount hart weg                                  | `AnimatePresence` mit `exit={{ opacity: 0, scale: 0.95 }}`            |
| **Hit Area**          | $20 \times 20\text{px}$ Icon ohne Padding (auf Mobile schwer treffbar) | Hit-Area auf $44 \times 44\text{px}$ via Pseudo-Element erweitert     |

---

## 6 — Test- & Validierungsbefehle

```powershell
# 1. TypeScript-Typen aller Motion-Imports und Hooks prüfen
npm run typecheck

# 2. Vitest-Testsuite auf fehlerfreie Komponententests prüfen
npm test

# 3. Responsive-Layout-Audit über alle Breakpoints
node scripts/fast-responsive-audit.mjs
```

---

## 7 — Risiko- & Freigabeklassifizierung (K-Level)

| UI-Polish-Aktion                                        | K-Level | Freigabe-Voraussetzung                                                       |
| :------------------------------------------------------ | :-----: | :--------------------------------------------------------------------------- |
| **Typo-Anpassungen (`tabular-nums`), Radien-Korrektur** | **K1**  | Frei im Rahmen von Polish-Tasks.                                             |
| **Komponenten-Animationen (Framer Motion)**             | **K2**  | Lokale Sichtprüfung auf Mobile ($375\text{px}$) & Desktop ($1440\text{px}$). |
| **Globale Page-Transition-Umbauten (`layout.tsx`)**     | **K3**  | Standard-Review im Task-Scope.                                               |

---

## 8 — Didaktischer Mehrwert & Lerneffekt für Jan

1. **Warum ist Subpixel- und Radius-Mathematik für ein Casino entscheidend?**
   Casinos verkaufen Vertrauen und Luxus. Unsaubere Ecken, zappelnde Zahlen und unzentrierte Icons erzeugen unterbewusst den Eindruck billiger Glücksspiel-Software. Präzise Ausrichtung signalisiert dem Nutzer höchste technische Qualität und Sicherheit.
2. **Warum zerstören unvollständige `AnimatePresence`-Deklarationen die Performance?**
   Fehlt der `key` oder das `exit`-Prop auf einem Kindelement, kann Framer Motion das DOM-Element nach dem State-Wechsel nicht mehr referenzieren. Es verbleibt als Zombie-Node im Speicher und verlangsamt die Render-Pipeline der WebGL-/Canvas-Spiele.

---

## 9 — Bekannte offene Probleme & Ist-Diskrepanzen

> **Stand:** 2026-08-29 · Wird bei Behebung aktualisiert.

- **1. Bestehende Altanimationen mit Inline-Dauern:**
  Einige ältere Spielkomponenten in `src/components/casino/games/` nutzen noch harte Inline-Spring-Objekte anstelle des zentralen Imports aus `src/lib/design/motion-tokens.ts`. Diese werden im Rahmen künftiger Revamps schrittweise vereinheitlicht.

---

## 10 — Verwandte Artefakte

| Bedarf                               | Datei                                                                             |
| :----------------------------------- | :-------------------------------------------------------------------------------- |
| **Design System & UI Hub**           | [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md)                       |
| **Anti-Template Web Design Quality** | [`xx_sop/17_web_design_quality.md`](./17_web_design_quality.md)                   |
| **Frontend Revamp Workflow**         | [`xx_sop/10_workflow_frontend_revamp.md`](./10_workflow_frontend_revamp.md)       |
| **Frontend Taste QC & URL-Abnahme**  | [`xx_sop/15_workflow_frontend_taste_qc.md`](./15_workflow_frontend_taste_qc.md)   |
| **Dokument-Qualitäts-Rubrik**        | [`xx_sop/12_workflow_dokument_qualitaet.md`](./12_workflow_dokument_qualitaet.md) |
