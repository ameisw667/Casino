# 24 — Crash Quantum Ion Beam & Altitude Droplines

> **Status:** 🟢 Executed (archiviert) · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** src/components/casino/games/crash/useCrashGameLoop.ts (Flugpfad-Visuals, Kinetische Telemetrie & 3D-Radar-Tiefenstaffelung)

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                              | Status      | Nächster Schritt                          | Zuständigkeit |
| ------ | -------------------------------------------------------- | ----------- | ----------------------------------------- | ------------- |
| L0     | Option-Gate & Konzeptentscheidung (Option A)             | 🟢 Executed | Option A gewählt                          | LLM           |
| L1     | Exponentielle Kurvengeometrie mit Launchpad-Anker        | 🟢 Executed | Mathematische Verankerung abgeschlossen   | LLM           |
| L2     | Kinetische Photonen-Impulse (Traveling Laser Pulses)     | 🟢 Executed | Shader- & Pulslogik aktiv                 | LLM           |
| L3     | Holografische Altitude-Droplines & 3D-Boden-Ringe        | 🟢 Executed | Vertikale Radar-Droplines verifiziert     | LLM           |
| L4     | 5-Runden-Live-Audit & Playwright-Screenshot-Verifikation | 🟢 Executed | 5 Runden erfolgreich & visuell abgenommen | LLM           |

- **Money-Pfad:** Nein (Reine Canvas-Shader- und Rendering-Logik im Client, keine Wetteinsatz- oder Wallet-Mutation).
- **Security-Review:** Nein (Keine API-, Token- oder Auth-Änderungen).
- **Zuständigkeit:** 100 % LLM (Keine manuellen Aufgaben für Jan).

---

## 2 — Ziel & Problemdefinition

### Problem:

Die bisherige Darstellung des Flugpfads bei `/games/crash` wirkte insbesondere bei längeren Flügen wie eine flache, monotone, starre Diagonallinie. Ursache war die sliding-window Zeitkompression (`scaleY ~ 1/m`), die den Kurvenabschnitt auf ein kurzes lokales Intervall reduzierte und die visuelle Verankerung zur Startrampe verlor.

### Ziel:

Ersatz der starren Diagonale durch den **Quantum Ion Beam**:

1. **Launchpad-Verankerung & Exponentielle Raumkrümmung:** Der Pfad entspringt physisch an der Startrampe `(padX, padY)` und beschreibt eine dramatisch ansteigende Steigkurve bis zum Quantum Interceptor.
2. **Reisende Photonen-Impulse:** Luminous Energy-Packets rasen kontinuierlich mit physikalischer Beschleunigung die Flugbahn entlang in die Ionentriebwerke.
3. **Holografische Altitude-Droplines:** Vertikale, feine Laser-Führungslinien mit elliptischen 3D-Boden-Radarringen am Launchpad-Horizont verleihen der 2D-Fläche räumliche Tiefe.
4. **Obsidian & Gold (Premium) Ästhetik:** 4-schichtiger Plasma-Render-Pass mit Gold/Emerald/Ruby Farbdynamik bei garantierten 60 FPS.

---

## 3 — Scope & Nicht-Scope

- **In Scope:**
  - `src/components/casino/games/crash/useCrashGameLoop.ts`:
    - Berechnung der interpolierten Steigkurve von der Startrampe bis zum Schiff.
    - Animation der Photonen-Impulse entlang der Bézier-Parameterkurve.
    - Zeichnen der holografischen Altitude-Droplines und Boden-Beacons.
    - Mehrschichtige Plasma-Glow-Effekte mit weichem Atmosphärennebel.
  - Verifikation via Playwright-Test mit Screenshots über 5 Runden.
- **Nicht Scope:**
  - Keine Änderungen an RNG, Quoten, Provably-Fair-Mathematik oder Settlement-RPCs.
  - Keine Änderungen an der Fahrzeug-Grafik (`quantum-interceptor.png` bleibt unangetastet).
  - Keine Datenbank-Migrationen.

---

## 4 — Phasenplan (LLM Execution)

### Phase 1: Exponentielle Kurvengeometrie (L1)

- Verankerung des Pfadanfangs am Launchpad: `x_start = padX`, `y_start = padY`.
- Parametrische B-Spline / Power-Kurve: $x(t) = padX + (rocketX - padX) \cdot t^{1.15}$, $y(t) = padY - (padY - rocketY) \cdot t^{1.85}$.
- Sorgt dafür, dass die Kurve flach an der Rampe beginnt und sich mit zunehmendem Multiplikator majestätisch aufrichtet.

### Phase 2: Kinetische Photonen-Impulse (L2)

- Erzeugung von 5 phasenverschobenen Lichtimpulsen ($t_{packet} \in [0, 1]$).
- Render-Pass: Weißglühender Kern (`#FFFFFF`), goldene Aura (`#FFD700`) und sanfter Schweif.
- Dynamische Pulsfrequenz gekoppelt an `riskFactor`.

### Phase 3: Holografische Altitude-Droplines (L3)

- An festen Wegpunkten ($t = 0.25, 0.5, 0.75$ bzw. Multiplikator-Milestones) fällt eine feine gestrichelte Laserlinie nach unten auf die Grundebene $padY$.
- Am Bodenkontaktpunkt wird ein holografischer Radar-Bodenkreis (Ellipse) mit weichem Radialglow gezeichnet.

### Phase 4: Qualitäts- & Test-Gate (L4)

- `npm run typecheck` (0 Fehler).
- `npm test` (alle Unit-Tests grün).
- `npm run lint` (0 Warnungen im modifizierten Code).
- Playwright Live-Audit mit Screenshots aller Flugphasen.
