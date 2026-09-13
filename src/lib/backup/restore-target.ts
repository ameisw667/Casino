import { createHash } from 'node:crypto';
import { decryptArtifact } from './recovery-crypto';
import { manifestObjectKey } from './integrity-check';
import type { BackupConfig } from './recovery-crypto';
import type { BackupTargetConfig } from './targets';

export type RestoreArtifact = {
  name: string;
  plaintext: Buffer;
};

type ManifestFile = {
  artifacts: Array<{
    name: string;
    sha256: string;
    ivBase64: string;
    authTagBase64: string;
  }>;
};

/**
 * Säule 9 N6: lädt Manifest + verschlüsselte Artefakte von EINEM Backup-Ziel, prüft den
 * Ciphertext-Hash gegen das Manifest (fail-closed bei Manipulation) und entschlüsselt
 * sie — die Plaintext-Artefakte fließen unverändert in den bestehenden lokalen
 * Restore-Drill. Kein Remote-Schreibzugriff, kein Produktions-Restore.
 */
export async function loadRestoreArtifacts(input: {
  target: BackupTargetConfig;
  date: Date;
  download: (parameters: { config: BackupConfig; objectKey: string }) => Promise<Buffer>;
}): Promise<RestoreArtifact[]> {
  const manifestKey = manifestObjectKey(input.target.config.s3.prefix, input.date);
  const manifest = JSON.parse(
    (await input.download({ config: input.target.config, objectKey: manifestKey })).toString(
      'utf8',
    ),
  ) as ManifestFile;

  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
    throw new Error(`Manifest on ${input.target.name} contains no artifacts`);
  }

  const manifestDirectory = manifestKey.replace(/manifest\.json$/, '');
  const artifacts: RestoreArtifact[] = [];
  for (const artifact of manifest.artifacts) {
    const ciphertext = await input.download({
      config: input.target.config,
      objectKey: `${manifestDirectory}${artifact.name}`,
    });
    const hashMatch =
      createHash('sha256').update(ciphertext).digest('hex') === artifact.sha256.toLowerCase();
    if (!hashMatch) {
      throw new Error(
        `Artifact ${artifact.name} on ${input.target.name} does not match the manifest hash — refusing to restore.`,
      );
    }
    artifacts.push({
      name: artifact.name.replace(/\.enc$/, ''),
      plaintext: decryptArtifact(
        {
          ciphertext,
          iv: Buffer.from(artifact.ivBase64, 'base64'),
          authTag: Buffer.from(artifact.authTagBase64, 'base64'),
        },
        input.target.config.encryptionKey,
      ),
    });
  }

  return artifacts;
}
