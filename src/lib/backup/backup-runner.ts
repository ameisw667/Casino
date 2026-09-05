import {
  buildBackupManifest,
  encryptArtifact,
  readBackupConfig,
  type BackupManifestInput,
} from './recovery-crypto';

type PlaintextArtifact = {
  name: string;
  plaintext: Buffer;
};

type Upload = (input: {
  objectKey: string;
  body: Buffer;
  contentType: 'application/octet-stream' | 'application/json';
}) => Promise<void>;

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

export async function runBackup(input: {
  environment: Record<string, string | undefined>;
  dump: () => Promise<PlaintextArtifact[]>;
  upload: Upload;
  cliVersion: string;
  keyVersion: string;
  now: Date;
}) {
  const config = readBackupConfig(input.environment);
  const artifacts = await input.dump();
  assertArtifactSet(artifacts);

  const encryptedArtifacts = artifacts.map((artifact) => ({
    name: `${artifact.name}.enc`,
    ...encryptArtifact(artifact.plaintext, config.encryptionKey),
  }));
  const manifest = buildBackupManifest({
    createdAt: input.now.toISOString(),
    cliVersion: input.cliVersion,
    keyVersion: input.keyVersion,
    artifacts: encryptedArtifacts satisfies BackupManifestInput['artifacts'],
  });
  const baseKey = `${config.s3.prefix}/${utcDirectory(input.now)}`;

  for (const artifact of encryptedArtifacts) {
    await input.upload({
      objectKey: `${baseKey}/${artifact.name}`,
      body: artifact.ciphertext,
      contentType: 'application/octet-stream',
    });
  }
  await input.upload({
    objectKey: `${baseKey}/manifest.json`,
    body: Buffer.from(JSON.stringify(manifest), 'utf8'),
    contentType: 'application/json',
  });

  return manifest;
}
