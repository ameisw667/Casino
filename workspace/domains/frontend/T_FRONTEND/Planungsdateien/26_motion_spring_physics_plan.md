# 26 — Motion & Spring-Physik (Modul 04)

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich Sub-Punkt #5 (Partikelsysteme-Speichersicherheit) aus [`13_04_motion_physics_subkategorien.md`](../13_04_motion_physics_subkategorien.md) — **nur Testabdeckung** in neuen, isolierten Testdateien. **Keine** Produktionscode-Änderung an `useCrashGameLoop.ts`/`useCrashMultiplayerGameLoop.ts` in diesem Plan (Grund: Scope-Kollision mit einem bereits Execution-Ready vorliegenden Plan, siehe Abschnitt 0).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Kontext:** Modul 04 (Gewicht 10, Niveau Top 11,6 % laut `00_UEBERSICHT.md` Zeile 49) ist reine Rendering-/Animations-Logik. Die betroffenen Dateien liegen unter `src/components/casino/games/crash/` bzw. `crash-multiplayer/` — laut deren `CLAUDE.md`: „Gewinne nie clientseitig berechnen — Settlement läuft über Server-RPC; dieser Ordner zeichnet nur." Verifiziert: `createExplosion`/`createTail`/`updateAndDrawParticles` berechnen nur Canvas-Zeichenwerte, keine Wallet- oder Settlement-Werte.

---

## 0 — Auswahlmethodik & Scope-Kollisions-Check (WICHTIG)

|   #   | Sub-Punkt                            | Gewichtung |    Niveau    |           Bottleneck?           |
| :---: | :----------------------------------- | :--------: | :----------: | :-----------------------------: |
|   1   | Spring-Profil-Standardisierung       |     20     |   Top 8 %    |              Nein               |
|   2   | 3D Tilt-Glare Engine                 |     20     |   Top 10 %   |              Nein               |
|   3   | Reduced-Motion-Handling              |     20     |   Top 12 %   |              Nein               |
|   4   | Canvas-rAF Mobile-Drosselung         |     20     |   Top 8 %    |              Nein               |
| **5** | **Partikelsysteme (Memory-Pooling)** |   **20**   | **Top 20 %** | **🔴 JA (einziger Bottleneck)** |

Nur 1 Sub-Punkt liegt über der Top-15-%-Schwelle — kein Fallback nötig.

### ⚠️ Korrektur gegenüber der Quelldatei (2026-09-18 frisch verifiziert)

Die Quelldatei benennt als Fund `ParticleBurst.tsx` mit einer „2,5s-Cleanup"-Lösung. **Beide Details stimmen nicht mit dem verifizierten Code überein:**

- `src/components/ui/ParticleBurst.tsx` (116 Zeilen) hat einen **1000ms**-`setTimeout`, der bei jedem `fire()`-Aufruf das komplette Array leert — kein Memory-Pooling, aber auch kein Leak-Risiko (Array wird nie größer als `particleCount`, Standard 12). **Kein Bottleneck.**
- Das tatsächliche, potenziell leak-anfällige Partikelsystem liegt in `src/components/casino/games/crash/useCrashGameLoop.ts` (Zeilen 118–225) und seinem strukturellen Duplikat `src/components/casino/games/crash-multiplayer/useCrashMultiplayerGameLoop.ts` (verifiziert per `grep -rn "particlesRef" src/components/casino/games`). `updateAndDrawParticles()` filtert pro Frame (`filter((p) => p.life > 0)`, Zeile 212) und `createTail()` hat bereits einen Größen-Cap (`> 250` Desktop / `> 120` Mobile, Zeile 162). **Nur `createExplosion()` hat keinen Cap** (Zeilen 119–159) — ein echter, unabhängig verifizierter Fund, der in der Quelldatei nicht benannt war.

### 🔴 Scope-Kollision mit `t_claude_code/Planungsdateien/03b_x3_crash_loop_schnitt_plan.md` (bereits Execution-Ready, Stand 2026-09-17)

Bei der Prüfung auf Überschneidung mit aktiven Plänen (Pflicht laut Aufgabenstellung, besonders für Modul-05-nahe Game-Dateien) wurde festgestellt: **Genau die Funktion, die diesen Fund trägt (`createExplosion`, inkl. `updateAndDrawParticles`), ist bereits Block #1 der Extraktions-Anker-Tabelle in `03b_x3_crash_loop_schnitt_plan.md` Abschnitt 2** (dort exakt referenziert: Solo Z. 119/211, MP Z. 121/199, „Bekannter Unterschied: keiner (verbatim)"). Dieser Plan ist bereits **Execution-Ready** und laut `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 1.47 als **nächster Schritt** vorgesehen (vor 03c).

