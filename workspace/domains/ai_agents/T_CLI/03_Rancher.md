# 03 — Rancher Desktop: Container-Runtime — Lernlandkarte & Niveau-Status

> **Status:** Aktiv (Lerndoku, keine Code-/Runtime-Änderung durch diese Datei) · **Stand:** 2026-09-03 · **Owner:** LLM · **Scope:** Reines Wissens- und Niveau-Dokument zu Rancher Desktop als lokaler Container-Runtime — keine neue Architektur- oder Migrationsentscheidung.
> **Hauptdatei:** Diese Datei ist ab sofort der zentrale Anlaufpunkt für alles rund um Rancher Desktop in diesem Repo. Die frühere Bestandsaufnahme [`docs/archive/01_Rancher.md`](../../../../docs/archive/01_Rancher.md) (Terminologie-Korrektur + Container-MCP-Recherche, 2026-08-23, `Executed (archiviert)`) bleibt als historischer Nachweis bestehen und wird hier referenziert, nicht dupliziert.
> **Nicht-Scope:** Keine Installation/Konfiguration, kein neuer Migrations- oder Security-Task, keine Entscheidung über den 2026-08-23 zurückgestellten Container-MCP-Piloten (siehe Abschnitt 6).

---

## 1 — Übersicht für Jan

| Frage                              | Kurzantwort                                                                                                                                                                                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aktuelles Niveau                   | **Level 2 von 5** (Grundlagen — Container-Stacks starten/stoppen/debuggen), Level 1+2 solide, Level 3 in Ansätzen                                                                                                                                                          |
| Geschätzte Potenzial-Nutzung       | **grob 30 %** (Schätzung, nicht gemessen — Begründung Abschnitt 4)                                                                                                                                                                                                         |
| Größter offener Block              | Der in Rancher Desktop eingebaute Kubernetes-Layer (k3s) läuft die ganze Zeit passiv mit, wird aber nie aktiv genutzt (kein `kubectl`, keine eigenen Workloads)                                                                                                            |
| Zuletzt verifiziert                | 2026-09-03, `docker ps`/`docker context ls`/`docker compose version` frisch ausgeführt (Abschnitt 2)                                                                                                                                                                       |
| Warum Rancher statt Docker Desktop | Docker Desktop scheiterte an veralteter BIOS-Version (WSL2/Hyper-V-Voraussetzung nicht erfüllbar); Rancher Desktop lief ohne dieses Problem — Entscheidung bereits 2026-08-18 getroffen ([`docs/archive/01_Supabase-CLI.md`](../../../../docs/archive/01_Supabase-CLI.md)) |

---

## 2 — IST-Niveau (verifiziert 2026-09-03)

