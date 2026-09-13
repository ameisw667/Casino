import {
  buildBackupManifest,
  encryptArtifact,
  type BackupManifestInput,
  type BackupConfig,
} from './recovery-crypto';
import { readBackupTargets } from './targets';

type PlaintextArtifact = {
  name: string;
  plaintext: Buffer;
};

type Upload = (input: {
  target: string;
  config: BackupConfig;
  objectKey: string;
  body: Buffer;
  contentType: 'application/octet-stream' | 'application/json';
}) => Promise<void>;

type TargetResult = {
  name: string;
  status: 'ok' | 'failed';
  error?: string;
};

function utcDirectory(now: Date): string {
  return now.toISOString().slice(0, 10).replaceAll('-', '/');
}

function assertArtifactSet(artifacts: PlaintextArtifact[]): void {
  const names = new Set(artifacts.map((artifact) => artifact.name));
  if (!names.has('schema.sql') || !names.has('data.sql')) {
    throw new Error('Backup export must contain schema.sql and data.sql');
  }
  if (
    names.size !== artifacts.length ||
    artifacts.some((artifact) => artifact.plaintext.length === 0)
  ) {
    throw new Error('Backup export contains duplicate or empty artifacts');
  }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Säule 9 N2: lädt die Dump-Artefakte sequenziell gegen jedes konfigurierte Ziel hoch.
 * Ein Fehlschlag am Sekundärziel verschluckt keinen Erfolg am Primärziel — das Ergebnis
 * ist "teilweise erfolgreich" (targets[] im Manifest) statt still "erfolgreich". Erst
 * wenn ALLE Ziele scheitern, bricht der Lauf fail-closed ab. Ohne BACKUP_SECONDARY_*
 * verhält sich der Runner exakt wie im Einzelziel-Fall.
 */
export async function runBackup(input: {
  environment: Record<string, string | undefined>;
  dump: () => Promise<PlaintextArtifact[]>;
  upload: Upload;
  cliVersion: string;
  keyVersion: string;
  now: Date;
}) {
  const targets = readBackupTargets(input.environment);
  const artifacts = await input.dump();
  assertArtifactSet(artifacts);

  const encryptedArtifacts = artifacts.map((artifact) => ({
    name: `${artifact.name}.enc`,
    ...encryptArtifact(artifact.plaintext, targets[0].config.encryptionKey),
  }));
  const results: TargetResult[] = [];

  for (const target of targets) {
    const targetKeyPrefix = `${target.config.s3.prefix}/${utcDirectory(input.now)}`;
    try {
      for (const artifact of encryptedArtifacts) {
        await input.upload({
          target: target.name,
          config: target.config,
          objectKey: `${targetKeyPrefix}/${artifact.name}`,
          body: artifact.ciphertext,
          contentType: 'application/octet-stream',
        });
      }
      results.push({ name: target.name, status: 'ok' });
    } catch (error) {
      results.push({ name: target.name, status: 'failed', error: errorText(error) });
    }
  }

  if (!results.some((result) => result.status === 'ok')) {
    throw new Error(
      `Backup failed: all configured backup targets failed (${results
        .map((result) => `${result.name}: ${result.error}`)
        .join('; ')})`,
    );
  }

  const manifest = {
    ...buildBackupManifest({
      createdAt: input.now.toISOString(),
      cliVersion: input.cliVersion,
      keyVersion: input.keyVersion,
      artifacts: encryptedArtifacts satisfies BackupManifestInput['artifacts'],
    }),
    targets: results,
  };

  const successfulTargets = targets.filter(
    (target) => results.find((result) => result.name === target.name)?.status === 'ok',
  );
  let finalResults = results;
  for (const target of successfulTargets) {
    try {
      await input.upload({
        target: target.name,
        config: target.config,
        objectKey: `${target.config.s3.prefix}/${utcDirectory(input.now)}/manifest.json`,
        body: Buffer.from(JSON.stringify(manifest), 'utf8'),
        contentType: 'application/json',
      });
    } catch (error) {
      finalResults = finalResults.map((result) =>
        result.name === target.name
          ? { name: result.name, status: 'failed' as const, error: errorText(error) }
          : result,
      );
    }
  }

  return { ...manifest, targets: finalResults };
}
