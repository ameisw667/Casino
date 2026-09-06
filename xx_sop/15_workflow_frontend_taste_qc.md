# SOP: Frontend-Taste & QC-Skill-Routing (`design-taste-frontend` / `impeccable`)

> **Zweck:** Entscheidet, wann welcher der beiden global installierten Design-Skills (`design-taste-frontend`, `impeccable`) gezogen wird, und wie beide dem verbindlichen Obsidian-&-Gold-System untergeordnet werden. Dieses Dokument enthält **keine eigene Prozess- oder Farblogik** — es referenziert ausschließlich die bestehenden SOPs.
> **Option-Gate-Workflow:** [`xx_sop/01_workflow_jan_option_gate.md`](./01_workflow_jan_option_gate.md).
> **Design-System & Tokens (bindend):** [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md).
> **Frontend-Revamp-Lebenszyklus:** [`xx_sop/10_workflow_frontend_revamp.md`](./10_workflow_frontend_revamp.md).
> **Ausführung & Selbstprüfung:** [`xx_sop/02_workflow_jan_execution.md`](./02_workflow_jan_execution.md).

---

## 1 — Grundregel: Obsidian & Gold gewinnt immer

Beide Skills treffen von sich aus ästhetische Annahmen (Paletten-Alternativen, Font-Pairings, Spring-Konfigurationen, Radius-Skalen). Casino hat dafür bereits ein festes, verbindliches System. Bei jedem Konflikt gilt ausnahmslos [`04_design_system_ui.md`](./04_design_system_ui.md):

| Bereich       | Skill-Vorschlag (wird ignoriert)                                                  | Bindender Casino-Wert                                                                  |
| :------------ | :-------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- |
| Akzentfarbe   | `design-taste-frontend` Abschnitt 4.2 (Lila-Regel, Cold-Luxury-Alternativen etc.) | Gold `#D4AF37` / `#F59E0B` (04 §1)                                                     |
| Zahlen-Font   | Beliebige Sans/Serif-Pairings (4.1)                                               | `font-mono` / `tabular-nums` für alle dynamischen Werte (04 §3)                        |
| Motion-Physik | Eigene Spring-Werte/Ease-Kurven (4.1, 4.5, Section 5)                             | `stiffness: 400, damping: 25, bounce: 0.4` (04 §4)                                     |
| Radius-Skala  | "Shape Consistency Lock" (frei wählbar)                                           | Bestehende Component-Radien im Repo, nicht neu definieren                              |
| Glassmorphism | Optional, kontextabhängig (Section 5)                                             | Mandatorisch für Modals/Nav/Cards, exakte Werte in 04 §2                               |
| Icon-Familie  | Phosphor/Hugeicons/Radix/Tabler-Priorität                                         | Bestehende Lucide-Nutzung im Repo (Tech-Stack, CLAUDE.md) beibehalten, nicht umstellen |

**Was die Skills trotzdem beitragen dürfen** (weil tokenunabhängig, reine Layout-/Interaktions-/Copy-Qualität): Anti-Zickzack-Cap, Bento-Zellenregeln, Eyebrow-Restraint, Hero-Viewport-Disziplin, CTA-Kontrast-/Wrap-Checks, Copy-Self-Audit, a11y-Kontrastprüfungen, Loading/Empty/Error-State-Vollständigkeit. Diese Regeln gelten unverändert.

---

## 2 — Motion-Technische Standards (framer-motion, Ist-Zustand-basiert)

Ergänzt `04_design_system_ui.md` §4 um Regeln, die dort fehlen, weil sie aus `design-taste-frontend` Abschnitt 3.B/5 stammen und projektunabhängig für React + Motion gelten. Grundlage ist der tatsächlich installierte Import — **nicht** der von `design-taste-frontend` empfohlene `motion/react`-Pfad, da dieser im Repo nicht genutzt wird und keine Migration ohne Freigabe angestoßen wird.

- **Kontinuierliche Werte nie mit `useState` tracken** (Mausposition, Scroll-Progress, Drag-Physik, magnetischer Hover). `useState` rendert bei jedem Tick neu und bricht auf Mobile ein. Stattdessen `useMotionValue` / `useTransform` / `useScroll` aus `framer-motion`. Aktuell korrekt umgesetzt in genau 3 Dateien: [`HeroCinematicShowcase.tsx`](../src/components/home/herocinematicshowcase.tsx), [`HeroSectionV2.tsx`](../src/components/home/herosectionv2.tsx), [`ParallaxLayer.tsx`](../src/components/ui/parallaxlayer.tsx). Bei jedem neuen Cursor-/Scroll-getriebenen Effekt zuerst diese 3 Dateien als Referenzmuster lesen, nicht neu erfinden.
- **Scroll-Reveal-Default:** Für einfaches "Element erscheint beim Scrollen" `whileInView` + `viewport={{ once: true }}` verwenden (siehe `design-taste-frontend` Section 5.C) statt eigener `IntersectionObserver`-Logik.
- **GSAP-Pinning-Patterns (Sticky-Stack, Horizontal-Pan) sind im Repo aktuell nicht einsetzbar.** `gsap` ist keine Dependency (`package.json` geprüft, Stand dieser SOP). Vor Einsatz eines der beiden Skript-Patterns aus `design-taste-frontend` Abschnitt 5.A/5.B ist das Hinzufügen von `gsap` eine neue Abhängigkeit → Freigabe einholen (`xx_docs/02_command_reference.md`), nicht stillschweigend installieren.
- **`'use client'`-Isolation:** Jede Komponente mit Motion-Listenern, Scroll-Tracking oder Pointer-Physik bleibt ein isoliertes Leaf mit `'use client'` an der Spitze; Server Components rendern nur statisches Layout.

