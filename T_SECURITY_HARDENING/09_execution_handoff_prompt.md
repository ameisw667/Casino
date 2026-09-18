# 09 — Execution-Handoff-Prompt für Security Hardening (Säulen 1, 2, 4, 6)

> **Zweck dieser Datei:** Der Inhalt ab Abschnitt "PROMPT BEGINNT HIER" ist als **Input für eine komplett frische, separate LLM-Konversation** gedacht (kein Zugriff auf die Planungs-Konversation, die diese Dateien erzeugt hat). Diese Konversation selbst bleibt planungsseitig — sie führt nichts davon aus. Kopiere den Prompt-Block unverändert in die neue Konversation.
>
> **Herkunft:** Erzeugt am 2026-09-12 als Abschluss der Jahres-Einzelprüfung aller 10 Security-Hardening-Säulen (siehe `00_SECURITY_HARDENING_UEBERSICHT.md`). Vier Säulen (01, 02, 04, 06) haben dabei neue, frisch gegen den echten Code verifizierte Execution-Ready-Planungsdateien erhalten — dieser Prompt übergibt genau diese vier an eine Ausführungs-Konversation. Vor der Übergabe an Jan wurde dieser Prompt selbst einer Mehr-Perspektiven-Prüfung unterzogen (Abschnitt "Selbstprüfung dieses Prompts" am Ende dieser Datei).
>
> **Ausgeführt am 2026-09-13** — siehe Ergebnis in `00_SECURITY_HARDENING_UEBERSICHT.md` (alle 4 Säulen 🟢, Kategorie-Schnitt Top 14,0 %) sowie die `§9`-Ausführungsergebnisse in den 4 Einzeldateien. Der finale Merge (inkl. der zuvor uncommitteten CI-Concurrency-Blöcke) liegt auf Branch `security-round3-final-merge`. Diese Datei bleibt als historischer Beleg stehen, wird nicht gelöscht.

---

## PROMPT BEGINNT HIER

Du übernimmst eine reine EXECUTION-Aufgabe im Casino-Repository (`V:\VibeCoding\Casino`).
Die Planung ist vollständig abgeschlossen — du planst NICHTS neu, du führst aus, prüfst
mehrfach aus verschiedenen Perspektiven, und schließt erst ab, wenn alle 4 Ziele wirklich
grün sind. Du hast **keinen Zugriff auf eine vorherige Chat-Historie** — alles, was du
wissen musst, steht in diesem Prompt und den Dateien, auf die er verweist. Lies nichts
blind aus diesem Prompt ab, was du am echten Code/Repo-Zustand gegenprüfen kannst — bei
jedem Widerspruch gewinnt der Code, nicht dieser Text (das Repo hat mehrere parallel
laufende Sessions, der Code hat sich seit 2026-09-12 vermutlich weiterbewegt).

### 0. Pflichtlektüre vor der ersten Aktion (in dieser Reihenfolge)

1. `AGENTS.md` und `CLAUDE.md` im Projekt-Root — enthalten die verbindlichen K-Level-Gates, Code-Review-Pflichten und Supabase-Regeln, denen diese Aufgabe unterliegt. **Diese Regeln stehen über allem, was in diesem Prompt steht.**
2. `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` — Gesamtstatus aller 10 Security-Hardening-Säulen, insbesondere die 4 Zeilen mit Status 🔴.
3. `worldmap/00_WORLDMAP_STATUS.md` — Zeile zu Kategorie 04 "Security Hardening (Headers, CSP & Secrets)" für den übergeordneten Projektkontext.
4. `xx_sop/02_workflow_jan_execution.md` — die verbindliche 5-Stufen-Selbstprüfung (Typecheck, Test, Lint, Build, git status) für jeden Meilenstein.
5. `xx_sop/03_workflow_jan_planungsdateien.md` — Lebenszyklus-Terminologie (Execution-Ready → In Execution → Executed).
6. `T_SECURITY_HARDENING/branch_merge_saeulen_5_7_8_plan.md` — **nur lesen, nicht anfassen.** Beschreibt einen separaten, laufenden Merge-Vorgang für Säulen 3/5/7/8. Zeigt aber das bereits bewährte Muster für genau die Aufgabe, die du gleich machst (Worktree pro Säule, Merge, Konfliktauflösung) — als Referenz-Vorlage nutzen.
7. Die vier Planungsdateien, die du vollständig ausführst — **jede einzeln komplett lesen, nicht nur überfliegen**:
   - `T_SECURITY_HARDENING/01_csp_script_hardening.md` (CSP `script-src` Nonce-Härtung, L1–L5)
   - `T_SECURITY_HARDENING/02_security_ci_gate.md` (Security-CI-Gate, L1–L5)
   - `T_SECURITY_HARDENING/04_csrf_origin_guard.md` (CSRF/Origin-Guard, L1–L5)
   - `T_SECURITY_HARDENING/06_csp_violation_reporting.md` (CSP-Violation-Reporting, L1–L5)

