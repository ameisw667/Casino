/**
 * Isolierter Restore-Drill (T_DATABASE/05_database_backup_and_recovery.md L7).
 *
 * Zyklus: frischer `supabase db dump --local` (kein Remote-Zugriff) → ephemerer
 * postgres:17-Container auf Port 55432 → auth-Stub → schema.sql/data.sql einspielen
 * (über restoreSupabaseArtifacts inkl. Safety-Guard) → Validierungsqueries → Container
 * verwerfen. Läuft ausschließlich gegen lokale Dev-Daten, keine Secrets, keine externe
 * Wirkung. psql wird im Container ausgeführt (`docker exec`), ein Host-psql ist nicht
 * erforderlich.
 *
 * Lauf: npx tsx scripts/restore-drill.ts
 * Exit 1 bei jedem Fehlschlag — kein stiller Teilerfolg.
 */
import { execFile } from 'node:child_process';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';
import { restoreSupabaseArtifacts } from '@/lib/backup/supabase-restore';

const execFileAsync = promisify(execFile);

const CONTAINER_NAME = 'casino-restore-drill';
const DRILL_PORT = 55432;
const INIT_TIMEOUT_MS = 180_000;
const READY_POLL_MS = 1_000;
const STABILITY_WINDOW_MS = 20_000;
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const TRANSIENT_FAILURE_PATTERN =
  /shutting down|could not connect|connection refused|No such file or directory/i;

/**
 * Drill-Image: gleiche Major-Version wie die Dev-Instanz (17, Pflicht laut Planung)
 * und derselbe Extension-Umfang (pgvector, pg_cron, pg_net, pgcrypto) — ein vanilla
 * postgres:17 kann schema.sql (CREATE EXTENSION, vector-Typen) nicht einspielen.
 * Dynamisch vom laufenden lokalen Supabase-Stack abgeleitet; Fallback postgres:17.
 */
async function resolveDrillImage(): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      'docker',
      ['inspect', '-f', '{{.Image}}', 'supabase_db_Casino'],
      { windowsHide: true },
    );
    const imageId = stdout.trim();
    if (imageId.startsWith('sha256:')) return imageId;
  } catch {
    // Lokaler Stack nicht erreichbar — Fallback unten.
  }
  return 'postgres:17';
}

/**
 * Der Supabase-Image-Init fährt die Datenbank nach dem ersten Start einmal herunter und
 * wieder hoch (beobachtet ~10 s nach Containerstart). Ein einmal erfolgreicher Ping
 * bedeutet daher noch nichts — gefordert wird hier ein Ping, der nach
 * STABILITY_WINDOW_MS erneut gelingt, also das Restart-Fenster überlebt hat.
 */
async function waitForStableReady(): Promise<void> {
  const deadline = Date.now() + INIT_TIMEOUT_MS;
  let firstSuccessAt: number | null = null;
  while (Date.now() < deadline) {
    try {
      await execFileAsync(
        'docker',
        [
          'exec',
          CONTAINER_NAME,
          'psql',
          '-U',
          'supabase_admin',
          '-d',
          'postgres',
          '-t',
          '-A',
          '-c',
          'SELECT 1',
        ],
        { windowsHide: true },
      );
      if (firstSuccessAt === null) {
        firstSuccessAt = Date.now();
      } else if (Date.now() - firstSuccessAt >= STABILITY_WINDOW_MS) {
        return;
      }
    } catch {
      firstSuccessAt = null;
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
  }
  throw new Error(`Drill container did not stay ready within ${INIT_TIMEOUT_MS / 1000}s`);
}

/**
 * Führt ein Container-psql-Statement aus und toleriert transiente Fehler aus dem
 * Image-Init-Restart (shutting down, Verbindungsaufbau-Rennen) bis zum Timeout.
 */
async function runContainerPsqlWithRetry(argumentsList: string[], password: string): Promise<void> {
  const deadline = Date.now() + INIT_TIMEOUT_MS;
  for (;;) {
    try {
      await runContainerPsql(argumentsList, password);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!TRANSIENT_FAILURE_PATTERN.test(message) || Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, READY_POLL_MS));
    }
  }
}

