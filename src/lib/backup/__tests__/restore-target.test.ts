import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { loadRestoreArtifacts } from '@/lib/backup/restore-target';
import { buildBackupManifest, encryptArtifact } from '@/lib/backup/recovery-crypto';
import type { BackupTargetConfig } from '@/lib/backup/targets';

const key = randomBytes(32);
const date = new Date('2026-09-13T20:00:00.000Z');

const target: BackupTargetConfig = {
  name: 'secondary',
  config: {
    encryptionKey: key,
    includeRoles: false,
    s3: {
      endpoint: new URL('https://objects.example.test'),
      bucket: 'casino-recovery',
      region: 'eu-central-1',
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      prefix: 'casino-recovery',
    },
  },
};

function seedStorage(tamperArtifact: boolean) {
  const storage = new Map<string, Buffer>();
  const plaintexts = [
    { name: 'schema.sql', plaintext: Buffer.from('CREATE TABLE users (id uuid);') },
    { name: 'data.sql', plaintext: Buffer.from('INSERT INTO users VALUES (now());') },
  ];
  const encrypted = plaintexts.map((artifact) => ({
    name: `${artifact.name}.enc`,
    ...encryptArtifact(artifact.plaintext, key),
  }));
  const manifest = buildBackupManifest({
    createdAt: date.toISOString(),
    cliVersion: '2.116.0',
    keyVersion: 'v1',
    artifacts: encrypted,
  });
  const directory = 'casino-recovery/2026/09/13/';
  storage.set(`${directory}manifest.json`, Buffer.from(JSON.stringify(manifest), 'utf8'));
  for (const artifact of encrypted) {
    let ciphertext = artifact.ciphertext;
    if (tamperArtifact && artifact.name === 'data.sql.enc') {
      ciphertext = Buffer.from(ciphertext);
      ciphertext[ciphertext.length - 1] ^= 0xff;
    }
    storage.set(`${directory}${artifact.name}`, ciphertext);
  }
  return storage;
}

const download =
  (storage: Map<string, Buffer>) =>
  async ({ objectKey }: { config: unknown; objectKey: string }) => {
    const value = storage.get(objectKey);
    if (!value) throw new Error(`missing ${objectKey}`);
    return value;
  };

describe('loadRestoreArtifacts', () => {
  it('downloads, hash-verifies and decrypts artifacts from the named target', async () => {
    const storage = seedStorage(false);

    const artifacts = await loadRestoreArtifacts({
      target,
      date,
      download: download(storage),
    });

    expect(artifacts.map((artifact) => artifact.name)).toEqual(['schema.sql', 'data.sql']);
    expect(artifacts[1].plaintext.toString('utf8')).toBe('INSERT INTO users VALUES (now());');
  });

  it('fails closed when an artifact was tampered with after upload', async () => {
    const storage = seedStorage(true);

    await expect(
      loadRestoreArtifacts({ target, date, download: download(storage) }),
    ).rejects.toThrow(/does not match the manifest hash/i);
  });
});
