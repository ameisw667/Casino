import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, extname } from 'node:path';

const FOLDER_MAP = {
  T_FRONTEND: 'workspace/domains/frontend/T_FRONTEND',
  T_IMAGE: 'workspace/domains/frontend/T_IMAGE',
  T_IMAGE_CREATION: 'workspace/domains/frontend/T_IMAGE_CREATION',
  T_DATABASE: 'workspace/domains/database/T_DATABASE',
  T_API: 'workspace/domains/database/T_API',
  T_BACKGROUND_JOBS_SCHEDULING: 'workspace/domains/database/T_BACKGROUND_JOBS_SCHEDULING',
  T_SECURITY_HARDENING: 'workspace/domains/security/T_SECURITY_HARDENING',
  T_AUTH_AUTHORIZATION: 'workspace/domains/security/T_AUTH_AUTHORIZATION',
  T_RATE_LIMITING_ABUSE_PREVENTION: 'workspace/domains/security/T_RATE_LIMITING_ABUSE_PREVENTION',
  T_ANALYTICS_BUSINESS_INTELLIGENCE:
    'workspace/domains/intelligence/T_ANALYTICS_BUSINESS_INTELLIGENCE',
  T_OBSERVABILITY_ERROR_ALERT_LOGGING:
    'workspace/domains/intelligence/T_OBSERVABILITY_ERROR_ALERT_LOGGING',
  T_BUGS: 'workspace/domains/intelligence/T_BUGS',
  T_LLM: 'workspace/domains/ai_agents/T_LLM',
  T_MCP: 'workspace/domains/ai_agents/T_MCP',
  T_CLI: 'workspace/domains/ai_agents/T_CLI',
  T_REPO_HYGIENE: 'workspace/domains/ai_agents/T_REPO_HYGIENE',
  T_CODE_QUALITAET_LLM_KONSOLIDIERUNG:
    'workspace/domains/ai_agents/T_CODE_QUALITAET_LLM_KONSOLIDIERUNG',
  Z_LLM: 'workspace/domains/ai_agents/Z_LLM',
  t_claude_code: 'workspace/domains/ai_agents/t_claude_code',
  x_Dokumentation: 'docs/archive/x_Dokumentation',
  'PATHFINDER-2026-05-10': 'docs/archive/PATHFINDER-2026-05-10',
  docker: 'infra/docker',
  'remotion-ad': 'workspace/media/remotion-ad',
  output: 'workspace/output',
};

const ROOTS = ['worldmap', 'docs', 'xx_sop', 'xx_docs', 'workspace/domains'];
const EXTRA_FILES = ['CLAUDE.md', 'AGENTS.md', 'README.md', '00_LERNREISE.md'];
const LINK_RE = /\]\((\.{1,2}\/[^)#\s]+)(#[^)]*)?\)/g;

function listMarkdownFiles(root) {
  const out = [];
  (function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'archive')
          continue;
        walk(full);
      } else if (extname(entry.name) === '.md') {
        out.push(full);
      }
    }
  })(root);
  return out;
}

// Map any path that might refer to old or new locations
function mapOldPathToNew(repoRelPath) {
  const normalized = repoRelPath.replace(/\\/g, '/');
  for (const [oldFolder, newFolder] of Object.entries(FOLDER_MAP)) {
    if (normalized === oldFolder || normalized.startsWith(oldFolder + '/')) {
      return normalized.replace(oldFolder, newFolder);
    }
  }
  return normalized;
}

function mapNewPathToOld(repoRelPath) {
  const normalized = repoRelPath.replace(/\\/g, '/');
  for (const [oldFolder, newFolder] of Object.entries(FOLDER_MAP)) {
    if (normalized === newFolder || normalized.startsWith(newFolder + '/')) {
      return normalized.replace(newFolder, oldFolder);
    }
  }
  return normalized;
}

const allFiles = [];
for (const r of ROOTS) allFiles.push(...listMarkdownFiles(r));
for (const f of EXTRA_FILES) if (existsSync(f)) allFiles.push(f);

let updatedFilesCount = 0;
let totalLinksRewritten = 0;

