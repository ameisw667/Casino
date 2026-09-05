import { describe, expect, it, vi } from 'vitest';
import { dumpSupabaseArtifacts } from '@/lib/backup/supabase-dump';

describe('Supabase logical dump adapter', () => {
  it('requests separate schema and data artifacts without enabling role export by default', async () => {
    const execute = vi.fn(async () => undefined);
    const readFile = vi.fn(async (path: string) =>
      Buffer.from(path.endsWith('schema.sql') ? 'schema' : 'data'),
    );

    const artifacts = await dumpSupabaseArtifacts({
      directory: 'C:/safe-temporary-directory',
      execute,
      readFile,
      includeRoles: false,
    });

    expect(artifacts.map((artifact) => artifact.name)).toEqual(['schema.sql', 'data.sql']);
    expect(execute).toHaveBeenCalledTimes(2);
    expect(execute).toHaveBeenNthCalledWith(1, [
      '--no-install',
      'supabase',
      'db',
      'dump',
      '--linked',
      '--file',
      'C:/safe-temporary-directory/schema.sql',
    ]);
    expect(execute).toHaveBeenNthCalledWith(2, [
      '--no-install',
      'supabase',
      'db',
      'dump',
      '--linked',
      '--data-only',
      '--file',
      'C:/safe-temporary-directory/data.sql',
    ]);
  });
});
