import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  buildCasinoGuideInstructions,
  buildCasinoGuideRequest,
  buildGuideInputPayload,
} from '../chat-guide';

describe('chat-guide-vision', () => {
  const dummyBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';

  describe('buildCasinoGuideInstructions', () => {
    it('contains visual game screenshot analysis rules', () => {
      const instructions = buildCasinoGuideInstructions(
        { content: 'Guide facts content', sourceVersion: 'test-v1', sourceIds: ['test-source'] },
        null,
      );
      expect(instructions).toContain('MULTIMODAL GAME SCREENSHOT ANALYSIS:');
      expect(instructions).toContain('Blackjack: Identify player hand');
      expect(instructions).toContain('Crash: Identify rocket graph status');
      expect(instructions).toContain('Roulette: Identify winning number');
      expect(instructions).toContain('Slots: Identify reel symbols');
    });
  });

  describe('buildGuideInputPayload with image', () => {
    it('creates multimodal input structure with input_text and input_image when image is provided', () => {
      const payload = buildGuideInputPayload(
        'Was für ein Blatt habe ich hier?',
        [],
        dummyBase64Image,
      );

      expect(payload).toHaveLength(1);
      expect(payload[0]).toEqual({
        role: 'user',
        content: [
          { type: 'input_text', text: 'Was für ein Blatt habe ich hier?' },
          { type: 'input_image', image_url: dummyBase64Image, detail: 'low' },
        ],
      });
    });

    it('creates standard text payload when no image is provided', () => {
      const payload = buildGuideInputPayload('Wie lauten die Blackjack-Regeln?');
      expect(payload).toHaveLength(1);
      expect(payload[0]).toEqual({
        role: 'user',
        content: [{ type: 'input_text', text: 'Wie lauten die Blackjack-Regeln?' }],
      });
    });

    it('includes previous history turns and appends multimodal user turn', () => {
      const history = [
        { role: 'user' as const, content: 'Hallo' },
        { role: 'assistant' as const, content: 'Willkommen im Royale Casino!' },
      ];
      const payload = buildGuideInputPayload('Erklär mir dieses Bild', history, dummyBase64Image);

      expect(payload).toHaveLength(3);
      expect(payload[0]).toEqual({
        role: 'user',
        content: [{ type: 'input_text', text: 'Hallo' }],
      });
      expect(payload[1]).toEqual({
        role: 'assistant',
        content: [{ type: 'output_text', text: 'Willkommen im Royale Casino!' }],
      });
      expect(payload[2]).toEqual({
        role: 'user',
        content: [
          { type: 'input_text', text: 'Erklär mir dieses Bild' },
          { type: 'input_image', image_url: dummyBase64Image, detail: 'low' },
        ],
      });
    });
  });

  describe('buildCasinoGuideRequest with image', () => {
    it('serializes request with input_image payload in body', async () => {
      const req = await buildCasinoGuideRequest(
        'Analysiere diese Runde',
        undefined,
        dummyBase64Image,
      );
      expect(req.url).toContain('api.openai.com');
      const body = JSON.parse(req.init.body as string);
      expect(body.input).toEqual([
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Analysiere diese Runde' },
            { type: 'input_image', image_url: dummyBase64Image, detail: 'low' },
          ],
        },
      ]);
    });
  });
});
