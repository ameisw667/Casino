import { describe, expect, it } from 'vitest';
import { maskIpAddress, parseDeviceInfo } from '../login-audit-types';

describe('Login Audit helpers', () => {
  describe('maskIpAddress', () => {
    it('masks IPv4 addresses according to GDPR rules', () => {
      expect(maskIpAddress('192.168.1.55')).toBe('192.168.***.***');
      expect(maskIpAddress('85.214.132.19')).toBe('85.214.***.***');
    });

    it('masks IPv6 addresses correctly', () => {
      expect(maskIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:0db8:****');
      expect(maskIpAddress('2a02:8108:92c0:4b00:1234:5678:9abc:def0')).toBe('2a02:8108:****');
    });

    it('returns safe fallback for invalid or null IPs', () => {
      expect(maskIpAddress(null)).toBe('Unbekannt');
      expect(maskIpAddress('')).toBe('Unbekannt');
      expect(maskIpAddress('invalid-ip')).toBe('127.0.***.***');
    });
  });

  describe('parseDeviceInfo', () => {
    it('identifies Windows and Chrome', () => {
      const ua =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
      expect(parseDeviceInfo(ua)).toBe('Windows · Chrome');
    });

    it('identifies macOS and Safari', () => {
      const ua =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15';
      expect(parseDeviceInfo(ua)).toBe('macOS · Safari');
    });

    it('identifies iOS and Safari on iPhone', () => {
      const ua =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
      expect(parseDeviceInfo(ua)).toBe('iOS · Safari');
    });

    it('identifies Android and Chrome', () => {
      const ua =
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36';
      expect(parseDeviceInfo(ua)).toBe('Android · Chrome');
    });

    it('falls back gracefully on empty or unknown User-Agents', () => {
      expect(parseDeviceInfo(null)).toBe('Unbekanntes Gerät');
      expect(parseDeviceInfo('')).toBe('Unbekanntes Gerät');
    });
  });
});
