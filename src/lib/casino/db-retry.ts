/**
 * Retry-/Backoff-Logik für transiente DB-Verbindungsfehler (Säule 8 L6,
 * T_DATABASE/08_database_connection_pooling.md).
 *
 * Hintergrund: postgrest-js 2.x retryt eingebaute GET/HEAD-Abrufe selbst, aber
 * NICHT POST — und alle Geld-RPCs (`settle_game_bet`, `start_game_round`,
 * `settle_game_round`, `consume_active_seed`) laufen über POST. Ein kurzzeitiger
 * Pooler-/Verbindungsfehler landet dadurch sofort als 500 beim Spieler.
 *
 * Sicherheit: Jeder Retry ruft denselben RPC mit DERSSELBEN `request_id` erneut
 * auf — die bestehende Idempotenz der RPCs (`pg_advisory_xact_lock` + Replay des
 * gecachten Snapshots, siehe xx_sop/09_security_wallet_invariants.md) macht das
 * ohne Doppel-Buchungsrisiko.
 *
 * Klassifikation (konservativ, fail-closed):
 *  - Retry nur bei Netzwerk-Verbindungsfehlern (postgrest-js formt sie als
 *    `FetchError:`/`TypeError: fetch failed` mit leerem `code` und `status 0` ab).
 *  - NIEMALS Retry bei Geschäftslogik-/DB-Errors mit echtem Postgres-Errorcode
 *    (z. B. P0001 INSUFFICIENT_BALANCE, 42501) — ein Retry auf einen echten
 *    Ablehnungsgrund wäre ein Bug.
 *  - NIEMALS Retry bei Abort/Timeout (ein gehängter RPC könnte committet haben;
 *    die Antwort bleibt fail-closed 500 wie bisher).
 */
interface ConnectionLikeError {
  message?: unknown;
  name?: unknown;
  cause?: unknown;
}

/** Postgres-/OS-Verbindungsfehlercodes, die als transient klassifiziert werden. */
const CONNECTION_CAUSE_CODES: ReadonlySet<string> = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ENOTFOUND',
  'UND_ERR_SOCKET',
  'EPIPE',
]);

export const CONNECTION_RETRY_MAX_ATTEMPTS = 2;
export const CONNECTION_RETRY_BACKOFF_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message =
    error instanceof Error ? error.message : String((error as ConnectionLikeError).message ?? '');
  if (typeof message !== 'string' || message.length === 0) return false;

  // Abort/Timeout immer ausschließen, bevor der Prefix-Match greift. Explizit auch
  // `TimeoutError` (DOMException aus AbortSignal.timeout()) — korrektheitshalber nicht
  // nur "über die Negative-Match-Lücke", sondern als eigene Ausschlussregel.
  const name = (error as ConnectionLikeError).name;
  if (
    name === 'AbortError' ||
    name === 'TimeoutError' ||
    message.includes('This operation was aborted') ||
    message.includes('aborted due to timeout')
  ) {
    return false;
  }

  // postgrest-js überformt Netzwerkfehler zu "<Name>: <Text>" mit leerem code:
  // POST-Netzwerkfehler werden geworfen (RETRYABLE_METHODS enthält kein POST) und
  // im .catch des Builders in genau dieses Result-Shape übersetzt.
  const isPostgrestNetworkShape =
    message.startsWith('FetchError:') ||
    (message.startsWith('TypeError:') && message.includes('fetch failed'));

  if (isPostgrestNetworkShape) return true;

  // Direkt geworfene undurchformte Fehler (z. B. aus fetch selbst): cause-Codes prüfen.
  const cause = (error as ConnectionLikeError).cause as { code?: unknown } | undefined;
  if (cause && typeof cause.code === 'string' && CONNECTION_CAUSE_CODES.has(cause.code))
    return true;

  for (const code of CONNECTION_CAUSE_CODES) {
    if (message.includes(code)) return true;
  }
  return false;
}

interface SupabaseRpcResultLike<TData = unknown> {
  data: TData;
  error: { message: string } | null;
}

export interface ConnectionRetryOptions {
  /** Test-Injektion; produktiv wird CONNECTION_RETRY_BACKOFF_MS verwendet. */
  backoffMs?: number;
}

/**
 * Führt `fn` aus und wiederholt sie GENAU EINMAL (CONNECTION_RETRY_MAX_ATTEMPTS)
 * mit kurzem Backoff, wenn der erste Versuch einen Verbindungsfehler liefert (im
 * Result-`error` oder als Throw). Der zweite Versuch läuft gegen dieselbe
 * Idempotenz-`request_id`. Bei Erschöpfung wird der letzte Zustand unverändert
 * fail-closed durchgereicht — nie ein Fehler in einen Erfolg umgedeutet.
 */
export async function withConnectionRetry<TData>(
  fn: () => PromiseLike<SupabaseRpcResultLike<TData>>,
  options: ConnectionRetryOptions = {},
): Promise<SupabaseRpcResultLike<TData>> {
  let lastResult: SupabaseRpcResultLike<TData> | null = null;
  let lastThrown: unknown = null;

  for (let attempt = 1; attempt <= CONNECTION_RETRY_MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      await sleep(options.backoffMs ?? CONNECTION_RETRY_BACKOFF_MS);
    }
    lastThrown = null;
    try {
      lastResult = await fn();
      if (!lastResult.error || !isConnectionError(lastResult.error)) return lastResult;
    } catch (error) {
      if (!isConnectionError(error)) throw error;
      lastThrown = error;
    }
  }

  if (lastThrown !== null) throw lastThrown;
  if (lastResult !== null) return lastResult;
  throw new Error('withConnectionRetry: Retry-Attempts erschöpft ohne Ergebnis');
}
