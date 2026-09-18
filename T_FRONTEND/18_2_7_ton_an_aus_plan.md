# 18.2.7 — `Volume2`/`VolumeX`: bewusste Nicht-Änderung (Dokumentations-Plan)

> **Status:** Executed (2026-09-07, Dokumentations-Entscheidung) · **Stand:** 2026-09-08 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ausschließlich die Entscheidung über `Volume2`/`VolumeX` in der Haupt-App (§18.2 Zeile 7). Kein Code-Change, kein neues Bild-Asset.
> **Kontext:** Die ursprüngliche §18.2-Analyse stufte `Volume2`/`VolumeX` bereits als „konsistent als Paar" ein und schlug nur die spätere Migration in das zentrale Icon-Primitive (§18.5, `CasinoIcon`) vor. Codebase-Recherche (Grep über `src/`, Haupt-App ohne `/testing`) bestätigt: 2 echte Toggle-Paare (Sound an/aus) sind konsistent; 3 weitere Solo-`Volume2`-Stellen sind keine Kollision, sondern legitime Alternativ-Bedeutungen desselben Grundsymbols „Ton/Audio" (Tab-Icon, Vorlese-Aktion, Sprech-Indikator) ohne zugehöriges Off-Pendant. Gewählt: **Option A** (unverändert lassen + formal dokumentieren) aus dem Option-Gate vom 2026-09-06 (§6).
> **Money-Pfad:** Nein · **Security-Review:** Nein (reine Dokumentations-Entscheidung, kein Code-Change)
> **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-06 (Score 4.44/5, §6).

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein | Scope (Dateien) | Status | Zuständigkeit | Verifikation |
| :--- | :--- | :--- | :---: | :---: | :--- |
| L0 | Vollständigkeits-Verifikation | Alle `Volume2`/`VolumeX`-Importe in `src/` (Admin/Testing ausgenommen) | 🟢 Erledigt (2026-09-07) | LLM | Bestätigt: die 3 Solo-`Volume2`-Stellen kollidieren nicht mit den 2 echten Toggle-Paaren (0 Abweichungen) |
| L1 | Dokumentations-Update | `ALLE_ICONS_BUTTONS_ANALYSE.md` (§18.2 Zeile 7) | 🟢 Erledigt (2026-09-07) | LLM | Zeile 7 trägt die Begründung samt Stellen-Aufschlüsselung („verifiziert 2026-09-07"); Status 2026-09-08 auf Executed gesetzt |
| L2 | Abschluss-Verifikation | — (kein Code-Change) | 🟢 Erledigt (2026-09-07) | LLM | `git status`: keine der 5 `Volume2`/`VolumeX`-Dateien angefasst |

---

## 2 — Kontext-Koffer

### 2.1 Betroffene Stellen (verifiziert per Grep, 2026-09-06)

| Verwendung | Regel | Stellen |
| :--- | :--- | :--- |
| **Echtes Toggle-Paar** (Sound an/aus, `soundEnabled`-State) | `Volume2` = an, `VolumeX` = aus, immer als Ternary-Paar | `SettingsPopover.tsx:125,127` (14px), `SettingsModal.tsx:329,331` (16px) |
| **Solo `Volume2` — Tab-/Kategorie-Icon** | Statisches Label für die „Audio & Anzeige"-Sektion, kein Zustands-Toggle | `SettingsModal.tsx:201` (15px) |
| **Solo `Volume2` — Vorlese-Aktion** | Klick-Trigger „Nachricht vorlesen" (TTS), kein Ein/Aus-Zustand | `GuideMessageList.tsx:447` (11px) |
| **Solo `Volume2` — Sprech-Indikator** | Ambiente-Anzeige „Croupier spricht gerade" (pulsierend während Spin), kein Ein/Aus-Zustand | `RouletteCroupierRibbon.tsx:40` (13px) |

**Bewertung:** Die 3 Solo-Stellen sind keine echte Inkonsistenz zum Toggle-Paar — sie verwenden `Volume2` in seiner Grundbedeutung „Ton/Audio" für Kontexte, die strukturell keinen Aus-Zustand haben (eine Tab-Beschriftung braucht kein „stummes" Pendant, ebenso wenig eine einmalige Vorlese-Aktion oder ein reiner Status-Indikator). Eine erzwungene Aufspaltung in ein zweites Icon würde hier künstliche Komplexität ohne Klarheitsgewinn erzeugen.

### 2.2 Systemregeln & Invarianten