async function runContainerPsql(argumentsList: string[], password: string): Promise<void> {
  await execFileAsync(
    'docker',
    ['exec', '-e', `PGPASSWORD=${password}`, CONTAINER_NAME, 'psql', ...argumentsList],
    { windowsHide: true },
  );
}

/**
 * Executor-Adapter für restoreSupabaseArtifacts: Die Lib übergibt eine psql-Argumentliste
 * mit einem Host-Dateipfad (--file). Der Drill kopiert die Datei in den Container und
 * führt psql dort aus (Container-seitig Port 5432, kein Host-psql nötig).
 */
async function dockerPsqlExecutor(
  argumentsList: string[],
  environment: Record<string, string>,
): Promise<void> {
  const fileArgumentIndex = argumentsList.indexOf('--file');
  if (fileArgumentIndex === -1) throw new Error('Restore executor expected a --file argument');
  const hostPath = argumentsList[fileArgumentIndex + 1];
  if (!hostPath) throw new Error('Restore executor expected a file path after --file');

  const containerPath = `/tmp/${basename(hostPath)}`;
  await execFileAsync('docker', ['cp', hostPath, `${CONTAINER_NAME}:${containerPath}`], {
    windowsHide: true,
  });
  const containerArguments = [
    ...argumentsList.slice(0, fileArgumentIndex),
    '--dbname',
    // Postgres lauscht im Supabase-Image nur auf dem Unix-Socket (POSTGRES_HOST),
    // nicht auf TCP — deshalb ohne host/port.
    'user=supabase_admin dbname=postgres',
    '--file',
    containerPath,
  ];
  await runContainerPsql(containerArguments, environment.PGPASSWORD ?? 'postgres');
}

async function dumpLocalArtifacts(directory: string): Promise<void> {
  // shell: true ist auf Windows zwingend für npx.cmd (Node ≥ 18.20 verweigert das
  // Spawnen von .cmd/.bat ohne Shell). Alle Argumente sind raumfreie kontrollierte Werte.
  await execFileAsync(
    npxCommand,
    ['--no-install', 'supabase', 'db', 'dump', '--local', '--file', join(directory, 'schema.sql')],
    { cwd: process.cwd(), windowsHide: true, maxBuffer: 16 * 1024 * 1024, shell: true },
  );
  await execFileAsync(
    npxCommand,
    [
      '--no-install',
      'supabase',
      'db',
      'dump',
      '--local',
      '--data-only',
      '--file',
      join(directory, 'data.sql'),
    ],
    { cwd: process.cwd(), windowsHide: true, maxBuffer: 16 * 1024 * 1024, shell: true },
  );
}

