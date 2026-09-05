import { describe, expect, it, vi } from 'vitest';
import { runBackup } from '@/lib/backup/backup-runner';

const encryptionKey = Buffer.alloc(32, 7).toString('base64');

const validEnvironment = {
  BACKUP_ENCRYPTION_KEY_BASE64: encryptionKey,
  BACKUP_S3_ENDPOINT: 'https://objects.example.test',
  BACKUP_S3_BUCKET: 'casino-recovery',
  BACKUP_S3_REGION: 'eu-central-1',
  BACKUP_S3_ACCESS_KEY_ID: 'test-access-key',
  BACKUP_S3_SECRET_ACCESS_KEY: 'test-secret-key',
};

describe('backup runner fail-closed boundary', () => {
  it('does not start a database dump when the offsite endpoint is not HTTPS', async () => {
    const dump = vi.fn(async () => [
      { name: 'schema.sql', plaintext: Buffer.from('schema', 'utf8') },
      { name: 'data.sql', plaintext: Buffer.from('data', 'utf8') },
    ]);

    await expect(
      runBackup({
        environment: { ...validEnvironment, BACKUP_S3_ENDPOINT: 'http://objects.example.test' },
        dump,
        upload: async () => undefined,
        cliVersion: '2.116.0',
        keyVersion: 'v1',
        now: new Date('2026-08-30T20:00:00.000Z'),
      }),
    ).rejects.toThrow(/HTTPS/i);

    expect(dump).not.toHaveBeenCalled();
  });
});
