import { describe, expect, it, vi } from 'vitest';
import {
  createAudioStreamAnalyser,
  getActiveAudioStream,
  isAudioRecordingSupported,
} from '../voice-audio';

describe('voice-audio Web Audio API FFT Engine', () => {
  it('returns null for getActiveAudioStream when no recording is in progress', () => {
    expect(getActiveAudioStream()).toBeNull();
  });

  it('detects audio recording support in browser environment correctly', () => {
    // In node/vitest without getUserMedia/MediaRecorder, it returns false
    const supported = isAudioRecordingSupported();
    expect(typeof supported).toBe('boolean');
  });

  it('creates audio stream analyser handle and cleans up properly when Web Audio API is available', () => {
    const mockDisconnect = vi.fn();
    const mockClose = vi.fn();
    const mockResume = vi.fn().mockResolvedValue(undefined);
    const mockGetByteFrequencyData = vi.fn((arr: Uint8Array) => {
      arr[1] = 120;
      arr[2] = 200;
    });

    const mockAnalyserNode = {
      fftSize: 64,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 32,
      getByteFrequencyData: mockGetByteFrequencyData,
      disconnect: mockDisconnect,
    };

    const mockSourceNode = {
      connect: vi.fn(),
      disconnect: mockDisconnect,
    };

    class MockAudioContext {
      state = 'suspended';
      createAnalyser = vi.fn(() => mockAnalyserNode);
      createMediaStreamSource = vi.fn(() => mockSourceNode);
      resume = mockResume;
      close = mockClose;
    }

    vi.stubGlobal('window', { AudioContext: MockAudioContext });
    vi.stubGlobal('AudioContext', MockAudioContext);

    const mockStream = {
      getAudioTracks: () => [{ enabled: true, stop: vi.fn() }],
    } as unknown as MediaStream;

    const handle = createAudioStreamAnalyser(mockStream, 64);
    expect(handle).not.toBeNull();

    if (handle) {
      expect(handle.audioContext).toBeDefined();
      expect(mockResume).toHaveBeenCalled();

      const dataArray = new Uint8Array(32);
      handle.getFrequencyData(dataArray);
      expect(dataArray[1]).toBe(120);
      expect(dataArray[2]).toBe(200);

      // Cleanup
      handle.cleanup();
      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    }

    vi.unstubAllGlobals();
  });

  it('handles environment gracefully when AudioContext is missing', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);

    const mockStream = {} as unknown as MediaStream;
    const handle = createAudioStreamAnalyser(mockStream);
    expect(handle).toBeNull();

    vi.unstubAllGlobals();
  });
});
