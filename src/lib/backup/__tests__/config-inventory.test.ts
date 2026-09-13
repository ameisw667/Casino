import { describe, expect, it, vi } from 'vitest';
import { assertInventoryHasNoSecrets, buildConfigInventory } from '@/lib/backup/config-inventory';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('buildConfigInventory', () => {
  it('extracts only safe auth flags, extensions and endpoint availability', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({
          external_google_enabled: true,
          external_email_enabled: true,
          disable_signup: false,
          jwt_expiry: 3600,
          jwt_secret: 'never-should-appear',
          smtp_pass: 'never-should-appear',
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse([
          { name: 'pgcrypto', installed_version: '1.10', enabled: true, schema: 'extensions' },
          {
            name: 'pg_cron',
            installed_version: '1.6',
            enabled: true,
            schema: 'pg_catalog',
            some_private_field: 'drop',
          },
        ]),
      )
      .mockResolvedValueOnce(jsonResponse({ max_concurrent_users: 200 }, 404));

    const inventory = await buildConfigInventory({
      projectRef: 'hmqwozhdckbwjqzcmire',
      accessToken: 'test-token',
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: new Date('2026-09-13T20:00:00.000Z'),
    });

    expect(inventory.auth).toEqual({
      external_google_enabled: true,
      external_email_enabled: true,
      disable_signup: false,
      jwt_expiry: 3600,
    });
    expect(inventory.extensions).toEqual([
      { name: 'pgcrypto', installed_version: '1.10', enabled: true, schema: 'extensions' },
      { name: 'pg_cron', installed_version: '1.6', enabled: true, schema: 'pg_catalog' },
    ]);
    expect(inventory.endpointAvailability).toEqual({
      auth: true,
      extensions: true,
      realtime: false,
    });
    expect(JSON.stringify(inventory)).not.toContain('never-should-appear');
  });

  it('fails closed when the auth settings endpoint is unavailable', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 500));

    await expect(
      buildConfigInventory({
        projectRef: 'hmqwozhdckbwjqzcmire',
        accessToken: 'test-token',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/auth settings endpoint unavailable/i);
  });
});

describe('assertInventoryHasNoSecrets', () => {
  it('aborts on a secret-like key anywhere in the tree', () => {
    expect(() =>
      assertInventoryHasNoSecrets({ auth: { external_google_enabled: true, smtp_token: 'x' } }),
    ).toThrow(/smtp_token/);
  });

  it('aborts on a long base64-like value', () => {
    expect(() =>
      assertInventoryHasNoSecrets({
        extensions: [{ name: 'x'.repeat(70) + '/==' }],
      }),
    ).toThrow(/secret-like value/);
  });

  it('passes a safe inventory', () => {
    expect(() =>
      assertInventoryHasNoSecrets({
        auth: { external_google_enabled: true, jwt_expiry: 3600 },
        extensions: [{ name: 'pgcrypto', installed_version: '1.10' }],
      }),
    ).not.toThrow();
  });
});
