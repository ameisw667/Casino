import { describe, expect, it } from 'vitest';
import { downloadS3Object } from '@/lib/backup/s3-download';
import { readBackupConfig } from '@/lib/backup/recovery-crypto';

const config = readBackupConfig({
  BACKUP_ENCRYPTION_KEY_BASE64: Buffer.alloc(32, 7).toString('base64'),
  BACKUP_S3_ENDPOINT: 'https://objects.example.test',
  BACKUP_S3_BUCKET: 'casino-recovery',
  BACKUP_S3_REGION: 'eu-central-1',
  BACKUP_S3_ACCESS_KEY_ID: 'test-access-key',
  BACKUP_S3_SECRET_ACCESS_KEY: 'test-secret-key',
});

describe('S3 backup download boundary', () => {
  it('returns a redacted error when offsite storage rejects the signed GET request', async () => {
    await expect(
      downloadS3Object({
        config,
        objectKey: 'casino-recovery/2026/09/05/manifest.json',
        now: new Date('2026-09-05T20:00:00.000Z'),
        fetchImpl: async () => new Response(null, { status: 404 }),
      }),
    ).rejects.toThrow('Offsite backup download failed');
  });

  it('returns the object body on a signed GET request', async () => {
    const body = await downloadS3Object({
      config,
      objectKey: 'casino-recovery/2026/09/05/manifest.json',
      now: new Date('2026-09-05T20:00:00.000Z'),
      fetchImpl: async () => new Response(Buffer.from('{}', 'utf8'), { status: 200 }),
    });
    expect(body.toString('utf8')).toBe('{}');
  });
});
