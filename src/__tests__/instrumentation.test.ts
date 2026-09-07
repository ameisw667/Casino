import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// T_SECURITY_HARDENING/03_env_secrets_schema.md L4 — regression guard for the actual call site,
// not just assertCoreEnv() in isolation (src/lib/__tests__/env.test.ts already covers that). A
// future edit that silently removes the assertCoreEnv() call from instrumentation.ts's register()
// would previously have gone undetected by any test.
vi.mock('@sentry/nextjs', () => ({
  init: vi.fn(),
  captureRequestError: vi.fn(),
}));
vi.mock('../../sentry.server.config', () => ({}));
vi.mock('../../sentry.edge.config', () => ({}));

const assertCoreEnvMock = vi.fn();
vi.mock('../lib/env', () => ({
  assertCoreEnv: assertCoreEnvMock,
}));

describe('instrumentation.ts register() (03_env_secrets_schema L4)', () => {
  const originalRuntime = process.env.NEXT_RUNTIME;

  beforeEach(() => {
    vi.resetModules();
    assertCoreEnvMock.mockClear();
  });

  afterEach(() => {
    process.env.NEXT_RUNTIME = originalRuntime;
  });

  it('calls assertCoreEnv() when NEXT_RUNTIME is nodejs', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';
    const { register } = await import('../instrumentation');
    await register();
    expect(assertCoreEnvMock).toHaveBeenCalledTimes(1);
  });

  it('does not call assertCoreEnv() when NEXT_RUNTIME is edge', async () => {
    process.env.NEXT_RUNTIME = 'edge';
    const { register } = await import('../instrumentation');
    await register();
    expect(assertCoreEnvMock).not.toHaveBeenCalled();
  });
});
