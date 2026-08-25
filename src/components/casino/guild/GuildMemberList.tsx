'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, User, MoreVertical, UserMinus, ArrowUpCircle, ArrowDownCircle, Award } from 'lucide-react';
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
        background: 'rgba(11, 14, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '20px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={18} color="#D4AF37" />
          Mitgliederliste ({members.length})
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {members.map((member) => {
          const isSelf = member.userId === currentUserId;
          const targetIsLeader = member.role === 'leader';
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
                background: isSelf ? 'rgba(212, 175, 55, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                border: isSelf ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '10px',
                gap: '12px',
                position: 'relative',
              }}
            >
              {/* User Identity & Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: member.role === 'leader' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: member.role === 'leader' ? '1px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {member.role === 'leader' ? (
                    <Crown size={18} color="#D4AF37" />
                  ) : member.role === 'officer' ? (
                    <Shield size={18} color="#60A5FA" />
                  ) : (
                    <User size={18} color="#9CA3AF" />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#ffffff',
                        fontSize: '0.95rem',
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
                          fontSize: '0.7rem',
                          background: 'rgba(212, 175, 55, 0.2)',
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.78rem', color: '#9CA3AF' }}>
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
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background:
                      member.role === 'leader'
                        ? 'rgba(212, 175, 55, 0.15)'
                        : member.role === 'officer'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(156, 163, 175, 0.1)',
                    color:
                      member.role === 'leader'
                        ? '#D4AF37'
                        : member.role === 'officer'
                        ? '#60A5FA'
                        : '#9CA3AF',
                    border: `1px solid ${
                      member.role === 'leader'
                        ? 'rgba(212, 175, 55, 0.3)'
                        : member.role === 'officer'
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'rgba(156, 163, 175, 0.2)'
                    }`,
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
