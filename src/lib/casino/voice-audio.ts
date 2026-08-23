/**
 * Client-Side Audio Engine for Royale Voice Interface
 * Manages MediaRecorder audio capture, live SpeechRecognition, and HTML5 Audio streaming playback.
 */

export interface AudioRecorderState {
  isRecording: boolean;
  durationMs: number;
}

let activeMediaRecorder: MediaRecorder | null = null;
let activeAudioStream: MediaStream | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let activeAudioUrl: string | null = null;
let activeRecordedChunks: BlobPart[] = [];

/**
 * Checks if browser supports microphone recording via MediaRecorder or getUserMedia.
 */
export function isAudioRecordingSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const hasGetUserMedia = !!(
    (navigator?.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') ||
    (navigator as unknown as { getUserMedia?: unknown })?.getUserMedia ||
    (navigator as unknown as { webkitGetUserMedia?: unknown })?.webkitGetUserMedia
  );
  return hasGetUserMedia && typeof window.MediaRecorder !== 'undefined';
}

/**
 * Gets user audio stream with multi-fallback constraints and device enumeration.
 */
export async function getMicrophoneStream(): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    throw new Error('Mikrofon-Zugriff (getUserMedia) wird von diesem Browser nicht unterstützt.');
  }

  // 1. First attempt: audio with echo cancellation & autoGain
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch {
    // 2. Fallback to basic audio: true
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      // 3. Fallback to enumerated audio devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        if (audioInputs.length > 0) {
          for (const input of audioInputs) {
            if (input.deviceId) {
              try {
                return await navigator.mediaDevices.getUserMedia({
                  audio: { deviceId: { exact: input.deviceId } },
                });
              } catch {
                // Try next device
              }
            }
          }
        }
      } catch {
        // Ignore
      }

      throw err;
    }
  }
}

/**
 * Starts recording microphone audio from user.
 */
export async function startAudioRecording(): Promise<void> {
  // Stop any active recorder
  stopAudioRecordingSafe();

  const stream = await getMicrophoneStream();
  activeAudioStream = stream;

  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0 || !audioTracks[0].enabled) {
    throw new Error('Kein aktiver Audio-Track im Mikrofon-Stream verfügbar.');
  }

  let recorder: MediaRecorder;
  if (typeof MediaRecorder !== 'undefined') {
    if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    } else if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('audio/webm')) {
      recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    } else if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('audio/mp4')) {
      recorder = new MediaRecorder(stream, { mimeType: 'audio/mp4' });
    } else {
      recorder = new MediaRecorder(stream);
    }
  } else {
    throw new Error('MediaRecorder wird von diesem Browser nicht unterstützt.');
  }

  activeRecordedChunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      activeRecordedChunks.push(event.data);
    }
  };

  activeMediaRecorder = recorder;
  // Request audio chunks every 100ms for continuous streaming capture
  recorder.start(100);
}

/**
 * Stops recording and returns the recorded Audio Blob.
 */
export async function stopAudioRecording(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!activeMediaRecorder) {
      reject(new Error('Keine aktive Audioaufnahme vorhanden.'));
      return;
    }

    const recorder = activeMediaRecorder;

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const blob = new Blob(activeRecordedChunks, { type: mimeType });
      activeRecordedChunks = [];
      stopAudioRecordingSafe();
      resolve(blob);
    };

    recorder.onerror = () => {
      activeRecordedChunks = [];
      stopAudioRecordingSafe();
      reject(new Error('Fehler bei der Audioaufnahme.'));
    };

    try {
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
      recorder.stop();
    } catch {
      // Fallback
      stopAudioRecordingSafe();
      resolve(new Blob(activeRecordedChunks, { type: 'audio/webm' }));
    }
  });
}

export function stopAudioRecordingSafe(): void {
  if (activeMediaRecorder && activeMediaRecorder.state !== 'inactive') {
    try {
      activeMediaRecorder.stop();
    } catch {
      // Ignore
    }
  }
  activeMediaRecorder = null;

  if (activeAudioStream) {
    activeAudioStream.getTracks().forEach((track) => track.stop());
    activeAudioStream = null;
  }
}

export type LiveSpeechRecognizer = {
  stop: () => void;
};

/**
 * Starts real-time browser speech recognition for instant live transcription.
 */
export function startLiveSpeechRecognition(
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError?: (err: unknown) => void,
): LiveSpeechRecognizer | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognitionClass =
    (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) return null;

  try {
    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + item[0].transcript.trim();
        } else {
          interimTranscript += item[0].transcript;
        }
      }
      const combined = (finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
      if (combined) {
        onTranscript(combined, !interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      onError?.(event);
    };

    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Ignore
        }
      },
    };
  } catch (err) {
    onError?.(err);
    return null;
  }
}

/**
 * Plays an MP3 audio blob or stream from POST /api/chat/voice-synthesize
 */
export async function playSynthesizedAudio(
  text: string,
  onEnded?: () => void,
  onError?: (err: Error) => void,
): Promise<() => void> {
  stopActiveAudioPlayback();

  try {
    const res = await fetch('/api/chat/voice-synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'onyx' }),
    });

    if (!res.ok) {
      throw new Error(`Sprachausgabe fehlgeschlagen (HTTP ${res.status})`);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    activeAudioUrl = url;

    const audio = new Audio(url);
    activeAudioElement = audio;

    audio.onended = () => {
      stopActiveAudioPlayback();
      onEnded?.();
    };

    audio.onerror = () => {
      stopActiveAudioPlayback();
      onError?.(new Error('Audiowiedergabe fehlgeschlagen'));
    };

    await audio.play();

    return () => stopActiveAudioPlayback();
  } catch (error) {
    stopActiveAudioPlayback();
    onError?.(error instanceof Error ? error : new Error('Sprachsynthese fehlgeschlagen'));
    return () => {};
  }
}

/**
 * Stops any currently playing synthesized audio
 */
export function stopActiveAudioPlayback(): void {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
    activeAudioElement = null;
  }

  if (activeAudioUrl) {
    try {
      URL.revokeObjectURL(activeAudioUrl);
    } catch {
      // Ignore
    }
    activeAudioUrl = null;
  }
}
