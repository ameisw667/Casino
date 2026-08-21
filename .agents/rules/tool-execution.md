# Tool Execution & Auto-Allow Rules

## 1. Strikte Tool-Disziplin für Datei-Operationen & Code-Suche
- **Niemals Shell-Befehle oder Scratch-Skripte für Datei-Operationen nutzen**: Ausführung von `node -e`, `node scratch/...`, `python -c`, `echo >`, `cat <<EOF`, `Set-Content`, `Out-File` über `run_command` ist strikt untersagt.
- **Native Tools Pflicht**: Ausschließlich `write_to_file`, `replace_file_content` oder `multi_replace_file_content` verwenden. Native Tools laufen ohne Bestätigungsmodal.
- **Native Research-Tools Pflicht**: Niemals Scratch-Dateien (`scratch/search_*.js`, Python-Crawler) via `run_command` ausführen. Ausschließlich `grep_search`, `find_by_name`, `list_dir` und `view_file` nutzen.
- **File Deletion & Moving**: Für das Löschen/Verschieben von Projektdateien bevorzugt `git rm <path>` bzw. `git mv <path>` nutzen (VCS-gesichert & mit `git rm *` im Auto-Allow matchbar), statt OS-spezifischer `Remove-Item -Force`-Befehle.

## 2. Command Execution Guidelines
- **Befehle atomar ausführen (Kein Dynamic-String Chaining)**: Nicht mehrere Befehle mit dynamischen Parametern verketten (`git add ...; git commit -m "..."; git push ...`). Stattdessen Schritte einzeln ausführen, damit Auto-Allow-Pattern (`git add *`, `git commit *`, `git push *`) greifen.
- **Non-Interactive Execution**: Bei allen CLI-Befehlen immer non-interactive Flags setzen (`--yes`, `-y`, `CI=true`).
- **No-Pager**: Pager für Git-Befehle deaktivieren (`PAGER=cat` oder `--no-pager`).
- **Idempotente Standard-Befehle**: Befehle immer in ihrer standardisierten Form ausführen (`npm test`, `npm run test`, `npx vitest *`, `npm run lint`, `npx tsc`, `npm run build`, `npm run vibe-check`), damit Auto-Allow-Patterns (Option 4) greifen.
