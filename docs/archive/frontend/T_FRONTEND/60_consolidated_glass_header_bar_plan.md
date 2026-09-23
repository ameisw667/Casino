# 60 — Full-Width Consolidated Glass Header Bar: Einheitliche Gesamtbox

> **Status:** Executed (archiviert) · **Stand:** 2026-09-11 · **Owner:** LLM (100 % LLM-Zuständigkeit) · **Scope:** Konsolidierung der fragmentierten Einzelboxen (Level, Dock, Wallet, Profil) in eine einzige nahtlose Gesamtbox (`glass-header`) ohne isolierte Kapsel-Rahmen.
> **Money-Pfad:** Nein · **Security-Review:** Nein

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 50 %)

| #   | Subkategorie                            | Niveau   | Befund & Beleg (Datei / Test)                                                                                                         | Bottleneck? | Action Item                                                                                                                                           |
| --- | --------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- | :---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Visuelle Kohärenz & Container-Struktur  | Top 45 % | 5 separate Kapseln nebeneinander (`.header-chip`, Dock-`nav`, `WalletTextMorphChip`, User-Box) erzeugen einen unruhigen „Insel-Look“. |    🔴 JA    | Auflösung der isolierten Kapsel-Rahmen; der `.glass-header` fungiert als die einzige gemeinsame Gesamtbox.                                            |
| 02  | Desktop-Dock-Integration                | Top 55 % | `DesktopHeaderDock` besitzt eigenen Rahmen (`border`, `background`, `boxShadow`), der mit dem Header konkurriert.                     |    🔴 JA    | Dock-Container transparent schalten und Dock-Pills nahtlos im Zentrum der Gesamtbox schweben lassen.                                                  |
| 03  | Finanz- & Wallet-Darstellung            | Top 50 % | `WalletTextMorphChip` kapselt sich als separate Blase mit eigenem Farbverlauf und harter Kante ab.                                    |    🔴 JA    | Kanten und harte Kapsel-Hintergründe entfernen; nahtlose Einbindung mit Monospace-Zahlen (`tabular-nums`) und dezentem Hover-Highlight.               |
| 04  | Zonen-Aufteilung & Rhythmus             | Top 50 % | Fehlende visuelle Zonierung; Elemente driften unstrukturiert im Header auseinander.                                                   |    🔴 JA    | Klares 3-Zonen-Raster (Links: Identität/Level, Mitte: Navigation, Rechts: Finanzen & Account) mit dezenten vertikalen Trennlinien (`border-white/5`). |
| 05  | Responsive Integrität & Mobile-Fallback | Top 75 % | Mobile Header nutzt komprimierte Chips; Desktop-Umbau darf mobile Breakpoints ($<768\text{px}$) nicht beschädigen.                    |   🟢 NEIN   | Mobile-Spezifische Darstellung intakt halten; Änderungen strikt auf Desktop-Struktur bzw. geteilte Container begrenzen.                               |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                               | Scope (Dateien)                                                      | Status      | Zuständigkeit | Verifikation                                                                       |
| ------ | ----------------------------------------- | -------------------------------------------------------------------- | ----------- | :-----------: | ---------------------------------------------------------------------------------- |
| **L0** | Baseline & Diagnose                       | `MainHeader.tsx`, `DesktopHeaderDock.tsx`, `WalletTextMorphChip.tsx` | 🟢 Erledigt |      LLM      | Lint & Typecheck fehlerfrei                                                        |
| **L1** | DesktopHeaderDock Entkapselung            | `src/components/casino/navigation/DesktopHeaderDock.tsx`             | 🟢 Erledigt |      LLM      | Dock-Navigation rendert ohne störende Außenkapsel, Buttons bleiben voll interaktiv |
| **L2** | WalletTextMorphChip Integration           | `src/components/layout/WalletTextMorphChip.tsx`                      | 🟢 Erledigt |      LLM      | Wallet-Widget integriert sich nahtlos ohne Doppel-Border                           |
| **L3** | MainHeader Konsolidierung & Zonen-Divider | `src/components/layout/MainHeader.tsx`                               | 🟢 Erledigt |      LLM      | Einheitliche Gesamtbox mit 3 Zonen und dezentem Rhythmus                           |
| **L4** | Verifikation & 5-Stufen-DoD               | Lokale Test-Suite                                                    | 🟢 Erledigt |      LLM      | Typecheck, Vitest (1698/1698), Lint (0 Errors) & Build 100 % grün                  |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade

