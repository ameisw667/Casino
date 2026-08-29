# 07 — n8n Deep Dive: Lead-Gen, Enrichment & Outreach-Mastery (Casino als Übungsfeld)

> **Status:** Geplant · **Stand:** 2026-08-28 (v2, recherche-verifiziert) · **Owner:** LLM · **Scope:** Übergreifende, projektunabhängige n8n-Skill-Roadmap (Sourcing → Enrichment → Personalisierung → Versand → Tracking → Skalierung → Compliance). Das Casino-Projekt dient nur als sicheres, bereits vorhandenes Übungsfeld — die eigentliche Zielkompetenz ist für Jans spätere, hier nicht näher benannte **B2C-Software** gedacht und 1:1 übertragbar.
> **Money-Pfad:** Nein für das Casino-Repo · **Hinweis:** Externe Dienste (Apify, ggf. spätere Deliverability-Tools) laufen auf Jans eigenen Accounts/Kontingenten, ohne Bezug zu Casino-Wallet-Invarianten. **Security-Review:** Nein für die Sandbox-Stufen A–F (kein Wallet-/Auth-/DB-Schreibpfad des Casino-Repos betroffen); Stufe L (Rückintegration) erbt die Security-Regeln des jeweils berührten Casino-Bereichs.
> **Dokumentations-Stand:** Alle technischen Aussagen zu n8n-, Apify- und Ethereal-APIs wurden am 2026-08-28 gegen die aktuelle Anbieter-Dokumentation verifiziert (Quellen: Abschnitt 7). Frühere Version (v1) enthielt einen unverifizierten Trigger-Mechanismus — siehe Anhang (Abschnitt 8) für die Korrektur.

---

## 0 — Übersicht für Jan

Die eigentliche Frage hinter diesem Plan ist nicht "wie verschicke ich 100 Test-Mails", sondern: **welche Bausteine braucht eine wiederverwendbare Lead-Gen-/Outreach-Maschine**, die du später 1:1 auf ein echtes B2C-Produkt umlegen kannst? Das Casino-Projekt liefert dafür ein realistisches, aber risikofreies Testfeld — echte Architekturmuster (API-Grenzen, Idempotenz, Rate-Limits), ohne dass irgendwo ein echter Kunde oder echtes Geld betroffen ist.

Diese Datei ist bewusst als **Stufen-Roadmap** angelegt (analog zu `Z_LLM/10_llm_erweiterung.md`) statt als einzelner Ausführungsplan — sie wächst mit, statt bei jedem neuen Gedanken eine neue Datei zu brauchen.

**Was du insgesamt bereitstellen musst — alles einmalige Setup-Schritte, gestaffelt nach Bedarf:**

| Dienst                                                               | Wofür                                                                                                            | Ab welcher Stufe nötig | Aufwand                                                                                |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | :--------------------: | -------------------------------------------------------------------------------------- |
| n8n-Instanz-URL + n8n-API-Key                                        | Grundanbindung, alle Workflows                                                                                   |           A            | Niedrig — 1 Klick in n8n-Settings                                                      |
| Apify-API-Token                                                      | Lead-Sourcing (Google-Maps-Scraper)                                                                              |           B            | Niedrig — kostenloser Account reicht                                                   |
| — (nichts)                                                           | Enrichment                                                                                                       |           C            | Kein zusätzlicher Key                                                                  |
| Eigener LLM-API-Key (z. B. OpenAI, **nicht** der Casino-Projekt-Key) | Personalisierung                                                                                                 |           E            | Niedrig — vorhandenen Key wiederverwenden oder neuen anlegen, Ausgaben-Limit empfohlen |
| Test-IMAP-Postfach (z. B. weiteres Ethereal- oder Gmail-Testkonto)   | Reply-Tracking                                                                                                   |           H            | Niedrig, nur bei Bedarf                                                                |
| —                                                                    | Deliverability/Warm-up/Compliance sind bis Stufe M nur konzeptionell, kein echter Versand                        |          G, M          | Kein Aufwand                                                                           |
| — (nichts, LLM generiert selbst)                                     | Webhook-Header-Secret zur Absicherung des Trigger-Endpunkts (verhindert, dass Dritte den Workflow fremdauslösen) |           F            | Kein Jan-Aufwand — wird als n8n-Credential per API angelegt                            |

