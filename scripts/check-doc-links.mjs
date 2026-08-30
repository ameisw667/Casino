import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOTS = ['worldmap', 'docs', 'xx_sop', 'xx_docs', 'T_BUGS', 'T_FRONTEND', 'Z_LLM'];
const EXTRA_FILES = ['CLAUDE.md', 'AGENTS.md'];
const LINK_RE = /\]\((\.{1,2}\/[^)#\s]+)(#[^)]*)?\)/g;
const MOJIBAKE_RE = /[一-鿿぀-ヿ゠-ヿ]/;
// Bekannte, bewusst offene Ausnahmen — geprüft gegen das AUFLÖSTE ZIEL, nicht die Quelldatei
// (siehe 04_datenbank_migrationen.md / 05_datenbank_haertung.md Teil A/L3 — Jans Klärung offen):
const KNOWN_EXCEPTIONS = new Set(['worldmap/05_Gildensystem.md']);
const ARCHIVE_PATTERN = /(^|[\\/])docs[\\/]archive[\\/]/;

function listMarkdownFiles(root) {
  const out = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.research' || entry.name === '.git') continue;
        walk(full);
      } else if (extname(entry.name) === '.md') {
        out.push(full);
      }
    }
  })(root);
  return out;
}

// Walks a repo-relative path segment by segment from the repo root, matching each level
// case-insensitively. Handles both filename- and directory-level casing mismatches (both
// patterns occur in this repo, e.g. `t_frontend/` written where the real directory is
// `T_FRONTEND/`) — a single basename-only check would miss the directory-level case.
// Only called on the already-rare !existsSync() path, so the extra directory reads never
// touch the common case.
export function resolveCaseInsensitive(repoRelativePath) {
  const segments = repoRelativePath.split('/').filter(Boolean);
  let currentDir = process.cwd();
  for (const segment of segments) {
    if (!existsSync(currentDir)) return false;
    const entries = readdirSync(currentDir, { withFileTypes: true });
    const exact = entries.find((e) => e.name === segment);
    if (exact) {
      currentDir = join(currentDir, segment);
      continue;
    }
    const ciMatch = entries.find((e) => e.name.toLowerCase() === segment.toLowerCase());
    if (!ciMatch) return false;
    currentDir = join(currentDir, ciMatch.name);
  }
  return true;
}

let liveDeadCount = 0;
let archiveDeadCount = 0;
let mojibakeCount = 0;
let caseWarnCount = 0;

function checkFile(file) {
  const content = readFileSync(file, 'utf8');

  for (const match of content.matchAll(LINK_RE)) {
    const relTarget = match[1];
    const targetPath = resolve(dirname(file), relTarget.replace(/:\d+$/, '')); // Zeilennummer-Suffix abschneiden
    const normalizedTarget = relative(process.cwd(), targetPath).replace(/\\/g, '/');
    if (KNOWN_EXCEPTIONS.has(normalizedTarget)) continue;
    if (!existsSync(targetPath)) {
      if (resolveCaseInsensitive(normalizedTarget)) {
        console.error(
          `[case-warn] ${file} -> ${relTarget} (existiert, andere Groß-/Kleinschreibung)`,
        );
        caseWarnCount++;
        continue;
      }
      const isArchive = ARCHIVE_PATTERN.test(file);
      console.error(`${isArchive ? '[archiv]' : '[LIVE]  '} ${file} -> ${relTarget}`);
      isArchive ? archiveDeadCount++ : liveDeadCount++;
    }
  }

  if (MOJIBAKE_RE.test(content)) {
    console.error(`[mojibake] ${file} enthält unerwartete CJK-Zeichen — manuell prüfen`);
    mojibakeCount++;
  }
}

function main() {
  for (const root of ROOTS) {
    if (!existsSync(root)) continue;
    for (const file of listMarkdownFiles(root)) checkFile(file);
  }
  for (const file of EXTRA_FILES) {
    if (existsSync(file)) checkFile(file);
  }

  // docs/README.md behauptet an einer Stelle die reale Dateizahl unter docs/ — Drift dort ist genau
  // der Fehler, der diesen Meilenstein ausgelöst hat (Index behauptete zeitweise 41 statt real 163+).
  if (existsSync('docs/README.md')) {
    const readmeContent = readFileSync('docs/README.md', 'utf8');
    const claimMatch = readmeContent.match(/enthält inzwischen (\d+)/);
    if (claimMatch) {
      const claimedCount = Number(claimMatch[1]);
      const realCount = existsSync('docs') ? listMarkdownFiles('docs').length : 0;
      if (claimedCount !== realCount) {
        console.error(
          `[index-drift] docs/README.md behauptet ${claimedCount} Dateien, real sind es ${realCount} — Zeile mit "enthält inzwischen ${claimedCount}" aktualisieren.`,
        );
      }
    }
  }

  console.log(
    `\n${liveDeadCount} tote Links in lebendigen Dateien, ${archiveDeadCount} in docs/archive/, ${caseWarnCount} Groß-/Kleinschreibungs-Warnungen (nicht blockierend), ${mojibakeCount} mögliche Encoding-Defekte.`,
  );
  if (liveDeadCount > 0) process.exitCode = 1; // Archiv-Treffer, Mojibake- und Index-Drift-Warnungen blockieren bewusst nicht
}

// Nur beim direkten Aufruf (`node scripts/check-doc-links.mjs`) ausführen, nicht beim Import durch
// den Vitest-Testfall — sonst würde jeder Test-Run den echten Repo-Scan samt process.exitCode mitlaufen.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
