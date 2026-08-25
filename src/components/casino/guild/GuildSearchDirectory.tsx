'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Shield, Users, ArrowRight, Sparkles } from 'lucide-react';
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
        background: 'rgba(11, 14, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: isMobile ? '16px' : '24px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Gilden-Verzeichnis
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Finde bestehende Spielgemeinschaften oder gründe deine eigene Gilde.
          </p>
        </div>

        {onCreateClick && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onCreateClick}
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #B89628 100%)',
              color: '#0B0E14',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 10px rgba(212, 175, 55, 0.3)',
              width: isMobile ? '100%' : 'auto',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
            Gilde gründen
          </motion.button>
        )}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search
          size={18}
          color="#9CA3AF"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Nach Gildenname oder Kürzel suchen..."
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '12px 16px 12px 42px',
            color: '#ffffff',
            fontSize: '0.95rem',
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
