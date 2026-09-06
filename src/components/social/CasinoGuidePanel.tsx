'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CasinoGuidePanelProps } from '@/components/social/casino-guide/guide-config';
import { GuideTriggerButton } from '@/components/social/casino-guide/GuideTriggerButton';
import { GuideBackdrop } from '@/components/social/casino-guide/GuideBackdrop';
import { GuideHeader } from '@/components/social/casino-guide/GuideHeader';
import { GuideSidebar } from '@/components/social/casino-guide/GuideSidebar';
import { GuideMessageList } from '@/components/social/casino-guide/GuideMessageList';
import { GuideImagePreview } from '@/components/social/casino-guide/GuideImagePreview';
import { GuideVoiceBanner } from '@/components/social/casino-guide/GuideVoiceBanner';
import { GuideVoiceErrorBanner } from '@/components/social/casino-guide/GuideVoiceErrorBanner';
import { GuideInputForm } from '@/components/social/casino-guide/GuideInputForm';
import { useGuideVoiceRecorder } from '@/components/social/casino-guide/hooks/useGuideVoiceRecorder';
import { useGuideAttachment } from '@/components/social/casino-guide/hooks/useGuideAttachment';
import { useGuideChatStream } from '@/components/social/casino-guide/hooks/useGuideChatStream';

