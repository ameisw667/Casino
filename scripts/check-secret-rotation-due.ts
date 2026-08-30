import fs from 'fs';
import path from 'path';
import { TURNUS_DAYS, parseRotationLog, computeOverdue } from '../src/lib/security/secret-rotation';

function main() {
  const logPath = path.resolve(process.cwd(), 'xx_docs/13_secret_rotation_log.md');
  const content = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '';
  const entries = parseRotationLog(content);
  const results = computeOverdue(entries, TURNUS_DAYS, new Date());

  const overdue = results.filter((r) => r.status !== 'ok');

  console.log('========================================================');
  console.log('🔐 SECRET ROTATION DUE CHECK (informational, not a CI gate)');
  console.log('========================================================');
  for (const r of results) {
    if (r.status === 'ok') {
      console.log(`✅ ${r.secret}: ${r.daysSinceRotation}/${r.turnusDays} Tage`);
    } else if (r.status === 'overdue') {
      console.warn(`⚠️  ${r.secret}: überfällig (${r.daysSinceRotation}/${r.turnusDays} Tage)`);
    } else {
      console.warn(`⚠️  ${r.secret}: nie rotiert / kein Log-Eintrag`);
    }
  }
  console.log('========================================================');

  if (overdue.length > 0) {
    console.warn(
      `${overdue.length} Secret(s) überfällig oder nie dokumentiert — Rotation bleibt K5 (Jan), dies ist nur ein Hinweis.`,
    );
    process.exit(1);
  }
  console.log('Alle Secrets im Turnus.');
  process.exit(0);
}

main();
