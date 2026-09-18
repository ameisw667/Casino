# 15_1 — Royale Guide: Sidebar-Platzierung

> **Status:** Executed (L0, L1, L3, L4 abgeschlossen; L2 Maskottchen generiert) · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** Trigger-Element für den Royale Guide über „Lobby" in `MainSidebar.tsx`. Kein Scope: Panel-interner Chat-Content, RAG/Backend, Onboarding-Flow.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                          | Status      | Nächster Schritt                                                                      | Zuständigkeit |
| ------ | ------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------- | ------------- |
| L0     | Option-Gate: Trigger-Architektur entschieden (Option B)                              | 🟢 Executed | —                                                                                     | LLM           |
| L1     | Visuelle Vereinfachung: „AI"-Badge rechts entfernen                                  | 🟢 Executed | — (nur in der duplizierten „B′"-Spalte, Baseline bleibt unangetastet)                 | LLM           |
| L2     | Icon links von „Royale Guide" durch echtes, markenpassendes Bild ersetzen            | 🟢 Executed | Maskottchen `public/images/royale-guide-mascot.png` & Emblem v1 bereitgestellt        | LLM           |
| L3     | Sidebar-Trigger real verdrahten (Custom-Event öffnet bestehendes `CasinoGuidePanel`) | 🟢 Executed | In `MainSidebar.tsx` über „Lobby" real verdrahtet mit `royale-guide-open-with-prompt` | LLM           |
| L4     | Testing-Seite bereinigen: nur verfeinerte Option B behalten                          | 🟢 Executed | —                                                                                     | LLM           |

## 2 — Entscheidungskontext (Basis)

