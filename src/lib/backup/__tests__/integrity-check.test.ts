import { createHash, randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  integrityCheckHasFailure,
  manifestObjectKey,
  verifyBackupIntegrity,
} from '@/lib/backup/integrity-check';
import { buildBackupManifest, encryptArtifact } from '@/lib/backup/recovery-crypto';
import type { BackupTargetConfig } from '@/lib/backup/targets';

const key = randomBytes(32);
const date = new Date('2026-09-13T20:00:00.000Z');

function makeTarget(storage: Map<string, Buffer>): BackupTargetConfig {
  return {
    name: 'primary',
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
}

function seedStorage(artifacts: Array<{ name: string; plaintext: Buffer }>) {
  const storage = new Map<string, Buffer>();
  const encrypted = artifacts.map((artifact) => ({
    name: `${artifact.name}.enc`,
    ...encryptArtifact(artifact.plaintext, key),
  }));
  const manifest = buildBackupManifest({
    createdAt: date.toISOString(),
    cliVersion: '2.116.0',
    keyVersion: 'v1',
    artifacts: encrypted,
  });
  const directory = `casino-recovery/2026/09/13/`;
  storage.set(`${directory}manifest.json`, Buffer.from(JSON.stringify(manifest), 'utf8'));
  for (const artifact of encrypted) {
    storage.set(`${directory}${artifact.name}`, artifact.ciphertext);
  }
  return { storage, manifest, encrypted };
}

describe('verifyBackupIntegrity', () => {
  it('reports hashMatch and decryptOk for every artifact of an intact backup', async () => {
    const { storage } = seedStorage([
      { name: 'schema.sql', plaintext: Buffer.from('CREATE TABLE users (id uuid);') },
      { name: 'data.sql', plaintext: Buffer.from('INSERT INTO users VALUES (now());') },
    ]);
    const target = makeTarget(storage);

    const results = await verifyBackupIntegrity({
      targets: [target],
      date,
      download: async ({ objectKey }) => {
        const value = storage.get(objectKey);
        if (!value) throw new Error(`missing ${objectKey}`);
        return value;
      },
    });

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.hashMatch && result.decryptOk)).toBe(true);
    expect(integrityCheckHasFailure(results)).toBe(false);
  });

  it('flags a tampered ciphertext as both hash mismatch and decrypt failure', async () => {
    const { storage } = seedStorage([
      { name: 'schema.sql', plaintext: Buffer.from('CREATE TABLE users (id uuid);') },
    ]);
    const target = makeTarget(storage);
    const artifactKey = 'casino-recovery/2026/09/13/schema.sql.enc';
    const tampered = Buffer.from(storage.get(artifactKey)!);
    tampered[0] ^= 0xff;
    storage.set(artifactKey, tampered);

    const results = await verifyBackupIntegrity({
      targets: [target],
      date,
      download: async ({ objectKey }) => {
        const value = storage.get(objectKey);
        if (!value) throw new Error(`missing ${objectKey}`);
        return value;
      },
    });

    expect(results[0].hashMatch).toBe(false);
    expect(results[0].decryptOk).toBe(false);
    expect(integrityCheckHasFailure(results)).toBe(true);
  });

  it('flags a manipulated manifest hash without a decrypt failure', async () => {
    const { storage } = seedStorage([
      { name: 'schema.sql', plaintext: Buffer.from('CREATE TABLE users (id uuid);') },
    ]);
    const target = makeTarget(storage);
    const manifestKey = 'casino-recovery/2026/09/13/manifest.json';
    const manifest = JSON.parse(storage.get(manifestKey)!.toString('utf8'));
    manifest.artifacts[0].sha256 = createHash('sha256').update('wrong').digest('hex');
    storage.set(manifestKey, Buffer.from(JSON.stringify(manifest), 'utf8'));

    const results = await verifyBackupIntegrity({
      targets: [target],
      date,
      download: async ({ objectKey }) => {
        const value = storage.get(objectKey);
        if (!value) throw new Error(`missing ${objectKey}`);
        return value;
      },
    });

    expect(results[0].hashMatch).toBe(false);
    expect(results[0].decryptOk).toBe(true);
    expect(integrityCheckHasFailure(results)).toBe(true);
  });

  it('records a failure instead of throwing when a target has no manifest for the date', async () => {
    const storage = new Map<string, Buffer>();
    const target = makeTarget(storage);

    const results = await verifyBackupIntegrity({
      targets: [target],
      date,
      download: async () => {
        throw new Error('Offsite backup download failed');
      },
    });

    expect(results).toEqual([
      {
        target: 'primary',
        artifact: 'manifest.json',
        hashMatch: false,
        decryptOk: false,
        error: expect.stringContaining('download failed'),
      },
    ]);
    expect(integrityCheckHasFailure(results)).toBe(true);
  });

  it('builds date-based manifest keys from the target prefix', () => {
    expect(manifestObjectKey('casino-recovery', date)).toBe(
      'casino-recovery/2026/09/13/manifest.json',
    );
  });
});