### 1. Auftrag in einem Satz

Führe alle 20 Meilensteine (L1–L5 je Säule) der vier oben genannten Planungsdateien vollständig aus, bis jede Säule entweder ihre in der jeweiligen Datei genannte "Definition of Done" vollständig erreicht oder — bei den zwei Säulen mit K5-Rest (CSP-Skript, CI-Gate) — bis zu dem Punkt, an dem nur noch die dort dokumentierte, explizite Jan-Entscheidung fehlt.

### 2. Technische Ausführungsstrategie: 4 isolierte Worktrees, parallel

Führe die 4 Pläne **unabhängig voneinander in 4 separaten Git-Worktrees** aus (Muster: `branch_merge_saeulen_5_7_8_plan.md`, dort bereits erfolgreich erprobt) — nicht im Hauptarbeitsverzeichnis, das vermutlich weiterhin viele fremde uncommittete Änderungen anderer paralleler Sessions enthält (`git status --short | wc -l` zuerst prüfen).

1. Für jede der 4 Säulen: `git worktree add .claude/worktrees/<säule> -b hardening-<säule> <aktueller-hauptbranch>` (Branch-Namen: `hardening-csp-script`, `hardening-ci-gate`, `hardening-csrf`, `hardening-csp-reporting`).
2. Wenn dein Environment parallele Subagenten mit eigenem Arbeitskontext unterstützt (Claude Code Agent-Tool mit Worktree-Isolation): starte 4 Subagenten gleichzeitig, jeder bekommt GENAU EINEN der 4 Pfade oben als vollständigen Kontext und arbeitet NUR in seinem eigenen Worktree. Falls das technisch nicht möglich ist: führe die 4 Pläne sequenziell in 4 separaten Worktrees aus derselben Konversation aus.
3. Jeder Subagent/Durchlauf setzt L1–L5 der jeweiligen Datei genau wie dort beschrieben um, inklusive der dort verlangten Verifizierung pro Meilenstein.
4. Jeder Subagent/Durchlauf führt am Ende die volle 5-Stufen-Prüfung (`npm run typecheck`, `npm test`, `npm run lint`, `npm run build`) in seinem eigenen Worktree aus — muss grün sein, bevor der Worktree als fertig gilt.

### 3. Bekannte Kollisionspunkte beim Zusammenführen — vorher lesen, nicht überrascht werden

1. **`.github/workflows/red-team-security.yml`:** Säule 2 (L2, Caching) UND Säule 4 (L5, neue Origin-Bypass-Probe) ändern diese Datei an unterschiedlichen, aber additiven Stellen. Beim Merge: beide Änderungen behalten, keine Seite verwerfen (exakt das Muster aus `branch_merge_saeulen_5_7_8_plan.md`, L3).
2. **`T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md`:** Alle 4 Pläne müssen am Ende ihre Zeile in dieser Datei aktualisieren — das NICHT in den 4 parallelen Worktrees tun (4-Wege-Konflikt garantiert). Stattdessen: jeder Worktree dokumentiert sein Ergebnis nur in seiner eigenen `0N_*.md`-Datei (neuer Abschnitt "Ausführungsergebnis", Muster: `03_env_secrets_schema.md` §9). Die Übersichtsdatei wird erst ganz am Schluss, nach dem Merge aller 4 Branches, einmal sequenziell aktualisiert (siehe Abschnitt 5).
3. Merge-Reihenfolge: erst die 2 konfliktfreien (CSP-Skript, CSP-Reporting), dann die 2 mit dem bekannten Konflikt (CI-Gate, CSRF) — Konflikt bewusst und einzeln auflösen, nicht mit `-X ours`/`-X theirs` automatisch wegdrücken.

### 4. Nach der Ausführung: Mehrfach-Prüfung aus 4 Perspektiven (pro Säule)

Bevor du eine Säule auf grün setzt, prüfe sie aus allen 4 folgenden Blickwinkeln — setze dafür gezielt Subagenten ein, wo ein frischer, unabhängiger Blick mehr wert ist als deine eigene Fortsetzung derselben Gedankenkette:

