# 02 — Doc-Link-Guard auf die volle Doku-Schicht ausdehnen

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Die Wurzelliste des Doc-Link-Guards wird auf alle Dokumentationsordner erweitert; gefundene tote Links werden behoben oder als bewusst tot markiert.
> **Kontext:** `scripts/check-doc-links.mjs:5` prüft 7 Wurzeln. **16 von 22 `T_*`-Ordnern und `t_claude_code` (= 258 Dateien) werden nie gelesen.** Genau derselbe Fehlertyp, der lokal schon rot ist (Selbstverweis in `T_FRONTEND/Planungsdateien/23_…:115`), bleibt dort unentdeckt.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Nachbarpläne:** `05_o01_hygiene_guards_arbeitsbranch_plan.md` (löst _wann_ geprüft wird) · sachlich benachbart zu **A02** in `T_CODE_QUALITAET_LLM_KONSOLIDIERUNG` — A02 repariert bekannte Links im Router, dieser Plan erweitert die **Erkennung**. Beides ergänzt sich, überschneidet sich nicht.

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein                   | Scope (Dateien)                        | Ausführung  | Status | Zuständigkeit | Verifikation                                                   |
| --- | ----------------------------- | -------------------------------------- | ----------- | ------ | ------------- | -------------------------------------------------------------- |
| L0  | Wurzel-Inventar               | `scripts/check-doc-links.mjs` (lesend) | Sequenziell | Bereit | LLM           | `ROOTS`/`EXTRA_FILES` + Dateizahl je Ordner                    |
| L1  | Trockenlauf mit voller Wurzel | Skript-Kopie, kein Commit              | Sequenziell | Bereit | LLM           | Zahl der toten Links je neuem Ordner                           |
| L2  | Trieage der Funde             | —                                      | Sequenziell | Bereit | LLM           | Klasse A „echter toter Link" / Klasse B „Link-Syntax in Prosa" |
| L3  | Wurzelliste erweitern         | `scripts/check-doc-links.mjs`          | Sequenziell | Bereit | LLM           | Exit-Code, Dateizahl steigt um ~258                            |
| L4  | Funde abarbeiten              | nur Klasse-A-Dateien                   | Sequenziell | Bereit | LLM           | 0 tote Links in lebendigen Dateien                             |
| L5  | Abschluss                     | —                                      | Sequenziell | Bereit | LLM           | Gate grün, CI-Lauf grün                                        |

Fan-out: **zulässig ab L4**, aber nur wenn Klasse A nach Ordner in unabhängige Schreibbereiche zerfällt und die Fundmenge die Jan-Planer-Schwelle überschreitet. Merge ist in jedem Fall `Sequenziell`.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [`scripts/check-doc-links.mjs`](../../../../../scripts/check-doc-links.mjs) — die einzige Datei, die geändert wird.
- [`package.json`](../../../../../package.json) — Script-Name `check-doc-links`.
- `T_FRONTEND/Planungsdateien/23_layout_shell_navigation_plan.md:115` — der aktuell einzige lokal rote Fund; dient als Referenzfall für Klasse B.
- [`docs/archive/`](../../../../../docs/archive) — enthält 148 tote Links; wird **nicht** repariert, sondern ausgenommen.

### 2.2 Invarianten

- `docs/archive/` bleibt von der Pflicht ausgenommen: historische Pläne dürfen tote Verweise tragen. Die Ausnahme wird **explizit im Skript** dokumentiert, nicht stillschweigend.
- Kein Link wird gelöscht, um das Gate zu befriedigen. Klasse B (Link-Syntax innerhalb einer Anweisung) wird in Inline-Code umgeschrieben — das ist die im Repo bereits dokumentierte Lehre aus Runde 2/K14.
- Kein Dokumentinhalt wird inhaltlich verändert; nur Verweis- und Code-Syntax.
- Das Skript bleibt ohne externe Abhängigkeit lauffähig (kein Netzwerkzugriff).

### 2.3 Nicht-Scope

