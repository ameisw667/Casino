'use client';

import { motion } from 'framer-motion';
import { ArrowUp, Image as ImageIcon, Loader2, Mic } from 'lucide-react';

interface GuideInputFormProps {
  draft: string;
  isSending: boolean;
  isCompressing: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  attachedImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDraftChange: (value: string) => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onFileSelect: (file: File) => void;
  onToggleRecording: () => void;
}

export function GuideInputForm({
  draft,
  isSending,
  isCompressing,
  isRecording,
  isTranscribing,
  attachedImage,
  fileInputRef,
  onDraftChange,
  onPaste,
  onSend,
  onFileSelect,
  onToggleRecording,
}: GuideInputFormProps) {
  const canSend = !isSending && (draft.trim().length > 0 || attachedImage !== null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      style={{
        padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px)) 14px',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'rgba(11, 14, 20, 0.25)',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = '';
        }}
      />

      {/* Unified High-Contrast Input Capsule (No blur, crisp backdrop visibility) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 7px',
          borderRadius: '10px',
          background: 'rgba(14, 18, 26, 0.70)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        {/* Attachment Button */}
        <motion.button
          type="button"
          className="relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:outline-none"
          aria-label="Screenshot anhängen"
          title="Screenshot anhängen (oder per Strg+V einfügen)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending || isCompressing}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: attachedImage ? 'hsla(var(--primary), 0.25)' : 'rgba(255, 255, 255, 0.06)',
            border: attachedImage
              ? '1px solid hsla(var(--primary), 0.6)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            color: attachedImage ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.7)',
            cursor: isSending || isCompressing ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {isCompressing ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
        </motion.button>

        {/* Text Input */}
        <textarea
          aria-label="Ask Royale Guide"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value.slice(0, 500))}
          onPaste={onPaste}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
          disabled={isSending}
          maxLength={500}
          placeholder={
            isRecording
              ? '🔴 Höre zu... Sprich jetzt (Klicke zum Beenden)...'
              : isTranscribing
                ? '⏳ Transkribiere Sprache...'
                : attachedImage
                  ? 'Frage zum Screenshot (oder Enter drücken)…'
                  : 'Frage stellen oder Screenshot einfügen…'
          }
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: 'none',
            background: 'transparent',
            color: 'hsl(var(--text-main))',
            outline: 'none',
            padding: '4px 6px',
            fontFamily: 'inherit',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            maxHeight: '72px',
          }}
        />

        {/* Microphone Button */}
        <motion.button
          type="button"
          className="relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:outline-none"
          aria-label={
            isRecording ? 'Aufnahme beenden & transkribieren' : 'Spracheingabe starten (Mikrofon)'
          }
          title={
            isRecording ? 'Aufnahme beenden & transkribieren' : 'Spracheingabe starten (Mikrofon)'
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleRecording}
          disabled={isSending || isTranscribing}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: isRecording
              ? '1px solid rgba(239, 68, 68, 0.6)'
              : '1px solid rgba(255, 255, 255, 0.06)',
            color: isRecording ? '#ef4444' : 'hsl(var(--text-muted))',
            cursor: isSending || isTranscribing ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {isTranscribing ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isRecording ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <Mic size={13} color="#ef4444" />
            </motion.div>
          ) : (
            <Mic size={13} />
          )}
        </motion.button>

        {/* Send Button */}
        <motion.button
          type="submit"
          className="relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:outline-none"
          aria-label="Send question to Royale Guide"
          disabled={!canSend}
          whileHover={{ scale: canSend ? 1.05 : 1 }}
          whileTap={{ scale: canSend ? 0.95 : 1 }}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            borderRadius: '6px',
            background: canSend
              ? 'linear-gradient(135deg, hsl(var(--primary)), #b38f28)'
              : 'hsla(var(--primary), 0.12)',
            color: canSend ? '#0a0d14' : 'hsl(var(--text-muted))',
            cursor: canSend ? 'pointer' : 'not-allowed',
            opacity: canSend ? 1 : 0.45,
            flexShrink: 0,
            transition: 'all 0.15s ease',
            boxShadow: canSend ? '0 0 8px hsla(var(--primary), 0.3)' : 'none',
          }}
        >
          <ArrowUp size={14} strokeWidth={2.5} aria-hidden />
        </motion.button>
      </div>
    </form>
  );
}
