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
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(212, 175, 55, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Mail size={18} color="#D4AF37" />
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
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
                background: 'rgba(11, 14, 20, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid #D4AF37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Shield size={18} color="#D4AF37" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                      {invite.guild?.name || 'Gilde'}
                    </span>
                    {invite.guild?.tag && (
                      <span
                        style={{
                          background: '#D4AF37',
                          color: '#0B0E14',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                        }}
                      >
                        [{invite.guild.tag}]
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.78rem', color: '#9CA3AF' }}>
                    <Clock size={12} />
                    <span>Gültig bis {new Date(invite.expiresAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isBusy}
                  onClick={() => handleAction(invite.id, 'accept')}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    flex: isMobile ? 1 : undefined,
                  }}
                >
                  <Check size={16} />
                  Annehmen
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={isBusy}
                  onClick={() => handleAction(invite.id, 'decline')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#9CA3AF',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <X size={16} />
                  Ablehnen
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
