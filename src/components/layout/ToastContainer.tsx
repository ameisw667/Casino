'use client';
import { CheckCircle2, AlertCircle, Info as InfoIcon, Trophy, X } from 'lucide-react';
import type { Toast } from '@/store/useCasinoStore';

interface ToastContainerProps {
  isMobile: boolean;
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ isMobile, toasts, onRemove }: ToastContainerProps) {
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
        <div
          key={toast.id}
          className="glass animate-slide-in-right"
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
            border: `1px solid ${toast.type === 'error' ? 'hsl(var(--error))' : toast.type === 'success' ? 'hsl(var(--success))' : 'var(--glass-border)'}`,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={20} color="hsl(var(--success))" />}
          {toast.type === 'error' && <AlertCircle size={20} color="hsl(var(--error))" />}
          {(toast.type === 'info' || !toast.type) && (
            <InfoIcon size={20} color="hsl(var(--primary))" />
          )}
          {toast.type === 'win' && <Trophy size={20} color="hsl(var(--primary))" />}
          <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</div>
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
        </div>
      ))}
    </div>
  );
}
