import { execFile } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { runBackup } from '@/lib/backup/backup-runner';
import { readBackupConfig } from '@/lib/backup/recovery-crypto';
import { uploadS3Object } from '@/lib/backup/s3-client';
import { dumpSupabaseArtifacts } from '@/lib/backup/supabase-dump';

const execFileAsync = promisify(execFile);
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

async function runSupabaseCli(argumentsList: string[]): Promise<void> {
  await execFileAsync(npxCommand, argumentsList, {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
}

async function getCliVersion(): Promise<string> {
  const { stdout } = await execFileAsync(npxCommand, ['--no-install', 'supabase', '--version'], {
    cwd: process.cwd(),
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

async function main(): Promise<void> {
  const config = readBackupConfig(process.env);
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'casino-backup-'));

  try {
    const manifest = await runBackup({
      environment: process.env,
      dump: () =>
        dumpSupabaseArtifacts({
          directory: temporaryDirectory,
          execute: runSupabaseCli,
          readFile,
          includeRoles: config.includeRoles,
        }),
      upload: ({ objectKey, body, contentType }) =>
        uploadS3Object({ config, objectKey, body, contentType, now: new Date() }),
      cliVersion: await getCliVersion(),
      keyVersion: process.env.BACKUP_ENCRYPTION_KEY_VERSION?.trim() || 'v1',
      now: new Date(),
    });

    console.info(
      JSON.stringify({
        status: 'backup-uploaded',
        createdAt: manifest.createdAt,
        artifactCount: manifest.artifacts.length,
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
