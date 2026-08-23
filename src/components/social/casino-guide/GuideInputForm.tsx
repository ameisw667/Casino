'use client';

import { motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Mic, Send } from 'lucide-react';

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
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '12px',
        borderTop: '1px solid var(--glass-border)',
        background: 'hsla(var(--bg-color), 0.5)',
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

      <button
        type="button"
        aria-label="Screenshot anhängen"
        title="Screenshot anhängen (oder per Strg+V einfügen)"
        onClick={() => fileInputRef.current?.click()}
        disabled={isSending || isCompressing}
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: attachedImage ? 'rgba(212, 175, 55, 0.2)' : 'hsla(var(--bg-color), 0.42)',
          border: attachedImage
            ? '1px solid rgba(212, 175, 55, 0.6)'
            : '1px solid var(--glass-border)',
          color: attachedImage ? '#ffd700' : 'hsl(var(--text-muted))',
          cursor: isSending || isCompressing ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        {isCompressing ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
      </button>

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
            ? '🔴 Höre zu... Sprich jetzt (Klicke erneut zum Beenden)...'
            : isTranscribing
              ? '⏳ Transkribiere Sprache mit Whisper...'
              : attachedImage
                ? 'Optionale Frage zum Screenshot (oder direkt Enter drücken)…'
                : 'Frage zu Regeln, VIP, Limits oder Screenshot (Strg+V)…'
        }
        rows={2}
        style={{
          flex: 1,
          resize: 'none',
          border: '1px solid var(--glass-border)',
          borderRadius: '10px',
          background: 'hsla(var(--bg-color), 0.42)',
          backdropFilter: 'blur(10px)',
          color: 'hsl(var(--text-main))',
          outline: 'none',
          padding: '9px 10px',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
        }}
      />

      <button
        type="button"
        aria-label={
          isRecording ? 'Aufnahme beenden & transkribieren' : 'Spracheingabe starten (Mikrofon)'
        }
        title={
          isRecording ? 'Aufnahme beenden & transkribieren' : 'Spracheingabe starten (Mikrofon)'
        }
        onClick={onToggleRecording}
        disabled={isSending || isTranscribing}
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: isRecording ? 'rgba(239, 68, 68, 0.25)' : 'hsla(var(--bg-color), 0.42)',
          border: isRecording
            ? '1px solid rgba(239, 68, 68, 0.8)'
            : '1px solid var(--glass-border)',
          color: isRecording ? '#ef4444' : 'hsl(var(--text-muted))',
          cursor: isSending || isTranscribing ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        {isTranscribing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <Mic size={16} color="#ef4444" />
          </motion.div>
        ) : (
          <Mic size={16} />
        )}
      </button>

      <motion.button
        type="submit"
        aria-label="Send question to Royale Guide"
        disabled={isSending || (!draft.trim() && !attachedImage)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '40px',
          height: '40px',
          border: 'none',
          borderRadius: '10px',
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--bg-color))',
          cursor: isSending || (!draft.trim() && !attachedImage) ? 'not-allowed' : 'pointer',
          opacity: isSending || (!draft.trim() && !attachedImage) ? 0.5 : 1,
          flexShrink: 0,
        }}
      >
        <Send size={16} aria-hidden />
      </motion.button>
    </form>
  );
}
