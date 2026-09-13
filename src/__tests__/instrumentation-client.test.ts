import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const instrumentationClient = readFileSync(resolve(process.cwd(), 'src/instrumentation-client.ts'), 'utf8');
const nextConfig = readFileSync(resolve(process.cwd(), 'next.config.ts'), 'utf8');

describe('instrumentation-client Sentry bootstrap', () => {
  it('defers the Sentry client until the browser is idle after load', () => {
    expect(instrumentationClient).toContain("import('@sentry/nextjs')");
    expect(instrumentationClient).toContain('requestIdleCallback');
    expect(instrumentationClient).not.toContain("import * as Sentry from '@sentry/nextjs'");
  });
});


describe('Sentry build configuration', () => {
  it('keeps navigation tracing disabled without emitting a build warning', () => {
    expect(nextConfig).toContain('suppressOnRouterTransitionStartWarning: true');
  });
});
