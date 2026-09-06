# 02-3 — Motion-Lab V5: Awwwards-Gap-Analyse & Bottlenecks

> **Status:** Analyse + Option-Gate · **Stand:** 2026-08-29 · **Owner:** LLM · **Nächster Schritt:** Jans Optionswahl → Execution
> **Bezug:** [`02_motion.dev.md`](02_motion.dev.md) (§0 Mapping, §6c V4) · [`02-2_motion_lab_v4_living_hero.md`](02-2_motion_lab_v4_living_hero.md) · [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md) · [`xx_sop/17_web_design_quality.md`](../xx_sop/17_web_design_quality.md)
> **Ziel:** „mindestens Top-10 %"-Niveau (Awwwards-Referenz: https://www.awwwards.com/) auf `/games-2`, Test-Ausnahme: Sandbox bleibt Bare-Route.

---

## 1 — Ehrliche Gap-Analyse: Warum V4 auf ~Top-70 % steht

**Methode:** Struktur-/Stack-Analyse gegen SOTD-Gewinner 2026 (The Power of Storytelling 7.87, TRIONN 7.42, Razorpay Sprint 26 7.42, Sidewalk/Sidewave 7.31, Horeca Social HM). Keine visuelle Selbstbewertung — Befunde sind konzeptionell (funktional fehlt/ist nicht vorhanden), Abnahme bleibt bei Jan.

| #      | Bottleneck                                                                                                                                                                                                                                                                                      | Befund an `/games-2` V4                                                                                         | Awwwards-Referenz                                                          |
| :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **B1** | **Keine tragende Design-Idee** — V4 ist ein _Feature-Stack_ (Magnet + Marquee + Puls = 3 unabhängige Demos), keine eine das ganze Blatt dominierende Konzeption. Gewinner-Seiten haben exakt EINEN prägenden Gag (Scroll-Narrative / Shader-Hero / Hold-to-Blast), dem alles untergeordnet ist. | Headline, Band und Spotlight koexistieren ohne Hierarchie                                                       | TRIONN „hold to blast"; Razorpay „100+ Interaktionen, EIN Narrativ"        |
| **B2** | **Keine Tiefenebene (WebGL/shader/3D)** — alles ist DOM-2D.                                                                                                                                                                                                                                     | kein Canvas/WebGL im Mesh                                                                                       | Power of Storytelling: Mouse-Shader-Hero; Sidewave: WebGL; TRIONN: 3D-Type |
| **B3** | **Cursor ist unsichtbar** — die Seite _reagiert_ auf Pointer (Magnet/Tilt), aber es gibt keine Cursor-Identität (custom cursor/trail/blend).                                                                                                                                                    | Systemcursor; Reaktion nur lokal                                                                                | Mouse-reactive Design ist 2026 Standardgewinn-Merkmal                      |
| **B4** | **Typo ist statisch nach Entrance** — kein kinetischer Text als Struktur (Sticky-Scale-Statements, Explosive Reveals).                                                                                                                                                                          | H1 zweizeilig fest, Subline fix                                                                                 | Horeca: Sticky-Typo skaliert zu Brand-Statement                            |
| **B5** | **Kein Entrance-Theater** — kein Preloader/Page-Transition; Seite „erscheint" einfach.                                                                                                                                                                                                          | erste Paint = Endzustand nach Stagger                                                                           | Branded Preloader + elegante Page Transitions bei fast allen SOTD          |
| **B6** | **Kein Sound-Layer** — Interaktion still.                                                                                                                                                                                                                                                       | — (parallele Repo-Arbeit baut bereits SoundManager/Tone auf — Kollisionsrisiko, nicht in diesem Scope anfassen) | TRIONN: Sound on hover/drag                                                |
| **B7** | **Typo-/Paletten-Charakter** — Casino-Skin (Obsidian & Gold) korrekt nach SOP 04, aber Typografie-Charakter (Font-Pairing, Display-Persönlichkeit) ist App-Niveau, nicht Editorial-Niveau.                                                                                                      | Standard-App-Typo + Mono-Numbers                                                                                | Gewinner: bewusste Display-Fonts, 2-Farb-Restriktion                       |

**Kernaussage:** Bottleneck #1 ist nicht Technik, sondern **Konzeption** (B1) — die Seite braucht eine dominante Design-Idee. Alle Gewinner-Merkmale (B2–B7) sind _Instrumente der einen Idee_, nicht Features à la carte.

---

## 2 — Option-Gate (Kriterien: Lerneffekt 30 % · Aufwand 25 % · Risiko 25 % · Wartbarkeit 20 %)

Vorgabe im Chat (Matrixtabelle + Scoring + Adversarial + Pre-Mortem) → Warten auf Jans Wahl (A/B/C).

---

## 3 — Entscheidungs-Log

1. **2026-08-29, Gate 1:** C gewählt (WebGL-Hero + Motion-Shell).
2. **2026-08-29, Gate 2 (Sub-Gate):** 3 Umsetzungs-Arten für den WebGL-Hero, je nach SOTD-Referenz abgeleitet — Matrixtabelle im Chat, Warten auf Jans Wahl → danach Planungsdatei + Execution.

## 4 — (nach Freigabe) Execution-Plan + Verifikation
