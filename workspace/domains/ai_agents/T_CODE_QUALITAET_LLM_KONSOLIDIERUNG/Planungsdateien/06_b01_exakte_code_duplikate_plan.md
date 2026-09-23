# B01 — Exakte Code-Duplikate

> **Status:** Execution-Ready · **Stand:** 2026-09-18 · **Owner:** LLM
> **Scope:** Belegtes CasinoJeton-Komponentenpaar und zwei identische, stillgelegte Session-Routen.
> **Kontext:** Nur byte-identische Implementierungen mit erhaltenem Import- oder HTTP-Vertrag werden zusammengeführt.
> **Money-Pfad:** Nein · **Security-Review:** Nein

## 1 — Übersicht für Jan und Ausführungs-LLM

| Nr. | Meilenstein           | Scope                          | Ausführung  | Status | Zuständigkeit | Verifikation              |
| --- | --------------------- | ------------------------------ | ----------- | ------ | ------------- | ------------------------- |
| L0  | Vertragsbaseline      | vier Dateien und Consumer      | Sequenziell | Bereit | LLM           | Hash, Props, HTTP-Antwort |
| L1  | Shared-Module anlegen | Komponenten und Route-Helper   | Sequenziell | Bereit | LLM           | identische Exporte        |
| L2  | Consumer umstellen    | bekannte Importe und Routen    | Sequenziell | Bereit | LLM           | Typecheck, Route-Vertrag  |
| L3  | Kopien entfernen      | nur ersetzte Implementierungen | Sequenziell | Bereit | LLM           | keine Restimporte         |
| L4  | Abschluss prüfen      | Tests und Diff                 | Sequenziell | Bereit | LLM           | fünf Stufen               |

Fan-out: keiner. Beide Paare verlangen denselben Export- und Vertragsabgleich.

## 2 — Kontext-Koffer

### 2.1 Relevante Dateien

- [Blackjack-CasinoJeton](../../../../../src/components/casino/games/blackjack/CasinoJeton.tsx)
- [Slots-CasinoJeton](../../../../../src/components/casino/games/slots/CasinoJeton.tsx)
- [Session-sync-Route](../../../../../src/app/api/casino/session-sync/route.ts)
- [Migrate-session-Route](../../../../../src/app/api/casino/migrate-session/route.ts)
- [Duplikatprüfung](../../../../../scripts/check-duplication.mjs)

### 2.2 Invarianten

- Vor L1 die Byte-Gleichheit erneut messen; Abweichung beendet das betroffene Paar.
- CasinoJeton behält Props, Standardwerte, DOM-Ausgabe und Styling; nur der Importpfad wird zentral.
- Beide Routen behalten POST, Status 410 und Response-Body. Der Helper besitzt keine Auth-, Wallet- oder Datenbanklogik.
- Roulette-CasinoJeton bleibt außerhalb, weil es keine byte-identische Variante ist.

### 2.3 Nicht-Scope

- Kein Wallet-, RNG-, Auth-, API-Schutz- oder Supabase-Code.
- Keine allgemeine Komponentenbibliothek, keine Barrel-Datei und keine Änderung an Check-Skripten.
- Keine anderen, nur ähnlich aussehenden Dateien.

## 3 — Detaillierte Meilensteine

### L0 — Vertragsbaseline

- **Ziel:** Gleichheit und sichtbares Verhalten festhalten.
- **Schritte:** Paare hashen, Komponentenimporte suchen, POST gegen beide Routen lokal prüfen und Status plus Body notieren.
- **Erwartetes Verhalten:** Baseline enthält nur reale Consumer.
- **Abbruch/Rückfall:** Unterschiedliche Hashes, Props oder Antworten stoppen das Paar.

### L1 — Shared-Module anlegen

- **Ziel:** Je Paar eine kanonische Implementierung schaffen.
- **Schritte:** CasinoJeton im gemeinsamen casino-Komponentenbereich und einen kleinen 410-Route-Helper unter src/lib anlegen; Signaturen übernehmen.
- **Erwartetes Verhalten:** Neue Module enthalten nur gemeinsamen Inhalt.
- **Abbruch/Rückfall:** Neue Abhängigkeit auf Wallet, Auth oder Datenbank beendet den Schritt.

### L2 — Consumer umstellen

- **Ziel:** L0-Consumer auf den kanonischen Export lenken.
- **Schritte:** Blackjack und Slots importieren das Shared-Modul; beide route.ts delegieren an den Helper; Signaturen bleiben framework-konform.
- **Erwartetes Verhalten:** Nutzer und API-Clients erhalten Baseline-Verhalten.
- **Abbruch/Rückfall:** TypeScript-, Import- oder HTTP-Abweichung nimmt den letzten Schritt zurück.

### L3 — Kopien entfernen

- **Ziel:** Nur vollständig ersetzte Kopien entfernen.
- **Schritte:** Restimporte suchen; bei null Treffern alte Implementierungen löschen; Duplikatprüfung erneut ausführen.
- **Erwartetes Verhalten:** Entfernte Inhalte liegen vollständig im kanonischen Modul.
- **Abbruch/Rückfall:** Restimport oder abweichender Diff lässt alte Datei bestehen.

### L4 — Abschluss prüfen

- **Ziel:** Vertragsgleichheit und enge Änderung belegen.
- **Schritte:** Komponenten- und Routen-Tests, Typecheck, Duplikatprüfung und Diff ausführen.
- **Erwartetes Verhalten:** Weniger Doppelcode ohne neue API-Fläche.
- **Abbruch/Rückfall:** Unerwartete Route-, Styling- oder Testabweichung wird zurückgenommen.

## 4 — 5-Stufen-Abschlussprüfung

1. npm run typecheck ohne Fehler.
2. npm test ohne Fehlschlag, einschließlich vorhandener Komponenten- und API-Tests.
3. npm run lint ohne Errors.
4. npm run build erfolgreich.
5. npm run check-duplication, npm run check-file-sizes, POST-410-Vergleich und git diff --check sind grün.
