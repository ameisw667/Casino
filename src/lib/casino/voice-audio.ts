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
 * Gets user audio stream with multi-fallback constraints.
 */
export async function getMicrophoneStream(): Promise<MediaStream> {
  if (typeof navigator === 'undefined') {
    throw new Error('Navigator nicht verfügbar.');
  }

  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    }
  }

  const legacyGetUserMedia =
    (navigator as unknown as { getUserMedia?: (c: unknown, s: (stream: MediaStream) => void, e: (err: unknown) => void) => void })?.getUserMedia ||
    (navigator as unknown as { webkitGetUserMedia?: (c: unknown, s: (stream: MediaStream) => void, e: (err: unknown) => void) => void })?.webkitGetUserMedia;

  if (legacyGetUserMedia) {
    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, { audio: true }, resolve, reject);
    });
  }

  throw new Error('Mikrofon-Zugriff (getUserMedia) wird von diesem Browser nicht unterstützt.');
}

/**
 * Starts recording microphone audio from user.
 */
export async function startAudioRecording(): Promise<void> {
  // Stop any active recorder
  stopAudioRecordingSafe();

  const stream = await getMicrophoneStream();
  activeAudioStream = stream;

  let options: MediaRecorderOptions | undefined = undefined;
  if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options = { mimeType: 'audio/webm;codecs=opus' };
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options = { mimeType: 'audio/webm' };
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options = { mimeType: 'audio/mp4' };
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      options = { mimeType: 'audio/ogg' };
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      options = { mimeType: 'audio/wav' };
    }
  }

  const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
  activeMediaRecorder = recorder;
  recorder.start();
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

    const chunks: BlobPart[] = [];
    const recorder = activeMediaRecorder;

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunks, { type: mimeType });
      stopAudioRecordingSafe();
      resolve(blob);
    };

    recorder.onerror = () => {
      stopAudioRecordingSafe();
      reject(new Error('Fehler bei der Audioaufnahme.'));
    };

    recorder.stop();
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

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const text = (final || interim).trim();
      if (text) {
        onTranscript(text, !!final);
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