Alles darüber hinaus (Workflow-Design, Datenhaltung, Personalisierungslogik, Fehlerbehandlung, Skalierung) baue ich headless.

### Gesamtübersicht aller Stufen

| Stufe | Meilenstein                                                                         | Lerneffekt für späteres B2C-Produkt                                                                       |     Status     | Zuständigkeit |
| :---: | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | :------------: | :-----------: |
| **A** | n8n-API-Grundanbindung                                                              | Fundament jeder Automation: headless Workflow-Erstellung ohne UI-Klicks                                   |   🔴 Geplant   |   Jan + LLM   |
| **B** | Lead-Sourcing (Apify Google-Maps-Scraper)                                           | Externe Datenquelle strukturiert anzapfen — später: Branchenverzeichnisse, App-Store-Reviews, etc.        |   🔴 Geplant   |   Jan + LLM   |
| **C** | Enrichment (Website-Crawl für fehlende Kontakte)                                    | Lückenhafte Rohdaten zu nutzbaren Leads veredeln — Kernkompetenz jeder Lead-Gen-Pipeline                  |   🔴 Geplant   |      LLM      |
| **D** | Persistente Lead-Ablage + Dedupe                                                    | Datenhaltung/Idempotenz für wiederkehrende Läufe — vermeidet Doppel-Kontaktierung                         |   🔴 Geplant   |      LLM      |
| **E** | Personalisierung via LLM-Node                                                       | KI-generierte, individuelle Anschreiben statt Templates — direkt übertragbar auf echtes Produkt-Messaging |   🔴 Geplant   |      LLM      |
| **F** | Sandbox-Versand & Preview (Ethereal)                                                | Versandlogik, Templating, Loop-Verarbeitung — ohne Zustellrisiko                                          |   🔴 Geplant   |      LLM      |
| **G** | Deliverability-Grundlagen (SPF/DKIM/DMARC, Warm-up, Bounce-Handling)                | Verhindert, dass ein echtes Produkt später im Spam landet oder die Domain verbrennt                       | ⬜ Horizont 2  |      LLM      |
| **H** | Reply-Tracking & Funnel-Analytics                                                   | Erkennt Antworten/Erfolg automatisiert — Grundlage für jede Outreach-Erfolgsmessung                       | ⬜ Horizont 2  |      LLM      |
| **I** | A/B-Testing von Betreffzeilen/Templates                                             | Datengetriebene Optimierung statt Bauchgefühl                                                             | ⬜ Horizont 2  |      LLM      |
| **J** | Fehlerbehandlung & Robustheit (Error-Workflows, Retries, Idempotenz)                | Gleiches Muster wie Casino-Service-Layer (`Idempotency-Key`, fail-closed) — Cross-Projekt-Transfer        | ⬜ Horizont 2  |      LLM      |
| **K** | Skalierung & Scheduling (Cron, Batching, Rate-Limiting)                             | Von 20 Test-Leads auf tausende — ohne APIs zu sprengen oder gesperrt zu werden                            | ⬜ Horizont 2  |      LLM      |
| **L** | Rückintegration ins Casino-Projekt (interner Notification-Hub: Fraud/Sentry/GitHub) | Zeigt denselben n8n-Werkzeugkasten für **interne Ops** statt Consumer-Outreach — kein Consumer-Risiko     | ⬜ Horizont 2  |   Jan + LLM   |
| **M** | Compliance-/Governance-Playbook (DSGVO, Anti-Spam-Recht, Consent-Modelle)           | Wiederverwendbares Nachschlagewerk, das vor jedem echten B2C-Outreach zwingend gelesen wird               | ⬜ Horizont 2  |      LLM      |
| **N** | Übergang zu echtem B2C-Produkt                                                      | Expliziter Marker: eigenes, neues Projekt, eigener Plan, eigene Freigabe — hier nur Ausblick              | ⬜ Nicht-Scope |   Jan + LLM   |

