'use client';

import React, { useState } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import type { GuildRecord } from '@/lib/casino/guild-service';

interface GuildCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (guild: GuildRecord) => void;
}

export function GuildCreateModal({ isOpen, onClose, onSuccess }: GuildCreateModalProps) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/casino/guild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          tag: tag.trim().toUpperCase(),
          description: description.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Fehler beim Erstellen der Gilde');
      }

      onSuccess(json.guild);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gildengründung fehlgeschlagen';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          style={{
            background: '#111111',
            border: '1px solid #222222',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#181818',
                  border: '1px solid #282828',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield size={18} color="#D4AF37" />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Neue Gilde gründen
              </h2>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#EF4444',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '6px' }}>
                Gildenname (3 - 30 Zeichen)
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Royal Highrollers"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '6px' }}>
                Kürzel / Tag (2 - 5 Zeichen)
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={5}
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="z. B. ROY"
                style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '6px' }}>
                Beschreibung (Optional, max. 500 Zeichen)
              </label>
              <textarea
                maxLength={500}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe deine Gilde und eure Spielphilosophie..."
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #282828',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#8A8A8A',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#1A1A1A',
                  border: '1px solid #282828',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#D4AF37',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
              >
                {loading ? 'Wird erstellt...' : 'Gründen'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#161616',
  border: '1px solid #282828',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#ffffff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};
