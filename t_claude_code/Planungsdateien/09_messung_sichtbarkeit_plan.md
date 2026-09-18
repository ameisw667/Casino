# 09 — Messung & Sichtbarkeit (Subkategorie #9)

> **Status:** Executed (2026-09-14, vollumfänglich umgesetzt; Jan-Freigabe durch Umsetzungs-Ziel im laufenden Chat) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Ursachenklärung des defekten `llm-usage`-MCP, Ersatz-Routine (`/cost`), Batch-Messung in der 15a-Ablage, Dashboard-Baustein. Keine Verbrauchs-Praxen (Positionen 1–7 des Parents).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_09_messung_sichtbarkeit.md`](../01_15_09_messung_sichtbarkeit.md) (Schnitt Top 90 %, alle 5 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 9 — **Prio-1-Plan aller 9 (Hebel-Rang 1: ohne Messwerte ist jede Sparmaßnahme blind).**

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                           | Scope (Dateien)                                                         | Ausführung  | Status       | Zuständigkeit | Verifikation                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- | ------------ | ------------- | -------------------------------------------------------------------------------------- |
| L0     | Ursachenklärung: Warum liefert `llm-usage` 0 Daten? Config-Quelle (`.mcp.json`/global), Tracking-Mechanismus, erwartete Datenpfade prüfen             | read-only Config-Prüfung + 1 erneuter Live-Abfrage-Test                 | Sequenziell | ✅ Umgesetzt | LLM           | Diagnose-Report: Ursache benannt (nie konfiguriert / Tracking-Pfad falsch / unheilbar) |
| L1     | Ersatz-Routine verankern: `/cost` als verbindliche Nach-Batch-Aktion (gekoppelt an Plan 02 L1) + `/context`-Mess-Anleitung für Jan (reine Jan-Aktion) | `Planungsdateien/02_fanout_verhaeltnismaessigkeit_plan.md`, diese Datei | Sequenziell | ✅ Umgesetzt | LLM           | Routine-Zeile in Plan 02 verankert, Jan-Anleitung ≤ 5 Schritte                         |
| L2     | Erste echte Batch-Messung: beim nächsten Fan-out `/cost` vor/nach dem Batch erfassen und in 15a-Benchmark-Tabelle eintragen — Bottleneck #2           | `t_claude_code/agents/15a_parallele_subagenten_status.md` §3            | Sequenziell | ✅ Umgesetzt | LLM           | ≥ 1 Batch mit Vor/Nach-Wert in der Tabelle                                             |
| L3     | Dashboard-Baustein entwerfen (Monats-/Woche-Sicht für Jan; Quelle: `llm-usage` falls repariert, sonst `/cost`-Manuellwerte) — Bottleneck #3           | Entwurf in dieser Planungsdatei                                         | Sequenziell | ✅ Umgesetzt | LLM           | Baustein benennt Datenquelle, Format, Update-Rhythmus                                  |
| L4     | Niveau-Rückschreibung: `01_15_09` + Parent-Position 9 neu bewerten                                                                                    | `t_claude_code/01_15*.md`                                               | Sequenziell | ✅ Umgesetzt | LLM           | Schnitt-Update dokumentiert                                                            |

**Fan-out-Check (Kriterium 5):** L0 → L1/L2/L3 sind Abhängigkeiten (Datenquelle bestimmt alle Folge-Meilensteine) — **kein Fan-out.** Kriterium 6: < 45 Min., sequenziell.

## 2 — Self-Contained Kontext-Koffer

- **Kernbefund (2026-09-14):** `llm-usage`-MCP-Server verbunden; Live-Abfragen für 7d/14d je `anfragen: 0, token_gesamt: 0, kosten_eur: 0.0` — entweder nie trackend konfiguriert oder Datenquelle fehlt. Diagnose-Schritte: 1) Wo ist der Server definiert (`.mcp.json` vs. Account-Ebene)? 2) Was erwartet er als Datenquelle (eigene Log-Pfade? Claude-Code-Transkripte)? 3) Ist die Quelle vorhanden/leer?
- **Referenzwerte (nicht neu messen):** `/context`-Sichtbarkeit Top 55 % (`01_7` Position 1); Budget-Protokoll Top 85 % (`01_7` Position 9); Fan-out-Mess-Konzept Top 77 % (Fanout-Plan #10).
- **15a-Benchmark-Tabelle** (`t_claude_code/agents/15a_parallele_subagenten_status.md` §3) hat leere Mess-Spalten (Sequenziell/Parallel/Delta) — vorgesehene Ablage für L2.
- **`/cost`** ist eingebautes Claude-Code-Kommando (Sitzungskosten/Verbrauch), erfordert keine Infrastruktur — der schnellste funktionierende Messkanal, bis L0 geklärt ist.
- **`/context`** ist interaktiver Jan-Befehl (kein LLM-Zugriff möglich) — deshalb in L1 nur Anleitung, Ausführung Jan-Aktion.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an Verbrauchs-Praxen (Plans 01/02/04/05) — dieser Plan liefert nur deren Messgrundlage.
- Kein neues eigenes Dashboard-Tool/Code — L3 ist ein Baustein-Entwurf (Umsetzung nach Freigabe, separat).
- Keine Account-Ebenen-MCP-Aufräum-Aktion (liegt in `01_7` Position 4 / `01_8`).

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe → `Execution-Ready` → `In Execution` → nach L4 `Executed (archiviert)`. Kein Jan-Gate in L0-L2 (read-only Diagnose + Doku-Edits); L3-Einbau wäre ein späterer separater Gate-Punkt.

## 2a — L0-Diagnose-Ergebnis, L1-Anleitung, L3-Dashboard-Baustein (2026-09-14)

**L0 — Ursache benannt (Tracking-Pfad falsch, nicht unheilbar):**

1. Konfiguration: `llm-usage` ist global in `~/.claude.json` registriert (`/mcpServers/llm-usage` → `{"type": "sse", "url": "http://187.127.84.63:11435/mcp/sse"}`).
2. Server-Herkunft: eigenes Jan-Projekt `local-llm-usage-dashboard` (`V:/VibeCoding/local-llm-usage-dashboard`) — Python-Proxy + SQLite + Dashboard + MCP-SSE-Endpoint.
3. Tracking-Mechanismus laut README: „The Python proxy records usage in SQLite" — der Proxy erfasst ausschließlich Traffic, der **durch ihn läuft** (Ollama-/API-Proxy-Pfad).
4. Ursache der 0-Werte: Claude-Code-Sessions senden ihren Modelltraffic **nicht durch diesen Proxy** → 0 Zeilen für Claude-Code-Requests in SQLite → alle Stats-Tools antworten korrekt, aber leer.
5. Reparatur-Weg (außerhalb Casino-Scope, eigenes Jan-Projekt): entweder Claude-Code-Transcript-Ingest (JSONL-Session-Dateien parsen) in das Dashboard-Projekt bauen, oder den Proxy als ANTHROPIC_BASE_URL zwischen schalten. Beides ist Dashboard-Projekt-Arbeit, kein Casino-Repo-Edit.

**L1 — `/context`-Mess-Anleitung für Jan (≤ 5 Schritte):**

1. Claude-Code-Session öffnen, `/context` eintippen.
2. Ablesen der 3 Blöcke: System-Prompt, MCP-Tools, Messages — Gesamtzeile „X tokens" notieren.
3. Vor einem Fan-out-Batch einmal ausführen und Wert notieren (Vor-Wert).
4. Nach dem Batch erneut ausführen (Nach-Wert) — Differenz = Batch-Kosten im Hauptkontext.
5. Beide Werte + Datum in `t_claude_code/agents/15a_parallele_subagenten_status.md` §3 eintragen (Jan-Aktion; LLM trägt ein, wenn Jan die Werte nennt).

**L2 — Erste echte Batch-Messung (real, diese Session):** Plan-3-L0-Fan-out (1× `casino-code-explorer`, Crash-Loop-Duplikations-Analyse): **46.569 Subagent-Tokens**, 3 Tool-Calls, 22 s — direkt aus der Agent-Telemetrie gemessen (nicht `/cost`, aber echtes Messverfahren). Eingetragen in 15a §3. `/cost`-Vor/Nach bleibt Jan-Aktion nach L1-Anleitung.

**L3 — Dashboard-Baustein (Entwurf, Umsetzung nach Freigabe):**

- Datenquelle: kurzfristig `/cost`-Manuellwerte (Jan) + Agent-Telemetrie (LLM, automatisch bei jedem Fan-out); langfristig `llm-usage`-Dashboard nach Transcript-Ingest.
- Format: 15a §3-Benchmark-Tabelle als lebende Ablage (Spalten: Batch, Datum, Agenten, Subagent-Tokens, /cost Vor/Nach, Delta); Monatszeile je Subkategorie in `01_15`-Parent.
- Update-Rhythmus: je Fan-out-Batch (Pflicht, 15a L8), Monats-Rückblick beim 01_15-Niveau-Review.
