# 01.4 — Commands & Workflow-Automatisierung: Ist-Analyse & Action-Items

> **Umbenannt am 2026-08-30** von `01_6_command.md` — Vereinheitlichung der Dateinamen im Ordner auf das Schema `01_<Kategorienummer>_<Kategoriename>.md` (Kategorie 4 aus `00_claude_code_uebersicht.md`). Inhalt unverändert, nur Dateiname und Kopfzeile neu.
>
> **Status:** Geplant · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Dimension 6 aus `01_1_claude_md.md` (Ist-Niveau **Top 45 %**, größter Einzel-Bottleneck der 10-Dimensionen-Matrix). Reine Analyse und Empfehlung — **keine** Änderung an `CLAUDE.md`/`AGENTS.md` in diesem Schritt.

---

## 1 — Übersicht für Jan

| Nummer   | Meilenstein                                     | Status      | Nächster Schritt                                                                                               | Zuständigkeit |
| :------- | :---------------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------- | :------------ |
| **K6-0** | **Ist-Analyse mit Belegstellen**                | 🟢 Executed | Ergebnis in Abschnitt 2.                                                                                       | LLM           |
| **K6-1** | **Scoped-Test-Matrix mit verifizierten Pfaden** | 🔴 Geplant  | `xx_docs/02_command_reference.md` um Abschnitt „Gezielte Verifikation" erweitern (Abschnitt 3.1).              | LLM           |
| **K6-2** | **CI-Lokal-Paritätstabelle**                    | 🔴 Geplant  | Neue Tabelle in `xx_docs/02_command_reference.md`: Workflow-Datei → lokales Äquivalent-Script (Abschnitt 3.2). | LLM           |
| **K6-3** | **Pre-Commit-Verhalten dokumentieren**          | 🔴 Geplant  | Einzeiler zu `.husky/pre-commit` in `xx_docs/02_command_reference.md` ergänzen (Abschnitt 3.3).                | LLM           |
| **K6-4** | **CLAUDE.md-Textbaustein für `## Commands`**    | 🟢 Executed | Vorschlag liegt in Abschnitt 5 vor, wartet auf Jan-Review.                                                     | LLM           |
| **K6-5** | **Manuelle Übernahme in `CLAUDE.md`**           | 🔴 Geplant  | Entfällt als Meilenstein hier — folgt der bestehenden Hard Rule in `CLAUDE.md` (Editierung nur durch Jan).     | —             |

---

## 1a — Kompaktübersicht (Sub-Kategorien, sortiert nach Niveau, bestes zuerst)

_Ergänzt 2026-09-05, analog zur Methodik in [`01_9_hooks.md`](01_9_hooks.md). Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**. Spaltenlogik: **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant._

|  #  | Unterkategorie                                                   |    Niveau    | Kernbefund                                                                                                                                                                                                                 | Planungsdateien                                         | Execution                                                                    |
| :-: | :--------------------------------------------------------------- | :----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------ | :--------------------------------------------------------------------------- |
|  1  | CLAUDE.md-Textbaustein für `## Commands` (K6-4)                  | **Top 15 %** | Vorschlagstext fertig (Abschnitt 5); **2 der 4 Policy-Zeilen sind live in `CLAUDE.md` übernommen** (command_reference- und execution-Verweis), Scoped-Test- und Husky-Zeile sowie `vibe-check`/`economy-audit` fehlen noch | — (diese Datei, Abschnitt 5)                            | 🟡 teilweise übernommen (2/4 Zeilen)                                         |
|  2  | Verifikationsdisziplin bei Pfadangaben (Baustein-C-Faktenfehler) | **Top 25 %** | `tests/security/`-Fehler erkannt und in Abschnitt 2.2/5 korrigiert — das Muster „Pfad vor Empfehlung per Glob verifizieren" ist als Lehre formuliert (2.2 in `01_5_session_memory.md` als `learn-eval`-Testfall verlinkt)  | [`01_5_session_memory.md`](01_5_session_memory.md) §3.2 | 🟡 Korrektur erledigt, Verweis-Markierung in `01_1` (Action-Item 5) 🔵 offen |
|  3  | Basis-Sichtbarkeit: `CLAUDE.md` kennt 5 von 25 Scripts           | **Top 45 %** | Der Umweg über `xx_docs/02_command_reference.md` für jede Routineaktion außerhalb der 5 Basisbefehle bleibt bestehen; 2–3 Direktzeilen für `economy-audit`/`vibe-check` sind Teil des wartenden Bausteins                  | `xx_docs/02_command_reference.md` (Zielort)             | 🔵 geplant (Teil des wartenden Bausteins)                                    |
|  4  | Pre-Commit-Verhalten dokumentiert (K6-3)                         | **Top 75 %** | `.husky/pre-commit` führt 3 Prüfungen aus (Migrations-Kollision, gitleaks, lint-staged), die in keiner Doku erwähnt werden — fehlgeschlagene Commits sind für eine frische Sitzung nicht diagnostizierbar                  | `xx_docs/02_command_reference.md` (Zielort)             | 🔵 geplant                                                                   |
|  5  | Scoped-Test-Matrix mit verifizierten Pfaden (K6-1)               | **Top 85 %** | Kein dokumentierter Weg, bei einer Änderung an nur einem Modul (z. B. `dice`) gezielt die relevanten Tests zu laufen — einzige Alternative ist die volle Suite (642–1.185 Tests)                                           | `xx_docs/02_command_reference.md` (Zielort)             | 🔵 geplant                                                                   |
|  6  | CI-Lokal-Parität (K6-2)                                          | **Top 85 %** | 6 GitHub-Actions-Workflows ohne lokales Äquivalent — Secret-Scan-/Dependency-Gate-Fehler werden erst nach dem Remote-Lauf sichtbar                                                                                         | `xx_docs/02_command_reference.md` (Zielort)             | 🔵 geplant                                                                   |

