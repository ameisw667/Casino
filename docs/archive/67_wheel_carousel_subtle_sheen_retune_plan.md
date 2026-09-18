# 67 — Wheel Carousel: Kompaktere Box + subtiler CSS-Lichtsheen statt Gold-Dominanz

> **Status:** Executed (archiviert) · **Stand:** 2026-09-13 · **Owner:** LLM (100 % LLM-Zuständigkeit, Jan nur bei visueller Endabnahme/Gate) · **Scope:** Ausschließlich `src/components/casino/games-catalog/WheelCarousel.tsx` erhält (1) eine reduzierte vertikale Höhe und (2) einen subtileren, nicht-goldenen Hintergrund: bestehender `LiquidGoldChromeCanvas` bleibt (Componentry Liquid Chrome), aber stärker gedämpft + verstärkter dunkler Scrim + neuer reiner CSS-`@keyframes`-Lichtsheen (neutral/weiß statt Gold) darüber. Keine anderen Dateien werden verändert.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Herkunft:** Jans Option-Gate-Wahl „Option A" aus der Konversation (2026-09-12/13) — 3 Optionen je ≥4.2/5, alle mit Componentry-WebGL-Pflicht; A gewann per Score+Tie-Break (4.63/5, Risiko 5/5 vs. B 4.5/5). Nachträgliche Jan-Vorgabe: Effekt darf nicht aggressiv/golden wirken, sondern subtil, transparent, dunkel oder in einem anderen Ton.

---

## 1 — Assessment & Dekomposition (Ebene 1: Status Quo Top 55 %)

| # | Subkategorie | Niveau | Befund & Beleg (Datei / Test) | Bottleneck? | Action Item |
|---|---|---|---|:---:|---|
| 01 | Vertikale Boxhöhe | Top 60 % | Container-Padding `28px 24px 36px` (Desktop), Stage-Höhe `340px`, `ITEM_HEIGHT=330` — Jan empfindet die Sektion als zu hoch (`WheelCarousel.tsx:173,321,25`). | 🔴 JA | Padding/Stage/`ITEM_HEIGHT` proportional kürzen, Karten-Innenaufteilung (Artwork/Body) exakt nachziehen, damit nichts abgeschnitten wird. |
| 02 | Farbdominanz des Hintergrunds | Top 80 % (kritisch laut Jans explizitem Feedback + Screenshot) | `intensity={0.4}` auf `LiquidGoldChromeCanvas` (`:190`) plus goldgetönter Scrim-Rahmen ergeben einen zu dominanten, "aggressiv gelben" Gesamteindruck; Jan fordert explizit "keinen goldenen Ton, sondern transparent/dunkel/anderer Ton". | 🔴 JA | `intensity` weiter auf `0.2` senken, Scrim-Opazität von `0.35/0.7` auf `0.55/0.85` erhöhen (mehr Obsidian, weniger sichtbares Gold). |
| 03 | Fehlende Transienz/Bewegung ("Wasseroberfläche") | Top 65 % | Aktuell nur statischer Shader + statischer Scrim, kein zeitlich auftauchendes/verschwindendes Lichtelement. | 🔴 JA | Neuer reiner CSS-`@keyframes`-Sheen: diagonaler, neutral-weißer Lichtstreif, der langsam über die Box wandert und dabei ein-/ausblendet — kein Gold, kein JS-Loop. |
| 04 | Kartenlesbarkeit (Vorgeschichte aus Plan 61) | Top 30 % (bereits durch Scrim gelöst) | Scrim aus Plan 61 hat das ursprüngliche Lesbarkeitsproblem bereits behoben (`WheelCarousel.tsx:205-214`). | Nein | Nur verstärken (Punkt 02), Struktur bleibt. |
| 05 | Reduced-Motion für neuen Sheen | Top 50 % | Neuer CSS-Sheen braucht eigenes `prefers-reduced-motion`-Gate, da rein CSS und nicht durch `useReducedMotion()` (JS) abgedeckt. | 🔴 JA | `@media (prefers-reduced-motion: reduce)`-Block, der die Sheen-Animation deaktiviert. |
| 06 | Scope-Treue zu bestehender Layer-Architektur | Top 20 % | Layer A (Liquid Chrome, zIndex 0), B (Pixel Canvas, zIndex 1), C (Scrim, zIndex 2) aus Plan 61 sind bereits sauber isoliert. | Nein | Neuen Sheen als Layer D (zIndex 3) einfügen, Content-Layer auf zIndex 4 anheben — keine Restrukturierung der bestehenden Layer nötig. |