> **Ampel-Logik wie gewohnt:** 🔴 geplant, 🟡 in Ausführung, 🟢 verifiziert ausgeführt. Stufen G–N sind bewusst als "Horizont 2" markiert — sie werden erst im Detail geplant, sobald A–F verifiziert durchgelaufen sind, damit die Datei nicht auf Vorrat Komplexität anhäuft, die sich noch ändert.

---

## 1 — Warum diese Reihenfolge

- **A–C zuerst:** Ohne eine echte, aber harmlose Datenquelle (B) und eine Methode, Lücken zu schließen (C), ist jeder spätere Schritt nur Deko. Das war schon in der vorherigen Version dieses Plans richtig erkannt.
- **D vor E/F:** Persistenz und Dedupe müssen stehen, bevor personalisiert und "versendet" wird — sonst lernt man Versand-Mechanik, aber nicht das eigentlich harte Problem (wen habe ich schon kontaktiert, wen nicht).
- **E vor F:** Personalisierung ist der Teil, der ein Produkt später tatsächlich von generischem Spam unterscheidet — bewusst vor dem reinen Versand-Test platziert, damit er nicht zur Nebensache wird.
- **G–K erst nach verifiziertem A–F:** Deliverability, Reply-Tracking, A/B-Testing, Fehlerbehandlung und Skalierung sind reale Themen, aber ohne eine laufende Basis-Pipeline nur Theorie. Sie werden erst im Detail geplant, wenn A–F steht.
- **L parallel möglich:** Die Rückintegration als interner Notification-Hub (siehe frühere Diskussion zu Fraud-Alerts/Sentry/GitHub) braucht keine der Lead-Gen-Bausteine — kann jederzeit separat vorgezogen werden, wenn Jan will.
- **M vor jedem realen Einsatz Pflichtlektüre**, unabhängig davon, wie weit A–L technisch sind.
- **N ist und bleibt außerhalb dieses Plans** — neues Produkt, neuer Plan, eigene Freigabe.

### Portabilitäts-Matrix — was überträgt sich 1:1 auf das spätere B2C-Produkt

| Sandbox-Baustein (dieser Plan)                     | Analoges Problem im echten B2C-Produkt                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Stufe B — Apify Google-Maps-Scraper                | Beliebige externe Datenquelle strukturiert anzapfen (App-Store-Reviews, Verzeichnisse, öffentliche APIs von Wettbewerbern)  |
| Stufe C — Website-Enrichment                       | Lückenhafte Rohdaten (z. B. aus einem Signup-Formular) zu vollständigen Nutzerprofilen anreichern                           |
| Stufe D — Persistente Ablage + Dedupe              | Produktions-Datenhaltung mit Idempotenz — exakt das Muster, das der Casino-Service-Layer selbst schon für Bets/Wallet nutzt |
| Stufe E — LLM-Personalisierung                     | Individualisiertes Onboarding/Messaging statt generischer Templates                                                         |
| Stufe F — Webhook-Trigger + Header-Auth            | Jeder extern auslösbare Automation-Endpunkt im echten Produkt braucht dieselbe Absicherung                                  |
| Stufe J (Horizont 2) — Fehlerbehandlung/Idempotenz | Direkt übertragbar aus dem bereits vorhandenen Casino-Muster (`Idempotency-Key`, fail-closed)                               |
| Stufe M — Compliance-Fakt (UWG)                    | Jedes künftige B2C-Produkt mit E-Mail-Funktion braucht dieselbe Prüfung, bevor der erste reale Versand passiert             |

---

## 2 — Detailmeilensteine (Execution-Ready-Kandidaten: Stufe A–F)

> Jede Stufe verlinkt auf ihre vertiefende Referenzdatei in [`docs/n8n/`](../docs/n8n/00_INDEX.md) — dort steht das technische "Wie genau" (exakte Endpunkte, Node-Konfiguration, Fehlerfälle), hier nur Ziel/Scope/Gate/Verifizierung gemäß Planungsdatei-Konvention.