### Bekannte Doku-vs-Code-Diskrepanz (offen, nicht automatisch behoben)

`04_design_system_ui.md` §4 definiert die Standard-Spring-Konfiguration als `stiffness: 400, damping: 25, bounce: 0.4`. Das tatsächlich genutzte Primitive [`VibeMotion.tsx`](../src/components/ui/vibemotion.tsx) implementiert davon abweichend `stiffness: 300, damping: 30, mass: 1` (kein `bounce`). Diese SOP löst das nicht eigenständig auf — Kennzeichnung hier, damit die Diskrepanz beim nächsten Motion-Task nicht unbemerkt weitergetragen wird. Welcher Wert kanonisch ist, entscheidet Jan.

---

## 3 — Routing-Entscheidung: Welcher Skill, wann

Erster Schritt immer: Surface-Typ nach `impeccable`s eigener Mode-Definition einordnen (Persuade / Operate / Read / Experience, siehe `impeccable` SKILL.md Abschnitt "Modes").

| Surface-Typ (Mode) | Beispiel im Casino                                                                                                                                         |                                                    `design-taste-frontend`                                                    |                        `impeccable`                         |
| :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------: |
| **Operate**        | Spiele (Blackjack/Crash/Dice/Roulette/Slots), Admin-Dashboards, Settings-Modals                                                                            | ❌ Nicht einsetzen — Skill schließt Dashboards/Data-Tables/Multi-Step-Product-UI explizit aus (eigener Scope-Hinweis Zeile 8) | ✅ Primärskill: `critique`, `audit`, `operate.md`-Leitfaden |
| **Persuade**       | **Lobby/Home-Hub** (`src/app/page.tsx` → `HomeClientV2`: Hero-Showcase, VIP-Teaser, Jackpot-Sektion, Live-Highroller-Ticker), neue Marketing-/Promo-Seiten |                       ✅ Primärskill für Neubau: Section 0 (Design Read) + Section 4 (Bias Correction)                        |    Ergänzend für Politur nach Neubau: `polish`, `audit`     |
| **Read**           | Docs-artige Seiten (falls vorhanden, z. B. Regelwerke/FAQ)                                                                                                 |                                                        Selten relevant                                                        |              ✅ `clarify`, `layout`, `typeset`              |
| **Experience**     | Aktuell kein Casino-Anwendungsfall                                                                                                                         |                                                               —                                                               |                              —                              |

**Kurzformel:** Neubau einer Persuade-Surface → `design-taste-frontend` zuerst, `impeccable` danach zur Politur. Alles andere (Operate-Surfaces, also praktisch jedes bestehende Spiel/Dashboard) → ausschließlich `impeccable`, nie `design-taste-frontend`.

**Beispiel — Lobby-Anfrage:** _"Ich schau mir die Lobby-Seite an, führe Workflow 15 durch"_ ist ein gültiger, direkter Einstieg. Die Lobby (`HomeClientV2`) ist trotz eingeloggtem Kontext **Persuade**, nicht Operate — sie ist Hero-/Teaser-lastig und dient der Engagement-Steigerung, nicht der Aufgabenerledigung. Route: `design-taste-frontend` für Layout-/Struktur-Ideen (Farbe/Font/Motion bleiben trotzdem an 04 gebunden, siehe Abschnitt 1), danach `impeccable critique`/`polish` zur Feinabstimmung.

---

## 4 — Einbettung in bestehende Workflows

