import { vi } from 'vitest';

interface QueryResult<T = unknown> {
  data: T;
  error: unknown;
}

export interface SupabaseMockState {
  upsertResult: { error: unknown };
  singleResult: QueryResult;
  maybeSingleResult: QueryResult;
  // Resolves when the builder itself is awaited directly (no terminal single/maybeSingle/upsert
  // call) — matches the real supabase-js builder, which is thenable after e.g. .limit().
  listResult: QueryResult;
  rpcResult: QueryResult;
}

export interface SupabaseMock {
  client: {
    from: ReturnType<typeof vi.fn>;
    rpc: ReturnType<typeof vi.fn>;
  };
  builder: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    limit: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
    maybeSingle: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    then: <TResult1 = QueryResult, TResult2 = never>(
      onFulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) => Promise<TResult1 | TResult2>;
  };
  state: SupabaseMockState;
}

/**
 * Minimal chainable stand-in for the supabase-js query builder used by wallet.ts.
 * `.from()` always returns the same builder; terminal calls (single/maybeSingle/upsert)
 * resolve whatever the test wrote into `state` just before invoking the method under test.
 * The builder is itself thenable (resolving `state.listResult`), matching real supabase-js
 * calls that are awaited directly after e.g. `.limit()` without an explicit terminal method.
 */
export function createSupabaseMock(): SupabaseMock {
  const state: SupabaseMockState = {
    upsertResult: { error: null },
    singleResult: { data: null, error: null },
    maybeSingleResult: { data: null, error: null },
    listResult: { data: [], error: null },
    rpcResult: { data: null, error: null },
  };

  const builder: SupabaseMock['builder'] = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(state.singleResult)),
    maybeSingle: vi.fn(() => Promise.resolve(state.maybeSingleResult)),
    upsert: vi.fn(() => Promise.resolve(state.upsertResult)),
    update: vi.fn(() => builder),
    then: (onFulfilled, onRejected) =>
      Promise.resolve(state.listResult).then(onFulfilled, onRejected),
  };

  const client: SupabaseMock['client'] = {
    from: vi.fn(() => builder),
    rpc: vi.fn(() => Promise.resolve(state.rpcResult)),
  };

  return { client, builder, state };
}