### Stufe A — n8n-API-Grundanbindung

- **Details:** [`docs/n8n/01_n8n_api_reference.md`](../docs/n8n/01_n8n_api_reference.md)
- **Ziel:** Verbindung zur bestehenden n8n-Instanz verifizieren, erstes Workflow-Objekt headless per API anlegen können.
- **Scope:** `GET {instanz-url}/api/v1/workflows` mit `X-N8N-API-KEY`-Header als Verbindungstest (Base-Path `/api/v1` laut aktueller n8n-API-Doku, docs.n8n.io/connect/n8n-api). Zusätzlich in diesem Schritt geklärt: n8n hat **keinen dokumentierten, verlässlichen "Führe Workflow X jetzt aus"-Endpunkt für Manual-Trigger-Workflows** — die Community bestätigt das als bekannte Einschränkung. Deshalb wird der Trigger-Mechanismus für alle folgenden Stufen von Anfang an auf einen **Webhook-Trigger-Node** ausgelegt (siehe Stufe F) statt auf einen ungesicherten Annahme-Endpunkt.
- **Abhängigkeiten:** Jan liefert n8n-Instanz-URL + n8n-API-Key.
- **Freigabe-Gate:** Kein Schreibzugriff in diesem Schritt.
- **Verifizierung:** HTTP 200 mit Workflow-Liste (auch leer).
- **Nicht-Scope:** Keine Änderung an bestehenden n8n-Workflows.

### Stufe B — Lead-Sourcing (Apify)

- **Details:** [`docs/n8n/02_lead_sourcing_apify_reference.md`](../docs/n8n/02_lead_sourcing_apify_reference.md)
- **Ziel:** Reale, öffentliche Firmendaten aus einem bewusst kleinen, harmlosen Testsegment ziehen (z. B. "Cafés in einem einzelnen Stadtteil", ~20–50 Einträge).
- **Scope:** Apify-Actor `compass/crawler-google-places` ("Google Maps Scraper", einer der etabliertesten Actors dieser Kategorie) per Apify-API aufrufen — konkret über den **synchronen** Endpunkt `POST https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token={APIFY_TOKEN}` (Actor-ID im URL-Pfad mit `~` statt `/`). Der Sync-Endpunkt liefert die Ergebnisdaten direkt in der Antwort zurück — kein separates Polling eines asynchronen Runs nötig, das vereinfacht den Workflow gegenüber dem klassischen `/runs`-Endpunkt erheblich. Übernommene Felder: Name, Adresse, Telefon, Website, ggf. bereits vorhandene Email.
- **Abhängigkeiten:** Jan liefert Apify-API-Token.
- **Freigabe-Gate:** Keins — reines Lesen öffentlicher Google-Maps-Daten.
- **Verifizierung:** 20–50 plausible, echte Firmendatensätze, HTTP 200/201 vom Sync-Endpunkt.
- **Nicht-Scope:** Keine Privatpersonen, keine Social-Media-Scraper, keine gekauften Listen.

### Stufe C — Enrichment

- **Details:** [`docs/n8n/03_enrichment_reference.md`](../docs/n8n/03_enrichment_reference.md)
- **Ziel:** Für Einträge ohne Email die Firmen-Website crawlen, öffentlich sichtbare Kontakt-Email extrahieren.
- **Scope:** HTTP-Request-Node auf Kontakt-/Impressum-Seite + Regex-Extraktion.
- **Abhängigkeiten:** Stufe B.
- **Freigabe-Gate:** Keins — reiner Lesezugriff auf öffentlich erreichbare Webseiten.
- **Verifizierung:** Messbar höherer Anteil an Datensätzen mit vorhandener Email nach Enrichment.
- **Nicht-Scope:** Kein Umgehen von Login-/Bezahlschranken.

### Stufe D — Persistente Lead-Ablage + Dedupe

