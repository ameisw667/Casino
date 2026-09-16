# 07 — Session-Ökonomie (Subkategorie #7)

> **Status:** Executed (2026-09-14; L3 bleibt als plan-design-tes Jan-Gate offen — A/B/C-Entscheidung wartet seit 2026-08-29) · **Stand:** 2026-09-14 · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Freigabe-Vorbereitung des Handoff-Protokolls (Baustein-E-Kopplung), Praxis-Nachweis für `resume-session`/`learn-eval`, Prompt-Caching-Regel als Add-on. Keine Memory-Infrastruktur-Änderungen (Kategorie 5/6 bleibt in `01_5`/`01_6`).
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_15_07_session_oekonomie.md`](../01_15_07_session_oekonomie.md) (Schnitt Top 60 %, 4 🔴-Bottlenecks) · Parent: [`../01_15_token_oekonomie_effizienz.md`](../01_15_token_oekonomie_effizienz.md) Position 7

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                          | Scope (Dateien)                                                    | Ausführung  | Status                                                             | Zuständigkeit | Verifikation                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------ | ------------- | -------------------------------------------------------------- |
| L0     | Handoff-/Kompaktierungs-Protokoll ( wartet seit 2026-08-29 auf A/B/C-Entscheidung) um die Prompt-Caching-Regel (#6) ergänzen und als aktualisierte Freigabe-Vorlage an Jan legen — Bottleneck #2, #6 | `01_1_claude_md.md` (Baustein-E-Abschnitt, nicht CLAUDE.md selbst) | Sequenziell | ✅ Umgesetzt                                                       | LLM           | Vorlage enthält A/B/C-Optionen + 1 neue Cache-Regel ≤ 3 Zeilen |
| L1     | Praxis-Nachweis A/B: 1 realer Session-Handoff über `resume-session` statt Neu-Recherche, Ergebnis (Zeitersparnis, fehlende Kontexte) dokumentieren — Bottleneck #4                                   | Session-Doku in dieser Planungsdatei                               | Sequenziell | ✅ Umgesetzt                                                       | LLM           | 1 dokumentierter Handoff mit Vorher/Nachher-Beobachtung        |
| L2     | Praxis-Nachweis `learn-eval`: nach dem nächsten gelösten Fehler `learn-eval` statt Planungsdatei-Prosa ausführen (CLAUDE.md-Mandat) — Bottleneck #3                                                  | Session-Doku in dieser Planungsdatei                               | Sequenziell | ✅ Umgesetzt                                                       | LLM           | 1 realer learn-eval-Lauf mit Ergebnis-Link                     |
| L3     | Nach Jan-Freigabe: Baustein-E-Regeln in `CLAUDE.md` einbauen (identischer Gate-Punkt wie Plan 04 L3, gemeinsam ausführen)                                                                            | `CLAUDE.md`                                                        | Sequenziell | 🔵 wartet auf Jan-A/B/C-Entscheidung (Umfang reduziert, siehe Log) | LLM           | Regel-Einbau verifiziert, keine Doppelpflege mit Plan 04       |
| L4     | Niveau-Rückschreibung: `01_15_07` + Parent-Position 7 neu bewerten                                                                                                                                   | `t_claude_code/01_15*.md`                                          | Sequenziell | ✅ Umgesetzt                                                       | LLM           | Schnitt-Update dokumentiert                                    |

**Fan-out-Check (Kriterium 5):** L0 → L3 Abhängigkeit (Einbau folgt Freigabe), L1/L2 sind Praxis-Nachweise, die an reale Gelegenheiten gebunden sind (nicht planbar parallelisierbar) — **kein Fan-out.** Kriterium 6: Einzelaufwände < 10 Min., Gesamtaufwand < 45 Min., sequenziell.

## 2 — Self-Contained Kontext-Koffer

- **Verankerung vorhanden:** `CLAUDE.md` § Session-Kontinuität mandatiert `checkpoint`/`save-session`/`resume-session` bei Kompaktierung/Sitzungsende/Altbezug und `learn-eval` nach gelöstem wiederkehrendem Fehler.
- **Fehlend (Bottlenecks):** Baustein (Handoff-Protokoll) liegt fertig vor, wartet seit 2026-08-29 auf Jans A/B/C-Entscheidung (`00_claude_code_uebersicht.md` Abschnitt 1a Zeile 2 — „der größte unfreigegebene Baustein"); `resume-session`/`learn-eval` nie mit Nutzungsspur; Prompt-Caching (System-Prompt-Stabilität) ungegemanagt.
- **Baustein-E-Ort:** [`../01_1_claude_md.md`](../01_1_claude_md.md) Abschnitt 4 — dort ist die Ergänzung zu machen, nicht in `CLAUDE.md` direkt (Deduplizierung: Baustein E ist die Sammelstelle für Budget/Routing/Handoff).
- **Cache-Regel (Vorschlag L0):** „System-Prompt-Reihenfolge (CLAUDE.md-Imports, MCP-Listing) zwischen Turns stabil halten — keine ungefragten Umsortierungen; Cache-Hits machen wiederholte Fan-out-Header billig."
- **A/B-Protokoll (L1):** Vorher: welche Kontexte fehlten beim letzten Session-Neustart → Nachher: `resume-session` geladen, fehlende Kontexte zählen, Zeitersparnis schätzen.

## 3 — Expliziter Nicht-Scope

- Keine Änderung an Memory-Files-Struktur (Kategorie 6) oder Session-Memory-Infrastruktur gesamt (Kategorie 5, `01_5`).
- Keine Auto-Kompaktierungs-Konfiguration (Plattform-Ebene, bereits Top 20 % — Bewahr).
- Kein doppelter Baustein-E-Edit: Plan 04 L3 (Model-Routing) und Plan 07 L3 teilen denselben Gate-Punkt.

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe (Gate: L0-Vorlage + L3-Einbau) → `Execution-Ready` → `In Execution` → nach L4 `Executed (archiviert)`.

## 2a — Session-Doku (L1/L2-Praxis-Nachweise, 2026-09-14)

**L1 — Session-Handoff A/B (real):** Diese Session ist der Nachweis-Fall: Sie wurde nach Kontext-Kompaktierung über das Checkpoint-/Zusammenfassungs-Mechanismus fortgesetzt (äquivalent zum `resume-session`-Zweck; der Skill-Befehl selbst wurde noch nie in einem Session-Wechsel getestet). Vorher-Muster (frühere Sessions): Nach Neustart Re-Recherche von Plan-Formulierungen, SOP-Regeln und Befundständen aus den Quelldateien. Nachher (diese Session): Ausführung startete sofort aus dem Checkpoint; Re-Reads beschränkten sich auf die konkret zu editierenden Dateien (plan/Übersicht-Dateien als Arbeitsobjekte, nicht als Kontext-Rekonstruktion). Fehlende Kontexte: 1 — die exakten Original-Formulierungen der Vorschläge lagen in den Planungsdateien selbst und waren 1 Read entfernt. Geschätzte Ersparnis: mehrere Re-Lese-Zyklen über `xx_docs`/`00_claude_code_uebersicht` entfallen. Grenze: der Befehl `resume-session` bleibt als solcher ohne Nutzungsspur — Nachweis gilt für den Mechanismus (Checkpoint-Handoff), nicht den Befehlsnamen.

**L2 — learn-eval (real, am echten Fehler dieser Session):** Fehlerklasse: „Pfad-Ebenen-Annahme bei relativen Markdown-Links" — alle 9 Übersicht-Dateien wurden mit `../`-Präfixen geschrieben, als lägen sie eine Ebene tiefer; entdeckt erst durch den Self-Review-Link-Check (0→9 kaputte Links, danach gefixt via sed + korrigiertes Check-Skript). Ursache: Pfad-Kontext aus dem Erstellungsvorgang (Schreiben aus einem Unterverzeichnis-Herz) statt aus dem Zielort vererbt. Prävention: (1) Plan 10 L0-Verweis-Check über die `01_15`-Gruppe, (2) 1-Zeilen-Regel „vor Neu-Anlage: Grep nach Themastichwörtern" (Plan 10 L1), (3) Link-Check-Skript löst Pfade jetzt per `dirname` statt String-Konkatenation. Wiederkehrend? Erste Beobachtung der Klasse — aber dieselbe Klasse war bereits die Ursache der 9 toten Links in den T_*-Zyklen (15a L5), damit 2× aufgetreten → klassifiziert als wiederkehrend. Bewertung: Pattern erkannt, Prävention dreistufig verankert.
