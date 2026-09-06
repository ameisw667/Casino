'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  type GuideTurn,
  getCurrentTime,
  INITIAL_TURN,
  nextTurnId,
} from '@/components/social/casino-guide/guide-config';
import {
  DEFAULT_PERSONA,
  type GuidePersona,
  guidePersonaSchema,
} from '@/lib/casino/chat-guide/personas';
import { playSynthesizedAudio, stopActiveAudioPlayback } from '@/lib/casino/voice-audio';

export function useGuideChatStream() {
  const [turns, setTurns] = useState<GuideTurn[]>([INITIAL_TURN]);
  const [isSending, setIsSending] = useState(false);
  const [activeToolName, setActiveToolName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 1 | -1>>({});
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

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

  // Load persona from server or fallback to local storage
  useEffect(() => {
    let isMounted = true;
    fetch('/api/casino/guide-persona')
      .then((res) => (res.ok ? res.json() : null))
      .then((raw: { data?: { persona?: GuidePersona }; persona?: GuidePersona } | null) => {
        const data = (raw && 'data' in raw && raw.data ? raw.data : raw) as {
          persona?: GuidePersona;
        } | null;
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

  const handleSelectPersona = useCallback((persona: GuidePersona) => {
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
  }, []);

  const handlePlayVoice = useCallback(
    async (messageId: string, text: string) => {
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
    },
    [playingMessageId],
  );

  const copyToClipboard = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  }, []);

  const handleFeedback = useCallback(
    async (messageId: string, rating: 1 | -1) => {
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
    },
    [feedbackMap],
  );

  const sendQuestion = useCallback(
    async (inputMessage: string, attachedImage: string | null, onSent?: () => void) => {
      const message = inputMessage.trim();
      if ((!message && !attachedImage) || isSending) return;

      const activeMessage = message || 'Analysiere diesen Spielrunden-Screenshot.';
      const time = getCurrentTime();

      setTurns((current) => [
        ...current,
        {
          id: nextTurnId('player'),
          role: 'player',
          text: activeMessage,
          time,
          image: attachedImage ?? undefined,
        },
      ]);
      onSent?.();
      setIsSending(true);
      setActiveToolName(null);

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
            image: attachedImage ?? undefined,
            persona: activePersona,
          }),
        });

        if (!response.ok) {
          let text =
            'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.';
          if (response.status === 401) {
            text = 'Bitte melde dich an, um Royale Guide zu nutzen.';
          } else if (response.status === 429) {
            const errData = (await response.json().catch(() => null)) as {
              error?: { code?: string };
            } | null;
            text =
              errData?.error?.code === 'DAILY_COST_CAP_REACHED'
                ? 'Du hast das heutige Tageslimit des Guides erreicht. Versuch es morgen wieder.'
                : 'Zu viele Anfragen. Bitte warte einen kurzen Moment.';
          }
          setTurns((current) => [
            ...current,
            { id: guideTurnId, role: 'guide', text, time: replyTime },
          ]);
          return;
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/event-stream') && response.body) {
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
                  if (parsed.toolCall && typeof parsed.toolCall === 'string') {
                    setActiveToolName(parsed.toolCall);
                  }
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
          const rawPayload: unknown = await response.json().catch(() => null);
          const payload: unknown =
            rawPayload && typeof rawPayload === 'object' && 'data' in rawPayload
              ? (rawPayload as { data: unknown }).data
              : rawPayload;

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
            Array.isArray(payload.suggestions)
              ? (payload.suggestions as string[])
              : undefined;

          setTurns((current) => [
            ...current,
            {
              id: guideTurnId,
              role: 'guide',
              text:
                typeof answer === 'string' && answer.trim()
                  ? answer.trim()
                  : 'Royale Guide hat geantwortet.',
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
            time: replyTime,
          },
        ]);
      } finally {
        setActiveToolName(null);
        setIsSending(false);
      }
    },
    [isSending, turns, activePersona],
  );

  return {
    turns,
    isSending,
    activeToolName,
    copiedId,
    feedbackMap,
    activePersona,
    playingMessageId,
    sendQuestion,
    handleSelectPersona,
    handlePlayVoice,
    copyToClipboard,
    handleFeedback,
  };
}