- **Details:** [`docs/n8n/04_lead_storage_dedupe_reference.md`](../docs/n8n/04_lead_storage_dedupe_reference.md)
- **Ziel:** Leads über mehrere Workflow-Läufe hinweg speichern, Duplikate anhand Firmenname+Adresse erkennen.
- **Scope:** Eigene, vom Casino-Schema komplett isolierte Ablage (z. B. n8n-eigene Datenbank-Node oder Google Sheet — **keine** Supabase-Tabelle im Casino-Projekt).
- **Abhängigkeiten:** Stufe B/C.
- **Freigabe-Gate:** Vor Anlage der Ablage kurze Bestätigung von Jan, welches Speichermedium er bevorzugt (Google Sheet vs. eigene kleine DB).
- **Verifizierung:** Zweiter Lauf mit teilweise überlappenden Leads erzeugt keine Duplikate.
- **Nicht-Scope:** Keine Berührung irgendeiner Casino-Supabase-Tabelle.

### Stufe E — Personalisierung via LLM-Node

- **Details:** [`docs/n8n/05_personalization_llm_reference.md`](../docs/n8n/05_personalization_llm_reference.md)
- **Ziel:** Je Lead ein individuelles Anschreiben generieren (z. B. Bezug auf Branche/Ort), statt eines starren Templates.
- **Scope:** n8n-OpenAI-Node (oder vergleichbar) mit den angereicherten Lead-Daten als Prompt-Kontext.
- **Abhängigkeiten:** Stufe C/D.
- **Freigabe-Gate:** Keins — reine Texterzeugung, kein Versand.
- **Verifizierung:** Stichprobe zeigt erkennbar individualisierte, nicht austauschbare Texte je Lead.
- **Nicht-Scope:** Keine Übernahme in einen echten Versand außerhalb der Sandbox.

### Stufe F — Trigger-Absicherung, Sandbox-Versand & Preview

- **Details:** [`docs/n8n/06_sandbox_email_security_reference.md`](../docs/n8n/06_sandbox_email_security_reference.md)
- **Ziel:** Den kompletten Workflow (A–E) headless und **sicher** auslösbar machen, personalisierte Mails über einen risikofreien Test-Mailserver "versenden".
- **Scope, zwei Teile:**
  1. **Trigger:** Statt eines Manual-Triggers (der sich laut Stufe-A-Recherche nicht verlässlich per API auslösen lässt) bekommt der Workflow einen **Webhook-Trigger-Node**. Damit ein öffentlich erreichbarer Webhook nicht von Dritten fremdausgelöst werden kann (unnötige Apify-Kosten, unnötige Enrichment-Requests gegen fremde Websites), wird der Webhook-Node mit **Header-Auth** abgesichert: Ein zufälliges Secret wird vom LLM generiert und als n8n-Credential per `POST /api/v1/credentials` angelegt (n8n unterstützt Credential-Anlage per API — die Werte sind danach nur noch schreibend, nicht mehr auslesbar, was für ein Secret genau richtig ist). Der eigentliche Lauf wird dann per `POST {instanz-url}/webhook/{pfad}` mit passendem Auth-Header ausgelöst — vollständig headless, ohne SSH, ohne UI-Klick.
  2. **Versand:** Ethereal-Testaccount wird zur Laufzeit per HTTP-Request-Node erzeugt — `POST https://api.nodemailer.com/user` mit Body `{"requestor": "casino-n8n-deepdive", "version": "1.0"}` — Send-Email-Node nutzt die zurückgegebenen SMTP-Zugangsdaten.
- **Abhängigkeiten:** Stufe E (Inhalt), Stufe A (Erkenntnis zum Trigger-Mechanismus).
- **Freigabe-Gate:** **Vor dem ersten Schreib-Call gegen die n8n-Instanz (Credential + Workflow anlegen) holt das LLM eine kurze Bestätigung von Jan ein.**
- **Verifizierung:** (a) Ein Trigger-Aufruf ohne korrekten Header-Auth-Wert wird mit 401/403 abgelehnt — Negativtest Pflicht, bevor die Stufe als abgeschlossen gilt. (b) Preview-Links zeigen korrekt personalisierte Inhalte für alle Leads mit Email.
- **Nicht-Scope:** Kein echter Provider, kein Domain-Setup, kein SPF/DKIM in dieser Stufe. Der Workflow wird **nicht aktiviert/permanent live geschaltet** — er bleibt bis auf Weiteres nur gezielt per authentifiziertem Webhook-Call ausführbar.