---

## 2 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
|---|---|---|---|:---:|---|
| **L0** | Baseline & Diagnose | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | Aktuelle Werte (Padding, Stage-Höhe, `ITEM_HEIGHT`, `intensity`, Scrim) protokolliert |
| **L1** | Kompaktere Box (Höhenreduktion) | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | Padding/Stage/`ITEM_HEIGHT`/Artwork/Body/Pagination gekürzt, Summe exakt passend (130+150=280px) |
| **L2** | Subtilerer, nicht-goldener Hintergrund (Intensity + Scrim + CSS-Sheen) | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | `intensity` 0.4→0.2, Scrim 0.35/0.7→0.55/0.85, neuer `wheel-sheen`-Layer (weiß, `mixBlendMode: screen`, reduced-motion-safe) |
| **L3** | Self-Audit & visuelle Prüfung | `src/components/casino/games-catalog/WheelCarousel.tsx` | 🟢 Executed | LLM | Datei re-gelesen, Klammern/Tags/Z-Index-Reihenfolge (0-1-2-3-4) bestätigt |
| **L4** | 5-Stufen-DoD & Aufräumen temporärer Dateien | Lokale Test-Suite + Scratchpad | 🟢 Executed | LLM | Typecheck 0 Fehler, Test 1700/1700, Lint 0 neue Fehler, Build Exit 0, `/tmp/build_check.log` gelöscht |

---

## 3 — Kontext-Koffer

