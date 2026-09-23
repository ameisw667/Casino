# 01 — API: Ist-Zustand und Messnotizen

> **Status:** 🟢 Aktuelle Nachweisnotiz · **Stand:** 2026-09-09 · **Owner:** LLM

Die frühere 56-Routen-Aufschlüsselung ist historisch. Der am 2026-09-09 lokal gemessene Bestand sind **59** Route-Dateien und **6** co-lokalisierte Route-Tests. Die kanonische Plansteuerung liegt in [00_API_UEBERSICHT.md](00_API_UEBERSICHT.md).

| Messung                            | Befund    | Grenze                                        |
| :--------------------------------- | :-------- | :-------------------------------------------- |
|                                    |
| g --files src/app/api -g route.ts  | 59        | Route-Dateien, nicht HTTP-Methoden            |
|                                    |
| g --files src/app/api -g *.test.ts | 6         | Nur co-lokalisierte Tests                     |
| xx_docs/08_api_backend_context.md  | 59 Routen | Kanonische Route- und Sicherheitsbeschreibung |

Offen bleiben routeweise Nachweise für Envelope-Ausnahmen, Auth-Klassen, Validierungsarten, OpenAPI, Pagination und Transportfehler.
