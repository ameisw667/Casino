'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { compressImageFile, isAllowedImageFile } from '@/lib/casino/image-compression';
import {
  playSynthesizedAudio,
  startAudioRecording,
  startLiveSpeechRecognition,
  stopActiveAudioPlayback,
  stopAudioRecording,
  stopAudioRecordingSafe,
  type LiveSpeechRecognizer,
} from '@/lib/casino/voice-audio';
import {
  type CasinoGuidePanelProps,
  type GuideTurn,
  getCurrentTime,
  INITIAL_TURN,
  nextTurnId,
} from '@/components/social/casino-guide/guide-config';
import { GuideTriggerButton } from '@/components/social/casino-guide/GuideTriggerButton';
import { GuideBackdrop } from '@/components/social/casino-guide/GuideBackdrop';
import { GuideHeader } from '@/components/social/casino-guide/GuideHeader';
import { GuideSidebar } from '@/components/social/casino-guide/GuideSidebar';
import { GuideMessageList } from '@/components/social/casino-guide/GuideMessageList';
import { GuideQuickChips } from '@/components/social/casino-guide/GuideQuickChips';
import { GuideImagePreview } from '@/components/social/casino-guide/GuideImagePreview';
import { GuideVoiceBanner } from '@/components/social/casino-guide/GuideVoiceBanner';
import { GuideVoiceErrorBanner } from '@/components/social/casino-guide/GuideVoiceErrorBanner';
import { GuideInputForm } from '@/components/social/casino-guide/GuideInputForm';
import {
  DEFAULT_PERSONA,
  type GuidePersona,
  guidePersonaSchema,
} from '@/lib/casino/chat-guide/personas';

