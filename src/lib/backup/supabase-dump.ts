export type PlaintextBackupArtifact = {
  name: string;
  plaintext: Buffer;
};

type CliExecutor = (argumentsList: string[]) => Promise<void>;
type ArtifactReader = (path: string) => Promise<Buffer>;

function artifactPath(directory: string, filename: string): string {
  return `${directory.replace(/\\/g, '/').replace(/\/$/, '')}/${filename}`;
}

export async function dumpSupabaseArtifacts(input: {
  directory: string;
  execute: CliExecutor;
  readFile: ArtifactReader;
  includeRoles: boolean;
}): Promise<PlaintextBackupArtifact[]> {
  const dumpArguments = ['--no-install', 'supabase', 'db', 'dump', '--linked'];
  const requested = [
    { name: 'schema.sql', args: [...dumpArguments] },
    { name: 'data.sql', args: [...dumpArguments, '--data-only'] },
    ...(input.includeRoles ? [{ name: 'roles.sql', args: [...dumpArguments, '--role-only'] }] : []),
  ];

  const artifacts: PlaintextBackupArtifact[] = [];
  for (const request of requested) {
    const path = artifactPath(input.directory, request.name);
    await input.execute([...request.args, '--file', path]);
    artifacts.push({ name: request.name, plaintext: await input.readFile(path) });
  }
  return artifacts;
}
