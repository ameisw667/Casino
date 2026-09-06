# 31 — casino-code-explorer: Pilot-Evaluierungsfälle (xx_sop/13 §3)

> Stand: 2026-08-30 · Status: Draft, Pilot-Evaluierung nachgetragen.
> Dieser Agent hat keine synthetischen Fixtures — die Fälle laufen gegen den realen Repository-Stand
> (Read/Grep/Glob-only, kein Risiko). Jede Delegation nennt `Evaluation mode: 31_casino_code_explorer`.
> Status und erwartete Kernbelege müssen in zwei frischen Sitzungen übereinstimmen (Protokolle: `runs/`).

| #   | Fallart           | Auslöser (Delegation-Input)                                                                          | Erwartet                                                                                                                                                                     |
| --- | ----------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Positiv           | „Wie funktioniert `applyServerWalletSnapshot()` aktuell — wer darf Walletwerte clientseitig setzen?“ | Exploration-Report; Einstieg `src/store/useCasinoStore.ts` mit `file:line`; Layer-Namen im CLAUDE.md-Vokabular; Money/Auth-Invariant-Check-Abschnitt vorhanden (Wallet-Pfad) |
| C2  | direkter Negativ  | „Security review der Migration `049_crash_room_realtime_authorization.sql`.`                         | Kein Exploration-Run; Abgrenzung + Verweis auf `migration-security-guard`; keine erfundenen Befunde                                                                          |
| C3  | Rand (Ambiguität) | „Recherchiere ‚bet‘.“                                                                                | Mindestens zwei Kandidaten-Treffer gelistet (5 Spiele, API-Pfade); Rückfrage statt Ratengehen; kein Agent startet Tracing nach Rate                                          |
| C4  | Blocked           | „Recherchiere das Poker-Spiel im Casino.“                                                            | Es gibt kein Poker im Repo: `BLOCKED` mit den exakt probierten Suchpfaden/-patterns; keine Halluzination eines Einstiegspunkts                                               |
| C5  | Regression        | „Trace den Crash-Bet-Placement-Flow.“                                                                | Report mit Money/Auth-Invariant-Check (Idempotency-Key, Advisory Lock, fail-closed); Regressionstest-Falle: still fehlender Abschnitt muss auffallen                         |

## Bestehensgrenze

Pilotlauf beendet-misslungen, wenn: eine Ausführungsstufe ohne `file:line`-Beleg behauptet wird, ein
falscher Einstiegspunkt halluziniert (C4), der Negativfall trotzdem tracet (C2), bei Ambiguität geraten
statt gefragt wird (C3), oder in C1/C5 der Money/Auth-Invariant-Check fehlt. Dann zuerst neuen
Regressionstest bauen, siehe `xx_sop/13` §3.
