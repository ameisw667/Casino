import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, extname } from 'node:path';

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

let liveDeadCount = 0;
let archiveDeadCount = 0;
let mojibakeCount = 0;

function checkFile(file) {
  const content = readFileSync(file, 'utf8');

  for (const match of content.matchAll(LINK_RE)) {
    const relTarget = match[1];
    const targetPath = resolve(dirname(file), relTarget.replace(/:\d+$/, '')); // Zeilennummer-Suffix abschneiden
    const normalizedTarget = relative(process.cwd(), targetPath).replace(/\\/g, '/');
    if (KNOWN_EXCEPTIONS.has(normalizedTarget)) continue;
    if (!existsSync(targetPath)) {
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
  `\n${liveDeadCount} tote Links in lebendigen Dateien, ${archiveDeadCount} in docs/archive/, ${mojibakeCount} mögliche Encoding-Defekte.`,
);
if (liveDeadCount > 0) process.exit(1); // Archiv-Treffer, Mojibake- und Index-Drift-Warnungen blockieren bewusst nicht