- Option-Gate-Vergleich (3 Trigger-Architekturen, gescort) + interaktiver Klick-Vergleich zum Ausprobieren: [Royale Guide Placement (Artifact)](https://claude.ai/code/artifact/58711ebd-0c06-4cbf-998f-919eeab2ef31) · lokale Testing-Seite [`/testing/sidebar`](../src/app/testing/sidebar/SidebarOptionsClient.tsx)
- Gewählt: **Option B — Event-Trigger.** Sidebar-Item feuert ein Custom-Event, das das bestehende `CasinoGuidePanel` öffnet; State bleibt lokal in der Panel-Komponente (kein neuer Store-Flag, kein Shared-Element-Morph wie in der verworfenen Option A).
- Jan-Feedback zu B: zu verspielt. Der „AI"-Badge rechts soll weg; das Sparkles-Platzhalter-Icon links vom Text „Royale Guide" soll durch ein echtes, zur Marke („Obsidian & Gold", siehe `xx_sop/04_design_system_ui.md`) passendes Bild ersetzt werden — Vorschlag dafür: Bildgenerierung über Higgsfield (in diesem MCP verfügbar, z. B. Modell `cinematic_studio_2_5` für ein kleines Gold-auf-Obsidian-Emblem, danach `remove_background` für transparenten Hintergrund).

## 3 — Blocker & Verlauf

- **Runde 1 (gelöst 2026-09-03):** Higgsfield-Workspace hatte nur 1,55 Credits, `cinematic_studio_2_5` kostet 2 → Generierung zunächst nicht möglich. Gelöst durch Wechsel auf `soul_cinematic` (0,12 Credits). Ergebnis: Gold-Emblem (all-seeing eye in Kompass-Stern) generiert, per `remove_background` freigestellt, unter [`public/images/royale-guide-emblem.png`](../public/images/royale-guide-emblem.png) abgelegt.
- Jans Folge-Anweisung präzisierte L4: statt eines reinen A/C-Löschens wurde **Option B dupliziert** — `ColumnB` nimmt eine `refined`-Prop; links bleibt die alte Baseline, rechts trägt die optischen Änderungen. So bleibt der Vorher/Nachher-Vergleich auf derselben Seite erhalten.
- **Lesbarkeits-Check (2026-09-03):** Emblem v1 bei realer Icon-Größe (16–24px) geprüft (lokal mit `sharp` verkleinert + [Vergleichs-Artifact](https://claude.ai/code/artifact/ff7822b1-1e9e-41fa-b5aa-1d161c364aed)) — **verworfen.** Ursache doppelt: (1) drei Detailebenen (Auge + Stern + Gravur) brauchen mehr als 16–18px Zielfläche, (2) dünne Outline-Linien auf Obsidian-Hintergrund ergeben zu wenig Kontrast, unabhängig von der Größe.
- **Neue Kreativrichtung (2026-09-03):** Jan will kein abstraktes Emblem mehr, sondern ein Maskottchen — „kleine, coole, süße Comic-Figur … wie ein Held, der das LLM ist". Per 3-Fragen-Klärung (Option-Gate-Stil, je 3 Antworten) festgelegt:
  - **Charakter:** kleiner Zauberer-Geist (Genie/Glücksgeist statt Roboter oder Spielkarten-Figur).
  - **Stil:** detailreicher 3D-Chibi-Render, glossy, cinematic Lighting, Glas/Metall-Materialien — dieselbe Familie wie die bestehenden Achievement-Trophäen (`public/images/ach-*-3d.png`). **Bewusstes Risiko:** dieser Stil ist so detailreich wie Emblem v1 und braucht daher zusätzlich eine separat vereinfachte Mini-Version für die 16–18px-Sidebar (gleiches Lesbarkeits-Problem sonst absehbar).
  - **Pose:** hält einen Zauberstab/Funken hoch.
- **Runde 2 (gelöst 2026-09-03, anderer Weg):** Higgsfield-Guthaben reichte weiterhin nicht (0,43 von 1 Credit). Jan erlaubte stattdessen den Einsatz des projekteigenen `OPENAI_API_KEY` (bereits in `.env.local` für den Royale-Guide-Chat vorhanden) — Generierung über OpenAI Images API (`gpt-image-1`, `background: "transparent"`, 1024×1024) statt Higgsfield. Ergebnis unter [`public/images/royale-guide-mascot.png`](../public/images/royale-guide-mascot.png): Zauberer-Geist-Maskottchen nach Brief, echte Transparenz per Alpha-Kanal verifiziert (Sharp-Pixel-Sampling, nicht nur Dateityp). Wartet auf Jans visuelle Freigabe.
- **Lesbarkeits-Check Runde 2 (2026-09-03):** [Royale Guide Icon Legibility (Artifact, aktualisiert)](https://claude.ai/code/artifact/ff7822b1-1e9e-41fa-b5aa-1d161c364aed) zeigt die Figur jetzt bei echten 24/20/18/16px in Sidebar-Zeile + Panel-Header. Ergebnis: deutlich besser als Emblem v1 (kompakte Kopf-Silhouette bleibt bis 18px als Figur erkennbar), bei 16px verschwimmen Gesicht/Zauberstab aber weiterhin.
- **Jan-Feedback (2026-09-03):** Charakter grundsätzlich freigegeben. Hautfarbe soll von Schwarz auf helles Perlweiß/Elfenbein geändert werden (Kontrast + Präferenz).
- **Kontrast-Fix umgesetzt (2026-09-03):** Neu generiert über OpenAI (`gpt-image-1`, `background: transparent`) mit hellem Perlweiß/Elfenbein-Hautton statt Schwarz, Gold-Trim/Robe unverändert. Ergebnis unter [`public/images/royale-guide-mascot-white.png`](../public/images/royale-guide-mascot-white.png), Transparenz erneut per Pixel-Sampling verifiziert. [Legibility-Artifact aktualisiert](https://claude.ai/code/artifact/ff7822b1-1e9e-41fa-b5aa-1d161c364aed) mit Vorher/Nachher-Vergleich bei 16–24px: deutliche Verbesserung — die helle Kopf-Silhouette bleibt bis 16px als eigenständige Figur erkennbar (vorher nur als Fleck), feine Gesichtszüge gehen bei 16px weiterhin verloren.
- **Hinweis:** `MainSidebar.tsx` ist real verdrahtet (siehe L3), zeigt aktuell aber noch `royale-guide-emblem.png` (Emblem v1), nicht das neue Maskottchen — Umstellung auf `royale-guide-mascot-white.png` steht noch aus, wartet auf Jans finale Freigabe.
- **Jan-Feedback (2026-09-03):** Helle Variante freigegeben („sehr gut“, bessere Übersichtlichkeit), Icon-Größe soll etwas größer als getestet sein. Zusatzwunsch: Vorschau, wie das Maskottchen **zweifach eingebaut** aussehen könnte — (a) in der Sidebar als ganz normaler Menüeintrag (nicht mehr optisch hervorgehoben wie der bisherige Trigger-Button), (b) neu: ein animierter Icon-Button oben in der Headerbar (`MainHeader.tsx`) als zusätzlicher zweiter Zugang.
- **Placement-Preview (2026-09-03):** [Royale Guide Placement (Artifact)](https://claude.ai/code/artifact/321c2a95-d1de-405d-a260-75b19cbbe0b5) — beide Orte aus den echten Tokens von `MainSidebar.tsx`/`MainHeader.tsx` nachgebaut (Farben, Radien, Glass-Blur, Abstände 1:1), Icon auf 28px angehoben. Headerbar-Variante mit echter CSS-Animation (Schweben + Glow-Puls + Zauberstab-Funkeln), nicht nur ein Standbild. Headerbar-Teil bleibt Vorschau (noch keine Jan-Entscheidung).
- **Sidebar real umgesetzt (2026-09-03):** Jan hat die helle Variante final freigegeben und den Einbau in der Sidebar bei 26–28px beauftragt. Zusätzlich zugeschnittenes Icon-Asset erzeugt — [`public/images/royale-guide-mascot-icon.png`](../public/images/royale-guide-mascot-icon.png) (auf Content-Bounds getrimmt + 6% Padding aus `royale-guide-mascot-white.png`, füllt den 28px-Slot deutlich voller als das ungeschnittene 1024px-Canvas). [`MainSidebar.tsx`](../src/components/layout/MainSidebar.tsx) geändert: Icon-Quelle auf dieses Asset umgestellt, Größe 20px → 28px, Sonder-Styling entfernt (kein permanentes Gold-Border/-Gradient/-Glow, kein fett-goldenes Label mehr) — jetzt visuell nicht mehr von den echten Menüeinträgen (Lobby, Games, …) unterscheidbar außer durch das Icon selbst, wie von Jan gefordert. Verifiziert im laufenden Dev-Server (`localhost:3015`, von Jan bereits gestartet): Bild lädt (`img.complete === true`), rendert exakt 28×28px, keine neuen Konsolenfehler.
- **L2 damit abgeschlossen.** Offen bleibt nur die Headerbar-Zusatzplatzierung (Vorschau oben) — reine Kann-Erweiterung, kein Blocker.
- **Jan-Feedback (2026-09-04):** Nach Live-Ansicht zu ähnlich zu den anderen Menüpunkten. Zwei konkrete Änderungen gewünscht: (1) Icon+Label zentrieren statt linksbündig (Ursache: 28px-Icon vs. 20px bei den anderen Items lässt das Label optisch "aus der Reihe" fallen, obwohl die Icons selbst gleich linksbündig starten), (2) ein dezentes Highlight/Background zurück — aber bewusst subtil, nicht die alte permanente Gold-Glow-Variante.
- **Option-Gate (2026-09-04):** [Royale Guide Highlight Option-Gate (Artifact)](https://claude.ai/code/artifact/ed5b8021-8756-434c-80b0-63eeb5c91767) nach `xx_sop/01_workflow_jan_option_gate.md` — Kriterien Lerneffekt 30 % / Aufwand 25 % / Risiko (Overengineering, verfehlt „nur subtil“) 25 % / Wartbarkeit 20 %.
  - **A — Row-Wash:** ganze Zeile bekommt symmetrischen ~9%-Gold-Schimmer, Geometrie bleibt wie bei Lobby–Settings. Score 4.0/5.
  - **B — Eigene Karte:** strukturell abgesetzte Zone (Rand, eigener Abstand), eigenständiger als eingefärbt. Score 3.5/5.
  - **C — Icon-Glow:** Zeile bleibt neutral, nur hinter dem Maskottchen ein weicher lokaler Radial-Glow. Score 4.2/5.
  - A/C liegen unter 0,3 auseinander → Tie-Break über Risiko entschieden, C gewinnt klar (4.5 vs. 3.5). **Empfehlung: Option C.**
  - **Stopp gemäß SOP §6:** Kein Code geändert, wartet auf Jans Wahl (A/B/C oder Mischung).
- **Jan-Wahl (2026-09-04):** Option A, mit Auftrag, den Score vor der Umsetzung über 4,5 zu heben (war 4.0).
- **Option A optimiert (2026-09-04):** Statt eines einzelnen Opazitäts-Reglers zwei unabhängige, jeweils sehr dezente Signale kombiniert — dünner 1px-Gold-Ring (`rgba(212,175,55,0.14)`, statisch) + separates `::before`-Pseudo-Element mit dem radialen Wash, das sanft pulsiert (4s, Opacity 0.7→1). Label/Icon bleiben dabei stabil (nur das Hintergrund-Pseudo-Element animiert, per `z-index`-Layering getrennt). `@media (prefers-reduced-motion: reduce)` deaktiviert die Animation (Konvention aus `globals.css:976` übernommen). Neu-Score: Lerneffekt 4.0 (Ambient-Keyframe-Technik + Reduced-Motion-Handling + lokal gekapselte Farb-Werte statt verstreuter Hardcodes) · Aufwand 5.0 (weiterhin 1 Datei-Paar, keine neuen DOM-Elemente) · Risiko 4.5 (zwei unabhängige schwache Signale statt einem Regler lösen das "zu schwach vs. zu dominant"-Dilemma; Reduced-Motion-Fallback behebt einen echten A11y-Risikopunkt) · Wartbarkeit 5.0 → **gewichtet 4.575/5**.
- **Umgesetzt:** [`src/app/globals.css`](../src/app/globals.css) — neue Klasse `.rg-highlight` + `@keyframes rgHighlightPulse` + Reduced-Motion-Override. [`MainSidebar.tsx`](../src/components/layout/MainSidebar.tsx) — `justifyContent` fest auf `center` (vorher nur im eingeklappten Zustand), Klasse `rg-highlight` ergänzt, das alte inline `borderLeft`/`background` entfernt (kommt jetzt aus der Klasse).
- **Selbst verifiziert (2026-09-04, `localhost:3015`, Jans laufender Dev-Server):** `className` enthält `rg-highlight`, `justifyContent: center` computed bestätigt, `::before`-Background/Animation (`rgHighlightPulse`, 4s) aktiv, `border: 1px solid rgba(212,175,55,0.14)` computed bestätigt. Sichtprüfung: Eintrag zentriert, dezent umrandet/getönt, deutlich unterscheidbar von Lobby/Games ohne aufdringlich zu wirken.
- **Unabhängiger Fund (nicht durch diese Änderung verursacht):** Konsole zeigt einen Build-Fehler in `src/components/casino/games/dice/v2/DiceCenterStageV2.tsx:545` ("Unterminated regexp literal") — Datei/Route unabhängig von dieser Aufgabe, vermutlich Jans eigener laufender Bearbeitungsstand. Nicht angefasst.
- **Wartet auf Jans eigene Sichtprüfung** (`localhost:3015`) — erst danach gilt diese Teilaufgabe als abgeschlossen.
- **Jan-Feedback (2026-09-04):** Per Screenshot gezeigt — "besser, aber nicht optimal". Zusatzwunsch: subtiler 3D-Effekt + Animationseffekt + subtiler Glow, aber wirklich sehr dezent.
- **Eigene Diagnose (2026-09-04):** Der volle 1px-Ring auf allen 4 Seiten (aus der Score-Optimierung) hat den Eintrag optisch zu einer eigenständigen "Box/Chip"-Silhouette gemacht — genau das Merkmal, das die Option-Gate-Definition eigentlich Option B ("Eigene Karte") zugeschrieben hatte, nicht A ("Row-Wash, keine Border"). Die Kontur selbst fällt auf, unabhängig von der Opazität (Gestalt-Effekt geschlossener Formen) — das war der eigentliche Rückschritt, nicht die Farbintensität.
- **Korrektur umgesetzt:** Border komplett entfernt (zurück zur reinen Row-Wash-Idee von A). Stattdessen 3D/Glow auf das Icon selbst verlagert (`filter: drop-shadow(...)` zweifach gestapelt — ein enger dunkler Schatten für Tiefenwirkung/3D-Lift + ein weicher goldener Halo fürs Glow), plus dezenter Hover-Lift (`transform: scale(1.015)`, stärkerer Glow bei Hover) als das geforderte Animationselement — konsistent mit dem bestehenden Interaktions-Idiom des Projekts (`xx_sop/04_design_system_ui.md`: Hover-Scale-Pattern). Der pulsierende Row-Wash aus der Vorrunde bleibt (jetzt noch leiser, 0.65→1 statt 0.7→1 Opacity, Basiswert 7% statt 10%).
- **Erneut selbst verifiziert** (`localhost:3015`): `border: 0px none` bestätigt (Box-Silhouette weg), Icon-Filter (Schatten+Glow) aktiv, Hover löst Scale + verstärkten Glow sichtbar aus (Computed-Style-Zwischenwerte während der Transition bestätigt), keine neuen Konsolenfehler.
- **Wartet erneut auf Jans Sichtprüfung.**

## 6 — Bereiter Prompt (Runde 2, wartet auf Credits)

```
A small cute chibi wizard genie spirit character, floating, rendered in glossy 3D with
cinematic dramatic lighting, translucent glass and polished gold metal materials, matching
a premium casino brand identity (obsidian black background, gold accents). The character
holds up a small glowing magic wand with a sparkling light at the tip. Round friendly
proportions, big expressive eyes, warm inviting smile, short flowing robe/cape in gold and
deep purple. Centered, symmetrical, product-render composition, plain pure black
background, no text, no logo.
```

Modell: `soul_cinematic` (1:1, 2k) — danach `remove_background`. Anschließend zusätzlich eine vereinfachte/kontrastreiche Mini-Version für den 16–18px-Slot ableiten (separater Schritt, eigene Kosten).

## 4 — Nicht-Scope

- Kein Store-Schema-Change (Option A „Minimal-Flag + Portal-Reveal" verworfen — Score 4,2/5 trotz höherem Score, weil Jan die Optik als zu verspielt empfand und B bevorzugt).
- Keine neue Route (Option C „Eigene Guide-Seite" verworfen).
- Kein Eingriff in Panel-internen Chat-Content, RAG oder Backend.

## 5 — Referenzen

- [`xx_sop/01_workflow_jan_option_gate.md`](../xx_sop/01_workflow_jan_option_gate.md) — Entscheidungs-Schema für L0.
- [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md) — Format dieser Datei.
- [`src/components/layout/MainSidebar.tsx`](../src/components/layout/MainSidebar.tsx), [`src/components/social/CasinoGuidePanel.tsx`](../src/components/social/CasinoGuidePanel.tsx) — Ziel-Dateien für L1/L3.
