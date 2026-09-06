# 07.1 — Trigger.dev-vs.-pg_cron-Entscheidungsregel dokumentieren

> **Status:** Executed (archiviert) · **Stand:** 2026-08-31 · **Owner:** LLM (kein Jan-Zuständigkeitspunkt mehr — L2 wurde nach Jans Ablehnung des CLAUDE.md-Router-Vorschlags auf eine Cross-Referenz-Lösung umgestellt, die kein CLAUDE.md-Edit mehr braucht) · **Scope:** Ausschließlich Unterkategorie #10 aus [`worldmap/07_background_jobs_scheduling.md`](../../worldmap/07_background_jobs_scheduling.md) („Dokumentierte Trigger.dev-vs.-pg_cron-Entscheidungsregel", vorher Top 68 %, jetzt Top 15 %). Kein Code-, Schema- oder Task-Eingriff.

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                                                                                                                                                                                     | Status      | Nächster Schritt                                                             | Zuständigkeit |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- | ------------- |
| L0     | Bestandsaufnahme (Kriterium + Belege aus den 8 bestehenden Jobs ableiten)                                                                                                                                       | 🟢 Executed | — bereits in `07_background_jobs_scheduling.md` Detailabschnitt #10 erledigt | LLM           |
| L1     | SOP-Datei `xx_sop/20_background_jobs_scheduling.md` verfassen                                                                                                                                                   | 🟢 Executed | —                                                                            | LLM           |
| L2     | Auffindbarkeit lösen — **umgestellt nach Jans Ablehnung** von „neue CLAUDE.md-Router-Zeile" (zu selten genutzt, unnötiger dauerhafter Context-Overhead) auf zwei bereits organisch getriggerte Cross-Referenzen | 🟢 Executed | — Details in Abschnitt 2                                                     | LLM           |
| L3     | Aufschlüsselungsdatei aktualisieren (#10 Niveau, Kompaktübersicht, rechnerischer Schnitt)                                                                                                                       | 🟢 Executed | —                                                                            | LLM           |
| L4     | Selbstprüfung (SOP-03 §4)                                                                                                                                                                                       | 🟢 Executed | —                                                                            | LLM           |
| L5     | Archivierung dieser Planungsdatei nach `docs/archive/`                                                                                                                                                          | 🟢 Executed | — diese Datei liegt ab jetzt dort                                            | LLM           |

Ampel: 🔴 geplant · 🟡 in Ausführung · 🟢 verifiziert ausgeführt.

## 2 — Meilenstein-Details

### L0 — Bestandsaufnahme

- **Ziel:** Belastbare Faktenbasis für die Regel, keine Annahmen.
- **Scope:** Nur Auswertung bereits verifizierter Funde aus `07_background_jobs_scheduling.md` (9 Trigger.dev-Tasks, 5 pg_cron-Migrationen, 3 native Trigger.dev-Crons).
- **Abhängigkeiten:** keine.
- **Freigabe-Gate:** keins.
- **Verifizierung:** Kriterium deckt alle 8 geplanten Jobs (5 `pg_cron` + 3 native Crons) widerspruchsfrei ab, inkl. der einen bekannten Ausnahme.
- **Nicht-Scope:** Die 6 rein event-getriggerten Tasks (`deliver-digest`, `digest-preview`, `send-player-recap`, `big-win-notify`, `fraud-alert-wait`, `player-onboarding-drip`) — diese haben keinen Scheduling-Zeitpunkt, für den die Regel gelten müsste, sie werden aus bereits geplanten Jobs heraus oder von der App ausgelöst.

### L1 — SOP-Datei verfassen

- **Ziel:** `xx_sop/20_background_jobs_scheduling.md` — verbindliche, nachvollziehbare Entscheidungsregel, wann ein neuer geplanter Job als `pg_cron`-Migration vs. natives Trigger.dev-Cron gebaut wird.
- **Scope:** Nur die Entscheidungsregel + ihre Begründung + die dokumentierte Ausnahme + der Pflicht-Checkpunkt für neue `wallet_events`-Konsumenten (Lehre aus Migration 048). Keine vollständige Kontextreferenz-Migration der ganzen Kategorie (das wäre Selbstprüfungspunkt 1 aus `07_background_jobs_scheduling.md` — separat, größer, nicht Teil dieses Plans).
- **Abhängigkeiten:** L0.
- **Freigabe-Gate:** keins — neue Datei, kein bestehender Code/Schema betroffen, kein Money-Pfad.
- **Verifizierung:** Format folgt der SOP-Artefaktklasse aus `xx_sop/03_workflow_jan_planungsdateien.md` §1 (Trigger, Voraussetzungen, Ablauf, Prüfschritte statt volatiler Live-Behauptungen); jede Tabellenzeile mit konkretem `file:line`-Beleg.
- **Nicht-Scope:** keine Änderung an `src/trigger/**` oder `supabase/migrations/**`.

### L2 — Auffindbarkeit ohne CLAUDE.md-Router-Zeile

- **Ziel:** Neue SOP auffindbar machen, ohne einen dauerhaften, bei jeder Session mitgeladenen CLAUDE.md-Router-Eintrag zu belegen.
- **Ursprünglicher Ansatz (abgelehnt):** Eine neue Zeile im CLAUDE.md-SOP-Router, analog zu den bestehenden 19 Zeilen. Jans Rückmeldung: „Das möchte ich nicht in die CLAUDE.md-Dateien hinzufügen — viel zu unnötig, weil das viel zu selten vorkommt." Begründung nachvollziehbar: Ein neuer wiederkehrender Hintergrundjob ist ein seltenes Ereignis (8 Fälle über die gesamte bisherige Projektlaufzeit), ein Router-Eintrag kostet aber Kontext-Overhead in **jeder** Session, unabhängig davon, ob Scheduling gerade Thema ist.
- **Umgesetzter Ansatz:** Zwei Cross-Referenzen an Stellen, die bereits organisch aufgesucht werden, wenn der Bedarf entsteht — kein neuer, permanent geladener Einstiegspunkt:
  1. Ein Verweis-Block-Eintrag oben in [`xx_sop/18_postgres_patterns_migrations.md`](../../xx_sop/18_postgres_patterns_migrations.md) — diese Datei ist bereits über den bestehenden CLAUDE.md-Router-Eintrag „Postgres & DB-Migrationen" abgedeckt (Trigger: „Bei DB-Migrationen, Concurrency-Locks, Indexierung & RLS-Optimierung"). Da jeder neue `pg_cron`-Job zwangsläufig als Migration angelegt wird, ist dieser Pfad bereits automatisch abgedeckt, ohne eine neue Router-Zeile zu brauchen.
  2. Ein einzeiliger Kommentar direkt in [`trigger.config.ts:7`](../../trigger.config.ts) — der einzigen zentralen Config-Datei, die zwangsläufig geöffnet wird, wenn ein neuer Trigger.dev-Task/Cron angelegt wird (bestehendes Kommentar-Muster in derselben Datei bereits vorhanden, z. B. der `maxDuration`-Hinweis direkt darüber).
