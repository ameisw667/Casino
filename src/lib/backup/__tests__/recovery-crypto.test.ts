import { describe, expect, it } from 'vitest';
import {
  buildBackupManifest,
  decryptArtifact,
  encryptArtifact,
  readBackupConfig,
  createSignedS3PutRequest,
} from '@/lib/backup/recovery-crypto';

const encryptionKey = Buffer.alloc(32, 7).toString('base64');

const validEnvironment = {
  BACKUP_ENCRYPTION_KEY_BASE64: encryptionKey,
  BACKUP_S3_ENDPOINT: 'https://objects.example.test',
  BACKUP_S3_BUCKET: 'casino-recovery',
  BACKUP_S3_REGION: 'eu-central-1',
  BACKUP_S3_ACCESS_KEY_ID: 'test-access-key',
  BACKUP_S3_SECRET_ACCESS_KEY: 'test-secret-key',
};

describe('recovery backup crypto boundary', () => {
  it('rejects a non-HTTPS offsite endpoint before an export can begin', () => {
    expect(() =>
      readBackupConfig({ ...validEnvironment, BACKUP_S3_ENDPOINT: 'http://objects.example.test' }),
    ).toThrow(/HTTPS/i);
  });

  it('rejects an encryption key that is not exactly 32 bytes', () => {
    expect(() =>
      readBackupConfig({ ...validEnvironment, BACKUP_ENCRYPTION_KEY_BASE64: 'dG9vLXNob3J0' }),
    ).toThrow(/32 bytes/i);
  });

  it('refuses altered encrypted data instead of returning unauthenticated plaintext', () => {
    const plaintext = Buffer.from('wallet-ledger-export', 'utf8');
    const encrypted = encryptArtifact(plaintext, Buffer.from(encryptionKey, 'base64'));
    const alteredCiphertext = Buffer.from(encrypted.ciphertext);
    alteredCiphertext[0] ^= 1;

    expect(() =>
      decryptArtifact(
        { ...encrypted, ciphertext: alteredCiphertext },
        Buffer.from(encryptionKey, 'base64'),
      ),
    ).toThrow();
  });

  it('round-trips authenticated plaintext with a fresh per-artifact IV', () => {
    const plaintext = Buffer.from('wallet-ledger-export', 'utf8');
    const key = Buffer.from(encryptionKey, 'base64');
    const first = encryptArtifact(plaintext, key);
    const second = encryptArtifact(plaintext, key);

    expect(decryptArtifact(first, key).toString('utf8')).toBe('wallet-ledger-export');
    expect(first.iv.equals(second.iv)).toBe(false);
  });

  it('creates a ciphertext-only manifest with a verifiable SHA-256 digest', () => {
    const manifest = buildBackupManifest({
      createdAt: '2026-08-30T20:00:00.000Z',
      cliVersion: '2.116.0',
      keyVersion: 'v1',
      artifacts: [
        {
          name: 'data.sql.enc',
          ciphertext: Buffer.from('ciphertext-only', 'utf8'),
          iv: Buffer.alloc(12, 1),
          authTag: Buffer.alloc(16, 2),
        },
      ],
    });

    expect(manifest.artifacts).toEqual([
      {
        name: 'data.sql.enc',
        bytes: 15,
        sha256: '53edc259ac303fd045cbd3d534edfe09a1abaeb0bccf34ff0d3c31c69ef86698',
        ivBase64: 'AQEBAQEBAQEBAQEB',
        authTagBase64: 'AgICAgICAgICAgICAgICAg==',
      },
    ]);
    expect(JSON.stringify(manifest)).not.toContain('ciphertext-only');
  });
  it('signs each offsite upload for the configured HTTPS object key', () => {
    const signed = createSignedS3PutRequest({
      config: readBackupConfig(validEnvironment),
      objectKey: 'casino-recovery/2026/08/30/data.sql.enc',
      body: Buffer.from('ciphertext-only', 'utf8'),
      now: new Date('2026-08-30T20:00:00.000Z'),
    });

    expect(signed.url).toBe(
      'https://objects.example.test/casino-recovery/casino-recovery/2026/08/30/data.sql.enc',
    );
    expect(signed.headers['x-amz-content-sha256']).toBe(
      '53edc259ac303fd045cbd3d534edfe09a1abaeb0bccf34ff0d3c31c69ef86698',
    );
    expect(signed.headers.authorization).toMatch(
      /^AWS4-HMAC-SHA256 Credential=test-access-key\/20260830\/eu-central-1\/s3\/aws4_request,/,
    );
    expect(signed.headers.authorization).toContain(
      'SignedHeaders=host;x-amz-content-sha256;x-amz-date',
    );
  });
});
