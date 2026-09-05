import { describe, expect, it } from 'vitest';
import { readBackupConfig } from '@/lib/backup/recovery-crypto';
import { uploadS3Object } from '@/lib/backup/s3-client';

const encryptionKey = Buffer.alloc(32, 7).toString('base64');
const config = readBackupConfig({
  BACKUP_ENCRYPTION_KEY_BASE64: encryptionKey,
  BACKUP_S3_ENDPOINT: 'https://objects.example.test',
  BACKUP_S3_BUCKET: 'casino-recovery',
  BACKUP_S3_REGION: 'eu-central-1',
  BACKUP_S3_ACCESS_KEY_ID: 'test-access-key',
  BACKUP_S3_SECRET_ACCESS_KEY: 'test-secret-key',
});

describe('S3 backup upload boundary', () => {
  it('returns a redacted error when offsite storage rejects an encrypted object', async () => {
    await expect(
      uploadS3Object({
        config,
        objectKey: 'casino-recovery/2026/08/30/data.sql.enc',
        body: Buffer.from('ciphertext-only', 'utf8'),
        contentType: 'application/octet-stream',
        now: new Date('2026-08-30T20:00:00.000Z'),
        fetchImpl: async () => new Response(null, { status: 403 }),
      }),
    ).rejects.toThrow('Offsite backup upload failed');
  });
});
