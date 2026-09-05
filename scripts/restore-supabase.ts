import { execFile } from 'node:child_process';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
import { downloadS3Object } from '@/lib/backup/s3-download';
import { decryptArtifact, readBackupConfig } from '@/lib/backup/recovery-crypto';
import {
  assertRestoreTargetIsIsolated,
  restoreSupabaseArtifacts,
  type RestoreSummary,
} from '@/lib/backup/supabase-restore';

const execFileAsync = promisify(execFile);

const artifactNameSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9._-]*\.enc$/i)
  .refine((name) => !name.includes('..'), 'artifact name must not contain path segments');

const manifestSchema = z.strictObject({
  formatVersion: z.literal(1),
  createdAt: z.string(),
  keyVersion: z.string(),
  artifacts: z
    .array(
      z.object({
        name: artifactNameSchema,
        bytes: z.number().int().positive(),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        ivBase64: z.string().base64(),
        authTagBase64: z.string().base64(),
      }),
    )
    .min(1),
});

type ManifestArtifact = z.infer<typeof manifestSchema>['artifacts'][number];

function parseArguments(argv: string[]): {
  backupDirectory?: string;
  s3BaseKey?: string;
  target: string;
} {
  const target = argv
    .find((argument) => argument.startsWith('--target='))
    ?.slice('--target='.length);
  const backupDirectory = argv
    .find((argument) => argument.startsWith('--dir='))
    ?.slice('--dir='.length);
  const s3BaseKey = argv.find((argument) => argument.startsWith('--s3='))?.slice('--s3='.length);
  if ((!backupDirectory && !s3BaseKey) || (backupDirectory && s3BaseKey) || !target) {
    console.error(
      'Usage: tsx scripts/restore-supabase.ts (--dir=<backup-directory> | --s3=<base-object-key>) --target=<isolated-postgres-url>',
    );
    process.exit(1);
  }
  return { backupDirectory, s3BaseKey, target };
}

function parseManifest(raw: Buffer): { manifest: z.infer<typeof manifestSchema> } {
  const result = manifestSchema.safeParse(JSON.parse(raw.toString('utf8')));
  if (!result.success) throw new Error('Backup manifest failed schema validation');
  return { manifest: result.data };
}

function stagedPath(stagingDirectory: string, artifactName: string): string {
  const path = join(stagingDirectory, artifactName);
  if (dirname(resolve(path)) !== resolve(stagingDirectory)) {
    throw new Error('Artifact name escapes the restore staging directory');
  }
  return path;
}

async function main(): Promise<void> {
  const { backupDirectory, s3BaseKey, target } = parseArguments(process.argv.slice(2));
  // Guard früh und nochmals vor jedem psql-Aufruf (Defense-in-Depth, M1 des Reviews).
  assertRestoreTargetIsIsolated(target);
  const config = readBackupConfig(process.env);
  const stagingDirectory = await mkdtemp(join(tmpdir(), 'casino-restore-'));

  try {
    const loadManifest = backupDirectory
      ? () => readFile(join(backupDirectory, 'manifest.json'))
      : () =>
          downloadS3Object({ config, objectKey: `${s3BaseKey}/manifest.json`, now: new Date() });
    const loadArtifact = (name: string) =>
      backupDirectory
        ? readFile(stagedPath(backupDirectory, name))
        : downloadS3Object({ config, objectKey: `${s3BaseKey}/${name}`, now: new Date() });

    const { manifest } = parseManifest(await loadManifest());
    const artifacts = [];
    for (const entry of manifest.artifacts) {
      const ciphertext = await loadArtifact(entry.name);
      const digest = createHash('sha256').update(ciphertext).digest('hex');
      if (digest !== entry.sha256)
        throw new Error(`Artifact ${entry.name} failed the manifest SHA-256 check`);

      const plaintext = decryptArtifact(
        {
          ciphertext,
          iv: Buffer.from(entry.ivBase64, 'base64'),
          authTag: Buffer.from(entry.authTagBase64, 'base64'),
        },
        config.encryptionKey,
      );
      artifacts.push({ name: entry.name.replace(/\.enc$/i, ''), plaintext });
    }

    const summary: RestoreSummary = await restoreSupabaseArtifacts({
      artifacts,
      connectionUrl: target,
      directory: stagingDirectory,
      execute: async (argumentsList, environment) => {
        await execFileAsync('psql', argumentsList, {
          windowsHide: true,
          maxBuffer: 16 * 1024 * 1024,
          env: { ...process.env, ...environment },
        });
      },
      writeFile,
    });

    console.info(
      JSON.stringify({
        status: 'restore-applied',
        restoredArtifacts: summary.restoredArtifacts,
        connectionPort: summary.connectionPort,
      }),
    );
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

main().catch(() => {
  console.error('Restore failed. Check the protected runner logs for the operational cause.');
  process.exitCode = 1;
});