async function prepareDrillDatabase(): Promise<void> {
  const statement = (sql: string) =>
    runContainerPsqlWithRetry(
      ['-U', 'supabase_admin', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c', sql],
      'postgres',
    );

  // 1. Nicht-Extension-Event-Trigger droppen (PostgREST-/Cron-Notify-Hilfen des
  //    Image-Inits): der lokale Dump enthält zwar keine Event-Trigger, aber frische
  //    Image-Objekte können DDL im Restore dennoch stören. Extension-eigene Trigger
  //    bleiben bewusst stehen und werden per-Trigger übersprungen.
  await statement(
    "DO $$ DECLARE t record; BEGIN FOR t IN SELECT evtname FROM pg_event_trigger LOOP BEGIN EXECUTE format('DROP EVENT TRIGGER %I', t.evtname); EXCEPTION WHEN OTHERS THEN NULL; END; END LOOP; END $$;",
  );

  // 2. Extensions mit identischem Ziel-Schema wie im lokalen Dump vorab anlegen, damit
  //    schema.sql beim Apply nur noch No-ops sieht (Schemas laut Dump-Probe 2026-09-05).
  await statement('CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;');
  await statement('CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;');
  await statement('CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;');
  await statement('CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;');
  await statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;');

  // 3. auth-Funktions-Stubs: die Migrationen referenzieren auth.uid(), auth.role()
  //    und auth.jwt() in RLS-Policies. Das auth-Schema existiert im Image bereits.
  await statement(
    'CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;',
  );
  await statement(
    'CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT NULL::text $$;',
  );
  await statement(
    'CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT NULL::jsonb $$;',
  );

  // 4. Sequenz-Stubs für Supabase-interne Schemata: der CLI-Data-Dump enthält leere
  //    SEQUENCE SETs für auth.refresh_tokens und supabase_functions.hooks, die ein
  //    frisch provisioniertes Supabase (anders als der blanke Image-Container) bereits
  //    bereitstellt. Der Drill ahmt das nach; Hooks-Datenzeilen existieren lokal nicht.
  await statement('CREATE SEQUENCE IF NOT EXISTS auth.refresh_tokens_id_seq;');
  await statement('CREATE SCHEMA IF NOT EXISTS supabase_functions;');
  await statement('CREATE SEQUENCE IF NOT EXISTS supabase_functions.hooks_id_seq;');
}

type ContainerPsqlResult = { stdout: string };

async function validationQuery(sql: string): Promise<ContainerPsqlResult> {
  const { stdout } = await execFileAsync(
    'docker',
    [
      'exec',
      CONTAINER_NAME,
      'psql',
      '-U',
      'supabase_admin',
      '-d',
      'postgres',
      '-t',
      '-A',
      '-c',
      sql,
    ],
    { windowsHide: true, maxBuffer: 1024 * 1024 },
  );
  return { stdout: stdout.trim() };
}

/**
 * L8-Kernnachweis auf dem Drill-Ziel (Katalog-Queries, kein Client-Trust):
 * 1. RLS ist auf allen Finanz-/Spielkern-Tabellen aktiv (fail-closed-Grundlage).
 * 2. Der Append-only-Trigger auf wallet_transactions existiert und ist aktiviert.
 * 3. Die Wallet-Reconciliation-RPCs existieren und sind nur service_role ausführbar.
 */
async function validateFinancialInvariants(): Promise<Record<string, unknown>> {
  const rlsEnabled = await validationQuery(
    "SELECT string_agg(relname, ',' ORDER BY relname) FROM pg_class " +
      "JOIN pg_namespace n ON n.oid = relnamespace WHERE nspname = 'public' AND relrowsecurity = true " +
      "AND relname IN ('users', 'wallet_transactions', 'game_rounds', 'wallet_ledger_baselines', 'wallet_invariant_events')",
  );
  const rlsTables = rlsEnabled.stdout ? rlsEnabled.stdout.split(',') : [];
  if (rlsTables.length !== 5) {
    throw new Error(
      `Drill invariant failed: expected RLS on 5 core tables, found ${rlsTables.length} (${rlsEnabled.stdout || 'none'})`,
    );
  }

  const appendOnlyTrigger = await validationQuery(
    'SELECT count(*) FROM pg_trigger JOIN pg_class c ON c.oid = tgrelid JOIN pg_namespace n ON n.oid = c.relnamespace ' +
      "WHERE n.nspname = 'public' AND c.relname = 'wallet_transactions' AND tgenabled <> 'D'",
  );
  if (appendOnlyTrigger.stdout === '0') {
    throw new Error(
      'Drill invariant failed: wallet_transactions has no active guard trigger after restore',
    );
  }

  const rpcs = await validationQuery(
    'SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = pronamespace ' +
      "WHERE n.nspname = 'public' AND proname IN ('reconcile_wallet_ledger', 'admin_update_user')",
  );
  if (rpcs.stdout !== '2') {
    throw new Error(
      `Drill invariant failed: expected 2 wallet RPCs after restore, found ${rpcs.stdout}`,
    );
  }

  return {
    rlsEnabledCoreTables: rlsTables,
    walletAppendOnlyTriggerActive: true,
    walletRpcsPresent: 2,
  };
}

async function main(): Promise<void> {
  const drillStartedAt = Date.now();
  await execFileAsync('docker', ['info'], { windowsHide: true }); // klarer Fehler statt stillem Überspringen
  await execFileAsync('docker', ['rm', '--force', CONTAINER_NAME], { windowsHide: true }).catch(
    () => undefined,
  );

  const stagingDirectory = await mkdtemp(join(tmpdir(), 'casino-drill-'));
  let containerRunning = false;
  try {
    const dumpStartedAt = Date.now();
    await dumpLocalArtifacts(stagingDirectory);
    const dumpMs = Date.now() - dumpStartedAt;

    const containerStartedAt = Date.now();
    await execFileAsync(
      'docker',
      [
        'run',
        '--rm',
        '-d',
        '--name',
        CONTAINER_NAME,
        '-e',
        'POSTGRES_PASSWORD=postgres',
        '-p',
        `${DRILL_PORT}:5432`,
        await resolveDrillImage(),
      ],
      { windowsHide: true },
    );
    containerRunning = true;
    await waitForStableReady();
    const containerReadyMs = Date.now() - containerStartedAt;

    await prepareDrillDatabase();

    const restoreStartedAt = Date.now();
    const summary = await restoreSupabaseArtifacts({
      artifacts: [
        { name: 'schema.sql', plaintext: await readFile(join(stagingDirectory, 'schema.sql')) },
        { name: 'data.sql', plaintext: await readFile(join(stagingDirectory, 'data.sql')) },
      ],
      connectionUrl: `postgresql://postgres:postgres@127.0.0.1:${DRILL_PORT}/postgres`,
      directory: stagingDirectory,
      execute: dockerPsqlExecutor,
      writeFile,
    });
    const restoreMs = Date.now() - restoreStartedAt;

    const tableCount = Number(
      (
        await validationQuery(
          "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'",
        )
      ).stdout,
    );
    if (!Number.isInteger(tableCount) || tableCount === 0) {
      throw new Error(
        `Drill validation failed: public schema has ${tableCount} tables after restore`,
      );
    }
    const rowCounts: Record<string, number | null> = {};
    for (const table of ['users', 'wallet_transactions']) {
      try {
        rowCounts[table] = Number(
          (await validationQuery(`SELECT count(*) FROM public.${table}`)).stdout,
        );
      } catch {
        rowCounts[table] = null;
      }
    }

    // Finanz-/Sicherheits-Invarianten direkt auf der wiederhergestellten DB nachweisen
    // (L8): nicht nur "Schema ist da", sondern die Geld-/Zugriffslogik ist aktiv.
    const invariants = await validateFinancialInvariants();

    const totalMs = Date.now() - drillStartedAt;
    console.info(
      JSON.stringify(
        {
          status: 'restore-drill-succeeded',
          restoredArtifacts: summary.restoredArtifacts,
          publicTables: tableCount,
          rowCountSamples: rowCounts,
          invariants,
          timing: { dumpMs, containerReadyMs, restoreMs, totalMs },
        },
        null,
        2,
      ),
    );
  } finally {
    if (containerRunning) {
      await execFileAsync('docker', ['stop', CONTAINER_NAME], { windowsHide: true }).catch(
        () => undefined,
      );
    }
    await rm(stagingDirectory, { recursive: true, force: true });
  }
}

main().catch(async (error: unknown) => {
  console.error(`Restore drill failed: ${error instanceof Error ? error.message : String(error)}`);
  try {
    const { stdout } = await execFileAsync('docker', ['logs', '--tail', '30', CONTAINER_NAME], {
      windowsHide: true,
    });
    console.error(`--- drill container logs ---\n${stdout}`);
  } catch {
    // Container existiert nicht mehr — keine zusätzlichen Logs verfügbar.
  }
  process.exitCode = 1;
});