---

## 3 — Horizont 2 (Stufen G–M, grob skizziert)

> Diese Stufen werden erst mit vollem SOP-Detail (Ziel/Scope/Abhängigkeiten/Freigabe-Gate/Verifizierung) geplant, sobald A–F verifiziert abgeschlossen sind. Hier nur die Leitidee, damit der langfristige Bogen sichtbar ist.

- **G — Deliverability-Grundlagen:** SPF/DKIM/DMARC konzeptionell durcharbeiten, Warm-up-Strategie (langsam steigendes Sendevolumen) und Bounce-/Suppression-Handling als wiederverwendbares Playbook — ohne in dieser Stufe real zu versenden.
- **H — Reply-Tracking:** IMAP-Node liest ein Test-Postfach, erkennt Antworten automatisiert, einfache Funnel-Metrik (kontaktiert → geöffnet-Proxy → geantwortet).
- **I — A/B-Testing:** Zwei Betreffzeilen-/Text-Varianten parallel durch dieselbe Lead-Liste laufen lassen, Ergebnis auswerten.
- **J — Fehlerbehandlung & Robustheit:** n8n-Error-Workflows, Retry-Strategien, Rate-Limiting gegenüber Apify/Ziel-Websites — bewusst im selben Denkmuster wie der Casino-Service-Layer (Idempotenz, fail-closed statt fail-open).
- **K — Skalierung:** Von 20–50 Test-Leads auf mehrere hundert/tausend, Batching, Scheduling, Kosten-/Kontingent-Überwachung bei Apify.
- **L — Rückintegration ins Casino-Projekt:** n8n als **interner** Notification-Hub (Fraud-Scan-Alerts, Sentry-Enrichment, GitHub-Advisories — siehe frühere Diskussion) statt Consumer-Outreach. Kein Bezug zu echten Casino-Endnutzern, daher risikoarm und jederzeit vorziehbar.
- **M — Compliance-/Governance-Playbook:** DSGVO-Grundlagen, Anti-Spam-Recht (z. B. UWG in Deutschland, CAN-SPAM/GDPR je nach Zielmarkt), Consent-Modelle — vollständig bereits vorgezogen ausgearbeitet in [`docs/n8n/07_compliance_legal_reference.md`](../docs/n8n/07_compliance_legal_reference.md), da diese Erkenntnis für Stufe N zu wichtig ist, um erst spät im Horizont-2-Block behandelt zu werden.

> **Bereits jetzt recherchierter Kern-Fakt (nicht erst in Stufe M, sondern schon hier als harte Grenze für Stufe N):** Für Deutschland gilt nach § 7 UWG, dass E-Mail-Werbung grundsätzlich eine **vorherige ausdrückliche Einwilligung** voraussetzt — auch im B2B-Bereich, auch wenn die Adresse aus einer öffentlichen Quelle (Impressum, Google Maps, Branchenverzeichnis) stammt. Die einzige Ausnahme (§ 7 Abs. 3 UWG, Bestandskundenwerbung) greift **nur bei bereits bestehender Geschäftsbeziehung** — nicht bei Kaltakquise unbekannter Kontakte, also nicht bei den in Stufe B gesourcten Leads. Das heißt konkret: **Genau der Datensatz, den dieser Plan in Stufe B/C erzeugt, hat für echten Versand in Deutschland ohne vorherige Einwilligung keine tragfähige Rechtsgrundlage.** Diese Erkenntnis ist der wichtigste Grund, warum der Versand in diesem Plan dauerhaft auf Ethereal (Sandbox) begrenzt bleibt und Stufe N zwingend eine eigene rechtliche Prüfung braucht, bevor auch nur ein einziger echter Empfänger kontaktiert wird.

