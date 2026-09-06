# SOP: Web Design Quality & Anti-Template Standards (Top 1 % Weltklasse)

> **Zweck:** Verbindliche Qualitätsstandards zur Sicherung der visuellen Exklusivität und Vermeidung generischer Template-Optik zugunsten der Casino-Markenidentität „Obsidian & Gold (Premium)“.
> **Design System Hub:** [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md).
> **UI Polish Standards:** [`xx_sop/16_motion_and_ui_polish.md`](./16_motion_and_ui_polish.md).
> **Frontend Revamp Workflow:** [`xx_sop/10_workflow_frontend_revamp.md`](./10_workflow_frontend_revamp.md).
> **Qualitätsmaßstab:** [`xx_sop/12_workflow_dokument_qualitaet.md`](./12_workflow_dokument_qualitaet.md).

---

## 1 — Anti-Template-Direktive

Kein Frontend-Output darf wie ein generisches 08/15-Standard-Theme (z. B. unmodifiziertes Tailwind, Standard-Shadcn oder Bootstrapping-Templates) wirken. Jede Oberfläche muss intentional, tief und unverwechselbar auf die High-End-VIP-Casino-Atmosphäre abgestimmt sein.

### Verbotene Muster (Banned Patterns)

- **Flache Standard-Karten-Grids** mit uniformen Paddings und ohne hierarchische Tiefenstaffelung.
- **Generische Hero-Sektionen** mit zentrierter Standard-Schrift, uninspiriertem Farbverlauf und Standard-CTA.
- **Unveränderte UI-Bibliotheks-Defaults**, die ohne Anpassung an die Obsidian-Gold-Designsprache übernommen werden.
- **Reines Grau-auf-Schwarz** ohne subtile Gold-Glanzkanten, Smaragd-Gewinnakzente oder Glaskanten.
- **Uniforme Schatten & Radien** über alle Komponenten hinweg ohne optische Hierarchie.
- **Unpersönliche Standard-Tabellen** ohne Casino-Flair für Leaderboards oder Transaktionshistorien.

---

## 2 — Erforderliche Qualitätsmerkmale (Die 6 Säulen)

Jede bedeutsame Casino-Oberfläche (Spielseiten, Wallet-Modals, VIP-Hubs, Admin-Panels) muss mindestens vier dieser sechs Säulen nachweisbar erfüllen:

### 1. Visuelle Tiefe & Layering (True Obsidian Depth)

- Mehrschichtige Oberflächen mit echtem Obsidian-Glasmorphismus:
  ```css
  /* VIP Obsidian Glass Surface */
  background: rgba(11, 14, 20, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(212, 175, 55, 0.15); /* Subtiler Gold-Touch */
  box-shadow:
    0 12px 40px 0 rgba(0, 0, 0, 0.6),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  ```

### 2. Skalenhierarchie & Hero-Fokus

- Klare Dominanz der primären Aktion (z. B. "Place Bet", "Cashout" oder "Spin") durch Größenkontrast, subtiles Leuchten (`shadow-amber-500/20`) und optische Ruhe im Umfeld.

### 3. Bento- & Grid-Komposition

- Spielfelder und Dashboards nutzen strukturierte Bento-Layouts mit unterschiedlichen Kartengrößen (z. B. $2\times 2$ für Game-Stage, $1\times 1$ für Bet-Controls, $1\times 2$ für Live-Ticker) anstelle monotoner Tabellenzeilen.

### 4. VIP-Atmosphäre & Luxus-Textur

- Subtile Lichtreflexe auf Gold-Badges, Ambient-Glows im Canvas-Hintergrund und multisensorisches Feedback bei Gewinnen (Pulsieren in Smaragd `#10B981`, Explosion in Gold `#D4AF37`).

### 5. Haptische Interaktionszustände

- Alle Buttons, Slider und Chips reagieren mit spürbarer Spring-Physik (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.95 }}`).

### 6. Semantische Farb-Disziplin

- **Canvas / Basis (`#0B0E14` / `#05070A`):** Exklusive Nacht-Atmosphäre.
- **Gold Primär (`#D4AF37` / `#F59E0B`):** Wertigkeit, Chips, VIP-Ränge, Jackpots.
- **Smaragd (`#10B981` / `#059669`):** Gewinn, Profit, sichere Quoten.
- **Rubin (`#EF4444` / `#DC2626`):** Risiko, Crash, Verlust, Fehlerzustände.

---

## 3 — Checkliste vor Freigabe von UI-Komponenten

