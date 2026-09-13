import { describe, expect, it } from 'vitest';
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

const secondaryEnvironment = {
  BACKUP_SECONDARY_S3_ENDPOINT: 'https://secondary.example.test',
  BACKUP_SECONDARY_S3_BUCKET: 'casino-recovery-secondary',
  BACKUP_SECONDARY_S3_REGION: 'eu-central-003',
  BACKUP_SECONDARY_S3_ACCESS_KEY_ID: 'secondary-access-key',
  BACKUP_SECONDARY_S3_SECRET_ACCESS_KEY: 'secondary-secret-key',
};

const dump = () =>
  Promise.resolve([
    { name: 'schema.sql', plaintext: Buffer.from('schema', 'utf8') },
    { name: 'data.sql', plaintext: Buffer.from('data', 'utf8') },
  ]);

type UploadCall = { target: string; host: string; objectKey: string; body: Buffer };

function makeUpload(calls: UploadCall[], failingHost: string | null = null) {
  return async (input: {
    target: string;
    config: { s3: { endpoint: URL; accessKeyId: string; secretAccessKey: string } };
    objectKey: string;
    body: Buffer;
    contentType: string;
  }) => {
    if (input.config.s3.endpoint.host === failingHost) {
      throw new Error(`Offsite backup upload failed on ${input.target}`);
    }
    calls.push({
      target: input.target,
      host: input.config.s3.endpoint.host,
      objectKey: input.objectKey,
      body: input.body,
    });
  };
}

describe('backup runner single-target compatibility', () => {
  it('behaves identically when only the primary target is configured', async () => {
    const calls: UploadCall[] = [];
    const manifest = await runBackup({
      environment: validEnvironment,
      dump,
      upload: makeUpload(calls),
      cliVersion: '2.116.0',
      keyVersion: 'v1',
      now: new Date('2026-09-13T20:00:00.000Z'),
    });

    expect(manifest.targets).toEqual([{ name: 'primary', status: 'ok' }]);
    expect(calls).toHaveLength(3);
    expect(new Set(calls.map((call) => call.target))).toEqual(new Set(['primary']));
    expect(manifest.artifacts).toHaveLength(2);
  });
});

describe('backup runner multi-target redundancy', () => {
  it('uploads to both targets and records both successes in the manifest', async () => {
    const calls: UploadCall[] = [];
    const manifest = await runBackup({
      environment: { ...validEnvironment, ...secondaryEnvironment },
      dump,
      upload: makeUpload(calls),
      cliVersion: '2.116.0',
      keyVersion: 'v1',
      now: new Date('2026-09-13T20:00:00.000Z'),
    });

    expect(manifest.targets).toEqual([
      { name: 'primary', status: 'ok' },
      { name: 'secondary', status: 'ok' },
    ]);
    expect(calls).toHaveLength(6);
    expect(calls.filter((call) => call.target === 'secondary')).toHaveLength(3);
    expect(
      calls
        .filter((call) => call.target === 'secondary')
        .every((call) => call.objectKey.startsWith('casino-recovery/2026/09/13/')),
    ).toBe(true);
  });

  it('reports a partial success instead of silently dropping a failing secondary target', async () => {
    const calls: UploadCall[] = [];
    const manifest = await runBackup({
      environment: { ...validEnvironment, ...secondaryEnvironment },
      dump,
      upload: makeUpload(calls, 'secondary.example.test'),
      cliVersion: '2.116.0',
      keyVersion: 'v1',
      now: new Date('2026-09-13T20:00:00.000Z'),
    });

    expect(manifest.targets).toEqual([
      { name: 'primary', status: 'ok' },
      { name: 'secondary', status: 'failed', error: expect.stringContaining('secondary') },
    ]);
    expect(calls.every((call) => call.target === 'primary')).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it('throws after trying all targets when every target fails', async () => {
    const calls: UploadCall[] = [];
    await expect(
      runBackup({
        environment: { ...validEnvironment, ...secondaryEnvironment },
        dump,
        upload: async () => {
          throw new Error('Offsite backup upload failed');
        },
        cliVersion: '2.116.0',
        keyVersion: 'v1',
        now: new Date('2026-09-13T20:00:00.000Z'),
      }),
    ).rejects.toThrow(/all configured backup targets failed/i);

    expect(calls).toHaveLength(0);
  });

  it('keeps primary and secondary credentials isolated when signing uploads', async () => {
    const calls: UploadCall[] = [];
    await runBackup({
      environment: { ...validEnvironment, ...secondaryEnvironment },
      dump,
      upload: makeUpload(calls),
      cliVersion: '2.116.0',
      keyVersion: 'v1',
      now: new Date('2026-09-13T20:00:00.000Z'),
    });

    const perTargetHosts = new Map<string, Set<string>>();
    for (const call of calls) {
      const hosts = perTargetHosts.get(call.target) ?? new Set<string>();
      hosts.add(call.host);
      perTargetHosts.set(call.target, hosts);
    }
    expect(perTargetHosts.get('primary')).toEqual(new Set(['objects.example.test']));
    expect(perTargetHosts.get('secondary')).toEqual(new Set(['secondary.example.test']));
  });
});
