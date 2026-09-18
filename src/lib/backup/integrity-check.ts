import { createHash } from 'node:crypto';
import { decryptArtifact } from './recovery-crypto';
import type { BackupTargetConfig } from './targets';

type ManifestFile = {
  createdAt?: string;
  artifacts: Array<{
    name: string;
    sha256: string;
    ivBase64: string;
    authTagBase64: string;
    bytes?: number;
  }>;
};

export type IntegrityCheckResult = {
  target: string;
  artifact: string;
  hashMatch: boolean;
  decryptOk: boolean;
  error?: string;
};

export function manifestObjectKey(prefix: string, date: Date): string {
  const utcDirectory = date.toISOString().slice(0, 10).replaceAll('-', '/');
  return `${prefix}/${utcDirectory}/manifest.json`;
}

function parseManifest(raw: Buffer, label: string): ManifestFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.toString('utf8'));
  } catch (error) {
    throw new Error(`Manifest on ${label} is not valid JSON: ${String(error)}`);
  }
  const candidate = parsed as Partial<ManifestFile>;
  if (!Array.isArray(candidate.artifacts) || candidate.artifacts.length === 0) {
    throw new Error(`Manifest on ${label} contains no artifacts`);
  }
  for (const artifact of candidate.artifacts) {
    if (
      typeof artifact.name !== 'string' ||
      typeof artifact.sha256 !== 'string' ||
      typeof artifact.ivBase64 !== 'string' ||
      typeof artifact.authTagBase64 !== 'string'
    ) {
      throw new Error(`Manifest on ${label} has an incomplete artifact entry`);
    }
  }
  return candidate as ManifestFile;
}

/**
 * Säule 9 N3: reine Download+Hash-Prüfung — kein Restore, keine DB-Mutation. Lädt Manifest
 * und alle referenzierten Artefakte von jedem konfigurierten Ziel, entschlüsselt sie
 * (GCM-Auth-Tag beweist Unverändbarkeit) und vergleicht den im Manifest gespeicherten
 * SHA-256 (Ciphertext-Hash) mit dem frisch heruntergeladenen Ciphertext.
 */
export async function verifyBackupIntegrity(input: {
  targets: BackupTargetConfig[];
  date: Date;
  download: (parameters: { target: BackupTargetConfig; objectKey: string }) => Promise<Buffer>;
}): Promise<IntegrityCheckResult[]> {
  const results: IntegrityCheckResult[] = [];

  for (const target of input.targets) {
    const manifestKey = manifestObjectKey(target.config.s3.prefix, input.date);
    let manifest: ManifestFile;
    try {
      manifest = parseManifest(
        await input.download({ target, objectKey: manifestKey }),
        target.name,
      );
    } catch (error) {
      results.push({
        target: target.name,
        artifact: 'manifest.json',
        hashMatch: false,
        decryptOk: false,
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    const manifestDirectory = manifestKey.replace(/manifest\.json$/, '');
    for (const artifact of manifest.artifacts) {
      try {
        const ciphertext = await input.download({
          target,
          objectKey: `${manifestDirectory}${artifact.name}`,
        });
        const hashMatch =
          createHash('sha256').update(ciphertext).digest('hex') === artifact.sha256.toLowerCase();
        let decryptOk = true;
        try {
          decryptArtifact(
            {
              ciphertext,
              iv: Buffer.from(artifact.ivBase64, 'base64'),
              authTag: Buffer.from(artifact.authTagBase64, 'base64'),
            },
            target.config.encryptionKey,
          );
        } catch {
          decryptOk = false;
        }
        results.push({ target: target.name, artifact: artifact.name, hashMatch, decryptOk });
      } catch (error) {
        results.push({
          target: target.name,
          artifact: artifact.name,
          hashMatch: false,
          decryptOk: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return results;
}

export function integrityCheckHasFailure(results: IntegrityCheckResult[]): boolean {
  return results.some((result) => !result.hashMatch || !result.decryptOk);
}
