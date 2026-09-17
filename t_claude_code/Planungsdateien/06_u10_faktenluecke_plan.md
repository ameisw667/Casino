# 06-U10 — Frühere Faktenlücke in der Kategorie-Übersicht (Unterkategorie 10)

> **Status:** **Executed (archiviert 2026-09-16, siehe §5)** · **Stand:** 2026-09-14 · **Owner:** LLM · **Scope:** Rein repo-seitige Korrektur des veralteten abgeleiteten Fakt-Claims in `00_claude_code_uebersicht.md` (§1a Zeile 42) samt Niveau-Rückschreibung und 00 ↔ 01_6-Verweis-Konsistenz.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_6_10_faktenluecke.md`](../01_6_10_faktenluecke.md) (gewichteter Schnitt Top 22 %; Bottleneck: Verweis-Integrität nach 00, Subsub 2 Top 30 %; Rest `/context`-18 = Jan-Eigentum, bewusst im Nicht-Scope)
> **Ausführungs-Log 2026-09-16 (Ergebnis):** Kein Memory-Gate nötig (verifiziert: alle Edits in `t_claude_code/**`, Memory-Ordner unberührt). L0: Die 5 Referenzzeilen aus §2a wurden wörtlich bestätigt, **mit Zeilennummern-Verschiebung** (der vorangehende U06-Batch hat `00` oberhalb verändert: alte 42 → **45**, alte 62 → **63**; Inhalte unverändert) — Anker daher über Row-String, nicht über Zeilennummer. L1: Row-Ersatz in 00:45 (Befund + Plan-Link + Execution-Zelle); Grep `2 von 4 vorgesehenen Memory-Typen` → **0 Treffer** in `00` (Treffer nur noch als datierte Historie in `01_6:13`/`01_6_10`). L2: 0 tote Links in den geänderten Zeilen (alle relativen Links aufgelöst); **Worldmap: keine Registrierung** — Abschnitt „Aktive Pläne" existiert weiterhin nicht, kein neuer Abschnitt angelegt (§2d-Abweichung, wie dort vorab festgelegt). L3: 00:21 → **Top 44 % (Re-Rating 2026-09-16)**, §1a-Rang **4 → 7**, 00:63 Hebel **275 → 220**, Formelterme 00:27 → **Top 44 %** / 00:29 → **Top 41 %**; `01_6_10` Subsub 2 **Top 30 % → Top 12 %**, Datei-Schnitt **Top 22 % → Top 18 %**; Parent Position 10 + Aggregate aktualisiert. **Abweichung von §5c (Rechnung korrigiert, nicht der Zielwert):** projiziert waren `01_6:42` = Top 48 %/47 % und 00:21 = Top 48 %; tatsächlich Top 44 %/Top 44 %, weil der gleichzeitig freigegebene Plan 06_u06 die Memory-Files-Kategorie 36 % → 6 % senkte (Gewicht 12 %) — die Rechnung wurde nachgezogen, die Kategorie-Note also besser als projiziert.

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                                                            | Scope (Dateien)                                                                            | Ausführung  | Status     | Zuständigkeit | Verifikation                                                                                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------- | ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0     | Verweis-Drift verifizieren: Ist-Formulierungen von `00_claude_code_uebersicht.md` (Zeilen 21, 27, 29, 42, 62) per Read gegen §2a abgleichen; Abweichung → Plan-Text vor Ausführung korrigieren, nicht die Zieldatei blind editieren                    | read-only: `../00_claude_code_uebersicht.md`                                               | Sequenziell | 🔴 Geplant | LLM           | Report: 5 Zeilen stimmen wörtlich mit §2a überein, 0 Abweichungen                                                                                                |
| L1     | Korrektur-Edit 00:42: Befund-Zelle + Planungsdatei-Zelle + Execution-Zelle nach §2a Nachher (1 Zeilen-Edit, als ganzer Row-String eindeutig); **keine stille Überschreibung** — das Korrektiv trägt das Datum + Beleg im Zelltext                      | `../00_claude_code_uebersicht.md` (nur Zeile 42)                                           | Sequenziell | 🔴 Geplant | LLM           | Grep `2 von 4 vorgesehenen Memory-Typen` → 0 Treffer in `00_claude_code_uebersicht.md` (Treffer in `01_6:13` / `01_6_10` bleiben als datierte Historie bestehen) |
| L2     | Verweis-Prüfung 00 ↔ 01_6: alle eingefügten relativen Links auflösen (00 → Plan, 00:42 → 01_6), Duplikat-Check der Niveau-Strings; Registrierung in `worldmap/00_WORLDMAP_STATUS.md` nur, wenn dort ein „Aktive Pläne"-Abschnitt existiert (siehe §2d) | `../00_claude_code_uebersicht.md`, `../../worldmap/00_WORLDMAP_STATUS.md`                  | Sequenziell | 🔴 Geplant | LLM           | 0 tote Links in den geänderten Zeilen; Registrierungs-Entscheidung dokumentiert                                                                                  |
| L3     | Niveau-Rückschreibung nach §5: 00:21, §1a-Rangfolge, 00:62 (Hebel) + Formelterme 00:27/00:29; danach Re-Rating `01_6_10` Subsub 2 + Parent-Rückverweis `01_6:40`                                                                                       | `../00_claude_code_uebersicht.md`, `../01_6_10_faktenluecke.md`, `../01_6_memory_files.md` | Sequenziell | 🔴 Geplant | LLM           | Rechenprüfung §5 (Schnitt-Werte unverändert: 00:27 Top 45 %, 00:29 Top 41 %, `01_6:42` Top 48 %/47 %) + `01_6_10`-Schnitt neu dokumentiert                       |

## Fan-out-Check (Kriterium 5/6)

L0 → L1 → L2 → L3 strikt sequenziell — **kein Fan-out.** Begründung: Kein Meilenstein ist unabhängig — L1 braucht L0s Wortlaut-Verifikation als Edit-Anker, L3 braucht L1s korrigierte Row für eindeutige Niveau-Edit-Anker (der String `Top 55 %` allein ist in `00` mehrfach vorhanden). Es ist ein Ein-Datei-Doku-Edit mit zwei abhängigen Rückverweis-Edits. Kriterium 6: Gesamtaufwand < 45 Min., jede Stufe < 10 Min. — Fan-out-Schwelle deutlich nicht erreicht, sequenziell ist Pflicht.

## 2 — Self-Contained Kontext-Koffer

### 2a — Verifizierte Vorher/Nachher-Formulierungen (Read + Grep, 2026-09-14)

Alle folgenden Strings wurden am 2026-09-14 per Read aus `../00_claude_code_uebersicht.md` verifiziert — sie sind der maßgebliche Ist-Stand für L0.

**Zeile 42 (§1a Bottleneck-Ranking, Rang 4) — Vorher (wörtlich):**

```
|  4   | **6 — Memory Files**                         |              Top 55 %              | 2 von 4 vorgesehenen Memory-Typen (`user`, `reference`) haben 0 Einträge trotz 836 Sitzungsstarts | — *(noch keine Planung)* | 🔵 geplant/wartet |
```

**Klassifikations-Entscheidung (L1-Vorfrage):** Die Zeile trägt **keinen** datierten Audit-Stand, sondern einen lebenden Fakt-Claim (kein „Stand 2026-08-30", kein „nachbewertet"-Qualifier — anders als Zeile 39/46 derselben Tabelle, die „nachbewertet 2026-09-05"/„gewichtet neu bewertet 2026-09-13" tragen). Deshalb ist hier ein **echter Ersatz** korrekt — nicht die 01_6-Variante der datierten Ergänzung. Der Ersatz selbst trägt das Korrektionsdatum als Qualifier, damit die Drift-Geschichte im Text sichtbar bleibt.

**Nachher (Ersatz für die Zeile 42):**

```
|  6   | **6 — Memory Files**                         | Top 48 % (Re-Rating 2026-09-14)    | 1 von 4 vorgesehenen Memory-Typen (`user`) hat 0 Einträge trotz 836 Sitzungsstarts; `reference` seit 2026-09-04 belegt (1 Eintrag, Beleg [`01_6_memory_files.md`](01_6_memory_files.md) Zeile 17) — Verweis-Drift zum Audit-Stand 2026-08-30 korrigiert am 2026-09-14 | [`Planungsdateien/06_u10_faktenluecke_plan.md`](Planungsdateien/06_u10_faktenluecke_plan.md) | 🔵 Execution-Ready (1 Plan) |
```

_Anmerkung zur Rang-Spalte: Der Rang wechselt durch die Niveau-Rückschreibung von 4 auf 6 (Teilung mit Context-Management) — siehe §2c; L1 führt nur den Befund/Plan-/Execution-Zellen-Edit aus, den Rang ändert L3. Um doppelte Edits an derselben Zeile zu vermeiden, darf L1 die Zeile bereits mit Rang 6 schreiben und L3 sie dann nur in die richtige Tabellenposition verschieben._

**Weitere verifizierte Vorkommen desselben Drifts (alle in `00_claude_code_uebersicht.md`):**

| Zeile        | Vorher (Kernaussage)                                                           | Betrifft              | Fix in               |
| ------------ | ------------------------------------------------------------------------------ | --------------------- | -------------------- |
| 21           | Niveau-Zelle `**Top 55 %**` in der Zeile `                                     | 6                     | **Memory Files** …`  | Kategorietabelle §1 | L3  |
| 27           | `(8+59+20+30+60+55+48+51+68+55)/10 = Top 45 %` (6. Term 55 = Memory Files)     | ungewichteter Schnitt | L3                   |
| 29           | `… + 60·0,12 + 55·0,05 + 48·0,10 …` (Term `55·0,05` = Memory Files)            | gewichteter Schnitt   | L3                   |
| 62           | `                                                                              | 7                     | **6 — Memory Files** | Top 55 %            | 5 % | **275** | ` (Hebel = Niveau × Gewicht) | §1b Hebel-Ranking | L3  |
| 33, 108, 201 | nennen Memory Files nur als Gewichts-/Diagramm-/Index-Verweis ohne Niveau-Zahl | —                     | kein Fix nötig       |

### 2b — Belegbasis für die Korrektur (verifiziert 2026-09-14)

- `../01_6_memory_files.md` Zeile 17 (Neuaudit 2026-09-14): „Typ-Abdeckung: `feedback` 4, `reference` 1, `project` 1, `user` 0" — direkt gegen den Memory-Ordner erhoben.
- `../01_6_memory_files.md` Zeile 23: `openai_image_video_pricing_reference.md` (reference, 2026-09-04) als neuer Eintrag — das ist der `reference`-Eintrag, den 00:42 als „0 Einträge" führt.
- `../01_6_memory_files.md` Zeile 35 (Position 5, Re-Rating): „1 Eintrag exemplarisch korrekt" — Bestätigung derselben Zahl.
- `../01_6_memory_files.md` Zeile 42: gewichteter Kategorien-Schnitt nach Re-Rating **Top 48 %** (ungewichtet Top 47 %) — Basis für die Niveau-Rückschreibung.
- `../01_6_10_faktenluecke.md` Zeile 15 (Subsub 2, Bottleneck) und Zeile 27 (Detailanmerkung): benennen genau diese 00:42-Drift + die Niveau-Spalte als Rest-Bottleneck — das ist der Planungsanlass.
- Die Figur „836 Sitzungsstarts" wird **nicht** re-verifiziert (stammt aus dem 2026-08-30-Audit, Re-Verifikation lief über `/context` = Jan-Territorium); sie bleibt unverändert im Nachher-Text.

### 2c — Grenzen der Edit-Art (kein CLAUDE.md, kein Memory-Ordner)

- Ziel ist ausschließlich Repo-Doku unter `t_claude_code/` — **keine** `CLAUDE.md`/`AGENTS.md`-Edits (verboten ohne Jans Freigabe) und **keine** Edits unter `C:\Users\hambu\.claude\projects\V--VibeCoding-Casino\memory\` (globale Regel „Write to memory only when I explicitly ask"). Beide Grenzen sind hier auch inhaltlich richtig: die Drift liegt in der Repo-Übersicht, nicht im Memory-System.
- Die Begriffs-Pairs `user`/`reference` im Nachher-Text sind bewusst mit Backticks wie im Vorher-Text gesetzt — keine Format-Drift in der Tabelle.
- L1 ersetzt die ganze Zeile als einen Edit (der Teilstring `— *(noch keine Planung)*` allein ist **nicht** eindeutig — er steht auch in den Zeilen 41, 43, 44 und 46).

### 2d — Worldmap-Registrierung: verifizierte Abweichung

`xx_sop/03_workflow_jan_planungsdateien.md` §2 verlangt die Registrierung jedes Plans in `worldmap/00_WORLDMAP_STATUS.md` (Abschnitt „Aktive Pläne"). Verifiziert am 2026-09-14: Dieser Abschnitt existiert in der Datei **nicht** — sie trägt Prio-1/Prio-2-Kategorietabellen, und kein einziger `t_claude_code/Planungsdateien/`-Plan ist dort eingetragen (Grep-Prüfung, auch die 5 Sibling-Pläne `06_u01`–`06_u05` sind nicht registriert, verweisen aber in L3 alle auf denselben Abschnitt). **Regel für diesen Plan:** Existiert der Abschnitt bei Ausführung weiterhin nicht, wird der Plan **nicht** registriert und die Abweichung nur im Endbericht notiert; ein neuer worldmap-Abschnitt wird nicht angelegt (Nicht-Scope, strukturelle Änderung an einer Jan-Status-Datei).

## 3 — Expliziter Nicht-Scope

- **`/context`-18-Descrepanz bleibt offen** — Eigentümer Jan (interaktiver Befehl, dem LLM nicht zugänglich, Beleg `09_messung_sichtbarkeit_plan.md:25`; Mess-Anleitung ≤ 5 Schritte in `:47`; Prio 1 in `01_7_context_management.md:74`). Dieser Plan klärt keine Hypothese, stellt keine `/context`-Nachfrage und berührt die 836-Sitzungsstarts-Figur nicht.
- Keine Neubewertung der übrigen Subsubs 1/3/4/5/6 in `01_6_10` — nur Subsub 2 wird in L3 neu geratet (Bewertungsbasis dokumentiert die Residuen, nicht den Fix der Nachbar-Subsubs).
- Keine Befund-Text-Änderungen an anderen §1a-Zeilen (Hooks, Skills, Permissions, MCP …) und keine Gewichts-Änderungen (Gewichtsspalte 5 % bleibt unverändert; nur der abgeleitete Hebelwert in 00:62 folgt rechnerisch).
- Keine inhaltliche Neubewertung anderer Kategorien in 00 — der mechanische Rang-Neuvertellungsschritt in L3 ordnet nur nach bereits fixierten Niveau-Werten, er erfindet keine neuen.
- Keine Memory-Ordner-Edits, keine `CLAUDE.md`/`AGENTS.md`-Edits, keine `worldmap/`-Strukturänderungen (siehe §2d).
- Keine Umbenennung/Verschiebung/Archivierung von Dateien, kein Commit/Push (globale Regel: niemals committen ohne Jans Aufforderung), keine Migration-Dateien → kein `migration-security-guard`.

## 4 — Lebenszyklus

`Geplant` → Jan-Freigabe dieses Plans (einziger Gate) → `Execution-Ready` (Kopf-Status dieser Datei) → L0/L1/L2/L3 `In Execution` → `Executed (archiviert)`: Kopf-Status-Zeile dieser Datei wird auf `Executed (archiviert <Datum>, siehe §5)` gesetzt und die Datei bleibt an ihrem Ort (Sibling-Präzedenz `06_u01`–`06_u05` und die 10 `01_15`-Pläne werden in-place archiviert, kein Move nach `docs/archive/`). Lehnt Jan die Plan-Freigabe ab, bleibt die Datei als Entscheidungsgrundlage stehen; `00:42` bleibt in der Vorher-Formulierung dokumentiert und der Drift bleibt als offener Bottleneck in `01_6_10` Subsub 2 sichtbar.

## 5 — Niveau-Rückschreibung (nach Ausführung)

Zwei Ebenen, beide rein rechnerisch aus bereits verifizierten Werten (keine neue Schätzung):

**a) `01_6_10_faktenluecke.md` Subsub 2 (Verweis-Integrität, 20 % Gewicht, vorher Top 30 %):** Nach L1–L3 sind beide Residuen weg („18 Dateien" weiterhin 0 Treffer als lebender Fakt **plus** 00:42 korrigiert **plus** Niveau-Spalte fortgeschrieben). Erwartet: Top 10–15 %; neuer gewichteter Datei-Schnitt ≈ **Top 17–18 %** (vorher Top 22 %). In derselben Datei: „Verwandte Artefakte"-Zeile zu `00:42` und Subsub-2-Zelle um eine datierte Executions-Note ergänzen (Muster wie in `01_6_memory_files.md` praktiziert — keine stille Überschreibung).

**b) Parent `../01_6_memory_files.md` Position 10 (Zeile 40):** Niveau-Zelle `Top 22 %` → neuer Schnitt aus a); Kernbefund-Rest „veralteter Fakt in `00_claude_code_uebersicht.md:42`" → „Rest: `/context`-18 offen dokumentiert (Jan-Aktion); 00:42-Verweis-Drift korrigiert am `<Ausführungsdatum>`"; Planungsdateien-Zelle `—` → Link auf diese Plan-Datei.

**c) Schnitt-Stabilität (Vorausrechnung, in L3 zu bestätigen):** `01_6:42` gewichtet (…+ 8·18)/100 = 47,8 → angezeigt **Top 48 %** (unverändert), ungewichtet 46,6 → **Top 47 %** (unverändert); daraus folgt 00:21 = **Top 48 %** (unverändert zur Vorausrechnung), 00:27 = 44,7 → **Top 45 %** (unverändert), 00:29 = 40,81 → **Top 41 %** (unverändert). Weicht eine Anzeige ab, ist die Rechnung — nicht der Zielwert — zu korrigieren und im Endbericht zu nennen.

## 6 — Endbericht (Format, max. 30 Zeilen)

Zielpfad (`00_claude_code_uebersicht.md` + 2 Rückverweis-Dateien) · Meilenstein-Liste (1 Zeile je L0–L3, je mit Verifikationsergebnis) · verifizierte Ist-Formulierung von 00:42 (Vorher + Nachher, wörtlich) · Jan-Gates (nur Plan-Freigabe; `/context`-18-Messung bleibt Jan-Aktion außerhalb) · 1 Fazitsatz (Drift behoben / offen geblieben).
