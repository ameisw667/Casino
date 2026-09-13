'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { Trophy, ChevronUp, ChevronDown, Crown } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { bentoColors, bentoTypography } from '@/components/home/bento/bento-lobby-tokens';

export interface HallOfFameRecord {
  id: string;
  user: string;
  amount: number;
  game: string;
  mult: string;
  date: string;
  avatar: string;
  badge: string;
  badgeColor: string;
}

export const HALL_OF_FAME_RECORDS: HallOfFameRecord[] = [
  {
    id: 'hof-1',
    user: 'Alexander_V',
    amount: 148500.0,
    game: 'Crash Rocket',
    mult: '420.50x',
    date: 'Diese Woche',
    avatar: '/images/brand-ace-icon.png',
    badge: 'ALL-TIME RECORD',
    badgeColor: '#FFD700',
  },
  {
    id: 'hof-2',
    user: 'Victoria_Royale',
    amount: 94200.0,
    game: 'VIP Blackjack',
    mult: '50.00x',
    date: 'Vor 2 Tagen',
    avatar: '/images/trophy-tournament-gold.png',
    badge: 'HIGH ROLLER WIN',
    badgeColor: '#D4AF37',
  },
  {
    id: 'hof-3',
    user: 'CyberWhale_88',
    amount: 82150.0,
    game: 'Neon Slots',
    mult: '821.50x',
    date: 'Gestern',
    avatar: '/images/2026-09-06_icon-security-verified-quantum-gold_v001.png',
    badge: 'LEGENDARY MULTIPLIER',
    badgeColor: '#10B981',
  },
  {
    id: 'hof-4',
    user: 'Maximilian_VIP',
    amount: 67800.0,
    game: 'European Roulette',
    mult: '36.00x',
    date: 'Vor 3 Tagen',
    avatar: '/images/brand-ace-icon.png',
    badge: 'STRAIGHT UP HIT',
    badgeColor: '#00F0FF',
  },
  {
    id: 'hof-5',
    user: 'GoldFinger_99',
    amount: 54300.0,
    game: 'Quantum Dice',
    mult: '98.50x',
    date: 'Heute',
    avatar: '/images/trophy-tournament-gold.png',
    badge: 'MEGA PAYOUT',
    badgeColor: '#FFE600',
  },
];

interface Spiral3dSliderProps {
  isMobile: boolean;
}

