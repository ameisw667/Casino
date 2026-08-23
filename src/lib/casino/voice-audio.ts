/**
 * Client-Side Audio Engine for Royale Voice Interface
 * Manages MediaRecorder audio capture and HTML5 Audio streaming playback.
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
 * Checks if browser supports microphone recording via MediaRecorder API.
 */
export function isAudioRecordingSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && window.MediaRecorder);
}

/**
 * Starts recording microphone audio from user.
 */
export async function startAudioRecording(): Promise<void> {
  if (!isAudioRecordingSupported()) {
    throw new Error('Mikrofonaufnahme wird von diesem Browser nicht unterstützt.');
  }

  // Stop any active recorder
  stopAudioRecordingSafe();

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  activeAudioStream = stream;

  let mimeType = 'audio/webm';
  if (typeof MediaRecorder.isTypeSupported === 'function') {
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    }
  }

  const recorder = new MediaRecorder(stream, { mimeType });
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

function stopAudioRecordingSafe() {
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
