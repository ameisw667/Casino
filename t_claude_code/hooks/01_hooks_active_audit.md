# 01 — Load-Audit: Hooks (4 aktiv von 28 installiert) (Vorschlag, nicht ausgeführt)

> **Status:** 🟡 Vorschlag erstellt, wartet auf Jans Prüfung · **Stand:** 2026-09-05 · **Owner:** Audit = LLM, Freigabe = Jan · **Auslöser:** Fortführung des globalen ECC-Audits ([`01_11`](../01_11_globale_ecc_regeln_audit.md)); Hooks-Aktivierung am 2026-08-30 (Protokoll `01_15`, gelöscht) — Auswahl der 4 Hooks aus dem damaligen Vorschlag.
> **Kernfakt:** Hooks kosten **keine Prompt-Token** (kein Text-Load) — ihre Last ist **Laufzeit** (Ausführung bei jedem Tool-Aufruf/Antwortende) plus Instandhaltung.

---

## 1 — Verifizierter Ist-Zustand (2026-09-05, live ausgelesen)

**Quelle 1 — `V:\.claude\hooks\hooks.json` (49,8 KB):** enthält **28 Hook-Definitionen** über 7 Lebenszyklus-Punkte. Das ist die in `01_11` als „28 installiert" gezählte Menge — Zahl damit verifiziert (die älteren Angaben „13 Definitionen"/„27" waren Zwischenstände).

**Quelle 2 — `V:\.claude\settings.json` (wirkt wirklich):** genau **4 aktive Hooks**, identisch mit der Top-Empfehlung des Gesamtaudits vom 2026-08-30:

| Aktiver Hook                     | Matcher              | Zweck                                               | Laufzeit-Kostenpunkt                             |
| :------------------------------- | :------------------- | :-------------------------------------------------- | :----------------------------------------------- |
| `pre:config-protection`          | Write/Edit/MultiEdit | Blockt Abschwächungen von Linter-/Formatter-Configs | je Edit-Aufruf (Node-Bootstrap, timeout 5 s)     |
| `post:edit:design-quality-check` | Edit/Write/MultiEdit | Warnt bei 08/15-Template-UI (Anti-Template-Regel)   | je Edit-Aufruf                                   |
| `stop:format-typecheck`          | Stop                 | Formatierung + Typecheck am Antwortende             | **bei jeder Antwortende** — größter Latenzfaktor |
| `stop:check-console-log`         | Stop                 | Prüft auf vergessene `console.log`-Reste            | bei jeder Antwortende                            |

**Restbestand:** 24 der 28 Definitionen liegen in `hooks.json` unverbunden — wie eine Alarmanlage ohne Strom. Kosten: 0 Token, 0 Ausführung. Weiterhin da: `hooks/memory-persistence/` (eigener Ordner) und `README.md`.

---

## 2 — Findings

### F1 — `stop:format-typecheck` + `stop:check-console-log`: Latenz bei jeder Antwortende

Beide laufen bei **jedem** Stop-Ereignis, auch in reinen Lese-/Recherchesessions ohne Code-Änderung. `format-typecheck` triggert Formatierung + Typecheck (der langsamste der vier).
**Vorschlag:** Beide behalten (bewusst gewählt, automatisieren Jans eigene `npm run lint`/`typecheck`-Pflicht) — aber nur bei empfundenem Nerven: Entweder deaktivieren oder auf „nur wenn in der Session Edits stattfanden" einschränken (falls der Hook-Skript das unterstützt). Kein Sofortbedarf.

### F2 — `hooks.json`-Restbestand: 24 unverbundene Definitionen

Die 24 nicht-aktiven Hooks kosten nichts, sind aber 49,8 KB Totlast in einer Datei, die versehentliche Fehlverdrahtung ermöglicht (ein Copy-Paste-Block reicht, um einen unerwünschten Hook zu aktivieren — z. B. den am 2026-08-30 ausdrücklich **nicht** empfohlenen `pre:bash:dispatcher`).
**Vorschlag:** `hooks.json` auf den aktiven 4er-Satz kürzen und den Rest in ein `hooks.json.inactive`-Archiv (oder direkt löschen — die Quelldateien bleiben im ECC-Repo). Risiko der Versehentlich-Aktivierung → 0.

### F3 — `post:edit:design-quality-check`-Doppelabdeckung prüfen

Der Hook setzt dieselbe Anti-Template-Regel durch, die auch als Text in `ecc/web/design-quality.md` (414 Zeilen) lädt. Das ist gewollt (Text = Wissen, Hook = Durchsetzung) — kein Konflikt, nur dokumentiert.

---

## 3 — Handlungsoptionen (wartet auf Jan)

|  #  | Maßnahme                                                                 | Effekt                                           |                                                                                                                                          Risiko                                                                                                                                          |
| :-: | :----------------------------------------------------------------------- | :----------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  1  | `hooks.json` auf aktive 4 kürzen, 24 Reste archivieren (F2)              | Fehlverdrahtungs-Risiko 0, Datei 49,8 KB → ~7 KB |                                                                                                                                       Sehr niedrig                                                                                                                                       |
|  2  | Stop-Hooks bei Latenz spüren: deaktivieren oder bedingtes Ausführen (F1) | Antwortende schneller                            |                                                                                                                  Ändert reales Verhalten — nur bei empfundenem Problem                                                                                                                   |
|  3  | Kein weiterer Hook aus dem Restbestand aktivieren                        | —                                                | Nicht-aktivieren-Empfehlung von 2026-08-30: `pre:bash:dispatcher`/`gateguard-fact-force` (zu eingreifend, kollidiert mit K1–K5-Auto-Allow), `stop:desktop-notify` (macOS/WSL-zielig, unter Windows wirkungslos), `governance-capture` (nur mit Env-Var `ECC_GOVERNANCE_CAPTURE=1` aktiv) |

---

## 4 — Selbstprüfung

- [x] 28 Hook-Definitionen in `hooks.json` live gezählt (2026-09-05) — Diskrepanz „13 vs. 27 vs. 28" in den Vorgänger-Dokus damit aufgelöst.
- [x] 4 aktive Hooks aus `settings.json` live verifiziert, identisch mit Jans Auswahl von 2026-08-30.
- [x] Kein Hook wurde geändert, aktiviert oder deaktiviert — reiner Vorschlag.
