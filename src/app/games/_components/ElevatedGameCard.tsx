'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Star, Play } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import type { GameMeta } from './config';

// ──── Interactive 3D-Tilt Card with Option-2 Motion Shader Preview ────
export function ElevatedGameCard({
  game,
  index,
  isMobile,
}: {
  game: GameMeta;
  index: number;
  isMobile: boolean;
}) {
  const Icon = game.icon;
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -3.5;
    const rY = ((x - centerX) / centerX) * 3.5;

    setRotateX(rX);
    setRotateY(rY);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.2,
    });
  };

  const handleMouseEnter = () => {
    soundManager.playHover();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        perspective: 1000,
        height: '100%',
      }}
    >
      <Link
        href={game.path}
        aria-label={`Play ${game.name}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block',
          height: '100%',
          outline: 'none',
        }}
      >
        <motion.article
          whileTap={{ scale: 0.96 }}
          animate={{
            rotateX: isHovered && !isMobile ? rotateX : 0,
            rotateY: isHovered && !isMobile ? rotateY : 0,
            scale: isHovered && !isMobile ? 1.02 : 1,
            y: isHovered && !isMobile ? -4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '6px' : '10px',
            padding: isMobile ? '10px' : '14px',
            borderRadius: '16px',
            background:
              'linear-gradient(145deg, rgba(20, 22, 28, 0.88) 0%, rgba(10, 12, 16, 0.96) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.55)' : 'rgba(212, 175, 55, 0.22)'}`,
            boxShadow: isHovered
              ? 'inset 0 1px 2px rgba(255, 255, 255, 0.22), 0 18px 42px rgba(0, 0, 0, 0.75), 0 0 20px rgba(212, 175, 55, 0.25)'
              : 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 14px 34px rgba(0, 0, 0, 0.65)',
            height: '100%',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Dynamic Specular Sheen Glare */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 60%)`,
              transition: 'opacity 0.2s ease',
              borderRadius: '20px',
              zIndex: 5,
            }}
          />

          {/* Preview image & Passepartout-Rahmen */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: '14px',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#09090b',
              border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.38)' : 'rgba(212, 175, 55, 0.20)'}`,
              boxShadow:
                'inset 0 1px 2px rgba(255, 255, 255, 0.12), inset 0 -1px 2px rgba(0, 0, 0, 0.7), 0 6px 20px rgba(0, 0, 0, 0.6)',
              transition: 'border-color 0.3s ease',
            }}
          >
            {imgError ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${game.color}33, #000)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ opacity: 0.5, color: game.color }}>
                  <Icon size={32} />
                </div>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    color: 'hsla(0,0%,100%,0.3)',
                    letterSpacing: '0.1em',
                  }}
                >
                  PREVIEW
                </span>
              </div>
            ) : (
              <Image
                src={game.preview}
                alt={`${game.name} preview`}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                loading={index <= 2 ? 'eager' : 'lazy'}
                onError={() => setImgError(true)}
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            )}

            {/* VIP Hover-Overlay mit Live-Auszahlungsquote & Schnellstart */}
            <AnimatePresence>
              {isHovered && !isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(12, 14, 20, 0.45) 0%, rgba(8, 10, 14, 0.95) 100%)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    gap: '10px',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        letterSpacing: '0.04em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ShieldCheck size={11} color="#10b981" />
                      99.0% RTP • FAIR
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 950,
                        color: '#D4AF37',
                        fontFamily: 'var(--font-mono, monospace)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      MAX. $10,000 PAYOUT
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                      color: '#000',
                      fontWeight: 950,
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                    }}
                  >
                    <Play size={12} fill="#000" />
                    <span>JETZT SPIELEN</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 28%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Badges */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '20px',
            }}
          >
            <span
              style={{
                fontSize: '0.60rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                color: 'rgba(212, 175, 55, 0.78)',
                textTransform: 'uppercase',
              }}
            >
              {game.studio}
            </span>
            {game.category === 'HOT' ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.58rem',
                  fontWeight: 950,
                  color: '#ff5a5a',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '999px',
                    background: '#ff5a5a',
                  }}
                  className="animate-ping"
                />
                HOT
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 950,
                  color: 'hsl(var(--primary))',
                }}
              >
                {game.category}
              </span>
            )}
          </div>

          {/* Title + rating */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '4px',
              minWidth: 0,
            }}
          >
            <h3
              style={{
                fontSize: isMobile ? '0.88rem' : '1.15rem',
                fontWeight: 950,
                margin: 0,
                fontFamily: 'var(--font-inter), sans-serif',
                lineHeight: 1.1,
                color: isHovered ? game.accentColor : '#ffffff',
                transition: 'color 0.2s ease',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {game.name}
            </h3>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: isMobile ? '0.62rem' : '0.7rem',
                fontWeight: 800,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
                flexShrink: 0,
              }}
            >
              <Star size={isMobile ? 10 : 12} fill="#D4AF37" color="#D4AF37" />
              {game.rating}
            </span>
          </div>

          <p
            style={{
              fontSize: '0.74rem',
              lineHeight: 1.45,
              color: 'rgba(255, 255, 255, 0.72)',
              margin: 0,
              minHeight: isMobile ? '0' : '2em',
              display: isMobile ? 'none' : 'block',
            }}
          >
            {game.desc}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: isMobile ? '3px 6px' : '8px 10px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.04)',
              border: '1px solid rgba(212, 175, 55, 0.15)',
            }}
          >
            <span
              style={{
                fontSize: isMobile ? '0.48rem' : '0.55rem',
                fontWeight: 800,
                color: 'rgba(255, 255, 255, 0.65)',
                letterSpacing: '0.06em',
              }}
            >
              TOP PAYOUT
            </span>
            <span
              style={{
                fontSize: isMobile ? '0.70rem' : '0.85rem',
                fontWeight: 950,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              {game.reward}
            </span>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            style={{
              width: '100%',
              height: isMobile ? '30px' : '40px',
              borderRadius: '8px',
              fontWeight: 950,
              fontSize: isMobile ? '0.68rem' : '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: isHovered
                ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                : 'linear-gradient(180deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.06) 100%)',
              color: isHovered ? '#0B0E14' : '#F5E6A3',
              border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.85)' : 'rgba(212, 175, 55, 0.35)'}`,
              boxShadow: isHovered
                ? '0 6px 20px rgba(212, 175, 55, 0.45)'
                : 'inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
              marginTop: 'auto',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
              transition:
                'background 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            <Play size={isMobile ? 10 : 13} fill="currentColor" />
            <span>{isMobile ? 'SPIELEN' : `PLAY ${game.name.toUpperCase()}`}</span>
          </motion.button>

          {!isMobile && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                color: 'hsl(var(--text-dim))',
                fontSize: '0.6rem',
                fontWeight: 800,
              }}
            >
              <kbd
                style={{
                  padding: '1px 6px',
                  borderRadius: '5px',
                  border: '1px solid hsla(0,0%,100%,0.12)',
                  background: 'hsla(0,0%,100%,0.03)',
                  fontFamily: 'var(--font-mono), monospace',
                }}
              >
                {index + 1}
              </kbd>
              to launch
            </div>
          )}
        </motion.article>
      </Link>
    </motion.div>
  );
}
