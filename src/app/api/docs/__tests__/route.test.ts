import { describe, expect, it } from 'vitest';
import { GET as getDocs } from '../route';
import { GET as getOpenApiJson } from '../../openapi.json/route';

describe('API Documentation Routes (/api/docs & /api/openapi.json)', () => {
  it('GET /api/openapi.json returns valid JSON specification', async () => {
    const res = await getOpenApiJson();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    const data = await res.json();
    expect(data.openapi).toBe('3.1.0');
    expect(data.info.title).toBe('Casino Royale API');
  });

  it('GET /api/docs returns Scalar interactive HTML documentation', async () => {
    const res = await getDocs();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('Casino Royale — API Dokumentation');
    expect(html).toContain('@scalar/api-reference');
    expect(html).toContain('/api/openapi.json');
  });
});
