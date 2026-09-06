'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  createAudioStreamAnalyser,
  getActiveAudioStream,
  type AudioStreamAnalyserHandle,
} from '@/lib/casino/voice-audio';

interface GuideVoiceVisualizerProps {
  isActive: boolean;
  stream?: MediaStream | null;
  barCount?: number;
}

const DEFAULT_BAR_COUNT = 8;
const MIN_BAR_HEIGHT = 3;
const MAX_BAR_HEIGHT = 18;

export function GuideVoiceVisualizer({
  isActive,
  stream,
  barCount = DEFAULT_BAR_COUNT,
}: GuideVoiceVisualizerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [barHeights, setBarHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => MIN_BAR_HEIGHT),
  );
  const [isAudible, setIsAudible] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const analyserHandleRef = useRef<AudioStreamAnalyserHandle | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const audioStream = stream ?? getActiveAudioStream();
    if (!audioStream) return;

    const handle = createAudioStreamAnalyser(audioStream, 64);
    if (!handle) return;
    analyserHandleRef.current = handle;

    const bufferLength = handle.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Map 8 bar positions to speech-relevant frequency bands (approx 100 Hz – 4 kHz)
    const binIndices = [1, 2, 4, 6, 8, 11, 15, 20];

    const updateLoop = () => {
      handle.getFrequencyData(dataArray);

      let totalVolume = 0;
      const nextHeights = binIndices.slice(0, barCount).map((binIdx) => {
        const value = dataArray[binIdx] ?? 0;
        totalVolume += value;
        // Normalize 0–255 to MIN_BAR_HEIGHT – MAX_BAR_HEIGHT
        const ratio = Math.min(1, Math.max(0, (value - 12) / 180));
        return Math.round(MIN_BAR_HEIGHT + ratio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT));
      });

      const avgVolume = totalVolume / barCount;
      setIsAudible(avgVolume > 15);
      setBarHeights(nextHeights);

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      handle.cleanup();
      analyserHandleRef.current = null;
    };
  }, [isActive, stream, barCount]);

  const activeHeights = isActive
    ? barHeights
    : Array.from({ length: barCount }, () => MIN_BAR_HEIGHT);
  const activeAudible = isActive && isAudible;

  if (shouldReduceMotion) {
    // Accessible fallback: smooth level dot with status
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        aria-label="Mikrofon-Pegel"
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: activeAudible ? '#D4AF37' : 'rgba(212, 175, 55, 0.4)',
            boxShadow: activeAudible ? '0 0 8px rgba(212, 175, 55, 0.8)' : 'none',
            transition: 'background 0.2s ease, box-shadow 0.2s ease',
          }}
        />
        <span
          style={{
            fontSize: '0.66rem',
            fontFamily: 'var(--font-mono), monospace',
            color: activeAudible ? '#D4AF37' : 'hsl(var(--text-muted))',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {activeAudible ? 'Signal aktiv' : 'Stille…'}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        height: `${MAX_BAR_HEIGHT}px`,
        padding: '0 4px',
      }}
      aria-label="Audio-Frequenz-Wellenform"
    >
      {activeHeights.map((height, index) => (
        <span
          key={`bar-${index}`}
          style={{
            width: '3px',
            height: `${height}px`,
            borderRadius: '2px',
            background: activeAudible
              ? 'linear-gradient(180deg, #FFF0A0 0%, #D4AF37 60%, #996515 100%)'
              : 'rgba(212, 175, 55, 0.35)',
            boxShadow: activeAudible ? '0 0 6px rgba(212, 175, 55, 0.5)' : 'none',
            transition: 'height 0.08s ease, background 0.15s ease',
          }}
        />
      ))}
    </div>
  );
}