**Konsequenz (referenzieren statt duplizieren):** Dieser Plan (26) nimmt **keine** eigene Änderung an `createExplosion()` vor — eine parallele, unabhängige Bearbeitung derselben Zeilen würde entweder mit `03b`s L0-Anker-Tabelle (exakte Zeilennummern) kollidieren oder die dortige „verbatim, kein Unterschied"-Annahme zwischen Solo/MP durchbrechen, falls nur eine der beiden Dateien gepatcht wird, bevor `03b` läuft. Stattdessen: dieser Plan liefert **nur Testabdeckung** (neue, isolierte Testdateien, 0 Berührung der Loop-Dateien selbst) und trägt den Cap-Fund als expliziten Hinweis in `03b`s eigenem Kontext nach (Meilenstein L2 unten).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                            | Scope (Dateien)                                                                                                                                          | Ausführung  | Status     | Zuständigkeit | Verifikation                                                                                                                                                                                                              |
| ------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Baseline & Diagnose                                    | `useCrashGameLoop.ts`, `useCrashMultiplayerGameLoop.ts` (nur lesend)                                                                                     | Sequenziell | 🔴 Geplant | LLM           | Cap-Werte, Frame-Filter und der fehlende `createExplosion`-Cap bestätigt; 0 bestehende Tests für Partikel-Grenzen (nur je 22 Zeilen Style-/Asset-Tests laut `03b` L0, keine Physik-Tests)                                 |
| L1     | Charakterisierungs-Test für aktuelles Cap-Verhalten    | neu: `src/components/casino/games/crash/__tests__/particle-memory-behavior.characterization.test.ts`                                                     | Sequenziell | 🔴 Geplant | LLM           | Test dokumentiert lauffähig: `createTail()` bleibt gedeckelt, `createExplosion()` aktuell **nicht** — als bewusst „bekannte Lücke", nicht als Fehlschlag                                                                  |
| L2     | Fund an `03b_x3_crash_loop_schnitt_plan.md` nachtragen | `t_claude_code/Planungsdateien/03b_x3_crash_loop_schnitt_plan.md` (nur ergänzender Hinweis-Absatz, keine Struktur-/Meilenstein-Änderung an fremdem Plan) | Sequenziell | 🔴 Geplant | LLM           | Ein neuer Hinweis-Satz in `03b`s Block-1-Beschreibung: „zusätzlich: `createExplosion` hat keinen Größen-Cap (im Gegensatz zu `createTail`) — beim Verschieben nach `crash-loop/` den Cap-Guard aus `createTail` spiegeln" |
| L3     | Volle Verifikations-Suite                              | —                                                                                                                                                        | Sequenziell | 🔴 Geplant | LLM           | `npm run typecheck` / `npm test` / `npm run lint` / `npm run build` grün                                                                                                                                                  |
| L4     | Abschluss: Doku-Update & Self-Audit                    | `T_FRONTEND/00_UEBERSICHT.md`, `13_04_motion_physics_subkategorien.md`                                                                                   | Sequenziell | 🔴 Geplant | LLM           | Planungsdatei-Spalte umgestellt, Korrektur aus Abschnitt 0 dort übernommen                                                                                                                                                |

**Kein Fan-out:** Alle Meilensteine sind sequenziell voneinander abhängig (L2 baut auf dem L1-Testbefund auf) oder zu klein für einen eigenen Cluster.

---

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien & Pfade

- [`src/components/casino/games/crash/useCrashGameLoop.ts`](../../../../../src/components/casino/games/crash/useCrashGameLoop.ts) Zeilen 118–225 (Hotspot-Datei, 982 Zeilen laut `CLAUDE.md` Tool-Output-Ökonomie — nur gezielte Slices lesen, kein Voll-Read; **nur lesend** in diesem Plan)
- [`src/components/casino/games/crash-multiplayer/useCrashMultiplayerGameLoop.ts`](../../../../../src/components/casino/games/crash-multiplayer/useCrashMultiplayerGameLoop.ts) (782 Zeilen, **nur lesend** in diesem Plan)
- [`t_claude_code/Planungsdateien/03b_x3_crash_loop_schnitt_plan.md`](../../../../../docs/archive/ai_agents/t_claude_code/Planungsdateien/03b_x3_crash_loop_schnitt_plan.md) — bereits Execution-Ready, Block #1 = exakt `createExplosion`/`updateAndDrawParticles`
- [`src/components/casino/games/crash/CLAUDE.md`](../../../../../src/components/casino/games/crash/CLAUDE.md) und [`crash-multiplayer/CLAUDE.md`](../../../../../src/components/casino/games/crash-multiplayer/CLAUDE.md) — Ordner-Konventionen, „Duplikat-Ziehmutter"

