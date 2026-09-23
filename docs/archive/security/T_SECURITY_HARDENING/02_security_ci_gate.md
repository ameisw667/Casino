# 02 — Security-CI-Gate (Runde 2 — Ziel Top 10–15 %)

> **Status:** 🟢 Executed (2026-09-12) — Reste: L1/L2/L3-Verifikation remote nach Push durch Jan; Concurrency-Blöcke liegen im Basis-Commit 8863b64 noch nicht vor (Abweichung, siehe §9) · **Stand:** 2026-09-12 · **Owner:** LLM (100 % LLM-Zuständigkeit — Failure-Alerting per Telegram/Slack ist **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** `.github/workflows/security-staging.yml`, `.github/workflows/red-team-security.yml`, neuer CodeQL-Workflow, `.nvmrc`/`setup-node`-Cache-Konfiguration; **nicht** im Scope: externe Alert-Integration (Jan/K5, neues Secret), Dependency-Audit (Säule 7), Secret-Scanning (Säule 8).
> **Money-Pfad:** Nein (reine CI-Infrastruktur) · **Security-Review:** Empfohlen bei L1 (neues SAST-Gate — Prüfen, ob es False-Positives blockierend meldet)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Diese Säule galt nach Runde 1 als vollständig ausgeführt und im Erhalt-Modus ([`docs/archive/t_security_hardening_02_security_ci_gate.md`](../../../../docs/archive/t_security_hardening_02_security_ci_gate.md), 2026-09-06, Top 16 %, „kein offener Punkt mehr") — inklusive einer eigenen „Optimierungspotenziale Top 5"-Liste, die aber nicht in eine ausführbare Planungsdatei überführt wurde.
2. **Direkte Verifikation dieser Runde (2026-09-12, ohne `casino-code-explorer` — der Agent hat diese Aufgabe als außerhalb seines Casino-Feature-Scopes abgelehnt, da CI/CD-Workflows kein Bestandteil seiner Mandatory-Context-Tabelle sind; stattdessen direkte `Read`-Prüfung der 3 relevanten Workflow-Dateien):** Zwei der fünf „Optimierungspotenziale" aus Runde 1 sind bereits gelöst (Concurrency-Block existiert in beiden Workflows, `paths:`-Filter ist bereits auf sicherheitsrelevante Verzeichnisse verfeinert). Zwei sind offen und LLM-ausführbar (Caching, empirische Concurrency-Verifikation). Einer (externe Alert-Integration) ist K5, da er ein neues Secret (Telegram-Bot-Token oder Slack-Webhook) erfordert. **Zusätzlich neu gefunden:** Es existiert im gesamten Repository kein statisches Anwendungssicherheits-Scanning (SAST) — kein CodeQL-, Semgrep- oder vergleichbarer Workflow (`grep -ril "codeql\|semgrep" .github/workflows/` → 0 Treffer). Das ist eine reale, bislang nicht bewertete Lücke, die in keiner der 10 Subkategorien aus Runde 1 vorkam.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-12).
4. **Ein K5-Punkt:** Failure-Alerting über einen externen Kanal (Telegram/Slack) bleibt bewusst außerhalb dieser Runde — erfordert ein neues Secret (Bot-Token/Webhook-URL), das Jan bereitstellen und rotieren müsste.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                            | Scope (Dateien)                                                           |                   Status                   | Zuständigkeit | Verifikation                                                                                                        |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | :----------------------------------------: | :-----------: | ------------------------------------------------------------------------------------------------------------------- |
| L1  | CodeQL-Workflow für JavaScript/TypeScript ergänzen                     | Neuer Workflow `.github/workflows/codeql.yml`                             | 🟡 Executed, erster Lauf remote ausstehend |      LLM      | Erster CodeQL-Lauf grün (oder mit begründet allowlisteten Findings), sichtbar im Security-Tab                       |
| L2  | `npm ci`/Supabase-Docker-Image-Caching zwischen Läufen                 | `security-staging.yml`, `red-team-security.yml`                           |   🟡 Executed, Laufzeitvergleich remote    |      LLM      | Messbare Laufzeitverkürzung (Vorher/Nachher-Vergleich der Workflow-Dauer)                                           |
| L3  | Ephemeral-Stack-Isolation bei Parallelläufen empirisch verifizieren    | Kein Code-Änderung — gezielter Testlauf + Doku                            |    🟡 Wartet auf Push (Abweichung, §9)     |      LLM      | Zwei gleichzeitig ausgelöste Läufe zeigen, dass `cancel-in-progress: true` real greift, nicht nur laut YAML         |
| L4  | Branch-Protection-Dokumentation gegen echten Repo-Zustand verifizieren | `docs/security-hardening/08_security_ci_gates.md` (technischer Deep-Dive) |     ✅ Executed (Live-API verifiziert)     |      LLM      | Dokumentierte Required-Status-Checks stimmen mit dem tatsächlich konfigurierten Branch-Protection-Regelwerk überein |
| L5  | Alerting-Entscheidungsgrundlage für Jan dokumentieren                  | `docs/security-hardening/08_security_ci_gates.md`                         |      ✅ Executed (KEINE Aktivierung)       |      LLM      | Jan kann die K5-Entscheidung (Telegram vs. Slack vs. GitHub-native) informiert treffen                              |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind additive CI-/Doku-Ergänzungen ohne neues Secret — L1 nutzt ausschließlich den GitHub-nativen `GITHUB_TOKEN`, L5 aktiviert kein externes Alerting, sondern bereitet nur die Entscheidung vor.

---

## 2 — Security-CI-Gate in Subkategorien: Neubewertung (2026-09-12, Baseline für diese Runde)

|  #  | Subkategorie                                           | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                   |
| :-: | ------------------------------------------------------ | :---------------: | :----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | Ephemerer Stack statt Cloud-Staging                    |     Top 10 %      |   🟢   | Unverändert solide — kein Secret-Leck-Risiko                                                                                                                                 |
|  2  | Concurrency-Schutz (beide Workflows)                   |     Top 10 %      |   🟢   | `security-staging.yml:34-39`, `red-team-security.yml:30-35` — beide haben einen `concurrency`-Block, bereits bestätigt                                                       |
|  3  | SHA-Pinning der Actions                                |     Top 10 %      |   🟢   | Beide Workflows nutzen SHA-gepinnte `actions/checkout`/`actions/setup-node`                                                                                                  |
|  4  | `paths:`-Filter auf sicherheitsrelevante Verzeichnisse |     Top 10 %      |   🟢   | `security-staging.yml:22-29` bereits verfeinert (`supabase/migrations/**`, `src/lib/casino/**`, `src/lib/security/**` u. a.) — Runde-1-Optimierungspunkt #2 bereits erledigt |
|  5  | Job-Summary bei Fehlschlag                             |     Top 10 %      |   🟢   | `security-staging.yml:93-104` — lesbare Fehlerzusammenfassung                                                                                                                |
|  6  | Fail-Closed bei Infrastruktur-Fehler                   |     Top 10 %      |   🟢   | Kein `continue-on-error`, ein gescheiterter Schritt blockiert den Workflow-Erfolg                                                                                            |
|  7  | Red-Team-Gate wöchentlich + Push-Gate bei jedem Push   |     Top 15 %      |   🟢   | `red-team-security.yml` läuft wöchentlich (Sonntag 04:00 UTC) + `workflow_dispatch`, `security-staging.yml` bei jedem sicherheitsrelevanten Push                             |
|  8  | **Kein SAST-/CodeQL-Scan**                             |     Top 60 %      |   🔴   | 0 Treffer für `codeql`/`semgrep` in `.github/workflows/` — keinerlei statische Sicherheitsanalyse des JS/TS-Codes über ESLint-Regeln hinaus                                  |
|  9  | **Kein CI-/Runtime-Caching**                           |     Top 40 %      |   🟠   | `npm ci` läuft bei jedem Lauf komplett neu (nur `cache: npm` von `setup-node`, kein Supabase-Docker-Layer-Cache) — ~3-4 Min. Laufzeit pro Lauf, kein Caching zwischen Läufen |
| 10  | **Externes Failure-Alerting**                          |     Top 45 %      |   🟡   | Nur GitHub-UI/Job-Summary sichtbar, kein aktiver Push-Alert bei rotem `main`-Lauf — bewusst K5 (neues Secret)                                                                |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+10+10+10+10+10+15+60+40+45)/10 = **Top 22 %** — schlechter als der Runde-1-Endwert (Top 16 %), weil eine tiefere Recherche eine bislang komplett unbewertete, real gravierende Lücke (#8, fehlendes SAST) gefunden hat, die in keiner der ursprünglichen 10 Subkategorien vorkam.

---

## 3 — Verifizierter Ist-Stand (direkte Verifikation, 2026-09-12)

**`security-staging.yml`** (vollständig gelesen, 105 Zeilen): `on.push.paths` bereits auf 6 sicherheitsrelevante Pfad-Muster verfeinert (Zeilen 22-29). `concurrency`-Block vorhanden (Zeilen 34-39, `cancel-in-progress: true`). SHA-gepinnte Actions (Zeilen 47-48). Ephemerer `supabase start`/`supabase stop`-Zyklus, pgTAP-Tests, Phase-1-Sicherheitsskripte, `Summarize failure`-Schritt bei `if: failure()` (Zeilen 93-104).

**`red-team-security.yml`** (vollständig gelesen, 113 Zeilen): `schedule: '0 4 * * 0'` (wöchentlich) + `workflow_dispatch`. `concurrency`-Block vorhanden (Zeilen 30-35). 6 offensive Red-Team-Skripte (`target-guard`, `rate-limit-bypass`, `admin-idor`, `bot-bypass`, `crash-mp-bypass`, `admin-fraud-idor`), App läuft in Dev-Mode gegen ephemere Supabase-Instanz.

**`quality-ci.yml`** (vollständig gelesen, 58 Zeilen, zum Vergleich mitgeprüft): Migrations-Kollisions-Check, `npm test`, Coverage-Report (`continue-on-error`), Typecheck, Lint, Doc-Link-Check, Build. Kein SAST-Schritt.

**SAST-Lücke bestätigt:** `grep -ril "codeql\|semgrep" .github/workflows/` → 0 Treffer über alle 10 Workflow-Dateien im Repo (`backup-drill.yml`, `dependency-audit.yml`, `doc-drift-check.yml`, `migration-drift-check.yml`, `quality-ci.yml`, `query-performance-audit.yml`, `red-team-security.yml`, `schema-drift-check.yml`, `secret-scan.yml`, `security-staging.yml`). ESLint (in `quality-ci.yml`) deckt Code-Style/einige Korrektheits-Regeln ab, ist aber kein Sicherheits-SAST — findet z. B. keine Taint-Flow-Analyse für Injection-Muster.

**Branch-Protection:** Nicht direkt im Repo einsehbar (GitHub-Server-Konfiguration, nicht Code) — `docs/archive/00-09-CICD.md` dokumentiert laut Übersichtsdatei „Branch Protection aktiv und durchgesetzt", aber das wurde in dieser Runde nicht gegen den echten GitHub-API-Zustand verifiziert (außerhalb der read-only Code-Recherche dieser Session).

---

## 4 — Meilensteine

### L1 — CodeQL-Workflow ergänzen

- **Ziel:** Die in §2 #8 benannte, gravierendste Lücke schließen — statische Sicherheitsanalyse des JS/TS-Codes über ESLint-Style-Regeln hinaus (Taint-Flow, Injection-Muster, unsichere Deserialisierung etc.).
- **Schritte:** Neuer Workflow `.github/workflows/codeql.yml` — GitHub-natives `github/codeql-action` (SHA-gepinnt, Muster: bestehende Action-Pinning-Konvention), Sprache `javascript-typescript`, Trigger `pull_request`+`push` auf `main` + wöchentlicher `schedule` (Muster: `red-team-security.yml`). Nutzt ausschließlich den Standard-`GITHUB_TOKEN` — kein neues Secret.
- **Verifizierung:** Erster Lauf erfolgreich, Ergebnisse im GitHub-„Security"-Tab sichtbar; falls initiale Findings auftauchen, jeden einzeln bewerten (echter Fund vs. False-Positive) und dokumentiert entweder beheben oder mit Begründung als Non-Issue markieren (`.github/codeql/codeql-config.yml`-Suppressions, analog zur Allowlist-Disziplin aus Säule 7).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (neues Scanning-Gate — einmalig gegenprüfen, dass initiale Findings korrekt triagiert werden, nicht blind allowlistet).

### L2 — CI-Caching zwischen Läufen

- **Ziel:** Die in §2 #9 benannte Lücke schließen — Laufzeit reduzieren, schnelleres Feedback.
- **Schritte:** `setup-node`s `cache: npm` ist bereits aktiv — zusätzlich prüfen, ob ein Docker-Layer-Cache für das `supabase start`-Image via `actions/cache` (Muster: offizielle Docker-Buildx-Cache-Action oder `actions/cache` auf den Docker-Layer-Pfad) sinnvoll und mit der Ephemeral-Stack-Philosophie vereinbar ist, ohne die Isolationsgarantie zwischen Läufen zu verwässern (z. B. Cache nur für das unveränderliche Supabase-CLI-Docker-Image selbst, nicht für Datenbank-Zustand).
- **Verifizierung:** Workflow-Laufzeit vor/nach Vergleich (mehrere Läufe), Isolationsgarantie bleibt erhalten (jeder Lauf startet weiterhin mit einer frischen, leeren DB).
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein (reine Performance-Optimierung, keine Verhaltensänderung).

### L3 — Ephemeral-Stack-Isolation empirisch verifizieren

- **Ziel:** Die in §2-Kontext (Runde-1-Optimierungspunkt #4) benannte Lücke schließen — Konzurrenzschutz nicht nur aus dem YAML lesen, sondern real testen.
- **Schritte:** Zwei `workflow_dispatch`-Läufe kurz hintereinander auslösen (oder einen `workflow_dispatch` während eines laufenden Push-getriggerten Laufs), verifizieren, dass `cancel-in-progress: true` den älteren Lauf tatsächlich abbricht, statt dass beide um dieselben lokalen Ports konkurrieren.
- **Verifizierung:** `gh run list` zeigt einen abgebrochenen (cancelled) und einen erfolgreichen Lauf, kein Port-Konflikt-Fehler in den Logs.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — Branch-Protection-Dokumentation gegen echten Zustand verifizieren

- **Ziel:** Sicherstellen, dass die dokumentierte Aussage „Branch Protection aktiv und durchgesetzt" (`docs/archive/00-09-CICD.md`) weiterhin zutrifft, nicht nur historisch war.
- **Schritte:** Per `gh api repos/{owner}/{repo}/branches/main/protection` (lesend, kein Schreibzugriff) den tatsächlichen Zustand abfragen — welche Checks sind als „required" markiert? Sind `quality-ci`, `security-staging`, ggf. das neue `codeql` (nach L1) darunter? Abgleich gegen die Doku, Korrektur bei Abweichung.
- **Verifizierung:** Dokumentation in `docs/security-hardening/08_security_ci_gates.md` zeigt den frisch verifizierten, echten Stand mit Zeitstempel.
- **Freigabe-Gate:** Keines (reine lesende Verifikation + Doku-Sync). **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Alerting-Entscheidungsgrundlage dokumentieren

- **Ziel:** Jans künftige K5-Entscheidung (welcher Alert-Kanal) beschleunigen, ohne sie vorwegzunehmen.
- **Schritte:** In `docs/security-hardening/08_security_ci_gates.md` einen Abschnitt ergänzen, der die Optionen vergleicht: GitHub-native E-Mail-Benachrichtigung bei rotem `main`-Lauf (kein neues Secret, aber leicht zu übersehen), Telegram-Bot (Muster: bereits existierendes `fraudAlertWait`/Telegram-Webhook-Pattern im Repo, `src/trigger/fraud-alert-wait.ts` als Referenz), Slack-Webhook. Für jede Option: Aufwand, benötigtes Secret, Wartungslast.
- **Verifizierung:** Dokumentation liest sich als vollständige Entscheidungsgrundlage.
- **Freigabe-Gate:** Keines (reine Doku). **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Ein CodeQL-Gate läuft regelmäßig gegen den JS/TS-Code, Ergebnisse sind sichtbar und triagiert (L1).
2. Die CI-Laufzeit ist messbar reduziert, ohne die Ephemeral-Stack-Isolationsgarantie zu verwässern (L2).
3. Die Concurrency-Isolation ist empirisch bestätigt, nicht nur aus dem YAML behauptet (L3).
4. Die dokumentierte Branch-Protection-Konfiguration stimmt mit dem echten GitHub-Zustand überein (L4).
5. Jans künftige Alerting-Entscheidung ist vollständig informiert vorbereitet (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur die beiden Security-CI-Gates (Staging-Regression, Red-Team) + neues SAST-Gate, nicht Dependency-Audit (Säule 7) oder Secret-Scanning (Säule 8).
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit — L1 nutzt nur `GITHUB_TOKEN`, kein neues Secret; externes Alerting bleibt bewusst K5.
- [x] Recherche direkt durch `Read`/`Grep` fundiert (Datei-/Zeilenreferenzen in §3), da `casino-code-explorer` diese Aufgabe als außerhalb seines Scopes ablehnte — transparent dokumentiert, nicht verschwiegen.
- [x] Ehrlichkeits-Check: Baseline dieser Runde (Top 22 %) ist schlechter als der Runde-1-Endwert (Top 16 %) — durch einen echten, zuvor komplett unbewerteten Fund (#8 SAST) erklärt, nicht beschönigt. Zwei der fünf Runde-1-„Optimierungspunkte" sind bereits gelöst — als solche benannt, nicht neu als Leistung verkauft.
- [x] Money-Pfad korrekt „Nein" — reine CI-Infrastruktur.
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie              | Baseline | Nach Ausführung | Warum                                                                |
| :-: | ------------------------- | :------: | :-------------: | -------------------------------------------------------------------- |
|  1  | Ephemerer Stack           | Top 10 % |    Top 10 %     | unverändert                                                          |
|  2  | Concurrency-Schutz        | Top 10 % |    Top 10 %     | unverändert (L3 bestätigt nur empirisch)                             |
|  3  | SHA-Pinning               | Top 10 % |    Top 10 %     | unverändert                                                          |
|  4  | `paths:`-Filter           | Top 10 % |    Top 10 %     | unverändert                                                          |
|  5  | Job-Summary               | Top 10 % |    Top 10 %     | unverändert                                                          |
|  6  | Fail-Closed               | Top 10 % |    Top 10 %     | unverändert                                                          |
|  7  | Trigger-Abdeckung         | Top 15 % |    Top 15 %     | unverändert                                                          |
|  8  | SAST/CodeQL               | Top 60 % |    Top 15 %     | L1                                                                   |
|  9  | CI-Caching                | Top 40 % |    Top 15 %     | L2                                                                   |
| 10  | Externes Failure-Alerting | Top 45 % |    Top 40 %     | L5 — reduziert Unsicherheit, löst Aktivierung selbst aber nicht (K5) |

**Projizierter Schnitt nach Ausführung:** (10+10+10+10+10+10+15+15+15+40)/10 = **Top 14,5 %** (gerundet **Top 15 %**).

**Ehrliche Einordnung:** Das externe Failure-Alerting (#10) bleibt der einzige Punkt, der eine echte Top-10-%-Annäherung verhindert — bewusst K5, kein Planungsfehler. Sobald Jan sich für einen Alert-Kanal entscheidet (per L5 vorbereitet), fällt #10 deutlich und der Gesamtschnitt landet klar unter Top 10 %.

---

## 8 — Verwandte Artefakte

| Bedarf                                                 | Datei                                                                                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei                      | [`docs/archive/t_security_hardening_02_security_ci_gate.md`](../../../../docs/archive/t_security_hardening_02_security_ci_gate.md) |
| Staging-Regression-Gate (L2: Image-Cache ergänzt)      | [`.github/workflows/security-staging.yml`](../../../../.github/workflows/security-staging.yml)                                     |
| Red-Team-Gate (L2: Image-Cache ergänzt, Setup-Bereich) | [`.github/workflows/red-team-security.yml`](../../../../.github/workflows/red-team-security.yml)                                   |
| Quality-Gate (Vergleichsreferenz)                      | [`.github/workflows/quality-ci.yml`](../../../../.github/workflows/quality-ci.yml)                                                 |
| Referenzmuster für externes Alerting (L5)              | [`src/trigger/fraud-alert-wait.ts`](../../../../src/trigger/fraud-alert-wait.ts)                                                   |
| Referenzmuster für L1 (SHA-Pinning-Konvention)         | [`.github/workflows/dependency-audit.yml`](../../../../.github/workflows/dependency-audit.yml)                                     |
| Technischer Deep-Dive (wird in L4/L5 erweitert)        | [`docs/security-hardening/08_security_ci_gates.md`](../../../../docs/security-hardening/08_security_ci_gates.md)                   |
| Übersicht (alle 10 Säulen)                             | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                     |

---

## 9 — Ausführungsergebnis (2026-09-12, Worktree `hardening-ci-gate`)

### 9.1 — Zentrale Abweichung des Plans vom committeten Ist-Stand (wichtigste Erkenntnis dieser Ausführung)

Die Verifizierung jeder Datei:Zeile-Referenz aus §3 gegen den **committeten Basis-Commit 8863b64** ergab: **§2 #2 und §3 beschreiben nicht den Commit-Stand, sondern den uncommitteten Working-Tree des Haupt-Repos.** Im Basis-Commit gilt:

| Plan-Referenz (§3)                                                                        | Behauptet                      | Real in 8863b64                                                                                                                                                                                                            |
| :---------------------------------------------------------------------------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `security-staging.yml` — Concurrency-Block „Zeilen 34-39"                                 | vorhanden, Top 10 % (#2)       | **nicht vorhanden** — 8863b64 hat keinen `concurrency:`-Block; Datei 97 Zeilen (nicht 105); Job-Summary 86-97, SHA-Pins 40-41                                                                                              |
| `red-team-security.yml` — Concurrency „Zeilen 30-35" + Schedule `'0 4 * * 0'` + 6 Skripte | vorhanden, Top 10 % / Top 15 % | **nicht vorhanden** — nur `workflow_dispatch`, kein `schedule`, kein `concurrency`, 92 Zeilen, nur 3 Skripte (`target-guard`, `rate-limit-bypass`, `admin-idor`); `bot-bypass`/`crash-mp-bypass`/`admin-fraud-idor` fehlen |
| Beide Dateien 105/113 Zeilen                                                              | „vollständig gelesen"          | stimmt nur für die **uncommitteten** Haupt-Repo-Versionen (104/112 Zeilen — dort existieren Concurrency + Schedule + 6 Skripte)                                                                                            |

**Konsequenz:** Die Concurrency-Blöcke, der Red-Team-Wochenplan und 3 der 6 Red-Team-Skripte existieren in diesem Branch **nicht** — sie liegen nur als uncommittete Änderungen im Haupt-Repo (`V:\VibeCoding\Casino`, Stand 2026-09-12, `git status`: `M .github/workflows/red-team-security.yml`, `M .github/workflows/security-staging.yml`). Die Planung hatte diese Versionen gelesen (plausibel: Planning-Session lief im Haupt-Repo-Working-Tree), ohne zu prüfen, ob sie committet sind. **Bewusst NICHT kompensiert:** dieser Branch fügt die Concurrency-Blöcke/Skripte nicht selbst hinzu — das wäre (a) außerhalb des Plan-Scopes (L3 ist ausdrücklich „kein Code-Änderung") und (b) ein Merge-Konflikt-Risiko mit genau diesen Pend-Änderungen sowie der Säule-4-Erweiterung von `red-team-security.yml` in parallelen Branches. **Rest bei Jan:** die uncommitteten Workflow-Änderungen im Haupt-Repo committen (oder verwerfen) — sonst verliert ein Merge dieser Runde die in §2 als „Top 10 %" bewerteten Concurrency-Blöcke vollständig und L3 bleibt dauerhaft unverifizierbar.

**Auswirkung auf die Niveau-Projektion (§7):** #2 (Concurrency) ist in diesem Commit-Stand real **nicht Top 10 %**, sondern ungeschützt. Nach Commit der Pend-Änderungen gilt die §7-Projektion wie geplant; solange nicht, ist der reale Schnitt schlechter als „Top 15 %" — die Baseline-Korrektur #2 (Top 10 % → ungeschützt, ~Top 60 %) verschiebt den Schnitt um ~+5 Prozentpunkte. Kein Planungsfehler in §7, aber die Verifikation hat die Projektion an die Bedingung „Pend-Änderungen werden committet" gebunden.

### 9.2 — Meilenstein-Ergebnisse

|  L  | Ergebnis                                                                                                                                                                                                                                                                                                                                                                                                 | Verifikation (lokal)                                                                                                                                                          | Verifikation (remote ausstehend)                                                                                                          |
| :-: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | `.github/workflows/codeql.yml` angelegt — `javascript-typescript`, Build-Mode `none`, Trigger `push`/`pull_request` auf `main` + Sonntags-Schedule 05:00 UTC, Job-Concurrency `cancel-in-progress: true`, nur `contents: read` + `security-events: write`, kein Secret                                                                                                                                   | YAML geparst (`yaml`-Parser: 3 Jobs/Steps ok); beide SHAs **live über GitHub-API aufgelöst** (`checkout v4.4.0`, `codeql-action v4.38.0` → Tag-Objekt → Commit-SHA bestätigt) | Erster Lauf + Finding-Triage (jedes Finding einzeln bewerten, niemals blind allowlisten)                                                  |
| L2  | Identischer Image-Cache-Block in beiden Security-Workflows: `actions/cache` v6.1.0 (SHA live verifiziert) auf `/tmp/supabase-images.tar`, Key `supabase-docker-images-<os>-<supabase-cli 2.116.0>` (Version pro Lauf aus `npx supabase --version`), `docker load` bei Hit, `docker save` bei Miss                                                                                                        | YAML geparst; Änderung **rein additiv im Setup-Bereich** — Red-Team-Probe-Steps unberührt (Säule-4-kompatibel); Isolationsgarantie unangetastet (nur Images, nie DB-Zustand)  | Laufzeit-Vorher/Nachher-Vergleich (`gh run list`)                                                                                         |
| L3  | **Nicht durchführbar** — doppelt blockiert: (a) Concurrency-Blöcke existieren in diesem Branch nicht (siehe 9.1), (b) empirische Verifikation erfordert `workflow_dispatch` auf GitHub                                                                                                                                                                                                                   | Abweichung dokumentiert (9.1)                                                                                                                                                 | Nach Commit der Pend-Änderungen: 2 kurz aufeinanderfolgende Dispatches, `gh run list` zeigt 1× cancelled + 1× success, kein Port-Konflikt |
| L4  | Live-API-Verifikation wiederholt bestätigt: `required_status_checks.contexts = ["quality"]` (app_id 15368), `strict = true`, `enforce_admins = true`, `allow_force_pushes = true` (**neuer Härtungsbefund**), `allow_deletions = false`, Signatures/Linear-History/Conversation-Resolution = `false` — exakt wie in `docs/security-hardening/08_security_ci_gates.md` §8 dokumentiert                    | `gh api repos/ameisw667/Casino/branches/main/protection` (read-only, in dieser Ausführung erneut ausgeführt) — Doku-Aussagen stimmt exakt                                     | —                                                                                                                                         |
| L5  | Entscheidungsgrundlage in `docs/security-hardening/08_security_ci_gates.md` §9 (GitHub-native / Telegram / Slack; **KEINE Aktivierung**, K5 bleibt bei Jan). Korrektur gegenüber der Plan-Prämisse: `TELEGRAM_BOT_TOKEN` existiert bereits (`src/lib/casino/telegram-api.ts`, genutzt von `src/trigger/fraud-alert-wait.ts`) — es fehlt keine Neu-Einrichtung, sondern es fällt die Expositions-Abwägung | Referenzdateien existieren; `sendTelegramMessage`-Muster verifiziert                                                                                                          | —                                                                                                                                         |

### 9.3 — 5-Stufen-Abschlussprüfung

`npm run typecheck` 0 Fehler · `npm test` **1542/1542 grün** (207 Testdateien) — Achtung: weniger als die erwarteten ~1690, weil dieser Branch auf Basis-Commit 8863b64 steht und die Tests der parallelen Säulen-Branches (u. a. Runde-2-Tests) hier noch nicht enthalten sind; **0 Fehlschläge**, kein Test wurde geändert · `npm run lint` 0 Fehler (23 vorbestehende Warnungen, keine in geänderten Dateien) · `npm run build` erfolgreich (nach Kopie des gitignored `.env.local` aus dem Haupt-Repo in den Worktree — prebuild `assert-core-env.ts` braucht die Supabase-Env-Variablen) · `git status --short` zeigt nur die geplanten 5 Dateien.

### 9.4 — Betroffene Dateien

`.github/workflows/codeql.yml` (neu) · `.github/workflows/security-staging.yml` (Image-Cache, additiv) · `.github/workflows/red-team-security.yml` (Image-Cache, additiv im Setup-Bereich) · `docs/security-hardening/08_security_ci_gates.md` (§6-§10 erweitert, L4/L5) · `T_SECURITY_HARDENING/02_security_ci_gate.md` (Status-Header + dieser §9).

### 9.5 — Reste bei Jan

1. **Alerting-Rest (K5):** Alert-Kanal wählen (Entscheidungsgrundlage in `docs/security-hardening/08_security_ci_gates.md` §9) — Telegram ist lowest-effort, aber Weiterverwendung des existierenden `TELEGRAM_BOT_TOKEN` im CI-Secret-Store ist eigener K5-Punkt. Nicht in dieser Runde aktiviert.
2. **Uncommittete Pend-Änderungen im Haupt-Repo committen:** Concurrency-Blöcke + Red-Team-Schedule + 3 Skripte existieren nur uncommittet; ohne diesen Commit bleibt Concurrency (#2) ungeschützt und L3 unmöglich.
3. **Remote-Verifikation nach Push:** erster CodeQL-Lauf + Finding-Triage (L1), Laufzeitvergleich Image-Cache (L2), Concurrency-Empirie (L3, nur nach Rest 2).
4. **K5-Option aus L4-Befund:** `allow_force_pushes` auf `main` ist live `true` — Härtung auf `false` ist eine Write-Aktion und liegt bewusst außerhalb dieses read-only Scopes.
5. **`codeql` als Required-Check?** Aktuell nur `quality` merge-blockend; falls CodeQL PRs blocken soll, muss Jan den Context ergänzen (Write-Aktion, K5).

---

## 9 — Ausführungsergebnis (2026-09-12, Branch `hardening-ci-gate`, Worktree-Basis `8863b64`)

Alle LLM-lokal ausführbaren Teile umgesetzt; **drei Verifikationen sind bewusst remote** (erster CodeQL-Lauf, Laufzeit-Vorher/Nachher, empirische Concurrency) und müssen nach Push durch Jan nachgeholt werden — die Workflow-Dateien sind lokal YAML-geparst (`js-yaml`-Parse aller 3 Dateien OK) und logisch gegen die Repo-Konventionen geprüft.

### 9.1 — Meilensteine

| M   | Umsetzung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Verifiziert                                                                                       |
| :-- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| L1  | `.github/workflows/codeql.yml` neu: `github/codeql-action` `init`+`analyze`, SHA-gepinnt auf `v4.38.0` (`b96794f015dfd88f77b49b1c93e0fa7110f94c63`), Sprache `javascript-typescript`, Build-Mode `none`, Trigger `push`/`pull_request` auf `main` + wöchentlicher `schedule` (Sonntag 05:00 UTC, gestaffelt hinter Red-Team 04:00 UTC) + `concurrency`-Block (Muster `quality-ci.yml`); nur Standard-`GITHUB_TOKEN`, zusätzlich `security-events: write` (zwingend für den SARIF-Upload in den Security-Tab, bewusst nur in diesem Job erweitert) | YAML-Parse OK; erster Lauf + Finding-Triage remote ausstehend                                     |
| L2  | Beide Security-Workflows: `actions/cache` `v6.1.0` (SHA-gepinnt, `55cc8345863c7cc4c66a329aec7e433d2d1c52a9`) auf `/tmp/supabase-images.tar`, Key aus pro Lauf ermittelter Supabase-CLI-Version (`npx supabase --version`) — kein Magic-String, CLI-Bump invalidiert automatisch; `docker load` bei Hit, `docker save` bei Miss; identischer Key in beiden Workflows (Cache ist repo-scoped, nicht workflow-scoped). Isolation bleibt erhalten: nur Images, nie DB-Zustand. `node_modules`-Caching bewusst abgelehnt (Korrektheitsrisiko > Gewinn) | YAML-Parse OK; Laufzeitvergleich remote ausstehend                                                |
| L3  | Keine Code-Änderung (Plan-Scope). **Aber: Abweichung D1 unten** — der Basis-Commit enthält die Concurrency-Blöcke noch nicht                                                                                                                                                                                                                                                                                                                                                                                                                      | Empirische Verifikation remote, erst nach Commit der Blöcke                                       |
| L4  | Live-API `gh api repos/ameisw667/Casino/branches/main/protection` (read-only, erfolgreich): `contexts: ["quality"]`, `strict: true`, `enforce_admins: true`, `allow_deletions: false` — Archiv-Doku (`00-09-CICD.md` M2) **stimmt weiterhin exakt**. **Neuer Befund:** `allow_force_pushes: true` auf `main` (Härtungslücke, Empfehlung dokumentiert, nicht umgesetzt — Write-Action wäre K5). `codeql` ist nicht required (K5-Entscheidung offen)                                                                                                | Live verifiziert 2026-09-12, dokumentiert in `docs/security-hardening/08_security_ci_gates.md` §8 |
| L5  | Alerting-Entscheidungsgrundlage in `docs/security-hardening/08_security_ci_gates.md` §9 (3 Optionen: GitHub-native / Telegram / Slack; Aufwand, Secret, Wartungslast, Risiko je Option). **KEINE Aktivierung**                                                                                                                                                                                                                                                                                                                                    | Doku vollständig; Entscheidung liegt bei Jan (K5)                                                 |

### 9.2 — Abweichungen vom Plan (dokumentiert, nicht verschwiegen)

- **D1 (wichtigste):** Die Datei-/Zeilenreferenzen in §2/§3 (Concurrency-Blöcke `security-staging.yml:34-39`, `red-team-security.yml:30-35`; 105 bzw. 113 Zeilen) beschreiben den **uncommitteten** Stand des Hauptverzeichnisses, nicht den Worktree-Basis-Commit `8863b64`. Im Commit sind die Workflows 97 bzw. 92 Zeilen und **ohne** Concurrency-Block; die Blöcke existieren nur als uncommittete Änderung (Referenz `06_7 L1 (R4)` in deren Kommentaren). Konsequenz: L3 ist erst nach Commit/Push dieser Blöcke verifizierbar. Der Scope dieses Plans wurde **nicht** erweitert, um sie hier zu duplizieren (sie gehören zu einem anderen Plan, Misch-Kommits würden den Merge mit dem parallelen Branch riskieren).
- **D2:** `on.push.paths` liegt im Commit auf Zeilen 21–29 (Plan: 22–29) — Inhalt identisch verifiziert (6 Muster, unverändert).
- **D3 (L5-Prämisse korrigiert):** `TELEGRAM_BOT_TOKEN` **existiert bereits** (`src/lib/casino/telegram-api.ts`, Fraud-Alerts). Die K5-Prämisse „Alerting erfordert ein neues Secret" stimmt für Telegram nur eingeschränkt — fehlt nur eine Ziel-`chat_id`; entscheidungsrelevant ist der zusätzliche Expositions-Surface des App-Secrets im CI-Secret-Store. Entscheidung bleibt bei Jan.
- **D4 (L4-Befund):** Nur `quality` ist ein Required-Check — `security-staging`/`red-team` triggern erst nach Merge auf `main`, können einen PR strukturell nicht blocken (korrekt dokumentiert); `allow_force_pushes: true` ist neu gefunden und nicht behoben (read-only Scope).
- **D5 (L2-Umfang):** `npm ci` selbst bekommt kein `node_modules`-Caching; `setup-node`'s `cache: npm` war bereits aktiv. Der neue Cache deckt das im Plan benannte Docker-Image-Volumen ab.

### 9.3 — Betroffene Dateien

Neu: `.github/workflows/codeql.yml` · Geändert: `.github/workflows/security-staging.yml`, `.github/workflows/red-team-security.yml` (nur additiver Setup-Bereich; Red-Team-Probe-Schritte unberührt), `docs/security-hardening/08_security_ci_gates.md` (§6–§10), `T_SECURITY_HARDENING/02_security_ci_gate.md` (Status + §9).

### 9.4 — 5-Stufen-Abschlussprüfung

`npm run typecheck` 0 Fehler · `npm test` grün · `npm run lint` 0 Fehler · `npm run build` Exit 0 · `git status --short` nur geplante Dateien. (Exakte Zahlen: siehe Abschlussbericht.)

### 9.5 — Offene Reste

1. **Remote-Verifikation nach Push durch Jan:** erster CodeQL-Lauf inkl. Finding-Triage (L1), Laufzeit-Vorher/Nachher (L2), empirische Concurrency-Verifikation via zwei `workflow_dispatch`-Läufen (L3 — erst nach Commit der Concurrency-Blöcke, siehe D1).
2. **Alerting-Rest bei Jan (K5):** Entscheidung GitHub-native vs. Telegram vs. Slack auf Basis von §9 der Doku — Telegram wäre ohne neues Token machbar (nur `chat_id`).
3. **Neuer Härtungsbefund (K5):** `allow_force_pushes: true` auf `main` — Empfehlung in der Doku, Umsetzung bewusst nicht Teil dieses read-only Scopes.
4. **K5-Entscheidung (optional):** `codeql` als Required-Check ergänzen, falls es merge-blocken soll.
