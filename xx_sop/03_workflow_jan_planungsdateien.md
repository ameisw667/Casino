# 03 — Workflow-Jan Planungsdateien (Casino Adapter)

> **Zweck:** Plantätigkeiten von Ausführung trennen und Pläne konversationsunabhängig aufbereiten.
> **Kanonischer Standard:** 🔗 [`xx_sop/shared/jan-planner/SKILL.md`](shared/jan-planner/SKILL.md)

---

## 1 — Standard-Workflow (Das 3-Ebenen-System)

Jede Planung in diesem Repository folgt verbindlich dem universellen Jan-Planer-Skill:

1. **Ebene 1 (Assessment & Dekomposition):** Zerlegung in maximal 10 Subkategorien, belegte Einstufung (Top 1 %–100 %) und Identifikation der 🔴 JA-Bottlenecks.
2. **Ebene 2 (Execution-Ready Plan):** Standard-Template, **100 % LLM-Zuständigkeit** (Jan nur bei Credentials/Gate), lückenloser Self-Contained Kontext-Koffer und expliziter Nicht-Scope.
3. **Ebene 3 (Lebenszyklus):** `Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

---

## 2 — Casino-Spezifische Parameter & Ablageorte

| Parameter                      | Lokaler Wert für dieses Repository                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ablageort aktiver Pläne**    | `worldmap/<NN>_<thema>_plan.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Ausnahme: Bild-Asset-Pläne** | Ist L0 der Planungsdatei die Generierung eines **neuen** Bild-Assets über die OpenAI-Bildpipeline (Ergebnis: neue Datei unter `public/images/*.png` + Eintrag in `public/images/CHANGELOG.md`), liegt die Planungsdatei **nicht** in `worldmap/`, sondern unter `public/images/<NN>_<thema>.md` (Nummerierung fortlaufend nach der höchsten bestehenden Zahl dort, Modul-Navigator: `public/images/00_IMAGES_OVERVIEW.md`). Reine Integrations-/Refactor-Pläne, die nur bereits vorhandene Bilder verdrahten, sowie UI-Audits mit Screenshots (kein neues Asset) bleiben regulär in `worldmap/`. |
| **Zentrale Status-Tabelle**    | `worldmap/00_WORLDMAP_STATUS.md` (Abschnitt „Aktive Pläne“) — Bild-Asset-Pläne stattdessen über `T_IMAGE/00_bildgenerierung_uebersicht_jan.md` nachverfolgt.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Archiv-Ordner**              | `docs/archive/`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Geld- & Sicherheits-Gate**   | Bei `src/lib/casino/`, Wallet, Auth oder DB-RPCs zwingend: `Money-Pfad: Ja` und `Security-Review: Pflicht`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Verifikations-Suite**        | `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

## 3 — Kopfbereich für neue Pläne im Casino

```markdown
# NN — <Thema>

> **Status:** Execution-Ready · **Stand:** YYYY-MM-DD · **Owner:** LLM (Jan nur bei Gate) · **Scope:** <Präzise 1-Satz-Grenze>
> **Money-Pfad:** Ja/Nein · **Security-Review:** Pflicht/Nein

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein          | Scope (Dateien) | Status     | Zuständigkeit | Verifikation       |
| ------ | -------------------- | --------------- | ---------- | ------------- | ------------------ |
| L0     | Baseline & Diagnose  | `...`           | 🔴 Geplant | LLM           | Tests laufen lokal |
| L1     | Kern-Implementierung | `...`           | 🔴 Geplant | LLM           | Unit Tests grün    |
| L2     | Abschlussprüfung     | `...`           | 🔴 Geplant | LLM           | 5-Stufen-DoD grün  |
```
