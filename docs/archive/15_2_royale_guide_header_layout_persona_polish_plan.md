# 15_2 — Royale Guide: Header-Layout, Persona-Tag-Entfärbung & Viewport-Schutz

> **Status:** Executed (archiviert) · **Stand:** 2026-09-09 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Behebung von Header-Clipping/Abschneiden im ausgeklappten und eingeklappten Zustand des Royale Guide, vollständige Entfärbung der Persona-Tags gemäß Obsidian & Gold Design-System, sowie viewport-sichere Positionierung ohne Framer-Motion-Konflikte.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                  | Scope (Dateien)                           | Status         | Zuständigkeit | Verifikation                                                                          |
| ------ | -------------------------------------------- | ----------------------------------------- | -------------- | ------------- | ------------------------------------------------------------------------------------- |
| **L0** | Diagnose & Positions-Entkopplung             | `CasinoGuidePanel.tsx`                    | 🟢 Verifiziert | LLM           | `inset: 0, margin: auto` zentriert Großansicht ohne Framer-Motion-Transform-Konflikte |
| **L1** | Persona-Tags Entfärbung & Typo-Polish        | `GuideHeader.tsx`                         | 🟢 Verifiziert | LLM           | Grüne/blaue/gelbe Badge-Farben entfernt, 100 % Obsidian & Gold Luxus-Ästhetik         |
| **L2** | Header-Padding, Avatar-Fokus & Shrink-Schutz | `GuideHeader.tsx`, `CasinoGuidePanel.tsx` | 🟢 Verifiziert | LLM           | `flexShrink: 0`, 18px Padding, `objectPosition: 'center 18%'` gegen Kopfabschneiden   |
| **L3** | Collapsed/Expanded Responsive Sizing         | `CasinoGuidePanel.tsx`, `GuideHeader.tsx` | 🟢 Verifiziert | LLM           | `maxHeight: calc(100dvh - 48px)`, 296px Clearance auf 900p, 116px Clearance auf 720p  |
| **L4** | Visuelle Selbstprüfung & 5-Stufen-DoD        | `scratch/verify_guide.js`                 | 🟢 Verifiziert | LLM           | Screenshots aufgenommen (Großansicht & Eingeklappt), Vitest & ESLint 0 Fehler         |

---

## 2 — Problem-Analyse & Kernursachen

1. **Oben abgeschnitten im ausgeklappten Zustand (Großansicht):**
   - Im Header fehlte ein `flexShrink: 0` auf dem äußeren Header-Wrapper. Bei geringeren Viewport-Höhen oder dynamischem Flex-Layout wurde der Header komprimiert.
   - Der Avatar im Header nutzte `objectFit: cover` ohne vertikalen Offset; bei `math_strategist.jpg` berührt der Kopf die Bildoberkante, wodurch die runde Maske den Kopf oben beschnitt.
   - Das Padding nach oben war mit 16px zu knapp an den 20px Corner-Radius des Panels bemessen.

2. **Zu bunte Persona-Labels (EV & Quoten, VIP Concierge, Spielspaß & FAQ):**
   - Die Labels nutzten harte Einzelfarben (`#34d399` Smaragd-Grün, `#7dd3fc` Cyan-Blau, `#F4D068` Gelb) mit grellen semi-transparenten Hintergründen (`rgba(16, 185, 129, 0.16)`, `rgba(56, 189, 248, 0.16)`).
   - Dies widerspricht dem Obsidian & Gold Design-System (`xx_sop/04_design_system_ui.md`).
   - Lösung: Vollständige Entfärbung zu monochrom-dezentem Obsidian-Glass (`rgba(255,255,255,0.04)`, Rahmen `rgba(255,255,255,0.08)`, Text `rgba(255,255,255,0.48)` bzw. im aktiven Zustand feiner Gold-Trim `rgba(212,175,55,0.25)`).

3. **Oben abgeschnitten im eingeklappten Zustand (Standardansicht):**
   - Framer-Motion animierte unzulässige `'auto'`-Werte (`top: 'auto'`, `bottom: 'auto'`). Dadurch verblieben widersprüchliche `top`- und `bottom`-Constraints im inline Style.
   - In der Standardansicht wuchs das Panel bei niedrigeren Bildschirmhöhen nach oben über `y: 0` hinaus, da die Höhe nicht strikt gegen den oberen Viewport-Abstand (`calc(100dvh - 48px)`) abgesichert war.
   - In der kompakten Persona-Leiste kollidierten zudem die Textzeilen (Name + Tag) auf engstem Raum.

---

## 3 — Umsetzungs-Details

### L1: Persona-Tags Entfärbung (`src/components/social/casino-guide/GuideHeader.tsx`)

- Entfernung von `badgeBg`, `badgeBorder`, `badgeColor` mit grünen/blauen Farbwerten.
- Ersatz durch ein einheitliches, reduziertes Obsidian-Design:
  - Inaktiv: dezenter matter Text / subtiler Rahmen, keine Farbfüllung.
  - Aktiv: dezente Gold-Nuance passend zur Markenidentität (`#D4AF37`).
- Im Standard-Segmented-Pill: klare vertikale und horizontale Ausrichtung ohne Textkollisionen.

### L2: Header-Layout & Avatar-Schutz (`GuideHeader.tsx`)

- `padding: '18px 18px 12px 18px'` für entspannten Abstand zu den abgerundeten Ecken.
- Avatar mit `objectPosition: 'center 15%'` und Schutz-Padding versehen, damit Köpfe nie an der Rundungsmaske anstoßen.
- Header-Container mit `flexShrink: 0` ausstatten.

### L3: Viewport-Schutz & Positions-Architektur (`CasinoGuidePanel.tsx`)

- Trennung der Positionslogik:
  - Ausgeklappt (`isExpanded && !isMobile`): Feste Zentrierung `top: '50%', left: '50%', x: '-50%', y: '-50%'`, `maxHeight: 'calc(100dvh - 48px)'`.
  - Eingeklappt: Saubere Verankerung `bottom: panelBottom, right: isMobile ? '12px' : '24px'`, `maxHeight: 'calc(100dvh - 48px)'`, `height: isMobile ? 'calc(100dvh - 112px)' : 'min(620px, calc(100dvh - 56px))'`.
  - Vermeidung von Framer-Motion-Tweening auf `top: 'auto'`.

### L4: Visuelle Selbstprüfung & Verifikation

- Playwright-Script nimmt Screenshots im ausgeklappten (Großansicht, 1440x900 & 1280x720) und eingeklappten Zustand auf.
- Pixel- und Bounding-Box-Audits stellen sicher, dass `section.top >= 24px` und der Header gestochen scharf ohne Clipping rendert.
- Ausführung von `npm run typecheck`, `npm test`, `npm run lint`.
