# T_FRONTEND — Aufgabenpool Frontend (nur Planung)

> **Status:** 🟢 Beide Aufgaben ausgeführt (2026-09-08) — Pool aktuell leer
> **Zweck:** Sammelpunkt für geplante, aber noch nicht umgesetzte Frontend-Aufgaben, damit sie nicht verloren gehen.
> **Schema-Referenz:** [`T_FRONTEND/00_UEBERSICHT.md`](./00_UEBERSICHT.md) · Katalog-Reihe: [`docs/frontend/12_componentry_complete_catalog.md`](../docs/frontend/12_componentry_complete_catalog.md), [`docs/frontend/13_motion_dev_complete_catalog.md`](../docs/frontend/13_motion_dev_complete_catalog.md)

---

## Aufgabe 1: Skiper-UI-Katalog (analog 12er/13er-Schema)

**Planungsdatei:** Plan 60 (Execution-Ready erstellt, geprüft, nach Ausführung aufgelöst — Wegwerf-Gerüst gemäß jan-planner-Lebenszyklus).

**Ziel:** Vollständiger Klick-Katalog für [skiper-ui.com](https://skiper-ui.com/) — analog zu [`12_componentry_complete_catalog.md`](../docs/frontend/12_componentry_complete_catalog.md) und [`13_motion_dev_complete_catalog.md`](../docs/frontend/13_motion_dev_complete_catalog.md), in `docs/frontend/` (nächste freie Nummer: `20_skiper_ui_complete_catalog.md`).

**Scope (wie bei 12/13):**

- [ ] Alle Komponenten mit Sitemap/Repo als Link-Basis erfassen (gleiche 5 Spalten: `Komponente | Offizieller Link | User-Votum | Casino-Einsatzbereich | Technologie`)
- [ ] Alle Vota initial ⚪ neutral; Bewertung erfolgt manuell durch Jan
- [ ] Selbstprüfung: Zeilenzählung, Link-Verifikation (Stichproben), Spalten-Konsistenz
- [ ] Erst danach Bescheid an Jan

**Bewertete Randbedingungen (Stand 2026-09-08):**

- ⚠️ **Lizenz:** Free-Tier verlangt **Attribution** an Skiper UI; Pro-Tier kostenpflichtig (License-Key via Polar). → Katalog dient primär als Inspirations-/Vergleichsquelle, nicht als Installationsquelle.
- ⚠️ **Tech-Stack:** Skiper UI zieht **framer-motion UND GSAP** ein — Kollision mit der Motion-only-Engine-Vorgabe des Projekts.
- ✅ **Motiv-Abgleich:** Bei Votum prüfen, ob es ein MIT-Äquivalent in React Bits/Aceternity/Fancy Components gibt (z. B. Goo-Effekt, Progressive Blur, Dynamic Island).

**Abhängigkeiten/Reihenfolge:** Keine — jederzeit startbar; sinnvoll erst nach Jans Vota zu 14 (React Bits), um Doppelungen im Votum sauber zu markieren.

---

## Aufgabe 2: animations.dev-Katalog (analog 12er/13er-Schema)

**Planungsdatei:** Plan 61 (Execution-Ready erstellt, geprüft, nach Ausführung aufgelöst — Wegwerf-Gerüst gemäß jan-planner-Lebenszyklus).

**Ziel:** Vollständiger Katalog für [animations.dev](https://animations.dev/) (Emil Kowalski — Animations-Kurs fürs Web, Spring-Physik, Micro-Interactions, „Taste") — analog zu [`12_componentry_complete_catalog.md`](../docs/frontend/12_componentry_complete_catalog.md) / [`13_motion_dev_complete_catalog.md`](../docs/frontend/13_motion_dev_complete_catalog.md), in `docs/frontend/` (nächste freie Nummer bei Start prüfen).

**Besonderheit:** animations.dev ist ein **Kurs/Lernangebot, keine Komponenten-Library** — die Spalten „Casino-Einsatzbereich/Technologie" entsprechend interpretieren (Kapitel/Lehreinheit statt Komponente); Lernziel-Passung zum Primärziel des Projekts ist hoch (Motion-Engine, Spring-Physik, Restraint-Prinzipien).

**Scope (wie bei 12/13):**

- [ ] Kursstruktur/Kapitel mit offiziellen Links erfassen (gleiche 5 Spalten, angepasste Interpretation)
- [ ] Vota initial ⚪; Bewertung manuell durch Jan
- [ ] Kosten prüfen (Kurs ist bezahlt — Zugangs-/Kaufentscheidung vor der Bewertung klären)
- [ ] Selbstprüfung: Zeilenzählung, Link-Verifikation, Spalten-Konsistenz
- [ ] Erst danach Bescheid an Jan

**Abhängigkeiten/Reihenfolge:** Keine — unabhängig von Aufgabe 1 startbar.

---

## Offene Punkte gesamt

| Nr. | Aufgabe | Planungsdatei | Niveau (LLM-Selbsteinschätzung) | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Skiper-UI-Katalog (`docs/frontend/20_skiper_ui_complete_catalog.md`) | Plan 60 (nach Ausführung aufgelöst) | **Top 11–30 %, oberes Band (Execution-Ready)** — alle 4 Ebene-2-Kriterien erfüllt; Selbstprüfung mit Nachbesserungen (`/components`-Namensquelle, Gruppierungsregel, Abbruchkriterien L2/L4, Nummern-Pricheck) | 🟢 **Erledigt (2026-09-08):** 106/106 Komponenten, alle `/v1`-Seiten einzeln ausgelesen, Audit grün → [`20_skiper_ui_complete_catalog.md`](../docs/frontend/20_skiper_ui_complete_catalog.md) |
| 2 | animations.dev-Katalog (Kurs-Katalog, `docs/frontend/21_…`) | Plan 61 (nach Ausführung aufgelöst) | **Top 11–30 %, oberes Band (Execution-Ready)** — alle 4 Ebene-2-Kriterien erfüllt; Selbstprüfung mit Nachbesserungen (Abbruchkriterien L2/L4, Schreibweisen-Verbatim-Check, Übungsanzahl entschärft) | 🟢 **Erledigt (2026-09-08):** öffentlicher Anteil vollständig (30 Lehreinheiten), Jan-Gate als Option a dokumentiert → [`21_animations_dev_catalog.md`](../docs/frontend/21_animations_dev_catalog.md) |

**Niveau-Skala:** gemäß [`xx_sop/shared/jan-planner/SKILL.md`](../xx_sop/shared/jan-planner/SKILL.md) (Top 1–10 % Weltklasse · Top 11–30 % Solide · Top 31–50 % Schulden · Top 51–75 % Eingeschränkt · Top 76–100 % Kritisch). Beide Pläne sind reine Doku-Pläne ohne Code — die Top-1–10-%-Stufe (automatisierte Tests) ist auf dieses Aufgabenspektrum nicht anwendbar; L3-Audits (Grep-Zählung, HTTP-Stichproben) sind als Ersatz verankert.