---

## 4 — Nicht-Scope (Stufe N)

Der Übergang zu einem echten B2C-Produkt mit echten Kunden ist **nicht Teil dieser Datei** — neues Projekt, neuer Plan, eigene Freigabe nach `xx_sop/01_workflow_jan_option_gate.md`. Diese Datei liefert bis dahin nur die übertragbaren Bausteine.

---

## 5 — Selbstprüfung (vor Execution-Ready für Stufe A–F)

- Scope ist klar von echtem Outreach (Stufe N) abgegrenzt — keine Vermischung.
- Kein Money-Pfad, kein Auth-Pfad, keine Supabase-Schreiboperation im Casino-Projekt betroffen — Security-Review für A–F daher nicht verpflichtend.
- Sourcing bleibt auf öffentliche Geschäftsdaten begrenzt — keine Privatpersonen, keine Datenschutz-Grauzone.
- Jede Schreiboperation gegen externe Systeme (n8n-Workflow-Anlage in Stufe F, Ablage-Wahl in Stufe D) trägt ein Freigabe-Gate.
- Voraussetzungen auf Jans Seite sind gestaffelt nach Stufe benannt und minimal gehalten (siehe Tabelle in Abschnitt 0).
- Diese Datei ist eigenständig verständlich für eine neue LLM-Konversation ohne Vorwissen aus dem Chat-Verlauf.

---

## 6 — Bezug

- Vergleich n8n vs. Trigger.dev und ursprüngliche Diskussion: [`worldmap/03_cli.md`](03_cli.md) Nr. 21.
- Planungsdatei-Konventionen: [`xx_sop/03_workflow_jan_planungsdateien.md`](../xx_sop/03_workflow_jan_planungsdateien.md).
- Stufen-Roadmap-Vorbild: [`Z_LLM/10_llm_erweiterung.md`](../Z_LLM/10_llm_erweiterung.md).
- Vertiefende technische/rechtliche Referenzdateien je Stufe: [`docs/n8n/00_INDEX.md`](../docs/n8n/00_INDEX.md).

---

## 7 — Externe Quellen (Recherche-Stand 2026-08-28)

