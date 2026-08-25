# Tool Execution & Auto-Allow Rules

## 1. Strikte Tool-Disziplin für maximale Geschwindigkeit & Null Unterbrechungen
- **Niemals Shell-Befehle für Datei-Operationen nutzen**: Ausführung von `node -e`, `node scratch/...`, `python -c`, `echo >`, `cat <<EOF`, `Set-Content`, `Out-File`, `rm`, `Remove-Item` über `run_command` ist strikt untersagt.
- **Native Tools Pflicht**: Ausschließlich `write_to_file`, `replace_file_content` verwenden. Native Tools laufen nativ und ohne Sicherheitsabfragen.
- **Native Research-Tools Pflicht**: Niemals Shell-Befehle (`dir`, `ls`, `cat`, `type`, `Get-Content`, `grep`) via `run_command` ausführen. Ausschließlich `grep_search`, `find_by_name`, `list_dir` und `view_file` nutzen.
- **File Deletion & Moving**: Für das Löschen/Verschieben von Projektdateien `git rm <path>` bzw. `git mv <path>` nutzen (VCS-gesichert & durch `git rm *` in der Allowlist abgedeckt).

## 2. Autonome Durchlauf-Garantie (Zero-Friction / Kein manueller Stop)
- **Keine variablen Dateilisten an Linter übergeben**: Niemals `npx eslint file1.tsx file2.tsx ...` ausführen, da dies jedes Mal neue, unbekannte Befehlsmuster erzeugt. Ausschließlich den standardisierten Befehl **`npm run lint`** nutzen (der global freigegeben ist).
- **Keine dynamischen `npx`- oder Ad-hoc-`node`-Aufrufe**: Wenn `npx` oder `node` nötig ist, ausschließlich standardisierte Root-Befehle nutzen (`node -v`, `npx tsc --noEmit`, `npx vitest run`) und keine Ad-hoc-Inline-Skripte (`node -e ...`).
- **Keine blockierenden Plan-Gates bei Routineaufgaben**: Aufgaben werden direkt im selben Durchlauf von Recherche über Umsetzung bis zur Verifikation (`npm run test`) ohne manuelle Zwischenfragen ausgeführt.
- **Befehle atomar & standardisiert**: Keine dynamisch verketteten Commands (`cmd1 && cmd2`). Befehle einzeln und standardisiert ausführen (`npm run test`, `npm run lint`, `npm run build`, `npm run vibe-check`), damit die hinterlegte Antigravity-Allowlist zu 100% greift.
- **Non-Interactive Execution**: Bei allen CLI-Befehlen immer non-interactive Flags setzen (`--yes`, `-y`, `CI=true`).
- **No-Pager**: Pager für Git-Befehle immer deaktivieren (`PAGER=cat` oder `--no-pager`).
