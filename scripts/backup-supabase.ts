import { execFile } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { runBackup } from '@/lib/backup/backup-runner';
import { readBackupTargets } from '@/lib/backup/targets';
import { uploadS3Object } from '@/lib/backup/s3-client';
import { dumpSupabaseArtifacts } from '@/lib/backup/supabase-dump';

const execFileAsync = promisify(execFile);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

async function runSupabaseCli(argumentsList: string[]): Promise<void> {
  // shell: true ist auf Windows zwingend für npx.cmd (Node ≥ 18.20 verweigert das
  // Spawnen von .cmd/.bat ohne Shell). Argumente sind raumfreie, kontrollierte Werte.
  await execFileAsync(npxCommand, argumentsList, {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
    shell: true,
  });
}

async function getCliVersion(): Promise<string> {
  const { stdout } = await execFileAsync(npxCommand, ['--no-install', 'supabase', '--version'], {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
    shell: true,
  });
  return stdout.trim();
}

async function main(): Promise<void> {
  // Fail-closed: Ziel-Konfiguration (inkl. Credentials beider Ziele) wird vor jedem CLI-
  // Aufruf validiert; ein Fehlschlag bricht ab, bevor Dump oder Upload starten.
  const targets = readBackupTargets(process.env);
  const includeRoles = targets[0].config.includeRoles;
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'casino-backup-'));

  try {
    const manifest = await runBackup({
      environment: process.env,
      dump: () =>
        dumpSupabaseArtifacts({
          directory: temporaryDirectory,
          execute: runSupabaseCli,
          readFile,
          includeRoles,
        }),
      upload: ({ target, config, objectKey, body, contentType }) => {
        void target;
        return uploadS3Object({ config, objectKey, body, contentType, now: new Date() });
      },
      cliVersion: await getCliVersion(),
      keyVersion: process.env.BACKUP_ENCRYPTION_KEY_VERSION?.trim() || 'v1',
      now: new Date(),
    });

    const failedTargets = manifest.targets
      .filter((target) => target.status === 'failed')
      .map((target) => ({ name: target.name, error: target.error }));

    // Teilerfolg sichtbar machen, nicht still verschlucken (Säule 9 N2): das Primärziel
    // kann vollständig ok sein, während das Sekundärziel scheitert — der Run gilt als
    // `partial` und der Log trägt die Fehlschläge als Warnung.
    if (failedTargets.length > 0) {
      console.warn(JSON.stringify({ status: 'backup-partial-targets', failedTargets }, null, 2));
    }

    console.info(
      JSON.stringify({
        status: failedTargets.length > 0 ? 'backup-partial' : 'backup-uploaded',
        createdAt: manifest.createdAt,
        artifactCount: manifest.artifacts.length,
        targets: manifest.targets.map((target) => ({ name: target.name, status: target.status })),
      }),
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

main().catch(() => {
  console.error('Backup run failed. Check the protected runner logs for the operational cause.');
  process.exitCode = 1;
});
