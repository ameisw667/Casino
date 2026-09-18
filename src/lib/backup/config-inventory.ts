/**
 * Säule 9 N5 — Auth-/Realtime-/Extension-Konfigurationsinventar.
 *
 * `supabase db dump` sichert die auth-/Realtime-/Extension-Konfiguration nicht — dieses
 * Modul zieht die read-only Management-API-Endpunkte und filtert auf einen expliziten
 * Safe-Set (Provider-Flags, aktivierte Extensions). Bevor irgendeine Datei geschrieben
 * wird, läuft assertInventoryHasNoSecrets() als automatisierter Selbstcheck: ein Feld
 * mit Secret-ähnlichem Muster bricht fail-closed ab, statt ins Inventar zu geraten.
 */

const SECRET_KEY_PATTERN = /(secret|token|password|credential|api_key|apikey|dsn|private_key)/i;
const SECRET_VALUE_PATTERN = /[A-Za-z0-9+/=]{64,}/;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const AUTH_KEEP_EXACT = new Set([
  'disable_signup',
  'mailer_autoconfirm',
  'phone_autoconfirm',
  'mailer_otp_exp',
  'otp_length',
  'max_email_limit',
  'jwt_expiry',
  'refresh_token_reuse_interval',
]);

const EXTENSION_KEEP = new Set([
  'name',
  'installed_version',
  'enabled',
  'schema',
  'version',
  'default_version',
]);

const REALTIME_KEEP_EXACT = new Set(['max_concurrent_users', 'max_events_per_second']);

function keepAuthSetting(value: [string, unknown]): boolean {
  const [key, entry] = value;
  if (typeof entry !== 'boolean' && typeof entry !== 'number') return false;
  return key.endsWith('_enabled') || AUTH_KEEP_EXACT.has(key);
}

function keepExtensionSetting(value: [string, unknown]): boolean {
  return EXTENSION_KEEP.has(value[0]);
}

function keepRealtimeSetting(value: [string, unknown]): boolean {
  const [key, entry] = value;
  if (typeof entry !== 'boolean' && typeof entry !== 'number') return false;
  return key.endsWith('_enabled') || REALTIME_KEEP_EXACT.has(key);
}

function filterRecord(record: unknown, keep: (entry: [string, unknown]) => boolean): JsonRecord {
  if (!isRecord(record)) return {};
  return Object.fromEntries(Object.entries(record).filter(keep));
}

export function assertInventoryHasNoSecrets(inventory: JsonRecord): void {
  const violations: string[] = [];
  const visit = (path: string, value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(`${path}[${index}]`, entry));
      return;
    }
    if (isRecord(value)) {
      for (const [key, entry] of Object.entries(value)) {
        const childPath = `${path}.${key}`;
        if (SECRET_KEY_PATTERN.test(key)) {
          violations.push(`secret-like key: ${childPath}`);
          continue;
        }
        visit(childPath, entry);
      }
      return;
    }
    if (typeof value === 'string' && SECRET_VALUE_PATTERN.test(value)) {
      violations.push(`secret-like value at: ${path}`);
    }
  };
  visit('inventory', inventory);

  if (violations.length > 0) {
    throw new Error(
      `Config inventory self-check failed — refusing to write (secret-like fields found: ${violations.join(
        '; ',
      )})`,
    );
  }
}

export type ConfigInventory = JsonRecord & {
  generatedAt: string;
  projectRef: string;
  auth: JsonRecord;
  extensions: Array<JsonRecord>;
  realtime: JsonRecord;
  endpointAvailability: JsonRecord;
};

export async function buildConfigInventory(input: {
  projectRef: string;
  accessToken: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  now?: Date;
}): Promise<ConfigInventory> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const apiBaseUrl = input.apiBaseUrl ?? 'https://api.supabase.com/v1';

  const readEndpoint = async (
    label: string,
    path: string,
  ): Promise<{ available: boolean; payload: unknown; error?: string }> => {
    const response = await fetchImpl(`${apiBaseUrl}${path}`, {
      headers: { Authorization: `Bearer ${input.accessToken}` },
    });
    if (response.status === 404) {
      return { available: false, payload: null, error: 'endpoint not available (404)' };
    }
    if (!response.ok) {
      return { available: false, payload: null, error: `HTTP ${response.status}` };
    }
    return { available: true, payload: await response.json() };
  };

  const auth = await readEndpoint('auth-config', `/projects/${input.projectRef}/config/auth`);
  const extensions = await readEndpoint(
    'extensions',
    `/projects/${input.projectRef}/database/extensions`,
  );
  const realtime = await readEndpoint(
    'realtime',
    `/projects/${input.projectRef}/realtime/settings`,
  );

  if (!auth.available) {
    throw new Error(
      `Config inventory failed: auth settings endpoint unavailable (${
        auth.error ?? 'unknown error'
      })`,
    );
  }

  const inventory: ConfigInventory = {
    generatedAt: (input.now ?? new Date()).toISOString(),
    projectRef: input.projectRef,
    auth: filterRecord(auth.payload, keepAuthSetting),
    extensions: Array.isArray(extensions.payload)
      ? extensions.payload
          .filter(isRecord)
          .map((extension) => filterRecord(extension, keepExtensionSetting))
      : [],
    realtime: realtime.available
      ? filterRecord(realtime.payload, keepRealtimeSetting)
      : { available: false, error: realtime.error },
    endpointAvailability: {
      auth: auth.available,
      extensions: extensions.available,
      realtime: realtime.available,
    },
  };

  assertInventoryHasNoSecrets(inventory);
  return inventory;
}