- [ ] **Anti-Template-Check:** Vermeidet das Element standardmäßige, uniforme Tailwind-/Shadcn-Optik?
- [ ] **Tiefen-Check:** Besitzt die Komponente echte Glaskanten (`border-white/10` oder `border-amber-500/20`) und sanfte Schatten?
- [ ] **Typografie-Check:** Werden dynamische Beträge, Multiplikatoren und Quoten strikt in `font-mono tabular-nums` gerendert?
- [ ] **Interaktions-Check:** Gibt es maßgeschneiderte Hover-, Focus- und Active-States?
- [ ] **Ergonomie-Check:** Ist der Kontrast für längere Spielsessions augenschonend und reflexionsarm?

---

## 4 — Test- & Validierungsbefehle

```powershell
# 1. Automatisierter Responsive-Layout-Audit
node scripts/fast-responsive-audit.mjs

# 2. TypeScript-Typen & Import-Integrität prüfen
npm run typecheck

# 3. Linter auf CSS- & Tailwind-Konformität prüfen
npm run lint
```

---

## 5 — Risiko- & Freigabeklassifizierung (K-Level)

| Design-Aktion                                                           | K-Level | Freigabe-Voraussetzung                                                                                                  |
| :---------------------------------------------------------------------- | :-----: | :---------------------------------------------------------------------------------------------------------------------- |
| **Token-Feinjustierung & Glow-Effekte**                                 | **K1**  | Frei im Rahmen von UI-Tasks.                                                                                            |
| **Komponenten-Styling & Bento-Grid-Refactoring**                        | **K2**  | Lokale Sichtprüfung auf Mobile & Desktop erforderlich.                                                                  |
| **Vollständiges Screen-Redesign**                                       | **K2**  | 3-Optionen-Gate nach [`xx_sop/10_workflow_frontend_revamp.md`](./10_workflow_frontend_revamp.md) zwingend erforderlich. |
| **Grundlegende Änderung der Farbidentität (Wegfall von Gold/Obsidian)** | **K4**  | **Explizite Jan-Freigabe zwingend erforderlich.**                                                                       |

---

## 6 — Didaktischer Mehrwert & Lerneffekt für Jan

1. **Warum ist die Anti-Template-Policy geschäftskritisch?**
   Nutzer von Online-Casinos entscheiden innerhalb von Millisekunden über Verweildauer und Einzahlung. Wenn eine Seite wie eine günstige Standard-Vorlage wirkt, sinkt das Vertrauen in Auszahlungen drastisch. Das "Obsidian & Gold"-Design erzeugt sofort das Gefühl eines exklusiven Privat-Casinos in Monaco oder Macau.
2. **Warum sind Glaskanten mit Alpha-Transparenz harten Linien überlegen?**
   Harte weiße oder gelbe Linien zerschneiden das Sichtfeld und ermüden das Auge. Subtile Transparenzen (`rgba(255,255,255,0.08)`) trennen Oberflächen klar, lassen den Hintergrund aber organisch durchscheinen.

---

## 7 — Bekannte offene Probleme & Ist-Diskrepanzen

> **Stand:** 2026-08-29 · Wird bei Behebung aktualisiert.

- **1. Admin-Panel noch teilweise in Standard-Grau:**
  Einige interne Admin-Sub-Routen (`/admin/simulation`, `/admin/knowledge`) nutzen noch schlichte graue Container-Hintergründe statt des vollständigen Obsidian-Glassmorphismus.

---

## 8 — Verwandte Artefakte

| Bedarf                              | Datei                                                                             |
| :---------------------------------- | :-------------------------------------------------------------------------------- |
| **Design System & UI Hub**          | [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md)                       |
| **Motion & UI Polish Standards**    | [`xx_sop/16_motion_and_ui_polish.md`](./16_motion_and_ui_polish.md)               |
| **Frontend Revamp Workflow**        | [`xx_sop/10_workflow_frontend_revamp.md`](./10_workflow_frontend_revamp.md)       |
| **Frontend Taste QC & URL-Abnahme** | [`xx_sop/15_workflow_frontend_taste_qc.md`](./15_workflow_frontend_taste_qc.md)   |
| **Layout Shell Kontext**            | [`xx_docs/09_layout_shell_context.md`](../xx_docs/09_layout_shell_context.md)     |
| **Dokument-Qualitäts-Rubrik**       | [`xx_sop/12_workflow_dokument_qualitaet.md`](./12_workflow_dokument_qualitaet.md) |