function safeWrite(filePath, content) {
  let attempts = 0;
  while (attempts < 5) {
    try {
      writeFileSync(filePath, content, 'utf8');
      return;
    } catch (err) {
      attempts++;
      if (attempts >= 5) throw err;
      const start = Date.now();
      while (Date.now() - start < 50) {}
    }
  }
}

for (const file of allFiles) {
  const content = readFileSync(file, 'utf8');
  const fileRepoRel = relative(process.cwd(), file).replace(/\\/g, '/');
  const oldFileRepoRel = mapNewPathToOld(fileRepoRel);
  const oldFileDir = dirname(resolve(process.cwd(), oldFileRepoRel));
  const newFileDir = dirname(resolve(process.cwd(), fileRepoRel));

  let fileChanged = false;
  const newContent = content.replace(LINK_RE, (match, relTarget, hash) => {
    hash = hash || '';
    const cleanRel = relTarget.replace(/:\d+$/, '');

    // Check if target currently exists from current file dir
    const currentTargetAbs = resolve(newFileDir, cleanRel);
    if (existsSync(currentTargetAbs)) {
      return match; // Already valid!
    }

    // Try resolving from OLD location
    const oldTargetAbs = resolve(oldFileDir, cleanRel);
    const oldTargetRepoRel = relative(process.cwd(), oldTargetAbs).replace(/\\/g, '/');

    // Find new location of that target
    const newTargetRepoRel = mapOldPathToNew(oldTargetRepoRel);
    const newTargetAbs = resolve(process.cwd(), newTargetRepoRel);

    if (existsSync(newTargetAbs)) {
      let rewrittenRel = relative(newFileDir, newTargetAbs).replace(/\\/g, '/');
      if (!rewrittenRel.startsWith('.')) {
        rewrittenRel = './' + rewrittenRel;
      }
      totalLinksRewritten++;
      fileChanged = true;
      return `](${rewrittenRel}${hash})`;
    }

    // Check if target was moved from workspace/domains/ to docs/archive/
    const targetRepoRel = relative(process.cwd(), currentTargetAbs).replace(/\\/g, '/');
    if (targetRepoRel.startsWith('workspace/domains/')) {
      const archiveRepoRel = targetRepoRel.replace('workspace/domains/', 'docs/archive/');
      const archiveAbs = resolve(process.cwd(), archiveRepoRel);
      if (existsSync(archiveAbs)) {
        let rewrittenRel = relative(newFileDir, archiveAbs).replace(/\\/g, '/');
        if (!rewrittenRel.startsWith('.')) {
          rewrittenRel = './' + rewrittenRel;
        }
        totalLinksRewritten++;
        fileChanged = true;
        return `](${rewrittenRel}${hash})`;
      }
    }

    // Also check if cleanRel was pointing directly to a T_* folder without knowing it moved
    for (const [oldFolder, newFolder] of Object.entries(FOLDER_MAP)) {
      if (cleanRel.includes(oldFolder)) {
        const potentialTarget = cleanRel.replace(oldFolder, newFolder);
        const testAbs = resolve(newFileDir, potentialTarget);
        if (existsSync(testAbs)) {
          totalLinksRewritten++;
          fileChanged = true;
          return `](${potentialTarget}${hash})`;
        }
        // Check if potentialTarget was moved to docs/archive
        const potentialRepoRel = relative(process.cwd(), testAbs).replace(/\\/g, '/');
        if (potentialRepoRel.startsWith('workspace/domains/')) {
          const archiveRepoRel = potentialRepoRel.replace('workspace/domains/', 'docs/archive/');
          const archiveAbs = resolve(process.cwd(), archiveRepoRel);
          if (existsSync(archiveAbs)) {
            let rewrittenRel = relative(newFileDir, archiveAbs).replace(/\\/g, '/');
            if (!rewrittenRel.startsWith('.')) {
              rewrittenRel = './' + rewrittenRel;
            }
            totalLinksRewritten++;
            fileChanged = true;
            return `](${rewrittenRel}${hash})`;
          }
        }
      }
    }

    return match;
  });

  if (fileChanged) {
    safeWrite(file, newContent);
    updatedFilesCount++;
  }
}

console.log(`Rewrote ${totalLinksRewritten} links across ${updatedFilesCount} files.`);
