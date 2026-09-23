# 01.6.5 — Typ-Abdeckung „reference": Sub-Sub-Aufschlüsselung

> **Status:** Bewertung (Ebene 1) + **Re-Rating 2026-09-18** · **Stand:** 2026-09-18 · **Owner:** LLM · **Scope:** reference-Typ-Abdeckung im Memory-Ordner (1 → 5 Einträge — Qualität, Kandidaten, Secrets-Disziplin)
> **Ausgeführt über:** [Plan 06_u05](Planungsdateien/06_u05_typ_abdeckung_reference_plan.md) — L0–L3, ausgeführt 2026-09-18
> **Referenz:** [`01_6_memory_files.md`](01_6_memory_files.md) Position 5 (Vorher-Niveau: Top 95 %, Audit 2026-08-30)

## Kernaussage

Der reference-Typ ist vom Niveau **Top 95 % (Vorher, 0 Einträge)** auf **gewichtet ≈ Top 51 %** gestiegen: seit 2026-09-04 existiert mit `openai-image-video-pricing-reference.md` ein formal sauberer, rein zeigerbasierter Eintrag. Die verbleibenden 49 Punkte Verlust liegen fast vollständig in der **Kandidaten-Deckung**: mindestens 4 weitere wiederkehrende Projekt-IDs (Supabase-Projekt-Ref, GitHub-Repo, Sentry-Org/Projekt, Sentry-Ingest-Host) sind dokumentiert, aber unverlinkt — jede Session muss sie über `CLAUDE.md`/`xx_docs` re-recherchieren. Die Secrets-Disziplin ist intakt: Der vorhandene Eintrag enthält nur einen Datei-Pfad, kein Klartext-Secret; der Katalog bleibt als Zeiger-Ablage tauglich, solange DSN/Keys/Token dauerhaft ausgeschlossen bleiben.

