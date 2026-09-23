# 06-U03 — Typ-Abdeckung „project" (Unterkategorie 3)

> **Status:** **Executed (archiviert)** — L0–L3 ausgeführt 2026-09-18 · **Stand:** 2026-09-14 (Ausführung 2026-09-18) · **Owner:** LLM (Jan nur bei Memory-Schreib-Gate) · **Scope:** project-Typ im Memory-Ordner schließen (3 neue project-Memories + 1 Nachtrag am Altbestand + Trigger-Cross-Verweis), ohne feedback/reference-Einträge anzufassen.
> **Ausführungsprotokoll 2026-09-18:** L0 (3 neue Dateien `db-pooling-chaos-hardening.md`, `manual-branch-merge-conflict-resolution.md`, `k5-mobile-lcp-campaign-foundation.md` + 3 Index-Zeilen; Gate G1 durch Jans Go gedeckt; `originSessionId` = `671667ba-725b-49f4-988d-703e2959be79`) → L1 (Update-Absatz 2026-09-14 + Aktuelle Einordnung in `vip-rank-supabase-outsourcing.md`; `modified` **2026-09-14** = Datum der Inhaltsänderung, damit konsistent mit der U01-L3-Regel „kein Ausführungs-Zeitstempel" — der dort gesetzte Wert `2026-06-28` wird durch diesen Nachtrag abgelöst) → L2 (Trigger-Regel konsolidiert: primär [06_u07](06_u07_pflegekadenz_plan.md) §2a, hier §2c = Verweiszeile; Verweiszeile in Parent Position 7) → L3 (Re-Rating **Top 71 % → Top 40 %**). Deckung: 1 → 4 project-Einträge.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_6_03_typ_abdeckung_project.md`](../01_6_03_typ_abdeckung_project.md) (gewichtetes Niveau Top 71 %; Bottlenecks: Abdeckung ~20 % / Subsub 1, Schreib-Hemmnis / Subsub 5)
> **Entscheidungen Jan 2026-09-17:** (a) Umfang bleibt bei den **3 vorbereiteten** Kandidaten A1–A3 + 1 Nachtrag — die Restkandidaten (K6 Componentry-Revamp, K1 DB-Runde-2-Testinfrastruktur) bleiben Nachreih-Vermerk, kein Drafting. (b) Freigabe-Modell: **ein Sammel-Batch** mit den übrigen Typ-Abdeckungs-Plänen; **Go am 2026-09-18 erteilt** — Plan ausgeführt (`Executed (archiviert)`). (c) `originSessionId`-Regel siehe §2-Hinweis vor Entwurf A1.
> **Archivierung in-place** (Präzedenz 06_u06/06_u09/06_u10) — **Abweichung von `xx_sop/03`**: Der dort genannte Worldmap-Abschnitt „Aktive Pläne" existiert in `worldmap/00_WORLDMAP_STATUS.md` nicht (verifiziert 2026-09-17); es wird **kein** neuer Abschnitt angelegt und **nicht** nach `docs/archive/` verschoben.

---

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                        | Scope (Dateien)                                                                                |      Ausführung       |    Status     |           Zuständigkeit           | Verifikation                                                                                                           |
| :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- | :-------------------: | :-----------: | :-------------------------------: | :--------------------------------------------------------------------------------------------------------------------- |
| **L0** | **3 project-Memory-Kandidaten anlegen** (fertige Entwürfe aus §2a unverändert als Dateien schreiben, inkl. Index-Zeile je Eintrag in `MEMORY.md`)                                                                                                  | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\` + `MEMORY.md`                   |      Sequenziell      | 🟢 2026-09-18 | LLM (**Gate G1** vor jedem Write) | 3 neue Dateien + 3 Index-Zeilen; Frontmatter je Datei vollständig (`name`/`description`/`metadata.type: project`)      |
| **L1** | **Nachtrag Altbestand** `vip-rank-supabase-outsourcing.md` (Ergänzungszeilen-Entwürfe aus §2b, Update-Layer-Stil)                                                                                                                                  | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\vip-rank-supabase-outsourcing.md` | Sequenziell (nach L0) | 🟢 2026-09-18 |         LLM (**Gate G1**)         | Update-Absatz + Aktuelle-Einordnung ergänzt; Ursprungsregel unverändert bewahrt (Muster `no-visual-check-frontend.md`) |
| **L2** | **Trigger-Regel ablegen** (§2c-Inhalt) — primärer Ablageort ist [`06_u07_pflegekadenz_plan.md`](06_u07_pflegekadenz_plan.md) §2a/§2b (**existiert**, am 2026-09-17 verifiziert); hier bleibt nur eine 1-Zeilen-Verweisung, keine Doppelverankerung | `t_claude_code/Planungsdateien/`                                                               |      Sequenziell      | 🟢 2026-09-18 |                LLM                | Regeltext existiert an genau **einem** Ort (06_u07 §2a); 06_u03 §2c = Verweiszeile; beide Gegenverweise klicken        |
| **L3** | **Abschlussprüfung & Niveau-Rückschreibung** in [`../01_6_03_typ_abdeckung_project.md`](../01_6_03_typ_abdeckung_project.md)                                                                                                                       | `t_claude_code/01_6_03_typ_abdeckung_project.md`                                               |      Sequenziell      | 🟢 2026-09-18 |                LLM                | Niveau-Rückschreibung §5 ausgefüllt; Deckung neu berechnet (1 → 4 project-Einträge)                                    |

Alle Schreibvorgänge im Memory-Ordner = **Gate G1** (Jan gibt jeden einzelnen Write explizit frei) — Ursache ist Bottleneck #5 (globale Regel „Write to memory **only when I explicitly ask**" in `C:\Users\hambu\.claude\CLAUDE.md` Abschnitt „Memory"). Ohne Gate ist L0/L1 nicht ausführbar.

---

## 2 — Self-Contained Kontext-Koffer

### (a) Fertigentwürfe — 3 neue project-Memory-Dateien (Ziel L0)

Zielordner: `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\`. Alle Aussagen stammen belegt aus [`../01_6_03_typ_abdeckung_project.md`](../01_6_03_typ_abdeckung_project.md) §Detailanmerkungen (Git-Historie, Beleg-Commits dort zitiert) und [`../01_6_07_pflegekadenz.md`](../01_6_07_pflegekadenz.md) §2/§3. Relative Datumangaben sind bereits in absolute Datumsangaben konvertiert.

**`originSessionId`-Regel (festgelegt 2026-09-17, Vorbereitungsabschluss):** Das Feld ist im Bestand verpflichtend (alle 6 vorhandenen Dateien tragen es, jeweils die ID der Sitzung, in der die Datei geschrieben wurde — z. B. `no-visual-check-frontend.md:7` mit `modified` vom selben Tag). Die Entwürfe tragen daher weiterhin `TODO-Platzhalter-erst-bei-Schreiben-ersetzen`; die Ausführung ersetzt ihn durch die **ID der ausführenden Sitzung** (ablesbar am Session-Transkript-Pfad unter `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\<session-id>.jsonl`) und setzt `modified` auf den Schreibzeitpunkt. Ist die ID in der Ausführungsumgebung nicht eindeutig ermittelbar, wird das Feld **weggelassen** und das im Ausführungs-Log vermerkt — ein erfundener Wert ist ausgeschlossen.

#### Entwurf A1 — `db-pooling-chaos-hardening.md`

```markdown
---
name: db-pooling-chaos-hardening
description: 'DB-Pooling-Chaos-Hardening-Runde vom 2026-09-13: Upstash-Override-Guard, Host-Lock, transient-Exit-Code-Fix, Pool-Erschöpfungs-Audit (Loopback-Guard) und withConnectionRetry fail-closed.'
metadata:
  node_type: memory
  type: project
  originSessionId: TODO-Platzhalter-erst-bei-Schreiben-ersetzen
---

Fakt: Am 2026-09-13 wurde die Supabase-/DB-Zugriffsschicht gegen Pool-Erschöpfung und
transiente Fehler gehärtet (Beleg-Commits: `feat(db-pooling): N3 Chaos-Hardening —
Upstash-Override-Guard + Host-Lock + transient-Exit-Code-Fix` und
`N4 Pool-Erschöpfungs-Audit (Loopback-Guard)`, beide 2026-09-13; ergänzend
`L6 withConnectionRetry ... fail-closed` sowie `N3 Regressions-Gate + CI-Hook` für
Query-Perf, siehe 01_6_07 §2). Inhalt: Override-Guard gegen unbefugte Upstash-Overrides,
Host-Lock, Fix des transienten Exit-Codes, Audit auf Pool-Erschöpfung mit Loopback-Guard,
Retry-Wrapper `withConnectionRetry` verhält sich fail-closed.

**Warum lerntauglich:** Das ist das erste reale Hardening-Ereignis der DB-Zugriffsschicht
seit der VIP-Outsourcing-Runde (2026-06-28) — es zeigt das Muster, wie transient Fehler
behandelt werden dürfen (fail-closed statt stiller Retry-Schleifen) und wie ein
Regressions-Gate als CI-Hook abgesichert wird. Wallet-/DB-Pfad-Invarianten
(advisory locks, fail-closed 503) hängen direkt an dieser Schicht.

**How to apply:** Bei jeder neuen DB-/Pool-/Supabase-Client-Änderung: (1) Guards
(Override-Guard, Host-Lock, Loopback-Guard) nicht entfernen oder umgehen;
(2) neue Fehlerklassen als fail-closed behandeln, nicht als stillen Retry;
(3) Query-Perf-Änderungen gegen das bestehende Regressions-Gate laufen lassen,
nicht parallel dazu.
```

#### Entwurf A2 — `manual-branch-merge-conflict-resolution.md`

```markdown
---
name: manual-branch-merge-conflict-resolution
description: 'Verfahrens-Learning vom 2026-09-13: Merge-Konflikte werden nach Dateiinhalt + Zeitstempel manuell kombiniert, nie pauschal mit `--theirs` aufgelöst — inzwischen verbindliche Worldmap-§5-Regel.'
metadata:
  node_type: memory
  type: project
  originSessionId: TODO-Platzhalter-erst-bei-Schreiben-ersetzen
---

Fakt: Am 2026-09-13 wurde `merge(db): Säule 7 Query-Perf in database-merge` durchgeführt;
die Konflikte wurden manuell aufgelöst, indem **beide** Seiten kombiniert wurden
(„beide Sampler + beide npm-Scripts + N3-Gate kombiniert") statt eine Seite zu
verwerfen. Das Verfahren ist als verbindliche Regel in
`worldmap/00_WORLDMAP_STATUS.md` §5 eingeflossen: „bei echtem Konflikt nach
Dateiinhalt + Zeitstempel entscheiden".

**Warum lerntauglich:** Es ist ein Verfahrens-Ergebnis, kein Code-Fakt — aber genau
diese Entscheidungsregel ist wiederholbar und deckt sich mit der Worldmap-Regel
„Parameter raus, Algorithmus bleibt" (§5). Ein pauschales `--theirs` hätte den
N3-Gate bzw. den zweiten Sampler stillschweigend gelöscht.

**How to apply:** Bei jedem Merge-Konflikt: erst Dateiinhalt beider Seiten vergleichen
(und Zeitstempel als Tie-Breaker), dann kombinieren — niemals automatisch
`--theirs`/`--ours` wählen, wenn beide Seiten eigenständige Änderungen tragen.
Bei Unklarheit: Konfliktauflösung als eigenen Merge-Commit dokumentieren
(wie oben geschehen), damit die Entscheidung nachvollziehbar bleibt.
```

#### Entwurf A3 — `k5-mobile-lcp-campaign-foundation.md`

```markdown
---
name: k5-mobile-lcp-campaign-foundation
description: 'K5 Mobile-LCP-Kampagne (2026-09-14): Messbasis + 15 Routenpläne + erste Code-Änderungen — das Methodik-Fundament für alle künftigen CWV-Arbeiten im Casino-Repo.'
metadata:
  node_type: memory
  type: project
  originSessionId: TODO-Platzhalter-erst-bei-Schreiben-ersetzen
---

Fakt: Am 2026-09-14 wurde die Mobile-LCP-Kampagne als Commit
`perf(mobile-lcp): K5 — Mobile-LCP-Kampagne Stand 2026-09-13: Messbasis, 15 Routenpläne,
erste Code-Änderungen` verankert. Sie etabliert die Messbasis und 15 Routenpläne als
Methodik-Fundament; Folge-Commits bauen direkt darauf auf (K6 Componentry-Revamp,
K7 CWV-Pläne 01/05 — laut Commit-Historie 2026-09-14).

**Warum lerntauglich:** Es ist der festgelegte Referenzstand für alle
Mobile-LCP/CWV-Entscheidungen: spätere Sessions sollen die Messbasis und die
Routenpläne als Ausgangspunkt nutzen, statt CWV-Ziele neu zu erfinden oder
Messungen zu wiederholen.

**How to apply:** Vor jeder neuen CWV-/LCP-Änderung: Messbasis und den passenden
Routenplan aus der K5-Kampagne heranziehen (nicht neu messen), Änderung gegen den
Routenplan begründen. Folge-Meilensteine (K6, K7) im selben Kampagnenrahmen
behandeln, nicht als isolierte Fixes.
```

#### Index-Zeilen für `MEMORY.md` (je 1 Zeile, an bestehendes Listenmuster angelehnt)

```markdown
- [DB-Pooling-Chaos-Hardening 2026-09-13](db-pooling-chaos-hardening.md) — Override-Guard, Host-Lock, transient-Exit-Code-Fix, Pool-Erschöpfungs-Audit; fail-closed-Retries.
- [Manuelle Merge-Konfliktauflösung](manual-branch-merge-conflict-resolution.md) — Konflikte nach Dateiinhalt + Zeitstempel kombinieren, nie `--theirs` (Worldmap §5).
- [K5 Mobile-LCP-Kampagne](k5-mobile-lcp-campaign-foundation.md) — Messbasis + 15 Routenpläne als CWV-Methodik-Fundament.
```

### (b) Nachtrags-Pflege für `vip-rank-supabase-outsourcing.md` (Ziel L1)

Die Datei ist 78 Tage alt (geschrieben 2026-06-28); Substanz korrekt, aber Infrastruktur-Learnings fehlen (Bewertungs-Basis §Detailanmerkung 2). Muster-Vorlage ist der Update-Layer-Stil von `no-visual-check-frontend.md`: Update-Absatz **über** dem Ursprungsblock, Ursprungsregeln bleiben bewahrt statt gelöscht. Ergänzungszeilen-Entwurf (an oberster Body-Position einfügen, direkt nach dem Frontmatter):

```markdown
**Update 2026-09-14:** Der Befund dieser Datei (Stand 2026-06-28) ist weiterhin gültig,
die Infrastruktur-Lage darunter hat sich aber mehrfach verändert: DB-Pooling-Chaos-Hardening
(2026-09-13: Upstash-Override-Guard, Host-Lock, transient-Exit-Code-Fix, Pool-Erschöpfungs-Audit
mit Loopback-Guard, `withConnectionRetry` fail-closed), Query-Perf-Säule 7 samt
Regressions-Gate + CI-Hook (2026-09-13, manuell in `database-merge` kombiniert) und
pgTAP-Testinfrastruktur-Verbesserungen (`test(db): Settlement-Test-Fixes, pgTAP-Verbesserungen

- Audit-Reports`, 2026-09-14). Die Worldmap-Regel „Parameter raus, Algorithmus bleibt"
(`worldmap/00_WORLDMAP_STATUS.md` §5) gilt unverändert weiter.

**Aktuelle Einordnung:** Diese Datei deckt nur die VIP-/Rank-/Session-Auslagerung ab.
Für die DB-Zugriffs-/Pool-Schicht gilt seit 2026-09-13 zusätzlich
`[[db-pooling-chaos-hardening]]`; für Merge-/Infrastruktur-Verfahren gilt
`[[manual-branch-merge-conflict-resolution]]`.
```

Hinweis zur Ausführung: `metadata.modified` im Frontmatter der Datei auf den Schreibzeitpunkt aktualisieren (Muster: `no-visual-check-frontend.md` trägt `modified: 2026-09-13T19:02:18.209Z`).

### (c) Trigger-Vorschlag — „Wann entsteht ein project-Memory-Kandidat?" (Ziel L2)

**Verweiszeile (konsolidiert 2026-09-18, U03-L2 / U07-L0):** Die Trigger-Regel ist **primär** in [`06_u07_pflegekadenz_plan.md`](06_u07_pflegekadenz_plan.md) **§2a** abgelegt (vier Muster: lernreiche Commit-Welle ≥ 5 Commits · abgeschlossenes Options-Gate nach `xx_sop/01_workflow_jan_option_gate.md` · Security-/DB-Härtungsrunde · wiederholter Fehler ≥ 2×; Konsequenz stets: **ein** Entwurf als Schreibvorschlag, **nie Auto-Write**, Jan-Freigabe = Gate G1, danach Datei + Index-Zeile). Hier bleibt ausschließlich die project-spezifische Instanziierung dokumentiert — welche Kandidaten aus Trigger (1) tatsächlich als `project` landen (§Detailanmerkungen der Bewertungs-Basis: Kandidaten (a)–(e)); der Regeltext selbst wird **nicht** dupliziert. Die Kadenz-/Frequenzseite gehört zu 06_u07 (dort §2b Latenz-Regel, §2c Kadenz-Ziel).

---

## Fan-out-Check (Kriterium 5/6)

Alle 4 Meilensteine sind **abhängig** (L1 editiert eine Datei, deren Bruder-Neuanlagen aus L0 stammen; L2 verweist auf 06_u07; L3 rechnet die End-Deckung erst nach L0/L1). Kein unabhängiger Cluster → kein Fan-out. Gesamtaufwand: 3 Datei-Neuanlagen + 1 Nachtrag + 1 Cross-Verweis + 1 Rückschreibung ≈ 20–25 Minuten, jede Teilaufgabe < 10 Minuten → unter der ~45-Min.-/~10-Min.-Schwelle des Kriteriums 6. **Strikt sequenziell.**

---

## 3 — Expliziter Nicht-Scope

- **Kein Auto-Write:** Jeder Memory-Schreibvorgang (L0, L1) läuft über Gate G1; die globale Regel in `C:\Users\hambu\.claude\CLAUDE.md` wird nicht angefasst oder umgangen (Bottleneck #5 bleibt strukturell bestehen — nur Vorschlag + Freigabe, keine Regeländerung).
- **Keine weiteren Kandidaten:** Nur die Top 3 (A1–A3) werden angelegt. Kandidaten (d) K6 Componentry-Revamp und (e) K1 DB-Runde-2-Testinfrastruktur aus der Bewertungs-Basis bleiben bewusst offen (Nachfolger-Plan oder 06_u07-Batch).
- **Kein feedback/reference-Eintrag:** Die 4 feedback- und 1 reference-Einträge im Memory-Ordner werden nicht angetastet; keine Reklassifikation bestehender Einträge.
- **Keine Kadenz-/Frequenzplanung:** Frequenz, Latenz und systematische Pflege sind Thema von Plan 06_u07 (Kadenz) — hier nur der Typ-Abdeckungs-Schnitt (Cross-Verweis).
- **Keine Code- oder Migrations-Änderung:** Kein Dateiinhalt außerhalb `t_claude_code/` und des Memory-Ordners; `Money-Pfad: Nein`.

---

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` → `In Execution` → `Executed (archiviert)`.

- **Jan-Gates:** **Gate G1** — Freigabe für L0 (3 Writes + 3 Index-Zeilen) und L1 (1 Nachtrag). Am 2026-09-17 als **ein Sammel-Batch** mit den übrigen Typ-Abdeckungs-Plänen zusammengelegt; **Go am 2026-09-18 erteilt** und L0/L1 ausgeführt. Ohne Go wird nichts geschrieben; das Ausführungs-LLM liefert die Entwürfe (§2) und hält an.
- Nach Ausführung: Statuswechsel **in-place** auf `Executed (archiviert)` in der Kopfzeile dieser Datei — **kein** Eintrag in `worldmap/00_WORLDMAP_STATUS.md` (Abschnitt „Aktive Pläne" existiert nicht, verifiziert 2026-09-17) und **kein** Verschieben nach `docs/archive/` (Präzedenz 06_u06/06_u09/06_u10).
  **Abschluss 2026-09-18:** L0–L3 vollständig ausgeführt; Status in der Kopfzeile auf `Executed (archiviert)` gesetzt (in-place, kein Worldmap-Eintrag). L1 und U07-L1 sind derselbe Schreibvorgang (Koppelpunkt U07 §4) — der Kadenz-Erstnachweis ist damit erbracht.

---

## 5 — Niveau-Rückschreibung (nach Ausführung)

In [`../01_6_03_typ_abdeckung_project.md`](../01_6_03_typ_abdeckung_project.md) nachvollziehen:

|           Subsub            |         Vorher          |     Erwartet nach L0–L3     | Messkriterium                                                                             |
| :-------------------------: | :---------------------: | :-------------------------: | :---------------------------------------------------------------------------------------- |
|      1 Abdeckungsquote      | Top 80 % (1/≥ 5 ≈ 20 %) | Top ~30–40 % (4/≥ 5 ≈ 80 %) | 4 project-Dateien im Memory-Ordner                                                        |
|        2 Aktualität         |   Top 75 % (78 Tage)    |          Top ~25 %          | `vip-rank-supabase-outsourcing.md` trägt Update-Absatz 2026-09-14                         |
| 4 Kandidaten-Identifikation |        Top 85 %         |          Top ~45 %          | Trigger-Regel abgelegt (06_u07/06_u03) — Ausführungsbeleg folgt erst in späteren Sessions |
|      6 Klassifikation       |        Top 60 %         |          Top ~30 %          | 4 von 6+ Einträgen `project`, keine feedback-Fehl-Klassifikation                          |
|   **Gewichteter Schnitt**   |      **Top 71 %**       |      **~Top 40–45 %**       | Neu berechnen mit Original-Gewichtungen aus der Bewertungs-Basis                          |

Rückschreibung erst nach abgeschlossenem L3 und mit real gezählten Dateien (keine Soll-Werte als Ist ausgeben).

**Ergebnis (2026-09-18, real gezählt: 4 Dateien mit `metadata.type: project`):** Subsub 1 → Top 30 %, 2 → Top 25 %, 3 → Top 25 % (unverändert), 4 → Top 45 %, 5 → Top 85 % (unverändert, globaler Regel-Deckel), 6 → Top 30 % ⇒ **Top 39,75 % ≈ Top 40 %**. Die Projektion (~Top 40–45 %) ist getroffen; vollständige Herleitung mit Belegen in [`../01_6_03_typ_abdeckung_project.md`](../01_6_03_typ_abdeckung_project.md) Abschnitt „Niveau-Rückschreibung".
