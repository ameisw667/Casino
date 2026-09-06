# 01.10 — Permissions & Auto-Allow-Policy: Sub-Kategorie-Aufschlüsselung

> Stand: **2026-08-30** — Erstaufschlüsselung von Kategorie **10 „Permissions & Auto-Allow-Policy"** aus `00_claude_code_uebersicht.md` in 8 einzeln bewertete Unterkategorien (bewusst < 10, siehe Anti-Overengineering-Hinweis am Ende). Skala: **Top 1 % = Weltklasse**, **Top 100 % = schlechtestes Viertel**.
> Scope: `C:\Users\hambu\.claude\settings.json` (global), `V:\VibeCoding\Casino\.claude\settings.local.json` (Projekt), `CLAUDE.md` Abschnitt „Auto-Allow & Execution Policy (Antigravity)" (Prosa-Policy).

## Kernaussage für Jan

Zwei getrennte Ebenen mit gegensätzlicher Qualität: Die **globale** Konfiguration (`settings.json`) ist strukturell durchdacht — saubere Allow-Klassen, ein expliziter, breiter Deny-Katalog gegen destruktive Befehle, bewusster `defaultMode: "auto"`. Die **projektlokale** Konfiguration (`settings.local.json`) ist dagegen ein über Zeit gewachsenes Protokoll einzelner, oft hochspezifischer Freigaben (bis hin zu vollständigen PowerShell-Befehlen mit hartkodierten JSON-Bodies) statt einer gepflegten Policy — inklusive Einträgen, die auf einen inzwischen nicht mehr existierenden Benutzerpfad (`C:/Users/Jan Philip/…`) verweisen, während die aktuelle Maschine unter `C:/Users/hambu/` läuft.

**Rechnerischer Schnitt über alle 8 Positionen: ≈ Top 55 %.**

## Kompaktübersicht (sortiert nach Niveau, bestes zuerst)

