'use client';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info as InfoIcon, Trophy, X } from 'lucide-react';
import type { Toast } from '@/store/useCasinoStore';

interface ToastContainerProps {
  isMobile: boolean;
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ isMobile, toasts, onRemove }: ToastContainerProps) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '80px' : '88px',
        right: isMobile ? '50%' : '24px',
        transform: isMobile ? 'translateX(50%)' : 'none',
        width: isMobile ? 'min(90vw, 350px)' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          className="glass animate-slide-in-right"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          style={{
            padding: isMobile ? '12px 16px' : '16px 20px',
            borderRadius: '16px',
            minWidth: isMobile ? '0' : '300px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background:
              toast.type === 'error'
                ? 'hsla(var(--error), 0.15)'
                : toast.type === 'success'
                  ? 'hsla(var(--success), 0.15)'
                  : 'hsla(var(--bg-color), 0.8)',
            border: toast.level
              ? '1px solid rgba(212, 175, 55, 0.72)'
              : `1px solid ${toast.type === 'error' ? 'hsl(var(--error))' : toast.type === 'success' ? 'hsl(var(--success))' : 'var(--glass-border)'}`,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
            boxShadow: toast.level
              ? '0 14px 38px rgba(0, 0, 0, 0.5), 0 0 28px rgba(212, 175, 55, 0.2)'
              : '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} color="hsl(var(--success))" />}
          {toast.type === 'error' && <AlertCircle size={20} color="hsl(var(--error))" />}
          {(toast.type === 'info' || !toast.type) && (
            <InfoIcon size={20} color="hsl(var(--primary))" />
          )}
          {toast.type === 'win' && <Trophy size={20} color="hsl(var(--primary))" />}
          {toast.badgeSrc && (
            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
              <Image
                src={toast.badgeSrc}
                alt="Level-Aufstieg-Siegel"
                width={48}
                height={48}
                sizes="48px"
                style={{ objectFit: 'contain' }}
              />
              {toast.level && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#F5D77F',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    textShadow: '0 1px 4px #000',
                  }}
                >
                  {toast.level}
                </span>
              )}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {toast.title && (
              <div
                style={{
                  color: '#F5D77F',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                }}
              >
                {toast.title}
              </div>
            )}
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</div>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            style={{
              color: 'hsl(var(--text-muted))',
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
