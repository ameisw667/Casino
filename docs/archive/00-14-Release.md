# 14.3 — Release- & Versionierungs-Disziplin (Tags, CHANGELOG) — Vertiefungsplan

> **Status:** Executed (archiviert) — M1–M4 vollständig verifiziert, inklusive Commit (`61b16b8`), `v0.2.0`-Tag und echtem GitHub-Actions-Lauf nach Push · **Stand:** 2026-08-29 · **Owner:** LLM · **Scope:** Vertiefung von Unterkategorie **#3 „Release- & Versionierungs-Disziplin"** aus [`00-14-VersionControlDoku.md`](./00-14-VersionControlDoku.md) (dort geführt als **Top 90 %**) in bis zu 10 einzeln bewertete Sub-Unterkategorien, plus vollständig spezifizierter Härtungsplan. Bewusst **nicht** Scope: Branch-Hygiene (#2), Doku-Index/Cross-Referenzen (#7/#8) und Doku-Sync-Automatisierung (#10) — letztere ist eigenständig in [`00-14-DokuSync.md`](./00-14-DokuSync.md) vertieft.
> **Zuständigkeits-Prinzip (identisch zu `00-14-VersionControlDoku.md`):** Jeder Meilenstein unten ist **ausschließlich LLM-Zuständigkeit** — keine Jan-Entscheidung, kein Freigabe-Gate innerhalb dieser Datei. Jede Stelle, an der eine naive erste Fassung noch eine Jan-Rückfrage vorgesehen hätte (SemVer- vs. CalVer-Konvention, ob überhaupt getaggt wird), wurde durch reale Recherche in dieser Planungsphase selbst aufgelöst — Begründung jeweils in der Detailtabelle bzw. im Meilenstein dokumentiert. Der einzige weiterhin geltende Prozessschritt ist die **globale, projektweite Commit-/Push-Freigabe** aus `xx_docs/12_git_commit_push_workflow.md` (kein Commit/Push ohne expliziten Auftrag) — Standard-Mechanismus jeder Session, keine kategoriespezifische Zuständigkeit dieses Plans.
> **Money-Pfad:** Nein · **Security-Review:** Nein für alle Meilensteine (reine Git-Metadaten-, `package.json`- und Markdown-Änderungen; kein Wallet-/Auth-/RNG-Code betroffen). Einzige Nebenbedingung: `CHANGELOG.md`-Einträge dürfen keine Secrets, internen Hostnamen oder sicherheitsrelevanten Implementierungsdetails enthalten, die über das hinausgehen, was ohnehin öffentlich im Repo sichtbar ist — wird in M1/L2 geprüft.
> **Neue Datenklasse/API-Grenze:** Keine — alle Meilensteine sind lokale Datei-Änderungen (`CHANGELOG.md`, `package.json`, `xx_docs/12`, Git-Tags). Der Allowlist/Negativtest/Fallback-Punkt aus der Selbstprüfung (SOP `xx_sop/03`, Abschnitt 4) ist damit nicht anwendbar.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                |                 Status                 | Nächster Schritt                                                                                              | Zuständigkeit |
| ------ | ---------------------------------------------------------- | :------------------------------------: | ------------------------------------------------------------------------------------------------------------- | :-----------: |
| M1     | `CHANGELOG.md` anlegen (rückwirkend befüllt)               | 🟢 Verifiziert ausgeführt (2026-08-29) | `CHANGELOG.md` existiert: 19 Abschnitte, 57 Einträge, 2026-04-24 bis 2026-08-29, gegen `git log` gegengeprüft |      LLM      |
| M2     | SemVer-Baseline + erster echter Git-Tag                    | 🟢 Verifiziert ausgeführt (2026-08-29) | `package.json` ist `0.2.0`; `v0.2.0`-Tag gesetzt auf `61b16b8` und nach `origin/main` gepusht                 |      LLM      |
| M3     | Pflege-Konvention dokumentieren (CHANGELOG + Tags)         | 🟢 Verifiziert ausgeführt (2026-08-29) | Absatz in `xx_docs/12_git_commit_push_workflow.md` ergänzt, wirksam ab sofort                                 |      LLM      |
| M4     | Rollback-Referenzkarte (Version ↔ Tag ↔ Vercel-Deployment) | 🟢 Verifiziert ausgeführt (2026-08-29) | Alle 4 Lookup-Schritte real durchexerziert (Schritt 3 bleibt Jans manueller Vercel-Dashboard-Schritt)         |      LLM      |

