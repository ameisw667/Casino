import { describe, expect, it } from 'vitest';
import { loadDesignAssetsEnv, redactApiKey } from '../env';

describe('design-assets env', () => {
  it('applies default budget and cost-per-image values when unset', () => {
    const env = loadDesignAssetsEnv({ OPENAI_API_KEY: 'sk-test' });

    expect(env.DESIGN_ASSETS_MAX_SPEND_USD).toBe(5);
    expect(env.DESIGN_ASSETS_MONTHLY_BUDGET_USD).toBe(20);
    expect(env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD).toBe(0.25);
  });

  it('parses explicit overrides from process.env strings', () => {
    const env = loadDesignAssetsEnv({
      OPENAI_API_KEY: 'sk-test',
      DESIGN_ASSETS_MAX_SPEND_USD: '10',
      DESIGN_ASSETS_MONTHLY_BUDGET_USD: '50',
      DESIGN_ASSETS_EST_COST_PER_IMAGE_USD: '0.5',
    });

    expect(env.DESIGN_ASSETS_MAX_SPEND_USD).toBe(10);
    expect(env.DESIGN_ASSETS_MONTHLY_BUDGET_USD).toBe(50);
    expect(env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD).toBe(0.5);
  });

  it('fails fast when OPENAI_API_KEY is missing', () => {
    expect(() => loadDesignAssetsEnv({})).toThrow('Ungültige Design-Assets-Konfiguration');
  });

  it('redacts an API key so it is never fully printable', () => {
    expect(redactApiKey('sk-proj-abcdef123456')).toBe('sk-***56');
  });
});
