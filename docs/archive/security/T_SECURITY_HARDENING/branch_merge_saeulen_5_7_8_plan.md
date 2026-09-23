# Merge-Plan: Säulen 5/7/8 Runde 2 in den Hauptbranch

> **Status:** 🟢 Ausgeführt (L1-L4, L6, L7 abgeschlossen 2026-09-08; L5 technisch blockiert, siehe §3 Punkt 4) · **Stand:** 2026-09-08 · **Owner:** LLM (100 % LLM-Zuständigkeit, kein Jan-Gate) · **Scope:** Drei fertige, verifizierte Git-Branches (`worktree-agent-a31e4b3ba69b8898f` = Säule 5, `worktree-agent-a27bcadcb84fa0019` = Säule 7, `worktree-agent-ad75b04402f661021` = Säule 8) in `codex/uncommitted-cohort-review` zusammenführen, ohne das Haupt-Arbeitsverzeichnis anzufassen (316 fremde uncommittete Änderungen dort, siehe §2).
>
> **Ergebnis:** Alle 3 Branches zu einem Merge-Commit zusammengeführt (`security-hardening-round2-merge`, HEAD `508069b`), 3 echte Konflikte manuell aufgelöst (2 vorab erkannt + 1 neu gefunden: `src/proxy.ts`/`05_...md` zwischen Säule 5 und der bereits gemergten Säule 3), volle 5-Stufen-Prüfung grün (`npm ci`, Typecheck 0, 1548/1548 Tests, Lint 0, Build ✅). Die 3 Ursprungs-Worktrees/Branches sind aufgeräumt. Einzig L5 (Ref-Bewegung von `codex/uncommitted-cohort-review`) ist technisch nicht möglich — Git verweigert das bei anderswo ausgechecktem Branch (live getestet). Der fertige Stand liegt auf `security-hardening-round2-merge`, wartet auf eine Jan-Aktion im Hauptverzeichnis.
> **Money-Pfad:** Nein (reine Merge-/CI-Ebene, keine Wallet-Logik geändert) · **Security-Review:** Empfohlen bei den beiden Konfliktauflösungen (L3, betrifft CI-Sicherheits-Gates)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. Lies §1 (Übersicht), §2 (Ist-Stand inkl. der beiden bekannten Datei-Konflikte) und §3 (Meilensteine) vollständig, bevor du beginnst.
2. **Warum kein normaler `git merge` im Haupt-Arbeitsverzeichnis:** `git status --short | wc -l` liefert dort 316 — fremde, laufende Arbeit anderer paralleler Sessions. Ein Merge dort würde riskieren, diese zu überschreiben (von Git bereits einmal korrekt verweigert). Diese Datei beschreibt stattdessen einen Merge in einem **frischen, temporären Worktree**, der das Haupt-Arbeitsverzeichnis nie berührt.
3. Zwei echte Datei-Konflikte sind bereits identifiziert (§2) — beide müssen bewusst aufgelöst werden, beide Seiten müssen funktional erhalten bleiben, nicht einfach eine Seite verwerfen.
4. **Korrektur nach Selbstprüfung (2026-09-08):** `git branch -f` UND der `git fetch . HEAD:branch`-Trick wurden beide getestet — Git verweigert **beide** mit `fatal: cannot force update the branch ... used by worktree` bzw. `fatal: refusing to fetch into branch ... checked out`. Das ist ein bewusster Git-Sicherheitsmechanismus (seit 2.5), kein Bug, und wird hier **nicht** umgangen (kein direktes Editieren von `.git/refs/**`). Der finale Merge-Stand bleibt deshalb auf einem eigenen Branch (`security-hardening-round2-merge`) stehen, bis das Haupt-Arbeitsverzeichnis frei ist (Jan committet/räumt die 316 fremden Änderungen auf oder wechselt selbst den Branch) — siehe L5 (angepasst).

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                                                                                                    |                             Status                             |                   Zuständigkeit                   | Verifikation                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------: | :-----------------------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1  | Temporärer Worktree + Merge Säule 5 (keine Konflikte erwartet)                                                                                 |                    🟢 executed (2026-09-08)                    |                        LLM                        | Commit `47b66a4` — sauberer Merge, `git status` clean                                                                                                                                                                                                                                                                                                                                           |
| L2  | Merge Säule 8 (keine Konflikte erwartet)                                                                                                       |                    🟢 executed (2026-09-08)                    |                        LLM                        | Commit `b46805e` — sauberer Merge, `git status` clean                                                                                                                                                                                                                                                                                                                                           |
| L3  | Merge Säule 7 (2 bekannte Konflikte: `package.json`, `.github/workflows/security-staging.yml`)                                                 |                    🟢 executed (2026-09-08)                    |                        LLM                        | Commit `916e47f` — beide Konflikte manuell aufgelöst, beide Seiten funktional erhalten                                                                                                                                                                                                                                                                                                          |
| L4  | Volle 5-Stufen-Abschlussprüfung auf dem gemergten Stand                                                                                        | 🟢 executed (2026-09-08, erneut 2026-09-09 nach Nachbesserung) |                        LLM                        | Typecheck 0, 1548/1548 Tests, Lint 0, Build ✅ — zuletzt frisch re-verifiziert am 2026-09-09 auf Commit `9e2e5fd`                                                                                                                                                                                                                                                                               |
| L5  | Merge-Ergebnis auf eigenem Branch bereitstellen (Ref-Bewegung von `codex/uncommitted-cohort-review` technisch nicht möglich, siehe §0 Punkt 4) |   🟡 teilweise — Branch bereit, finale Zusammenführung offen   | LLM (Bereitstellung) / **Jan** (finale Übernahme) | `security-hardening-round2-merge` zeigt den vollständigen, verifizierten Merge-Stand inkl. 2 Nachbesserungen (`9899450`, `9e2e5fd`, `816953d`); **einziger noch offener Punkt der gesamten Runde 2** — `git merge` in `codex/uncommitted-cohort-review` blockiert, solange andere aktive Sessions dieselben Dateien uncommitted halten (Stand 2026-09-11: 10 Dateien Overlap, 2 Sessions aktiv) |
| L6  | `00_SECURITY_HARDENING_UEBERSICHT.md` + verwandte Docs auf finalen Stand aktualisieren                                                         |         🟢 executed (2026-09-08, erneut 2026-09-09/11)         |                        LLM                        | Execution-Spalte zeigt „Executed", offene Punkte klar benannt — synchronisiert sowohl im Merge-Branch als auch (additiv, ohne Fremd-Änderungen zu berühren) im Hauptverzeichnis                                                                                                                                                                                                                 |
| L7  | Aufräumen: temporäre Worktrees/Branches entfernen                                                                                              |                    🟢 executed (2026-09-08)                    |                        LLM                        | `git branch -a` zeigt keine `worktree-agent-*`-Branches mehr; `security-hardening-round2-merge` + sein Worktree bleiben bewusst bestehen (einziger Zugriffspunkt auf den fertigen Stand, siehe L7-Begründung)                                                                                                                                                                                   |

