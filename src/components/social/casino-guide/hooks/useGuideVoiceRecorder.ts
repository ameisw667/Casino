'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  startAudioRecording,
  startLiveSpeechRecognition,
  stopAudioRecording,
  stopAudioRecordingSafe,
  type LiveSpeechRecognizer,
} from '@/lib/casino/voice-audio';

interface UseGuideVoiceRecorderOptions {
  onTranscript: (text: string) => void;
}

export function useGuideVoiceRecorder({ onTranscript }: UseGuideVoiceRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string | null>(null);

  const liveRecognizerRef = useRef<LiveSpeechRecognizer | null>(null);
  const statusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showStatusMessage = useCallback((msg: string, durationMs = 8000) => {
    setVoiceStatusMessage(msg);
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    statusTimerRef.current = setTimeout(() => {
      setVoiceStatusMessage(null);
      statusTimerRef.current = null;
    }, durationMs);
  }, []);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      if (liveRecognizerRef.current) {
        liveRecognizerRef.current.stop();
        liveRecognizerRef.current = null;
      }
      setIsTranscribing(true);

      try {
        const audioBlob = await stopAudioRecording();
        if (audioBlob.size > 0) {
          const formData = new FormData();
          formData.append('file', audioBlob, 'voice-message.webm');

          const res = await fetch('/api/chat/voice-transcribe', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const raw = (await res.json()) as { data?: { text?: string }; text?: string };
            const data = (raw && 'data' in raw && raw.data ? raw.data : raw) as { text?: string };
            if (data.text?.trim()) {
              onTranscript(data.text.trim());
              setVoiceStatusMessage(null);
            }
          } else if (res.status === 429) {
            const errData = (await res.json().catch(() => null)) as {
              error?: { code?: string };
            } | null;
            if (errData?.error?.code === 'DAILY_COST_CAP_REACHED') {
              setVoiceStatusMessage('Tageslimit erreicht. Versuch es morgen wieder.');
            }
          }
        }
      } catch {
        // Fallback: If Whisper upload fails, text already transcribed via live recognizer remains
      } finally {
        setIsTranscribing(false);
      }
    } else {
      setVoiceStatusMessage(null);
      try {
        // Start Live Speech Recognition immediately for live text feedback as the user speaks
        const recognizer = startLiveSpeechRecognition(
          (transcript) => {
            if (transcript.trim()) {
              onTranscript(transcript.trim());
            }
          },
          () => {
            // SpeechRecognition error fallback quietly
          },
        );
        liveRecognizerRef.current = recognizer;

        await startAudioRecording();
        setIsRecording(true);
      } catch (err: unknown) {
        setIsRecording(false);
        if (liveRecognizerRef.current) {
          liveRecognizerRef.current.stop();
          liveRecognizerRef.current = null;
        }
        stopAudioRecordingSafe();
        CasinoLogger.error('useGuideVoiceRecorder', 'Microphone activation error', err);

        let isBrowserGranted = false;
        if (typeof navigator !== 'undefined' && navigator.permissions) {
          try {
            const perm = await navigator.permissions.query({
              name: 'microphone' as PermissionName,
            });
            if (perm.state === 'granted') {
              isBrowserGranted = true;
            }
          } catch {
            // Ignore
          }
        }

        const errName =
          err instanceof Error
            ? err.name
            : typeof err === 'object' && err !== null && 'name' in err
              ? String((err as { name?: unknown }).name)
              : 'Error';
        const errMsg = (err instanceof Error ? err.message : String(err)) || '';

        let msg = '';
        if (
          isBrowserGranted &&
          (errName === 'NotAllowedError' || errName === 'PermissionDeniedError')
        ) {
          msg =
            'Chrome hat Zugriff, aber Windows blockiert das Mikrofon (Windows-Einstellungen > Datenschutz > Mikrofon > "Apps den Zugriff erlauben").';
        } else if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          msg =
            'Mikrofon-Berechtigung im Browser verweigert. Bitte im Schloss/Icon links neben der URL erlauben.';
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          msg = 'Kein Mikrofon gefunden. Bitte Audiogerät anschließen oder auswählen.';
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          msg = 'Mikrofon wird von einer anderen App blockiert (z. B. Discord/Teams).';
        } else {
          msg = `Mikrofon konnte nicht aktiviert werden: ${errMsg || errName}`;
        }

        showStatusMessage(msg);
      }
    }
  }, [isRecording, onTranscript, showStatusMessage]);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (liveRecognizerRef.current) {
        liveRecognizerRef.current.stop();
        liveRecognizerRef.current = null;
      }
      stopAudioRecordingSafe();
    };
  }, []);

  return {
    isRecording,
    isTranscribing,
    voiceStatusMessage,
    toggleRecording,
    setVoiceStatusMessage,
  };
}
