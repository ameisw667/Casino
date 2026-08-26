'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, User, MoreVertical, UserMinus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { GuildMemberRecord, GuildRole } from '@/lib/casino/guild-service';

interface GuildMemberListProps {
  members: GuildMemberRecord[];
  currentUserId?: string | null;
  currentUserRole?: GuildRole;
  onUpdateRole?: (targetUserId: string, newRole: GuildRole) => Promise<void>;
  onRemoveMember?: (targetUserId: string) => Promise<void>;
  isMobile?: boolean;
}

export function GuildMemberList({
  members,
  currentUserId,
  currentUserRole,
  onUpdateRole,
  onRemoveMember,
  isMobile = false,
}: GuildMemberListProps) {
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const isLeader = currentUserRole === 'leader';
  const isOfficer = currentUserRole === 'officer';

  const handleAction = async (action: () => Promise<void>, targetUserId: string) => {
    try {
      setBusyUserId(targetUserId);
      setActiveMenuUserId(null);
      await action();
    } finally {
      setBusyUserId(null);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={16} color="#D4AF37" />
          Mitgliederliste ({members.length})
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const targetIsOfficer = member.role === 'officer';
          const targetIsMember = member.role === 'member';

          const canManage =
            !isSelf &&
            ((isLeader) ||
             (isOfficer && targetIsMember));

          return (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: isSelf ? '#161616' : '#131313',
                border: isSelf ? '1px solid #2E2E2E' : '1px solid #202020',
                borderRadius: '8px',
                gap: '12px',
                position: 'relative',
              }}
            >
              {/* User Identity & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                  {member.role === 'leader' ? (
                    <Crown size={16} color="#D4AF37" />
                  ) : member.role === 'officer' ? (
                    <Shield size={16} color="#93C5FD" />
                  ) : (
                    <User size={16} color="#737373" />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {member.user?.username || member.userId.slice(0, 12)}
                    </span>
                    {isSelf && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: '#1A1A1A',
                          border: '1px solid #282828',
                          color: '#D4AF37',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        Du
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.75rem', color: '#737373' }}>
                    <span className="font-mono tabular-nums" style={{ color: '#D4AF37', fontWeight: 600 }}>
                      Lv. {member.user?.level ?? 1}
                    </span>
                    <span>•</span>
                    <span style={{ fontWeight: 600 }}>{member.user?.rank ?? 'BRONZE'}</span>
                    <span>•</span>
                    <span>Beitritt {new Date(member.joinedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </div>

              {/* Role badge & Management Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: '#1A1A1A',
                    border: '1px solid #282828',
                    color:
                      member.role === 'leader'
                        ? '#D4AF37'
                        : member.role === 'officer'
                        ? '#93C5FD'
                        : '#8A8A8A',
                  }}
                >
                  {member.role}
                </span>

                {canManage && (
                  <div style={{ position: 'relative' }}>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      disabled={busyUserId === member.userId}
                      onClick={() =>
                        setActiveMenuUserId(activeMenuUserId === member.userId ? null : member.userId)
                      }
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#D1D5DB',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MoreVertical size={16} />
                    </motion.button>

                    <AnimatePresence>
                      {activeMenuUserId === member.userId && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '6px',
                            background: '#0B0E14',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            borderRadius: '10px',
                            padding: '6px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                            zIndex: 50,
                            minWidth: '170px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          {/* Promote / Demote */}
                          {isLeader && targetIsMember && onUpdateRole && (
                            <button
                              onClick={() =>
                                handleAction(
                                  () => onUpdateRole(member.userId, 'officer'),
                                  member.userId,
                                )
                              }
                              style={menuButtonStyle}
                            >
                              <ArrowUpCircle size={15} color="#60A5FA" />
                              Zu Offizier befördern
                            </button>
                          )}

                          {isLeader && targetIsOfficer && onUpdateRole && (
                            <button
                              onClick={() =>
                                handleAction(
                                  () => onUpdateRole(member.userId, 'member'),
                                  member.userId,
                                )
                              }
                              style={menuButtonStyle}
                            >
                              <ArrowDownCircle size={15} color="#9CA3AF" />
                              Zu Mitglied degradieren
                            </button>
                          )}

                          {/* Leader transfer */}
                          {isLeader && onUpdateRole && (
                            <button
                              onClick={() =>
                                handleAction(
                                  () => onUpdateRole(member.userId, 'leader'),
                                  member.userId,
                                )
                              }
                              style={{ ...menuButtonStyle, color: '#D4AF37' }}
                            >
                              <Crown size={15} color="#D4AF37" />
                              Leitung übertragen
                            </button>
                          )}

                          {/* Kick */}
                          {onRemoveMember && (
                            <button
                              onClick={() =>
                                handleAction(
                                  () => onRemoveMember(member.userId),
                                  member.userId,
                                )
                              }
                              style={{ ...menuButtonStyle, color: '#EF4444' }}
                            >
                              <UserMinus size={15} color="#EF4444" />
                              Aus Gilde kicken
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const menuButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: '8px 10px',
  borderRadius: '6px',
  color: '#E5E7EB',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textAlign: 'left',
  width: '100%',
  transition: 'background 0.15s',
};
