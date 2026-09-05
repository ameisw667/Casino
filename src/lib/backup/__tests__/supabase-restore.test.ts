import { describe, expect, it } from 'vitest';
import {
  assertRestoreTargetIsIsolated,
  restoreSupabaseArtifacts,
} from '@/lib/backup/supabase-restore';

const artifacts = [
  { name: 'schema.sql', plaintext: Buffer.from('CREATE TABLE public.example (id uuid);', 'utf8') },
  {
    name: 'data.sql',
    plaintext: Buffer.from(
      "INSERT INTO public.example VALUES ('00000000-0000-0000-0000-000000000000');",
      'utf8',
    ),
  },
];

const drillTarget = 'postgresql://postgres:postgres@127.0.0.1:55432/postgres';

describe('restore safety guard (allowlist: loopback + port 55432 only)', () => {
  it('accepts the isolated drill container on port 55432', () => {
    expect(() => assertRestoreTargetIsIsolated(drillTarget)).not.toThrow();
  });

  it('accepts bracketed IPv6 loopback on port 55432', () => {
    expect(() =>
      assertRestoreTargetIsIsolated('postgresql://postgres:postgres@[::1]:55432/postgres'),
    ).not.toThrow();
  });

  it('refuses the main local dev instance on port 54322', () => {
    expect(() =>
      assertRestoreTargetIsIsolated('postgresql://postgres:postgres@127.0.0.1:54322/postgres'),
    ).toThrow('must use port 55432');
  });

  it('refuses localhost on any port other than 55432', () => {
    expect(() =>
      assertRestoreTargetIsIsolated('postgresql://postgres:postgres@localhost:5432/postgres'),
    ).toThrow('must use port 55432');
  });

  it('refuses uppercase or trailing-dot host spellings that resolve to the dev instance', () => {
    expect(() =>
      assertRestoreTargetIsIsolated('postgresql://postgres:postgres@LOCALHOST.:55432/postgres'),
    ).not.toThrow();
    expect(() =>
      assertRestoreTargetIsIsolated('postgresql://postgres:postgres@LOCALHOST.:54322/postgres'),
    ).toThrow('must use port 55432');
  });

  it('refuses non-loopback hosts even on port 55432 (e. g. a Supabase project host)', () => {
    expect(() =>
      assertRestoreTargetIsIsolated(
        'postgresql://postgres:postgres@db.hmqwozhdckbwjqzcmire.supabase.co:55432/postgres',
      ),
    ).toThrow('only the isolated loopback drill container is allowed');
  });

  it('refuses connection URLs containing the project ref', () => {
    expect(() =>
      assertRestoreTargetIsIsolated(
        'postgresql://postgres:postgres@127.0.0.1:55432/hmqwozhdckbwjqzcmire',
      ),
    ).toThrow('must never run against a Supabase project');
  });

  it('refuses percent-encoded host smuggling attempts', () => {
    expect(() =>
      assertRestoreTargetIsIsolated('postgres://%68mqwozhdckbwjqzcmire.supabase%2Eco/db'),
    ).toThrow('only the isolated loopback drill container is allowed');
  });

  it('refuses an unparseable connection URL and non-postgres protocols', () => {
    expect(() => assertRestoreTargetIsIsolated('not-a-url')).toThrow('valid connection URL');
    expect(() => assertRestoreTargetIsIsolated('mysql://root@127.0.0.1:55432/db')).toThrow(
      'postgresql://',
    );
  });
});

describe('restore apply path', () => {
  it('runs schema.sql and data.sql with ON_ERROR_STOP and a credential-free conninfo', async () => {
    const executed: Array<{ args: string[]; env: Record<string, string> }> = [];
    const written: string[] = [];
    const summary = await restoreSupabaseArtifacts({
      artifacts,
      connectionUrl: drillTarget,
      directory: 'C:\\tmp\\drill',
      execute: async (argumentsList, environment) => {
        executed.push({ args: argumentsList, env: environment });
      },
      writeFile: async (path) => {
        written.push(path);
      },
    });

    expect(summary.restoredArtifacts).toEqual(['schema.sql', 'data.sql']);
    expect(summary.connectionPort).toBe(55432);
    expect(executed).toHaveLength(2);
    for (const { args, env } of executed) {
      expect(args.slice(0, 3)).toEqual(['--no-psqlrc', '--set', 'ON_ERROR_STOP=1']);
      expect(args[3]).toBe('--dbname');
      expect(args[4]).not.toContain('postgres:postgres');
      expect(args[4]).toBe('host=127.0.0.1 port=55432 user=postgres dbname=postgres');
      expect(env).toEqual({ PGPASSWORD: 'postgres' });
    }
    expect(written).toEqual(['C:/tmp/drill/schema.sql', 'C:/tmp/drill/data.sql']);
  });

  it('omits PGPASSWORD when the target URL carries no password', async () => {
    const environments: Array<Record<string, string>> = [];
    await restoreSupabaseArtifacts({
      artifacts,
      connectionUrl: 'postgresql://127.0.0.1:55432/postgres',
      directory: 'C:\\tmp\\drill',
      execute: async (_argumentsList, environment) => {
        environments.push(environment);
      },
      writeFile: async () => undefined,
    });
    expect(environments[0]).toEqual({});
  });

  it('refuses an artifact set without schema.sql or data.sql', async () => {
    await expect(
      restoreSupabaseArtifacts({
        artifacts: [{ name: 'data.sql', plaintext: Buffer.from('INSERT;', 'utf8') }],
        connectionUrl: drillTarget,
        directory: 'C:\\tmp\\drill',
        execute: async () => undefined,
        writeFile: async () => undefined,
      }),
    ).rejects.toThrow('Restore requires schema.sql and data.sql');
  });

  it('refuses empty artifacts', async () => {
    await expect(
      restoreSupabaseArtifacts({
        artifacts: [
          { name: 'schema.sql', plaintext: Buffer.from('CREATE TABLE t (id uuid);', 'utf8') },
          { name: 'data.sql', plaintext: Buffer.alloc(0) },
        ],
        connectionUrl: drillTarget,
        directory: 'C:\\tmp\\drill',
        execute: async () => undefined,
        writeFile: async () => undefined,
      }),
    ).rejects.toThrow('duplicates or empty');
  });

  it('never reaches psql when the target is not isolated', async () => {
    let executeCalled = false;
    await expect(
      restoreSupabaseArtifacts({
        artifacts,
        connectionUrl: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
        directory: 'C:\\tmp\\drill',
        execute: async () => {
          executeCalled = true;
        },
        writeFile: async () => undefined,
      }),
    ).rejects.toThrow('must use port 55432');
    expect(executeCalled).toBe(false);
  });
});