---

## 2 — Verifizierter Ist-Stand (2026-09-08)

**Drei fertige Branches, alle einzeln bereits mit vollständiger 5-Stufen-Prüfung verifiziert:**

| Branch                             | Commit    | Säule               | Geänderte Dateien                                                                              |
| ---------------------------------- | --------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| `worktree-agent-a31e4b3ba69b8898f` | `15a090f` | 5 — Header          | 12 Dateien (Admin-Routen, `response.ts`, `proxy.ts`, Tests, neuer Workflow)                    |
| `worktree-agent-a27bcadcb84fa0019` | `7df7888` | 7 — Supply-Chain    | 17 Dateien (8 CI-Workflows wegen globalem `ignore-scripts=true`, `package.json`, neue Scripts) |
| `worktree-agent-ad75b04402f661021` | `e1679b1` | 8 — Secret-Rotation | 5 Dateien (SOP, Log, `secret-rotation.ts`, ein Workflow-Schritt)                               |

**Bereits im Hauptbranch (Säule 3, Commit `0854a1a`):** `package.json` (predev/prebuild), `src/utils/supabase/admin.ts`, `trigger.config.ts`, neue Dateien.

**Zwei echte Datei-Konflikte, per `git diff --name-only` gegen den jeweiligen Merge-Base ermittelt:**

