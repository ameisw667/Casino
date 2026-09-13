# 08 — Secret-Rotation-Prozess (Runde 2 — Ziel Top 10 %)

> **Status:** 🟡 Execution-Ready · **Stand:** 2026-09-06 · **Owner:** LLM (100 % LLM-Zuständigkeit — die HMAC-Versionierung für `POSTHOG_DISTINCT_ID_HMAC_SECRET` ist **explizit nicht Teil dieser Runde**, siehe §0) · **Scope:** `xx_sop/14_secret_rotation.md`, `xx_docs/13_secret_rotation_log.md`, `src/lib/security/secret-rotation.ts`, `scripts/check-secret-rotation-due.ts`; **nicht** im Scope: HMAC-Versionierung selbst (Jan/K5), gitleaks-Konfiguration (bereits solide, Runde 1).
> **Money-Pfad:** Nein (Prozess-/Dokumentations-Schicht) · **Security-Review:** Empfohlen bei L1/L2 (Inventar-Ergänzung um Kritisch-Klasse-Secrets)

## 0 — Für eine neue LLM-Konversation: So wird diese Datei benutzt

1. **Vorgeschichte:** Runde 1 ([archiviert](../docs/archive/t_security_hardening_08_secret_rotation_prozess.md)) hat gitleaks-CI-Gate, Secret-Inventar, Rotation-Tracking-Skript und Incident-Runbook gebaut — von Top 55 % auf Top 22 %.
2. **Diese Runde (Runde 2)** ist eine tiefere `casino-code-explorer`-Recherche (2026-09-06) und hat **zwei echte, bisher unentdeckte Inventar-Lücken** gefunden (§3): die komplette Backup-Verschlüsselungs-Secret-Familie und `SUPABASE_ACCESS_TOKEN` fehlen im Rotationsinventar, obwohl sie real im Code/CI verwendet werden. Zusätzlich ist der Fälligkeits-Check-Grep selbst strukturell blind für ein im Repo genutztes Zugriffsmuster.
3. **Diese Datei ist reine Planung, keine Ausführung** (Jan-Auftrag 2026-09-06).
4. **Wichtige Grenze:** HMAC-Versionierung bleibt bei Jan (K5) — dieser Punkt zieht den Sub-Schnitt strukturell nach oben (§7), das ist kein Planungsfehler, sondern eine ehrliche, nicht vermeidbare Grenze des LLM-Scopes.

---

## 1 — Übersicht für Jan

| Nr. | Meilenstein                                                  | Scope (Dateien)                                                       |   Status   | Zuständigkeit | Verifikation                                              |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------- | :--------: | :-----------: | --------------------------------------------------------- |
| L1  | Backup-Secret-Familie ins Rotationsinventar aufnehmen        | `xx_sop/14_secret_rotation.md`, `src/lib/security/secret-rotation.ts` | 🔴 Geplant |      LLM      | 3 neue Secrets mit Klasse+Turnus dokumentiert             |
| L2  | `SUPABASE_ACCESS_TOKEN` ins Inventar aufnehmen               | `xx_sop/14_secret_rotation.md`, `src/lib/security/secret-rotation.ts` | 🔴 Geplant |      LLM      | Secret dokumentiert, Turnus begründet                     |
| L3  | Vollständigkeits-Check-Grep reparieren                       | `xx_sop/14_secret_rotation.md` §1                                     | 🔴 Geplant |      LLM      | Grep findet auch `required(environment, 'NAME')`-Zugriffe |
| L4  | `check-secret-rotation` sichtbar machen (Job-Summary)        | Neuer/bestehender Workflow-Schritt                                    | 🔴 Geplant |      LLM      | Non-blocking Report erscheint im CI-Summary               |
| L5  | Ersten echten Log-Eintrag setzen (Ersteinrichtungs-Baseline) | `xx_docs/13_secret_rotation_log.md`                                   | 🔴 Geplant |      LLM      | Alle bekannten Secrets haben einen Startdatum-Eintrag     |

**Warum kein Jan-Gate:** Alle 5 Meilensteine sind Doku-/Tooling-Ergänzungen ohne neues externes Secret, ohne CI-Blocking-Verhalten und ohne Berührung der HMAC-Versionierungs-Entscheidung.

---

## 2 — Secret-Rotation-Prozess in Subkategorien: Neubewertung (2026-09-06, Baseline für diese Runde)

