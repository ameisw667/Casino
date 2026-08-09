# Crash Game — Visual Tension Implementation Plan

Betrifft ausschließlich die Game-Box auf `/games/crash` ([src/app/games/crash/page.tsx](../src/app/games/crash/page.tsx)), speziell den Ongoing-State (laufende Runde).

## 1. Scope

| Option          | Ziel                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Risk Escalation | Puls der Multiplier-Zahl + Rand-Vignette, Intensität skaliert mit Risiko                       |
| Partikel-Trail  | Reaktivierung des deaktivierten Partikelsystems (Trail + Explosion) mit deterministischem PRNG |
| Camera Dynamics | Breathing-Zoom auf Kurve/Rakete + Meilenstein-Popups (2x/5x/10x/...)                           |

Reihenfolge der Umsetzung: 1 → 3 → 2 (mit dem Nutzer abgestimmt).

## 2. Gemeinsames Fundament

- `getRiskFactor(m)`: asymptotische 0–1-Kurve (`1 - 1/(1 + max(0,m-1)*0.35)`), treibt alle drei Optionen gemeinsam an. Rein kosmetisch, ohne Einfluss auf Crash-Punkt/Auszahlung.
- `pseudoRandom(seedRef)`: deterministischer LCG statt `Math.random()` — Partikel-Jitter bleibt damit klar von der Provably-Fair-Engine getrennt (Audit-sicher).
- `resetRiskVisuals()`: zentraler Reset-Helper, an allen Auflösungspfaden aufgerufen.

## 3. Evaluierte Probleme und Lösungen

| #   | Problem                                                             | Risiko                                                                                                                                 | Lösung                                                                                                                                                       |
| --- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Naiver Y-Achsen-Zoom (Kurve selbst verlangsamt nachziehend)         | Rakete clippt oben aus dem Canvas bei schnellem Wachstum                                                                               | Zoom nur als `transform` auf separatem Wrapper um den Canvas; die reale Kurven-/Raketenkoordinate bleibt exakt                                               |
| 2   | CSS-Klassen-Toggle für Puls-Effekt                                  | `setLiveBets`-Intervall (200ms) triggert Re-Render → React überschreibt `className` komplett → Klasse verschwindet sofort wieder       | Direkte Style-Mutation (`.style.transform`) statt `classList` — React fasst nicht deklarierte inline-Style-Properties beim Reconciling nicht an              |
| 3   | Partikel-RNG vs. „kein Math.random() in Game-Logik"                 | Fehleinschätzung bei Audit als Fairness-Verstoß                                                                                        | Eigener, klar kommentierter, rein kosmetischer PRNG                                                                                                          |
| 4   | Bis zu 300 Partikel/Frame                                           | Performance-Einbruch                                                                                                                   | Bereits im Original-Code vorgesehene Caps wiederverwendet (Budget war schon eingeplant)                                                                      |
| 5   | Mehrere Meilensteine in einem Frame (Catch-up nach Tab-Throttling)  | Popup feuert inkonsistent                                                                                                              | `while`-Loop statt `if`, endet beim höchsten erreichten Wert                                                                                                 |
| 6   | Visuals frieren mitten in Puls/Zoom ein, wenn Runde endet           | Wirkt unfertig                                                                                                                         | `resetRiskVisuals()` an allen 4 Auflösungspfaden (Rundenstart, natürlicher Crash, Cashout-Gewinn, serverseitig abgelehnter Cashout)                          |
| 7   | `.glass-card:hover`-Lift-Transform vs. Zoom-Transform               | Konflikt auf demselben Element                                                                                                         | Zoom sitzt auf innerem Wrapper, nicht auf `.glass-card` selbst                                                                                               |
| 8   | `MILESTONE_VALUES` als Component-Body-Const                         | Instabile Referenz, Lint-Warnung, unnötige `gameLoop`-Neuerstellung                                                                    | Auf Modul-Ebene verschoben                                                                                                                                   |
| 9   | Reduced-Motion-Zugänglichkeit fehlte                                | Bewegungs-sensible Nutzer nicht berücksichtigt, obwohl Codebase-Muster existiert ([games/page.tsx:595](../src/app/games/page.tsx:595)) | `prefersReducedMotionRef` (live via `matchMedia`-Listener), Puls/Zoom auf 0 bei aktivierter Einstellung, Vignette bleibt (Farb-/Opacity-Cue, keine Bewegung) |
| 10  | `animation:none` unter Reduced-Motion → `onAnimationEnd` feuert nie | Meilenstein-Popup bliebe für immer stehen                                                                                              | Umstellung auf Timeout-basiertes Dismissal (analog zum bestehenden `bigWin`-Queue-Muster)                                                                    |
| 11  | Mobile-Performance nicht berücksichtigt                             | Partikel/Zoom/Puls identisch intensiv wie Desktop, obwohl Datei durchgängig `isMobile` für Responsive-Anpassungen nutzt                | `isMobileRef`, Partikelanzahl/Zoom-/Puls-Amplitude auf Mobile reduziert (nicht deaktiviert)                                                                  |

## 4. Execution — Ergebnis

Umgesetzt in `src/app/games/crash/page.tsx` (+282/-50 Zeilen).

## 5. Verifikation

- `npm run lint` → 0 Fehler
- `tsc --noEmit` → 0 Typfehler
- DOM-Struktur live geprüft: Canvas-Wrapper (z-index 1) → Vignette (z-index 5) → Text-Plate (z-index 10) → Meilenstein-Popup (z-index 11)
- 12s-Wachstums-/Risiko-/Meilenstein-Simulation (Node, außerhalb des Browsers): keine NaN-Werte, Meilensteine korrekt geordnet, Wachstumskurve entspricht dem dokumentierten „~3.7s bis 2x"
- Echter Bet→Cashout→Resolve-Zyklus im Browser (mit wiederhergestellter Dev-Fallback-Session) mehrfach fehlerfrei durchlaufen: korrekte Auszahlung, kein doppelter History-Eintrag, sauberer Reset auf `IDLE`
- **Nicht möglich in dieser Session:** Pixelgenaue Beobachtung der laufenden Animation (Puls/Vignette/Partikel/Zoom in Echtzeit) — `document.hidden === true` durchgehend bestätigt (kein Display an diesem Browser-Pane angehängt), wodurch `requestAnimationFrame` vom Browser selbst pausiert wird. Bestätigt durch: sofortige Prüfung, erneute Prüfung nach 10s Wartezeit, mit funktionierender Authentifizierung. Dies betrifft ausschließlich die visuelle Beobachtung in _dieser_ Tool-Session — der zugrunde liegende Code ist rAF-korrekt und wurde per Simulation unabhängig verifiziert.