- **Redesign eines bestehenden Screens** (`10_workflow_frontend_revamp.md`, Abschnitt 2, 3-Optionen-Tabelle): `design-taste-frontend` Abschnitt 4.3/4.7 (Layout-Diversifizierung, Anti-Zickzack, Bento-Regeln) darf als Ideenquelle für die drei Konzeptvarianten dienen — die Farb-/Motion-Spalte der Tabelle bleibt trotzdem an 04 gebunden. `impeccable critique` ersetzt keinen Schritt aus 10, ergänzt aber Phase 5 (Responsive-Audit) um eine inhaltliche Kritik vor der URL-Abnahme.
- **Reiner Politur-Auftrag ohne Redesign** ("mach das UI klarer/hochwertiger"): direkt `impeccable` (passendes Sub-Command aus der Tabelle in dessen SKILL.md wählen: `polish`, `bolder`, `quieter`, `distill`, `clarify`), kein 3-Optionen-Gate aus 10 nötig, da kein visueller Konzeptwechsel stattfindet.
- **Neue Persuade-Surface ohne Vorlage:** `design-taste-frontend` Section 0–2 durchlaufen (Design Read + Dials), dabei Dial-Werte nur für Layout-Varianz/Motion-Intensität/Dichte nutzen — Farbpalette und Typografie werden trotzdem aus 04 übernommen, nicht aus der Skill-eigenen Palette-Tabelle.
- **K-Level/Freigabe:** Es wird kein neues K-Level-System eingeführt. Es gilt die K-Level-Tabelle aus 04 §8 bzw. 10 §5, je nachdem welcher Workflow gerade aktiv ist.

---

## 5 — Didaktischer Mehrwert & Lerneffekt für Jan

1. **Warum werden die Skills nicht 1:1 wie in ihrer Dokumentation angewendet?**
   Beide Skills sind für Projekte ohne festgelegtes Design-System geschrieben — sie lösen "welche Ästhetik passt". Casino hat dieses Problem bereits gelöst (Obsidian & Gold). Die Skills auf ihre _prozessualen_ Stärken zu reduzieren (Layout-Disziplin, a11y-Checks, Audit-Playbooks) statt ihre _ästhetischen_ Vorschläge zu übernehmen, verhindert, dass ein Redesign plötzlich von Gold auf eine der Skill-eigenen Alternativpaletten abdriftet.
2. **Warum überhaupt zwischen Operate und Persuade unterscheiden?**
   `design-taste-frontend` schließt Dashboards selbst explizit aus seinem Scope aus (Zeile 8 der Skill-Datei) — ihn trotzdem auf ein Spiel-HUD anzuwenden, würde bewusst gegen die eigene Skill-Spezifikation arbeiten und zu unpassenden "Landingpage-Bias"-Vorschlägen (z. B. Hero-Viewport-Regeln) auf einem Dashboard führen.
3. **Warum `useMotionValue` statt `useState` bei kontinuierlichen Werten?**
   `useState` löst bei jedem Wertwechsel einen React-Re-Render der gesamten Baumstruktur aus. Bei 60 Werten/Sekunde (Mausposition, Scroll) kollabiert das auf Mobile-Geräten spürbar. `useMotionValue` läuft außerhalb des React-Render-Zyklus und aktualisiert nur die betroffenen DOM-Properties direkt — deshalb ist es in `HeroCinematicShowcase.tsx`/`HeroSectionV2.tsx`/`ParallaxLayer.tsx` bereits so gelöst.

---

## 6 — Verwandte Artefakte

| Bedarf                                                                  | Datei                                                                                                                                                                                                             |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option-Gate-Workflow**                                                | [`xx_sop/01_workflow_jan_option_gate.md`](./01_workflow_jan_option_gate.md)                                                                                                                                       |
| **Design-System & Tokens**                                              | [`xx_sop/04_design_system_ui.md`](./04_design_system_ui.md)                                                                                                                                                       |
| **Motion & UI Polish Standards**                                        | [`xx_sop/16_motion_and_ui_polish.md`](./16_motion_and_ui_polish.md)                                                                                                                                               |
| **Anti-Template Web Design Quality**                                    | [`xx_sop/17_web_design_quality.md`](./17_web_design_quality.md)                                                                                                                                                   |
| **Frontend-Revamp-Lebenszyklus**                                        | [`xx_sop/10_workflow_frontend_revamp.md`](./10_workflow_frontend_revamp.md)                                                                                                                                       |
| **Ausführung & Selbstprüfung**                                          | [`xx_sop/02_workflow_jan_execution.md`](./02_workflow_jan_execution.md)                                                                                                                                           |
| **Standard-Spring-Primitive (Doku-vs-Code-Diskrepanz, s. Abschnitt 2)** | [`src/components/ui/VibeMotion.tsx`](../src/components/ui/vibemotion.tsx)                                                                                                                                         |
| **Referenzmuster `useMotionValue`/`useTransform`**                      | [`HeroCinematicShowcase.tsx`](../src/components/home/herocinematicshowcase.tsx) · [`HeroSectionV2.tsx`](../src/components/home/herosectionv2.tsx) · [`ParallaxLayer.tsx`](../src/components/ui/parallaxlayer.tsx) |
| **Skill-Quelle `design-taste-frontend`**                                | `C:\Users\hambu\.claude\skills\design-taste-frontend\SKILL.md`                                                                                                                                                    |
| **Skill-Quelle `impeccable`**                                           | `C:\Users\hambu\.claude\skills\impeccable\SKILL.md`                                                                                                                                                               |
