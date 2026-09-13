'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, Sparkles, ChevronLeft, ChevronRight, Dices, Flame, Trophy, Coins, Play } from 'lucide-react';
import Link from 'next/link';
import type { CategoryType, GameMeta } from '@/app/games/_components';

interface OriginalsCollectionSurferProps {
  categories: readonly CategoryType[];
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  games: readonly GameMeta[];
  isMobile: boolean;
  inline?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  ALL: Layers,
  ORIGINALS: Flame,
  TABLE: Trophy,
  SLOTS: Coins,
  ARCADE: Dices,
};

export function OriginalsCollectionSurfer({
  categories,
  selectedCategory,
  onSelectCategory,
  games,
  isMobile,
  inline = false,
}: OriginalsCollectionSurferProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (delta: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <div
      data-testid="originals-collection-surfer"
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: inline ? 0 : 16,
        padding: inline ? (isMobile ? '4px 0 0' : '6px 0 0') : isMobile ? '12px 14px' : '14px 20px',
        background: inline
          ? 'transparent'
          : 'linear-gradient(145deg, rgba(17, 22, 33, 0.75) 0%, rgba(10, 13, 20, 0.9) 100%)',
        border: inline ? 'none' : '1px solid rgba(212, 175, 55, 0.22)',
        borderTop: inline ? '1px solid rgba(212, 175, 55, 0.12)' : '1px solid rgba(212, 175, 55, 0.22)',
        boxShadow: inline
          ? 'none'
          : '0 8px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.15)',
        backdropFilter: inline ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: inline ? 'none' : 'blur(16px)',
        overflow: 'hidden',
      }}
    >
      {/* Top bar: Only shown when not inline */}
      {!inline && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.28)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles style={{ width: 13, height: 13, color: '#D4AF37' }} />
            <span
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#D4AF37',
                textTransform: 'uppercase',
              }}
            >
              COLLECTION SURFER
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>
            {games.length} Provably-Fair VIP Titel
          </span>
        </div>

        {/* Scroll Arrows for Desktop */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => handleScroll(-220)}
              aria-label="Nach links surfen"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft style={{ width: 15, height: 15 }} />
            </button>
            <button
              onClick={() => handleScroll(220)}
              aria-label="Nach rechts surfen"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        )}
      </div>
      )}

      {/* Edge Fading Mask */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          paddingBottom: 4,
        }}
      >
        {/* Category Pills with counts and icons */}
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          const IconComponent = CATEGORY_ICONS[cat] || Layers;
          const count =
            cat === 'ALL'
              ? games.length
              : games.filter((g) => g.tags.includes(cat as never)).length;

          return (
            <motion.button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: 11,
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 700,
                letterSpacing: '0.04em',
                border: isActive
                  ? '1px solid #D4AF37'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#D4AF37' : '#94A3B8',
                boxShadow: isActive ? '0 0 16px rgba(212, 175, 55, 0.2)' : 'none',
                transition: 'border 0.2s, background 0.2s, color 0.2s',
              }}
            >
              <IconComponent style={{ width: 13, height: 13, color: isActive ? '#D4AF37' : '#64748B' }} />
              <span>{cat}</span>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: isActive ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#FFFFFF' : '#64748B',
                }}
              >
                {count}
              </span>
            </motion.button>
          );
        })}

        {/* Vertical Divider */}
        <div
          style={{
            width: 1,
            height: 28,
            backgroundColor: 'rgba(212, 175, 55, 0.2)',
            flexShrink: 0,
            margin: '0 4px',
          }}
        />

        {/* Quick Originals Surfer Chips */}
        {games.map((g) => (
          <Link
            key={g.id}
            href={g.path}
            style={{
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 9,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 19,
                  height: 19,
                  borderRadius: 6,
                  background: 'rgba(212, 175, 55, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Play style={{ width: 9, height: 9, color: '#D4AF37' }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
                  {g.name}
                </div>
                <div style={{ fontSize: 8, fontFamily: 'monospace', color: '#10B981', lineHeight: 1 }}>
                  ★ {g.rating} · {g.reward}
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default OriginalsCollectionSurfer;