- Keine Umbenennung, kein Umzug, keine Löschung von Dokumenten (das sind Pläne 07–12, 18).
- Keine Reparatur des Archivs.
- Kein neuer Guard für andere Fehlerklassen (Größe, Doppelung) — eigener Beschluss.
- Keine Änderung an `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`.

## 3 — Detaillierte Meilensteine

### L0 — Wurzel-Inventar

- **Ziel:** Belegte Ausgangslage.
- **Schritte:** `ROOTS` und `EXTRA_FILES` mit Zeilennummer erfassen; Anzahl `.md`-Dateien je Ordner zählen; die **nicht** erfassten Ordner auflisten.
- **Erwartetes Verhalten:** Tabelle `Ordner → Dateien → erfasst ja/nein`, Summe der Lücke ≈ 258.
- **Abbruch/Rückfall:** Weicht die Zahl stark ab, wird L1 trotzdem gefahren und die Abweichung dokumentiert (Momentaufnahme).

### L1 — Trockenlauf mit voller Wurzel

- **Ziel:** Die Größe des Problems kennen, bevor der Guard scharf gestellt wird.
- **Schritte:** Skript-Kopie mit erweiterter `ROOTS`-Liste lokal ausführen; **nicht committen**; Zahl der toten Links je neuem Ordner festhalten.
- **Erwartetes Verhalten:** Eine Zahl und eine Ordner-Verteilung, nicht „viele".
- **Abbruch/Rückfall:** Bricht das Skript bei einem Ordner ab, wird dieser Ordner einzeln nachgefahren und der Abbruch als Fund gemeldet.

### L2 — Trieage der Funde

- **Ziel:** Echte Fehler von Syntax-Kollisionen trennen.
- **Schritte:** Jeden Fund einer Klasse zuordnen: **A** = Verweisabsicht auf ein fehlendes Ziel; **B** = Link-Syntax innerhalb von Anweisungs-/Beispieltext.
- **Erwartetes Verhalten:** Zwei Listen mit `Datei:Zeile`.
- **Abbruch/Rückfall:** Unklare Fälle werden als Klasse A geführt (fail-closed).

### L3 — Wurzelliste erweitern

- **Ziel:** Der Guard sieht die volle Doku-Schicht.
- **Schritte:** `ROOTS` um alle `T_*`-Ordner und `t_claude_code` ergänzen; `docs/archive` ausnehmen und die Ausnahme kommentieren.
- **Erwartetes Verhalten:** Ausgabe nennt ~258 zusätzlich geprüfte Dateien.
- **Abbruch/Rückfall:** Ein Ordner mit ausschließlich historischen Inhalten wird wie `docs/archive` behandelt, aber namentlich begründet.

### L4 — Funde abarbeiten

- **Ziel:** Gate wird grün, ohne Inhalte zu beschädigen.
- **Schritte:** Klasse B in Inline-Code umschreiben; Klasse A auf das richtige Ziel zeigen lassen oder den Verweis entfernen.
- **Erwartetes Verhalten:** 0 tote Links in lebendigen Dateien; Archiv unverändert.
- **Abbruch/Rückfall:** Fehlt das Ziel, wird der Verweis entfernt statt ein leeres Ziel erfunden.

### L5 — Abschluss

- **Ziel:** Der Guard blockiert künftig korrekt.
- **Schritte:** `npm run check-doc-links` lokal grün; nach dem Commit CI-Lauf gegen den Arbeitsbranch prüfen (setzt 01 voraus).
- **Erwartetes Verhalten:** Lokal und in CI identisches Ergebnis — die Lücke „lokal grün / HEAD rot" ist geschlossen.
- **Abbruch/Rückfall:** Abweichendes CI-Ergebnis bedeutet, ein Linkziel ist uncommittet; dann wird der Verweis auf Inline-Code zurückgestellt.

## 4 — 5-Stufen-Abschlussprüfung

1. `npm run typecheck` ohne Fehler.
2. `npm test` ohne Fehlschlag.
3. `npm run lint` ohne Errors.
4. `npm run build` erfolgreich.
5. `npm run check-doc-links` grün (Exit 0), Dateizahl der geprüften Wurzeln dokumentiert, CI-Lauf am Arbeitsbranch grün.
