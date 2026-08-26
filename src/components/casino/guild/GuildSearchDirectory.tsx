'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Shield, Users, ArrowRight } from 'lucide-react';
import type { GuildRecord } from '@/lib/casino/guild-service';

interface GuildSearchDirectoryProps {
  guilds: GuildRecord[];
  onSearch: (query: string) => void;
  onCreateClick?: () => void;
  isMobile?: boolean;
}

export function GuildSearchDirectory({
  guilds,
  onSearch,
  onCreateClick,
  isMobile = false,
}: GuildSearchDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Gilden-Verzeichnis
          </h2>
          <p style={{ color: '#737373', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
            Finde bestehende Spielgemeinschaften oder gründe deine eigene Gilde.
          </p>
        </div>

        {onCreateClick && (
          <button
            type="button"
            onClick={onCreateClick}
            style={{
              background: '#1A1A1A',
              border: '1px solid #282828',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#D4AF37',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
            }}
          >
            <Shield size={15} />
            Gilde gründen
          </button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search
          size={16}
          color="#737373"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Nach Gildenname oder Kürzel suchen..."
          style={{
            width: '100%',
            background: '#161616',
            border: '1px solid #282828',
            borderRadius: '8px',
            padding: '10px 14px 10px 38px',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Guild Grid / List */}
      {guilds.length === 0 ? (
        <div
          style={{
            padding: '36px 16px',
            textAlign: 'center',
            color: '#9CA3AF',
            fontSize: '0.9rem',
          }}
        >
          Keine Gilden gefunden.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '14px',
          }}
        >
          {guilds.map((guild) => (
            <Link
              key={guild.id}
              href={`/guild/${guild.id}`}
              style={{ textDecoration: 'none' }}
            >
              <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgba(212, 175, 55, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  height: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Shield size={20} color="#D4AF37" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                          {guild.name}
                        </span>
                        <span
                          style={{
                            background: 'rgba(212, 175, 55, 0.2)',
                            color: '#D4AF37',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                          }}
                        >
                          [{guild.tag}]
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={16} color="#9CA3AF" />
                </div>

                {guild.description && (
                  <p
                    style={{
                      color: '#9CA3AF',
                      fontSize: '0.82rem',
                      margin: 0,
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {guild.description}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.78rem',
                    color: '#9CA3AF',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={14} color="#D4AF37" />
                    <span className="font-mono tabular-nums" style={{ color: '#ffffff', fontWeight: 700 }}>
                      {guild.memberCount}
                    </span>
                    <span>Mitglieder</span>
                  </div>

                  <span>{new Date(guild.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
