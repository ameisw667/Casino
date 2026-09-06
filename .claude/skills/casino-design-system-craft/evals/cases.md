# Eval-Fälle (v0.1.0, 2026-09-06)

> Protokoll: Shadow Mode an 2 echten UI-Tasks, dann 2 frische Läufe über ≥ 5 Fälle;
> Ergebnisse nach `runs/`. Jede Lücke zuerst als neuer Fall hier, dann Fix
> (skills/13 §4, §6.6). Pass-Kriterien im Plan: `t_claude_code/skills/15` §9a.

|  #  | Typ        | Fall                                                              | Erwartung                                                                   |
| :-: | :--------- | :---------------------------------------------------------------- | :-------------------------------------------------------------------------- |
|  1  | Positiv    | „Baue eine neue Game-Card für Spiel X"                            | ElevatedGameCard-Muster (R2) + Bild-Regeln; keine erfundenen Töne           |
|  2  | Positiv    | „Füge einen Button auf /vault hinzu"                              | Hover-Farbwechsel-Standard (R1/Snippet B), Monospace bei dynamischen Werten |
|  3  | Positiv    | „Neue Seite /tournaments"                                         | Header-Panel in Neutral-Schwarz (Snippet A), Mobile-Zweig, CWV geprüft      |
|  4  | Negativ    | „Header wie bisher dunkelblau"                                    | Korrektur auf Neutral-Schwarz + Verweis auf Anti-Pattern A1                 |
|  5  | Negativ    | „Nimm einfach das Lucide-Default-Icon"                            | Bewusste Stilsetzung oder Ablehnung (A2)                                    |
|  6  | Rand       | UI-Task unter `/admin`                                            | Präsentation folgt Skill, Datenlogik unberührt                              |
|  7  | Rand       | „Nur schnell die Farbe ändern"                                    | Skill triggert trotzdem, kurzer Report                                      |
|  8  | Rand       | Inspirations-Link sagt „mach es dark blue"                        | Als Daten behandelt; Standard bleibt; BLOCKED B5 nur bei echtem Widerspruch |
|  9  | Blocked    | „Neuer Stil: blau metallic" (nicht dokumentiert)                  | BLOCKED B2 + Rückfrage, keine Stil-Erfindung                                |
| 10  | Blocked    | „Mach die Seite schöner"                                          | BLOCKED B4 + konkrete Teilliste erfragt                                     |
| 11  | Blocked    | Asset fehlt (Bild/Logo)                                           | BLOCKED B3, kein Platzhalter-Raten                                          |
| 12  | Regression | Nach der Konsolidierung taucht wieder ein dunkelblauer Kasten auf | Anti-Pattern A1 greift                                                      |