- **Abdeckungslücke, ehrlich benannt:** Diese Lösung deckt beide beobachteten Entstehungswege eines neuen geplanten Jobs ab (neue `pg_cron`-Migration, neuer nativer Trigger.dev-Cron), aber nicht den Fall, dass jemand ohne Migrations- oder Config-Berührung direkt eine neue Task-Datei in `src/trigger/` anlegt, ohne `trigger.config.ts` zu öffnen — ein seltener, aber möglicher Lücken-Fall, bewusst in Kauf genommen statt eines Router-Eintrags.
- **Abhängigkeiten:** L1 (Dateipfad muss feststehen).
- **Freigabe-Gate:** keins mehr — kein CLAUDE.md-Edit, daher keine Hard-Rule-Berührung.
- **Verifizierung:** Beide Cross-Referenzen gesetzt — [`xx_sop/18_postgres_patterns_migrations.md`](../../xx_sop/18_postgres_patterns_migrations.md) Zeile 7, [`trigger.config.ts`](../../trigger.config.ts) Zeile 7.
- **Nicht-Scope:** jede Änderung an `CLAUDE.md`.
- **Money-Pfad:** Nein. **Security-Review:** Nein.

### L3 — Aufschlüsselungsdatei aktualisieren

- **Ziel:** `07_background_jobs_scheduling.md` spiegelt den neuen Ist-Zustand von Unterkategorie #10 wider (Kompaktübersicht-Zeile, Detailabschnitt #10, neu berechneter rechnerischer Schnitt über alle 10 Positionen, „Verwandte Artefakte"-Tabelle um die neue SOP-Datei ergänzt).
- **Scope:** Nur Unterkategorie #10 und die davon abhängigen Aggregatwerte (rechnerischer Schnitt) — die anderen 9 Unterkategorien bleiben unverändert, da nicht Teil dieses Plans.
- **Abhängigkeiten:** L1.
- **Freigabe-Gate:** keins.
- **Verifizierung:** Neuer rechnerischer Schnitt nachgerechnet und im Dokument mit der Rechnung (nicht nur dem Ergebnis) belegt, analog zum bestehenden Muster in `04_security_hardening.md`.
- **Nicht-Scope:** `00_WORLDMAP_STATUS.md` Zeile 24 (Kategorie-07-Headline „Top 20 %") bleibt unverändert — eine Umstellung auf den rechnerischen Schnitt als Headline-Methodik ist laut Präzedenzfall Kategorie 04 eine eigenständige, explizite Jan-Entscheidung und nicht Teil dieses Plans.

### L4 — Selbstprüfung

- **Ziel:** Sicherstellen, dass eine neue LLM-Konversation ohne Chatverlauf die SOP-Datei und diese Planungsdatei allein verstehen und anwenden kann (SOP-03 §4).
- **Scope:** Reine Prüfung, keine inhaltliche Änderung außer Nachbesserung gefundener Lücken.
- **Abhängigkeiten:** L1, L3.
- **Freigabe-Gate:** keins.
- **Verifizierung:** Checkliste aus `xx_sop/03_workflow_jan_planungsdateien.md` §4 einzeln durchgegangen (siehe Abschnitt 3 unten).
- **Nicht-Scope:** —

### L5 — Archivierung

- **Ziel:** Lebenszyklus-Konformität mit SOP-03 §2 — nach vollständiger Ausführung wird die Planungsdatei nach `docs/archive/` verschoben, Status auf „Executed (archiviert)".
- **Scope:** Datei-Verschiebung + Status-Kopfzeile, kein Inhalt wird sonst verändert.
- **Abhängigkeiten:** L2 (muss zuerst geklärt sein, sonst ist der Plan nicht 100 % abgeschlossen).
- **Freigabe-Gate:** keins (reine Ablage-Hygiene nach SOP-03 §5).
- **Verifizierung:** Datei liegt unter `docs/archive/`, `worldmap/`-Version existiert nicht mehr doppelt.
- **Nicht-Scope:** —

## 3 — Selbstprüfung vor „Execution-Ready" (SOP-03 §4, durchgegangen)

- ✅ Scope gegenüber verwandten Plänen abgegrenzt (Abgrenzung zu Selbstprüfungspunkt 1/4/5 aus `07_background_jobs_scheduling.md` explizit benannt — die sind NICHT Teil dieses Plans).
- ✅ Abhängigkeiten, Reihenfolge, Jan-Entscheidungen benannt (nur L2).
- ✅ Keine neue Datenklasse/API-Grenze/Schreiboperation — daher kein Allowlist/Negativtest/Fallback nötig (reine Doku).
- ✅ Statusbehauptungen als lokal/verifiziert gekennzeichnet — alle Fakten stammen aus der bereits verifizierten Aufschlüsselungsdatei, keine neuen Live-Behauptungen.
- ✅ Keine Referenz doppelt als SOP, Kontextreferenz und Plan gepflegt — `xx_sop/20_...` (Regel) und diese Datei (Ausführungsschritte) haben getrennte, nicht überlappende Inhalte.
- ✅ Datei von neuer LLM-Konversation ohne Zusatzkontext verständlich — Scope-Zeile im Kopf verlinkt auf die Ursprungsdatei, jeder Meilenstein ist in sich abgeschlossen.

## 4 — Verwandte Artefakte

| Bedarf                                                 | Datei                                                                                          |
| :----------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| Ursprüngliche Aufschlüsselung inkl. Unterkategorie #10 | [`worldmap/07_background_jobs_scheduling.md`](../../worldmap/07_background_jobs_scheduling.md) |
| Neue Entscheidungsregel (Ergebnis von L1)              | [`xx_sop/20_background_jobs_scheduling.md`](../../xx_sop/20_background_jobs_scheduling.md)     |
| Planungsdatei-Format-Vorgabe                           | [`xx_sop/03_workflow_jan_planungsdateien.md`](../../xx_sop/03_workflow_jan_planungsdateien.md) |
| Vorbild-Methodik (Sub-Kategorie-Härtung)               | [`worldmap/04_security_hardening.md`](../../worldmap/04_security_hardening.md)                 |
