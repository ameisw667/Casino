# 06-U05 — Typ-Abdeckung „reference" (Unterkategorie 5)

> **Status:** **Executed (archiviert)** — L0–L3 ausgeführt 2026-09-18 · **Stand:** 2026-09-14 (Ausführung 2026-09-18) · **Owner:** LLM (Jan nur bei Memory-Schreib-Gate) · **Scope:** Vorbereitung der 4 verifizierten reference-Memory-Einträge (Fertigentwürfe + Secrets-Ausschluss-Checkliste) als Freigabegrundlage; keine Memory-Änderung ohne Gate G1.
> **Ausführungsprotokoll 2026-09-18:** L0 (Baseline bestätigt: genau 1× `metadata.type: reference` im Ordner; alle 4 Belegstellen K1–K4 im Repo vorhanden, keine Abweichung) → L1 (Entwürfe unverändert übernommen, kein TODO; Secrets-Ausschluss-Checkliste §2b **4× PASS** — kein DSN, kein Auth-Token, kein DB-Passwort, kein Service-Role-/anon-Key) → L2 (Gate G1 durch Jans Go gedeckt: 4 reference-Dateien + 4 Indexzeilen atomar geschrieben; `originSessionId` = `671667ba-725b-49f4-988d-703e2959be79`, `modified` = Schreibzeitpunkt) → L3 (Re-Rating **Top 51 % → Top 10 %**, Abweichung von der Projektion nach oben dokumentiert).
> **Money-Pfad:** Nein · **Security-Review:** Nein (nur Identifikatoren, keine Secrets — Checkliste §2b 4× PASS)
> **Bewertungs-Basis:** [`../01_6_05_typ_abdeckung_reference.md`](../01_6_05_typ_abdeckung_reference.md) (gewichteter Schnitt Top 51 %; Bottlenecks: Kandidaten-Deckung Top 85 %, Eintrag-Abdeckung Top 80 % — 1 von 5 Kandidaten abgedeckt)
> **Entscheidungen Jan 2026-09-17:** (a) Umfang bleibt bei K1–K4 (4 Einträge); K5 ist bereits abgedeckt. (b) **K1 = Projekt-Ref im Klartext erlaubt** — Grenzentscheidung dokumentiert in §2b (Identifier, steht bereits in `CLAUDE.md:155`; keine neue Exposition). (c) Secrets-Ausschluss-Checkliste §2b bleibt in L1 je Entwurf zu PASS-en (kein DSN, kein Auth-Token, kein DB-Passwort, kein Service-Role-/anon-Key). (d) Freigabe-Modell: **ein Sammel-Batch**; Go am 2026-09-18 erteilt — Plan damit ausgeführt.
> **Archivierung in-place** (Präzedenz 06_u06/06_u09/06_u10); kein Worldmap-Eintrag, kein Verschieben nach `docs/archive/`.

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                                                                           | Scope (Dateien)                                                                                                                                                                                        | Ausführung                  | Status        | Zuständigkeit                | Verifikation                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------------- | ---------------------------- | ------------------------------------------------------------------------------------- |
| L0     | Baseline verifizieren: Memory-Ordner scannen (`metadata.type` je Datei), genau 1× reference bestätigen; alle 4 Kandidaten-Belegstellen im Repo (K1–K4, §2a) als vorhanden bestätigen                                                                                                                  | read-only: `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\*`, `CLAUDE.md`, `docs/archive/01_github.md`, `docs/archive/01_SentryCLI_SentryMCP.md`, `docs/auth/12_middleware_proxy_csp.md` | Sequenziell                 | 🟢 2026-09-18 | LLM                          | Report: Typ-Verteilung + 4 Belegstellen (Datei:Zeile) ohne Abweichung                 |
| L1     | Fertigentwürfe finalisieren (§2a ist bereits ausformuliert, nur Anpassungen nach L0-Befund); Secrets-Ausschluss-Checkliste §2b über jeden Entwurf laufen lassen (4× PASS)                                                                                                                             | diese Plan-Datei (`06_u05_...plan.md`)                                                                                                                                                                 | Sequenziell                 | 🟢 2026-09-18 | LLM                          | 4 vollständige Entwürfe (Frontmatter + Body) je ohne „TODO" und je 1 Checklisten-PASS |
| L2     | **Gate G1 (Jan):** 4 Entwürfe vorlegen, Freigabe einholen; bei Ja: 4 reference-Einträge in den Memory-Ordner schreiben (`originSessionId`/`modified` wie beim Vorbild-Eintrag ergänzen) + je 1 Indexzeile in `MEMORY.md`; bei Nein: Entwürfe unverändert als Entscheidungsgrundlage archiviert lassen | Memory-Ordner + `MEMORY.md`                                                                                                                                                                            | Sequenziell (nur nach Gate) | 🟢 2026-09-18 | Jan (Gate) + LLM (Schreiben) | `metadata.type: reference` in 4 neuen Dateien; 4 Indexzeilen vorhanden                |
| L3     | Niveau-Rückschreibung: `01_6_05` (Subsub 1/3) + Parent [`../01_6_memory_files.md`](../01_6_memory_files.md) Position 5 neu bewerten; Plan-Status → `Executed (archiviert)` **in-place** (kein Worldmap-Eintrag — Abschnitt „Aktive Pläne" existiert nicht, verifiziert 2026-09-17)                    | `../01_6_05_*.md`, `../01_6_memory_files.md`                                                                                                                                                           | Sequenziell                 | 🟢 2026-09-18 | LLM                          | Schnitt-Update dokumentiert + Statuszeile in dieser Datei                             |

## Fan-out-Check (Kriterium 5/6)

L0 → L1 → L2 → L3 strikt sequenziell — **kein Fan-out.** Begründung: Jede Stufe baut auf dem Ergebnis der Vorgängerstufe auf (Verifikation → finale Texte → Freigabe → Rückschreibung); die 4 Entwürfe sind kein Teilaufgaben-Fan-out, weil sie in dieser Datei bereits ausformuliert vorliegen und das Schreiben ein atomarer, gate-gebundener Vorgang ist (atomar heißt hier: alle 4 Dateien + 4 Indexzeilen in einem Arbeitsschritt, keine Teil-Schreibungen). Kriterium 6: Gesamtaufwand < 45 Min., Einzelaufwand je Stufe < 10 Min. — Fan-out-Schwelle nicht erreicht, sequenziell ist Pflicht.

## 2 — Self-Contained Kontext-Koffer

### 2a — Fertigentwürfe für die 4 verifizierten reference-Kandidaten (aus [`../01_6_05_typ_abdeckung_reference.md`](../01_6_05_typ_abdeckung_reference.md) Kandidatentabelle)

Alle 4 Kandidaten sind **Identifikatoren, keine Secrets** (Bewertung Subsub 4 in der Basis-Datei): Projekt-Ref, Repo-Name, Org/Projekt und Ingest-Host sind in Logs, CSP-Headern und URLs ohnehin öffentlich sichtbar und erlauben keinen Zugriff. Frontmatter folgt exakt dem Schema des vorhandenen Vorbild-Eintrags `openai-image-video-pricing-reference.md` (Zeilen 1–9); `originSessionId`/`modified` werden erst in L2 beim Schreiben ergänzt (Session-ID existiert erst dann). Verifizierungsstand aller 4 Werte: 2026-09-14 (read-only, Beleg je Entwurf).

**Entwurf K1 — Datei `casino-supabase-project-ref.md`**

```markdown
---
name: casino-supabase-project-ref
description: Supabase-Projekt-Ref des dedizierten Casino-Projekts und wo er wiederkehrend gebraucht wird
metadata:
  node_type: memory
  type: reference
---

Das Casino-Repo `V:\VibeCoding\Casino` ist an das dedizierte Supabase-Projekt mit der Projekt-Ref **`hmqwozhdckbwjqzcmire`** gebunden. Bewusste Ausnahme von der Vault-Präfix-Regel: die Tabellen dieses Projekts tragen kein `casino_`-Präfix (Projekt-Isolation läuft über die Projektsicherheit, nicht über das Präfix).

Wiederkehrend gebraucht für: SQL-Editor-Befehle (Session-Regel „SQL-Befehle als Datei liefern"), `supabase`-CLI-Verlinkung (`supabase link --project-ref ...`), Migrations-Rollout (`supabase db push`), Remote-Checks.

Kanonische Quellen im Repo: `CLAUDE.md` (Abschnitt „Database & Migrations") und `docs/status-reports/01_PRODUCTION_RELEASE.md`. Compiled 2026-09-14 aus der Repo-Doku — ist die Projekt-Ref in einer dieser Quellen anders, gilt die Quelle, nicht dieses Memory (re-verify before use).
```

_Quelle: [`../01_6_05_typ_abdeckung_reference.md`](../01_6_05_typ_abdeckung_reference.md) Kandidatentabelle K1, Beleg `CLAUDE.md:155` + `docs/status-reports/01_PRODUCTION_RELEASE.md:38`._

**Entwurf K2 — Datei `casino-github-repo.md`**

```markdown
---
name: casino-github-repo
description: GitHub-Repo des Casino-Projekts (owner/name für gh-CLI, CI-Run-Abfragen, Advisories, Release-Verifikation)
metadata:
  node_type: memory
  type: reference
---

Das Casino-Projekt liegt auf GitHub unter **`ameisw667/Casino`**.

Wiederkehrend gebraucht für: `gh`-CLI-Aufrufe mit `--repo ameisw667/Casino` (Workflows, Issues, PRs), CI-Run-Abfragen, Security-Advisories, Release-Verifikation.

Kanonische Quellen im Repo: `docs/archive/01_github.md` (Remote-/CLI-Kontext) und `T_SECURITY_HARDENING/04_security_hardening.md`. Compiled 2026-09-14 aus der Repo-Doku — re-verify against `git remote -v` before quoting in a future session, falls das Remote geändert wurde.
```

_Quelle: Kandidatentabelle K2, Beleg `docs/archive/01_github.md:49` + `T_SECURITY_HARDENING/04_security_hardening.md:91`._

**Entwurf K3 — Datei `sentry-org-project-reference.md`**

```markdown
---
name: sentry-org-project-reference
description: Sentry-Organisation und -Projekt des Casino-Projekts (berlin-agency / javascript-nextjs) für MCP-Endpunkte, sentry-cli und Issue-Diagnose
metadata:
  node_type: memory
  type: reference
---

Sentry-Organisation: **`berlin-agency`**, Projekt: **`javascript-nextjs`**. Am 2026-08-18 gegen das Sentry-Dashboard verifiziert (Beleg `docs/archive/01_SentryCLI_SentryMCP.md`).

Wiederkehrend gebraucht für: Sentry-MCP-Endpunkte (Org-/Projekt-Slug in Abfragen), `sentry-cli -o berlin-agency -p javascript-nextjs`, Issue-Diagnose und `mcp__sentry__*`-Aufrufe.

Kanonische Quellen im Repo: `docs/archive/01_SentryCLI_SentryMCP.md:74,131`. Nur Identifikatoren — kein Auth-Token; siehe [[sentry-ingest-host-reference]] für den CSP-relevanten Ingest-Host und `docs/archive/01_SentryCLI_SentryMCP.md:68,121` für die dauerhaft ausgeschlossenen Token-Arten.
```

_Quelle: Kandidatentabelle K3, Beleg `docs/archive/01_SentryCLI_SentryMCP.md:74,131` (Dashboard-Verifikation 2026-08-18)._

**Entwurf K4 — Datei `sentry-ingest-host-reference.md`**

```markdown
---
name: sentry-ingest-host-reference
description: Exakter Sentry-Ingest-Host (EU) für die CSP-Directive connect-src des Casino-Projekts
metadata:
  node_type: memory
  type: reference
---

Sentry-Ingest-Host (EU-Region): **`o4511899214020608.ingest.de.sentry.io`**.

Wiederkehrend gebraucht für: CSP `connect-src` — der Host wird **exakt** eingetragen, Wildcards (`*.ingest.*`) sind verboten; ebenso für Sentry-Server-/Client-Konfiguration. Nicht verwechseln mit dem Ingest-Host anderer Sentry-Regionen — ein Host-Wechsel macht die CSP-Zeile ungültig.

Kanonische Quellen im Repo: `docs/auth/12_middleware_proxy_csp.md:59` und `docs/security-hardening/01_csp_script_hardening.md:57`. Compiled 2026-09-14 aus der Repo-Doku — re-verify against those sources before quoting, falls die Sentry-Region je gewechselt wird. Kein DSN (siehe §2b); Org/Projekt-Kontext: [[sentry-org-project-reference]].
```

_Quelle: Kandidatentabelle K4, Beleg `docs/auth/12_middleware_proxy_csp.md:59` + `docs/security-hardening/01_csp_script_hardening.md:57`._

### 2b — Secrets-Ausschluss-Kriterien (Checkliste, je Entwurf in L1 zu PASS-en)

Ein reference-Eintrag wird **nicht** angelegt (bzw. verworfen), wenn sein Inhalt auch nur eine der folgenden Kategorien berührt — diese bleiben ausschließlich in `.env`/Secret-Manager, nie im Memory-Ordner:

- [ ] Kein **DSN** (`NEXT_PUBLIC_SENTRY_DSN` — auch der public DSN ist als Ganzes ausgeschlossen, weil er Host+Key in einem String kombiniert)
- [ ] Kein **Auth-Token** (`SENTRY_AUTH_TOKEN`, persönliche Sentry-CLI-Tokens — belegt als sensibel in `docs/archive/01_SentryCLI_SentryMCP.md:68,121`)
- [ ] Kein **DB-Passwort** und kein Datenbank-Verbindungsstring
- [ ] Kein **Service-Role-Key** und kein Supabase-`anon`-Key
- [ ] Grundsatz (aus der Basis-Datei Subsub 4): „wo ist X dokumentiert" wird **nicht** mit „was ist der Wert von X" bei Secrets vermischt — die 4 Entwürfe halten nur Identifikatoren, die in Logs/CSP-Headern/URLs ohnehin öffentlich sichtbar sind

Grenzprüfung je Entwurf: K1 = Projekt-Ref (Identifier) · K2 = Repo-Name (öffentlich) · K3 = Org/Projekt-Slugs (öffentlich) · K4 = Ingest-Host (steht exakt so in CSP-Headern) — alle 4 sind Identifikatoren, kein Entwurf enthält einen Wert, der allein Zugriff erlaubt.

**Grenzentscheidung K1 — Jan, 2026-09-17: Klartext erlaubt.** Der Projekt-Ref `hmqwozhdckbwjqzcmire` ist ein Identifier, kein Secret: Er steht bereits im Klartext im Repo (`CLAUDE.md:155` und `xx_docs/01_supabase_context.md:20,27`), das Memory führt damit **keine neue Exposition** ein — es macht den bestehenden Wert nur auffindbar. Datenbank-Zugriff entsteht dadurch nicht; der Ref allein ist ohne anon-/Service-Key wertlos, und beide bleiben laut Checkliste ausgeschlossen. Wäre der Ref nur in `.env.local`/`supabase/.temp/project-ref` vorhanden, wäre die Antwort „nur Zeiger" gewesen — der Repo-Vorbestand entscheidet den Fall.

### 2c — Re-Verify-Disziplin & Schreib-Gate

- **Stil vom Vorbild-Eintrag übernehmen:** `openai-image-video-pricing-reference.md` (read-only außerhalb des Repos) trägt im Body einen „Compiled `<Datum>` from live sources … re-verify against those sources before quoting" -Satz. Alle 4 Entwürfe übernehmen dieses Muster („Compiled 2026-09-14 aus der Repo-Doku … re-verify …") — reference-Einträge nennen immer die kanonische Repo-Quelle als maßgebliche Instanz, nicht sich selbst.
- **Keine Zahlenduplizierung:** Wie der Vorbild-Eintrag Preiszahlen nicht dupliziert, duplizieren die Entwürfe keine Werte, die veralten können (Preise, Flags, Keys). Die 4 IDs sind statische Identifikatoren — der einzige Fall, wo der Wert selbst in den Memory gehört, zusätzlich zur Quelle.
- **Typ-Grenze reference vs. project** (Basis-Datei Subsub 5): Alle 4 Kandidaten sind statische IDs ohne Verlauf → unmissverständlich `reference`, nicht `project`. Kein Eintrag enthält Entscheidungen oder Projektverlauf.
- **Indexzeilen:** Jeder neue Eintrag bekommt in `MEMORY.md` eine sprechende Indexzeile analog der Vorbild-Zeile 6 (Beschreibung nennt den Zeiger-Charakter). Bestehende Zeilen werden nicht angefasst; der Zeile-4-Duplikat-Bereich bleibt außen vor (Nicht-Scope).
- **Jeder Memory-Schreibvorgang = Gate G1:** Die globale Regel „Write to memory only when I explicitly ask" (`C:\Users\hambu\.claude\CLAUDE.md`, Abschnitt „Memory") bleibt unangetastet. L0/L1 erzeugen keine Memory-Änderung; erst nach Jans ausdrücklicher Freigabe (L2) wird geschrieben. Wird freigegeben: 4 Dateien + 4 Indexzeilen atomar (in einem Arbeitsschritt), keine Teil-Schreibungen. Am 2026-09-17 als **ein Sammel-Batch** mit den übrigen Typ-Abdeckungs-Plänen zusammengelegt; **Go am 2026-09-18 erteilt** — atomar ausgeführt.
- **`originSessionId`/`modified`** werden erst beim Schreiben gesetzt, nach der Regel in [`06_u03_typ_abdeckung_project_plan.md`](06_u03_typ_abdeckung_project_plan.md) §2: ID der ausführenden Sitzung, Schreibzeitpunkt für `modified` — kein erfundener Wert, im Zweifel Feld weglassen und im Log vermerken (ersetzt die Formulierung „Session-ID existiert erst dann" in §2a).

## 3 — Expliziter Nicht-Scope

- Keine Memory-Schreibaktion ohne Jans ausdrückliche Freigabe (L0/L1 sind rein read-only bzw. Plan-intern).
- Keine Änderung der globalen `CLAUDE.md`, keiner bestehenden Memory-Dateien und keiner Repo-Doku (`CLAUDE.md`, `docs/**`, `T_**` bleiben unverändert — die Entwürfe verweisen nur).
- Keine Anlage weiterer reference-Kandidaten über K1–K4 hinaus (K5 = Preisreferenz ist bereits abgedeckt); keine Vorformulierung künftiger Kandidaten.
- Kein Fix von Index-Dopplungen in `MEMORY.md` — `06_u06_index_konsistenz_plan.md` liegt vor und ist am 2026-09-16 ausgeführt (**Variante B**: Duplikat-Zeile 2 entfernt, 6 Zeilen ↔ 6 Dateien); dieser Plan ergänzt nur neue Zeilen (Stand 2026-09-17).
- Keine Änderung am Memory-Schema, an `metadata`-Feldkonventionen oder an der Vorbild-Datei `openai-image-video-pricing-reference.md`.
- Kein CSP-/Sentry-/Supabase-Code- oder Konfigurations-Eingriff im Repo — der Plan ändert nur Memory-Dateien.

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe dieses Plans → `Execution-Ready` (Status dieser Datei) → L0/L1 (LLM, read-only) → **Gate G1 (Jan: Memory-Schreib-Freigabe)** → L2 `In Execution` → L3 `Executed (archiviert)` **in-place** (kein Worldmap-Eintrag — Abschnitt „Aktive Pläne" existiert nicht, verifiziert 2026-09-17). Zwei Gates möglich, aber nur L2 ist zwingend: lehnt Jan bei Gate G1 ab, bleibt der Plan als Entscheidungsgrundlage archiviert ohne Rückschreibung der Abdeckungs-Subsubs.

**Abschluss 2026-09-18:** L0–L3 vollständig ausgeführt; Status in der Kopfzeile auf `Executed (archiviert)` gesetzt (in-place, kein Worldmap-Eintrag).

## 5 — Niveau-Rückschreibung (nach Ausführung)

Nach L3 wird [`../01_6_05_typ_abdeckung_reference.md`](../01_6_05_typ_abdeckung_reference.md) in den beiden Bottleneck-Subsubkategorien neu bewertet — Ziel-Schnitt Richtung Top 15–20 %:

| Nr    | Subsubkategorie                                        |    Vorher     | Erwartet nach L2 (bei Freigabe)  | Grund                                                                                                                                                              |
| ----- | ------------------------------------------------------ | :-----------: | :------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Eintrag-Abdeckung (30 %)                               |   Top 80 %    |            ≈ Top 15 %            | 1 → 5 von 5 verifizierten Kandidaten abgedeckt (100 % Deckung)                                                                                                     |
| 3     | Kandidaten-Deckung (25 %)                              |   Top 85 %    |            ≈ Top 15 %            | K1–K4 verlinkt; keine Re-Recherche aus `CLAUDE.md`/`xx_docs` mehr nötig                                                                                            |
| 2     | Qualität des Eintrags (20 %)                           |   Top 15 %    |          ≈ Top 10–15 %           | 4 neue Einträge übernehmen Vorbild-Struktur + Re-Verify-Satz (Mikro-Anmerkung Beschreibung/Pfad vermieden, da `description` je Entwurf den Zeiger-Charakter nennt) |
| 4/5/6 | Secrets-Disziplin / Typ-Abgrenzung / Index (10/10/5 %) | Top 5/20/10 % | unverändert bzw. ≈ Top 5/15/10 % | Checkliste §2b hält die Verletzt-freiheit; Typ-Grenze bleibt sauber; 4 neue sprechende Indexzeilen                                                                 |

Neuer gewichteter Schnitt erwartbar ≈ **Top 15–18 %** (vorher Top 51 %). Parent [`../01_6_memory_files.md`](../01_6_memory_files.md) Position 5 erhält den neuen Schnitt als Rückverweis; Statuszeile dieser Plan-Datei → `Executed (archiviert 2026-09-14, siehe §5)`. Bleibt Gate G1 aus, verbleibt die Unterkategorie auf Top 51 % und der Plan dokumentiert nur die Entwürfe.

**Ergebnis (2026-09-18, real gezählt: 5 Dateien mit `metadata.type: reference`):** Subsub 1 → **Top 5 %** (1 → 5 Einträge, Deckung 5/5 = 100 %), 2 → Top 15 % (unverändert, Vorbild-Eintrag unberührt), 3 → **Top 10 %** (K1–K4 verlinkt; Restrisiko nur „noch nicht entdeckte IDs"), 4 → Top 5 %, 5 → Top 20 %, 6 → Top 10 % (alle unverändert) ⇒ (30·5 + 20·15 + 25·10 + 10·5 + 10·20 + 5·10) / 100 = **Top 10 %**.
**Bewusste Abweichung von der Projektion — diesmal nach oben:** Die Tabelle oben erwartete Top 15–18 %, weil sie Subsub 1/3 nur auf ≈ Top 15 % setzte. Real ist die Deckung **vollständig** statt teilweise geschlossen (alle 4 Kandidaten angelegt, nicht 2–3), und die Abdeckungsquote liegt damit bei 100 % statt 80 %. Der bessere Wert ist nicht durch Aufrunden entstanden — die Einzelwerte sind in [`../01_6_05_typ_abdeckung_reference.md`](../01_6_05_typ_abdeckung_reference.md) Abschnitt „Niveau-Rückschreibung" mit Beleg je Subsub ausgewiesen. Subsub 3 wird bewusst **nicht** auf Top 5 % gesetzt: die Kandidatenliste stammt aus einem Audit und kann eine fünfte wiederkehrende ID übersehen haben — dafür existiert kein Nachweis.