**Re-Rating 2026-09-18 (nach U05):** Der Stand hat sich auf **Top 10 %** verbessert. Maßgeblich ist allein die **Kandidaten-Deckung**: die vier im Audit identifizierten IDs (Supabase-Projekt-Ref, GitHub-Repo, Sentry-Org/-Projekt, Sentry-Ingest-Host) sind als reference-Einträge angelegt und im Index verlinkt — die Kandidaten-Deckung fällt von Top 85 % auf Top 10 %, die Eintrags-Abdeckung von Top 80 % auf Top 5 %. Qualität, Secrets-Disziplin und Typ-Abgrenzung bleiben unverändert. Damit ist der im Absatz oben beschriebene Hauptverlustposten („4 IDs müssen jede Session neu re-recherchiert werden") geschlossen.

## Sub-Subkategorien (bewertet + gewichtet)

_Gewichtslogik (offen gelegt):_ Gewicht = wie viel die Position für den Zweck „wiederkehrende Referenzen ohne Re-Recherche parat haben" schadet. (a) Deckung/Kandidaten wirken direkt auf Session-Ökonomie → hoch (30 % / 25 %); (b) Qualität des einen Eintrags ist Multiplikator für alle künftigen reference-Dateien → 20 %; (c) Secrets-Disziplin und Typ-Abgrenzung sind Flankenschutz → je 10 %; (d) Index-Wiederauffindbarkeit ist bereits in Unterkategorie #6 der Mutterdatei bewertet → 5 %.

| Nr  | Subsubkategorie                                          | Gewichtung | Niveau       | Befund & Beleg                                                                                                                                                                                                                                                                                                                                                                                   | Bottleneck? |
| --- | -------------------------------------------------------- | :--------: | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------: |
| 1   | Eintrag-Abdeckung (1 von 5 identifizierbaren Kandidaten) |  **30 %**  | **Top 80 %** | 1 von 5 verifizierten Kandidaten abgedeckt (20 % Deckung); Vorher 0 von 5 (0 %) — erster Sprung, aber 4 von 5 Lücken offen. Beleg: Ordnerinhalt 2026-09-14 = 6 Notiz-Dateien, genau 1× `metadata.type: reference` (`openai-image-video-pricing-reference.md:6`)                                                                                                                                  |     ✅      |
| 2   | Qualität des vorhandenen Eintrags                        |  **20 %**  | **Top 15 %** | Vollständiges Frontmatter (`name`, `description`, `metadata.type: reference` + `originSessionId`/`modified`, Zeilen 1–9), Body ist reiner Zeiger auf `public/images/09_model_pricing_reference.md` mit Quellen-Hinweis (live kompiliert, „re-verify before quoting") und Wiki-Link auf die verwandte Entscheidung — genau die richtige Struktur für einen reference-Typ                          |      —      |
| 3   | Kandidaten-Deckung: wiederkehrende IDs unverlinkt        |  **25 %**  | **Top 85 %** | 4 IDs mit hohem Wiederkehr-Wert liegen nur in Repo-Doku: Supabase-Ref `hmqwozhdckbwjqzcmire` (CLAUDE.md:155, 12+ Doc-Stellen), GitHub-Repo `ameisw667/Casino` (docs/archive/01_github.md:49), Sentry-Org/-Projekt `berlin-agency`/`javascript-nextjs` (docs/archive/01_SentryCLI_SentryMCP.md:74), Ingest-Host `o4511899214020608.ingest.de.sentry.io` (docs/auth/12_middleware_proxy_csp.md:59) |     ✅      |
| 4   | Secrets-Zeiger-Disziplin                                 |  **10 %**  | **Top 5 %**  | Der einzige Eintrag enthält keinen Key, kein DSN, kein Token — nur Pfad + Datum + Verifizierungsaufruf; alle 5 Kandidaten sind nicht-sensible Identifikatoren. Regel „reference = nur Zeiger, nie Klartext-Secrets" ist aktuell verletzt-frei und der Katalog bleibt dafür tauglich                                                                                                              |      —      |
| 5   | Typ-Abgrenzung reference vs. project                     |  **10 %**  | **Top 20 %** | Grenze zieht sich sauber: `vip-rank-supabase-outsourcing` (Entscheidung/Umbau) bleibt `project`, der Pricing-Zeiger („wo finde ich X") ist korrekt `reference`; keine Mischform im Ordner. Unsicherheitsrest: `verify-paths-before-recommending` hätte als reference-ähnlicher Zeiger gelten können, wurde aber zutreffend als `feedback` geführt                                                |      —      |
| 6   | Wiederauffindbarkeit im Index (`MEMORY.md`)              |  **5 %**   | **Top 10 %** | Zeile 6 listet den Eintrag mit sprechender Beschreibung („Zeiger auf `public/images/09_model_pricing_reference.md`") — der einzige Index-Eintrag, der seinen Zeiger-Charakter schon in der Beschreibung trägt; nicht Teil des Zeile-4-Duplikat-Problems                                                                                                                                          |      —      |

**Gewichteter Schnitt:** (30×80 + 20×15 + 25×85 + 10×5 + 10×20 + 5×10) / 100 = **Top 51 %**.

### Niveau-Rückschreibung (2026-09-18, U05-L3 ausgeführt)

Real gezählt: **5 Dateien mit `metadata.type: reference`** (`openai-image-video-pricing-reference.md` + die 4 neuen K1–K4). Damit ist die im Audit 2026-09-14 identifizierte Kandidatenliste **vollständig** abgedeckt (5 von 5).

| Subsub                                 | 2026-09-14 | **2026-09-18** | Beleg für die Neubewertung                                                                                                                                                                               |
| -------------------------------------- | :--------: | :------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 Eintrag-Abdeckung                    |  Top 80 %  |  **Top 5 %**   | **1 → 5 Einträge**, Deckung **5 von 5 = 100 %**; die vier Neuanlagen decken genau die vier im Audit identifizierten wiederkehrenden IDs ab                                                               |
| 2 Qualität des Vorbild-Eintrags        |  Top 15 %  |  **Top 15 %**  | unverändert — `openai-image-video-pricing-reference.md` wurde nicht angefasst; seine Struktur ist jetzt die Vorlage für 4 weitere Einträge, was die Bewertung stützt, aber nicht verändert               |
| 3 Kandidaten-Deckung (war Bottleneck)  |  Top 85 %  |  **Top 10 %**  | **keine der 4 IDs liegt mehr nur in der Repo-Doku:** Supabase-Ref, GitHub-Repo, Sentry-Org/-Projekt und Ingest-Host sind als reference-Einträge verlinkt; Restrisiko nur noch „noch nicht entdeckte IDs" |
| 4 Secrets-Zeiger-Disziplin             |  Top 5 %   |  **Top 5 %**   | **4× PASS** der Ausschluss-Checkliste (§2b des Plans) je Entwurf: kein DSN, kein Auth-Token, kein DB-Passwort, kein Service-Role-/anon-Key — alle vier Werte sind öffentliche Identifikatoren            |
| 5 Typ-Abgrenzung reference vs. project |  Top 20 %  |  **Top 20 %**  | unverändert; die 4 neuen Einträge sind unmissverständlich Zeiger (statische IDs, kein Verlauf), kein Mischtyp entstanden                                                                                 |
| 6 Wiederauffindbarkeit im Index        |  Top 10 %  |  **Top 10 %**  | unverändert; die 4 neuen Indexzeilen tragen denselben Zeiger-Charakter in der Beschreibung                                                                                                               |

**Neuer gewichteter Schnitt:** (30×5 + 20×15 + 25×10 + 10×5 + 10×20 + 5×10) / 100 = (150 + 300 + 250 + 50 + 200 + 50) / 100 = **Top 10 %** (Plan-Projektion: Top 15–18 % — **besser als projiziert**, weil die Deckung **vollständig** statt teilweise geschlossen ist; die Projektion hatte Subsub 1/3 nur auf ~Top 20 % gesetzt).
**Rest/Risiko:** Die verbleibenden 10 Punkte sitzen in Subsub 2 (Vorbild-Qualität, unberührt) und Subsub 5 (Typ-Grenze, unverändert) — beide ohne Handlungsbedarf in diesem Plan. Der eigentliche Hebel ist verbraucht: das Referenz-Wissen liegt jetzt im Memory statt in der Repo-Doku.

**Abweichung vs. Vorher (Top 95 %, Audit 2026-08-30):** Verbesserung um 44 Punkte. Getrieben wird sie fast ausschließlich von Subsub 2/4/6 (Qualität, Secrets-Disziplin, Index — alle Top 5–20 %): der eine vorhandene Eintrag ist exemplarisch korrekt gebaut. Die Deckungssubsubs (1/3) bleiben mit Top 80/85 % der Hauptsanko, weil 4 von 5 Kandidaten unverlinkt sind — die Unterkategorie ist damit ein Paradebeispiel für „hohe Eintragsqualität, niedrige Abdeckung", das inverse Muster zur Mutter-Unterkategorie #2 (feedback: hohe Abdeckung).

_Absatz beschreibt den Stand 2026-09-14 und ist durch die Niveau-Rückschreibung oben überholt: die Kandidaten-Deckung ist am 2026-09-18 geschlossen, der „Hauptsanko" entfällt. Er bleibt als Bewertungsbeleg des Vorher-Stands stehen._

## Detailanmerkungen

### 1 — Eintrag-Abdeckung (Top 80 % → **Top 5 %**)

**Erledigt 2026-09-18 (U05-L2):** 1 → 5 Einträge, Deckung 5 von 5 (100 %). Die vier Neuanlagen sind in der Tabelle oben namentlich zugeordnet; die Kandidatenliste ist damit nicht mehr „identifiziert, aber unverlinkt", sondern abgearbeitet.

Verzeichnisstand 2026-09-14: 6 Notiz-Dateien + `MEMORY.md`, davon genau eine mit `metadata.type: reference`. Vorher (2026-08-30) war der Typ mit 0 Einträgen die schlechteste Position der Kategorie (Top 95 %). Der Zuwachs ist echt, aber die Abdeckungsquote bleibt bei 20 % der im Repo nachweisbar wiederkehrenden Referenzen. Die Aufwandsseite ist niedrig (Rohstoffe stehen alle bereits in `CLAUDE.md` bzw. `docs/architecture`), der Engpass ist nicht Aufwand, sondern die Schreibfreigabe-Regel (globale CLAUDE.md: „Write to memory only when I explicitly ask") — identisch zur Hürde bei `user` (Mutter-Position #4). _Der Engpass hat sich bestätigt: die Ausführung war reine Mechanik, der einzige Aufwand lag im Gate._

### 2 — Qualität des vorhandenen Eintrags (Top 15 %)

`openai-image-video-pricing-reference.md` erfüllt alle vier Qualitätskriterien: (1) korrektes Frontmatter-Schema inkl. `type: reference`; (2) Zeiger statt Kopie — die Datei nennt den Zielpfad `public/images/09_model_pricing_reference.md` im Repo, statt Preiszahlen selbst zu duplizieren (die würden veralten); (3) eingebaute Verfallsdisziplin — „Compiled 2026-09-05 from live sources … re-verify against those sources before quoting exact numbers", was das Frische-Warnsystem (Mutter-Position #9) inhaltlich ergänzt; (4) Querlink `[[image-generation-model-preference]]`, der die beiden Bild-Generation-Memories verknüpft. Einzige Mikro-Anmerkung: die Beschreibung im Frontmatter nennt nur „Artificial Analysis Elo scores", nicht den Repo-Pfad — der Pfad steht dafür in der `MEMORY.md`-Indexzeile.

### 3 — Kandidaten-Deckung (Top 85 % → **Top 10 %**) — ehemals Bottleneck, **geschlossen**

**Erledigt 2026-09-18 (U05-L1/L2):** Alle vier IDs liegen jetzt als reference-Eintrag im Memory-Ordner und sind über `MEMORY.md` verlinkt. Das Restrisiko von 10 Punkten ist nicht Beleg-, sondern Auffindungsrisiko: die Kandidatenliste stammt aus einem Audit und kann eine fünfte wiederkehrende ID übersehen haben — dafür existiert kein Nachweis, also wird nicht auf Top 5 % aufgerundet.

Der realste Verlustposten. Jede der vier IDs wird über Sitzungen hinweg erneut gebraucht und jede muss derzeit aus Repo-Doku re-recherchiert werden:

### Erfüllung 2026-09-18 (U05-L1/L2): **alle vier angelegt**, Secrets-Checkliste 4× PASS

| #   | Kandidat                          | Wert                                          | Memory-Datei (angelegt 2026-09-18)        | Beleg (Ist-Doku)                                                                                   |
| --- | --------------------------------- | --------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| K1  | Supabase-Projekt-Ref              | `hmqwozhdckbwjqzcmire`                        | `casino-supabase-project-ref.md`          | `CLAUDE.md:155`; `docs/status-reports/01_PRODUCTION_RELEASE.md:38`                                 |
| K2  | GitHub-Repo                       | `ameisw667/Casino`                            | `casino-github-repo.md`                   | `docs/archive/01_github.md:49`; `T_SECURITY_HARDENING/04_security_hardening.md:91`                 |
| K3  | Sentry-Org + Projekt              | `berlin-agency` / `javascript-nextjs`         | `sentry-org-project-reference.md`         | `docs/archive/01_SentryCLI_SentryMCP.md:74,131` (am 2026-08-18 gegen das Dashboard verifiziert)    |
| K4  | Sentry-Ingest-Host (EU)           | `o4511899214020608.ingest.de.sentry.io`       | `sentry-ingest-host-reference.md`         | `docs/auth/12_middleware_proxy_csp.md:59`; `docs/security-hardening/01_csp_script_hardening.md:57` |
| K5  | (bereits abgedeckt) Preisreferenz | `public/images/09_model_pricing_reference.md` | `openai-image-video-pricing-reference.md` | Bild-/Video-Modellwahl, Preisangaben in Plänen                                                     |

Bewertung der Secrets-Regel dafür: Alle vier offenen Kandidaten sind **Identifikatoren, keine Secrets** — ein Projekt-Ref, ein Repo-Name und eine Org/Host-URL sind in Logs, CSP-Headern und URLs ohnehin öffentlich sichtbar und erlauben keinen Zugriff. Was niemals als reference-Eintrag landen darf: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, Supabase-`anon`/`service_role`-Keys, persönliche Sentry-CLI-Tokens (dokumentiert in `docs/archive/01_SentryCLI_SentryMCP.md:68,121`). Solange diese Grenze gehalten wird, bleibt der reference-Katalog als Zeiger-Ablage sicher; ein Leck-Risiko entstünde erst, wenn „wo ist X dokumentiert" mit „was ist der Wert von X" bei Secrets vermischt würde.

**Prüfergebnis 2026-09-18 (U05-L1, Ausschluss-Checkliste 4× PASS):** Jeder der vier Entwürfe wurde gegen die Verbotsliste geprüft — kein DSN, kein Auth-Token, kein Datenbank-Passwort, kein Service-Role-/Anon-Key, kein persönlicher CLI-Token. Enthalten sind ausschließlich die in der Tabelle oben gelisteten öffentlichen Identifikatoren. Die Grenze ist damit nicht nur beschrieben, sondern am realen Schreibvorgang eingehalten.

### 5 — Typ-Abgrenzung reference vs. project (Top 20 %)

Systemdefinition: `project` hält Entscheidungen und Projektverlauf, `reference` hält „wo finde ich eine konstante Information". Im Ist-Bestand verläuft die Grenze sauber — der einzige mögliche Grenzfall (`verify-paths-before-recommending`, eigentlich ein Verweis auf ein Prüfverfahren, nicht auf eine Entscheidung) ist korrekt als `feedback` klassifiziert. Kein Eintrag sitzt im falschen Typ; das Risiko der künftigen K1–K4-Anlage ist deshalb gering, weil alle vier unmissverständlich reference-Kandidaten sind (statische IDs, kein Verlauf).

## Verwandte Artefakte

| Bedarf                                                                    | Datei                                                                                                 |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Mutter-Unterkategorie (Position 5, Gewicht 6 %)                           | [`01_6_memory_files.md`](01_6_memory_files.md)                                                        |
| Verhaltensregel „wann wird überhaupt geschrieben" (Schreibfreigabe-Hürde) | [`01_5_session_memory.md`](01_5_session_memory.md)                                                    |
| Vorhandener reference-Eintrag (read-only, außerhalb des Repos)            | `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\openai-image-video-pricing-reference.md` |
| Zielpfad des Eintrags                                                     | `public/images/09_model_pricing_reference.md` (im Repo)                                               |
| Sentry-Org/Projekt-Verifikationsstand                                     | `docs/archive/01_SentryCLI_SentryMCP.md`                                                              |
| GitHub-Remote-/CLI-Kontext                                                | `docs/archive/01_github.md`                                                                           |