Ampel: 🔴 geplant, 🟡 teilweise (Analyse erledigt, Ausführung offen), 🟢 verifiziert ausgeführt.

---

## 2 — Kompaktübersicht der 10 Sub-Unterkategorien (sortiert nach Niveau, bestes zuerst)

| #   | Sub-Unterkategorie                                            | Niveau        | Kernbefund                                                                                                                                                                                       |
| --- | ------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4   | Backfill-Quellenlage (Rohmaterial für rückwirkende Befüllung) | **Top 20 %**  | `docs/archive/00_WORLDMAP_ARCHIVLOG.md` (72 Zeilen) + `00_WORLDMAP_STATUS.md` Abschnitt 2 liefern ~35 datierte, konkrete Einträge (2026-08-09 bis 2026-08-26) — ungewöhnlich starkes Rohmaterial |
| 5   | Deployment→Version-Rückverfolgbarkeit (Vercel)                | **Top 60 %**  | Vercel trackt jeden Deploy 1:1 auf Commit-SHA (verifiziert über `.vercel/project.json`-Kopplung, siehe `00-09-CICD.md`) — technischer Fallback existiert, ist aber nicht menschenlesbar          |
| 9   | Pflege-Konvention dokumentiert                                | **Top 90 %**  | Kein Absatz in `xx_docs/12` oder anderswo, der beschreibt, wann/wie `CHANGELOG.md` oder Tags gepflegt werden                                                                                     |
| 10  | Rollback-Nachvollziehbarkeit über lesbare Version statt Hash  | **Top 90 %**  | Kein Mapping „lesbare Version → Vercel-Deployment" existiert; im Incident-Fall bleibt nur der rohe Commit-Hash                                                                                   |
| 3   | SemVer-Versionsnummern-Pflege (`package.json`)                | **Top 95 %**  | `"version": "0.1.0"` seit dem allerersten Commit (`Initial commit from Create Next App`, 2026-04-24) über 205 Commits/~4 Monate hinweg nie gebumpt — trotz produktivem Wallet-/RNG-Code          |
| 1   | Git-Tags-Nutzung                                              | **Top 100 %** | `git tag -l` → 0 Treffer, gesamtes Repo                                                                                                                                                          |
| 2   | `CHANGELOG.md`-Existenz                                       | **Top 100 %** | Datei existiert nicht (`ls CHANGELOG.md` → No such file)                                                                                                                                         |
| 6   | GitHub-Releases-Nutzung                                       | **Top 100 %** | `gh release list` → 0 Treffer, keine einzige GitHub-Release je erstellt                                                                                                                          |
| 7   | Release-Automatisierung (CI-Integration)                      | **Top 100 %** | 0 Treffer für `tag`/`release`/`changelog` in allen 4 Workflow-Dateien (`quality-ci.yml`, `dependency-audit.yml`, `red-team-security.yml`, `security-staging.yml`) und `dependabot.yml`           |
| 8   | Versions-Sichtbarkeit im Produkt (Client/Footer/About)        | **Top 100 %** | 0 Treffer für `APP_VERSION`/`NEXT_PUBLIC_VERSION`/`process.env.npm_package_version` in `src/` — keine Versionsanzeige irgendwo im UI                                                             |

**Rechnerischer Schnitt über alle 10 Positionen (Ausgangslage, vor Ausführung):** (20+60+90+90+95+100+100+100+100+100)/10 = **Top 85,5 %** — nahe am bisherigen Top-90-%-Headline-Wert aus `00-14-VersionControlDoku.md`, geringfügig präziser durch die feinere Auflösung.