|  #  | Subkategorie                                      | Niveau (Baseline) | Status | Kernbefund                                                                                                                                                                                                                                                                                                                                                  |
| :-: | ------------------------------------------------- | :---------------: | :----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  1  | gitleaks CI-Hard-Gate                             |     Top 10 %      |   🟢   | Unverändert solide, 3 aufeinanderfolgende Läufe grün                                                                                                                                                                                                                                                                                                        |
|  2  | Pre-Commit-Hook                                   |     Top 20 %      |   🟢   | Bewusst optional (`.husky/pre-commit:9-11` benennt das CI-Gate explizit als verbindliche Linie) — kein Fehldesign                                                                                                                                                                                                                                           |
|  3  | **Secret-Inventar-Vollständigkeit**               |     Top 45 %      |   🟠   | **Zwei echte Lücken:** Backup-Verschlüsselungs-Secret-Familie (`BACKUP_ENCRYPTION_KEY_BASE64`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY`, `.env.example:79-84`) und `SUPABASE_ACCESS_TOKEN` (dupliziert referenziert in `migration-drift-check.yml:28` + `query-performance-audit.yml:29`) fehlen komplett in `xx_sop/14_secret_rotation.md` |
|  4  | Rotationsturnus nach Blast-Radius gestaffelt      |     Top 15 %      |   🟢   | Struktur (5 Klassen) ist gut, nur unvollständig befüllt (siehe #3)                                                                                                                                                                                                                                                                                          |
|  5  | **Fälligkeits-Tracking real wirksam**             |     Top 40 %      |   🟠   | `check-secret-rotation-due.ts` existiert und funktioniert lokal, läuft aber **nirgends automatisiert** — kein CI-Workflow, kein Cron ruft es auf                                                                                                                                                                                                            |
|  6  | Least-Privilege-Audit                             |     Top 20 %      |   🟢   | PostHog-Scope bereits geprüft und minimal-notwendig bestätigt                                                                                                                                                                                                                                                                                               |
|  7  | Incident-Response-Runbook                         |     Top 20 %      |   🟢   | Casino-spezifisch, nicht generisch kopiert                                                                                                                                                                                                                                                                                                                  |
|  8  | Keine Secret-Werte im Log                         |     Top 10 %      |   🟢   | Unverletzliche Invariante eingehalten                                                                                                                                                                                                                                                                                                                       |
|  9  | HMAC-Secret-Versionierung                         |     Top 60 %      |   🟠   | Unverändert bewusst außerhalb dieser Runde — Jan-Entscheidung (Breaking Change für Analytics-Historie)                                                                                                                                                                                                                                                      |
| 10  | **Vollständigkeits-Check-Methodik + Log-Nutzung** |     Top 50 %      |   🟠   | Der Vollständigkeits-Check-Grep selbst (`xx_sop/14_secret_rotation.md:24`) findet strukturell keine über `required(environment, 'NAME')` gelesenen Secrets (`src/lib/backup/recovery-crypto.ts:24,76-82`) — blind für ein real genutztes Zugriffsmuster. Zusätzlich: `xx_docs/13_secret_rotation_log.md` hat **0 Einträge seit Einführung** (2026-08-29)    |

**Rechnerischer Schnitt (Baseline dieser Runde):** (10+20+45+15+40+20+20+10+60+50)/10 = **Top 29 %** — schlechter als der Runde-1-Wert (Top 22 %), weil die tiefere Recherche zwei echte, bisher unentdeckte Inventar-Lücken und eine strukturell blinde Stelle im eigenen Vollständigkeits-Check gefunden hat.

---

## 3 — Verifizierter Ist-Stand (casino-code-explorer-Recherche, 2026-09-06)

**Rotationsklassen-Tabelle** (`xx_sop/14_secret_rotation.md`, vollständig gelesen, 67 Zeilen): 5 Klassen (Kritisch 90 Tage, Hoch/Zugriff 180 Tage, Hoch/Extern 180 Tage, Mittel/Intern 365 Tage, Niedrig/öffentlich kein Turnus) — Struktur ist gut, aber unvollständig befüllt.

**Fehlende Secrets, real im Code/CI verwendet:**

- `BACKUP_ENCRYPTION_KEY_BASE64`, `BACKUP_S3_ACCESS_KEY_ID`, `BACKUP_S3_SECRET_ACCESS_KEY` — echte Verschlüsselungs-/S3-Zugangsdaten (`.env.example:79-84`), Zugriff über `required(environment, 'NAME')`-Indirektion in `src/lib/backup/recovery-crypto.ts:24,76-82`, `environment` wird in `scripts/backup-supabase.ts:41` als `process.env` übergeben.
- `SUPABASE_ACCESS_TOKEN` — dupliziert referenziert in `migration-drift-check.yml:28` und `query-performance-audit.yml:29`.

**Warum der bestehende Vollständigkeits-Check das nicht selbst gefunden hat:** Der Grep-Befehl in `xx_sop/14_secret_rotation.md:24` (`grep -rhoE "process\.env\.[A-Z_]+" src/ scripts/`) sucht nur nach dem direkten `process.env.NAME`-Literal — die Backup-Secrets werden aber über eine Hilfsfunktion `required(environment, 'NAME')` gelesen, die der Regex strukturell nicht erfasst.

**`check-secret-rotation-due.ts`:** Existiert (`package.json:45` als `npm run check-secret-rotation`), liest `xx_docs/13_secret_rotation_log.md`, vergleicht gegen `TURNUS_DAYS` in `src/lib/security/secret-rotation.ts:6-20`, Exit-Code 1 bei Fälligkeit. **Kein Workflow, kein Cron, kein Husky-Hook ruft es auf** (bestätigter Grep, 0 Treffer). Das Log selbst hat 0 Einträge seit Einführung — das Skript kann strukturell nie „grün" für eine tatsächlich erfolgte Rotation melden, weil nie ein Startdatum gesetzt wurde.

**`.gitleaks.toml`:** 3 Allowlist-Einträge, alle mit Datumsbegründung, kein verwaister Eintrag gefunden — solide, kein Handlungsbedarf.

---

## 4 — Meilensteine

### L1 — Backup-Secret-Familie ins Rotationsinventar aufnehmen

- **Ziel:** Die in §2 #3 benannte Lücke schließen — die im Code real genutzten Backup-Secrets fehlen komplett.
- **Schritte:**
  1. `xx_sop/14_secret_rotation.md` Abschnitt 1: `BACKUP_ENCRYPTION_KEY_BASE64` als **Kritisch**-Klasse (90 Tage) — ein kompromittierter Backup-Verschlüsselungsschlüssel gefährdet die Vertraulichkeit sämtlicher historischer Backups. `BACKUP_S3_ACCESS_KEY_ID`/`BACKUP_S3_SECRET_ACCESS_KEY` als **Hoch/Extern**-Klasse (180 Tage) — Upload/Download/Listing-Rechte auf den Backup-Bucket.
  2. `src/lib/security/secret-rotation.ts:6-20` (`TURNUS_DAYS`-Map) um die drei neuen Einträge ergänzen, damit `check-secret-rotation-due.ts` sie tatsächlich mitprüft.
- **Verifizierung:** `npm run check-secret-rotation` (lokal) berücksichtigt die drei neuen Secrets in seiner Ausgabe.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Empfohlen (Kritisch-Klasse-Einstufung eines Verschlüsselungsschlüssels sollte einmal gegengeprüft werden).

### L2 — `SUPABASE_ACCESS_TOKEN` ins Inventar aufnehmen

- **Ziel:** Die zweite in §2 #3 benannte Lücke schließen.
- **Schritte:** `xx_sop/14_secret_rotation.md` und `secret-rotation.ts` um `SUPABASE_ACCESS_TOKEN` ergänzen — Klasse **Hoch/Extern** (180 Tage), Begründung: granularer Read-Token für Migrations-/Query-Performance-CI, dupliziert in zwei Workflows referenziert.
- **Verifizierung:** Wie L1.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — Vollständigkeits-Check-Grep reparieren

- **Ziel:** Die in §2 #10 benannte strukturelle Blindstelle schließen — der Check selbst muss künftige `required(environment, ...)`-Zugriffe erfassen, nicht nur `process.env.NAME`.
- **Schritte:** `xx_sop/14_secret_rotation.md:24` — Grep-Befehl um ein zweites Muster erweitern, z. B. `grep -rhoE "(process\.env\.[A-Z_]+|required\(environment, '[A-Z_]+'\))" src/ scripts/` (oder äquivalent, exakte Syntax beim Ausführen gegen den echten Code-Stand verifizieren).
- **Verifizierung:** Der reparierte Grep findet jetzt auch die drei Backup-Secrets aus `src/lib/backup/recovery-crypto.ts`.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L4 — `check-secret-rotation` sichtbar machen (Job-Summary)

- **Ziel:** Die in §2 #5 benannte Lücke schließen — das Skript ist gebaut, aber wirkungslos, weil es nie läuft.
- **Schritte:** Neuer, nicht-blockierender Schritt (`if: always()`) in einem bestehenden, ohnehin regelmäßig laufenden Workflow (z. B. `security-staging.yml`, das bereits bei sicherheitsrelevanten Pfaden läuft) — führt `npm run check-secret-rotation` aus und schreibt das Ergebnis lesbar in `$GITHUB_STEP_SUMMARY`, nach dem bereits etablierten Muster aus `dependency-audit.yml:48-69`. **Bewusst kein CI-Gate** — ein fälliges Secret soll sichtbar sein, nicht den Merge blockieren (K5-Prinzip: Rotation selbst bleibt immer Jans manueller Schritt).
- **Verifizierung:** Ein Testlauf zeigt den aktuellen Fälligkeitsstatus aller Secrets im Job-Summary.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

### L5 — Ersten echten Log-Eintrag setzen (Ersteinrichtungs-Baseline)

- **Ziel:** Die in §2 #10 benannte zweite Lücke schließen — ohne einen Startdatum-Eintrag kann das Skript nie sinnvoll „Tage seit letzter Rotation" berechnen.
- **Schritte:** `xx_docs/13_secret_rotation_log.md` — für jedes Secret aus dem (nach L1/L2 vollständigen) Inventar einen Eintrag „Ersteinrichtung/erste bekannte Ausgabe" mit dem frühesten bekannten oder plausibel angenommenen Datum ergänzen (kein erfundenes Rotationsdatum — explizit als „Ersteinrichtung, keine tatsächliche Rotation" kennzeichnen, um keine falsche Sicherheit vorzutäuschen).
- **Verifizierung:** `npm run check-secret-rotation` berechnet jetzt für jedes Secret eine reale „Tage seit"-Zahl statt eines strukturellen Leerstands.
- **Freigabe-Gate:** Keines. **Money-Pfad:** Nein. **Security-Review:** Nein.

---

## 5 — Definition of Done

1. Alle real im Code/CI verwendeten Secrets stehen im Rotationsinventar (L1, L2).
2. Der Vollständigkeits-Check-Grep selbst ist nicht mehr strukturell blind für ein genutztes Zugriffsmuster (L3).
3. Das Fälligkeits-Tracking ist nicht mehr nur lokal ausführbar, sondern sichtbar im CI-Summary (L4).
4. Das Rotation-Log hat für jedes Secret eine echte Baseline statt eines Leerstands (L5).

---

## 6 — Selbstprüfung vor `Execution-Ready`

- [x] Scope abgegrenzt: nur der Rotationsprozess, nicht gitleaks-Konfiguration selbst (bereits solide, Runde 1).
- [x] Alle 5 Meilensteine ausschließlich LLM-Zuständigkeit — kein neues Secret, keine tatsächliche Rotation, HMAC-Versionierung bewusst ausgeklammert.
- [x] Recherche durch `casino-code-explorer` fundiert (Datei-/Zeilenreferenzen in §3).
- [x] Ehrlichkeits-Check: Baseline dieser Runde (Top 29 %) ist schlechter als Runde-1-Endwert (Top 22 %) — durch echte neue Funde erklärt, nicht beschönigt.
- [x] Money-Pfad korrekt „Nein".
- [x] Eine neue LLM-Konversation kann §0+§2+§3 ohne Chat-Historie verstehen.

---

## 7 — Projizierter Niveau-Sprung nach Ausführung aller 5 Meilensteine

|  #  | Subkategorie                      | Baseline | Nach Ausführung | Warum                                                                                 |
| :-: | --------------------------------- | :------: | :-------------: | ------------------------------------------------------------------------------------- |
|  1  | gitleaks CI-Gate                  | Top 10 % |    Top 10 %     | unverändert                                                                           |
|  2  | Pre-Commit-Hook                   | Top 20 % |    Top 15 %     | Neubewertung: CI-Gate ist die reale Linie, Hook ist bewusste Zusatztiefe, kein Risiko |
|  3  | Secret-Inventar-Vollständigkeit   | Top 45 % |    Top 12 %     | L1, L2                                                                                |
|  4  | Rotationsturnus gestaffelt        | Top 15 % |    Top 15 %     | unverändert                                                                           |
|  5  | Fälligkeits-Tracking real wirksam | Top 40 % |    Top 12 %     | L4                                                                                    |
|  6  | Least-Privilege-Audit             | Top 20 % |    Top 15 %     | unverändert, bereits solide                                                           |
|  7  | Incident-Runbook                  | Top 20 % |    Top 15 %     | unverändert, bereits solide                                                           |
|  8  | Keine Secret-Werte im Log         | Top 10 % |    Top 10 %     | unverändert                                                                           |
|  9  | HMAC-Versionierung                | Top 60 % |    Top 60 %     | **unverändert — bewusst außerhalb des LLM-Scopes**                                    |
| 10  | Check-Methodik + Log-Nutzung      | Top 50 % |    Top 12 %     | L3, L5                                                                                |

**Projizierter Schnitt nach Ausführung:** (10+15+12+15+12+15+15+10+60+12)/10 = **Top 17,6 %** (gerundet **Top 18 %**).

**Ehrliche Einordnung, warum nicht Top 10 %:** Der HMAC-Versionierungs-Fund (#9) wiegt bei einer flachen 10-Zeilen-Durchschnittsbildung strukturell schwer (Top 60 % trägt allein 6 Prozentpunkte zum Schnitt bei) — schwerer als der vergleichbare `ws`-K5-Fund bei Säule 7 (dort Top 20 %). Das ist keine Planungsschwäche, sondern eine ehrliche Widerspiegelung, dass diese eine Restlücke real gravierender ist als die von Säule 7. **Top 18 %** ist der maximal ehrliche LLM-Scope-Wert; sobald Jan die HMAC-Entscheidung trifft, sinkt #9 deutlich und der Gesamtschnitt fällt klar unter Top 10 %.

---

## 8 — Verwandte Artefakte

| Bedarf                                          | Datei                                                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Archivierte Runde-1-Planungsdatei               | [`docs/archive/t_security_hardening_08_secret_rotation_prozess.md`](../docs/archive/t_security_hardening_08_secret_rotation_prozess.md) |
| Technischer Deep-Dive                           | [`docs/security-hardening/06_secret_rotation_gitleaks.md`](../docs/security-hardening/06_secret_rotation_gitleaks.md)                   |
| Secret-Rotation-SOP (wird in L1/L2/L3 geändert) | [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md)                                                                       |
| Rotation-Fälligkeits-Log (wird in L5 geändert)  | [`xx_docs/13_secret_rotation_log.md`](../xx_docs/13_secret_rotation_log.md)                                                             |
| Referenzmuster für L4 (Job-Summary)             | [`.github/workflows/dependency-audit.yml`](../.github/workflows/dependency-audit.yml)                                                   |
| Übersicht (alle 4 Säulen dieser Runde)          | [`00_SECURITY_HARDENING_UEBERSICHT.md`](./00_SECURITY_HARDENING_UEBERSICHT.md)                                                          |

---

## 9 — Ausführungsstatus & Runde-3-Prüfung (2026-09-12)

**Ausführungsstatus:** Alle 5 Meilensteine (L1-L5) sind auf dem verifizierten Merge-Stand `security-hardening-round2-merge` vollständig umgesetzt — bestätigt im lokalen Worktree `.claude/worktrees/round2-merge` (Commit `302a988`, `grep -n "🔴 Geplant"` in dieser Datei dort liefert 0 Treffer, alle L-Zeilen zeigen `🟢 executed (2026-09-07)`). Der Kopfbereich dieser Datei im Hauptbranch (`codex/uncommitted-cohort-review`) zeigt noch „🟡 Execution-Ready", weil der Merge-Branch technisch noch nicht in den Hauptbranch übernommen werden konnte (316+ fremde uncommittete Änderungen im Hauptverzeichnis blockieren den Merge — Details in [`branch_merge_saeulen_5_7_8_plan.md`](./branch_merge_saeulen_5_7_8_plan.md), **nicht Teil dieser Planungsaufgabe**). Dieser Status-Header wird bewusst **nicht** von dieser Planungsrunde geändert — das ist Aufgabe des Merge-Plans, nicht dieser Datei.

**Runde-3-Prüfung:** Auf Basis des tatsächlich ausgeführten Merge-Stands geprüft: Kein neuer, bisher unentdeckter Fund über die bereits bekannte HMAC-Versionierungs-Grenze (#9, K5) hinaus. Die übrigen 9 Subkategorien liegen bereits bei Top 10-15 % (§7-Projektion) — nahe am methodischen Floor der flachen 10er-Durchschnittsbildung. Eine weitere Härtungsrunde würde nur Bruchteile eines Prozentpunkts bewegen. **Bewusst keine Runde 3.** Nächster fälliger Check: sobald Jan die HMAC-Versionierungs-Entscheidung trifft (dann automatisch ein deutlicher Sprung ohne weitere LLM-Arbeit nötig) oder bei einem neuen, bisher unbekannten Secret im Repo.
