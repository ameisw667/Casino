'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Crown, Calendar, Sparkles } from 'lucide-react';
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(11, 14, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient gold flare */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(11, 14, 20, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

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
              width: isMobile ? '52px' : '64px',
              height: isMobile ? '52px' : '64px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #1A1F2C 0%, #0B0E14 100%)',
              border: '2px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.25)',
              flexShrink: 0,
            }}
          >
            <Shield size={isMobile ? 28 : 34} color="#D4AF37" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: isMobile ? '1.35rem' : '1.75rem',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                {guild.name}
              </h1>
              <span
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                  color: '#0B0E14',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  letterSpacing: '0.05em',
                  fontFamily: 'monospace',
                }}
              >
                [{guild.tag}]
              </span>
            </div>

            {guild.description && (
              <p
                style={{
                  color: '#9CA3AF',
                  fontSize: '0.9rem',
                  marginTop: '6px',
                  marginBottom: '8px',
                  maxWidth: '650px',
                  lineHeight: '1.4',
                }}
              >
                {guild.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D1D5DB', fontSize: '0.85rem' }}>
                <Users size={15} color="#D4AF37" />
                <span className="font-mono tabular-nums" style={{ fontWeight: 700, color: '#ffffff' }}>
                  {guild.memberCount}
                </span>
                <span>Mitglieder</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '0.85rem' }}>
                <Calendar size={15} />
                <span>Gegründet {new Date(guild.createdAt).toLocaleDateString('de-DE')}</span>
              </div>

              {userRole && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background:
                      userRole === 'leader'
                        ? 'rgba(212, 175, 55, 0.15)'
                        : userRole === 'officer'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(156, 163, 175, 0.15)',
                    color:
                      userRole === 'leader'
                        ? '#D4AF37'
                        : userRole === 'officer'
                        ? '#60A5FA'
                        : '#9CA3AF',
                    border: `1px solid ${
                      userRole === 'leader'
                        ? 'rgba(212, 175, 55, 0.3)'
                        : userRole === 'officer'
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(156, 163, 175, 0.3)'
                    }`,
                  }}
                >
                  {userRole === 'leader' && <Crown size={12} />}
                  {userRole}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          {isOfficerOrLeader && onInviteClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onInviteClick}
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #B89628 100%)',
                color: '#0B0E14',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
                flex: isMobile ? 1 : undefined,
                justifyContent: 'center',
              }}
            >
              <Sparkles size={15} />
              Einladen
            </motion.button>
          )}

          {userRole && onLeaveClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onLeaveClick}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Verlassen
            </motion.button>
          )}

          {isLeader && onDisbandClick && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onDisbandClick}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Auflösen
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