- Header-Hauptkomponente: [`src/components/layout/MainHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainHeader.tsx)
- Quick-Navigation: [`src/components/casino/navigation/DesktopHeaderDock.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/navigation/DesktopHeaderDock.tsx)
- Wallet-Widget: [`src/components/layout/WalletTextMorphChip.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/WalletTextMorphChip.tsx)
- Globale Header-Styles: [`src/app/globals.css`](file:///v:/VibeCoding/Casino/src/app/globals.css)

### 3.2 Systemregeln & Invarianten

- **Design-System:** Obsidian (`#0B0E14`), Gold-Akzente (`#D4AF37`), Glassmorphismus (`backdrop-filter: blur(16px)`), Monospace (`font-mono` / `tabular-nums`) für alle Guthaben.
- **Zero-Wallet-Autorität:** Reine UI-Umgestaltung; keine Änderung an Wallet-Snapshots, Store-Logik oder Berechnungen.
- **Fail-Closed & Z-Index-Stabilität:** Header verbleibt strikt auf `zIndex: 40`.

### 3.3 Nicht-Scope (Ausdrücklich verboten)

- Keine Änderungen an Backend-Routen oder Auth-Flows.
- Keine Mutationen von Bet-Logik oder Supabase-RPCs.
- Keine Zerstörung von bestehenden barrierefreien Attributen (`aria-*`).
- Keine Beeinträchtigung der mobilen Sidebar-Steuerung.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: DesktopHeaderDock Entkapselung

- **Ziel:** `DesktopHeaderDock` sitzt nativ im Header ohne eigene störende Außenbox, behält aber Magnification und aktive Gold-Pills.
- **Schritte:**
  1. Den äußeren `<motion.nav>` von statischem Kapsel-Hintergrund (`rgba(11, 14, 20, 0.78)`), eigenem Border (`rgba(212, 175, 55, 0.18)`) und Box-Shadow befreien.
  2. Dock-Items nahtlos horizontal zentriert im Layout ausrichten.
- **Abbruchkriterium:** Verlust der Hover-Magnification oder aktiven Tab-Hervorhebung.

### Meilenstein L2: WalletTextMorphChip Integration

- **Ziel:** `WalletTextMorphChip` als harmonischer Bestandteil der Gesamtbox statt isolierter Blase.
- **Schritte:**
  1. Äußere Box-Styles (`border`, `boxShadow`, `borderRadius: 9999`) auf ein dezent integriertes, kantenfreies Design umstellen.
  2. Beibehaltung von Währungswechsel (Klick), Balance-Verschleierung und dynamischem Text-Morphing.
- **Abbruchkriterium:** Morphing-Animation bricht oder Zahlen springen im Layout.

### Meilenstein L3: MainHeader Konsolidierung & Zonen-Divider

- **Ziel:** Zusammenführung aller 3 Zonen (Links, Mitte, Rechts) in `MainHeader.tsx`.
- **Schritte:**
  1. Level-Button von der harten `.header-chip-gold`-Kapsel befreien und als fließendes Identitäts-Element mit feinem Hover-Feedback gestalten.
  2. User-Profile-Container von hartem Kasten (`background: hsla(0,0%,100%,0.03)`, `border: 1px solid...`) auf nahtlosen Cockpit-Look angleichen.
  3. Dezente vertikale Trennlinien oder klare Abstände zur visuellen Ruhe etablieren.
- **Abbruchkriterium:** Horizontales Überlaufen oder Verdeckung auf Standard-Viewports (1024px–1440px).

### Meilenstein L4: Verifikation & 5-Stufen-DoD

- **Ziel:** 100 % saubere Codebase und visuelle Validierung.
- **Schritte:**
  1. `npm run typecheck`
  2. `npm test`
  3. `npm run lint`
  4. `npm run build`
  5. Git Status Prüfung
