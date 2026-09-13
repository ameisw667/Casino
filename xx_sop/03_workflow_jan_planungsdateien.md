# 03 — Workflow-Jan Planungsdateien (Casino Adapter)

> **Zweck:** Plantätigkeiten von Ausführung trennen und Pläne konversationsunabhängig aufbereiten.
> **Kanonischer Standard:** 🔗 [`xx_sop/shared/jan-planner/SKILL.md`](shared/jan-planner/SKILL.md)

---

## 1 — Standard-Workflow (Das 3-Ebenen-System)

Jede Planung in diesem Repository folgt verbindlich dem universellen Jan-Planer-Skill:

1. **Ebene 1 (Assessment & Dekomposition):** Zerlegung in maximal 10 Subkategorien, belegte Einstufung (Top 1 %–100 %) und Identifikation der 🔴 JA-Bottlenecks.
2. **Ebene 2 (Execution-Ready Plan):** Standard-Template, **100 % LLM-Zuständigkeit** (Jan nur bei Credentials/Gate), lückenloser Self-Contained Kontext-Koffer, expliziter Nicht-Scope, Fan-out-Check (Kriterium 5 im globalen Skill: Unabhängige Meilensteine werden in der Übersichtstabelle als gemeinsamer Fan-out-Cluster markiert, mit eigenem Merge-Meilenstein danach) und Aufwands-Schwelle für Fan-out (Kriterium 6 im globalen Skill: Fan-out nur ab ~45 Min. Gesamtaufwand UND ~10 Min. Einzelaufwand pro Teilaufgabe — triviale Teilaufgaben werden gebündelt, nicht einzeln parallelisiert; im Zweifel sequenziell).
3. **Ebene 3 (Lebenszyklus):** `Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

---

## 2 — Casino-Spezifische Parameter & Ablageorte

| Parameter                      | Lokaler Wert für dieses Repository                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ablageort aktiver Pläne**    | `T_<THEMA>/Planungsdateien/<NN>_<thema>_plan.md` — `<THEMA>` ist der bestehende thematische T-Ordner (z. B. `T_LLM`, `T_SECURITY_HARDENING`, `T_DATABASE`); Nummerierung fortlaufend je Ordner, nicht repoweit. Existiert für das Thema noch kein `T_*`-Ordner, zuerst kurz mit Jan abstimmen, bevor ein neuer angelegt wird.                                                                                                                                                                                                                                                                |
| **Ausnahme: Bild-Asset-Pläne** | Ist L0 der Planungsdatei die Generierung eines **neuen** Bild-Assets über die OpenAI-Bildpipeline (Ergebnis: neue Datei unter `public/images/*.png` + Eintrag in `public/images/CHANGELOG.md`), liegt die Planungsdatei **nicht** in `T_*/Planungsdateien/`, sondern unter `public/images/<NN>_<thema>.md` (Nummerierung fortlaufend nach der höchsten bestehenden Zahl dort, Modul-Navigator: `public/images/00_IMAGES_OVERVIEW.md`). Reine Integrations-/Refactor-Pläne, die nur bereits vorhandene Bilder verdrahten, sowie UI-Audits mit Screenshots (kein neues Asset) bleiben regulär unter `T_FRONTEND/Planungsdateien/`. |
| **Zentrale Status-Tabelle**    | `worldmap/00_WORLDMAP_STATUS.md` (Abschnitt „Aktive Pläne“) — Bild-Asset-Pläne stattdessen über `T_IMAGE/00_bildgenerierung_uebersicht_jan.md` nachverfolgt. Jeder neue Plan wird hier mit relativem Pfad (z. B. `T_LLM/Planungsdateien/05_x_plan.md`) eingetragen; `worldmap/` selbst enthält keine neuen Plandateien mehr, nur noch die Status-Tabelle sowie das bestehende Archiv älterer Pläne.                                                                                                                                                                                        |
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

| Nummer | Meilenstein          | Scope (Dateien) | Ausführung   | Status     | Zuständigkeit | Verifikation       |
| ------ | -------------------- | --------------- | ------------ | ---------- | ------------- | ------------------ |
| L0     | Baseline & Diagnose  | `...`           | Sequenziell  | 🔴 Geplant | LLM           | Tests laufen lokal |
| L1     | Kern-Implementierung | `...`           | Sequenziell  | 🔴 Geplant | LLM           | Unit Tests grün    |
| L2     | Abschlussprüfung     | `...`           | Sequenziell  | 🔴 Geplant | LLM           | 5-Stufen-DoD grün  |
```

**Konkretes Beispiel für einen Fan-out-Cluster** (kein eigenes Spaltenkonzept — nur ein anderer Wert in der bestehenden Spalte „Ausführung"):

| Nummer | Meilenstein | Scope (Dateien) | Ausführung | Status | Zuständigkeit | Verifikation |
|---|---|---|---|---|---|---|
| L1 | Verweise in Bereich A prüfen | `T_DATABASE/` | 🔀 Fan-out-Cluster 1 | 🔴 Geplant | LLM | Report ohne offene Fragen |
| L2 | Verweise in Bereich B prüfen | `T_API/` | 🔀 Fan-out-Cluster 1 | 🔴 Geplant | LLM | Report ohne offene Fragen |
| L3 | Merge: Widersprüche zwischen L1–L2 prüfen | — | Sequenziell (nach Cluster 1) | 🔴 Geplant | LLM | 0 unaufgelöste Widersprüche |

L1–L2 laufen als gleichzeitige `Agent`-Aufrufe in einer Antwort. L3 (Merge) startet erst, wenn beide fertig sind, und ist immer `Sequenziell` — ein Merge-Schritt selbst wird nie parallelisiert.

**Gegenprobe an Kriterium 6:** 2 Ordner mit jeweils mehreren Dateien — jede Teilaufgabe über der ~10-Minuten-Schwelle, Gesamtaufgabe sequenziell über ~45 Minuten. Beispiel erfüllt Kriterium 6, kein Widerspruch.