> **Update 2026-08-29 (nach Ausführung M1–M4, inkl. echtem Commit, Tag und Push):** #1 (Git-Tag `v0.2.0` real gesetzt auf `61b16b8` und gepusht — keine Historien-Fälschung, exakt der Commit, der M1–M4 einführt), #2 (CHANGELOG real & befüllt), #3 (Version gebumpt + Policy dokumentiert), #4 (Backfill demonstriert), #5 (alle 4 Lookup-Schritte funktionsfähig), #9 (Pflege-Konvention live dokumentiert), #10 (Lookup-Tabelle vollständig funktionsfähig) sind verbessert. #6/#7/#8 bleiben unverändert, da in M2/L0 bzw. Anhang bewusst zurückgestellt. Neuer rechnerischer Schnitt: (10+10+15+15+20+100+100+100+10+15)/10 = **Top 39,5 %**. Die Headline-Angabe in `00-14-VersionControlDoku.md` wird im selben Schritt wie diese Datei aktualisiert (siehe dortige Update-Notiz).

---

## 3 — Detailtabellen je Sub-Unterkategorie

### 1 — Git-Tags-Nutzung (Top 100 %)

`git tag -l` liefert im gesamten Repository-Verlauf (205 Commits, Start 2026-04-24) keinen einzigen Treffer. Kein `v*`-, kein `release-*`-, kein sonstiges Tag-Schema wurde je verwendet. Bei Continuous Deployment (Vercel deployt automatisch bei jedem `main`-Push, siehe [`00-09-CICD.md`](../../worldmap/00-09-CICD.md)) ist das Fehlen von Tags an sich nicht unüblich — aber es bedeutet, dass „was lief wann in Produktion" ausschließlich über rohe Commit-Hashes rekonstruierbar ist.

### 2 — `CHANGELOG.md`-Existenz (Top 100 %)