- Diese Entscheidung ist **kein** Freifahrtschein für „nie wieder prüfen" — sie hält fest, dass die aktuelle Verwendung korrekt ist. Eine künftige neue Stelle muss weiterhin gegen die Regel geprüft werden (echter Ein/Aus-Zustand → Paar `Volume2`/`VolumeX`, sonst Solo `Volume2` zulässig).
- Die im ursprünglichen §18.2-Vorschlag genannte Migration in das zentrale Icon-Primitive (§18.5, `CasinoIcon`) bleibt ein separates, hier nicht gestartetes Vorhaben — das Primitive selbst existiert noch nicht im Code (`src/components/ui/icon.tsx`) und wird nicht durch diesen Plan angestoßen.
- Design-Tokens, Anti-Pattern A2: siehe [`27_sparkles_icon_konsolidierung_plan.md §2.2`](../public/images/27_sparkles_icon_konsolidierung_plan.md) — gilt auch für „keine Änderung"-Entscheidungen als Referenzrahmen.

### 2.3 Nicht-Scope (ausdrücklich verboten)

- Keine Bildgenerierung, kein Icon-Austausch an den 5 verifizierten Stellen.
- Keine Änderung an Admin- oder `/testing`-Sandbox-Stellen (dort existieren 20+ weitere `Volume2`/`VolumeX`-Vorkommen, bewusst erst bei einem globalen Icon-Restyle mitgezogen, §16 der Inventur).
- Kein Aufbau des zentralen `CasinoIcon`-Primitives (§18.5) — separates, hier nicht gestartetes Vorhaben.
- Keine Änderung an der Sound-Toggle-Logik (`soundEnabled`-State) selbst.

---

## 3 — Detaillierte Meilensteine

### L0 — Vollständigkeits-Verifikation
- **Ziel:** Sicherstellen, dass wirklich keine der Haupt-App-Stellen von der Regel abweicht (z. B. ein Solo-`Volume2`, das tatsächlich einen impliziten Aus-Zustand hätte).
- **Schritte:** Alle 5 Stellen einzeln auf Zustandsbindung (`useState`, Prop-gesteuerter Ternary) prüfen.
- **Erwartetes Verhalten:** 0 Abweichungen — nur die 2 bereits identifizierten Paare sind zustandsgebunden.
- **Abbruchkriterium:** Bei ≥ 1 echter Abweichung: Stopp, Plan neu bewerten (Option A basiert auf der Prämisse „keine echte Kollision vorhanden" — trifft die nicht zu, ist die Empfehlung hinfällig).

### L1 — Dokumentations-Update
- **Ziel:** §18.2-Zeile 7 trägt die Entscheidung samt Stellen-Aufschlüsselung.
- **Schritte:** Zelle „Konsolidierungsvorschlag" um die Bestätigung ergänzen, „Status" auf Execution-Ready, „Ergebnis" auf „—", „Planungsdatei" auf diesen Plan verlinken.
- **Erwartetes Verhalten:** Transparente Tabelle statt offener Lücke.
- **Abbruchkriterium:** Keins.

### L2 — Abschluss-Verifikation
- **Ziel:** Bestätigen, dass keine der 5 Dateien angefasst wurde.
- **Schritte:** `git status`/`git diff` prüfen.
- **Erwartetes Verhalten:** Leerer Diff für alle 5 Dateien.
- **Abbruchkriterium:** Jede Abweichung stoppt den Abschluss und wird rückgängig gemacht.

---

## 4 — 5-Stufen-Abschlussprüfung (DoD, reduziert — kein Code-Change)

1. Typecheck: `npm run typecheck` — 0 Fehler (unverändert).
2. Tests: `npm test` — grün (unverändert).
3. Lint: `npm run lint` — 0 Errors (unverändert).
4. Build: `npm run build` — erfolgreich (unverändert).
5. Git Diff: Nur `ALLE_ICONS_BUTTONS_ANALYSE.md` §18.2-Zeile 7 — keine der 5 `Volume2`/`VolumeX`-Dateien im Diff.

---

## 5 — Entscheidungsgrundlage (Option-Gate-Archiv, 2026-09-06)

| Option | Konzept | Score |
| :--- | :--- | :---: |
| **A (gewählt)** | Unverändert lassen + formal dokumentieren: 2 Toggle-Paare korrekt, 3 Solo-Stellen sind legitime Alternativ-Bedeutung | **4.44** |
| B | Solo-Stellen auf ein zweites Icon (z. B. `AudioLines`) umstellen, um jede Volume2-Verwendung an ein Ein/Aus-Paar zu binden | 3.86 |
| C | Sofortiger Aufbau des `CasinoIcon`-Primitives (§18.5) inkl. Migration aller 20+ Stellen | 3.41 |

Kein Tie-Break nötig (A führt klar; B löst kein reales Problem, C sprengt den Scope einer Einzelzeile). Jan-Freigabe: **Option A**, 2026-09-06.