**Rechnerischer Schnitt:** (15+25+45+75+85+85)/6 ≈ **Top 55 %**.

_Abgrenzung zum Kopf der Datei („Ist-Niveau Top 45 %", Stand 2026-08-29): Der Schnitt verbessert sich auf ≈ Top 55 %, weil K6-4 inzwischen executed ist und die Baustein-C-Korrektur ein real geleisteter Verifikationsgewinn ist. Der große Rest (K6-1–K6-3) liegt in einer einzigen Datei (`xx_docs/02_command_reference.md`) und ist reine Schreibarbeit._

---

## 2 — Warum das Niveau aktuell nur Top 45 % ist (Ist-Analyse mit Beleg)

### 2.1 — Sichtbarkeits-Lücke: `CLAUDE.md` kennt 5 von 25 Scripts

`CLAUDE.md`s Abschnitt „## Commands" listet exakt 5 Befehle (`dev`, `test`, `typecheck`, `lint`, `build`). `package.json` definiert tatsächlich **25 Scripts** — u. a. `verify:supabase`, `economy-audit`, `fraud-ml-scan`, sechs `supabase:*`-Befehle, zwei `sentry:*`-Befehle, `vibe-check`, zwei `observability:*`-Befehle, `loadtest:bet`, vier `github:*`-Befehle, `format`/`format:check` und `check-doc-links`. Der Router-Satz „Vor einem nicht aufgeführten Script … zuerst `xx_docs/02_command_reference.md` lesen" behebt das nur teilweise: Er erzwingt einen zusätzlichen Datei-Lese-Umweg für **jede** Routineaktion außerhalb der 5 Basisbefehle, statt die 5–8 tatsächlich häufig gebrauchten Befehle (z. B. `economy-audit`, `vibe-check`, `supabase:diff`) direkt sichtbar zu machen.

### 2.2 — Faktenfehler im eigenen Verbesserungsvorschlag (Baustein C)

Der übergeordnete Plan (`01_1_claude_md.md:120`) schlägt als Verbesserung selbst vor:

```bash
npx vitest run tests/security/             # Security & Invarianten Tests
```

Verifiziert per Glob: **Der Pfad `tests/security/` existiert in diesem Repository nicht.** Die tatsächliche Security-Testsuite liegt unter `src/lib/security/__tests__/` (14 Testdateien, u. a. `request-security.test.ts`, `auth-error-mapping.test.ts`, `admin-fraud-route.test.ts`). Würde Jan Baustein C unverändert übernehmen, würde ein Agent den Befehl gegen einen nicht existierenden Ordner ausführen — Vitest liefert dabei **keinen Fehler**, sondern „no test files found", was als stiller Fehlalarm über vollständig getestete Sicherheitslogik hinwegtäuschen würde. Das ist der konkrete Beleg, warum Abschnitt 5 dieser Datei einen korrigierten, verifizierten Pfad vorschlägt statt Baustein C unverändert zu übernehmen.

### 2.3 — Keine CI-Lokal-Parität

Das Repo betreibt sechs GitHub-Actions-Workflows (`.github/workflows/quality-ci.yml`, `security-staging.yml`, `secret-scan.yml`, `dependency-audit.yml`, `doc-drift-check.yml`, `red-team-security.yml`). Keiner ist mit einem lokal reproduzierbaren Befehl verknüpft. Ein Agent kann daher vor einem Push nicht wissen, ob z. B. das Secret-Scan-Gate oder das Dependency-Audit-Gate lokal bereits grün wäre — Fehler werden erst nach dem Remote-Lauf sichtbar (langsame Feedback-Schleife, genau das Muster, das Dimension 9 „Verifikationsschleifen" separat als Schwachstelle nennt).

### 2.4 — Pre-Commit-Verhalten ist für das LLM unsichtbar

`.husky/pre-commit` führt bei jedem Commit drei Prüfungen aus, die in keiner Doku-Datei erwähnt werden:

1. Migrations-Nummernkollisions-Check (`ls supabase/migrations | sed -E 's/_.*//' | sort | uniq -d`) — bricht den Commit ab, wenn zwei Migrationen dieselbe Präfix-Nummer tragen (laut `worldmap/00_WORLDMAP_STATUS.md` bereits zweimal real aufgetreten: 049/050 und die 058/059-Bereinigung).
2. `gitleaks protect --staged` gegen `.gitleaks.toml`.
3. `npx lint-staged` (ESLint --fix, `scripts/typecheck-staged.mjs`, Prettier — nur auf staged Dateien, nicht die volle Suite).

Ohne dieses Wissen kann ein Agent einen fehlgeschlagenen Commit nicht korrekt diagnostizieren und schlägt im Zweifel den in Dimension 3 explizit verbotenen Reflex vor, den Hook zu umgehen.

### 2.5 — Keine Scoped-Test-Matrix trotz klar modularer Architektur

`CLAUDE.md` beschreibt Games, Service-Layer und API-Routen als saubere, getrennte Schichten (`src/lib/casino/`, `src/app/api/`, `src/components/casino/games/[game]/`). Für eine Änderung an z. B. nur `dice` gibt es aktuell keinen dokumentierten Weg, gezielt nur die relevanten Tests zu laufen — die einzige Alternative ist die volle Suite (laut `worldmap/00_WORLDMAP_STATUS.md` je nach Kategorie zwischen 642 und über 1.185 Tests), was für kleine Änderungen unnötig Zeit und Kontext-Tokens verbraucht.

---

## 3 — Zielarchitektur: Wie das grundsätzlich behoben wird

**Prinzip:** Die Detailtabellen gehören in `xx_docs/02_command_reference.md` (bereits die kanonische Quelle laut Dateikopf), **nicht** zusätzlich in `CLAUDE.md`. Das vermeidet den in Dimension 1/2 der übergeordneten Matrix bereits kritisierten Fehler, `CLAUDE.md` mit Fließtext/Tabellen aufzublähen. `CLAUDE.md` selbst bekommt nur so viele Zeilen wie nötig, um (a) die 3 häufigsten bisher unsichtbaren Befehle sichtbar zu machen und (b) klar auf die erweiterte Referenzdatei zu verweisen.

Konkret:

- `xx_docs/02_command_reference.md` erhält einen neuen Abschnitt „Gezielte Verifikation" mit **nur verifizierten, existierenden Pfaden**.
- `xx_docs/02_command_reference.md` erhält eine CI-Paritätstabelle (Workflow-Datei → lokales Äquivalent).
- `xx_docs/02_command_reference.md` erhält einen Einzeiler zum Pre-Commit-Verhalten.
- `CLAUDE.md`s „## Commands"-Abschnitt bleibt schlank, bekommt aber 2–3 neue Zeilen, die auf die drei häufigsten bisher unsichtbaren Fälle (`economy-audit`, `vibe-check`, gezielte Tests) direkt verweisen, statt sie vollständig aufzulisten.

---

## 4 — Action-Items (ausschließlich LLM-seitig)

|  #  | Action-Item                                                                                                                                                                                                                                                               | Konkretes Ergebnis                                                      |   Status    | Zuständigkeit |
| :-: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------- | :---------: | :-----------: |
|  1  | Neuen Abschnitt „3. Gezielte Verifikation" in `xx_docs/02_command_reference.md` ergänzen mit den verifizierten Pfaden `src/lib/casino/`, `src/lib/security/__tests__/`, `src/app/api/`, `src/components/casino/`                                                          | Vier vitest-Filter-Befehle, jeweils mit echtem, per Glob geprüftem Pfad | 🔴 Geplant  |      LLM      |
|  2  | CI-Paritätstabelle ergänzen: `quality-ci.yml` → `npm run lint && npm run typecheck && npm run test`, `secret-scan.yml` → `gitleaks detect` (lokal, falls installiert), `dependency-audit.yml` → `npm audit`/`audit-ci`, `doc-drift-check.yml` → `npm run check-doc-links` | Tabelle mit 4–6 Zeilen (Workflow / lokales Äquivalent / Abweichung)     | 🔴 Geplant  |      LLM      |
|  3  | Einzeiler zu `.husky/pre-commit`-Verhalten ergänzen (Migrationskollisions-Check, gitleaks, lint-staged-Scope)                                                                                                                                                             | 3 Stichpunkte in `xx_docs/02_command_reference.md` Abschnitt 1          | 🔴 Geplant  |      LLM      |
|  4  | Schlanken `CLAUDE.md`-Textbaustein für „## Commands" formulieren (siehe Abschnitt 5)                                                                                                                                                                                      | Fertiger Vorschlagstext zum manuellen Vergleich                         | 🟢 Executed |      LLM      |
|  5  | Nach Freigabe: Baustein C im übergeordneten Plan (`01_1_claude_md.md`) als „durch `01_4_command_workflow.md` ersetzt/korrigiert" markieren, um doppelte, widersprüchliche Empfehlungen zu vermeiden                                                                       | Ein-Satz-Verweis in der Ursprungsdatei                                  | 🔴 Geplant  |      LLM      |

---

## 5 — Empfehlung für `CLAUDE.md` (zum manuellen Vergleich durch Jan)

**Ersetzt:** den bestehenden Abschnitt `## Commands` (aktuell 8 Zeilen inkl. `bash`-Block, direkt vor `### Auto-Allow & Execution Policy (Antigravity)`).

**Vorschlag:**

````markdown
## Commands

- Vor einem nicht aufgeführten Script sowie vor Remote- oder Schreibaktionen `xx_docs/02_command_reference.md` lesen.
- Auswahl und Reihenfolge der Prüfungen folgen `xx_sop/02_workflow_jan_execution.md`.
- Für eine Änderung an genau einem Modul (z. B. nur `dice`, nur Service-Layer) niemals ungefragt die volle Suite laufen lassen — zuerst den passenden Scoped-Test aus `xx_docs/02_command_reference.md` Abschnitt „Gezielte Verifikation" wählen.
- `.husky/pre-commit` prüft zusätzlich Migrations-Nummernkollisionen und Secrets (gitleaks) — ein Commit-Abbruch dort ist kein Bug, sondern eine funktionierende Guardrail; Ursache in `xx_docs/02_command_reference.md` nachschlagen statt `--no-verify`.

```bash
npm run dev          # Next.js auf Port 3015
npm run test         # Vitest
npm run typecheck    # TypeScript ohne Emit
npm run lint         # ESLint
npm run build        # Production-Build
npm run vibe-check   # Design-/Musterprüfung vor Übergaben (read-only)
npm run economy-audit # House-Edge-Abgleich (liest Supabase Service Role)
```
````

```

**Begründung der Kürze:** Die vollständige Scoped-Test- und CI-Paritätstabelle steht bewusst **nicht** hier, sondern in `xx_docs/02_command_reference.md` (Action-Item 1–3) — das hält `CLAUDE.md` im Sinne von Dimension 2 (Token-Ökonomie) schlank und vermeidet die in Dimension 1 kritisierte Prosa-/Tabellen-Aufblähung.

---

## 6 — Selbstprüfung (nach `xx_sop/03` §4 und `xx_sop/12`)

- [x] Scope klar auf Dimension 6 begrenzt, keine Überschneidung mit Dimension 9 (Quality Gates) — dort wird nur auf diese Datei verwiesen, nicht dupliziert.
- [x] Jede Behauptung ist mit einer konkreten Datei-/Zeilenstelle belegt (kein unbelegtes „ist wahrscheinlich so").
- [x] Der im Ursprungsplan vorgeschlagene Baustein C wird nicht unkritisch übernommen, sondern mit Beleg korrigiert.
- [x] Keine Zuständigkeit liegt bei Jan außer der bereits bestehenden Hard Rule (`CLAUDE.md` nur durch Jan editierbar).
- [x] Diese Datei ist für eine neue LLM-Konversation ohne weiteren Kontext verständlich (Belege sind vollständig zitiert, nicht nur referenziert).
```