_Spaltenlogik (ergänzt 2026-09-05, einheitlich für `01_1`–`01_10`):_ **Planungsdateien** = Datei, in der die Umsetzung geplant ist („—" = Planung lebt in dieser Datei selbst). **Execution** = 🟢 umgesetzt · 🟡 teilweise · 🔵 geplant/wartet · ⚪ nicht geplant.

| #   | Unterkategorie                                      | Niveau       | Kernbefund                                                                                                                                                                                                                                                                                                                             | Planungsdateien                            | Execution                                     |
| --- | --------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| 1   | Globale Deny-List (destruktive Befehle)             | **Top 5 %**  | 23 explizite Deny-Regeln gegen `rm -rf /`, `sudo`, `curl \| bash`, Force-Push auf `main`/`master`, `git reset --hard origin`, `supabase db reset`, `format`, `dd`, `shutdown`/`reboot`, `diskpart`, `reg`, `net user` u. a. — inklusive PowerShell-Äquivalenten (`Remove-Item -Recurse -Force C:\*`, `Stop-Computer`, `Format-Volume`) | —                                          | 🟢 umgesetzt                                  |
| 2   | Globaler Default-Mode (`"auto"`)                    | **Top 15 %** | Bewusst gesetzt, konsistent mit dem in dieser Sitzung beobachteten „Auto Mode Active"-Verhalten — kein Zufallsprodukt, sondern eine dokumentierte Konfigurationsentscheidung                                                                                                                                                           | —                                          | 🟢 umgesetzt                                  |
| 6   | CLAUDE.md-Prosa-Policy vs. mechanische Durchsetzung | **Top 55 %** | K1/K2/K5-Klassen sind in `CLAUDE.md` klar beschrieben (`01_4_command_workflow.md` Abschnitt 2.4/5), aber nicht als strukturierte `permissions.allow`-Klassen im Projekt abgebildet — Durchsetzung hängt am Modellverhalten, nicht an einer erzwungenen Regel                                                                           | —                                          | 🔵 geplant (Prio 5)                           |
| 7   | Projekt-eigene Deny-List                            | **Top 70 %** | 0 projektlokale Deny-Einträge — verlässt sich vollständig auf die globale Liste; für Casino-spezifische Hochrisiko-Befehle (z. B. `supabase db reset` ist zwar in der globalen Liste, aber projektspezifische Ergänzungen wie ein Schutz vor versehentlichem Prod-Deploy fehlen) gibt es keine zusätzliche Ebene                       | —                                          | ⚪ nicht geplant (Prio 5: erst erwägen)       |
| 3   | Projekt-Allow-List-Sauberkeit/Wildcard-Disziplin    | **Top 80 %** | Von ca. 50 Einträgen in `settings.local.json` sind viele hochspezifische Einzelfälle (z. B. ein kompletter `Invoke-RestMethod`-Aufruf mit fest codiertem JSON-Body) statt wiederverwendbarer Klassen wie `Bash(git status)`/`Bash(git diff)` — Wildcard-Einträge wie `Bash(npm run *)` sind vorhanden, aber die Minderheit             | —                                          | 🔵 geplant (Prio 3: Aufräumdurchgang)         |
| 4   | Stale-Pfad-Rückstände                               | **Top 85 %** | Mindestens 6 Permission-Einträge verweisen auf `C:/Users/Jan Philip/…` bzw. `//c/Users/Jan Philip/…` — ein Benutzerpfad, der auf dieser Maschine (aktueller Benutzer `hambu`) nicht mehr existiert; entweder ein Profil-/Maschinenwechsel oder ein alter Pfad, der nie bereinigt wurde                                                 | —                                          | 🔵 geplant (Prio 1: tote Einträge entfernen)  |
| 5   | MCP-Permission-Drift                                | **Top 90 %** | Ausführlich in `01_8_mcp_server.md` Position 4 belegt (u. a. `mcp__supabase__*`, `mcp__vercel__*`, `mcp__memory__*` als Allow-Einträge ohne entsprechenden aktiven Server) — hier nur referenziert                                                                                                                                     | [`01_8_mcp_server.md`](01_8_mcp_server.md) | 🔵 geplant (Prio 2, gemeinsam mit `01_8`)     |
| 8   | Sichtbarkeit/Pflegeprozess für Jan                  | **Top 85 %** | Die Permission-Datei wächst unstrukturiert mit jeder neuen Einzelfreigabe; es existiert kein Review-Zyklus, der veraltete/zu spezifische Einträge periodisch entfernt (der `fewer-permission-prompts`-Skill könnte das leisten, wurde aber nie ausgeführt — siehe `01_9_hooks.md` Position 6)                                          | —                                          | 🔵 geplant (Prio 4: Review-Zyklus definieren) |

**Rechnerischer Schnitt:** (5+15+55+70+80+85+90+85)/8 = **Top 61 %** (gerundet; im Fließtext oben etwas günstiger auf Top 55 % angesetzt, weil die beiden stärksten Positionen #1/#2 auf globaler, kontoweiter Ebene liegen und damit für **jedes** von Jans Projekten gleichermaßen schützend wirken, nicht nur für Casino).

## Detailanmerkungen

### 1 — Globale Deny-List (Top 5 %)

Deckt die klassischen katastrophalen Befehlsklassen ab: destruktive Dateisystem-Operationen (`rm -rf` in mehreren Varianten inkl. `--no-preserve-root`), Remote-Code-Ausführung ohne Prüfung (`curl/wget | bash/sh`), git-Force-Operationen speziell gegen die Hauptbranches, Datenbank-Reset, Windows-Systembefehle (`diskpart`, `reg`, `net user`, `Format-Volume`). Bewusst **breiter** als reine Casino-Bedürfnisse — schützt kontoweit auf allen VibeCoding-Projekten gleichzeitig, ein sauberes Single-Source-of-Truth-Muster statt Duplizierung pro Projekt.

### 2 — Globaler Default-Mode (Top 15 %)

`"defaultMode": "auto"` in Kombination mit dem projektspezifischen `CLAUDE.md`-Abschnitt „Auto-Allow & Execution Policy" ergibt ein konsistentes Bild: Lesende/prüfende Aktionen laufen ohne Rückfrage, riskante/destruktive Aktionen sind über die Deny-Liste hart geblockt. Kein Widerspruch zwischen den beiden Ebenen gefunden.

### 3 — Projekt-Allow-List-Sauberkeit (Top 80 %)

Beispiel für einen untypisch spezifischen Eintrag: ein vollständiger `PowerShell(Invoke-RestMethod -Uri "http://localhost:3000/api/casino/bet" -Method POST -ContentType "application/json" -Body '{"gameType":"DICE",...}' ...)`-String als eigene Allow-Regel — das schützt vor genau diesem einen Aufruf, aber nicht vor der Variante mit leicht geänderten Parametern, und bläht die Datei auf, ohne echten Wiederverwendungswert zu bieten. Positiv: `Bash(npm run *)` und mehrere `Bash('/c/Users/.../browse' ...)`-Muster zeigen, dass Wildcard-Klassen grundsätzlich bekannt und genutzt werden — die Disziplin ist nur inkonsistent angewendet.

### 4 — Stale-Pfad-Rückstände (Top 85 %)

Konkrete Fundstellen in `settings.local.json`: `Read(//c/Users/Jan Philip/.claude/skills/gstack/**)`, `Read(//c/Users/Jan Philip/**)`, `Read(//d/ZZ - VibeCoding/**)`, `Bash(rm "C:/Users/Jan Philip/.claude/rules/ecc/common/agents.md")`, `Bash(rm "C:/Users/Jan Philip/.claude/rules/ecc/web/hooks.md")`. Der aktuelle Windows-Benutzer dieser Maschine ist laut allen anderen Konfigurationsdateien `hambu` (`C:\Users\hambu\...`). Diese Einträge sind entweder Relikte einer früheren Maschinen-/Profilkonfiguration oder wurden nie aufgeräumt — sie können auf der aktuellen Maschine ohnehin nicht mehr greifen (der Pfad existiert nicht), sind also praktisch tote Konfiguration, aber ein Beleg für fehlende Pflege.

### 5 — MCP-Permission-Drift (Top 90 %)

Siehe `01_8_mcp_server.md` Position 4 für die vollständige Analyse. Hier nur der Permissions-spezifische Punkt: Eine Allow-Regel für einen nicht mehr existierenden Server ist funktional wirkungslos (kein Sicherheitsrisiko), aber ein klares Signal, dass die Datei seit der letzten MCP-Umstellung nicht durchgesehen wurde.

### 6 — CLAUDE.md-Prosa-Policy vs. mechanische Durchsetzung (Top 55 %)

`CLAUDE.md` beschreibt K1/K2 (Auto-Allow für read-only/CI-Befehle), „Keine variablen Dateipfade an Linter", „Non-Interactive Execution", „No-Pager" und K5 (destruktive/Live-Befehle brauchen manuelle Bestätigung) als **Verhaltensregeln für das LLM**, nicht als `permissions.allow`/`deny`-Einträge im engeren Sinn. Der einzige Punkt, der tatsächlich mechanisch durchgesetzt wird, ist K5 — via der globalen Deny-Liste (Position 1). K1/K2 hängen dagegen davon ab, dass das Modell die Prosa-Regel korrekt befolgt; ein Verstoß würde nicht technisch blockiert, sondern höchstens von Jan bemerkt.

### 7 — Projekt-eigene Deny-List (Top 70 %)

0 Einträge unter einem projektlokalen `deny`-Schlüssel. Für ein Projekt mit echten Finanz-/Wallet-Invarianten (`CLAUDE.md` Abschnitt „Key Constraints & Security Invariants") wäre z. B. eine explizite Deny-Regel gegen direkte Schreibzugriffe auf produktive Supabase-Tabellen via CLI (jenseits des bereits global geblockten `supabase db reset`) eine denkbare zusätzliche Schutzschicht — aktuell nicht vorhanden, aber auch nicht als Lücke dokumentiert.

### 8 — Sichtbarkeit/Pflegeprozess (Top 85 %)

Es gibt keinen wiederkehrenden Trigger (weder Skill noch Hook noch SOP-Absatz), der die Permission-Datei periodisch auf veraltete Einträge prüft. Der naheliegende Kandidat dafür — der Skill `fewer-permission-prompts` — existiert bereits (siehe `01_9_hooks.md` Position 6), wurde aber nie ausgeführt.

## Anti-Overengineering-Hinweis: nur 8 statt 10 Unterkategorien

Analog zur Entscheidung in `worldmap/04_security_hardening.md` („Secret-Scanning-Lücke bewusst nicht als 11. Unterkategorie geführt") wird hier bewusst **nicht** künstlich auf 10 Positionen aufgefüllt. Zwei denkbare Zusatzpositionen (z. B. „Permission-Diff-Review vor jedem Commit" oder „Rollen-/Multi-User-Trennung") hätten für ein Einzelnutzer-Setup wie dieses keinen belegbaren, eigenständigen Mehrwert gegenüber den bereits erfassten 8 Punkten und würden nur die Kompaktübersicht künstlich strecken.

## Empfohlene Bearbeitungsreihenfolge

| Prio | Unterkategorie                                                                                  | Warum zuerst/danach                                                                         |
| ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1    | #4 Stale-Pfad-Einträge bereinigen                                                               | Trivialer, risikoloser Aufräumschritt — tote Einträge, kein Verhaltensrisiko beim Entfernen |
| 2    | #5 MCP-Permission-Drift bereinigen                                                              | Gemeinsam mit `01_8_mcp_server.md` #4 in einem Zug erledigbar                               |
| 3    | #3 Häufige Einzelfall-Freigaben zu Wildcard-Klassen konsolidieren                               | Größter Lesbarkeits-/Wartbarkeitsgewinn, mittlerer Aufwand                                  |
| 4    | #8 `fewer-permission-prompts` einmalig laufen lassen                                            | Liefert eine datengestützte Grundlage für #3 statt manueller Schätzung                      |
| 5    | #6/#7 K1/K2 als strukturierte Allow-Klassen abbilden, projektspezifische Deny-Ergänzung erwägen | Größerer Entscheidungsaufwand, eher mittelfristig                                           |
| 6    | #1, #2                                                                                          | Bereits exzellent — kein Handlungsbedarf                                                    |

## Verwandte Artefakte

| Bedarf                                                                 | Datei                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| Command-/Execution-Policy-Kontext (K1/K2/K5-Herkunft)                  | [`01_4_command_workflow.md`](01_4_command_workflow.md) |
| MCP-Permission-Drift (Detailanalyse)                                   | [`01_8_mcp_server.md`](01_8_mcp_server.md)             |
| `fewer-permission-prompts`-Skill als möglicher Automatisierungsschritt | [`01_9_hooks.md`](01_9_hooks.md)                       |