1. **DoD-Treue:** Stimmt das tatsächliche Diff 1:1 mit dem "Ziel"/"Schritte" jedes Meilensteins in der Planungsdatei überein? Nichts vergessen, nichts stillschweigend anders gelöst, ohne es zu vermerken.
2. **Security-Review:** `security-reviewer`-Agent auf den vollständigen Diff ansetzen — Pflicht bei CSRF (Geld-Pfad-Tiefenverteidigung) und CI-Gate (neues CodeQL-Gate), empfohlen bei den anderen beiden.
3. **Regressions-Sicherheit:** Volle 5-Stufen-Prüfung auf dem gemergten Endstand (nicht nur pro Worktree) — plus ein gezielter manueller Check der riskantesten Einzeländerung (SameSite-Cookie-Änderung in Säule 4 gegen den echten Google-Login-Flow; neue CSP-Direktiven in Säule 1 gegen tatsächlich genutzte Ressourcen).
4. **Merge-Integrität:** Nach dem Zusammenführen aller 4 Branches — sind beide bekannten Kollisionspunkte (Abschnitt 3) sauber aufgelöst, keine Funktionalität verloren? `git diff` gegen jeden der 4 Einzel-Branches gegenprüfen.

Erst wenn eine Säule alle 4 Perspektiven besteht, gilt sie als fertig.

### 5. Definition of Done je Säule (Status-Update)

Setze in `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` den Status jeder fertigen Säule von 🔴 auf 🟢, mit genau diesem Suffix in Klammern:

