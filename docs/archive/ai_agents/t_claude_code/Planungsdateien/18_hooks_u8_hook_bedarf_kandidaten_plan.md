# 18 — Hooks U8: Migrations-Hook-Entwurf + Bedarfskatalog (Unterkategorie #8)

> **Status:** Teilausgeführt (L1/L2 executed, L3 = Jan-Gate) · **Stand:** 2026-09-14 (Ausführungs-Stand) · **Owner:** LLM (Jan nur bei Gate) · **Scope:** Die Entwurfs-Ebene der Unterkategorie #8 schließen — Migrations-Hook ausformulieren, projekt-spezifischen Bedarfskatalog ergänzen; keine Hook-Aktivierung ohne Jans Audit-Freigabe.
> **Money-Pfad:** Nein · **Security-Review:** Nein
> **Bewertungs-Basis:** [`../01_9_08_hook_bedarf_kandidaten.md`](../01_9_08_hook_bedarf_kandidaten.md) (Schnitt Top 75 %, 4 🔴-Bottlenecks #1–#3/#5) · Parent: [`../01_9_hooks.md`](../01_9_hooks.md) Position 8

## 1 — Übersicht für Jan & Ausführungs-LLM

| Nummer | Meilenstein                                                                                                                                                                                                | Scope (Dateien)                                            | Ausführung                                                                                                                                                                           | Status                                                    | Zuständigkeit | Verifikation                                                     |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| L0     | Basis verifizieren: `migration-security-guard`-Pflicht (CLAUDE.md § Supabase), Pfad-Regel `supabase/migrations/**`, bestehender PreToolUse-Matcher (config-protection als Muster, `settings.json:105–118`) | Read-only `CLAUDE.md`, `V:\.claude\settings.json`          | Sequenziell                                                                                                                                                                          | 🔴 Geplant                                                | LLM           | Muster-Belege mit Datei:Zeile                                    |
| L1     | Bottleneck #1+#3: Migrations-Hook-Entwurf ausformulieren — `PreToolUse`, Matcher `Write                                                                                                                    | Edit                                                       | MultiEdit`, Pfad-Filter `supabase/migrations/**`, Verhalten: kontextueller Reminder an die `migration-security-guard`-Pflicht (nicht Block), Fail-Verhalten, Instandhaltungs-Hinweis | Vorschlags-Sektion in `../hooks/01_hooks_active_audit.md` | Sequenziell   | 🔴 Geplant                                                       | LLM | Entwurf enthält Matcher/Skript-Verhalten/Fail-Verhalten (Schließt #1, teilweise #2/#3) |
| L2     | Bottleneck #2: Projekt-spezifischen Bedarfskatalog ergänzen (Tabelle: Kandidat, Ziel-Hook-Punkt, Nutzen, Risiko, Aktivierungs-Empfehlung) — Migrations-Hook als Zeile 1                                    | `../hooks/01_hooks_active_audit.md`                        | Sequenziell                                                                                                                                                                          | 🔴 Geplant                                                | LLM           | Katalog beleggestützt, ≤ 10 Kandidaten, keine erfundenen Bedarfe |
| L3     | Bottleneck #5: Jan-Entscheidungs-Kollektiv präsentieren (Entwurf + Katalog + bestehende Audit-Optionen) — Aktivierung bleibt Jans Audit-Freigabe (🟡)                                                      | Chat-Übergabe, keine Datei-Änderung                        | Sequenziell                                                                                                                                                                          | 🔴 Geplant (Jan-Gate)                                     | LLM           | Alle offenen Kandidaten mit Empfehlung bei Jan                   |
| L4     | Niveau-Rückschreibung: `01_9_08` + Parent-Position 8 (nach Jans Entscheidung)                                                                                                                              | `t_claude_code/01_9_08*.md`, `t_claude_code/01_9_hooks.md` | Sequenziell                                                                                                                                                                          | 🔴 Geplant                                                | LLM           | Neue Schnitt-Berechnung = Parent-Wert, nachgerechnet             |

**Fan-out-Check (Kriterium 5):** L1/L2 schreiben in dieselbe Datei-Kette und hängen an L0 — **kein Fan-out.** Gegenprobe Kriterium 6: < 45 Min. gesamt, < 10 Min. je Schritt.

## 2 — Self-Contained Kontext-Koffer

- **Kernbefund:** Bewertungsebene gut bedient (28er-Inventar, Nicht-Aktivieren-Empfehlungen, Prio 1–5), Entwurfs-Ebene komplett leer — kein Kandidat hat Matcher/Skript/Verhalten.
- **Migrations-Hook-Vorschlag (Kern):** Ein `PreToolUse`-Hook, der bei `Write`/`Edit` auf `supabase/migrations/**` kontextuell an die bestehende `migration-security-guard`-Pflicht erinnert (CLAUDE.md § Supabase: „vor Abschluss als read-only Review"). Er nutzt die bereits etablierte Regel, macht sie zuverlässiger (Hook feuert garantiert, CLAUDE.md-Regel hängt von der Befolgung ab). Empfehlungs-Tendenz: kontextueller Reminder, kein Block (konfig-protection-Muster als Vorbild für Block; Reminder reicht hier, da der Guard-Review-Workflow existiert).
- **Muster-Beleg:** `pre:config-protection` zeigt das aktive Muster (Matcher, Node-Bootstrap, Timeout 5 s) — `V:\.claude\settings.json:105–118`.
- **Kopplung:** U1-Position 7 verweist auf diesen Entwurf (Plan 11 L2) — keine Doppelpflege.

## 3 — Expliziter Nicht-Scope

- Keine Hook-Aktivierung/kein Edit an `V:\.claude\settings.json` — Entwurf bleibt Vorschlag bis zur Audit-Freigabe.
- Keine Migrationen/keine Änderung unter `supabase/migrations/**` — nur der Reminder-Hook-Entwurf.
- Kein SessionStart-Entwurf (Plan 12) und keine Stop-Hook-Änderung (Plan 13).

## 4 — Lebenszyklus

`Geplant` → `Execution-Ready` (Status dieser Datei) → `In Execution` (L0–L2 ohne Gate; L3 wartet auf Jans Audit-Entscheidung) → nach L4 `Executed (archiviert)`. Jan-Gates: L3 (Aktivierungs-Entscheidung), eventuelle spätere `settings.json`-Änderung ist ein eigener Auftrag.

## 5 — Execution-Log

**2026-09-14 — Teilausgeführt (L1/L2, L3 = Jan-Gate):**

- L1: Migrations-Hook-Kandidat vollständig ausformuliert (Audit §5.1) — `pre:edit:migration-reminder` (PreToolUse, Matcher `Write\|Edit\|MultiEdit`, Pfad-Filter `supabase/migrations/**`, Reminder kein Block, fail-open, Timeout 5 s, Abgrenzung zum `.husky`-Guard).
- L2: Projekt-spezifischer Bedarfskatalog belegt ergänzt (Audit §5.2) — 6 Kandidaten (1 Migrations-Reminder, 2 `post:edit:accumulate` [F4], 3–5 bestätigte Nicht-Aktivierungen, 6 Rest → Option 1); keine erfundenen Bedarfe.
- L3 (offen, Jan-Gate): Hook-Aktivierung bzw. Archivierungs-Entscheidung — gekoppelt an die Audit-Optionen 1–5 (Audit §3, wartet auf Jans Prüfung).
- **2026-09-17 — L3-Präsentation erbracht:** Das geforderte Entscheidungs-Kollektiv (Entwurf Kandidat 1 + Bedarfskatalog + Stand der Audit-Optionen 1–5) liegt gesammelt vor in [`../00_offene_jan_entscheidungen.md`](../00_offene_jan_entscheidungen.md) — Punkt **E3** (Aktivierung `pre:edit:migration-reminder`). Die Aktivierung selbst bleibt Jan-Gate; keine Änderung an `settings.json` vor Rückmeldung.
- **Nachtrag 2026-09-14 (nach Jan-Entscheidung):** Kandidat 2 (`post:edit:accumulate`) **aktiviert** (Jan-Freigabe, Audit-Option 5) — 5. aktiver Hook in `V:\.claude\settings.json`. Kandidat 1 (`pre:edit:migration-reminder`) bleibt offen (Aktivierung = Jan-Gate). Kandidat 6 (Restbestand → Option 1) nach ECC-Prüfung **geschlossen**: `hooks.json` ist Merge-Ziel des ECC-Installers → lokales Kürzen wird beim nächsten Update zurückgemergt, daher nicht lokal umsetzbar (Upstream-Thema).
- L4: Niveau-Rückschreibung erledigt — [`01_9_08`](../01_9_08_hook_bedarf_kandidaten.md) Top 75 % → Top 40 %, Parent Position 8 entsprechend nachgezogen.
