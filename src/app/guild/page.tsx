'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';
import { GuildHeader } from '@/components/casino/guild/GuildHeader';
import { GuildMemberList } from '@/components/casino/guild/GuildMemberList';
import { GuildSearchDirectory } from '@/components/casino/guild/GuildSearchDirectory';
import { GuildInvitesInbox } from '@/components/casino/guild/GuildInvitesInbox';
import { GuildCreateModal } from '@/components/casino/guild/GuildCreateModal';
import { GuildInviteModal } from '@/components/casino/guild/GuildInviteModal';
import type { GuildRecord, GuildRole, GuildMemberRecord, GuildInviteRecord } from '@/lib/casino/guild-service';

export default function GuildPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const { user } = useSupabaseSession();

  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<{
    guild: GuildRecord;
    role: GuildRole;
    joinedAt: string;
    members: GuildMemberRecord[];
  } | null>(null);

  const [invites, setInvites] = useState<GuildInviteRecord[]>([]);
  const [directoryGuilds, setDirectoryGuilds] = useState<GuildRecord[]>([]);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const effectiveUserId = resolvedUserId || user?.id || null;

  // Modals & States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDisband, setConfirmDisband] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load user membership and public discovery data
  const loadData = useCallback(async () => {
    try {
      setActionError(null);

      // Check current user's guild
      const meRes = await fetch('/api/casino/guild/me', { cache: 'no-store' });
      if (meRes.ok) {
        const meJson = await meRes.json();
        setMembership(meJson.membership ?? null);
        if (meJson.currentUserId) {
          setResolvedUserId(meJson.currentUserId);
        }
      } else {
        setMembership(null);
      }

      // If not in a guild, load pending invites and guild directory
      const [invitesRes, searchRes] = await Promise.all([
        fetch('/api/casino/guild/invites', { cache: 'no-store' }),
        fetch('/api/casino/guild/search', { cache: 'no-store' }),
      ]);

      if (invitesRes.ok) {
        const invitesJson = await invitesRes.json();
        setInvites(invitesJson.invites ?? []);
      }

      if (searchRes.ok) {
        const searchJson = await searchRes.json();
        setDirectoryGuilds(searchJson.guilds ?? []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      try {
        const meRes = await fetch('/api/casino/guild/me', { cache: 'no-store' });
        if (meRes.ok) {
          const meJson = await meRes.json();
          if (!cancelled) setMembership(meJson.membership ?? null);
        } else {
          if (!cancelled) setMembership(null);
        }

        const [invitesRes, searchRes] = await Promise.all([
          fetch('/api/casino/guild/invites', { cache: 'no-store' }),
          fetch('/api/casino/guild/search', { cache: 'no-store' }),
        ]);

        if (invitesRes.ok) {
          const invitesJson = await invitesRes.json();
          if (!cancelled) setInvites(invitesJson.invites ?? []);
        }

        if (searchRes.ok) {
          const searchJson = await searchRes.json();
          if (!cancelled) setDirectoryGuilds(searchJson.guilds ?? []);
        }
      } catch {
        // Fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search directory callback
  const handleSearch = async (query: string) => {
    try {
      const res = await fetch(`/api/casino/guild/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        setDirectoryGuilds(json.guilds ?? []);
      }
    } catch {
      // ignore
    }
  };

  // Respond to invite (accept or decline)
  const handleRespondInvite = async (inviteId: string, action: 'accept' | 'decline') => {
    try {
      setActionError(null);
      const res = await fetch(`/api/casino/guild/invite/${inviteId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Aktion fehlgeschlagen');
      }

      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Aktion fehlgeschlagen';
      setActionError(msg);
    }
  };

  // Update member role
  const handleUpdateRole = async (targetUserId: string, newRole: GuildRole) => {
    try {
      setActionError(null);
      const res = await fetch(`/api/casino/guild/member/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Rollenänderung fehlgeschlagen');
      }

      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Aktion fehlgeschlagen';
      setActionError(msg);
    }
  };

  // Remove / Kick member
  const handleRemoveMember = async (targetUserId: string) => {
    try {
      setActionError(null);
      const res = await fetch(`/api/casino/guild/member/${targetUserId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Entfernen fehlgeschlagen');
      }

      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Entfernen fehlgeschlagen';
      setActionError(msg);
    }
  };

  // Leave guild (self)
  const handleLeaveGuild = async () => {
    if (!effectiveUserId) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/casino/guild/member/${effectiveUserId}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gilde konnte nicht verlassen werden');
      }

      setConfirmLeave(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gilde konnte nicht verlassen werden';
      setActionError(msg);
    }
  };

  // Disband guild (leader)
  const handleDisbandGuild = async () => {
    if (!membership) return;
    try {
      setActionError(null);
      const res = await fetch(`/api/casino/guild/${membership.guild.id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gilde konnte nicht aufgelöst werden');
      }

      setConfirmDisband(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gilde konnte nicht aufgelöst werden';
      setActionError(msg);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '16px' : '24px',
        padding: isMobile ? '0 16px 40px' : '0 24px 40px',
        minHeight: 'calc(100vh - 80px)',
        position: 'relative',
      }}
    >
      {/* Back to Leaderboard link */}
      <div>
        <Link
          href="/leaderboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#8A8A8A',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
            padding: '6px 14px',
            borderRadius: '8px',
            background: '#111111',
            border: '1px solid #222222',
            transition: 'color 0.15s ease',
          }}
        >
          <ArrowLeft size={14} />
          Zurück zum Leaderboard
        </Link>
      </div>

      {/* Error alert toast */}
      {actionError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#EF4444',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </motion.div>
      )}

      {loading ? (
        <div
          style={{
            padding: '60px 0',
            textAlign: 'center',
            color: '#D4AF37',
            fontSize: '1.1rem',
            fontWeight: 700,
          }}
        >
          Gildendaten werden geladen...
        </div>
      ) : membership ? (
        /* User is in a guild: Guild Dashboard View */
        <>
          <GuildHeader
            guild={membership.guild}
            userRole={membership.role}
            onInviteClick={() => setShowInviteModal(true)}
            onLeaveClick={() => setConfirmLeave(true)}
            onDisbandClick={() => setConfirmDisband(true)}
            isMobile={isMobile}
          />

          <GuildMemberList
            members={membership.members}
            currentUserId={effectiveUserId ?? undefined}
            currentUserRole={membership.role}
            onUpdateRole={handleUpdateRole}
            onRemoveMember={handleRemoveMember}
            isMobile={isMobile}
          />

          {/* Leave Confirmation Dialog */}
          {confirmLeave && (
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
                  maxWidth: '400px',
                  width: '100%',
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                  Gilde verlassen?
                </h3>
                <p style={{ color: '#737373', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
                  Möchtest du die Gilde <strong>{membership.guild.name}</strong> wirklich verlassen?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmLeave(false)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid #282828',
                      color: '#8A8A8A',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveGuild}
                    style={{
                      flex: 1,
                      background: '#1A1A1A',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#EF4444',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    Verlassen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disband Confirmation Dialog */}
          {confirmDisband && (
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
                  maxWidth: '420px',
                  width: '100%',
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0' }}>
                  Gilde auflösen?
                </h3>
                <p style={{ color: '#737373', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
                  Alle Mitglieder werden entfernt und offene Einladungen gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setConfirmDisband(false)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid #282828',
                      color: '#8A8A8A',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleDisbandGuild}
                    style={{
                      flex: 1,
                      background: '#1A1A1A',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#EF4444',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Auflösen
                  </button>
                </div>
              </div>
            </div>
          )}

          <GuildInviteModal
            isOpen={showInviteModal}
            guildId={membership.guild.id}
            onClose={() => setShowInviteModal(false)}
            onSuccess={loadData}
          />
        </>
      ) : (
        /* User is not in a guild: Invites Inbox & Directory Hub */
        <>
          <GuildInvitesInbox
            invites={invites}
            onRespond={handleRespondInvite}
            isMobile={isMobile}
          />

          <GuildSearchDirectory
            guilds={directoryGuilds}
            onSearch={handleSearch}
            onCreateClick={() => setShowCreateModal(true)}
            isMobile={isMobile}
          />

          <GuildCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={loadData}
          />
        </>
      )}
    </div>
  );
}