1. **`package.json`** — Säule 3 (bereits im Hauptbranch) ändert `predev`/`prebuild`-Scripts; Säule 7 ändert `postinstall`/`allow-scripts`-Scripts und `devDependencies`/`lavamoat`-Config. Unterschiedliche Bereiche derselben Datei — inhaltlich kompatibel, git wird das vermutlich nicht automatisch als Textkonflikt erkennen (unterschiedliche Zeilen), aber vor L3 einmal gezielt gegenprüfen.
2. **`.github/workflows/security-staging.yml`** — Säule 7 ergänzt einen `npm run allow-scripts`-Schritt nach `npm ci`; Säule 8 ergänzt einen „Secret rotation status"-Job-Summary-Schritt am Dateiende. Beide Änderungen sind additiv an unterschiedlichen Stellen der Datei — voraussichtlich automatisch mergebar, trotzdem in L3 explizit verifizieren (beide Schritte müssen nach dem Merge im finalen Workflow vorhanden sein).

**Warum kein Konflikt bei Säule 5:** Keine Dateiüberschneidung mit Säule 3, 7 oder 8.

**Haupt-Arbeitsverzeichnis-Sperre:** `git status --short | wc -l` = 316 (Stand 2026-09-08), fremde parallele Session-Arbeit — bestätigt unverändert seit dem letzten Merge-Versuch.

---

## 3 — Meilensteine

### L1 — Temporärer Worktree + Merge Säule 5

- **Ziel:** Isolierte Merge-Umgebung schaffen, die das Haupt-Arbeitsverzeichnis nie berührt.
- **Schritte:**
  1. `git worktree add .claude/worktrees/round2-merge -b security-hardening-round2-merge codex/uncommitted-cohort-review` — neuer temporärer Branch vom aktuellen Hauptbranch-Stand.
  2. Im neuen Worktree: `git merge worktree-agent-a31e4b3ba69b8898f --no-edit`.
- **Verifizierung:** `git status --short` im temporären Worktree ist nach dem Merge clean (keine Konflikt-Marker).
- **Freigabe-Gate:** Keines.

### L2 — Merge Säule 8

- **Schritte:** `git merge worktree-agent-ad75b04402f661021 --no-edit` im selben temporären Worktree.
- **Verifizierung:** Clean, keine Konflikt-Marker.
- **Freigabe-Gate:** Keines.

### L3 — Merge Säule 7 (2 Konflikte manuell auflösen)