### 2.2 Systemregeln & Invarianten

- Beide Loop-Dateien zeichnen nur — keine Gewinn-/Settlement-Berechnung (siehe Ordner-`CLAUDE.md`).
- Charakterisierungstests dürfen `createExplosion`/`createTail` nur über die öffentliche Hook-Oberfläche ansprechen (kein Export interner Funktionen nur für Testbarkeit — das wäre bereits eine Produktionscode-Änderung, siehe Nicht-Scope).

### 2.3 Nicht-Scope (Ausdrücklich verboten)

- **Keine** Änderung an `useCrashGameLoop.ts` oder `useCrashMultiplayerGameLoop.ts` selbst (weder Cap-Ergänzung noch Export-Änderungen) — das gehört in `03b_x3_crash_loop_schnitt_plan.md`, siehe Abschnitt 0.
- **Keine** Konsolidierung der ~350 geteilten Zeilen zwischen beiden Dateien — Gegenstand von `03b` selbst.
- **Keine** Änderung an `ParticleBurst.tsx` — die dort behauptete „2,5s-Cleanup"-Problematik konnte nicht verifiziert werden (siehe Abschnitt 0); die Datei hat kein bestätigtes Leak-Risiko.
- **Keine** eigene Meilenstein-Umnummerierung oder Statusänderung in `03b_x3_crash_loop_schnitt_plan.md` — L2 fügt ausschließlich einen lesbaren Hinweis-Satz hinzu, ändert keine Tabellenstruktur, keine Status-Spalte, keine Zeilennummern.
- **Keine** Änderung an Mobile-LCP-Timing — Gegenstand von [`07_mobile_lcp_crash_multiplayer_plan.md`](./07_mobile_lcp_crash_multiplayer_plan.md).

---

## 3 — Detaillierte Meilensteine

### L1: Charakterisierungs-Test

