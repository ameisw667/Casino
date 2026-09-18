/**
 * Säule 9 N3 — Integritäts-Nachverifikation ohne Restore: lädt das Manifest und alle
 * referenzierten Artefakte von JEDEM konfigurierten Backup-Ziel (N2), entschlüsselt sie
 * (AES-256-GCM-Auth-Tag) und vergleicht den Manifest-SHA-256 mit dem heruntergeladenen
 * Ciphertext. Kein Restore, keine DB-Mutation.
 *
 * Lauf: npx tsx scripts/verify-backup-integrity.ts [--date=YYYY-MM-DD]
 * Default-Datum: heutiger UTC-Tag (der tägliche Backup-Lauf schreibt genau dieses Präfix).
 * Exit 1 bei jedem Mismatch — kein stiller Teilerfolg.
 */
import { downloadS3Object } from '@/lib/backup/s3-download';
import { integrityCheckHasFailure, verifyBackupIntegrity } from '@/lib/backup/integrity-check';
import { readBackupTargets } from '@/lib/backup/targets';

function parseDateArgument(argumentsList: string[]): Date {
  const argument = argumentsList.find((value) => value.startsWith('--date='));
  if (!argument) return new Date();
  const raw = argument.slice('--date='.length);
  const parsed = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`--date expects YYYY-MM-DD, received: ${raw}`);
  }
  return parsed;
}

async function main(): Promise<void> {
  const targets = readBackupTargets(process.env);
  const date = parseDateArgument(process.argv.slice(2));

  const results = await verifyBackupIntegrity({
    targets,
    date,
    download: ({ target, objectKey }) =>
      downloadS3Object({ config: target.config, objectKey, now: new Date() }),
  });

  console.info(JSON.stringify({ status: 'integrity-check', results }, null, 2));

  if (integrityCheckHasFailure(results)) {
    console.error('Backup integrity verification FAILED. See the results above.');
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(
    `Backup integrity check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
