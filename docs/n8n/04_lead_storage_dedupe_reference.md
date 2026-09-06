# Persistente Lead-Ablage & Dedupe — Referenz für Stufe D

> **Deckt ab:** Stufe D. **Recherche-Stand:** 2026-08-28. Wichtig: **keine** dieser Optionen berührt eine Supabase-Tabelle des Casino-Projekts — das ist eine harte Grenze aus dem Hauptplan (Abschnitt "Nicht-Scope" von Stufe D), hier technisch umgesetzt durch die Wahl komplett externer Speicherorte.

## 1 — Speicheroptionen im Vergleich

| Option                                                                | Aufwand                                            | Eignung für diesen Sandbox-Umfang    | Hinweis                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **n8n "Data Table" (nativ)**                                          | Niedrig, kein externer Account                     | Gut, **falls verfügbar**             | Taucht in der aktuellen n8n-API-Ressourcenliste als eigene Kategorie auf — ein relativ neues natives Feature. Verfügbarkeit auf Jans self-hosted Version zum Ausführungszeitpunkt kurz verifizieren (Versionsabhängig); wenn vorhanden, die naheliegendste Wahl, weil kein weiterer externer Account nötig ist. |
| **Google Sheets**                                                     | Niedrig, Google-Account + einmalige OAuth-Freigabe | Gut, sicherer Fallback               | Funktioniert garantiert unabhängig von n8n-Version, dafür ein zusätzlicher OAuth-Consent-Schritt (siehe "Explizite Freigabe erforderlich"-Regeln — hier durch Jan selbst in der Google-Oberfläche zu erteilen, nicht durch das LLM)                                                                             |
| **Eigene kleine DB (z. B. SQLite/Postgres extra) über einen DB-Node** | Mittel                                             | Eher Overkill für 20–50 Testeinträge | Erst relevant, wenn Stufe K (Skalierung) ansteht                                                                                                                                                                                                                                                                |

**Empfehlung:** Erst n8n Data Table prüfen (Stufe A liefert ohnehin schon die Info, welche API-Ressourcen die Instanz unterstützt), sonst Google Sheets als robuster Fallback.

## 2 — Dedupe-Schlüssel-Design

Naive Duplikaterkennung nur über die Email schlägt fehl, wenn ein Lead (noch) keine Email hat (Stufe C liefert nicht für jeden Datensatz eine). Deshalb zusammengesetzter Schlüssel:

```
dedupeKey = normalize(name) + "|" + normalize(address)
```

wobei `normalize()`:

- in Kleinbuchstaben umwandelt,
- führende/folgende Leerzeichen entfernt,
- gängige Adress-Abkürzungen vereinheitlicht (`str.` → `straße`, `Nr.` → `nummer`),
- Umlaute nicht zwingend transliteriert (Datenquelle ist deutschsprachig, Konsistenz wichtiger als Transliteration).

Der Schlüssel wird bei jedem Workflow-Lauf berechnet und vor dem Schreiben gegen die bereits gespeicherten Schlüssel geprüft (`Filter`- oder `IF`-Node in n8n, abhängig vom gewählten Speicherort — bei Google Sheets z. B. per vorherigem `Lookup`-Node).

## 3 — Verifizierung (konkretisiert)

"Zweiter Lauf mit teilweise überlappenden Leads erzeugt keine Duplikate" heißt konkret: Stufe-B-Abfrage im selben Testgebiet ein zweites Mal mit leicht verändertem `maxCrawledPlaces` laufen lassen (z. B. 30 statt 20) — die ersten 20 sollten identisch/überlappend sein. Nach Stufe D darf die Gesamtzahl gespeicherter Zeilen nicht doppelt so hoch sein wie bei einem einzelnen Lauf, sondern nur um die tatsächlich neuen Einträge gewachsen sein.

## 4 — Freigabe-Gate-Erinnerung

Diese Datei ersetzt nicht das im Hauptplan verankerte Freigabe-Gate ("kurze Bestätigung von Jan, welches Speichermedium er bevorzugt") — sie liefert nur die Optionen, aus denen Jan wählt.
