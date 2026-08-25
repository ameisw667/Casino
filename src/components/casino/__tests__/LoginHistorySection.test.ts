import { describe, expect, it } from 'vitest';
import { maskIpAddress, parseDeviceInfo } from '@/lib/security/login-audit-types';

describe('LoginHistorySection helpers & data mapping', () => {
  it('correctly maps various auth methods and devices', () => {
    const testRecord = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'test-user',
      authMethod: 'passkey' as const,
      deviceInfo: parseDeviceInfo('Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15'),
      ipMasked: maskIpAddress('85.214.132.19'),
      status: 'success' as const,
      createdAt: new Date().toISOString(),
    };

    expect(testRecord.authMethod).toBe('passkey');
    expect(testRecord.deviceInfo).toContain('iOS');
    expect(testRecord.ipMasked).toBe('85.214.***.***');
    expect(testRecord.status).toBe('success');
  });
});
