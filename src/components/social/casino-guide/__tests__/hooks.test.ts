// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { useGuideAttachment } from '../hooks/useGuideAttachment';
import { useGuideVoiceRecorder } from '../hooks/useGuideVoiceRecorder';
import { useGuideChatStream } from '../hooks/useGuideChatStream';

describe('Guide Custom Hooks', () => {
  it('exports valid custom hook functions', () => {
    expect(typeof useGuideAttachment).toBe('function');
    expect(typeof useGuideVoiceRecorder).toBe('function');
    expect(typeof useGuideChatStream).toBe('function');
  });
});