- **Ziel:** Beide in §2 benannten Konflikte auflösen, ohne eine Seite zu verlieren.
- **Schritte:**
  1. `git merge worktree-agent-a27bcadcb84fa0019 --no-edit`.
  2. Falls `package.json` als Konflikt markiert wird: beide Script-Bereiche (Säule-3-`predev`/`prebuild` UND Säule-7-`postinstall`/`allow-scripts`/`devDependencies`/`lavamoat`) im gemergten Ergebnis behalten — keine Seite verwerfen.
  3. Falls `.github/workflows/security-staging.yml` als Konflikt markiert wird: beide additiven Schritte (Säule-7-`allow-scripts`-Schritt nach `npm ci`, Säule-8-„Secret rotation status"-Schritt am Ende) im gemergten Ergebnis behalten.
  4. Nach der Auflösung: `git add` der konfliktbehafteten Dateien, `git commit` (Merge-Commit abschließen).
- **Verifizierung:** `git status --short` clean, `grep -c "allow-scripts\|postinstall" package.json` zeigt beide Script-Familien, `grep -c "allow-scripts\|Secret rotation status" .github/workflows/security-staging.yml` zeigt beide Schritte.
- **Freigabe-Gate:** Keines. **Security-Review:** Empfohlen (zwei CI-Sicherheits-Gates werden zusammengeführt — einmal gegenlesen, dass keine Logik verloren geht).

### L4 — Volle 5-Stufen-Abschlussprüfung

- **Schritte:** `npm run typecheck`, `npm test`, `npm run lint`, `npm run build`, `git status --short` — alle im temporären Worktree, auf dem vollständig gemergten Stand.
- **Verifizierung:** 0 TS-Fehler, alle Tests grün, 0 ESLint-Errors, Build erfolgreich.
- **Freigabe-Gate:** Keines.

### L5 — Merge-Ergebnis bereitstellen (Ref-Bewegung nicht möglich)

- **Ziel:** Ehrlich mit der in §0 Punkt 4 dokumentierten Git-Grenze umgehen, statt sie zu umgehen.
- **Befund:** `git branch -f` und `git fetch . HEAD:codex/uncommitted-cohort-review` schlagen beide fehl, weil dieser Branch aktuell im Haupt-Arbeitsverzeichnis ausgecheckt ist — Git verhindert das bewusst, um zu vermeiden, dass sich dort unbemerkt der Stand unter den 316 fremden Änderungen verschiebt. Ein direktes Editieren von `.git/refs/heads/codex/uncommitted-cohort-review` würde diesen Schutz umgehen und ist hier bewusst ausgeschlossen.
- **Schritte:** Der temporäre Branch `security-hardening-round2-merge` bleibt als vollständiger, verifizierter Merge-Stand bestehen (nicht Teil des Aufräumens in L7). Kein weiterer Schritt hier möglich, ohne das Haupt-Arbeitsverzeichnis zu berühren.
- **Verifizierung:** `git log --oneline -1 security-hardening-round2-merge` zeigt den finalen Merge-Commit; `git status --short` im Hauptverzeichnis unverändert (316, keine neuen).
- **Freigabe-Gate:** Keines für diesen Schritt selbst. Das tatsächliche Zusammenführen mit `codex/uncommitted-cohort-review` erfordert eine Jan-Aktion (z. B. `git merge security-hardening-round2-merge` im Hauptverzeichnis, sobald die 316 fremden Änderungen dort committet/aufgeräumt sind) oder eine explizite Freigabe, das Haupt-Arbeitsverzeichnis anzufassen.

### L6 — Doku-Sync

- **Schritte:** `T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md` §3-Tabelle: Execution-Spalte für #5/#7/#8 von „Execution Ready" auf „Executed" (mit Verweis auf die jetzt gemergten Commits), Niveau-Werte auf die tatsächlichen Post-Execution-Werte aus den einzelnen Planungsdateien (§7 „Projizierter Niveau-Sprung" wird zu realem Ergebnis) aktualisieren, offene K5-Punkte (`ws`, HMAC-Versionierung, COEP) klar als weiterhin offen benennen.
- **Verifizierung:** Tabelle konsistent mit den einzelnen `0N_*.md`-Dateien.
- **Freigabe-Gate:** Keines.

### L7 — Aufräumen (nur die 3 Ursprungs-Worktrees, NICHT den Merge-Branch)

- **Schritte:** Nach erfolgreicher L4-Verifikation: `git worktree remove .claude/worktrees/agent-a31e4b3ba69b8898f`, `git worktree remove .claude/worktrees/agent-a27bcadcb84fa0019`, `git worktree remove .claude/worktrees/agent-ad75b04402f661021`, dann die 3 Ursprungs-Branches löschen (`worktree-agent-*` ×3) — ihr Inhalt lebt vollständig im Merge-Commit auf `security-hardening-round2-merge` weiter. Der Merge-Worktree selbst (`.claude/worktrees/round2-merge`) und der Branch `security-hardening-round2-merge` bleiben bestehen, bis Jan sie in `codex/uncommitted-cohort-review` überführt hat (siehe L5) — sonst geht der einzige Zugriffspunkt auf den gemergten Stand verloren.
- **Verifizierung:** `git worktree list` zeigt nur noch Hauptverzeichnis + `round2-merge`.
- **Freigabe-Gate:** Keines für das Löschen der 3 Ursprungs-Branches (redundant, Inhalt liegt im Merge). Der Merge-Branch selbst wird nicht gelöscht.

---

## 4 — Definition of Done

1. Alle drei Säulen-Branches sind zu einem einzigen, vollständig verifizierten Merge-Commit zusammengeführt (`security-hardening-round2-merge`).
2. Beide bekannten Konflikte sind aufgelöst, keine Funktionalität verloren.
3. Volle 5-Stufen-Prüfung grün auf dem finalen Stand.
4. Haupt-Arbeitsverzeichnis unverändert (nur die 316 vorbestehenden fremden Änderungen, nichts Neues, nichts überschrieben) — **das eigentliche Zusammenführen mit `codex/uncommitted-cohort-review` bleibt technisch offen, bis das Haupt-Arbeitsverzeichnis frei ist (Git-Grenze, §0 Punkt 4) — kein Ausführungsfehler, sondern eine dokumentierte Grenze.**
5. `00_SECURITY_HARDENING_UEBERSICHT.md` zeigt den finalen, korrekten Stand inkl. dieses offenen Punkts.
6. Die 3 redundanten Ursprungs-Worktrees/Branches sind aufgeräumt; der Merge-Branch bleibt als Übergabepunkt bestehen.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] Scope klar abgegrenzt: nur der Merge der 3 bereits fertigen Branches, keine neue inhaltliche Änderung an den Säulen selbst.
- [x] Beide realen Konflikte vorab identifiziert und mit konkreter Auflösungsstrategie versehen (§2, L3) — nicht erst beim Ausführen überrascht.
- [x] Haupt-Arbeitsverzeichnis-Risiko explizit adressiert (temporärer Worktree + reine Ref-Bewegung statt `checkout`).
- [x] Alle Meilensteine ausschließlich LLM-Zuständigkeit, kein Jan-Gate — reine Merge-/CI-Mechanik, keine Breaking Changes, keine neuen Secrets.
- [x] L7 (Aufräumen) ist bewusst erst NACH L5-Verifikation platziert, nicht davor — verhindert Datenverlust, falls L1-L5 fehlschlagen.
- [x] Ehrlichkeits-Check: Diese Datei behauptet nicht, dass die Konflikte trivial sind — beide sind explizit benannt, mit Grep-Verifikationsschritt, nicht nur „wird schon klappen".
- [x] **Selbstprüfung fand einen echten Fehler im ursprünglichen L5-Ansatz** (`git branch -f` funktioniert nicht bei anderswo ausgechecktem Branch — live getestet, nicht nur angenommen) und wurde entsprechend korrigiert, statt den Fehler stillschweigend beim Ausführen zu entdecken.
- [x] Eine neue LLM-Konversation kann §0-§2 ohne Chat-Historie verstehen und direkt bei L1 beginnen.

**Zusätzlich geprüft, aber bewusst nicht als eigener Meilenstein aufgenommen:** Ein `git push` ist nicht Teil dieses Plans — bleibt lokal, bis Jan explizit einen Push freigibt (Git-Safety-Regel).

---

## 6 — Verwandte Artefakte

| Bedarf                                           | Datei                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Säule 5 Planungsdatei (Quelle des Merge-Inhalts) | [`05_header_vollstaendigkeit.md`](./05_header_vollstaendigkeit.md)                                   |
| Säule 7 Planungsdatei                            | [`07_dependency_supply_chain_audit.md`](./07_dependency_supply_chain_audit.md)                       |
| Säule 8 Planungsdatei                            | [`08_secret_rotation_prozess.md`](./08_secret_rotation_prozess.md)                                   |
| Übersicht (wird in L6 aktualisiert)              | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                       |
| Planungsdateien-Konvention                       | [`xx_sop/03_workflow_jan_planungsdateien.md`](../../../../xx_sop/03_workflow_jan_planungsdateien.md) |
| Execution-Workflow (5-Stufen-DoD)                | [`xx_sop/02_workflow_jan_execution.md`](../../../../xx_sop/02_workflow_jan_execution.md)             |