- n8n Public REST API — Übersicht & Endpunkt-Referenz: [docs.n8n.io/api](https://docs.n8n.io/api/), [docs.n8n.io/connect/n8n-api/api-reference](https://docs.n8n.io/connect/n8n-api/api-reference)
- n8n Community — bestätigte Einschränkung "kein dokumentierter Run-Endpunkt für Manual-Trigger-Workflows": [community.n8n.io — Executing a workflow via API call](https://community.n8n.io/t/executing-a-workflow-via-api-call-without-webhook-or-cli-command/212895)
- Apify — Google Maps Scraper Actor & Run-Endpunkte (inkl. `run-sync-get-dataset-items`): [apify.com/compass/crawler-google-places/api](https://apify.com/compass/crawler-google-places/api)
- Nodemailer/Ethereal — Testaccount-API: [nodemailer.com/guides/testing-with-ethereal](https://nodemailer.com/guides/testing-with-ethereal), [ethereal.email/faq](https://ethereal.email/faq)
- UWG § 7 / Kaltakquise B2B Deutschland 2026: [ripeleads.eu/de/kaltakquise-email-dsgvo](https://ripeleads.eu/de/kaltakquise-email-dsgvo), [sellerate.de/blog/kaltakquise-b2b-erlaubt](https://sellerate.de/blog/kaltakquise-b2b-erlaubt/)

---

## 8 — Anhang: Qualitäts-Audit (2026-08-28, v1 → v2)

> Selbstbewertung vor/nach der Recherche-gestützten Überarbeitung, aufgeteilt nach Subkategorien. Skala 1 (schwach) – 10 (Weltklasse). Ziel dieses Anhangs ist Nachvollziehbarkeit, nicht Selbstlob — jede Verbesserung ist an eine konkrete Textänderung in dieser Datei gebunden.

| Subkategorie                                       |           v1-Score            | Gefundener Bottleneck                                                                                                                                                                                                                                      | Fix in v2                                                                                                                                                        |          v2-Score           |
| -------------------------------------------------- | :---------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------: |
| **Technische Korrektheit (Trigger-Mechanismus)**   |             4/10              | v1 ging stillschweigend von einem generischen "Run-Workflow-jetzt"-API-Aufruf aus, den es für Manual-Trigger-Workflows laut n8n-Community so nicht verlässlich gibt                                                                                        | Stufe A/F auf Webhook-Trigger-Design umgestellt, Einschränkung explizit benannt und mit Quelle belegt                                                            |            9/10             |
| **Technische Korrektheit (Apify-Aufruf)**          |             5/10              | Keine konkrete Actor-ID, kein konkreter Endpunkt — "Apify-Actor aufrufen" war nicht ausführbar ohne weitere Recherche zur Ausführungszeit                                                                                                                  | Stufe B enthält jetzt exakte Actor-ID (`compass/crawler-google-places`), exakten Sync-Endpunkt und URL-Encoding-Hinweis (`~` statt `/`)                          |            9/10             |
| **Sicherheitsdesign (Trigger-Endpunkt)**           | — (Lücke in v1 nicht erkannt) | Ein Webhook-Trigger ohne Auth wäre ein neuer, öffentlich erreichbarer Angriffspunkt (fremdausgelöste Apify-Kosten/Requests) — dieses Risiko existierte in v1 implizit, war aber nicht benannt, weil der Trigger-Mechanismus selbst falsch spezifiziert war | Header-Auth-Credential + Negativtest (401/403 bei falschem Secret) als Pflichtteil von Stufe F ergänzt                                                           |            9/10             |
| **Rechtliche Tiefe (Compliance)**                  |             3/10              | Nur pauschaler Verweis "DSGVO/Anti-Spam-Recht prüfen", keine konkrete Aussage, kein Bezug zur eigenen Datenquelle                                                                                                                                          | Konkreter § 7 UWG-Fakt mit Quelle ergänzt, explizit auf die in Stufe B/C erzeugten Daten bezogen, als harte Grenze vor Stufe A/F statt erst in Stufe M platziert |            9/10             |
| **Dokumentationsaktualität**                       |             2/10              | Keine der technischen Aussagen war gegen aktuelle Anbieter-Doku geprüft — reine Trainingsdaten-Vermutung                                                                                                                                                   | Alle Kernaussagen gegen docs.n8n.io, Apify- und Nodemailer-Doku sowie aktuelle Rechtsquellen abgeglichen, Quellenliste (Abschnitt 7) ergänzt                     |            9/10             |
| **Lerntransfer-Klarheit (Bezug zum B2C-Fernziel)** |             6/10              | Bezug zum Fernziel war nur in Fließtext/Tabellenspalte "Lerneffekt" angedeutet, nicht strukturell greifbar                                                                                                                                                 | Portabilitäts-Matrix (Abschnitt 1) ergänzt — jeder Sandbox-Baustein hat jetzt eine explizite 1:1-Analogie zum späteren Produkt                                   |            8/10             |
| **Vollständigkeit Horizont-2-Stufen (G–M)**        |             6/10              | Bewusst grob gehalten (YAGNI-Prinzip)                                                                                                                                                                                                                      | Unverändert — kein Bottleneck, sondern bewusste Design-Entscheidung, siehe Abschnitt 3 Intro-Hinweis                                                             | 6/10 (unverändert, gewollt) |

**Verbleibend offen, bewusst nicht in v2 gefixt:** Der exakte technische Feinschliff von Stufe G–M (z. B. konkrete IMAP-Provider-Wahl für Reply-Tracking, konkrete Warm-up-Kurve) wird laut Abschnitt 3 erst geplant, wenn A–F verifiziert gelaufen sind — vorzeitige Tiefenplanung hier wäre spekulative Arbeit an einer Grundlage, die sich durch die A–F-Ergebnisse noch verschieben kann.