export function CasinoGuidePanel({ isMobile, onOpen }: CasinoGuidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const router = useRouter();
  const [turns, setTurns] = useState<GuideTurn[]>([INITIAL_TURN]);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 1 | -1>>({});
  const [activePersona, setActivePersona] = useState<GuidePersona>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('royale_guide_persona');
        const parsed = guidePersonaSchema.safeParse(saved);
        if (parsed.success) return parsed.data;
      } catch {
        // Fallback
      }
    }
    return DEFAULT_PERSONA;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveRecognizerRef = useRef<LiveSpeechRecognizer | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/casino/guide-persona')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { persona?: GuidePersona } | null) => {
        if (isMounted && data?.persona) {
          setActivePersona(data.persona);
          try {
            localStorage.setItem('royale_guide_persona', data.persona);
          } catch {
            // Ignore
          }
        }
      })
      .catch(() => {
        // Offline / fallback to localStorage
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        setDraft(customEvent.detail.prompt);
      }
    };
    window.addEventListener('royale-guide-open-with-prompt', handleCustomOpen);
    return () => window.removeEventListener('royale-guide-open-with-prompt', handleCustomOpen);
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!isAllowedImageFile(file)) return;
    try {
      setIsCompressing(true);
      const compressed = await compressImageFile(file);
      setAttachedImage(compressed);
    } catch {
      // Ignore invalid files silently
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          await handleFileSelect(file);
          break;
        }
      }
    }
  };

  const toggleRecording = async () => {
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
            const data = (await res.json()) as { text?: string };
            if (data.text?.trim()) {
              setDraft(data.text.trim());
              setVoiceStatusMessage(null);
            }
          }
        }
      } catch {
        // Fallback: If Whisper upload fails, any text already transcribed via live recognizer remains
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
              setDraft(transcript.trim());
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
        console.error('[RoyaleVoice] Microphone activation error:', err);

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

        setVoiceStatusMessage(msg);
        setTimeout(() => setVoiceStatusMessage(null), 8000);
      }
    }
  };

  const handlePlayVoice = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      stopActiveAudioPlayback();
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(messageId);
    await playSynthesizedAudio(
      text,
      () => setPlayingMessageId(null),
      () => setPlayingMessageId(null),
    );
  };

  const handleActionClick = (action: { type: string; target?: string; label: string }) => {
    if (action.type === 'open_vault') {
      router.push('/vault');
    } else if (action.type === 'open_history') {
      router.push('/history');
    } else if (action.type === 'open_leaderboard') {
      router.push('/leaderboard');
    } else if (action.type === 'open_settings') {
      router.push('/vault');
    } else if (action.type === 'open_rank_benefits') {
      router.push('/vault');
    } else if (action.type === 'navigate_game' && action.target) {
      const cleanTarget = action.target.toLowerCase().replace(/[^a-z0-9]/g, '');
      router.push(`/games/${cleanTarget}`);
    }
  };

  const handleFeedback = async (messageId: string, rating: 1 | -1) => {
    if (feedbackMap[messageId] === rating) return;
    setFeedbackMap((prev) => ({ ...prev, [messageId]: rating }));
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, messageId }),
      });
    } catch {
      // Ignore network error silently
    }
  };

  const openPanel = () => {
    onOpen();
    setIsOpen(true);
  };

  const handleSelectPersona = (persona: GuidePersona) => {
    setActivePersona(persona);
    try {
      localStorage.setItem('royale_guide_persona', persona);
    } catch {
      // Ignore localStorage errors
    }
    fetch('/api/casino/guide-persona', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona }),
    }).catch(() => {
      // Ignore network errors silently
    });
  };

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  const sendQuestion = async (customMessage?: string) => {
    const message = (customMessage ?? draft).trim();
    if ((!message && !attachedImage) || isSending) return;

    const activeMessage = message || 'Analysiere diesen Spielrunden-Screenshot.';
    const time = getCurrentTime();
    const currentImage = attachedImage;
    setAttachedImage(null);

    setTurns((current) => [
      ...current,
      {
        id: nextTurnId('player'),
        role: 'player',
        text: activeMessage,
        time,
        image: currentImage ?? undefined,
      },
    ]);
    if (!customMessage) setDraft('');
    setIsSending(true);

    const history = turns
      .filter((t) => t.id !== 'royale-guide-intro')
      .slice(-6)
      .map((t) => ({
        role: t.role === 'player' ? ('user' as const) : ('assistant' as const),
        content: t.text,
      }));

    const guideTurnId = nextTurnId('guide');
    const replyTime = getCurrentTime();

    try {
      const response = await fetch('/api/chat/bot-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify({
          message: activeMessage,
          history,
          stream: true,
          image: currentImage ?? undefined,
          persona: activePersona,
        }),
      });

      if (!response.ok) {
        let text =
          'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.';
        if (response.status === 401) {
          text = 'Bitte melde dich an, um Royale Guide zu nutzen.';
        } else if (response.status === 429) {
          text = 'Zu viele Anfragen. Bitte warte einen kurzen Moment.';
        }
        setTurns((current) => [
          ...current,
          { id: guideTurnId, role: 'guide', text, time: replyTime },
        ]);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        // Mount guide turn for streaming
        setTurns((current) => [
          ...current,
          { id: guideTurnId, role: 'guide', text: '', time: replyTime },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.action) {
                  const receivedAction = parsed.action;
                  setTurns((current) =>
                    current.map((t) =>
                      t.id === guideTurnId ? { ...t, action: receivedAction } : t,
                    ),
                  );
                }
                if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                  const receivedSuggestions = parsed.suggestions;
                  setTurns((current) =>
                    current.map((t) =>
                      t.id === guideTurnId ? { ...t, suggestions: receivedSuggestions } : t,
                    ),
                  );
                }
                if (parsed.text) {
                  const chunkText: string = parsed.text;
                  accumulated += chunkText;
                  setTurns((current) =>
                    current.map((t) =>
                      t.id === guideTurnId ? { ...t, text: t.text + chunkText } : t,
                    ),
                  );
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }

        if (!accumulated.trim()) {
          setTurns((current) =>
            current.map((t) =>
              t.id === guideTurnId
                ? {
                    ...t,
                    text: 'Royale Guide konnte keine Antwort generieren. Bitte versuche es erneut.',
                  }
                : t,
            ),
          );
        }
      } else {
        // Classic JSON fallback
        const payload: unknown = await response.json().catch(() => null);
        const answer =
          typeof payload === 'object' && payload !== null && 'answer' in payload
            ? payload.answer
            : undefined;
        const action =
          typeof payload === 'object' && payload !== null && 'action' in payload
            ? ((payload as Record<string, unknown>).action as {
                type: string;
                target?: string;
                label: string;
              })
            : undefined;
        const suggestions =
          typeof payload === 'object' &&
          payload !== null &&
          'suggestions' in payload &&
          Array.isArray((payload as Record<string, unknown>).suggestions)
            ? ((payload as Record<string, unknown>).suggestions as string[])
            : undefined;

        if (typeof answer !== 'string' || !answer.trim()) {
          setTurns((current) => [
            ...current,
            {
              id: guideTurnId,
              role: 'guide',
              text: 'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.',
              time: replyTime,
            },
          ]);
          return;
        }

        setTurns((current) => [
          ...current,
          {
            id: guideTurnId,
            role: 'guide',
            text: answer.trim(),
            time: replyTime,
            action,
            suggestions,
          },
        ]);
      }
    } catch {
      setTurns((current) => [
        ...current,
        {
          id: guideTurnId,
          role: 'guide',
          text: 'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.',
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const panelBottom = isMobile ? 'calc(84px + env(safe-area-inset-bottom))' : '24px';

  return (
    <>
      {/* Floating Trigger Button (Option 1A — Subtiler Obsidian & Gold Glow) */}
      <GuideTriggerButton isOpen={isOpen} isMobile={isMobile} panelBottom={panelBottom} onOpen={openPanel} />

      {/* Backdrop for Expanded Center-Modal */}
      <GuideBackdrop
        isOpen={isOpen}
        isExpanded={isExpanded}
        isMobile={isMobile}
        onClose={() => setIsExpanded(false)}
      />

      {/* Chat Panel / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            aria-label="Royale Guide"
            initial={{ opacity: 0, scale: 0.96, y: isExpanded ? 0 : 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              ...(isExpanded && !isMobile
                ? {
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(880px, calc(100vw - 32px))',
                    height: 'min(680px, calc(100dvh - 48px))',
                  }
                : {
                    right: isMobile ? '12px' : '24px',
                    bottom: panelBottom,
                    width: isMobile ? 'calc(100% - 24px)' : '380px',
                    height: isMobile ? 'calc(100dvh - 112px)' : 'min(640px, calc(100dvh - 48px))',
                  }),
            }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            style={{
              position: 'fixed',
              zIndex: 46,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid hsla(var(--primary), 0.32)',
              borderRadius: '20px',
              background: 'hsla(var(--bg-color), 0.94)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 60px hsla(0, 0%, 0%, 0.65), 0 0 1px hsla(var(--primary), 0.45)',
              color: 'hsl(var(--text-main))',
            }}
          >
            {/* Header */}
            <GuideHeader
              isExpanded={isExpanded}
              isMobile={isMobile}
              activePersona={activePersona}
              onSelectPersona={handleSelectPersona}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              onClose={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
            />

            {/* Main Content Area (2-Columns in Expanded Mode) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Sidebar (Only in Expanded Mode) */}
              {isExpanded && !isMobile && (
                <GuideSidebar
                  isSending={isSending}
                  onTopicClick={(query) => void sendQuestion(query)}
                />
              )}

              {/* Right Chat Column */}
              <div
                style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}
              >
                {/* Messages Container */}
                <GuideMessageList
                  turns={turns}
                  isSending={isSending}
                  isExpanded={isExpanded}
                  copiedId={copiedId}
                  feedbackMap={feedbackMap}
                  playingMessageId={playingMessageId}
                  onActionClick={handleActionClick}
                  onSuggestionClick={(query) => void sendQuestion(query)}
                  onPlayVoice={handlePlayVoice}
                  onCopy={copyToClipboard}
                  onFeedback={handleFeedback}
                />

                {/* Quick-Chips bar (in standard mode) */}
                {!isExpanded && (
                  <GuideQuickChips
                    isSending={isSending}
                    onChipClick={(query) => void sendQuestion(query)}
                  />
                )}

                {/* Attached Image Preview */}
                {attachedImage && (
                  <GuideImagePreview
                    attachedImage={attachedImage}
                    onRemove={() => setAttachedImage(null)}
                  />
                )}

                {/* Voice Recording Active Banner */}
                {isRecording && <GuideVoiceBanner onStop={toggleRecording} />}

                {/* Voice Status / Error Banner */}
                {voiceStatusMessage && <GuideVoiceErrorBanner message={voiceStatusMessage} />}

                {/* Input Form */}
                <GuideInputForm
                  draft={draft}
                  isSending={isSending}
                  isCompressing={isCompressing}
                  isRecording={isRecording}
                  isTranscribing={isTranscribing}
                  attachedImage={attachedImage}
                  fileInputRef={fileInputRef}
                  onDraftChange={(value) => setDraft(value)}
                  onPaste={handlePaste}
                  onSend={() => void sendQuestion()}
                  onFileSelect={(file) => void handleFileSelect(file)}
                  onToggleRecording={toggleRecording}
                />
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
