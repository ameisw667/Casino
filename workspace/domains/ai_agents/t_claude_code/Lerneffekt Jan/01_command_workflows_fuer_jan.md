# Command-Workflows für Jan

> **Status:** Temporäre Lernübersicht · **Stand:** 2026-09-17 · **Ziel:** Sicher entscheiden, ohne Commands auswendig zu lernen.

## Die einfache Idee

Ein Command ist ein klarer Arbeitsauftrag an das Projekt. Vorher stellst du nur vier Fragen: **Was möchte ich wissen? Was darf sich ändern? Betrifft es nur meinen Rechner oder auch einen externen Dienst? Brauche ich dafür eine Freigabe?**

## Die wichtigsten Projekt-Commands

| Command                   | Wofür er da ist                                         | Wann Jan ihn braucht                                                 | Was er verändert                             | Warum er sinnvoll ist                                                         | Merksatz                                        |
| :------------------------ | :------------------------------------------------------ | :------------------------------------------------------------------- | :------------------------------------------- | :---------------------------------------------------------------------------- | :---------------------------------------------- |
| `git status --short`      | Zeigt kurz, was sich im Projekt verändert hat           | Vor einer Änderung, einem Commit oder wenn etwas unerwartet aussieht | Nichts                                       | Verhindert, dass fremde oder alte Änderungen versehentlich mitgenommen werden | **Erst sehen, dann handeln.**                   |
| `npm test`                | Prüft, ob vorhandene Funktionen weiter korrekt arbeiten | Nach einer Logik- oder Verhaltensänderung                            | Kein Quellcode; erzeugt nur Testergebnis     | Findet Fehler früh, bevor sie in andere Bereiche wandern                      | **Verhalten prüfen.**                           |
| `npm run typecheck`       | Prüft, ob TypeScript-Teile logisch zusammenpassen       | Nach Änderungen an Typen, Daten oder Schnittstellen                  | Kein Quellcode                               | Fängt viele Verbindungsfehler zwischen Dateien                                | **Passen die Bausteine zusammen?**              |
| `npm run lint`            | Prüft Regeln für lesbaren und konsistenten Code         | Nach Codeänderungen                                                  | Kein Quellcode                               | Hält den Code wartbar und entdeckt typische Fehler                            | **Sauberer Code ist leichter zu prüfen.**       |
| `npm run build`           | Baut die Produktionsversion lokal nach                  | Vor Abschluss einer größeren Änderung                                | Lokale Build-Ausgabe und Cache               | Zeigt, ob das Projekt später grundsätzlich startbar ist                       | **Kann das Ganze zusammen gebaut werden?**      |
| `npm run check-doc-links` | Prüft Dokumentlinks auf echte Ziele                     | Nach Doku-, Dateinamen- oder Strukturänderungen                      | Nichts                                       | Verhindert tote Übersichts- und Lernlinks                                     | **Ein Link muss zu einer echten Datei führen.** |
| `git diff --check`        | Findet einfache Formatprobleme im Unterschied           | Vor Übergabe einer Text- oder Codeänderung                           | Nichts                                       | Vermeidet unnötigen Lärm wie Leerzeichenfehler                                | **Kleine Fehler vorher ausräumen.**             |
| `npm run dev`             | Startet die lokale Entwicklungsansicht                  | Wenn du die Anwendung lokal ansehen oder testen willst               | Startet Server; lokale Cache-Dateien möglich | Macht Änderungen direkt sichtbar, ohne Production zu berühren                 | **Lokal anschauen, bevor etwas live geht.**     |

## Vier Wirkungsarten unterscheiden

| Art                  | Bedeutet in Alltagssprache                               | Typische Beispiele                                               | Wichtige Grenze                                                            |
| :------------------- | :------------------------------------------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Prüfen**           | Etwas anschauen oder messen                              | `git status --short`, `npm test`, `npm run lint`                 | Ändert normalerweise keinen Quellcode, kann aber Ergebnisse erzeugen.      |
| **Lokal verändern**  | Nur auf deinem Rechner Dateien, Cache oder Docker ändern | `npm run build`, `npm run format`, `npm run supabase:types`      | Rückgängig oder prüfbar machen, bevor du weitergehst.                      |
| **Remote lesen**     | Daten eines externen Dienstes ansehen                    | `npm run economy-audit`, GitHub- oder Sentry-Abfragen            | Verändert nichts dort, kann aber Zugänge und vertrauliche Daten betreffen. |
| **Remote schreiben** | Einen externen Dienst oder echte Daten verändern         | `npm run fraud-ml-scan`, Deploy-, Backup- oder Datenbankaktionen | Nur mit klarer Freigabe und bekanntem Rückweg.                             |

## Was ein Workflow ist – und was nicht

Ein Workflow ist nicht einfach eine lange Befehlskette. Er lohnt sich erst, wenn **dieselbe sichere Reihenfolge mehrfach wirklich vorkommt**. Im aktuellen Audit gibt es dafür keinen belastbaren neuen Fall: **Kein Workflow-Kandidat – Beobachtung fortsetzen.**

## Wenn du unsicher bist

1. Starte mit einem Prüf-Command.
2. Lies in der Command-Referenz Zweck und Wirkungsgrenze.
3. Frage nach, bevor ein Command lokal oder remote schreibt.
4. Erst bei echter Wiederholung überlegen wir gemeinsam, ob ein Workflow sinnvoll ist.

## Weiterführende Dateien

- [Projekt-Command-Referenz](file:///V:/VibeCoding/Casino/xx_docs/02_command_reference.md)
- [1.4 Command-Workflow-Übersicht](file:///V:/VibeCoding/Casino/t_claude_code/01_4_command_workflow.md)
- [Globaler Decision Gate](file:///V:/VibeCoding/Casino/t_claude_code/commands/01_commands_load_audit.md)