`ls CHANGELOG.md` → nicht vorhanden. Keine strukturierte, lesbare Änderungshistorie existiert — trotz eines Projekts mit 205 Commits, 5 vollständig produktiven Casino-Spielen und dutzenden dokumentierten Feature-Rollouts (siehe #4 unten).

### 3 — SemVer-Versionsnummern-Pflege (Top 95 %)

`package.json` Zeile 3 trägt `"version": "0.1.0"` — der unveränderte `create-next-app`-Default. `git log --reverse` zeigt den allerersten Commit „Initial commit from Create Next App" am 2026-04-24; seither 205 Commits, u. a. atomare Wallet-RPCs (Migration 007), Multiplayer-Crash (Migration 037–050), Anti-Fraud-ML-Pipeline, Sentry-Error-Tracking, Telegram-Benachrichtigungen — die Versionsnummer wurde in keinem einzigen dieser produktiven Rollouts angepasst. Das ist keine kosmetische Lücke: Eine `0.1.0` suggeriert „Prä-Alpha-Gerüst", während das Repository seit Monaten produktiv mit echtem Wallet-Code läuft.

### 4 — Backfill-Quellenlage (Top 20 %)

Bei weitem die stärkste Sub-Unterkategorie. `docs/archive/00_WORLDMAP_ARCHIVLOG.md` (72 Zeilen, Abschnitte A + B) enthält bereits **~35 einzeln datierte, konkrete Einträge** (2026-08-09 bis 2026-08-26) mit Feature-Name, gewählter Option, Testergebnis und Live-Verifizierungsstatus — z. B. „Multiplayer-Crash … Security-Review PASS, 966/966 Tests grün … 2026-08-14" oder „App-weites Error-Tracking & Alerting via Sentry … Live-Nachweis in Sentry bestätigt … 2026-08-12". Ergänzend liefert `00_WORLDMAP_STATUS.md` Abschnitt 2 weitere offene/laufende Punkte mit Datumsbezug. Diese Quellenlage macht eine seriöse, nicht erfundene rückwirkende `CHANGELOG.md`-Befüllung für den gesamten bisherigen Projektverlauf möglich, ohne auf Interpretation oder Erfindung angewiesen zu sein.

### 5 — Deployment→Version-Rückverfolgbarkeit (Vercel) (Top 60 %)

Laut [`00-09-CICD.md`](../../worldmap/00-09-CICD.md) Abschnitt 2 ist Vercel-Auto-Deploy über die GitHub-Integration an `main` gekoppelt (`.vercel/project.json` bestätigt die Projekt-Verknüpfung). Vercels eigenes Dashboard trackt intern jeden Deployment 1:1 auf den auslösenden Commit-SHA — ein technischer Fallback zur Rückverfolgung existiert also bereits, unabhängig von Git-Tags. Der Abzug von Top 1–10 % auf Top 60 % liegt darin, dass dieser Trail nicht menschenlesbar ist (kein `v0.2.0`, nur ein 40-Zeichen-Hash) und nicht ohne Vercel-Dashboard-Zugriff einsehbar ist.

### 6 — GitHub-Releases-Nutzung (Top 100 %)

`gh release list` liefert 0 Treffer. Die GitHub-Releases-Funktion wurde nie verwendet — konsistent mit #1 (keine Tags), da GitHub Releases technisch auf Tags aufbauen.

### 7 — Release-Automatisierung (CI-Integration) (Top 100 %)

Gezielter Grep nach `tag|release|changelog|CHANGELOG` über alle vorhandenen Workflow-Dateien (`quality-ci.yml`, `dependency-audit.yml`, `red-team-security.yml`, `security-staging.yml`) sowie `dependabot.yml` liefert 0 Treffer. Keine Form von Auto-Tagging, `semantic-release`, `changesets` oder vergleichbarer Tooling-Kette existiert oder ist auch nur teilweise vorbereitet.

### 8 — Versions-Sichtbarkeit im Produkt (Top 100 %)

Grep über `src/` nach `APP_VERSION`, `NEXT_PUBLIC_VERSION`, `process.env.npm_package_version` oder direkten `package.json`-Version-Importen liefert 0 Treffer. Es gibt keine Stelle im UI (Footer, About, Admin-Panel), an der die aktuell laufende Version für Jan oder Nutzer sichtbar wäre.

### 9 — Pflege-Konvention dokumentiert (Top 90 %)

`xx_docs/12_git_commit_push_workflow.md` (die „Top 1 %"-Referenzdatei für Commit-/Push-Disziplin laut `00-14-VersionControlDoku.md` #1) enthält aktuell keinen Absatz dazu, wann ein `CHANGELOG.md`-Eintrag oder ein Tag fällig wird. Ohne diese Konvention würde ein neu angelegtes `CHANGELOG.md` (M1) exakt so verwaisen wie das Doku-Drift-Register in `00-14-DokuSync.md` #2.

### 10 — Rollback-Nachvollziehbarkeit über lesbare Version statt Hash (Top 90 %)

Direkt abhängig von #1/#5: Im Incident-Fall (z. B. ein fehlerhafter Production-Deploy) gibt es aktuell keinen schnellen Weg von „das war ungefähr letzte Woche in Ordnung" zu einem konkreten, wiederherstellbaren Zustand — nur die rohe, unstrukturierte Commit-Historie. `00-09-CICD.md` M8 hat einen 8-Schritte-Rollback-Dry-Run dokumentiert, der aber ausschließlich auf Commit-Hashes/Vercel-Deployment-IDs aufbaut, nicht auf lesbaren Versionsnummern.

---

## 4 — Bottleneck-Analyse (priorisiert)

1. **Höchster Hebel, geringster Aufwand — #2 blockiert trotz starkem #4:** Ein `CHANGELOG.md` existiert nicht, obwohl das Rohmaterial dafür (#4, Top 20 %) bereits vollständig und datiert vorliegt. Das ist der klarste Fall von „ungenutztem Vorteil" in dieser gesamten Aufschlüsselung — die Recherche ist erledigt, nur die Extraktion fehlt.
2. **Strukturell irreführend — #1 + #3 kombiniert:** Eine seit 4 Monaten und 205 Commits eingefrorene `0.1.0`-Versionsnummer auf einem produktiven Wallet-System ist keine Petitesse, sondern eine aktiv falsche Signalwirkung nach außen (und nach innen, falls je ein zweiter Mitwirkender hinzukommt).
3. **Ohne Konvention verwaist jede Lösung sofort — #7 + #9:** Selbst wenn M1/M2 einmalig ausgeführt werden, verhindert das Fehlen einer dokumentierten Pflege-Konvention (#9) und jeglicher Automatisierung (#7), dass `CHANGELOG.md`/Tags über die Zeit aktuell bleiben — exakt das Muster, das beim Doku-Drift-Register in `00-14-DokuSync.md` bereits real beobachtet wurde.
4. **Niedrigere Priorität, weil ein Fallback existiert — #5 + #10:** Vercel bietet bereits einen technischen (wenn auch nicht lesbaren) Rückverfolgungspfad. Kein akuter Datenverlust- oder Blocker-Charakter wie bei #1–#3.
5. **Bewusst kein Bottleneck — #6 (GitHub Releases) und #8 (Versions-Sichtbarkeit im UI):** Für ein internes Solo-Projekt ohne externe API-Konsumenten liefert `CHANGELOG.md` denselben Nutzen wie GitHub Releases, nur ohne Redundanz; eine UI-Versionsanzeige hat für eine Casino-Webapp ohne Multi-Version-Support keinen erkennbaren Nutzerwert. Beide bleiben im Anhang als bewusst zurückgestellt vermerkt, nicht als Meilenstein.

---

## 5 — Umsetzungsplan

Jeder Meilenstein ist **ausschließlich LLM-Zuständigkeit**. L0-Schritte (Recherche) sind bereits in dieser Planungsphase ausgeführt und oben verifiziert. Alle mutierenden Schritte (L1+) sind vollständig spezifiziert, aber bewusst **nicht ausgeführt** — diese Datei ist der Plan, nicht die Execution.

### M1 — `CHANGELOG.md` anlegen, rückwirkend befüllt (behebt #2, #4)

**Ziel:** Ein lesbarer, chronologischer Änderungsverlauf existiert, gespeist aus bereits verifizierten Quellen — kein Erfinden von Historie.

**L0 — Quellen identifiziert und geprüft (🟢 erledigt, 2026-08-29):** Siehe #4 oben — `docs/archive/00_WORLDMAP_ARCHIVLOG.md` Abschnitte A+B (~35 datierte Einträge) und `00_WORLDMAP_STATUS.md` Abschnitt 2.

**L1 — Datei angelegt (🟢 verifiziert, 2026-08-29):** [`CHANGELOG.md`](../../CHANGELOG.md) erstellt (19 datierte Abschnitte, 57 Einträge, 2026-04-24 bis 2026-08-29). **Methodische Korrektur gegenüber dem ursprünglichen Plan:** Statt nur die Prosa aus `docs/archive/00_WORLDMAP_ARCHIVLOG.md` zu paraphrasieren, wurde die Datumsgrundlage zusätzlich gegen `git log --format="%ad|%s" --date=short` verifiziert (105 reale `feat:`/`fix:`-Commits) — mehrere in Abschnitt A des Archivlogs beschriebene Meilensteine (z. B. Multiplayer-Crash v2) hatten **kein** explizites Datum in der Prosa; für diese wurde bewusst **kein** Datum erfunden, sie fehlen entsprechend im Backfill (kein Vollständigkeitsanspruch, siehe Datei-Kopf von `CHANGELOG.md`). Umgekehrt deckte `git log` einen bisher in keiner Worldmap-Datei einzeln aufgeführten, aber vollständig dokumentierten Feature-Lauf auf (Stufen D–P der LLM-Erweiterung, 2026-08-21 bis 2026-08-27, 20+ Commits) — dieser wurde ergänzt, da er direkt aus verifizierbaren Commit-Messages stammt, nicht aus Interpretation. Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Einträge nach Datum gruppiert (kein SemVer-Tagging existierte historisch, siehe M2 für den Wechsel ab jetzt):

Vollständiger Inhalt siehe [`CHANGELOG.md`](../../CHANGELOG.md) — nicht hier dupliziert, um kein doppelt gepflegtes Dokument zu erzeugen (SOP `xx_sop/03` Abschnitt 4).

**L2 — Security-/Sensitivitäts-Check (🟢 verifiziert, 2026-08-29):** Jeder Eintrag stammt entweder direkt aus bereits im Repo getrackten Quelldateien (`docs/archive/00_WORLDMAP_ARCHIVLOG.md`, selbst schon Teil des versionierten Bestands seit `06_planungsdatei_versionierung.md`) oder aus realen `git log`-Commit-Subjects (per Definition bereits öffentlich im Repo-Verlauf). Keine Secrets, internen Hostnamen oder über den Repo-Inhalt hinausgehenden Details wurden eingeführt — Stichprobe der 57 Einträge bestätigt dies.

**L3 — Verifiziert (🟢 verifiziert, 2026-08-29):** `ls CHANGELOG.md` → vorhanden (6491 Bytes). 19 datierte Abschnitte, 57 Einträge (`grep -c "^## "` bzw. `grep -c "^- "`). Deckt den vollständigen Zeitraum 2026-04-24 bis 2026-08-29 ab. Abweichung von der ursprünglich geschätzten „~35 Einträge" ist erklärt (siehe L1-Korrektur oben) und keine Lücke — die reale Quellenlage (Git-Historie) trug mehr verifizierbares Material als die reine Archivlog-Prosa allein.

**Security-Review:** Nein (siehe Datei-Kopf) — L2 ist ein interner Inhalts-Check, kein formaler Security-Review.

### M2 — SemVer-Baseline + erster echter Git-Tag (behebt #1, #3)

**Ziel:** Ab sofort eine ehrliche, technisch gültige Versionsnummer, ohne Historie rückwirkend zu fälschen.

**L0 — Konvention entschieden, ohne Jan-Rückfrage (🟢 erledigt, 2026-08-29):** Zwei Optionen standen zur Wahl — (a) volle SemVer-Automatisierung (`semantic-release`/`changesets`) oder (b) eine leichtgewichtige, manuell gepflegte SemVer-Konvention. Entscheidung: **(b)**. Begründung: Dieses Repo hat einen einzigen Konsumenten (die eigene Vercel-Production-Instanz), keine externen API-Abonnenten, für die Breaking-Change-Semantik einen Unterschied machen würde. Volle Automatisierungs-Tooling-Ketten wären Overengineering (verstößt gegen YAGNI, siehe globale Coding-Style-Regel) und würden eine neue Abhängigkeit + einen neuen CI-Schritt einführen, den `00-09-CICD.md` M6 bereits einmal bewusst vermieden hat (Jan-Entscheidung „Status quo" bei zusätzlichen Gates). Rückwirkendes Taggen alter Commits wird **nicht** durchgeführt — das würde Historie fingieren, die zum jeweiligen Zeitpunkt nie existierte. Tags beginnen ab jetzt, nicht rückwirkend.

**L1 — `package.json`-Version gebumpt (🟢 verifiziert, 2026-08-29):** `0.1.0` → `0.2.0` (`grep -m1 '"version"' package.json` bestätigt). Begründung für `0.2.0` statt `1.0.0`: Es gibt keinen dokumentierten formalen „Launch"/Stabilitäts-Meilenstein in der Worldmap (das Projekt ist laut `00_WORLDMAP_STATUS.md` weiterhin aktiver Lernfokus mit mehreren Top-25-%-bis-Top-90-%-Kategorien) — `1.0.0` würde eine nicht vorhandene API-Stabilitätszusage suggerieren. `0.2.0` signalisiert korrekt „über das Scaffold hinaus, weiterhin in aktiver Entwicklung".

**L2 — Bump-Policy fixieren (Inhalt siehe M3):** PATCH bei reinen `fix:`-Batches, MINOR bei `feat:`-Batches, MAJOR nur bei einer dokumentierten Breaking-Change-Entscheidung (z. B. Wallet-Schema-Bruch) — an M3 ausgelagert, damit die Konvention an einem Ort lebt.

**L3 — Ersten Tag gesetzt und gepusht (🟢 verifiziert, 2026-08-29):** Nach Jans expliziter Freigabe wurden die M1–M4-Änderungen committed (`61b16b8`, Kohorte „Kategorie-14 Release + DokuSync") und `git tag -a v0.2.0 -m "Baseline: erster gepflegter SemVer-Tag, siehe CHANGELOG.md"` exakt auf diesem Commit gesetzt — nicht auf einem unpassenden älteren `HEAD`, wie L0 es ausdrücklich ausschloss. Tag und Commit sind auf `origin/main` gepusht (`git push origin main --follow-tags`); `git log v0.2.0 -1` bestätigt `61b16b80b27b2ccf63173642a85c164d4135dfc0`. Quality-CI lief real in GitHub Actions (Run [`33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)): `test`/`typecheck`/`lint` grün.

**Security-Review:** Nein.

### M3 — Pflege-Konvention dokumentieren (behebt #7, #9)

**Ziel:** `CHANGELOG.md` und Tags verwaisen nicht wie das Doku-Drift-Register — die Pflegepflicht steht an derselben Stelle wie die bereits etablierte Commit-Message-Disziplin.

**L0 — Ziel-Ablageort bestätigt (🟢 erledigt, 2026-08-29):** `xx_docs/12_git_commit_push_workflow.md` ist die bestehende „Top 1 %"-Referenzdatei für Commit-/Push-Workflow — Ergänzung dort statt einer neuen Datei vermeidet laut SOP `xx_sop/03` Abschnitt 4 doppelt gepflegte Referenzen.

**L1 — Absatz ergänzt (🟢 verifiziert, 2026-08-29):** Abschnitt „Release- & Versions-Pflege" in [`xx_docs/12_git_commit_push_workflow.md`](../../xx_docs/12_git_commit_push_workflow.md) (vor Abschnitt 4) eingefügt — wörtlich wie geplant.

**L2 — Verifiziert (🟡 strukturell erfüllt, Verhaltensnachweis folgt organisch):** Der Absatz existiert und ist damit ab sofort wirksam. Ein tatsächlicher Nachweis „nächster `feat:`/`fix:`-Commit enthält einen Eintrag" kann erst beim nächsten realen, von Jan freigegebenen Commit erbracht werden (siehe M2/L3-Begründung — kein Commit ohne Freigabe in dieser Session).

**Security-Review:** Nein.

### M4 — Rollback-Referenzkarte (behebt #10, ergänzt #5)

**Ziel:** Im Incident-Fall lässt sich von einer lesbaren Version direkt zum passenden Vercel-Deployment navigieren, ohne erst Commit-Archäologie zu betreiben.

**L0 — Verknüpfungspunkte identifiziert (🟢 erledigt, 2026-08-29):** `00-09-CICD.md` M8 hat bereits einen 8-Schritte-Rollback-Dry-Run gegen echte Vercel-Projektdaten dokumentiert; dieser Meilenstein ergänzt nur das fehlende Versions-Mapping, dupliziert den Rollback-Prozess selbst nicht (vermeidet doppelt gepflegte Referenz gemäß SOP `xx_sop/03`).

**L1 — Kurztabelle ergänzt (🟢 verifiziert, 2026-08-29):** Abschnitt „Version → Deployment nachschlagen" direkt unter dem M3-Absatz in [`xx_docs/12_git_commit_push_workflow.md`](../../xx_docs/12_git_commit_push_workflow.md) eingefügt.

**L2 — Vollständig verifiziert (🟢, 2026-08-29):** Schritt 1 (CHANGELOG-Lookup) und Schritt 4 (Verweis auf `00-09-CICD.md` M8) waren sofort nutzbar. Schritte 2–3 jetzt real durchexerziert, seit M2/L3 den Tag gesetzt hat: `git log v0.2.0 -1 --format=%H` → `61b16b80b27b2ccf63173642a85c164d4135dfc0`. Die Vercel-Dashboard-Suche nach diesem Commit-Hash (Schritt 3) ist ein manueller UI-Schritt außerhalb der Kommandozeile — bleibt bewusst Jans Aufgabe im Incident-Fall (kein automatisierter Vercel-CLI-Zugriff in dieser Session angefordert), die Lookup-Prozedur selbst ist vollständig funktionsfähig und dokumentiert.

**Security-Review:** Nein.

---

## 6 — Definition of Done für die nächste Stufe

- ✅ `CHANGELOG.md` existiert (19 Abschnitte, 57 Einträge, 2026-04-24 bis 2026-08-29).
- ✅ `package.json`-Version ist `0.2.0`, nicht mehr der `create-next-app`-Default.
- 🔲 **Offen, außerhalb dieser Session lösbar:** Mindestens 1 echter Git-Tag (`v0.2.0`) existiert und ist auf `origin/main` gepusht — wartet auf Jans Commit-/Push-Freigabe (siehe M2/L3).
- ✅ `xx_docs/12_git_commit_push_workflow.md` enthält den Release-Pflege-Absatz (M3) und die Rollback-Referenzkarte (M4).
- ✅ Rechnerischer Schnitt der 10 Sub-Unterkategorien verbessert sich von Top 85,5 % auf **Top 39,5 %** (Update 2026-08-29, siehe Abschnitt 2); #6/#7/#8 bleiben unverändert, da bewusst zurückgestellt (siehe Anhang).
- ✅ `v0.2.0`-Tag existiert real, sitzt auf `61b16b8` und ist auf `origin/main` gepusht; Quality-CI lief real (Run [`33259047089`](https://github.com/ameisw667/Casino/actions/runs/33259047089)).

## 7 — Verifikationsbefehle (Ist-Zustand, real ausgeführt am 2026-08-29)

```bash
git tag -l                                                    # ✅ v0.2.0
git log v0.2.0 -1 --format=%H                                 # ✅ 61b16b80b27b2ccf63173642a85c164d4135dfc0
ls CHANGELOG.md                                               # ✅ vorhanden (19 Abschnitte, 57 Einträge)
grep -m1 '"version"' package.json                             # ✅ "0.2.0"
git log --reverse --format="%ad %s" --date=short | head -1    # 2026-04-24 Initial commit — Backfill-Startpunkt
gh release list                                                # weiterhin leer, bewusst nicht Ziel dieses Plans (siehe Anhang)
grep -rn "Release- & Versions-Pflege" xx_docs/12_git_commit_push_workflow.md   # ✅ 1 Treffer
grep -rn "Version → Deployment nachschlagen" xx_docs/12_git_commit_push_workflow.md   # ✅ 1 Treffer
gh run view 33259047089 --repo ameisw667/Casino --json conclusion             # ✅ test/typecheck/lint success (echter Push-Lauf)
```

---

## Anhang: Bewusst zurückgestellte Punkte (nicht Teil des Umsetzungsplans)

1. **GitHub Releases (#6):** Für ein Solo-Projekt ohne externe API-Konsumenten liefert `CHANGELOG.md` denselben Nutzen ohne Redundanz. Erst relevant, falls das Repo je öffentlich/Multi-Contributor wird.
2. **Versions-Anzeige im Produkt-UI (#8):** Kein erkennbarer Nutzerwert für eine Casino-Webapp ohne Multi-Version-Support oder externe Beta-Tester. Ließe sich bei Bedarf trivial über `process.env.npm_package_version` im Footer nachrüsten.
3. **Volle Release-Automatisierung (`semantic-release`/`changesets`):** In M2/L0 explizit gegen entschieden (Overengineering für einen einzigen Deployment-Konsumenten) — bleibt als Option, falls das Projekt je mehrere parallele Deployment-Umgebungen (Staging/Prod) mit eigener Versionsfreigabe bekommt.
4. **Commitlint als technischer Zwang für Conventional Commits:** Bereits in `00-14-VersionControlDoku.md` Anhang Punkt 1 als eigenständiger, noch nicht freigegebener Vorschlag geführt — würde diese Konvention (M3) technisch durchsetzbar statt nur Prompt-getrieben machen. Nicht dupliziert, nur referenziert.
