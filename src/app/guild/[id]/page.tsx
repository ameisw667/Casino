'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GuildHeader } from '@/components/casino/guild/GuildHeader';
import { GuildMemberList } from '@/components/casino/guild/GuildMemberList';
import type { GuildRecord, GuildMemberRecord } from '@/lib/casino/guild-service';

export default function GuildDetailsPage() {
  const isMobile = useCasinoStore((s) => s.isMobile);
  const params = useParams();
  const guildId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [guild, setGuild] = useState<GuildRecord | null>(null);
  const [members, setMembers] = useState<GuildMemberRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guildId) return;

    let cancelled = false;
    async function loadGuild() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/casino/guild/${guildId}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Gilde konnte nicht geladen werden');
        }
        const data = await res.json();
        if (!cancelled) {
          setGuild(data.guild);
          setMembers(data.members ?? []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Gilde konnte nicht geladen werden';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGuild();
    return () => {
      cancelled = true;
    };
  }, [guildId]);

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
      {/* Back button */}
      <div>
        <Link
          href="/guild"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#9CA3AF',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <ArrowLeft size={16} />
          Zurück zu Gilden
        </Link>
      </div>

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
          Gilde wird geladen...
        </div>
      ) : error || !guild ? (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: '#EF4444',
          }}
        >
          <Shield size={32} style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>
            {error || 'Gilde nicht gefunden'}
          </h2>
          <Link
            href="/guild"
            style={{
              color: '#D4AF37',
              textDecoration: 'underline',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Zurück zur Gildenübersicht
          </Link>
        </div>
      ) : (
        <>
          <GuildHeader guild={guild} isMobile={isMobile} />
          <GuildMemberList members={members} isMobile={isMobile} />
        </>
      )}
    </div>
  );
}