| Prüfpunkt                               | Befund                                                                                                                                                                                                                                                                                          | Bedeutung                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Version                                 | `Docker version 29.6.2-rd` (`-rd`-Suffix = Rancher-Desktop-Build)                                                                                                                                                                                                                               | Rancher liefert eine Docker-API-kompatible CLI, kein eigenes Fremdformat                                                           |
| Aktiver Context                         | `default` (`npipe:////./pipe/docker_engine`) — `desktop-linux` (Docker Desktop) existiert als Eintrag, ist aber ungenutzt                                                                                                                                                                       | Jede „Docker"-Nutzung in diesem Repo läuft faktisch über Rancher, nicht über Docker Desktop                                        |
| Laufende Container (aktueller Snapshot) | 11 Supabase-Services (`db`, `auth`, `rest`, `realtime`, `storage`, `kong`, `studio`, `pooler`, `pg_meta`, `analytics`, `inbucket`) — 10 healthy, `vector` im bekannten Restart-Loop; zusätzlich 5 Rancher-interne k3s-System-Pods (Traefik ×2, CoreDNS, metrics-server, local-path-provisioner) | Supabase-Lokalstack ist der Haupt-Use-Case; der k3s-Layer läuft nur als Rancher-Eigeninfrastruktur mit, nicht für eigene Workloads |
| Compose/Buildx-Plugins                  | `Docker Compose v5.3.1`, `buildx v0.35.0` installiert                                                                                                                                                                                                                                           | Beide Plugins vorhanden, `buildx` aber im Repo nirgends genutzt (kein `Dockerfile` gefunden)                                       |
| Beobachtungsstack                       | `docker/observability/docker-compose.yml` (Jaeger/OTLP, throwaway, kein Volume) über `npm run observability:up`/`:down` — aktuell **nicht** laufend                                                                                                                                             | Ad-hoc-Nutzung für Lasttests, kein Dauerbetrieb                                                                                    |
| Installationsort                        | `C:\Program Files\Rancher Desktop\`                                                                                                                                                                                                                                                             | Lokal, keine Remote-/Cloud-Anbindung                                                                                               |
| Verworfene Altlast                      | `infra/chaos/` (eigenes `docker-compose.yml` + `kong.yml` + `deploy.sh`) — VPS-Chaos-Stack, am 2026-08-14 verworfen, nicht aktiv                                                                                                                                                                | Kein offener Bezug mehr zu Rancher Desktop                                                                                         |

---

## 3 — Meilensteine (bisherige Nutzung, chronologisch)

| #   | Meilenstein                                                                                                                                                               | Datum                   | Status                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------- |
| M1  | Docker Desktop wegen BIOS-Inkompatibilität verworfen, Rancher Desktop installiert                                                                                         | 2026-08-18              | 🟢 Executed                                         |
| M2  | Lokaler Supabase-Vollstack (11 Services) produktiv über Rancher betrieben                                                                                                 | laufend seit 2026-08-18 | 🟢 Executed                                         |
| M3  | Repo-weite Terminologie „Docker" → „Rancher Desktop" korrigiert (5 Fundstellen)                                                                                           | 2026-08-23              | 🟢 Executed                                         |
| M4  | Beobachtungsstack (Jaeger/OTLP) ad hoc über `docker compose` betrieben                                                                                                    | 2026-08-23              | 🟢 Executed (Ad-hoc, kein Dauerbetrieb)             |
| M5  | Recherche Container-MCP-Optionen gegen Rancher-Socket (Docker MCP Toolkit = Docker-Desktop-exklusiv; Community-Server technisch kompatibel, aber ohne Read-only-Schalter) | 2026-08-23              | 🟢 Executed — Ergebnis: zurückgestellt              |
| M6  | Frische Laufzeit-Reverifizierung (Version, Context, 16 aktive Container, Compose/Buildx-Plugins)                                                                          | 2026-09-03              | 🟢 Executed                                         |
| M7  | Eigene Dockerfiles/Images bauen (`buildx` aktiv nutzen)                                                                                                                   | —                       | 🔴 Offen                                            |
| M8  | Kubernetes-Layer (k3s) aktiv für eigene Workloads nutzen (`kubectl`, Manifeste)                                                                                           | —                       | 🔴 Offen                                            |
| M9  | Ressourcenlimits (CPU/RAM/Disk) in Rancher-Settings bewusst konfigurieren                                                                                                 | —                       | 🔴 Offen                                            |
| M10 | Container-MCP-Piloten umsetzen (falls Read-only-fähiger Server verfügbar wird)                                                                                            | —                       | 🔴 Zurückgestellt (Jan-Entscheidung L9, 2026-08-23) |

---

## 4 — Levelsystem: Einstieg bis Experte

Grobe Selbsteinschätzung, keine externe Zertifizierung — Zweck ist Orientierung, nicht Präzision.

| Level | Bezeichnung          | Was das konkret heißt                                                                                                                                                                                                | Dein Status                                                                                                         |
| ----- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 1     | **Einstieg**         | Installation, Docker-Context verstehen, `docker ps`/`docker images`/`docker logs` lesen, GUI zur Prozessübersicht nutzen                                                                                             | ✅ Erreicht                                                                                                         |
| 2     | **Grundlagen**       | Fremde Compose-Stacks starten/stoppen (`docker compose up/down`), Multi-Service-Abhängigkeiten verstehen, Logs zur Fehlersuche nutzen (z. B. `vector`-Restart-Loop erkannt und als bekannt eingestuft)               | ✅ Erreicht                                                                                                         |
| 3     | **Fortgeschritten**  | Eigene `Dockerfile`/Images bauen (`buildx`), eigene Compose-Dateien von Grund auf entwerfen, Ressourcenlimits (CPU/RAM/Disk) in Rancher bewusst konfigurieren, Netzwerk-/Volume-Probleme über CLI statt GUI debuggen | 🟡 Ansatzweise — Compose-Dateien werden genutzt/angepasst, aber nie selbst neu entworfen; kein eigenes Image gebaut |
| 4     | **Fortgeschritten+** | Rancher Desktops eingebautes k3s aktiv nutzen: `kubectl`, eigene Manifeste/Deployments, bewusste Wahl Container-Mode vs. Kubernetes-Mode                                                                             | 🔴 Nicht erreicht — k3s läuft nur passiv als Rancher-Eigeninfrastruktur mit                                         |
| 5     | **Experte**          | Registry-Management (privates Registry, Image-Push), Security-Scanning (z. B. Trivy), Extensions, CI-Integration der Container-Pipeline, saubere Automatisierungs-/MCP-Anbindung mit Read-only-Scope                 | 🔴 Nicht erreicht — MCP-Recherche vorhanden, aber bewusst zurückgestellt                                            |

**Geschätzte Gesamt-Potenzialnutzung: ~30 %.** Begründung: Level 1+2 (Basisbedienung + Orchestrierung fremder Stacks) sind die zwei am häufigsten gebrauchten, aber auch am wenigsten tiefen Level — sie decken den täglichen Supabase-/Observability-Workflow vollständig ab. Level 3–5 (eigene Images, Kubernetes-Nutzung, Ökosystem/Registry/Security) sind inhaltlich deutlich umfangreicher und bisher praktisch ungenutzt — daher liegt die reale Ausschöpfung unter der naiven „2 von 5 Level = 40 %"-Rechnung.

---

## 5 — Docker Desktop vs. Rancher Desktop (kompakter Vergleich)

| Aspekt                | Docker Desktop                                                      | Rancher Desktop                                                                                                                                                                        | Für dieses Repo relevant, weil                                                                            |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Lizenz/Preis          | Kostenpflichtig ab bestimmter Firmengröße/Nutzung                   | Vollständig Open Source (CNCF), kostenlos                                                                                                                                              | Kein Lizenzrisiko bei diesem Solo-/Lernprojekt                                                            |
| Windows-Voraussetzung | Zwingend WSL2 oder Hyper-V mit aktuellem BIOS/Virtualisierungsstand | Gleiche Optionen (WSL2/Hyper-V), lief hier aber trotz veralteter BIOS-Version                                                                                                          | Der ursprüngliche Blocker bei dir — Rancher war die pragmatische Lösung, kein bewusster Feature-Vorteil   |
| Kubernetes            | Optional zuschaltbar, separates Docker-Desktop-Kubernetes           | k3s ist von Anfang an eingebaut und läuft bei dir bereits passiv mit (siehe Abschnitt 2)                                                                                               | Ungenutztes Potenzial: du hast bereits einen laufenden k3s-Cluster, ohne ihn je absichtlich anzufassen    |
| CLI-Kompatibilität    | Referenzimplementierung der Docker-CLI/-API                         | Docker-API-kompatibel (`-rd`-Build), `docker`/`docker compose`/`docker buildx` funktionieren identisch                                                                                 | Kein Befehl in diesem Repo muss wegen Rancher anders geschrieben werden                                   |
| MCP/Ökosystem-Tools   | Offizielles „Docker MCP Toolkit" — nur für Docker Desktop           | Kein offizielles Pendant; Community-Server technisch nutzbar, aber ohne Read-only-Schalter (siehe [`docs/archive/01_Rancher.md`](../../../../docs/archive/01_Rancher.md) Abschnitt 10) | Der Hauptgrund, warum der Container-MCP-Pilot zurückgestellt wurde                                        |
| GUI-Reife/Extensions  | Größeres, längeres Ökosystem, mehr Extensions                       | Schlanker, jünger, kleineres Extension-Angebot                                                                                                                                         | Für den aktuellen Bedarf (Supabase-Stack + Jaeger) ohne Nachteil, bei Spezial-Extensions potenziell Lücke |

---

## 6 — Vor- und Nachteile aus deiner bisherigen Nutzung

**Vorteile (bestätigt durch echten Einsatz):**

- Kostenlos, Docker-API-kompatibel — kein Umlernen bei CLI-Befehlen.
- Läuft stabil auf deiner Hardware, wo Docker Desktop blockiert war.
- Trägt den kompletten lokalen Supabase-Stack (11 Services) zuverlässig seit 2026-08-18.
- Kubernetes (k3s) ist „gratis mit dabei" — Lernpotenzial für Level 4 ohne zusätzliche Installation.

**Nachteile (ebenfalls aus echtem Einsatz/Recherche):**

- Kein offizielles MCP-/Automatisierungs-Toolkit wie bei Docker Desktop (offener, unbeantworteter Feature-Request seit 2025-08-18: [`rancher-sandbox/rancher-desktop#9118`](https://github.com/rancher-sandbox/rancher-desktop/issues/9118)).
- `vector`-Container im Supabase-Stack restart-looped bekannt und bisher nicht behoben (kosmetisch, nicht blockierend).
- k3s-System-Pods laufen dauerhaft mit, ohne dass du sie nutzt — reiner Ressourcenverbrauch ohne aktuellen Gegenwert.
- Kleineres Ökosystem/weniger Doku-Abdeckung online als Docker Desktop, falls mal ein Spezialproblem auftritt.

