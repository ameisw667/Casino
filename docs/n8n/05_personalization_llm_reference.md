# Personalisierung via LLM-Node — Referenz für Stufe E

> **Deckt ab:** Stufe E. **Recherche-Stand:** 2026-08-28. **Wichtig — neue Voraussetzung, die den Hauptplan ergänzt:** Diese Stufe braucht einen eigenen LLM-API-Key (z. B. OpenAI), zusätzlich zu n8n- und Apify-Key. Dieser Key ist bewusst **nicht** der Casino-Projekt-Key aus `OPENAI_API_KEY`/`Z_LLM`, sondern ein eigener, unabhängiger Key — Wiederverwendung des Casino-Projekt-Keys für ein externes Sandbox-Projekt würde die Kostenzurechnung und Rate-Limits des Casino-Projekts vermischen.

## 1 — Node-Optionen in n8n

| Option                                                     | Eignung                                                                                                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| n8n-natives "OpenAI"-Node (Chat-Modell)                    | Einfachste Wahl, direkt für Text-Generierung mit Prompt+Kontext ausgelegt                                                                              |
| n8n "AI Agent"-Node                                        | Overkill für diesen Zweck — für Multi-Step-Reasoning/Tool-Calling gedacht, hier reicht eine einzelne Prompt-Completion                                 |
| Generischer HTTP-Request-Node gegen eine beliebige LLM-API | Flexibel, falls ein anderer Anbieter als OpenAI gewünscht ist (z. B. ein bereits vorhandener Anthropic-Key) — funktional gleichwertig zum nativen Node |

**Empfehlung:** natives OpenAI-Node, kleinstes/günstigstes verfügbares Modell — für kurze, strukturierte Anschreiben-Texte ausreichend, kein Grund für ein teures Flagship-Modell in dieser Sandbox-Stufe.

## 2 — Prompt-Design

Feste Struktur, damit die Ausgabe kontrollierbar bleibt:

```
System: Du schreibst kurze, professionelle Anschreiben-Entwürfe (max. 4 Sätze) für einen
Sandbox-Test. Nutze ausschließlich die gegebenen Fakten. Erfinde keine Aussagen über das
Unternehmen, die nicht in den Daten stehen. Kein Betreff, kein Grußformel-Overkill.

User: Firma: {{name}}
Branche: {{categoryName}}
Ort: {{address}}
{{#if website}}Website: {{website}}{{/if}}
```

Wichtige Leitplanken:

- **Keine erfundenen Fakten** — das Modell darf nur mit den tatsächlich vorhandenen Feldern arbeiten, sonst entsteht der Eindruck von "Recherche", die nie stattgefunden hat (relevant auch für später: bei echtem Produkt-Outreach wäre das ein Vertrauensbruch, sobald der Empfänger es merkt).
- **Kurz halten** — lange KI-Anschreiben wirken generischer, nicht persönlicher.
- **Kein Call-to-Action mit echtem Link** in dieser Sandbox-Stufe — der Text bleibt reiner Test-Inhalt, der nie einen echten Empfänger erreicht (Versand nur an Ethereal, siehe Stufe F).

## 3 — Kosten

Bei 20–50 kurzen Completions (jeweils wenige hundert Tokens Input+Output) mit einem kleinen Modell: Kosten im Cent-Bereich, praktisch vernachlässigbar — dennoch sollte Jan seinen eigenen LLM-Account mit einem Ausgaben-Limit versehen, bevor der Key geteilt wird (allgemeine Vorsichtsmaßnahme, unabhängig von diesem Plan).

## 4 — Verifizierung (konkretisiert)

"Stichprobe zeigt erkennbar individualisierte, nicht austauschbare Texte" heißt konkret: mindestens 5 zufällig gezogene Ergebnis-Texte manuell gegenlesen — wenn zwei davon bis auf den Firmennamen identisch klingen, ist der Prompt zu generisch und muss nachgeschärft werden (z. B. durch stärkere Branche/Ort-Gewichtung im Prompt).