export function Spiral3dSlider({ isMobile }: Spiral3dSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const records = HALL_OF_FAME_RECORDS;
  const total = records.length;

  const rawStep = useMotionValue(0);
  const smoothStep = useSpring(rawStep, {
    stiffness: 300,
    damping: 28,
    mass: 0.8,
  });

  const scrollToIndex = useCallback(
    (targetIndex: number) => {
      soundManager.playClick();
      animate(rawStep, targetIndex, {
        type: 'spring',
        stiffness: 280,
        damping: 26,
      });
      setActiveIndex(targetIndex);
    },
    [rawStep],
  );

  const prev = () => {
    const nextIdx = (activeIndex - 1 + total) % total;
    scrollToIndex(nextIdx);
  };

  const next = () => {
    const nextIdx = (activeIndex + 1) % total;
    scrollToIndex(nextIdx);
  };

  // Auto rotation every 4.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((curr) => {
        const nextIdx = (curr + 1) % total;
        animate(rawStep, nextIdx, {
          type: 'spring',
          stiffness: 250,
          damping: 26,
        });
        return nextIdx;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [rawStep, total]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isMobile ? '240px' : '280px',
        borderRadius: '16px',
        background: 'radial-gradient(ellipse at 50% 10%, rgba(212, 175, 55, 0.12) 0%, rgba(11, 14, 20, 0.88) 85%)',
        border: '1px solid rgba(212, 175, 55, 0.22)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.25)',
        padding: isMobile ? '12px 14px' : '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      aria-label="Hall of Fame Spiral 3D Slider"
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'rgba(212, 175, 55, 0.18)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
            }}
          >
            <Trophy size={13} color="#D4AF37" />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.58rem',
                fontWeight: 900,
                color: bentoColors.gold,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              HALL OF FAME
            </div>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 1000,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}
            >
              Spiral 3D Stage
            </div>
          </div>
        </div>

        {/* Up/Down buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={prev}
            aria-label="Vorheriger Gewinner"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Nächster Gewinner"
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              color: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* 3D Helix Track Stage */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {records.map((record, index) => {
          return (
            <SpiralCard
              key={record.id}
              record={record}
              index={index}
              total={total}
              smoothStep={smoothStep}
              isActive={index === activeIndex}
              onSelect={() => scrollToIndex(index)}
              isMobile={isMobile}
            />
          );
        })}
      </div>

      {/* Bottom ticker dot indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '6px',
          zIndex: 10,
        }}
      >
        {records.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => scrollToIndex(i)}
            aria-label={`Gewinner ${r.user}`}
            style={{
              width: i === activeIndex ? '18px' : '5px',
              height: '5px',
              borderRadius: '3px',
              background: i === activeIndex ? '#D4AF37' : 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SpiralCard({
  record,
  index,
  total,
  smoothStep,
  isActive,
  onSelect,
  isMobile: _isMobile,
}: {
  record: HallOfFameRecord;
  index: number;
  total: number;
  smoothStep: ReturnType<typeof useSpring>;
  isActive: boolean;
  onSelect: () => void;
  isMobile: boolean;
}) {
  // Spiral trigonometry: calculate Y-position, Z-depth, X-offset, and rotateX along the helix
  const transform = useTransform(smoothStep, (step) => {
    // Relative distance in units of card indices
    let dist = index - step;
    while (dist < -total / 2) dist += total;
    while (dist > total / 2) dist -= total;

    // Y position along vertical spiral: central card at 0, above/below scaled
    const y = dist * 55;
    // Z depth: active card is closest (0px), distant cards recede up to -280px
    const z = -Math.abs(dist) * 90;
    // X wobble for double-helix curve
    const x = Math.sin(dist * 0.9) * 28;
    // Tilt pitch
    const rotateX = -dist * 18;

    return `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg)`;
  });

  const opacity = useTransform(smoothStep, (step) => {
    let dist = index - step;
    while (dist < -total / 2) dist += total;
    while (dist > total / 2) dist -= total;
    const absDist = Math.abs(dist);
    if (absDist > 2.2) return 0;
    return Math.max(0, 1 - absDist * 0.42);
  });

  const scale = useTransform(smoothStep, (step) => {
    let dist = index - step;
    while (dist < -total / 2) dist += total;
    while (dist > total / 2) dist -= total;
    return Math.max(0.75, 1 - Math.abs(dist) * 0.14);
  });

  return (
    <motion.div
      onClick={onSelect}
      style={{
        position: 'absolute',
        width: '92%',
        maxWidth: '340px',
        transform,
        opacity,
        scale,
        borderRadius: '12px',
        background: isActive
          ? 'linear-gradient(135deg, rgba(32, 32, 44, 0.98) 0%, rgba(14, 16, 24, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(20, 22, 30, 0.85) 0%, rgba(11, 14, 20, 0.9) 100%)',
        border: isActive ? '1px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: isActive
          ? '0 10px 28px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.3)'
          : '0 4px 16px rgba(0, 0, 0, 0.4)',
        padding: '10px 14px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        transformStyle: 'preserve-3d',
        userSelect: 'none',
        zIndex: isActive ? 5 : 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(11, 14, 20, 0.9)',
              border: `1.5px solid ${record.badgeColor}`,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <Image
              src={record.avatar}
              alt={record.user}
              fill
              sizes="32px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: record.badgeColor,
                fontSize: '0.52rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Crown size={10} />
              {record.badge}
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 1000,
                color: '#FFFFFF',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {record.user}
            </div>
          </div>
        </div>

        {/* Big Payout Metric */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              ...bentoTypography.dynamicNumber,
              fontSize: '1.05rem',
              fontWeight: 1000,
              color: bentoColors.emerald,
              lineHeight: 1.1,
            }}
          >
            +${record.amount.toLocaleString('en-US')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
              marginTop: '2px',
            }}
          >
            <span
              style={{
                ...bentoTypography.dynamicNumber,
                padding: '1px 5px',
                borderRadius: '4px',
                background: 'rgba(212, 175, 55, 0.15)',
                color: bentoColors.gold,
                fontSize: '0.62rem',
                fontWeight: 900,
              }}
            >
              {record.mult}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              {record.game}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
