'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type MotionValue } from 'framer-motion';
import { Flame, Zap, Crown, Sparkles, Users, Play } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import { GAME_TABS, type GameTabConfig } from './config';

interface GameShowcaseCardProps {
  activeTab: GameTabConfig;
  onSelectTab: (tab: GameTabConfig) => void;
  crashMult: number;
  diceVal: number;
  slotsWon: boolean;
  rotateXCombined: MotionValue<number>;
  rotateYMouse: MotionValue<number>;
}

export function GameShowcaseCard({
  activeTab,
  onSelectTab,
  crashMult,
  diceVal,
  slotsWon,
  rotateXCombined,
  rotateYMouse,
}: GameShowcaseCardProps) {
  return (
    <motion.div
      style={{
        width: '400px',
        flexShrink: 0,
        rotateX: rotateXCombined,
        rotateY: rotateYMouse,
        transformStyle: 'preserve-3d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Main Active Holographic Showcase Card (Single Frameless Layer) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          background:
            'linear-gradient(145deg, rgba(16, 16, 24, 0.7) 0%, rgba(6, 6, 10, 0.85) 100%)',
          backdropFilter: 'blur(24px)',
          padding: '14px',
          boxShadow: `0 20px 60px rgba(0,0,0,0.85), 0 0 35px ${activeTab.accentColor}20`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          transform: 'translateZ(10px)',
        }}
      >
        {/* Top Minimalist Game Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.45)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflowX: 'auto',
            marginBottom: '10px',
          }}
        >
          {GAME_TABS.map((tab) => {
            const isActive = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectTab(tab);
                }}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '7px',
                  background: isActive ? tab.accentColor : 'transparent',
                  color: isActive ? '#000' : 'rgba(255, 255, 255, 0.65)',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.id.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Live Card Header Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${activeTab.accentColor}35`,
              color: activeTab.accentColor,
              fontSize: '0.68rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
            }}
          >
            {activeTab.badge}
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: '#00E701',
              fontSize: '0.72rem',
              fontWeight: 900,
              background: 'rgba(0, 231, 1, 0.08)',
              padding: '3px 8px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 231, 1, 0.15)',
            }}
          >
            <Users size={11} /> 1,420 ONLINE
          </div>
        </div>

        {/* Active Game Center Stage (Clickable 1-Click Launch) */}
        <Link
          href={activeTab.path}
          style={{ textDecoration: 'none', display: 'block', outline: 'none' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.25 }}
              style={{
                position: 'relative',
                width: '100%',
                height: '175px',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Image
                src={activeTab.image}
                alt={activeTab.name}
                fill
                sizes="400px"
                style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
              />

              {/* Live Simulation Overlay Badge */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '12px',
                }}
              >
                {activeTab.simType === 'crash' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Flame size={18} color="#FF4500" />
                    <div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 800,
                        }}
                      >
                        LIVE MULTIPLIKATOR
                      </div>
                      <div
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 1000,
                          color: '#FF4500',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        {crashMult.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                )}

                {activeTab.simType === 'dice' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={18} color="#00E701" />
                    <div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 800,
                        }}
                      >
                        TARGET &lt; 50.00
                      </div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 1000,
                          color: '#00E701',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        ROLL: {diceVal} (WIN)
                      </div>
                    </div>
                  </div>
                )}

                {activeTab.simType === 'blackjack' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Crown size={18} color="#D4AF37" />
                    <div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 800,
                        }}
                      >
                        DEALER 18 VS PLAYER 21
                      </div>
                      <div
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 1000,
                          color: '#D4AF37',
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        BLACKJACK WIN!
                      </div>
                    </div>
                  </div>
                )}

                {(activeTab.simType === 'slots' || activeTab.simType === 'roulette') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color={activeTab.accentColor} />
                    <div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: 'rgba(255,255,255,0.6)',
                          fontWeight: 800,
                        }}
                      >
                        LIVE STATUS
                      </div>
                      <div
                        style={{
                          fontSize: '1.15rem',
                          fontWeight: 1000,
                          color: activeTab.accentColor,
                          fontFamily: 'monospace',
                          lineHeight: 1,
                        }}
                      >
                        {slotsWon ? '7-7-7 WIN 100x!' : 'SPINNING...'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Meta & Play Launch Trigger */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              paddingTop: '4px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 1000,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}
              >
                {activeTab.name}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                }}
              >
                PROVABLY FAIR · Max {activeTab.maxPayout}
              </div>
            </div>

            <motion.div
              onMouseEnter={() => soundManager.playHover()}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              style={{
                height: '34px',
                padding: '0 14px',
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${activeTab.accentColor} 0%, #000 160%)`,
                color: activeTab.id === 'blackjack' ? '#000' : '#fff',
                fontWeight: 900,
                fontSize: '0.75rem',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: `0 6px 16px ${activeTab.accentColor}50`,
              }}
            >
              <Play size={12} fill="currentColor" color="currentColor" style={{ flexShrink: 0 }} />
              <span>PLAY</span>
            </motion.div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