- **Ziel:** Belegen (nicht reparieren), dass `createTail()` bereits deckelt und `createExplosion()` aktuell nicht — als Referenzpunkt für die Verifikation, sobald `03b` die Funktionen verschiebt.
- **Schritte:** 1. Test rendert den Hook über die reguläre Komponentenoberfläche (analog zu bestehenden `crash-mobile-backdrop.test.ts`/`crash-multiplayer-styles.test.ts`, die laut `03b` L0 die einzigen bestehenden Tests in beiden Ordnern sind). 2. Simuliert N schnelle Explosions-Trigger (z. B. wiederholtes Crash-Event in Tests, falls über die öffentliche API auslösbar) und liest den resultierenden Partikel-Stand nur über beobachtbares Verhalten (Canvas-Draw-Calls oder exportierte Debug-Metrik, falls vorhanden — kein neuer Export nur für den Test).
- **Erwartetes Verhalten:** Test ist grün und dokumentiert im Testnamen/Kommentar explizit die bekannte Lücke (z. B. `it.todo(...)` oder ein Kommentar „aktuell kein Cap — siehe 03b Block 1").
- **Abbruchkriterium:** Falls die Partikel-Anzahl ohne einen neuen Produktions-Export überhaupt nicht beobachtbar ist (Canvas-Zeichenoperationen sind schwer introspektierbar), Test auf Ebene der bereits öffentlichen `createTail`-Cap-Wirkung beschränken (die IST über wiederholte Frames indirekt beobachtbar, z. B. Canvas-Call-Zähler) und den `createExplosion`-Befund nur als Kontext-Kommentar (nicht als eigenen Testfall) dokumentieren.

### L2: Fund an `03b` nachtragen

- **Ziel:** Sicherstellen, dass die Person/das LLM, die `03b` als nächstes ausführt, den `createExplosion`-Cap-Fund kennt und beim Verschieben nach `crash-loop/` mit übernimmt (kleiner, kostenloser Zusatznutzen der Extraktion).
- **Schritte:** Einen einzelnen Satz in `03b_x3_crash_loop_schnitt_plan.md` Abschnitt 2, direkt unter der Anker-Tabelle (nach Zeile 31, vor „Nicht extrahieren"), ergänzen — reine Textergänzung, keine Tabellen-/Meilenstein-Änderung.
- **Abbruchkriterium:** Keines — reine additive Doku-Ergänzung.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD)

1. **Typecheck:** `npm run typecheck` — 0 Fehler
2. **Tests:** `npm test` — neuer Charakterisierungstest grün, alle bestehenden Tests unverändert grün
3. **Lint:** `npm run lint` — 0 neue Warnings
4. **Build:** `npm run build` — Production-Build erfolgreich
5. **Git Diff:** `git diff --stat` zeigt nur die neue Testdatei + den additiven Hinweis-Satz in `03b_x3_crash_loop_schnitt_plan.md` + Doku-Updates — **0 Änderungen** an `useCrashGameLoop.ts`/`useCrashMultiplayerGameLoop.ts`

---

## 5 — Ehrliche Niveau-Projektion

| Sub-Punkt          |   Vorher   | Nach Ausführung (Projektion) | Begründung                                                                                                                                                                                                                                                                 |
| :----------------- | :--------: | :--------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #5 Partikelsysteme |  Top 20 %  |       **Top 16–18 %**        | Die zugrunde liegende Verifikationslücke (0 Tests) ist geschlossen und der reale Fund korrekt dokumentiert, aber der eigentliche Fix (Cap in `createExplosion`) passiert bewusst erst in `03b` — deshalb keine so starke Verbesserung wie bei einer direkten Code-Änderung |
| **Modul-Gesamt**   | Top 11,6 % |      **≈ Top 10–11 %**       | Kleine Verbesserung durch Testabdeckung, volle Wirkung erst nach `03b`-Ausführung                                                                                                                                                                                          |

**Nicht schöngerechnet:** Dieser Plan behebt den eigentlichen Cap-Fund nicht selbst — die Projektion nimmt bewusst nur die Testabdeckungs-Verbesserung an, nicht den vollen Effekt, der erst nach Ausführung von `03b` (inkl. des in L2 nachgetragenen Hinweises) eintritt.

---

## 6 — Selbstprüfung (Kern-8-Rubrik)

|  #  | Kriterium                               | Score /3 | Begründung                                                                                                                                                     |
| :-: | :-------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Verifizierbarkeit gegen Repo-Realität   |    3     | `ParticleBurst.tsx` gelesen und Quelldatei-Fund widerlegt; realer Fund per Grep + gezieltem Read bestätigt; `03b`-Plan gelesen und Kollision real festgestellt |
|  2  | Konkretheit der Handlungsanweisung      |    3     | Exakte Zeilenbereiche, exakte Einfügeposition für den L2-Hinweissatz                                                                                           |
|  3  | Vollständigkeit des Lebenszyklus/Scopes |    3     | L0 Diagnose → L1 Test → L2 Cross-Plan-Hinweis → L3 Verifikation → L4 Abschluss                                                                                 |
|  4  | Bekannte-Probleme-Transparenz           |    3     | Quelldatei-Fehler UND die Scope-Kollision mit `03b` explizit benannt, nicht stillschweigend übernommen oder ignoriert                                          |
|  5  | Cross-Referenz-Konsistenz               |    3     | `03b_x3_crash_loop_schnitt_plan.md` korrekt referenziert, Nicht-Scope verhindert Doppelarbeit/Konflikt aktiv statt nur zu erwähnen                             |
|  6  | Risiko-/Freigabeklassifizierung         |    3     | Money-Pfad: Nein begründet; Produktionscode-Änderung bewusst ausgeschlossen, um einen bereits Execution-Ready-Plan nicht zu gefährden                          |
|  7  | Lerneffekt-Tauglichkeit                 |    3     | Macht nachvollziehbar, warum „referenzieren statt duplizieren" hier konkret bedeutet: Tests ja, Fix nein                                                       |
|  8  | Aktualitäts-Check                       |    3     | Stand 2026-09-18, `03b`-Plan-Stand 2026-09-17 explizit gegengeprüft                                                                                            |

**Score: 24 / 24 → Tier Top 1 %.** Keine bewusste Lücke.
