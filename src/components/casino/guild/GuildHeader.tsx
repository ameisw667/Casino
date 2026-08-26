'use client';

import React from 'react';
import { Shield, Users, Crown, Calendar, UserPlus, LogOut, Trash2 } from 'lucide-react';
import type { GuildRecord, GuildRole } from '@/lib/casino/guild-service';

interface GuildHeaderProps {
  guild: GuildRecord;
  userRole?: GuildRole;
  onInviteClick?: () => void;
  onLeaveClick?: () => void;
  onDisbandClick?: () => void;
  isMobile?: boolean;
}

export function GuildHeader({
  guild,
  userRole,
  onInviteClick,
  onLeaveClick,
  onDisbandClick,
  isMobile = false,
}: GuildHeaderProps) {
  const isLeader = userRole === 'leader';
  const isOfficerOrLeader = userRole === 'leader' || userRole === 'officer';

  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #222222',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px 24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Guild Emblem Shield */}
          <div
            style={{
              width: isMobile ? '44px' : '52px',
              height: isMobile ? '44px' : '52px',
              borderRadius: '10px',
              background: '#181818',
              border: '1px solid #282828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Shield size={isMobile ? 22 : 26} color="#D4AF37" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                {guild.name}
              </h1>
              <span
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #282828',
                  color: '#D4AF37',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                [{guild.tag}]
              </span>
            </div>

            {guild.description && (
              <p
                style={{
                  color: '#8A8A8A',
                  fontSize: '0.85rem',
                  marginTop: '4px',
                  marginBottom: '6px',
                  maxWidth: '650px',
                  lineHeight: '1.4',
                }}
              >
                {guild.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#8A8A8A', fontSize: '0.78rem' }}>
                <Users size={14} color="#737373" />
                <span className="font-mono tabular-nums" style={{ fontWeight: 600, color: '#E5E5E5' }}>
                  {guild.memberCount}
                </span>
                <span>{guild.memberCount === 1 ? 'Mitglied' : 'Mitglieder'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#737373', fontSize: '0.78rem' }}>
                <Calendar size={13} />
                <span>Gegründet {new Date(guild.createdAt).toLocaleDateString('de-DE')}</span>
              </div>

              {userRole && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: '#1A1A1A',
                    border: '1px solid #282828',
                    color: userRole === 'leader' ? '#D4AF37' : '#A3A3A3',
                  }}
                >
                  {userRole === 'leader' && <Crown size={11} color="#D4AF37" />}
                  {userRole}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {isOfficerOrLeader && onInviteClick && (
            <button
              type="button"
              onClick={onInviteClick}
              style={{
                background: '#1A1A1A',
                border: '1px solid #282828',
                borderRadius: '8px',
                padding: '8px 14px',
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

          {userRole && onLeaveClick && (
            <button
              type="button"
              onClick={onLeaveClick}
              style={{
                background: 'transparent',
                border: '1px solid #282828',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#8A8A8A',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <LogOut size={13} />
              Verlassen
            </button>
          )}

          {isLeader && onDisbandClick && (
            <button
              type="button"
              onClick={onDisbandClick}
              style={{
                background: 'transparent',
                border: '1px solid #282828',
                borderRadius: '8px',
                padding: '8px 14px',
                color: '#737373',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <Trash2 size={13} />
              Auflösen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