export function CasinoGuidePanel({ isMobile, onOpen }: CasinoGuidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const router = useRouter();

  const shouldReduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);

  // Hook 1: Image & Screenshot Attachment Management
  const {
    attachedImage,
    isCompressing,
    fileInputRef,
    handleFileSelect,
    handlePaste,
    clearAttachedImage,
  } = useGuideAttachment();

  // Hook 2: Voice Recording, Live Speech-Recognition & Whisper Upload
  const { isRecording, isTranscribing, voiceStatusMessage, toggleRecording } =
    useGuideVoiceRecorder({
      onTranscript: (transcript) => {
        setDraft(transcript);
      },
    });

  // Hook 3: Chat Turns, SSE Streaming, TTS, Persona & Feedback
  const {
    turns,
    isSending,
    copiedId,
    feedbackMap,
    activePersona,
    playingMessageId,
    activeToolName,
    sendQuestion,
    handleSelectPersona,
    handlePlayVoice,
    copyToClipboard,
    handleFeedback,
  } = useGuideChatStream();

  // Custom Event trigger for opening guide with predefined prompt
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (!isMobile) {
        setIsExpanded(true);
      }
      if (customEvent.detail?.prompt) {
        setDraft(customEvent.detail.prompt);
      }
    };
    window.addEventListener('royale-guide-open-with-prompt', handleCustomOpen);
    return () => window.removeEventListener('royale-guide-open-with-prompt', handleCustomOpen);
  }, []);

  // Escape-Key-Handling & Focus-Trap for WCAG 2.2 AAA Dialog Compliance
  useEffect(() => {
    if (!isOpen) return;

    const previousFocusedElement = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      if (panelRef.current) {
        const textarea = panelRef.current.querySelector<HTMLTextAreaElement>('textarea');
        if (textarea) {
          textarea.focus();
        } else {
          const firstFocusable = panelRef.current.querySelector<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
          firstFocusable?.focus();
        }
      }
    }, 40);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setIsExpanded(false);
        return;
      }

      if (event.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
      }
    };
  }, [isOpen]);

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

  const openPanel = () => {
    onOpen();
    setIsOpen(true);
    if (!isMobile) {
      setIsExpanded(true);
    }
  };

  const handleSend = (customPrompt?: string) => {
    const textToSend = customPrompt ?? draft;
    sendQuestion(textToSend, attachedImage, () => {
      if (!customPrompt) setDraft('');
      clearAttachedImage();
    });
  };

  const panelBottom = isMobile ? 'calc(84px + env(safe-area-inset-bottom))' : '24px';

  return (
    <>
      {/* Floating Trigger Button */}
      <GuideTriggerButton
        isOpen={isOpen}
        isMobile={isMobile}
        panelBottom={panelBottom}
        onOpen={openPanel}
      />

      {/* Backdrop for Expanded Center-Modal & Mobile Dimming */}
      <GuideBackdrop
        isOpen={isOpen}
        isExpanded={isExpanded}
        isMobile={isMobile}
        onClose={() => {
          if (isMobile) {
            setIsOpen(false);
            setIsExpanded(false);
          } else {
            setIsExpanded(false);
          }
        }}
      />

      {/* Chat Panel / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="royale-guide-title"
            aria-label="Royale Guide"
            drag={isMobile ? 'x' : false}
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={{ left: 0.04, right: 0.5 }}
            onDragEnd={(_, info) => {
              if (isMobile && (info.offset.x > 80 || info.velocity.x > 350)) {
                setIsOpen(false);
                setIsExpanded(false);
              }
            }}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.96,
                  }
            }
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.96,
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { type: 'spring', bounce: 0.15, duration: 0.3 }
            }
            style={{
              position: 'fixed',
              zIndex: 46,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: 'none',
              borderRadius: '20px',
              background: '#0B0E14',
              boxShadow:
                '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              touchAction: isMobile ? 'pan-y' : 'auto',
              ...(isExpanded && !isMobile
                ? {
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(880px, calc(100vw - 32px))',
                    height: 'min(680px, calc(100dvh - 64px))',
                    maxHeight: 'calc(100dvh - 48px)',
                    right: 'auto',
                    bottom: 'auto',
                  }
                : {
                    top: 'auto',
                    left: 'auto',
                    transform: 'none',
                    right: isMobile ? '12px' : '24px',
                    bottom: panelBottom,
                    width: isMobile ? 'calc(100% - 24px)' : '380px',
                    height: isMobile ? 'calc(100dvh - 112px)' : 'min(580px, calc(100dvh - 48px))',
                    maxHeight: 'calc(100dvh - 48px)',
                  }),
            }}
          >
            {/* AI-Generated Obsidian-Velvet Backdrop with Parallax Breathing Drift */}
            <motion.div
              aria-hidden="true"
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : {
                      scale: [1, 1.025, 1],
                      opacity: [0.95, 1, 0.95],
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 18,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
              style={{
                position: 'absolute',
                inset: '-10px',
                backgroundImage:
                  'url(/images/2026-09-05_backdrop-royale-guide-obsidian-velvet_v001.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Internal Ambient Light Orbs */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(180, 140, 30, 0.08) 0%, transparent 70%)',
                filter: 'blur(45px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            {/* Visual Drag Handle for Mobile Swipe-to-Dismiss */}
            {isMobile && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingTop: '8px',
                  paddingBottom: '2px',
                  width: '100%',
                }}
                aria-hidden
              >
                <div
                  style={{
                    width: '36px',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(212, 175, 55, 0.4)',
                  }}
                />
              </div>
            )}

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
              <GuideHeader
                activePersona={activePersona}
                isExpanded={isExpanded}
                isMobile={isMobile}
                onToggleExpand={() => setIsExpanded((prev) => !prev)}
                onClose={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                onSelectPersona={handleSelectPersona}
              />
            </div>

            {/* Main Content Area */}
            <div
              style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}
            >
              {/* Desktop 2-Column Sidebar */}
              {isExpanded && !isMobile && (
                <GuideSidebar
                  isSending={isSending}
                  onTopicClick={(prompt: string) => handleSend(prompt)}
                />
              )}

              {/* Chat Conversation Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minWidth: 0,
                  position: 'relative',
                }}
              >
                {/* Scrollable Message Feed */}
                <GuideMessageList
                  turns={turns}
                  isSending={isSending}
                  isExpanded={isExpanded}
                  copiedId={copiedId}
                  feedbackMap={feedbackMap}
                  playingMessageId={playingMessageId}
                  activeToolName={activeToolName}
                  onCopy={copyToClipboard}
                  onFeedback={handleFeedback}
                  onActionClick={handleActionClick}
                  onSuggestionClick={(query: string) => handleSend(query)}
                  onPlayVoice={handlePlayVoice}
                />

                {/* Screenshot / Image Preview Chip */}
                {attachedImage && (
                  <GuideImagePreview attachedImage={attachedImage} onRemove={clearAttachedImage} />
                )}

                {/* Voice Recording Active Banner with Real-time FFT Waveform */}
                {isRecording && <GuideVoiceBanner onStop={toggleRecording} />}

                {/* Voice Status / Error Banner */}
                {voiceStatusMessage && <GuideVoiceErrorBanner message={voiceStatusMessage} />}

                {/* Accessible Input Form */}
                <GuideInputForm
                  draft={draft}
                  isSending={isSending}
                  isCompressing={isCompressing}
                  isRecording={isRecording}
                  isTranscribing={isTranscribing}
                  attachedImage={attachedImage}
                  fileInputRef={fileInputRef}
                  onDraftChange={setDraft}
                  onPaste={handlePaste}
                  onSend={() => handleSend()}
                  onFileSelect={handleFileSelect}
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
