'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Shield, Users, UserPlus, ArrowRight } from 'lucide-react';
import type { GuildRecord, GuildRole, GuildMemberRecord } from '@/lib/casino/guild-service';
import { GuildInviteModal } from './GuildInviteModal';

interface GuildLeaderboardStripProps {
  isMobile?: boolean;
}

export function GuildLeaderboardStrip({ isMobile = false }: GuildLeaderboardStripProps) {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<{
    guild: GuildRecord;
    role: GuildRole;
    joinedAt: string;
    members: GuildMemberRecord[];
  } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loadMembership = useCallback(async () => {
    try {
      const res = await fetch('/api/casino/guild/me', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setMembership(json.membership ?? null);
      } else {
        setMembership(null);
      }
    } catch {
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: isMobile ? '12px 16px' : '14px 20px',
          borderRadius: '12px',
          background: '#111111',
          border: '1px solid #222222',
          minHeight: '52px',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: '#525252' }}>Gilden-Status wird geladen...</div>
      </div>
    );
  }

  const isLeaderOrOfficer = membership?.role === 'leader' || membership?.role === 'officer';

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: isMobile ? '12px 16px' : '14px 20px',
          borderRadius: '12px',
          background: '#111111',
          border: '1px solid #222222',
          transition: 'border-color 0.15s ease',
        }}
      >
        {membership ? (
          /* State A: User is in a guild */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#181818',
                  border: '1px solid #282828',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={18} color="#D4AF37" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#737373',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Deine Gilde
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: '#1A1A1A',
                      border: '1px solid #282828',
                      color: membership.role === 'leader' ? '#D4AF37' : '#A3A3A3',
                    }}
                  >
                    {membership.role}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {membership.guild.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#D4AF37',
                      background: '#1A1A1A',
                      border: '1px solid #282828',
                      borderRadius: '4px',
                      padding: '2px 6px',
                    }}
                  >
                    [{membership.guild.tag}]
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#737373', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={12} />
                    {membership.guild.memberCount} {membership.guild.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
              {isLeaderOrOfficer && (
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #282828',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    color: '#D4AF37',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flex: isMobile ? 1 : undefined,
                    justifyContent: 'center',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <UserPlus size={14} />
                  Einladen
                </button>
              )}

              <Link
                href="/guild"
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #282828',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: isMobile ? 1 : undefined,
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
              >
                Gilde verwalten
                <ArrowRight size={14} />
              </Link>
            </div>
          </>
        ) : (
          /* State B: User has no guild / guest */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#181818',
                  border: '1px solid #282828',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Shield size={18} color="#737373" />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#E5E5E5' }}>
                  Gilden & Teams
                </div>
                <div style={{ fontSize: '0.78rem', color: '#737373' }}>
                  Schließe dich mit anderen Spielern zusammen oder gründe deine eigene Gilde.
                </div>
              </div>
            </div>

            <Link
              href="/guild"
              style={{
                background: '#1A1A1A',
                border: '1px solid #282828',
                borderRadius: '8px',
                padding: '7px 14px',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              Gilde beitreten / gründen
              <ArrowRight size={14} />
            </Link>
          </>
        )}
      </div>

      {membership && (
        <GuildInviteModal
          isOpen={showInviteModal}
          guildId={membership.guild.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={loadMembership}
        />
      )}
    </>
  );
}