---

## 7 — Offene Potenziale nach Level sortiert

- **Level 3:** Ein eigenes `Dockerfile` für einen Teil dieses Repos schreiben und mit `buildx` bauen (aktuell 0 Dockerfiles im Repo).
- **Level 3:** Rancher-Ressourcenlimits (Einstellungen → Virtual Machine) einmal bewusst durchgehen statt Standardwerte laufen zu lassen.
- **Level 4:** `kubectl get pods -A` einmal ausführen und den bereits laufenden k3s-Cluster real verstehen, statt ihn nur passiv laufen zu lassen.
- **Level 4:** Ein triviales eigenes Kubernetes-Manifest deployen (z. B. ein Test-Pod), um Container-Mode vs. Kubernetes-Mode am eigenen Beispiel zu verstehen.
- **Level 5:** Container-MCP-Piloten neu bewerten, sobald ein Read-only-fähiger Server oder offizieller Rancher-Support existiert (Tracking-Issue oben).
- **Level 5:** Docker Scout oder vergleichbares Security-Scanning gegen die Supabase-Images testen (rein informativ, kein Schreibzugriff nötig).

---

## 8 — Quellen & Verweise

- [`docs/archive/01_Rancher.md`](../../../../docs/archive/01_Rancher.md) — vollständige Bestandsaufnahme, Terminologie-Korrektur und Container-MCP-Recherche (2026-08-23).
- [`docs/archive/01_Supabase-CLI.md`](../../../../docs/archive/01_Supabase-CLI.md), Abschnitt 6 — ursprüngliche Entscheidung Docker Desktop → Rancher Desktop (2026-08-18).
- [`T_CLI/02_cli.md`](02_cli.md) — bestehende CLI-Lernlandkarte (aktuell ohne Docker/Rancher-Eintrag, siehe Nicht-Scope oben).
- [`docker/observability/docker-compose.yml`](../../../../infra/docker/observability/docker-compose.yml), `package.json` (`observability:up`/`observability:down`) — realer Compose-Use-Case.
- Rancher-Desktop-Feature-Request (offen): [rancher-sandbox/rancher-desktop#9118](https://github.com/rancher-sandbox/rancher-desktop/issues/9118).

---

## 9 — Pflege

Diese Datei wird aktualisiert, sobald ein neuer Meilenstein (Abschnitt 3) oder Level-Sprung (Abschnitt 4) real stattfindet — nicht auf Vorrat. Bei Umbenennung/Verschiebung dieser Datei sind `docs/archive/01_Rancher.md` (Rückverweis) und diese Quellenliste im selben Edit anzupassen.
