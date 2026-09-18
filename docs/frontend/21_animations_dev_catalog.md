# 21 — animations.dev: Öffentlicher Kurs-Katalog (Emil Kowalski)

> **Status:** 🟢 Vollständig erfasst — öffentlicher Anteil (2026-09-08) · **Link-Basis:** [animations.dev](https://animations.dev/) (Landing-Curriculum) + [animations.dev/changelog](https://animations.dev/changelog) (6 Einträge) — **keine Sitemap (HTTP 404), keine öffentlichen Lesson-URLs (Login)**
> **Votum-Legende:** ⭐⭐⭐ Top-Kandidat · ⭐⭐ Interessant · ❌ Nicht empfehlenswert · ⚪ Neutral (Erstzustand — Bewertung manuell durch Jan) · 💰 Kostenpflichtig
> **Schema-Adaption (Kurs statt Library):** `Lehreinheit | Offizieller Link | User-Votum | Lernziel für Casino-Frontend | Themenfeld` — analog [`12_componentry_complete_catalog.md`](./12_componentry_complete_catalog.md), aber Lehreinheiten statt Komponenten.
> **Aufgabenquelle:** [`T_FRONTEND/00_AUFGABEN_FRONTEND.md`](../../T_FRONTEND/00_AUFGABEN_FRONTEND.md) · **Planung:** Plan 61 (aufgabenbegleitend, nach Ausführung aufgelöst)

---

## Abdeckungsgrad & Rahmenbedingungen (ehrlich ausgewiesen)

- **Öffentlicher Anteil:** Alle Lehreinheiten, die auf der Landeseite/Changelog öffentlich sichtbar sind, sind erfasst. **Nicht öffentlich:** Lesson-URLs, Videos, Übungsaufgaben im Volltext, der Preis. Inhalte hinter der Kursplattform sind als solche gekennzeichnet — **0 erfundene Deep-Links.**
- **Jan-Gate-Dokumentation (L0):** Ausführung erfolgte als **Option a) nur öffentlicher Katalog** — Jan hat mit „vollumfänglich umsetzen" keinen Zugang (Kauf/Waitlist) gewährt. Ein späterer Kauf/Waitlist-Zugang würde den Katalog um Lesson-URLs und Innenansicht erweitern (Upgrade-Pfad offen).
- ⚠️ **Widerspruch dokumentiert:** Landeseite nennt **8** Theory-Lessons, Changelog Okt 2025 schreibt „All **7** theory lessons rebuilt" — öffentlich nicht auflösbar; bis zum Zugang als 7–8 geführt.
- ⚠️ **Kosten:** Kurs ist bezahlt; Preis nicht öffentlich. Enrollment geschlossen („reopens in 2027"), 4 Enrollment-Fenster/Jahr üblich; 2 Gratis-Preview-Lessons nur via Waitlist; Studenten −20 %, Teams −10–20 %, PPP-Rabatt, jederzeitige Refund-Zusage.
- **Lernziel-Passung:** Kursschwerpunkte (Spring-Physik, Good-vs-Great, Restraint) treffen die Motion-Skill-Lücken aus [`T_FRONTEND/02_motion.dev.md`](../../T_FRONTEND/02_motion.dev.md) (Kategorien 2 Transitions/Springs, 8 Performance, 9 Reduced Motion) — Modul 3 ist bekanntes Terrain (Engine bereits im Projekt).

---

## K1 — Module (4)

| Lehreinheit                                                                  | Offizieller Link                          | User-Votum | Lernziel für Casino-Frontend                                                                                                                                                 | Themenfeld                                              |
| :--------------------------------------------------------------------------- | :---------------------------------------- | :--------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| Modul 1 — Animation Theory (**8 Lessons** lt. Landing / **7** lt. Changelog) | [animations.dev](https://animations.dev/) |     ⚪     | Begründen, warum Animationen wirken: Easing-/Dauer-Wahl (statt Copy-Paste), wann Spring, wann gar nicht — direkt gegen die Spring-Fragmentierung-Befunde aus dem Lobby-Audit | Theorie (Easing, Springs, Timing, Taste)                |
| Modul 2 — CSS Animations                                                     | [animations.dev](https://animations.dev/) |     ⚪     | CSS-only Polishing ohne Engine: Transforms, Transitions, Keyframes, Toast-Demo — für Leichtgewicht-Micro-Interactions (Badges, States)                                       | CSS (Transforms, Transitions, Keyframes, 3D, clip-path) |
| Modul 3 — Framer Motion (now Motion)                                         | [animations.dev](https://animations.dev/) |     ⚪     | Engine-Wissen vertiefen für das im Projekt eingesetzte Motion: Basics → komplexe Muster (Feedback-Popover, 3 Übungen) → Troubleshooting; Deckung mit Motion-Katalog 13       | Motion/framer-motion                                    |
| Modul 4 — Good vs Great Animations                                           | [animations.dev](https://animations.dev/) |     ⚪     | Differenzierungs-QC: Gefühlsübertragung, Orchestrierung, Accessibility, Performance — Maßstab für BigWinOverlay-/RankBenefitsModal-Polish auf Top-Niveau                     | Theorie & Praxis (Orchestrierung, A11y, Performance)    |

## K2 — Walkthroughs (4 gelistet, 15 Lessons; +1 aus Changelog)

| Lehreinheit                                                                                           | Offizieller Link                          | User-Votum | Lernziel für Casino-Frontend                                                                           | Themenfeld                      |
| :---------------------------------------------------------------------------------------------------- | :---------------------------------------- | :--------: | :----------------------------------------------------------------------------------------------------- | :------------------------------ |
| Family's Drawer (Mobile Drawer der Family iOS-App)                                                    | [animations.dev](https://animations.dev/) |     ⚪     | Natürliche Overlay-Bewegung — Übertragung auf Modals/Bottom-Sheets (MobileNav, Quick-View)             | Motion (Drawer-Choreografie)    |
| Dynamic Island (Idle/Ring-Timer, „organisch-natürliche" Springs)                                      | [animations.dev](https://animations.dev/) |     ⚪     | HUD-Pill-Muster (Live-Win-Ribbon/Toast) mit glaubwürdiger Federphysik                                  | Motion (Spring-Design)          |
| Navigation Menu (3-teilig, Changelog Jul 2025)                                                        | [animations.dev](https://animations.dev/) |     ⚪     | Nav-Übergänge sauber orchestrieren (MainHeader/MobileNav)                                              | Motion (Komponenten-Produktion) |
| SVG Animations (Illustration der Kursseite)                                                           | [animations.dev](https://animations.dev/) |     ⚪     | SVG-Pfad-Animation für Logos/Embleme/Deko (Brand-Details)                                              | SVG (Stroke/Path)               |
| Hero Illustration Walkthrough (6 Lessons, Changelog Jan 2026 — auf Landeseite nicht separat gelistet) | [animations.dev](https://animations.dev/) |     ⚪     | Kompletter Produktionsprozess Hero-Animation (Planung → Iteration) — Blaupause für Lobby-Hero-Arbeiten | Motion (Full-Produktion)        |

## K3 — Benannte Übungen (6 Gruppen; Aufgaben im Volltext hinter Login)

| Lehreinheit                                                                                          | Offizieller Link                          | User-Votum | Lernziel für Casino-Frontend                                                                | Themenfeld                |
| :--------------------------------------------------------------------------------------------------- | :---------------------------------------- | :--------: | :------------------------------------------------------------------------------------------ | :------------------------ |
| Feedback-Popover (3 Übungen, in Modul 3)                                                             | [animations.dev](https://animations.dev/) |     ⚪     | Popover-/Feedback-Muster komplex orchestrieren (Toast-/Confirmation-Flows)                  | Motion (Übung)            |
| Game-Card-Grid: The Oddysey, Angry Rabbits, Ghost town, Pirates in the jungle, Lost in the mountains | [animations.dev](https://animations.dev/) |     ⚪     | Karten-Grid mit Charakter — direkt übertragbar auf ElevatedGameCard/BentoArcadeCells-Polish | Motion (Übung)            |
| Hold to Delete (clip-path, Changelog Apr 2025)                                                       | [animations.dev](https://animations.dev/) |     ⚪     | Destruktive Aktion mit Halte-Geste absichern (Admin-/Vault-Detailflows)                     | Motion (clip-path)        |
| Coin Flip (Lösung ergänzt Jul 2025)                                                                  | [animations.dev](https://animations.dev/) |     ⚪     | 3D-Rotation — motivverwandt mit 3D-Dice/Wheel-Hebeln (FE-02/FE-13)                          | Motion/CSS (3D)           |
| Train your Judgement (25+ Side-by-side-Vergleiche, Changelog Apr 2026)                               | [animations.dev](https://animations.dev/) |     ⚪     | Mediocre-vs-gut trainieren — Bewertungskompetenz für eigene Motion-QC (Taste-QC-SOP)        | Theorie (Urteilsschulung) |
| CSS-Modul-Übungen: Toast, blinkender Cursor, Orbiting, Tabs (Changelog Jan 2025)                     | [animations.dev](https://animations.dev/) |     ⚪     | Micro-Interactions ohne Engine (Badges, State-Indikatoren)                                  | CSS (Übungen)             |

## K4 — Bonus & Community (7)

| Lehreinheit                                                                                                                                                                                                                                                                                                    | Offizieller Link                          | User-Votum | Lernziel für Casino-Frontend                                                                                | Themenfeld       |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :--------: | :---------------------------------------------------------------------------------------------------------- | :--------------- |
| 15 AI Skills (u. a. /animate, /review-animations, /debug-animation, /motion-react, /scroll-animations, /animation-accessibility, /gesture-ui, /css-animations, /prototype, /motion-brief, /find-animation-opportunities, /improve-animations, /animation-performance, /animation-vocabulary, /pick-ui-library) | [animations.dev](https://animations.dev/) |     ⚪     | LLM-gestützte Animations-Arbeit systematisieren — passgenau zur LLM-Zuständigkeits-Architektur des Projekts | KI-Workflows     |
| Custom Easing Curves (Set des Autors)                                                                                                                                                                                                                                                                          | [animations.dev](https://animations.dev/) |     ⚪     | Kurven-Bibliothek statt Bauchgefühl (Ergänzung zu Motion-Tokens)                                            | Theorie (Easing) |
| Guest Lesson — Josh Puckett: „Animations as Proof of Care" (Changelog Apr 2026)                                                                                                                                                                                                                                | [animations.dev](https://animations.dev/) |     ⚪     | Animationsqualität als Produktqualität verstehen (Design-Culture)                                           | Theorie (Kultur) |
| Interviews: Fey (@brotzky), poolside (@mrncst), Vercel (@henryheffernan), Family (@lochieaxon)                                                                                                                                                                                                                 | [animations.dev](https://animations.dev/) |     ⚪     | Produktionspraxis Top-Teams absehen                                                                         | Interviews       |
| Discord-Community (exklusiv)                                                                                                                                                                                                                                                                                   | [animations.dev](https://animations.dev/) |     ⚪     | Feedback-Schleife für eigene Motion-Übungen (hinter Zugang)                                                 | Community        |
| Kuratierte Ressourcen (Videos, Artikel)                                                                                                                                                                                                                                                                        | [animations.dev](https://animations.dev/) |     ⚪     | Weiterführende Referenzen sortiert übernehmen                                                               | Sammlung         |
| Zertifikat (ab 70 % Abschluss, verifizierbare URL)                                                                                                                                                                                                                                                             | [animations.dev](https://animations.dev/) |     ⚪     | Lernfortschritt nachweisbar (Skill-Ladder-Ergänzung)                                                        | Meta             |

## K5 — Kauf & Zugang (2; ausschließlich Jan-Gate)

| Lehreinheit                                                                                                                                                        | Offizieller Link                          | User-Votum | Lernziel für Casino-Frontend                                          | Themenfeld         |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------- | :--------: | :-------------------------------------------------------------------- | :----------------- |
| Enrollment & Preis (geschlossen, „reopens in 2027"; Preis nicht öffentlich; 4 Fenster/Jahr; Updates kostenfrei)                                                    | [animations.dev](https://animations.dev/) |   ⚪ 💰    | Kaufentscheid liegt allein bei Jan; Katalog bleibt öffentlich geführt | Meta (Zugang)      |
| Rabatte & Konditionen: 2 Gratis-Preview-Lessons via Waitlist · Studenten −20 % · Teams −10–20 % · PPP (ländergebunden) · Refund jederzeit · Invoice-Link nach Kauf | [animations.dev](https://animations.dev/) |     ⚪     | Konditionen für Jans Entscheid dokumentiert                           | Meta (Konditionen) |

## K6 — Changelog-Verlauf (6 Einträge)

| Lehreinheit                                | Offizieller Link                               | User-Votum | Lernziel für Casino-Frontend                                                                                                                   | Themenfeld |
| :----------------------------------------- | :--------------------------------------------- | :--------: | :--------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| Apr 2026 — „Train your Judgement"          | [/changelog](https://animations.dev/changelog) |     ⚪     | Vergleichsübungen + Guest Lesson + Skill-File-Updates + **Migration framer-motion → motion/react** (Projekt-relevant: Legacy-Paket-Diskussion) | Update     |
| Jan 2026 — „Hero Illustration Walkthrough" | [/changelog](https://animations.dev/changelog) |     ⚪     | 6-Lesson-Serie + 3 SVG-Grundlagen-Lessons + Skill.md für Coding-Agents                                                                         | Update     |
| Okt 2025 — „Fully refreshed Theory Module" | [/changelog](https://animations.dev/changelog) |     ⚪     | 7 Theory-Lessons neu gebaut + „Practical Animation Tips" (15+ Tipps)                                                                           | Update     |
| Jul 2025 — „New Walkthrough Series"        | [/changelog](https://animations.dev/changelog) |     ⚪     | Navigation-Menu-Serie + „Animations and AI" (Cursor-Rules) + Coin-Flip-Lösung                                                                  | Update     |
| Apr 2025 — „New Framer Motion Lessons"     | [/changelog](https://animations.dev/changelog) |     ⚪     | Hooks `useSpring`/`useTransform` (2 Lessons) + Hold-to-Delete-Übung                                                                            | Update     |
| Jan 2025 — „New CSS Animations Module"     | [/changelog](https://animations.dev/changelog) |     ⚪     | CSS-Transforms/Transitions/Keyframes/3D/clip-path + Interview                                                                                  | Update     |

---

## Audit-Zusammenfassung (Selbstprüfung L3)

| Prüfpunkt                 | Soll                             | Ist                                                                |
| :------------------------ | :------------------------------- | :----------------------------------------------------------------- |
| Öffentliche Lehreinheiten | alle sichtbaren                  | **30 Zeilen** (K1: 4 · K2: 5 · K3: 6 · K4: 7 · K5: 2 · K6: 6)      |
| Deep-Links                | 0 erfundene                      | 0 — verlinkt sind nur Landeseite + Changelog (öffn. erreichbar) ✅ |
| Changelog-Einträge        | 6                                | 6 ✅                                                               |
| Walkthroughs              | 4 lt. Landing (+1 lt. Changelog) | 5 Zeilen, Abweichung je Zeile dokumentiert ✅                      |
| 7/8-Widerspruch           | dokumentiert                     | Header + K1-Zeile ✅                                               |
| Spalten-Schema            | 5 Spalten (adaptiert)            | 5 Spalten, 0 leere Zellen ✅                                       |
| Vota                      | alle ⚪                          | keine Vorab-Votung ✅                                              |
| HTTP-Check                | verlinkte Seiten 200             | animations.dev + /changelog = 200 (2026-09-08 ausgelesen) ✅       |
| Jan-Gate                  | kein Kauf/Zugang durch LLM       | Option a) ausgeführt, Upgrade-Pfad dokumentiert ✅                 |

**Offene Punkte für Jan:** 1) Vota für alle 30 Einträge (alle ⚪). 2) Kauf-/Waitlist-Entscheid (Preis nicht öffentlich, Enrollment erst 2027; Alternativ-Upgrade über 2 Gratis-Preview-Lessons möglich). 3) Bei Zugang: Katalog um Lesson-URLs + 7/8-Klärung erweitern.
