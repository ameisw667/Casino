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
            gap: '10px',
            padding: '14px',
            borderRadius: '20px',
            background:
              'linear-gradient(145deg, rgba(24, 24, 32, 0.8) 0%, rgba(12, 12, 18, 0.9) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${isHovered ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.12)'}`,
            boxShadow: isHovered
              ? 'inset 0 1px 1px rgba(255, 255, 255, 0.2), 0 12px 28px rgba(0, 0, 0, 0.55), 0 0 12px rgba(212, 175, 55, 0.2)'
              : 'inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 12px 28px rgba(0, 0, 0, 0.55)',
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

          {/* Preview image & Option-1 Transluzente Glas-Pille */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: '14px',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#09090b',
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
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 45%)',
                zIndex: 2,
              }}
            />

            {/* Floating Top-Left Icon Badge */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: game.accentColor,
                border: `1px solid ${game.accentColor}60`,
                boxShadow: `0 0 12px ${game.accentColor}35`,
                zIndex: 3,
              }}
            >
              <Icon size={16} color={game.accentColor} />
            </div>
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
                fontSize: '0.58rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: 'hsl(var(--text-dim))',
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
              gap: '6px',
            }}
          >
            <h3
              style={{
                fontSize: '1.15rem',
                fontWeight: 950,
                margin: 0,
                fontFamily: 'var(--font-inter), sans-serif',
                lineHeight: 1,
                color: isHovered ? game.accentColor : '#ffffff',
                transition: 'color 0.2s ease',
              }}
            >
              {game.name}
            </h3>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              <Star size={12} fill="#D4AF37" color="#D4AF37" />
              {game.rating}
            </span>
          </div>

          <p
            style={{
              fontSize: '0.74rem',
              lineHeight: 1.4,
              color: 'hsl(var(--text-muted))',
              margin: 0,
              minHeight: '2em',
            }}
          >
            {game.desc}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 10px',
              borderRadius: '12px',
              background: 'hsla(0,0%,100%,0.02)',
              border: '1px solid hsla(0,0%,100%,0.05)',
            }}
          >
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>
              TOP PAYOUT
            </span>
            <span
              style={{
                fontSize: '0.85rem',
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
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '12px',
              fontWeight: 950,
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: `0 8px 20px ${game.accentColor}33`,
              border: 'none',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            <Play size={14} fill="currentColor" />
            PLAY {game.name.toUpperCase()}
          </motion.button>

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
        </motion.article>
      </Link>
    </motion.div>
  );
}
