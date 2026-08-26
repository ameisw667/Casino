'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Check, X, Shield, Clock } from 'lucide-react';
import type { GuildInviteRecord } from '@/lib/casino/guild-service';

interface GuildInvitesInboxProps {
  invites: GuildInviteRecord[];
  onRespond: (inviteId: string, action: 'accept' | 'decline') => Promise<void>;
  isMobile?: boolean;
}

export function GuildInvitesInbox({ invites, onRespond, isMobile = false }: GuildInvitesInboxProps) {
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null);

  if (invites.length === 0) {
    return null;
  }

  const handleAction = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      setBusyInviteId(inviteId);
      await onRespond(inviteId, action);
    } finally {
      setBusyInviteId(null);
    }
  };

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Mail size={16} color="#D4AF37" />
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
          Offene Gilden-Einladungen ({invites.length})
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {invites.map((invite) => {
          const isBusy = busyInviteId === invite.id;
          return (
            <div
              key={invite.id}
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                padding: '12px 16px',
                background: '#141414',
                border: '1px solid #202020',
                borderRadius: '8px',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#1A1A1A',
                    border: '1px solid #282828',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={16} color="#D4AF37" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                      {invite.guild?.name || 'Gilde'}
                    </span>
                    {invite.guild?.tag && (
                      <span
                        style={{
                          background: '#1A1A1A',
                          border: '1px solid #282828',
                          color: '#D4AF37',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        [{invite.guild.tag}]
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.75rem', color: '#737373' }}>
                    <Clock size={12} />
                    <span>Gültig bis {new Date(invite.expiresAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleAction(invite.id, 'accept')}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #282828',
                    color: '#10B981',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    flex: isMobile ? 1 : undefined,
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <Check size={14} />
                  Annehmen
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleAction(invite.id, 'decline')}
                  style={{
                    background: 'transparent',
                    color: '#737373',
                    border: '1px solid #282828',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <X size={14} />
                  Ablehnen
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
