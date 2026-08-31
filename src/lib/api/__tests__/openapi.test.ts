import { describe, expect, it } from 'vitest';
import { getOpenApiSpec } from '../openapi';

describe('OpenAPI 3.1 Specification Suite', () => {
  it('generates a valid OpenAPI 3.1 document structure', () => {
    const spec = getOpenApiSpec();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info.title).toBe('Casino Royale API');
    expect(spec.info.version).toBe('1.0.0');
    expect(spec.servers).toBeInstanceOf(Array);
    expect(spec.servers.length).toBeGreaterThan(0);
  });

  it('includes standard response envelope schemas', () => {
    const spec = getOpenApiSpec();
    expect(spec.components.schemas.ApiSuccessEnvelope).toBeDefined();
    expect(spec.components.schemas.ApiErrorEnvelope).toBeDefined();
    expect(spec.components.schemas.WalletSnapshot).toBeDefined();
  });

  it('includes required security schemes (CookieAuth & IdempotencyKey)', () => {
    const spec = getOpenApiSpec();
    expect(spec.components.securitySchemes.CookieAuth).toBeDefined();
    expect(spec.components.securitySchemes.IdempotencyKey).toBeDefined();
  });

  it('declares core paths across all major categories', () => {
    const spec = getOpenApiSpec();
    expect(spec.paths['/api/health']).toBeDefined();
    expect(spec.paths['/api/casino/bet']).toBeDefined();
    expect(spec.paths['/api/user/balance']).toBeDefined();
    expect(spec.paths['/api/leaderboard']).toBeDefined();
    expect(spec.paths['/api/admin/overview']).toBeDefined();
    expect(spec.paths['/api/chat/bot-response']).toBeDefined();
  });
});