### 3.1 Relevante Dateien & Pfade
- Ziel-Datei (einzige Datei mit Schreibzugriff): [`src/components/casino/games-catalog/WheelCarousel.tsx`](file:///v:/VibeCoding/Casino/src/components/casino/games-catalog/WheelCarousel.tsx).
- Vorgänger-Plan (Kontext, bereits „Executed (archiviert)"): [`T_FRONTEND/61_wheel_carousel_liquid_chrome_pixel_canvas_plan.md`](./61_wheel_carousel_liquid_chrome_pixel_canvas_plan.md) — dokumentiert die bestehende Layer-Architektur (A/B/C) und die erste Nachjustierung.
- Referenzmuster für CSS-`<style>`-Keyframes im selben Ordner: [`src/app/games/_components/LiveWinRibbon.tsx`](file:///v:/VibeCoding/Casino/src/app/games/_components/LiveWinRibbon.tsx) (`ribbonScroll`-Keyframe + `prefers-reduced-motion`-Media-Query nach demselben Muster).
- Design-System-Regel: [`xx_sop/04_design_system_ui.md`](../xx_sop/04_design_system_ui.md) — Z-Index-Band 0-5 für Hintergrund/Canvas bleibt eingehalten (neuer Sheen-Layer = 3, Content = 4).

### 3.2 Systemregeln & Invarianten
- **Componentry-Pflicht (Jans ausdrücklicher Wunsch):** `LiquidGoldChromeCanvas` bleibt als WebGL-Element erhalten — keine reine CSS-Ersatzlösung ohne WebGL.
- **Keine Änderung an `LiquidGoldChromeCanvas.tsx` oder `CrashPixelCanvas.tsx`** — beide bleiben unverändert wiederverwendet, nur Props/umgebende Layer in `WheelCarousel.tsx` werden angepasst.
- **Zero-Wallet-Autorität:** Reine UI-/Motion-Schicht, keine State- oder Finanzmutationen.
- **Ton-Vorgabe:** Neuer Sheen-Layer nutzt ausschließlich neutrales Weiß/Silber (`rgba(255,255,255,…)`), kein `#D4AF37`/Gold-Ton, um den von Jan explizit abgelehnten Golddominanz-Effekt nicht zu wiederholen.

### 3.3 Nicht-Scope (Ausdrücklich verboten)
- Keine Änderungen an `LiquidGoldChromeCanvas.tsx`, `CrashPixelCanvas.tsx`, `LobbyAmbientBackground.tsx` oder `CrashStage.tsx`.
- Keine Änderungen an anderen Bereichen von `/games` (Header, `ScrollTiltedGamesGrid`, `ElevatedGameCard`, `OriginalsCollectionSurfer`, `LiveWinRibbon`, `Footer`).
- Keine neuen npm-Abhängigkeiten.
- Keine Wett-/Settlement-Logik, keine Supabase-Berührung.

---

## 4 — Detaillierte Meilensteine

### Meilenstein L1: Kompaktere Box (Höhenreduktion)
- **Ziel:** Vertikale Gesamthöhe der Box spürbar reduzieren, ohne Karteninhalte abzuschneiden.
- **Schritte:**
  1. Container-`padding`: Mobile `'20px 10px 24px' → '14px 10px 16px'`, Desktop `'28px 24px 36px' → '18px 24px 22px'`.
  2. Header-`marginBottom`: Mobile `'12px' → '8px'`, Desktop `'20px' → '14px'`.
  3. 3D-Stage-`height`: Mobile `'300px' → '250px'`, Desktop `'340px' → '290px'`.
  4. `ITEM_HEIGHT`: `330 → 280`; `WheelCard`-Artwork-Header-`height`: `'160px' → '130px'`; `WheelCard`-Card-Body-`height`: `'170px' → '150px'` (Summe bleibt exakt `280px`, kein Clipping).
  5. Pagination-Dots-`marginTop`: `'12px' → '8px'`.
- **Abbruchkriterium:** Karteninhalt (Bild, Titel, Beschreibung, Button) wird abgeschnitten oder überlappt.

### Meilenstein L2: Subtilerer, nicht-goldener Hintergrund
- **Ziel:** Gold-Dominanz beseitigen, Obsidian-Ton priorisieren, Transienz per neutralem CSS-Sheen statt Gold-Shimmer erzeugen.
- **Schritte:**
  1. `LiquidGoldChromeCanvas`-`intensity`: `0.4 → 0.2`.
  2. Scrim-Gradient (Layer C): `rgba(11, 14, 20, 0.35) 0% / 0.7 100% → rgba(11, 14, 20, 0.55) 0% / 0.85 100%`.
  3. Neuer Layer D (nach Layer C, vor Content-Layer): absolut positionierter Div mit `linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.10) 55%, transparent 100%)`, `mixBlendMode: 'screen'`, `pointerEvents: 'none'`, `zIndex: 3`, `className="wheel-sheen"`.
  4. Neuer `<style>`-Block (Muster wie `LiveWinRibbon.tsx`) mit `@keyframes wheelSheenSweep` (Transform `translateX(-120%) → translateX(120%)` über ~9s, Opacity-Ease-In/Out) und `@media (prefers-reduced-motion: reduce) { .wheel-sheen { animation: none; opacity: 0; } }`.
  5. Content-Layer-`zIndex`: `2 → 4` (bleibt über allen 4 Hintergrund-Layern).
- **Abbruchkriterium:** Sheen wirkt golden/aggressiv statt neutral/subtil, oder Text/Buttons verlieren an Kontrast.

### Meilenstein L3: Self-Audit & visuelle Prüfung
- **Ziel:** Formale Korrektheit und optische Wirkung bestätigen.
- **Schritte:**
  1. Datei vollständig re-lesen: Klammern/Tags balanciert, `zIndex`-Reihenfolge konsistent (A=0, B=1, C=2, D=3, Content=4), keine ungenutzten Variablen.
  2. Browser-Screenshot von `/games` (Cylinder-Selection-Box) nach dem Umbau — visuell prüfen: Obsidian dominiert, Sheen ist weiß/neutral und bewegt sich sichtbar, Box ist spürbar kompakter, Karten links/rechts weiterhin lesbar.
- **Abbruchkriterium:** Screenshot zeigt weiterhin dominant gelben Ton oder abgeschnittene Karteninhalte.

### Meilenstein L4: 5-Stufen-DoD & Aufräumen
- **Ziel:** Formale Verifikation, Status-Update, Entfernen temporärer Verifikations-Artefakte aus dieser und der vorigen Sitzung.
- **Schritte:** `npm run typecheck` → `npm test` → `npm run lint` → `npm run build` → `git status --short` (nur `WheelCarousel.tsx` + diese Planungsdatei). Danach `/tmp/build_check.log` (temporäres Verifikations-Artefakt aus Plan 61) löschen. Kopfzeile dieser Datei auf `Status: Executed (archiviert)` setzen.
- **Abbruchkriterium:** Eine der 5 Stufen schlägt fehl.

---

## 5 — 5-Stufen-Abschlussprüfung (DoD)
1. `npm run typecheck` — 0 TypeScript-Fehler.
2. `npm test` — Alle bestehenden Tests laufen grün.
3. `npm run lint` — 0 neue ESLint-Fehler/-Warnungen.
4. `npm run build` — Next.js Production Build erfolgreich (Exit 0).
5. `git status --short` — Ausschließlich `src/components/casino/games-catalog/WheelCarousel.tsx` und diese Planungsdatei verändert.