- CSP-Skript (#1): `🟢 Executed (Trusted-Types-Rest bei Jan)`
- CI-Gate (#2): `🟢 Executed (Alerting-Rest bei Jan)`
- CSRF (#4): `🟢 Executed (kein Rest)`
- CSP-Violation-Reporting (#6): `🟢 Executed (kein Rest)`

Aktualisiere danach auch die Niveau-Spalte (Ist-Wert statt Baseline/Projektion) und den gewichteten Gesamt-Schnitt der Kategorie in derselben Datei UND die entsprechende Zeile in `worldmap/00_WORLDMAP_STATUS.md` (Kategorie 04) — mit dem tatsächlich erreichten, nicht dem projizierten Wert. Aktualisiere außerdem `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 3.1: Status von "Ausstehend" auf "Teilausführung" setzen (oder, falls nur teilweise abgeschlossen, präzise als Teilausführung mit offenem Rest beschreiben) — diese Zeile ist der Grund, warum dieser offene Punkt nicht in Vergessenheit geraten sollte.

### 6. Nicht-Scope (explizit NICHT anfassen)

- Säulen 3, 5, 7, 8, 9, 10 — nicht Teil dieser Aufgabe.
- `branch_merge_saeulen_5_7_8_plan.md` und der Branch `security-hardening-round2-merge` — separater, laufender Vorgang, nicht berühren.
- Keine der bekannten K5-Entscheidungen selbst treffen oder umsetzen (Trusted Types, externes Alerting, `ws`-Fix, HMAC-Versionierung, COEP-Aktivierung, optionale `security.txt`-Felder) — die bleiben bei Jan.
- Kein `git push`, kein Merge in den Hauptbranch ohne Rückfrage — das Ergebnis bleibt auf eigenen Branches, bis Jan explizit grünes Licht gibt (Git-Safety-Regel).
- Keine Erweiterung des Scopes über die vier genannten Dateien hinaus, auch wenn dabei weitere Verbesserungsideen auffallen — dokumentiere sie stattdessen als Fund in der jeweiligen Datei, statt sie ungefragt mitzuerledigen.

### 7. Abschlusskriterium

Die Aufgabe gilt erst als vollständig, wenn alle 4 Zeilen in `00_SECURITY_HARDENING_UEBERSICHT.md` auf 🟢 mit dem korrekten Suffix stehen, die volle 5-Stufen-Prüfung auf dem finalen gemergten Stand grün ist, `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 3.1 aktualisiert ist, und du eine kompakte Abschlussmeldung an Jan gibst: was pro Säule geändert wurde, welche 4 Perspektiven geprüft wurden, welcher K5-Rest (falls vorhanden) bei ihm liegt, und der neue Kategorie-Schnitt.

---

## PROMPT ENDET HIER

---

## Selbstprüfung dieses Prompts (vor Übergabe an Jan, mehrere Perspektiven)

| Perspektive                       | Prüffrage                                                                                                                                       | Ergebnis                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Vollständigkeit**               | Deckt der Prompt alle 4 Dateien und alle 20 Meilensteine ab, inklusive der beiden K5-Reste?                                                     | Ja — Abschnitt 0.7 referenziert alle vier Dateien vollständig; die beiden K5-Reste (CSP-Skript/Trusted Types, CI-Gate/Alerting) sind in Abschnitt 1 und 5 explizit benannt, nicht implizit erwartet.                                                                                                                                                                                 |
| **Parallelisierungs-Korrektheit** | Ist die vorgeschlagene 4-Worktree-Aufteilung tatsächlich konfliktfrei?                                                                          | Zwei Dateien werden von mehr als einer Säule berührt (`red-team-security.yml` von #2+#4, die Übersichtsdatei von allen vieren) — beide sind in Abschnitt 3 explizit als Kollisionspunkte benannt, mit konkreter Auflösungsreihenfolge, statt naiv anzunehmen, 4 Worktrees seien automatisch konfliktfrei.                                                                            |
| **Eigenständigkeit**              | Kann eine Konversation ohne jeglichen Chat-Verlauf diesen Prompt verstehen und ausführen?                                                       | Ja — Abschnitt 0 verlangt explizit das Lesen von `AGENTS.md`/`CLAUDE.md` zuerst, dann der vier Planungsdateien; keine Referenz auf "wie besprochen" oder implizites Vorwissen.                                                                                                                                                                                                       |
| **Ehrlichkeit beim Zielniveau**   | Verspricht der Prompt ein Niveau, das die Ausführungs-Konversation gar nicht erreichen kann?                                                    | Ursprünglicher Wunsch war "Top 1 %" für alle vier — **korrigiert:** CSP-Skript und CI-Gate haben einen strukturellen K5-Blocker (Trusted Types, externes Alerting) und können nach vollständiger Ausführung nur bis zur jeweiligen Projektion (~Top 15 %) kommen, nicht Top 1 %. Der Prompt verspricht deshalb explizit unterschiedliche Suffixe statt einer pauschalen Erfolgszahl. |
| **Mehrfach-Prüfungs-Disziplin**   | Verhindert der Prompt, dass eine Säule voreilig auf grün gesetzt wird?                                                                          | Ja — Abschnitt 4 verlangt 4 unabhängige Prüfperspektiven (inkl. Subagenten-Einsatz für einen frischen Blick) vor jedem Status-Wechsel, nicht nur die eigene 5-Stufen-Prüfung des Ausführenden selbst.                                                                                                                                                                                |
| **Scope-Disziplin**               | Verhindert der Prompt, dass die Ausführungs-Konversation ungefragt weitere Säulen, den parallelen Merge-Vorgang oder K5-Entscheidungen anfasst? | Ja — Abschnitt 6 grenzt explizit ab (Säulen 3/5/7/8/9/10 Erhalt-Modus, `branch_merge_saeulen_5_7_8_plan.md` nicht anfassen, keine K5-Entscheidung selbst treffen, kein Push/Merge ohne Rückfrage).                                                                                                                                                                                   |
| **Rückverfolgbarkeit für Jan**    | Geht dieser offene Punkt beim Schließen der Planungs-Konversation verloren?                                                                     | Nein — diese Datei existiert unabhängig von der Chat-Historie, und `worldmap/05_ZUKUNFTSPLANUNG.md` Zeile 3.1 verweist explizit hierher, genau zu dem Zweck, den Jan angefordert hat.                                                                                                                                                                                                |

**Fazit der Selbstprüfung:** Der Prompt ist eigenständig ausführbar, benennt beide bekannten Datei-Kollisionspunkte proaktiv statt sie die Ausführungs-Konversation selbst entdecken zu lassen, und verspricht kein Niveau, das die zwei K5-gebundenen Säulen strukturell nicht erreichen können.

---

## Nachtrag: Ausführung + Verifikation abgeschlossen (2026-09-13)

Alle 4 Säulen wurden ausgeführt (separate Branches `hardening-csp-script`/`hardening-ci-gate`/`hardening-csrf`/`hardening-csp-reporting`, gemergt in `round3-security-merge`), unabhängig von der Planungskonversation verifiziert (eigener `npm ci` + 5-Stufen-Prüfung, K5-Integritäts-Check per `git diff`), ein realer Fehler in Säule 4 korrigiert (Zählfehler 28→27 Call-Sites) und ein realer Befund in Säule 2 transparent gemacht (Concurrency-Blöcke fehlten im Basis-Commit — mittlerweile per gezieltem Commit + Merge in `security-round3-final-merge` geschlossen). Details: `00_SECURITY_HARDENING_UEBERSICHT.md` und die `§9`-Abschnitte der 4 Einzeldateien.
